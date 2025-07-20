<?php

// App\Models\Dislike.php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Dislike extends Model
{
    protected $fillable = ['user_id', 'service_provider_id'];

    public function user() {
        return $this->belongsTo(User::class);
    }

    public function serviceProvider() {
        return $this->belongsTo(ServiceProvider::class);
    }
}
