<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

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
        $user = $request->user();

        $request->merge([
            'email' => Str::lower(trim((string) $request->input('email'))),
        ]);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => [
                'required',
                'email',
                'max:255',
                Rule::unique('users', 'email')->ignore($user->id),
            ],
            'avatar' => 'nullable|file|image|mimes:jpg,jpeg,png,webp|max:2048',
        ]);

        $user->name = $validated['name'];

        if (Str::lower(trim((string) $user->email)) !== $validated['email']) {
            $user->email = $validated['email'];
            $user->email_verified_at = null;
        }

        if ($request->hasFile('avatar')) {

              
                                         
               
            if ($user->profile_picture) {
                $oldFile = public_path($user->profile_picture);

                if (file_exists($oldFile)) {
                    unlink($oldFile);
                }
            }

              
                                
               
            $file = $request->file('avatar');

              
                                     
               
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

              
                      
                                     
               
            $destination = public_path('storage/avatars');

            if (!is_dir($destination)) {
                mkdir($destination, 0755, true);
            }

              
                                  
               
            $file->move(
                $destination,
                $fileName
            );

              
                                   
               
            $user->profile_picture =
                '/storage/avatars/' . $fileName;
        }

        $user->save();

        return response()->json([
            'message' => 'Profile updated successfully.',
            'user' => $user->fresh(),
        ]);
    }

    public function changePassword(Request $request)
    {
        $validated = $request->validate([
            'current_password' => ['required', 'current_password'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        $request->user()->update([
            'password' => Hash::make($validated['password']),
        ]);

        return response()->json([
            'message' => 'Password changed successfully.',
        ]);
    }
}
