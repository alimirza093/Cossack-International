<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Http\Resources\UserProfileResource;

class ProfileController extends Controller
{
    /**
     * GET /api/profile
     */
    public function getProfile(Request $request)
    {
        $user = $request->user();
        
        if (!$user) {
            return response()->json(['detail' => 'User not authenticated or token missing.'], 401);
        }

        return new UserProfileResource($user);
    }

    /**
     * PUT /api/profile
     */
    public function updateProfile(Request $request)
    {
        $user = $request->user();

        if (!$user) {
            return response()->json(['detail' => 'User not authenticated.'], 401);
        }

        // Validation
        $validatedData = $request->validate([
            'first_name'   => 'required|string|max:100',
            'last_name'    => 'required|string|max:100',
            'phone_number' => 'required|string|max:20',
            'address'      => 'required|string',
        ]);

        // Direct DB update completely avoiding local object out-of-sync states
        $user->fill($validatedData)->save();

        return new UserProfileResource($user);
    }
}