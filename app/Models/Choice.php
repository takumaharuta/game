<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Choice extends Model
{
    use HasFactory;
    
    protected $fillable = ['page_id', 'text', 'next_page_id'];

    public function page()
    {
        return $this->belongsTo(Page::class);
    }

    public function nextPage()
    {
        return $this->belongsTo(Page::class, 'next_page_id');
    }
}