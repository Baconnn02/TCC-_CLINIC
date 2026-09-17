<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json([
                'message' => 'Invalid email or password.'
            ], 401);
        }

        $token = $user->createToken(
            'clinic-system-token'
        )->plainTextToken;

        return response()->json([
            'message' => 'Login successful.',
            'token' => $token,
            'user' => $user,
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()
            ->currentAccessToken()
            ->delete();

        return response()->json([
            'message' => 'Logged out successfully.'
        ]);
    }

    public function me(Request $request)
    {
        return response()->json([
            'user' => $request->user()
        ]);
    }

    public function updateProfile(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'role' => 'nullable|string|max:255',
            'avatar' => 'nullable|file|image|mimes:jpg,jpeg,png,webp|max:2048',
        ]);

        $user = $request->user();

        $user->name = $request->input('name');
        $user->role = $request->input('role');

        if ($request->hasFile('avatar')) {

            /*
             * Delete old profile picture
             */
            if ($user->profile_picture) {
                $oldFile = public_path($user->profile_picture);

                if (file_exists($oldFile)) {
                    unlink($oldFile);
                }
            }

            /*
             * Get uploaded file
             */
            $file = $request->file('avatar');

            /*
             * Create unique filename
             */
            $extension = strtolower(
                $file->getClientOriginalExtension()
            );

            $fileName =
                'avatar_' .
                $user->id .
                '_' .
                time() .
                '.' .
                $extension;

            /*
             * Create:
             * public/storage/avatars
             */
            $destination = public_path('storage/avatars');

            if (!is_dir($destination)) {
                mkdir($destination, 0755, true);
            }

            /*
             * Move uploaded image
             */
            $file->move(
                $destination,
                $fileName
            );

            /*
             * Save URL in database
             */
            $user->profile_picture =
                '/storage/avatars/' . $fileName;
        }

        $user->save();

        return response()->json([
            'message' => 'Profile updated successfully.',
            'user' => $user->fresh(),
        ]);
    }
}