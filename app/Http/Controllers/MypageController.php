<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Purchase;

class MypageController extends Controller
{
    public function index()
    {
        $purchasedWorks = Purchase::with('contentPage')
            ->where('user_id', auth()->id())
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($purchase) {
                return [
                    'id' => $purchase->contentPage->id,
                    'title' => $purchase->contentPage->title,
                    'cover_image' => $purchase->contentPage->cover_image,
                    'author_name' => $purchase->contentPage->author_name,
                    'purchase_date' => $purchase->created_at->format('Y-m-d'),
                ];
            });
            
        return Inertia::render('Mypage',[
            'purchasedWorks' => $purchasedWorks
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