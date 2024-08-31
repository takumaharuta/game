<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Creator extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'pen_name',
        'bio',
        'profile_image',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
    
    public function contentPages()
    {
        return $this->hasMany(ContentPage::class);
    }
}

