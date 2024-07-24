<?php

namespace App\Http\Controllers;

use App\Models\ContentPage;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Cloudinary\Cloudinary;

class ContentPageController extends Controller
{
    private function uploadToCloudinary($image)
    {
        $cloudinary = new Cloudinary();
        $result = $cloudinary->uploadApi()->upload($image);
        return $result['secure_url'];
    }

    private function getImageUrl($imagePath)
    {
        if (empty($imagePath)) {
            return null;
        }
        return $imagePath; // Cloudinaryの URL をそのまま返す
    }

    public function edit(?int $id = null)
    {
        $contentPage = $id ? ContentPage::findOrFail($id) : new ContentPage();
        $contentPage->cover_image = $this->getImageUrl($contentPage->cover_image);
        return Inertia::render('ContentPageEdit', [
            'contentPage' => $contentPage,
        ]);
    }

    public function store(Request $request)
    {
        try {
            $validatedData = $request->validate([
                'id' => 'nullable|integer|exists:content_pages,id',
                'content_id' => 'nullable|integer|exists:contents,id',
                'title' => 'required|string|max:255',
                'description' => 'required|string',
                'display_price' => 'required|integer|min:0',
                'discount_percentage' => 'required|integer|min:0|max:95',
                'tags' => 'nullable|array',
                'cover_image' => 'nullable|string',
            ]);
        
            if (isset($validatedData['cover_image']) && Str::startsWith($validatedData['cover_image'], 'data:image')) {
                $validatedData['cover_image'] = $this->uploadToCloudinary($validatedData['cover_image']);
            }
        
            if (isset($validatedData['id'])) {
                $contentPage = ContentPage::findOrFail($validatedData['id']);
                $contentPage->update($validatedData);
            } else {
                $contentPage = ContentPage::create($validatedData);
            }
        
            return Inertia::location("/content-page/preview/{$contentPage->id}");
        } catch (\Exception $e) {
            return Inertia::render('ErrorPage', ['message' => 'Failed to save content page: ' . $e->getMessage()]);
        }
    }

   public function preview($id)
    {
        try {
            $contentPage = ContentPage::findOrFail($id);
            // cover_imageの処理を修正
            if ($contentPage->cover_image) {
                if (!filter_var($contentPage->cover_image, FILTER_VALIDATE_URL)) {
                    $contentPage->cover_image = Storage::url($contentPage->cover_image);
                }
            } else {
                $contentPage->cover_image = null;
            }
            return Inertia::render('ContentPagePreview', ['contentPage' => $contentPage]);
        } catch (ModelNotFoundException $e) {
            return Inertia::render('ErrorPage', ['message' => 'Content page not found']);
        }
    }
    
    public function update(Request $request, $id)
    {
        try {
            $contentPage = ContentPage::findOrFail($id);
            $validatedData = $request->validate([
                'title' => 'required|string|max:255',
                'description' => 'required|string',
                'display_price' => 'required|integer|min:0',
                'discount_percentage' => 'required|integer|min:0|max:95',
                'tags' => 'nullable|array',
                'cover_image' => 'nullable|string',
            ]);

            if (isset($validatedData['cover_image']) && Str::startsWith($validatedData['cover_image'], 'data:image')) {
                $validatedData['cover_image'] = $this->uploadToCloudinary($validatedData['cover_image']);
            }

            $contentPage->update($validatedData);
            return Inertia::location("/content-page/{$id}");
        } catch (\Exception $e) {
            return Inertia::render('ErrorPage', ['message' => 'Failed to update content page: ' . $e->getMessage()]);
        }
    }
    
    public function publish($id)
    {
        $contentPage = ContentPage::findOrFail($id);
        $contentPage->is_published = true;
        $contentPage->save();
        return Inertia::location("/content-page/{$id}");
    }
    
    public function show($id)
    {
        $contentPage = ContentPage::with('creator')->findOrFail($id);
        $contentPage->cover_image = $this->getImageUrl($contentPage->cover_image);
        $isCreator = auth()->check() && auth()->user()->id === $contentPage->creator_id;
        return Inertia::render('ContentPage', [
            'contentPage' => $contentPage,
            'isCreator' => $isCreator,
        ]);
    }
}