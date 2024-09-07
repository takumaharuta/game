<?php
namespace App\Http\Controllers;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Purchase;

class PurchasedWorksController extends Controller
{
    public function index()
    {
        $purchasedWorks = Purchase::with(['contentPage.creator'])
            ->where('user_id', auth()->id())
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($purchase) {
                return [
                    'id' => $purchase->contentPage->id,
                    'title' => $purchase->contentPage->title,
                    'cover_image' => $purchase->contentPage->cover_image,
                    'author_name' => $purchase->contentPage->creator->pen_name ?? 'Unknown Author',
                    'purchase_date' => $purchase->created_at->format('Y-m-d'),
                ];
            });

        return Inertia::render('PurchasedWorks', [
            'purchasedWorks' => $purchasedWorks
        ]);
    }
}