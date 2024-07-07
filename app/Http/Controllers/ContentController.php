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
    
        return Inertia::render('ContentPageEdit', [
            'contentPage' => $contentPage,
            'isNewContentPage' => $id === null
        ]);
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

}