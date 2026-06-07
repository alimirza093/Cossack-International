<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;

class StoreProductFullRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    protected function prepareForValidation()
    {
        // Agar admin multipart form-data mein data bhej raha hai (images upload karne ke liye)
        if ($this->has('data') && is_string($this->input('data'))) {
            $this->merge(json_decode($this->input('data'), true) ?? []);
        }
    }

    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'description' => 'required|string',
            'base_price' => 'required|numeric|min:0',
            'category_id' => 'required|uuid',
            'base_image' => 'nullable',
            
            'static_configs' => 'nullable|array',
            'static_configs.*.key' => 'required_with:static_configs|string',
            'static_configs.*.value' => 'required_with:static_configs|string',
            
            'dynamic_configs' => 'nullable|array',
            'dynamic_configs.*.name' => 'required_with:dynamic_configs|string',
            'dynamic_configs.*.type' => 'nullable|string', // custom, select etc.
            'dynamic_configs.*.options' => 'nullable|array',
            'dynamic_configs.*.options.*.value' => 'required_with:dynamic_configs.*.options|string',
            'dynamic_configs.*.options.*.price_modifier' => 'nullable|numeric',

            'variants' => 'nullable|array',
            'variants.*.color' => 'required_with:variants|string',
            'variants.*.stock' => 'nullable|integer|min:0',
            'variants.*.price_modifier' => 'nullable|numeric',
            'variants.*.images' => 'nullable|array',
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