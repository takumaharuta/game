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
        $validatedData = $request->validate([
            // バリデーションルールを追加
        ]);

        $content = Content::create($validatedData);
        return response()->json($content, 201);
    }

    public function update(Request $request, Content $content)
    {
        $this->authorize('update', $content);

        $validatedData = $request->validate([
            // バリデーションルールを追加
        ]);

        $content->update($validatedData);
        return response()->json($content);
    }

    public function show(Content $content)
    {
        return response()->json($content->load('pages.choices'));
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
        return Inertia::render('ContentEdit', ['content' => $content]);
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
        $content = Content::findOrFail($id);
        return Inertia::render('Preview', ['content' => $content]);
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