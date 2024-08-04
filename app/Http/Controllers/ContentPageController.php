<?php

namespace App\Http\Controllers;

use App\Models\ContentPage;
use App\Models\Tag;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Cloudinary\Cloudinary;
use Illuminate\Support\Facades\DB;

class ContentPageController extends Controller
{
    public function create()
    {
        $contentPage = new ContentPage();
        $tags = Tag::all();
        
        return Inertia::render('ContentPageCreate', [
            'contentPage' => $contentPage,
            'tags' => $tags,
        ]);
    }
    
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
        
        // タグの取得と処理
        if ($id) {
            $tags = $contentPage->tags()->get();
            $contentPage->tags = $tags->map(function($tag) {
                return ['id' => $tag->id, 'name' => $tag->name];
            })->toArray();
        } else {
            $contentPage->tags = [];
        }
    
        return Inertia::render('ContentPageEdit', [
            'contentPage' => $contentPage,
        ]);
    }

    public function store(Request $request)
    {
        try {
            DB::beginTransaction();

            $validatedData = $request->validate([
                'title' => 'required|string|max:255',
                'description' => 'nullable|string',
                'display_price' => 'required|numeric|min:0',
                'discount_percentage' => 'nullable|integer|min:0|max:100',
                'tags' => 'nullable|array',
                'cover_image' => 'nullable|string',
            ]);

            if (isset($validatedData['cover_image']) && Str::startsWith($validatedData['cover_image'], 'data:image')) {
                $validatedData['cover_image'] = $this->uploadToCloudinary($validatedData['cover_image']);
            }

            $contentPage = ContentPage::create($validatedData);

            // タグの処理
            if (isset($validatedData['tags']) && is_array($validatedData['tags'])) {
                $tagIds = [];
                foreach ($validatedData['tags'] as $tagName) {
                    $tag = Tag::firstOrCreate(['name' => $tagName]);
                    $tagIds[] = $tag->id;
                }
                $contentPage->tags()->sync($tagIds);
            }

            DB::commit();

            return Inertia::location("/content-page/preview/{$contentPage->id}");
        } catch (\Exception $e) {
            DB::rollBack();
            return Inertia::render('ErrorPage', ['message' => 'Failed to save content page: ' . $e->getMessage()]);
        }
    }

    public function preview($id)
    {
        try {
            $contentPage = ContentPage::with('tags')->findOrFail($id);
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
        DB::beginTransaction();
        try {
            $contentPage = ContentPage::findOrFail($id);
            $validatedData = $request->validate([
                'title' => 'required|string|max:255',
                'description' => 'nullable|string',
                'display_price' => 'required|integer|min:0',
                'discount_percentage' => 'required|integer|min:0|max:95',
                'tags' => 'nullable|array',
                'cover_image' => 'nullable|string',
            ]);

            if (isset($validatedData['cover_image']) && Str::startsWith($validatedData['cover_image'], 'data:image')) {
                $validatedData['cover_image'] = $this->uploadToCloudinary($validatedData['cover_image']);
            }

            $contentPage->update($validatedData);

            if (isset($validatedData['tags']) && is_array($validatedData['tags'])) {
                $tagIds = [];
                foreach ($validatedData['tags'] as $tagName) {
                    $tag = Tag::firstOrCreate(['name' => $tagName]);
                    $tagIds[] = $tag->id;
                }
                $contentPage->tags()->sync($tagIds);
            }

            DB::commit();

            return Inertia::location("/content-page/{$id}");
        } catch (\Exception $e) {
            DB::rollBack();
            return Inertia::render('ErrorPage', ['message' => 'Failed to update content page: ' . $e->getMessage()]);
        }
    }
    
    public function publish($id)
    {
        $contentPage = ContentPage::findOrFail($id);
        $contentPage->is_published = 1;
        $contentPage->save();
        return redirect("/content-page/{$id}");
    }
    
    public function show($id)
    {
        $contentPage = ContentPage::with(['creator', 'tags'])->findOrFail($id);
        $contentPage->cover_image = $this->getImageUrl($contentPage->cover_image);
        $isCreator = auth()->check() && auth()->user()->id === $contentPage->creator_id;
        return Inertia::render('ContentPage', [
            'contentPage' => $contentPage,
            'isCreator' => $isCreator,
        ]);
    }
    
    public function getPrice($id)
    {
        try {
            $contentPage = ContentPage::findOrFail($id);
            $price = (int) $contentPage->display_price; // 整数に変換
            return response()->json(['price' => $price]);
        } catch (\Exception $e) {
            \Log::error('Error in getPrice', ['id' => $id, 'error' => $e->getMessage()]);
            return response()->json(['error' => 'Failed to retrieve price'], 500);
        }
    }
}