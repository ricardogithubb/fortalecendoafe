<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Video extends Model
{
    use HasFactory;

    protected $fillable = [
        'file_name',
        'song_name',
        'artist_name',
        'video_url',
        'thumbnail_url'
    ];
}
