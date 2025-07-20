<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Review extends Model
{
    protected $fillable = [
        'consumer_id',
        'service_provider_id',
        'rating',
        'review_text',
    ];

    public function serviceProvider()
    {
        return $this->belongsTo(ServiceProvider::class);
    }

    public function consumer()
    {
        return $this->belongsTo(User::class, 'consumer_id');
    }
}
