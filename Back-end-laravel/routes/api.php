<?php

use App\Http\Controllers\AdminOrderController;
use App\Http\Controllers\CartController;
use App\Http\Controllers\OrderController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Middleware\AdminRequired;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\ProfileController;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::prefix('auth')->group(function () {
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/register', [AuthController::class, 'register']);
    Route::middleware('auth:sanctum')->get('/me', [AuthController::class, 'get_me']);
});

Route::prefix('categories')->group(function () {
    Route::get('/', [CategoryController::class, 'get_categories']);
    Route::get('/{category_id}', [CategoryController::class, 'get_category_by_id']);

    // Admin Protected Category Routes
    Route::middleware(['auth:sanctum', AdminRequired::class])->group(function () {
        Route::post('/post-category', [CategoryController::class, 'create_category']);
        Route::put('/{category_id}', [CategoryController::class, 'update_category']);
        Route::delete('/{category_id}', [CategoryController::class, 'delete_category']);
    });
});

Route::prefix('/admin/products')->group(function () {

    Route::get('/', [ProductController::class, 'list_admin_products']);
    Route::post('/full', [ProductController::class, 'create_product_full']);
    Route::put('/{product_id}', [ProductController::class, 'update_product']);
    Route::delete('/{product_id}', [ProductController::class, 'delete_product']);
    Route::post('/{product_id}/restore', [ProductController::class, 'restore_product']);

});

Route::prefix('/user/products')->group(function () {
    Route::get('/', [ProductController::class, 'list_user_products']);
    Route::get('/{product_id}', [ProductController::class, 'get_public_product']);
});

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/profile', [ProfileController::class, 'getProfile']);
    Route::put('/profile', [ProfileController::class, 'updateProfile']);
});

Route::middleware(['auth:sanctum', 'admin.reject'])->prefix('cart')->controller(CartController::class)->group(function () {
    Route::get('/', 'getCart');
    Route::post('/add', 'addToCart');
    Route::delete('/clear', 'clearCart');
    Route::delete('/{cartItemId}', 'delCart');
    Route::patch('/item/{cartItemId}/quantity', 'updateQuantity');
});

Route::middleware(['auth:sanctum', 'admin'])->prefix('admin/order')->group(function () {
    Route::get('/', [AdminOrderController::class, 'getAllOrders']);
    Route::put('/{orderId}', [AdminOrderController::class, 'updateOrderStatus']);
});

Route::middleware(['auth:sanctum', 'admin.reject'])
    ->prefix('order')
    ->controller(OrderController::class)
    ->group(function () {
        Route::post('/', 'createOrder');
        Route::get('/my', 'getMyOrders');
        Route::get('/{orderId}', 'getOrder');
    });
