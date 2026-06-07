<?php

namespace App\Http\Resources\order;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class orderOutResource extends JsonResource
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
            'user_id' => $this->user_id,
            'total_price' => $this->total_price,
            'delivery_address' => $this->delivery_address,
            'payment_method' => $this->payment_method,
            'status' => $this->status,
            'items' => orderItemOutResource::collection(
                $this->whenLoaded('items')
            ),
            'created_at' => $this->created_at
        ];
    }
}
