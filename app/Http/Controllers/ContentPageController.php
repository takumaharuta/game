<?php

namespace App\Http\Controllers;

use App\Models\ContentPage;
use App\Models\Tag;
use App\Models\Creator;
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

        DB::beginTransaction();
        try {
            $validatedData = $this->validateContentPage($request);
            $validatedData['creator_id'] = auth()->user()->creator->id;

            if (isset($validatedData['cover_image']) && Str::startsWith($validatedData['cover_image'], 'data:image')) {
                $validatedData['cover_image'] = $this->uploadToCloudinary($validatedData['cover_image']);
            }

            $contentPage = ContentPage::create($validatedData);
            $this->syncTags($contentPage, $validatedData['tags'] ?? []);

            DB::commit();

            return Inertia::location(route('content-page.preview', ['id' => $contentPage->id]));
        } catch (\Exception $e) {
            DB::rollBack();
            return Inertia::render('ErrorPage', ['message' => "Failed to create content page: " . $e->getMessage()]);
        }
    }

    public function update(Request $request, $id)
    {

        DB::beginTransaction();
        try {
            $contentPage = ContentPage::findOrFail($id);
            $validatedData = $this->validateContentPage($request);

            if (isset($validatedData['cover_image']) && Str::startsWith($validatedData['cover_image'], 'data:image')) {
                $validatedData['cover_image'] = $this->uploadToCloudinary($validatedData['cover_image']);
            }

            $contentPage->update($validatedData);
            $this->syncTags($contentPage, $validatedData['tags'] ?? []);

            DB::commit();

            return Inertia::location(route('content-page.preview', ['id' => $contentPage->id]));
        } catch (\Exception $e) {
            DB::rollBack();
            return Inertia::render('ErrorPage', ['message' => "Failed to update content page: " . $e->getMessage()]);
        }
    }

    private function validateContentPage(Request $request)
    {
        return $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'display_price' => 'required|integer|min:0',
            'discount_percentage' => 'required|integer|min:0|max:95',
            'tags' => 'nullable|array',
            'cover_image' => 'nullable|string',
        ]);
    }

    private function syncTags($contentPage, $tags)
    {
        $tagIds = [];
        foreach ($tags as $tagName) {
            $tag = Tag::firstOrCreate(['name' => $tagName]);
            $tagIds[] = $tag->id;
        }
        $contentPage->tags()->sync($tagIds);
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
    
    public function publish($id)
    {
        try {
            $contentPage = ContentPage::findOrFail($id);
            $contentPage->is_published = true;
            $contentPage->save();
    
            // ContentPageコンポーネントにリダイレクト
            return Inertia::location(route('content-page.show', ['id' => $contentPage->id]));
        } catch (\Exception $e) {
            return Inertia::render('ErrorPage', [
                'message' => 'Failed to publish content page: ' . $e->getMessage()
            ]);
        }
    }
    
    public function show($id)
    {
        $contentPage = ContentPage::with('creator')->withCount('favorites')->findOrFail($id);
        
        $user_id = auth()->id();
        $creator = Creator::where('user_id', $user_id)->first();
        
        $isCreator = false;
        if ($creator && $contentPage->creator_id) {
            $isCreator = $creator->id === $contentPage->creator_id;
        }
    
        $isFavorite = auth()->check() && auth()->user()->favorites()->where('content_page_id', $id)->exists();
    
        return Inertia::render('ContentPage', [
            'contentPage' => array_merge($contentPage->toArray(), [
                'favorites_count' => $contentPage->favorites_count,
                'average_rating' => $contentPage->average_rating,
                'rating_count' => $contentPage->rating_count,
                'author_name' => $contentPage->creator->pen_name ?? 'Unknown Author', // ここを追加
            ]),
            'isCreator' => $isCreator,
            'isFavorite' => $isFavorite,
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
    
    public function getPurchaseCount($id)
    {
        $contentPage = ContentPage::findOrFail($id);
        $purchaseCount = $contentPage->purchases()->count();

        return response()->json([
            'purchaseCount' => $purchaseCount
        ]);
    }
}