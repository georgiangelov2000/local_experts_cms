<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use App\Models\Category;
use App\Models\ServiceCategory;
use App\Models\Review;
use App\Models\Project;
use App\Models\Like;
use App\Models\Dislike;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ServiceProvider extends Model
{
    use HasFactory;
    public $timestamps = false;

    protected $fillable = [
        'user_id',
        'business_name',
        'description',
        'category_id',
        'service_category_id',
        'start_date',
        'end_date',
        'alias'
    ];

    /**
     * Relationships
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function serviceCategory(): BelongsTo
    {
        return $this->belongsTo(ServiceCategory::class);
    }

    public function media(): MorphMany
    {
        return $this->morphMany(Media::class, 'model');
    }

    public function reviews(): HasMany
    {
        return $this->hasMany(Review::class);
    }

    public function projects(): HasMany
    {
        return $this->hasMany(Project::class);
    }

    public function services(): HasMany
    {
        return $this->hasMany(Service::class);
    }

    public function certifications(): HasMany
    {
        return $this->hasMany(Certification::class);
    }

    public function workspaces(): HasMany
    {
        return $this->hasMany(Workspace::class);
    }

    public function likes(): HasMany
    {
        return $this->hasMany(Like::class);
    }

    public function dislikes(): HasMany
    {
        return $this->hasMany(Dislike::class);
    }

    // Add dynamic count accessors
    public function getLikesCountAttribute(): int
    {
        return $this->likes()->count();
    }

    public function getDislikesCountAttribute(): int
    {
        return $this->dislikes()->count();
    }

    public function rating()
    {
        $finalGrade = 0;
        if ($this->reviews->count() > 0) {
            $finalGrade = round(
                $this->reviews->avg('rating'),
                2
            );
        }
        return $finalGrade;
    }

    public function contact(): BelongsTo
    {
        return $this->belongsTo(Contact::class);
    }

    public function mapProvider() {
        return [
            'business_name' => $this->business_name,
            'alias' => $this->alias,
            'start_date' => $this->start_date,
            'end_date' => $this->end_date,
            'category' => $this->serviceCategory->name,
            'projects' => $this->projects->map(function ($project) {
                return [
                    'id' => $project->id,
                    'name' => $project->project_name,
                    'description' => $project->description,
                ];
            }),
            'services' => $this->services->map(function ($service) {
                return [
                    'id' => $service->id,
                    'description' => $service->description,
                    'price' => $service->price,
                ];
            }),
            'certifications' => $this->certifications->map(function ($certification) {
                return [
                    'id' => $certification->id,
                    'name' => $certification->name,
                    'description' => $certification->description,
                ];
            }),
            'workspaces' => $this->workspaces->map(function ($workspace) {
                return [
                    'id' => $workspace->id,
                    'name' => $workspace->city->name,
                ];
            }),
            
        ];
    }

}
