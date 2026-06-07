<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class AuthController extends Controller
{
    // 1. REGISTER ENDPOINT
    public function register(Request $request)
    {
        // Laravel Validation rules me hi saari length aur unique checks daal di hain
        // Is se aap ka code boht chota aur clean ho jaye ga
        $validator = Validator::make($request->all(), [
            'first_name' => 'required|string|min:2',
            'last_name' => 'required|string|min:2',
            'email' => 'required|string|email|unique:users,email', // Auto check karega k email unique hai ya nahi
            'password' => 'required|string|min:8',
        ], [
            // Custom messages taakay response format bilkul aap k FastAPI jaisa 'detail' return kare
            'email.unique' => 'Email already registered',
            'password.min' => 'Password must be at least 8 characters long',
            'first_name.min' => 'First name and last name must be at least 2 characters long',
            'last_name.min' => 'First name and last name must be at least 2 characters long',
        ]);

        if ($validator->fails()) {
            // Validator errors se pehla error nikal kar 'detail' me bhej rahay hain taakay mobile/frontend app crash na ho
            return response()->json(['detail' => $validator->errors()->first()], 400);
        }

        // User Create ho raha hai
        // Note: 'id' (UUID) hum ne yahan se hata diya hai kyunki hum ne User Model me 'HasUuids' trait laga di hai, Laravel khud banaye ga.
        User::create([
            'first_name' => $request->first_name,
            'last_name' => $request->last_name,
            'email' => $request->email,
            'password_hash' => Hash::make($request->password), // Standard Laravel Secure Bcrypt Hashing
            'role' => 'user',
            'created_at' => now(),
        ]);

        return response()->json(['message' => 'User registered successfully'], 200);
    }

    // 2. LOGIN ENDPOINT
    public function login(Request $request)
    {
        $user = User::where('email', $request->email)->first();

        if (!$user) {
            return response()->json(['detail' => 'Invalid credentials'], 400);
        }

        // password_verify() hi rehne diya hai taakay jo purane users Python se banay hue hain wo bhi login hote rahein
        if (!password_verify($request->password, $user->password_hash)) {
            return response()->json(['detail' => 'Invalid credentials'], 400);
        }

        // Sanctum token generation
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Login successful',
            'access_token' => $token,
            'token_type' => 'bearer',
        ], 200);
    }

    // 3. GET CURRENT USER ENDPOINT (FastAPI: /me)
    public function get_me(Request $request)
    {
        // Yeh automatically Bearer token se current logged-in user return karega
        return response()->json($request->user(), 200);
    }
}
