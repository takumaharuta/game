<?php

namespace App\Http\Controllers;

use App\Models\Content;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;

class ContentController extends Controller
{
    public function store(Request $request)
    {
        $this->authorize('create', Content::class);

        $validatedData = $request->validate([
            'nodes' => 'required|json',
            'edges' => 'required|json',
        ]);

        $content = Content::create([
            'creator_id' => Auth::id(),
            'nodes' => $validatedData['nodes'],
            'edges' => $validatedData['edges'],
        ]);

        return redirect()->route('content.preview', $content->id);
    }

    public function update(Request $request, $id)
    {
        $content = Content::findOrFail($id);
        $this->authorize('update', $content);

        $validatedData = $request->validate([
            'nodes' => 'required|json',
            'edges' => 'required|json',
        ]);

        $content->update($validatedData);

        return redirect()->route('content.preview', $content->id);
    }

    public function edit($id = null)
    {
        if ($id) {
            $content = Content::findOrFail($id);
            $this->authorize('update', $content);
        } else {
            $content = new Content();
            $this->authorize('create', Content::class);
        }

        return Inertia::render('ContentEdit', [
            'content' => [
                'id' => $content->id,
                'nodes' => json_decode($content->nodes),
                'edges' => json_decode($content->edges),
            ]
        ]);
    }

    public function preview($id)
    {
        $content = Content::findOrFail($id);
    
        $nodes = json_decode($content->nodes, true);
        $edges = json_decode($content->edges, true);
    
        // nodes と edges から pages 構造を構築
        $pages = $this->constructPagesFromNodesAndEdges($nodes, $edges);
    
        return Inertia::render('ContentPreview', [
            'content' => [
                'id' => $content->id,
                'pages' => $pages,
            ]
        ]);
    }
    
    private function constructPagesFromNodesAndEdges($nodes, $edges)
    {
        $pages = [];
        foreach ($nodes as $node) {
            if ($node['type'] === 'pageNode') {
                $page = [
                    'id' => $node['id'],
                    'content' => $node['data']['label'] ?? '',
                    'image' => $node['data']['image'] ?? null,
                    'choices' => []
                ];
                $pages[] = $page;
            }
        }
    
        foreach ($edges as $edge) {
            $sourceIndex = $this->findPageIndex($pages, $edge['source']);
            if ($sourceIndex !== false) {
                $pages[$sourceIndex]['choices'][] = [
                    'text' => $edge['data']['label'] ?? '次へ',
                    'next_page' => $this->findPageIndex($pages, $edge['target'])
                ];
            }
        }
    
        return $pages;
    }
    
    private function findPageIndex($pages, $id)
    {
        foreach ($pages as $index => $page) {
            if ($page['id'] === $id) {
                return $index;
            }
        }
        return false;
    }
}