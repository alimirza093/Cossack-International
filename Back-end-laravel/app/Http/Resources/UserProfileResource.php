<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserProfileResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     */
    public function toArray(Request $request): array
    {
        return [
            'id'           => $this->id,
            'first_name'   => $this->first_name,
            'last_name'    => $this->last_name,
            'email'        => $this->email,
            'role'         => $this->role,
            'created_at'   => $this->created_at ? $this->created_at->toIso8601String() : null,
            'phone_number' => $this->phone_number,
            'address'      => $this->address,
        ];
    }
}