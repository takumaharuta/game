<?php

namespace App\Policies;

use App\Models\User;
use App\Models\Content;

class ContentPolicy
{
    public function create(User $user)
    {
        // ユーザーがクリエイターであるかどうかを確認
        return $user->creator()->exists();
    }

    public function update(User $user, Content $content)
    {
        // 作者のみが更新可能
        return $user->id === $content->user_id;
    }
}