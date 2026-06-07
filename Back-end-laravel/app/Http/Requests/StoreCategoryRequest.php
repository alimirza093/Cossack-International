<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;

class StoreCategoryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // Middleware handle karega authorization, yahan true rakhin
    }

    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255',
        ];
    }

    // FastAPI jaisa 'detail' format response return karne k liye custom handler
    protected function failedValidation(Validator $validator)
    {
        throw new HttpResponseException(response()->json([
            'detail' => $validator->errors()->first()
        ], 400));
    }
}