<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\ServiceCategoryController;
use App\Http\Controllers\WorkSpaceController;

Route::prefix('v1')->group(function () {
    // Authentication
    Route::post('login', [AuthController::class, 'login']);
    Route::post('register', [AuthController::class, 'register']);

    // Protected routes
    Route::middleware('auth:api')->group(function () {
        Route::post('logout', [AuthController::class, 'logout']);
        Route::get('me', [AuthController::class, 'me']);
        Route::apiResource('users', UserController::class);
        Route::get('users/{user}', [UserController::class, 'show']);
        Route::put('users/{user}', [UserController::class, 'update']);
        Route::patch('users/{user}', [UserController::class, 'update']);
        Route::apiResource('categories', CategoryController::class);
        Route::apiResource('service-categories', ServiceCategoryController::class)->only(['index']);
        Route::apiResource('workspaces', WorkSpaceController::class);
    });
}); 