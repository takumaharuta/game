<?php

namespace App\Http\Controllers;

use App\Models\Content;
use App\Models\ContentPage;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;


class ContentController extends Controller
{
    public function store(Request $request)
    {
        $this->authorize('create', Content::class);

        $validatedData = $request->validate([
            'title' => 'required|string|max:255',
            'nodes' => 'required|array',
            'edges' => 'required|array',
        ]);

        $content = Content::create([
            'title' => $validatedData['title'],
            'creator_id' => Auth::id(),
        ]);

        foreach ($validatedData['nodes'] as $node) {
            $page = $content->pages()->create([
                'title' => $node['data']['label'],
                'content' => $node['data']['content'],
                'position_x' => $node['position']['x'],
                'position_y' => $node['position']['y'],
                'image_path' => $node['data']['image'] ?? null,
            ]);
        }

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
            $page = $content->pages()->create([
                'title' => $node['data']['label'],
                'content' => $node['data']['content'],
                'position_x' => $node['position']['x'],
                'position_y' => $node['position']['y'],
                'image_path' => $node['data']['image'] ?? null,
            ]);
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

    // public function edit($id = null)
    // {
    //     if ($id) {
    //         $content = Content::findOrFail($id);
    //         $this->authorize('update', $content);
    //     } else {
    //         $content = new Content();
    //         $this->authorize('create', Content::class);
    //     }
    //     return Inertia::render('ContentEdit', ['content' => $content]);
    // }
    
    public function edit($id = null)
    {
        if ($id) {
            $content = Content::findOrFail($id);
            $this->authorize('update', $content);
        } else {
            $content = new Content();
            $this->authorize('create', Content::class);
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
                    'image' => $page->image_path,
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

        return Inertia::render('ContentEdit', [
            'content' => [
                'id' => $content->id,
                'title' => $content->title,
                'nodes' => $nodes,
                'edges' => $edges,
            ]
        ]);
    }
    
    public function editContentPage($id = null)
    {
        if ($id) {
            $contentPage = ContentPage::with('content')->findOrFail($id);
            $this->authorize('update', $contentPage);
        } else {
            $contentPage = new ContentPage();
            $this->authorize('create', ContentPage::class);
        }
        return Inertia::render('ContentPageEdit', ['contentPage' => $contentPage]);
    }

    public function preview($id)
    {
        $content = Content::with('pages.choices')->findOrFail($id);
        
        $pages = $content->pages->map(function ($page) {
            return [
                'id' => $page->id,
                'title' => $page->title,
                'content' => $page->content,
                'image' => $page->image_path,
                'choices' => $page->choices->map(function ($choice) {
                    return [
                        'text' => $choice->text,
                        'next_page' => $choice->next_page_id,
                    ];
                }),
            ];
        });

        return Inertia::render('Preview', [
            'content' => [
                'id' => $content->id,
                'title' => $content->title,
                'pages' => $pages,
            ]
        ]);
    }

    public function showContentPage($id)
    {
        $content = Content::with('pages.choices')->findOrFail($id);
        return Inertia::render('ContentPage', ['content' => $content]);
    }
    
    // ContentPage 関連の新しいメソッド
    public function storeContentPage(Request $request)
    {
        $this->authorize('create', ContentPage::class);

        $validatedData = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'discount' => 'nullable|numeric|min:0|max:100',
            'tags' => 'nullable|json',
            'is_published' => 'boolean',
            'cover_image' => 'nullable|image|max:2048',
        ]);

        $contentPage = new ContentPage($validatedData);
        $contentPage->user_id = Auth::id();

        if ($request->hasFile('cover_image')) {
            $path = $request->file('cover_image')->store('cover_images', 'public');
            $contentPage->cover_image = $path;
        }

        $contentPage->save();

        return response()->json($contentPage, 201);
    }

    public function updateContentPage(Request $request, $id)
    {
        $contentPage = ContentPage::findOrFail($id);
        $this->authorize('update', $contentPage);

        $validatedData = $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'price' => 'sometimes|required|numeric|min:0',
            'discount' => 'nullable|numeric|min:0|max:100',
            'tags' => 'nullable|json',
            'is_published' => 'boolean',
            'cover_image' => 'nullable|image|max:2048',
        ]);

        if ($request->hasFile('cover_image')) {
            $path = $request->file('cover_image')->store('cover_images', 'public');
            $validatedData['cover_image'] = $path;
        }

        $contentPage->update($validatedData);

        return response()->json($contentPage);
    }

    public function togglePublishContentPage($id)
    {
        $contentPage = ContentPage::findOrFail($id);
        $this->authorize('update', $contentPage);

        $contentPage->is_published = !$contentPage->is_published;
        $contentPage->save();

        return response()->json(['is_published' => $contentPage->is_published]);
    }
    
    public function getPrice($id)
    {
        try {
            $content = Content::findOrFail($id);
            dd($content);
            return response()->json(['price' => $content->display_price]);
        } catch (\Exception $e) {
            dd($content);
            Log::error('価格取得エラー: ' . $e->getMessage());
            return response()->json(['error' => '価格の取得に失敗しました'], 500);
        }
    }

}