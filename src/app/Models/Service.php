<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Service extends Model
{
    protected $fillable = [
        'service_provider_id',
        'price',
        'description',
    ];
    protected $casts = [
        'price' => 'float'
    ];
    
    public function serviceProvider()
    {
        return $this->belongsTo(ServiceProvider::class);
    }
}
