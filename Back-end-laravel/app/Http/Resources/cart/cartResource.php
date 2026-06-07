<?php

namespace App\Http\Resources\cart;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class cartResource extends JsonResource
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
            'grand_total' => $this->grand_total,
            'items' => cartItemResource::collection($this->items),
            'created_at' => $this->created_at
        ];
    }
}
