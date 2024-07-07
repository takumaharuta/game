<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ContentPage extends Model
{
    protected $fillable = [
        'content_id', 'title', 'description', 'tags', 'price', 'discount', 'is_published'
    ];

    protected $casts = [
        'tags' => 'array',
        'is_published' => 'boolean',
    ];

    public function content()
    {
        return $this->belongsTo(Content::class);
    }
}