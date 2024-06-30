<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Page extends Model
{
    use HasFactory;
    protected $fillable = ['content_id', 'page_number', 'image_path'];

    public function content()
    {
        return $this->belongsTo(Content::class);
    }

    public function choices()
    {
        return $this->hasMany(Choice::class);
    }
}
