<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ContentPage extends Model
{
    use HasFactory;

    protected $fillable = [
        'content_id', 'creator_id', 'title', 'description', 'display_price', 
        'discount_percentage', 'is_published', 'cover_image', 'purchase_count'
    ];

    protected $casts = [
        'is_published' => 'boolean',
        'display_price' => 'integer',
        'discount_percentage' => 'integer',
        'purchase_count' => 'integer',
        'tags' => 'array',
        'creator_id' => 'integer',
    ];
    
    protected $appends = ['scroll_type', 'average_rating'];

    public function content()
    {
        return $this->belongsTo(Content::class, 'content_id', 'id');
    }

    public function getScrollTypeAttribute()
    {
        return $this->content?->scroll_type;
    }
    
    public function tags()
    {
        return $this->belongsToMany(Tag::class, 'content_page_tag');
    }
    
    
    public function getTagsAttribute($value)
    {
        return $value ? json_decode($value, true) : [];
    }

    public function getCoverImageAttribute($value)
    {
        return $value ?: null;
    }

    public function setCoverImageAttribute($value)
    {
        $this->attributes['cover_image'] = $value;
    }

    public function toArray()
    {
        $array = parent::toArray();
        $array['content'] = $this->content?->only(['id', 'title', 'scroll_type', 'creator_id']);
        return $array;
    }
    
    public function creator()
    {
        return $this->belongsTo(Creator::class);
    }
    
    public function purchases()
    {
        return $this->hasMany(Purchase::class);
    }
    
    public function favorites()
    {
        return $this->belongsToMany(User::class, 'favorites', 'content_page_id', 'user_id')->withTimestamps();
    }
    
    public function comments()
    {
        return $this->hasMany(Comment::class);
    }
    
    public function getAverageRatingAttribute()
    {
        $averageRating = $this->comments()->avg('rating');
        return $averageRating ? round($averageRating, 1) : 0;
    }

    public function getRatingCountAttribute()
    {
        return $this->comments()->whereNotNull('rating')->count();
    }
}