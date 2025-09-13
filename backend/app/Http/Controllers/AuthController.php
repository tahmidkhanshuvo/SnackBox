<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Staff; // Import the Staff model
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage; // for avatar storage
use Illuminate\Validation\Rule; // Import the Rule class for validation
use Illuminate\Validation\Rules\Password;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /**
     * Helper: enrich a user model with staff and avatar_url.
     * Returns the Eloquent model (so returning it as JSON yields a plain object).
     */
    protected function augmentUser(User $user): User
    {
        $user->load('staff');
        // Attach computed URL without needing an accessor on the model
        $url = $user->avatar_path ? Storage::disk('public')->url($user->avatar_path) : null;
        $user->setAttribute('avatar_url', $url);
        return $user;
    }

    /**
     * POST /api/auth/register
     * Expects: { name, email, password, password_confirmation, account_type }
     * Returns: { message, user }
     */
    public function register(Request $request)
    {
        $data = $request->validate([
            'name'         => ['required', 'string', 'max:255'],
            'email'        => ['required', 'email', 'max:255', 'unique:users,email'],
            'password'     => ['required', 'confirmed', Password::min(8)],
            'account_type' => ['required', 'string', Rule::in(['customer', 'staff'])],
        ]);

        $user = User::create([
            'name'     => $data['name'],
            'email'    => $data['email'],
            'password' => Hash::make($data['password']),
        ]);

        // Create a Staff record if the account type is 'staff'
        if ($data['account_type'] === 'staff') {
            $nameParts = explode(' ', $data['name'], 2);
            Staff::create([
                'user_id'    => $user->id,
                'first_name' => $nameParts[0],
                'last_name'  => $nameParts[1] ?? '',
                'email'      => $user->email,
                'is_active'  => true,
            ]);
        }

        // Auto-login
        Auth::login($user, remember: false);
        $request->session()->regenerate();

        $user = $this->augmentUser($user);

        return response()->json([
            'message' => 'Registered',
            'user'    => $user,
        ], 201);
    }

    /**
     * POST /api/auth/login
     */
    public function login(Request $request)
    {
        $credentials = $request->validate([
            'email'    => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        $remember = (bool) $request->boolean('remember');

        if (! Auth::attempt($credentials, $remember)) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        $request->session()->regenerate();

        /** @var \App\Models\User $user */
        $user = Auth::user();

        $user = $this->augmentUser($user);

        return response()->json([
            'message' => 'Logged in',
            'user'    => $user,
        ]);
    }

    /**
     * GET /api/auth/me (auth:sanctum)
     * Also aliased as GET /api/me
     */
    public function me(Request $request)
    {
        /** @var \App\Models\User $user */
        $user = $request->user();

        $user = $this->augmentUser($user);

        // Return as a plain object for SPA convenience
        return response()->json($user);
    }

    /**
     * POST /api/auth/logout (auth:sanctum)
     */
    public function logout(Request $request)
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return response()->noContent();
    }

    // --- Token-based methods remain unchanged ---

    /**
     * POST /api/auth/token
     */
    public function tokenLogin(Request $request)
    {
        $data = $request->validate([
            'email'    => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        if (! Auth::attempt($data, remember: false)) {
            throw ValidationException::withMessages([
                'email' => ['Invalid credentials.'],
            ]);
        }

        /** @var \App\Models\User $user */
        $user = Auth::user();
        $user = $this->augmentUser($user);
        $token = $user->createToken('api')->plainTextToken;

        return response()->json([
            'token' => $token,
            'user'  => $user,
        ]);
    }

    /**
     * POST /api/auth/token/logout (auth:sanctum via token)
     */
    public function tokenLogout(Request $request)
    {
        $request->user()->currentAccessToken()?->delete();
        return response()->noContent();
    }

    /**
     * PATCH /api/auth/me (auth:sanctum)
     * Accepts JSON or multipart/form-data. For image upload use field name 'avatar'.
     * Returns: { message, user }
     */
    public function updateMe(Request $request)
    {
        /** @var \App\Models\User $user */
        $user = $request->user();

        // Validate text fields
        $data = $request->validate([
            'name'        => ['sometimes', 'string', 'max:255'],
            'email'       => ['sometimes', 'email', 'max:255', Rule::unique('users','email')->ignore($user->id)],
            'contact_no'  => ['sometimes', 'nullable', 'string', 'max:50'],
            'password'    => ['sometimes', 'nullable', 'confirmed', Password::min(8)],
            // Validate image ONLY if present
            'avatar'      => ['sometimes', 'file', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048'], // 2MB
        ]);

        // Hash password if provided (non-empty)
        if (!empty($data['password'])) {
            $data['password'] = Hash::make($data['password']);
        } else {
            unset($data['password']);
        }

        // Save non-file fields first
        if (!empty($data)) {
            // Avoid passing 'avatar' into fill()
            $user->fill(collect($data)->except('avatar')->toArray())->save();
        }

        // Handle avatar upload (if any)
        if ($request->hasFile('avatar')) {
            $file = $request->file('avatar');

            // Delete old avatar if it exists
            if ($user->avatar_path && Storage::disk('public')->exists($user->avatar_path)) {
                Storage::disk('public')->delete($user->avatar_path);
            }

            $path = $file->store('avatars', 'public'); // storage/app/public/avatars/...
            $user->avatar_path = $path;
            $user->save();
        }

        $user = $this->augmentUser($user);

        return response()->json([
            'message' => 'Updated',
            'user'    => $user,
        ]);
    }
}
