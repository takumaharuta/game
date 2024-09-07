<?php
namespace App\Http\Controllers;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Purchase;
use App\Models\Creator;
use App\Models\ContentPage;

class MypageController extends Controller
{
    public function index()
    {
        $user = auth()->user();
        
        $creator = Creator::where('user_id', $user->id)->first();
        
        $purchasedWorks = Purchase::with('contentPage.creator')
            ->where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($purchase) {
                return [
                    'id' => $purchase->contentPage->id,
                    'title' => $purchase->contentPage->title,
                    'cover_image' => $purchase->contentPage->cover_image,
                    'author_name' => $purchase->contentPage->creator->pen_name ?? 'Unknown Author', // ここを修正
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
                    'author_name' => $contentPage->creator->pen_name ?? 'Unknown Author', // ここを修正
                    'display_price' => $contentPage->display_price,
                    'discount_percentage' => $contentPage->discount_percentage,
                    'average_rating' => $contentPage->average_rating,
                ];
            });

        $creatorInfo = null;
        $works = [];
        $creator_content = [];

        if ($creator) {
            $creatorInfo = [
                'name' => $creator->pen_name,
                'icon' => $creator->profile_image,
                'profile' => $creator->bio,
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
            $creator_content = ContentPage::where('creator_id', $creator->id)->get();
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
            'contentPages' => $creator_content,
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