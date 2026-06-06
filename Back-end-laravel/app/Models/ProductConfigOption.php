<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProductConfigOption extends Model
{
    protected $table = 'product_config_options';
    protected $primaryKey = 'id';
    public $incrementing = false;
    protected $keyType = 'string';
    public $timestamps = false;

    protected $fillable = ['id', 'config_id', 'value', 'price_modifier'];

    protected $casts = [
        'price_modifier' => 'decimal:2',
    ];
}