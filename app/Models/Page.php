<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Page extends Model
{
    use HasFactory;

    protected $fillable = [
        'content_id',
        'title',
        'content',
        'position_x',
        'position_y',
        'cover_image',
        'page_number',
        'has_choices',
    ];

    protected $casts = [
        'has_choices' => 'boolean',
        'position_x' => 'float',
        'position_y' => 'float',
    ];

    public function content()
    {
        return $this->belongsTo(Content::class);
    }

    public function choices()
    {
        return $this->hasMany(Choice::class);
    }
}