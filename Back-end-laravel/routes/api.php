<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Middleware\AdminRequired;
use App\Http\Controllers\CategoryController;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);
Route::middleware('auth:sanctum')->get('/me', [AuthController::class, 'get_me']);
Route::get('/categories', [CategoryController::class, 'get_categories']);
Route::get('/categories/{category_id}', [CategoryController::class, 'get_category_by_id']);

// Admin Protected Category Routes
Route::middleware(['auth:sanctum', AdminRequired::class])->group(function () {
    Route::post('/post-category', [CategoryController::class, 'create_category']);
    Route::put('/update-category/{category_id}', [CategoryController::class, 'update_category']);
    Route::delete('/delete-category/{category_id}', [CategoryController::class, 'delete_category']);
});