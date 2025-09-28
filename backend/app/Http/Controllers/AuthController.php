<?php

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
    protected function augmentUser(User $user)
    {
        $user->load('staff');
        $url = $user->avatar_path ? Storage::disk('public')->url($user->avatar_path) : null;
        $user->setAttribute('avatar_url', $url);
        return $user;
    }

    /* =========================================================
     | Cookie (web guard) registration — used by /register
     ========================================================= */
    public function register(Request $request)
    {
        $data = $request->validate([
            'name'         => ['required', 'string', 'max:255'],
            'email'        => ['required', 'email', 'max:255', 'unique:users,email'],
            'password'     => ['required', 'confirmed', Password::min(8)],
            'account_type' => ['required', 'string', Rule::in(['customer', 'staff'])],
        ]);

        $role = $data['account_type'] === 'staff' ? 'pending' : 'customer';

        $user = User::create([
            'name'     => $data['name'],
            'email'    => $data['email'],
            'password' => Hash::make($data['password']),
            'role'     => $role,
        ]);

        if ($data['account_type'] === 'staff') {
            $nameParts = explode(' ', $data['name'], 2);
            Staff::create([
                'user_id'    => $user->id,
                'first_name' => $nameParts[0],
                'last_name'  => $nameParts[1] ?? '',
                'email'      => $user->email,
                'is_active'  => false,
            ]);

            return response()->json([
                'message' => 'Registration submitted. An admin must approve your account before you can sign in.',
            ], 202);
        }

        // Customer: login immediately (web guard) + regenerate
        Auth::guard('web')->login($user, remember: false);
        $request->session()->regenerate();

        $user = $this->augmentUser($user);

        return response()->json([
            'message' => 'Registered',
            'user'    => $user,
        ], 201);
    }

    /* =========================================================
     | Cookie (web guard) login — used by /login
     ========================================================= */
    public function login(Request $request)
    {
        $credentials = $request->validate([
            'email'    => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        $remember = (bool) $request->boolean('remember');

        if (!Auth::guard('web')->attempt($credentials, $remember)) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        $user = Auth::guard('web')->user();

        if (strtolower($user->role ?? '') === 'pending') {
            Auth::guard('web')->logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();
            throw ValidationException::withMessages([
                'email' => ['Your staff account is pending admin approval.'],
            ]);
        }

        $request->session()->regenerate();

        $user = $this->augmentUser($user);

        return response()->json([
            'message' => 'Logged in',
            'user'    => $user,
        ]);
    }

    /* =========================================================
     | Admin (session) login
     ========================================================= */
    public function adminLogin(Request $request)
    {
        $credentials = $request->validate([
            'email'    => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        $adminEmail    = env('ADMIN_EMAIL', 'admin@yourdomain.com');
        $adminPassword = env('ADMIN_PASSWORD', 'secureAdminPassword123');

        $user = User::firstOrCreate(
            ['email' => $adminEmail],
            [
                'name'     => 'Admin User',
                'password' => Hash::make($adminPassword),
                'role'     => 'admin',
            ]
        );

        if ($credentials['email'] === $adminEmail && Hash::check($credentials['password'], $user->password)) {
            Auth::guard('web')->login($user, remember: false);
            $request->session()->regenerate();

            $user = $this->augmentUser($user);

            return response()->json([
                'message' => 'Admin logged in',
                'user'    => $user,
            ]);
        }

        throw ValidationException::withMessages([
            'email' => ['Invalid admin credentials.'],
        ]);
    }

    /* =========================================================
     | Me / Logout (work with cookie session OR token)
     ========================================================= */
    public function me(Request $request)
    {
        $user = $request->user(); // sanctum (token or session)
        if (!$user) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }
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

    /* =========================================================
     | TOKEN login (stateless) — used by POST /api/token-login
     | Does NOT start a session; returns Sanctum PAT
     ========================================================= */
    public function tokenLogin(Request $request)
    {
        $data = $request->validate([
            'email'    => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        $user = User::where('email', $data['email'])->first();

        if (!$user || !Hash::check($data['password'], $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['Invalid credentials.'],
            ]);
        }

        if (strtolower($user->role ?? '') === 'pending') {
            throw ValidationException::withMessages([
                'email' => ['Your staff account is pending admin approval.'],
            ]);
        }

        $user  = $this->augmentUser($user);
        $token = $user->createToken('api')->plainTextToken;

        return response()->json([
            'token' => $token,
            'user'  => $user,
        ]);
    }

    public function tokenLogout(Request $request)
    {
        $request->user()->currentAccessToken()?->delete();
        return response()->noContent();
    }

    /* =========================================================
     | TOKEN register (stateless) — used by POST /api/token-register
     | Staff → 202 pending, Customer → returns PAT + user
     ========================================================= */
    public function tokenRegister(Request $request)
    {
        $data = $request->validate([
            'name'         => ['required', 'string', 'max:255'],
            'email'        => ['required', 'email', 'max:255', 'unique:users,email'],
            'password'     => ['required', 'confirmed', Password::min(8)],
            'account_type' => ['required', 'string', Rule::in(['customer', 'staff'])],
        ]);

        $role = $data['account_type'] === 'staff' ? 'pending' : 'customer';

        $user = User::create([
            'name'     => $data['name'],
            'email'    => $data['email'],
            'password' => Hash::make($data['password']),
            'role'     => $role,
        ]);

        if ($data['account_type'] === 'staff') {
            $nameParts = explode(' ', $data['name'], 2);
            Staff::create([
                'user_id'    => $user->id,
                'first_name' => $nameParts[0],
                'last_name'  => $nameParts[1] ?? '',
                'email'      => $user->email,
                'is_active'  => false,
            ]);

            return response()->json([
                'message' => 'Registration submitted. An admin must approve your account before you can sign in.',
                'status'  => 'pending',
            ], 202);
        }

        // Customer → issue token
        $user  = $this->augmentUser($user);
        $token = $user->createToken('api')->plainTextToken;

        return response()->json([
            'message' => 'Registered',
            'token'   => $token,
            'user'    => $user,
        ], 201);
    }

    /* =========================================================
     | Profile update
     ========================================================= */
    public function updateMe(Request $request)
    {
        $user = $request->user();

        $data = $request->validate([
            'name'        => ['sometimes', 'string', 'max:255'],
            'email'       => ['sometimes', 'email', 'max:255', Rule::unique('users', 'email')->ignore($user->id)],
            'contact_no'  => ['sometimes', 'nullable', 'string', 'max:50'],
            'password'    => ['sometimes', 'nullable', 'confirmed', Password::min(8)],
            'avatar'      => ['sometimes', 'file', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
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
            'user'    => $user,
        ]);
    }
}
