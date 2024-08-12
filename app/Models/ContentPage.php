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
    ];
    
    protected $appends = ['scroll_type', 'creator_id', 'average_rating'];

    public function content()
    {
        return $this->belongsTo(Content::class, 'content_id', 'id');
    }

    public function getScrollTypeAttribute()
    {
        return $this->content?->scroll_type;
    }

    public function getCreatorIdAttribute()
    {
        return $this->content?->creator_id;
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

    public function getAverageRatingAttribute()
    {
        // 実際のレーティングシステムが実装されるまでは、ランダムな値を返す
        return number_format(rand(1, 50) / 10, 1);
    }

    public function getPurchaseCountAttribute()
    {
        // 実際の購入システムが実装されるまでは、ランダムな値を返す
        return rand(0, 1000);
    }
    
    

    public function toArray()
    {
        $array = parent::toArray();
        $array['content'] = $this->content?->only(['id', 'title', 'scroll_type', 'creator_id']);
        return $array;
    }
    
    public function creator()
    {
        return $this->belongsTo(User::class, 'creator_id');
    }
    
    public function purchases()
    {
        return $this->hasMany(Purchase::class);
    }
    
    public function favorites()
    {
        return $this->belongsToMany(User::class, 'favorites', 'content_page_id', 'user_id')->withTimestamps();
    }
}