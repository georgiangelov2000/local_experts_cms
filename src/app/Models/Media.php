<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Media extends Model
{
    const COMPLETED  = 1;
    const PENDING = 2;
    
    use HasFactory;
    public $timestamps = false;

    protected $fillable = [
        'model_id',
        'model_type',
        'file_path',
        'file_name',
        'file_type',
    ];

    /**
     * Polymorphic relationship
     */
    public function model()
    {
        return $this->morphTo();
    }
}
