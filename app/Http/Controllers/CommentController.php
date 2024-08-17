<?php

namespace App\Http\Controllers;

use App\Models\Comment;
use App\Models\ContentPage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class CommentController extends Controller
{
    public function store(Request $request, $contentPageId)
    {
        $request->validate([
            'content' => 'required|string|max:500',
            'rating' => 'required|integer|min:1|max:5',
        ]);

        $contentPage = ContentPage::findOrFail($contentPageId);

        // Check if the user has already commented
        if ($contentPage->comments()->where('user_id', Auth::id())->exists()) {
            return response()->json(['message' => 'You have already commented on this content.'], 403);
        }

        $comment = new Comment([
            'content' => $request->content,
            'rating' => $request->rating,
        ]);

        $comment->user()->associate(Auth::user());
        $comment->contentPage()->associate($contentPage);
        $comment->save();

        return response()->json($comment, 201);
    }

    public function update(Request $request, $contentPageId, $commentId)
    {
        $request->validate([
            'content' => 'required|string|max:500',
            'rating' => 'required|integer|min:1|max:5',
        ]);

        $comment = Comment::findOrFail($commentId);

        // Check if the comment belongs to the authenticated user
        if ($comment->user_id !== Auth::id()) {
            return response()->json(['message' => 'You are not authorized to edit this comment.'], 403);
        }

        $comment->content = $request->content;
        $comment->rating = $request->rating;
        $comment->save();

        return response()->json($comment);
    }

    public function index($contentPageId)
    {
        $contentPage = ContentPage::findOrFail($contentPageId);
        $comments = $contentPage->comments()->with('user:id,name')->get();
        return response()->json($comments);
    }
}