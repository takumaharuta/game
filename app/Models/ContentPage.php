<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class ContentPage extends Model
{
    use HasFactory;

    protected $fillable = [
        'content_id', 'title', 'description', 'tags', 'display_price', 'discount_percentage', 'is_published', 'cover_image', 'purchase_count'
    ];

    protected $casts = [
        'tags' => 'array',
        'is_published' => 'boolean',
        'display_price' => 'integer',
        'discount_percentage' => 'integer',
        'purchase_count' => 'integer',
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
}