<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProductVariant extends Model
{
    protected $table = 'product_variants';
    protected $primaryKey = 'id';
    public $incrementing = false;
    protected $keyType = 'string';
    public $timestamps = false;

    protected $fillable = [
        'id', 'product_id', 'color', 'stock', 'price_modifier', 'created_at'
    ];

    protected $casts = [
        'stock' => 'integer',
        'price_modifier' => 'decimal:2',
    ];
}