<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;

class ProductUpdateRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    protected function prepareForValidation()
    {
        if ($this->has('data') && is_string($this->input('data'))) {
            $this->merge(json_decode($this->input('data'), true) ?? []);
        }
    }

    public function rules(): array
    {
        return [
            'name' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'base_price' => 'nullable|numeric|min:0',
            'category_id' => 'nullable|uuid',
            'base_image' => 'nullable|string',
            
            'static_configs' => 'nullable|array',
            'static_configs.*.id' => 'nullable|uuid',
            'static_configs.*.key' => 'nullable|string',
            'static_configs.*.value' => 'nullable|string',

            'dynamic_configs' => 'nullable|array',
            'dynamic_configs.*.id' => 'nullable|uuid',
            'dynamic_configs.*.name' => 'nullable|string',
            'dynamic_configs.*.type' => 'nullable|string',
            'dynamic_configs.*.options' => 'nullable|array',
            'dynamic_configs.*.options.*.id' => 'nullable|uuid',
            'dynamic_configs.*.options.*.value' => 'nullable|string',
            'dynamic_configs.*.options.*.price_modifier' => 'nullable|numeric',

            'variants' => 'nullable|array',
            'variants.*.id' => 'nullable|uuid',
            'variants.*.color' => 'nullable|string',
            'variants.*.stock' => 'nullable|integer|min:0',
            'variants.*.price_modifier' => 'nullable|numeric',
            'variants.*.images' => 'nullable|array',
            'variants.*.images.*.id' => 'nullable|uuid',
            'variants.*.images.*.image_url' => 'nullable|string',
            'variants.*.images.*.is_primary' => 'nullable|boolean',
        ];
    }

    protected function failedValidation(Validator $validator)
    {
        throw new HttpResponseException(response()->json([
            'detail' => $validator->errors()->first()
        ], 400));
    }
}