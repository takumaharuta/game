<?php

namespace App\Http\Controllers;

use App\Models\Tag;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class TagController extends Controller
{
    public function index()
    {
        $tags = Tag::all();
        return response()->json($tags);
    }

    public function getTopTags()
    {
        $topTags = DB::table('content_page_tag')
            ->select('tag_id', DB::raw('count(*) as count'))
            ->groupBy('tag_id')
            ->orderByDesc('count')
            ->limit(5)
            ->get();

        $tags = Tag::whereIn('id', $topTags->pluck('tag_id'))
            ->get()
            ->map(function ($tag) use ($topTags) {
                $tagCount = $topTags->firstWhere('tag_id', $tag->id)->count;
                return [
                    'id' => $tag->id,
                    'name' => $tag->name,
                    'count' => $tagCount
                ];
            });

        return response()->json($tags);
    }
}