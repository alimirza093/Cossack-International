<?php

namespace App\Models;

use App\ConfigType;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class ProductConfig extends Model
{
    use HasUuids;
    protected $table = 'product_configs';
    protected $primaryKey = 'id';
    public $incrementing = false;
    protected $keyType = 'string';
    public $timestamps = false;

    protected $fillable = ['id', 'product_id', 'name', 'type', 'created_at'];

    protected $casts = [
        'type' => ConfigType::class,
    ];

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function options()
    {
        return $this->hasMany(ProductConfigOption::class, 'config_id');
    }


}
