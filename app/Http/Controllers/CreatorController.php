<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Creator;
use Illuminate\Support\Str;
use Cloudinary\Cloudinary;

class CreatorController extends Controller
{
    private function uploadToCloudinary($image)
    {
        $cloudinary = new Cloudinary();
        $result = $cloudinary->uploadApi()->upload($image);
        return $result['secure_url'];
    }

    public function register(Request $request)
    {
        $request->validate([
            'pen_name' => 'required|string|max:255',
            'bio' => 'required|string',
            'profile_image' => 'nullable|string',
        ]);

        $user = auth()->user();

        $profileImageUrl = null;
        if ($request->filled('profile_image') && Str::startsWith($request->profile_image, 'data:image')) {
            $profileImageUrl = $this->uploadToCloudinary($request->profile_image);
        }

        $creator = Creator::create([
            'user_id' => $user->id,
            'pen_name' => $request->pen_name,
            'bio' => $request->bio,
            'profile_image' => $profileImageUrl,
        ]);

        return redirect()->route('mypage')->with('success', 'クリエイター登録が完了しました。');
    }
    
    public function update(Request $request)
    {
        $request->validate([
            'pen_name' => 'required|string|max:255',
            'bio' => 'required|string',
            'profile_image' => 'nullable|string',
        ]);

        $user = auth()->user();
        $creator = Creator::where('user_id', $user->id)->firstOrFail();

        $creator->pen_name = $request->pen_name;
        $creator->bio = $request->bio;

        if ($request->filled('profile_image') && Str::startsWith($request->profile_image, 'data:image')) {
            $profileImageUrl = $this->uploadToCloudinary($request->profile_image);
            $creator->profile_image = $profileImageUrl;
        }

        $creator->save();

        return redirect()->route('mypage')->with('success', 'クリエイター情報が更新されました。');
    }
    
    
}