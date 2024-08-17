<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Comment extends Model
{
    use HasFactory;

    protected $fillable = ['content', 'rating'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function contentPage()
    {
        return $this->belongsTo(ContentPage::class);
    }
}