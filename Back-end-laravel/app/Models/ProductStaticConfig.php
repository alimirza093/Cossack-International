<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class ProductStaticConfig extends Model
{
    use HasUuids;
    protected $table = 'product_static_configs';
    protected $primaryKey = 'id';
    public $incrementing = false;
    protected $keyType = 'string';
    public $timestamps = false;

    protected $fillable = ['id', 'product_id', 'key', 'value', 'created_at'];

    public function product()
    {
        return $this->belongsTo(Product::class);
    }
}
