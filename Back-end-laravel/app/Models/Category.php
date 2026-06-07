<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class Category extends Model
{
    use HasUuids;
    protected $table = 'categories';
    protected $primaryKey = 'id';
    public $incrementing = false;
    protected $keyType = 'string';
    public $timestamps = false;

    protected $fillable = ['id', 'name', 'is_deleted', 'created_at'];

    protected $casts = [
        'is_deleted' => 'boolean',
    ];

    public function products()
    {
        return $this->hasMany(Product::class);
    }
}
