<?php

namespace App\Http\Requests\cart;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class createRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'product_id' => ['required', 'uuid'],
            'variant_id' => ['required', 'uuid'],
            'selected_options' => ['required', 'array'],
            'selected_options.*.config_id' => ['required', 'uuid'],
            'selected_options.*.option_id' => ['required', 'uuid'],
            'quantity' => ['required', 'integer', 'min:1']
        ];
    }
}
