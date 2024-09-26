<?php

namespace App\Http\Controllers;

use App\Models\Content;
use App\Models\Page;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use CloudinaryLabs\CloudinaryLaravel\Facades\Cloudinary;
use Illuminate\Support\Str;

class ContentController extends Controller
{
    public function store(Request $request)
    {
        \Log::info('Store method called');
        \Log::info('Request data:', $request->all());
    
        try {
            $this->authorize('create', Content::class);
    
            $validatedData = $request->validate([
                'title' => 'required|string|max:255',
                'description' => 'nullable|string',
                'nodes' => 'required|array',
                'edges' => 'required|array',
            ]);
    
            \Log::info('Validation passed');
    
            DB::beginTransaction();
    
            $content = Content::create([
                'title' => $validatedData['title'],
                'description' => $validatedData['description'] ?? null,
                'creator_id' => Auth::id(),
                'is_published' => false,
            ]);
    
            \Log::info('Content created', ['content_id' => $content->id]);
    
            foreach ($validatedData['nodes'] as $nodeData) {
            $pageData = [
                'content_id' => $content->id,
                'title' => $nodeData['data']['label'],
                'content' => $nodeData['data']['content'] ?? '',
                'position_x' => $nodeData['position']['x'],
                'position_y' => $nodeData['position']['y'],
                'page_number' => $nodeData['data']['page_number'] ?? 0,
                'has_choices' => false,
            ];
    
            if (isset($nodeData['data']['cover_image']) && Str::startsWith($nodeData['data']['cover_image'], 'data:image')) {
                $uploadedImage = Cloudinary::upload($nodeData['data']['cover_image']);
                $pageData['cover_image'] = $uploadedImage->getSecurePath();
                \Log::info('Image uploaded', ['image_url' => $pageData['cover_image']]);
            }
    
            $page = Page::create($pageData);
            \Log::info('Page created', ['page_id' => $page->id, 'cover_image' => $page->cover_image]);
        }

            foreach ($validatedData['edges'] as $edge) {
                $sourcePage = $content->pages()->where('title', $edge['source'])->first();
                $targetPage = $content->pages()->where('title', $edge['target'])->first();

                if ($sourcePage && $targetPage) {
                    $choice = $sourcePage->choices()->create([
                        'text' => $edge['data']['label'],
                        'next_page_id' => $targetPage->id,
                    ]);
                    \Log::info('Choice created', ['choice_id' => $choice->id]);
                } else {
                    \Log::warning('Failed to create choice', ['edge' => $edge]);
                }
            }

            DB::commit();

            \Log::info('Store method completed successfully');
    
            return redirect()->route('content.preview', ['id' => $content->id]);
    
        } catch (\Exception $e) {
            DB::rollBack();
            \Log::error('Content store error', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return Inertia::render('Error', [
                'message' => 'Failed to save content: ' . $e->getMessage()
            ]);
        }
    }

    public function update(Request $request, $id)
    {
        $content = Content::findOrFail($id);
        $this->authorize('update', $content);

        $validatedData = $request->validate([
            'title' => 'required|string|max:255',
            'nodes' => 'required|array',
            'edges' => 'required|array',
        ]);

        $content->update([
            'title' => $validatedData['title'],
        ]);

        // 既存のページとチョイスを削除
        $content->pages()->delete();

        // 新しいページを作成
        foreach ($validatedData['nodes'] as $node) {
            $pageData = [
                'title' => $node['data']['label'],
                'content' => $node['data']['content'],
                'position_x' => $node['position']['x'],
                'position_y' => $node['position']['y'],
            ];

            if (isset($node['data']['image']) && $node['data']['image']) {
                $result = Cloudinary::upload($node['data']['image']);
                $pageData['cover_image'] = $result->getSecurePath();
            }

            $page = $content->pages()->create($pageData);
        }

        // 新しいチョイスを作成
        foreach ($validatedData['edges'] as $edge) {
            $sourcePage = $content->pages()->where('id', substr($edge['source'], 5))->first();
            $targetPage = $content->pages()->where('id', substr($edge['target'], 5))->first();

            $sourcePage->choices()->create([
                'text' => $edge['data']['label'],
                'next_page_id' => $targetPage->id,
            ]);
        }

        return redirect()->route('content.preview', $content->id);
    }

    public function show(Content $content)
    {
        return response()->json($content->load('pages.choices'));
    }

    public function edit($id = null)
    {
        \Log::info('Edit method called', ['id' => $id]);
    
        try {
            if ($id) {
                $content = Content::findOrFail($id);
                $this->authorize('update', $content);
                \Log::info('Editing existing content', ['content_id' => $content->id]);
            } else {
                $content = new Content();
                $this->authorize('create', Content::class);
                \Log::info('Creating new content');
            }
    
            // ReactFlowで使用するためのノードとエッジのデータを準備
            $nodes = $content->pages->map(function ($page) {
                return [
                    'id' => 'page-' . $page->id,
                    'type' => 'pageNode',
                    'position' => ['x' => $page->position_x, 'y' => $page->position_y],
                    'data' => [
                        'label' => $page->title,
                        'content' => $page->content,
                        'image' => $page->cover_image,
                    ]
                ];
            })->toArray();
    
            $edges = $content->pages->flatMap(function ($page) {
                return $page->choices->map(function ($choice) use ($page) {
                    return [
                        'id' => 'edge-' . $page->id . '-' . $choice->next_page_id,
                        'source' => 'page-' . $page->id,
                        'target' => 'page-' . $choice->next_page_id,
                        'data' => [
                            'label' => $choice->text,
                        ]
                    ];
                });
            })->toArray();
    
            \Log::info('Edit data prepared', ['nodes_count' => count($nodes), 'edges_count' => count($edges)]);
    
            return Inertia::render('ContentEdit', [
                'content' => [
                    'id' => $content->id,
                    'title' => $content->title,
                    'nodes' => $nodes,
                    'edges' => $edges,
                ]
            ]);
    
        } catch (\Illuminate\Auth\Access\AuthorizationException $e) {
            \Log::error('Authorization failed in edit method', ['error' => $e->getMessage()]);
            return Inertia::render('Error', ['message' => 'Unauthorized: ' . $e->getMessage()])->toResponse(request())->setStatusCode(403);
        } catch (\Exception $e) {
            \Log::error('Error in edit method', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return Inertia::render('Error', ['message' => 'Failed to load content for editing: ' . $e->getMessage()]);
        }
    }

    public function preview($id)
    {
        $content = Content::with('pages.choices')->findOrFail($id);
        return Inertia::render('ContentPreview', ['content' => $content]);
    }
}