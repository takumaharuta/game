<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class MypageController extends Controller
{
    public function index()
    {
        return Inertia::render('Mypage');
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