<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    protected $table = 'products';
    protected $primaryKey = 'id';
    public $incrementing = false;
    protected $keyType = 'string';
    public $timestamps = false;

    protected $fillable = [
        'id', 'name', 'description', 'base_price', 'base_image', 'is_deleted', 'category_id', 'created_at'
    ];

    protected $casts = [
        'base_price' => 'decimal:2',
        'is_deleted' => 'boolean',
    ];
}
