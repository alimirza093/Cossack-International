<?php

namespace App\Http\Resources\order;

use App\Http\Resources\product\productOutResource;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class orderItemOutResource extends JsonResource
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
            'product' => new productOutResource(
                $this->whenLoaded('product')
            ),
            'variant' => $this->variant
                ? new orderVariantOutResource($this->variant)
                : null,
            'selected_options' => $this->selected_options,
            'quantity' => $this->quantity,
            'final_price' => $this->final_price,
            'item_total' => $this->item_total,
            'created_at' => $this->created_at
        ];
    }
}
