<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProviderSubscription extends Model
{
    protected $fillable = [
        'service_provider_id',
        'subscription_plan_id',
        'start_date',
        'end_date',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'start_date' => 'datetime',
        'end_date' => 'datetime',
    ];

    public function serviceProvider()
    {
        return $this->belongsTo(ServiceProvider::class);
    }

    public function subscriptionPlan()
    {
        return $this->belongsTo(SubscriptionPlan::class);
    }
} 