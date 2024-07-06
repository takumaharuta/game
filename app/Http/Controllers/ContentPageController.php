<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\ContentPage;

class ContentPageController extends Controller
{
    public function edit($id)
    {
        $contentPage = ContentPage::findOrFail($id);
        
        return Inertia::render('ContentPageEdit', [
            'contentPage' => $contentPage,
            'tags' => $contentPage->tags,
            'isPublished' => $contentPage->is_published,
        ]);
    }

    public function update(Request $request, $id)
    {
        $contentPage = ContentPage::findOrFail($id);

        $validatedData = $request->validate([
            'title' => 'required|max:255',
            'price' => 'required|numeric',
            'discount' => 'numeric',
            'description' => 'required',
            'tags' => 'array',
            'is_published' => 'boolean',
        ]);

        $contentPage->update($validatedData);

        return redirect()->route('contentPage.edit', $contentPage->id);
    }

    public function show($id)
    {
        $contentPage = ContentPage::findOrFail($id);
        
        return Inertia::render('ContentPage', [
            'contentPage' => $contentPage,
            'comments' => $contentPage->comments()->with('user')->get(),
            'relatedWorks' => ContentPage::where('id', '!=', $id)
                ->inRandomOrder()
                ->limit(5)
                ->get(),
        ]);
    }
    
    public function create()
    {
        return Inertia::render('ContentPageEdit', [
            'contentPage' => new ContentPage(),
            'tags' => [],
            'isPublished' => false,
        ]);
    }
}