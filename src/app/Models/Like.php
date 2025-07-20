<?php

// App\Models\Like.php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Like extends Model
{
    protected $fillable = ['user_id', 'service_provider_id'];

    public function user():BelongsTo {
        return $this->belongsTo(User::class);
    }

    public function serviceProvider():BelongsTo {
        return $this->belongsTo(ServiceProvider::class);
    }
}
