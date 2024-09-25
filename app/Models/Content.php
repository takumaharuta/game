<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Content extends Model
{
    use HasFactory;
    
    protected $fillable = [
        'nodes',
        'edges',
        'creator_id',
    ];

    protected $casts = [
        'nodes' => 'json',
        'edges' => 'json',
    ];

    public function creator()
    {
        return $this->belongsTo(Creator::class);
    }
}