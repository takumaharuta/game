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

        if (request()->wantsJson()) {
            return response()->json(['isFavorite' => $isFavorite]);
        }

        return back()->with('success', $isFavorite ? 'お気に入りに追加しました' : 'お気に入りから削除しました');
    }

    public function index()
    {
        $user = auth()->user();
        $favoriteWorks = $user->favorites()->with('creator')->get();

        return Inertia::render('FavoriteWorksPage', [
            'favoriteWorks' => $favoriteWorks,
        ]);
    }
}