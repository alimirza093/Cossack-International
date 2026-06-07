<?php

namespace App\Http\Resources\cart;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class variantCartResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'color' => $this->color,
            'stock' => $this->stock,
            'price_modifier' => $this->price_modifier
        ];
    }
}
