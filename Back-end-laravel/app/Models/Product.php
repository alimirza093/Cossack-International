<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    use HasUuids;
    protected $table = 'products';
    protected $primaryKey = 'id';
    public $incrementing = false;
    protected $keyType = 'string';
    public $timestamps = false;

    protected $fillable = [
        'id',
        'name',
        'description',
        'base_price',
        'base_image',
        'is_deleted',
        'category_id',
        'created_at'
    ];


    protected $casts = [
        'base_price' => 'decimal:2',
        'is_deleted' => 'boolean',
    ];

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function variants()
    {
        return $this->hasMany(ProductVariant::class);
    }

    public function configs()
    {
        return $this->hasMany(ProductConfig::class);
    }

    public function staticConfigs()
    {
        return $this->hasMany(ProductStaticConfig::class);
    }

    public function cartItems()
    {
        return $this->hasMany(CartItem::class, 'product_id');
    }

    public function orderItems()
    {
        return $this->hasMany(OrderItem::class, 'product_id');
    }

}
