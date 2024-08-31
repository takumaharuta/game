<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Purchase;
use App\Models\Creator;

class MypageController extends Controller
{
    public function index()
    {
        $user = auth()->user();

        $purchasedWorks = Purchase::with('contentPage.creator')
            ->where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($purchase) {
                return [
                    'id' => $purchase->contentPage->id,
                    'title' => $purchase->contentPage->title,
                    'cover_image' => $purchase->contentPage->cover_image,
                    'author_name' => $purchase->contentPage->creator->name ?? 'Unknown Author',
                    'purchase_date' => $purchase->created_at->format('Y-m-d'),
                ];
            });

        $favoriteWorks = $user->favorites()
            ->with('creator')
            ->orderBy('favorites.created_at', 'desc')
            ->get()
            ->map(function ($contentPage) {
                return [
                    'id' => $contentPage->id,
                    'title' => $contentPage->title,
                    'cover_image' => $contentPage->cover_image,
                    'author_name' => $contentPage->creator->name ?? 'Unknown Author',
                    'display_price' => $contentPage->display_price,
                    'discount_percentage' => $contentPage->discount_percentage,
                    'average_rating' => $contentPage->average_rating,
                ];
            });

        $creator = Creator::where('user_id', $user->id)->first();
        $creatorInfo = null;
        $works = [];

        if ($creator) {
            $creatorInfo = [
                'name' => $creator->name,
                'icon' => $creator->icon_url,
                'profile' => $creator->profile,
            ];
            $works = ContentPage::where('creator_id', $creator->id)
                ->orderBy('created_at', 'desc')
                ->get()
                ->map(function ($work) {
                    return [
                        'id' => $work->id,
                        'title' => $work->title,
                        'cover_image' => $work->cover_image,
                    ];
                });
        }

        return Inertia::render('Mypage', [
            'purchasedWorks' => $purchasedWorks,
            'favoriteWorks' => $favoriteWorks,
            'userInfo' => [
                'name' => $user->name,
                'email' => $user->email,
            ],
            'creatorInfo' => $creatorInfo,
            'works' => $works,
        ]);
    }

    public function getUserInfo(Request $request)
    {
        $user = $request->user();
        return response()->json([
            'name' => $user->name,
            'email' => $user->email,
        ]);
    }
}