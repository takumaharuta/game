<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ContentPage extends Model
{
    use HasFactory;

    protected $fillable = [
        'content_id', 'title', 'description', 'tags', 'price', 'discount', 'is_published', 'cover_image'
    ];

    protected $casts = [
        'tags' => 'array',
        'is_published' => 'boolean',
        'price' => 'float',
        'discount' => 'float',
    ];

    protected $appends = ['scroll_type', 'creator_id'];

    public function content()
    {
        return $this->belongsTo(Content::class);
    }

    public function getScrollTypeAttribute()
    {
        return $this->content ? $this->content->scroll_type : null;
    }

    public function getCreatorIdAttribute()
    {
        return $this->content ? $this->content->creator_id : null;
    }

    public function setTagsAttribute($value)
    {
        $this->attributes['tags'] = json_encode($value);
    }

    public function getTagsAttribute($value)
    {
        return json_decode($value, true) ?? [];
    }

    public function getCoverImageAttribute($value)
    {
        return $value ? asset('storage/' . $value) : null;
    }

    public function setCoverImageAttribute($value)
    {
        if ($value && !starts_with($value, 'http')) {
            $this->attributes['cover_image'] = str_replace('public/', '', $value);
        } else {
            $this->attributes['cover_image'] = $value;
        }
    }

    public function toArray()
    {
        $array = parent::toArray();
        $array['content'] = $this->content ? $this->content->only(['id', 'title', 'scroll_type', 'creator_id']) : null;
        return $array;
    }
}