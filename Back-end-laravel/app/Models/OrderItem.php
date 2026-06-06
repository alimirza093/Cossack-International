<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class OrderItem extends Model
{
    protected $table = 'order_items';
    protected $primaryKey = 'id';
    public $incrementing = false;
    protected $keyType = 'string';
    public $timestamps = false;

    protected $fillable = [
        'id', 'order_id', 'product_id', 'variant_id', 'selected_options', 'final_price', 'item_total', 'quantity', 'created_at'
    ];

    protected $casts = [
        'selected_options' => 'array', // Python k JSON format k liye
        'final_price' => 'decimal:2',
        'item_total' => 'decimal:2',
        'quantity' => 'integer',
    ];
}
