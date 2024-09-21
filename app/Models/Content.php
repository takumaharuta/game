<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Content extends Model
{
    use HasFactory;
    
    protected $fillable = [
        'title',
        'description',
        'creator_id',
        'is_published'
    ];

    protected $casts = [
        'is_published' => 'boolean',
    ];

    public function pages()
    {
        return $this->hasMany(Page::class);
    }

    public function creator()
    {
        return $this->belongsTo(Creator::class, 'creator_id');
    }

    public function contentProduct()
    {
        return $this->hasOne(ContentProduct::class);
    }
}