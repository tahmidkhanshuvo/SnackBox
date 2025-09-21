<?php

// app/Http/Controllers/AuthController.php
namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Staff;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    protected function augmentUser(User $user): User
    {
        $user->load('staff');
        $url = $user->avatar_path ? Storage::disk('public')->url($user->avatar_path) : null;
        $user->setAttribute('avatar_url', $url);
        return $user;
    }

    public function register(Request $request)
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'confirmed', Password::min(8)],
            'account_type' => ['required', 'string', Rule::in(['customer', 'staff'])],
        ]);

        $user = User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => Hash::make($data['password']),
        ]);

        if ($data['account_type'] === 'staff') {
            $nameParts = explode(' ', $data['name'], 2);
            Staff::create([
                'user_id' => $user->id,
                'first_name' => $nameParts[0],
                'last_name' => $nameParts[1] ?? '',
                'email' => $user->email,
                'is_active' => true,
            ]);
        }

        Auth::login($user, remember: false);
        $request->session()->regenerate();

        $user = $this->augmentUser($user);

        return response()->json([
            'message' => 'Registered',
            'user' => $user,
        ], 201);
    }

    public function login(Request $request)
    {
        $credentials = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        $remember = (bool) $request->boolean('remember');

        if (!Auth::attempt($credentials, $remember)) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        $request->session()->regenerate();

        $user = Auth::user();
        $user = $this->augmentUser($user);

        return response()->json([
            'message' => 'Logged in',
            'user' => $user,
        ]);
    }

    public function adminLogin(Request $request)
    {
        $credentials = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        // Get admin credentials from .env
        $adminEmail = env('ADMIN_EMAIL', 'admin@example.com'); // Default for testing
        $adminPassword = env('ADMIN_PASSWORD', 'admin123');    // Default for testing

        if ($credentials['email'] === $adminEmail && $credentials['password'] === $adminPassword) {
            $user = User::firstOrCreate(
                ['email' => $adminEmail],
                [
                    'name' => 'Admin User',
                    'password' => Hash::make($adminPassword),
                    'role' => 'admin',
                ]
            );
            Auth::login($user, remember: false);
            $request->session()->regenerate();
            $user = $this->augmentUser($user);

            return response()->json([
                'message' => 'Admin logged in',
                'user' => $user,
            ]);
        }

        throw ValidationException::withMessages([
            'email' => ['Invalid admin credentials.'],
        ]);
    }

    public function me(Request $request)
    {
        $user = $request->user();
        $user = $this->augmentUser($user);
        return response()->json($user);
    }

    public function logout(Request $request)
    {
        Auth::guard('web')->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();
        return response()->noContent();
    }

    public function tokenLogin(Request $request)
    {
        $data = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        if (!Auth::attempt($data, remember: false)) {
            throw ValidationException::withMessages([
                'email' => ['Invalid credentials.'],
            ]);
        }

        $user = Auth::user();
        $user = $this->augmentUser($user);
        $token = $user->createToken('api')->plainTextToken;

        return response()->json([
            'token' => $token,
            'user' => $user,
        ]);
    }

    public function tokenLogout(Request $request)
    {
        $request->user()->currentAccessToken()?->delete();
        return response()->noContent();
    }

    public function updateMe(Request $request)
    {
        $user = $request->user();

        $data = $request->validate([
            'name' => ['sometimes', 'string', 'max:255'],
            'email' => ['sometimes', 'email', 'max:255', Rule::unique('users', 'email')->ignore($user->id)],
            'contact_no' => ['sometimes', 'nullable', 'string', 'max:50'],
            'password' => ['sometimes', 'nullable', 'confirmed', Password::min(8)],
            'avatar' => ['sometimes', 'file', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
        ]);

        if (!empty($data['password'])) {
            $data['password'] = Hash::make($data['password']);
        } else {
            unset($data['password']);
        }

        if (!empty($data)) {
            $user->fill(collect($data)->except('avatar')->toArray())->save();
        }

        if ($request->hasFile('avatar')) {
            if ($user->avatar_path && Storage::disk('public')->exists($user->avatar_path)) {
                Storage::disk('public')->delete($user->avatar_path);
            }
            $path = $request->file('avatar')->store('avatars', 'public');
            $user->avatar_path = $path;
            $user->save();
        }

        $user = $this->augmentUser($user);

        return response()->json([
            'message' => 'Updated',
            'user' => $user,
        ]);
    }
}