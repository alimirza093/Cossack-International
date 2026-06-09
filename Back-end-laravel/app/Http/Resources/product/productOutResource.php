<?php

namespace App\Http\Resources\product;

use App\Http\Resources\category\categoryOutResource;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class productOutResource extends JsonResource
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
            'name' => $this->name,
            'description' => $this->description,
            'base_price' => $this->base_price,
            'base_image' => $this->base_image,
            'category_id' => $this->category_id,
            'category' => new categoryOutResource(
                $this->whenLoaded('category')
            ),
            'created_at' => $this->created_at,
            'static_configs' => productStaticConfigResource::collection(
                $this->whenLoaded('staticConfigs')
            ),
            'configs' => productConfigResource::collection(
                $this->whenLoaded('configs')
            ),
            'variants' => productVariantResource::collection(
                $this->whenLoaded('variants')
            ),
        ];
    }
}
