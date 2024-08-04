<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Content extends Model
{
    use HasFactory;
    
    protected $fillable = ['title', 
        'title',
        'description',
        'display_price',
        'original_price',
        'scroll_type',
        'creator_id',
        'discount_percentage'
        ];

    public function pages()
    {
        return $this->hasMany(Page::class);
    }
    
    public function contentPages()
    {
        return $this->hasMany(ContentPage::class, 'content_id', 'id');
    }
}
