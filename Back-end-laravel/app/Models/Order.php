<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    protected $table = 'orders';
    protected $primaryKey = 'id';
    public $incrementing = false;
    protected $keyType = 'string';
    public $timestamps = false;

    protected $fillable = [
        'id', 'user_id', 'total_price', 'delivery_address', 'payment_method', 'status', 'created_at'
    ];

    protected $casts = [
        'total_price' => 'decimal:2',
    ];
}
