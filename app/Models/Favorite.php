<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Favorite extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'content_page_id',
    ];

    public function contentPage()
    {
        return $this->belongsTo(ContentPage::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}