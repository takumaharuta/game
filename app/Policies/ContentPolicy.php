<?php

namespace App\Policies;

use App\Models\User;
use App\Models\Content;
use App\Models\ContentPage;

class ContentPolicy
{
    public function create(User $user)
    {
        // ユーザーがクリエイターであるかどうかを確認
        return $user->creator()->exists();
    }

    public function update(User $user, $content)
    {
        // $content が Content モデルか ContentPage モデルかをチェック
        if ($content instanceof Content) {
            return $user->id === $content->user_id;
        } elseif ($content instanceof ContentPage) {
            // ContentPage の所有者を確認
            // ここでは ContentPage が Content に属していると仮定しています
            return $user->id === $content->content->user_id;
        }

        return false;
    }
}