<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProductConfig extends Model
{
    protected $table = 'product_configs';
    protected $primaryKey = 'id';
    public $incrementing = false;
    protected $keyType = 'string';
    public $timestamps = false;

    protected $fillable = ['id', 'product_id', 'name', 'type'];
}