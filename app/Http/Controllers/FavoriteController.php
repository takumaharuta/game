<?php
namespace App\Http\Controllers;
use App\Models\ContentPage;
use Illuminate\Http\Request;
use Inertia\Inertia;

class FavoriteController extends Controller
{
    public function toggle($id)
    {
        $user = auth()->user();
        $contentPage = ContentPage::findOrFail($id);
        $user->favorites()->toggle($contentPage);
        $isFavorite = $user->favorites()->where('content_page_id', $id)->exists();
        $favoriteCount = $contentPage->favorites()->count();

        return response()->json([
            'success' => true,
            'isFavorite' => $isFavorite,
            'favoriteCount' => $favoriteCount,
            'message' => $isFavorite ? 'お気に入りに追加しました' : 'お気に入りから削除しました'
        ]);
    }

    public function index()
    {
        $user = auth()->user();
        $favoriteWorks = $user->favorites()->with('creator')->get()->map(function ($contentPage) {
            return [
                'id' => $contentPage->id,
                'title' => $contentPage->title,
                'cover_image' => $contentPage->cover_image,
                'author_name' => $contentPage->creator->pen_name ?? 'Unknown Author',
                'display_price' => $contentPage->display_price,
                'discount_percentage' => $contentPage->discount_percentage,
                'average_rating' => $contentPage->average_rating,
            ];
        });

        return Inertia::render('FavoriteWorks', [
            'favoriteWorks' => $favoriteWorks,
        ]);
    }
}