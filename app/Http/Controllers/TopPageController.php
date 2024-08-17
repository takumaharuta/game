<?php

namespace App\Http\Controllers;

use App\Models\ContentPage;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TopPageController extends Controller
{
    public function index()
    {
        $recommendedContents = ContentPage::with('creator')
            ->whereIsPublished(true)
            ->inRandomOrder()
            ->take(10)
            ->get()
            ->map(function ($content) {
                return $this->formatContentData($content);
            });

        $rankingContents = ContentPage::with('creator')
            ->whereIsPublished(true)
            ->orderBy('purchase_count', 'desc')
            ->take(10)
            ->get()
            ->map(function ($content) {
                return $this->formatContentData($content);
            });

        $latestContents = ContentPage::with('creator')
            ->whereIsPublished(true)
            ->latest()
            ->take(10)
            ->get()
            ->map(function ($content) {
                return $this->formatContentData($content);
            });

        return Inertia::render('TopPage', [
            'recommendedContents' => $recommendedContents,
            'rankingContents' => $rankingContents,
            'latestContents' => $latestContents,
            'auth' => [
                'user' => auth()->user(),
            ],
        ]);
    }

    private function formatContentData($content)
    {
        return [
            'id' => $content->id,
            'title' => $content->title,
            'cover_image' => $content->cover_image,
            'display_price' => $content->display_price,
            'discount_percentage' => $content->discount_percentage,
            'author_name' => $content->creator->name ?? 'Unknown Author',
            'average_rating' => $content->average_rating ?? 0,
            'rating_count' => $content->rating_count ?? 0,
            'purchase_count' => $content->purchase_count,
        ];
    }
}