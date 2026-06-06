<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProductStaticConfig extends Model
{
    protected $table = 'product_static_configs';
    protected $primaryKey = 'id';
    public $incrementing = false;
    protected $keyType = 'string';
    public $timestamps = false;

    protected $fillable = ['id', 'product_id', 'key', 'value'];
}
