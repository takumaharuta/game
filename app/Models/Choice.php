<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Choice extends Model
{
    use HasFactory;
    protected $fillable = ['page_id', 'text', 'flavor', 'next_page_id'];

    public function page()
    {
        return $this->belongsTo(Page::class);
    }

}
