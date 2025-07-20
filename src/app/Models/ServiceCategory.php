<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ServiceCategory extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'category_id',
        'description',
    ];

    /**
     * Relationships
     */

    public function category():BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function serviceProviders():HasMany
    {
        return $this->hasMany(ServiceProvider::class);
    }
}
