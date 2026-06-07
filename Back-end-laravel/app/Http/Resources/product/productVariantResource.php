<?php

namespace App\Http\Resources\product;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class productVariantResource extends JsonResource
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
            'price_modifier' => $this->price_modifier,
            'images' => productImageResource::collection(
                $this->whenLoaded('images')
            ),
        ];
    }
}
