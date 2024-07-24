<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Content extends Model
{
    use HasFactory;
    
    protected $fillable = ['title', 'scroll_type', 'creator_id'];

    public function pages()
    {
        return $this->hasMany(Page::class);
    }
    
    public function contentPages()
    {
        return $this->hasMany(ContentPage::class, 'content_id', 'id');
    }
}
