<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Staff; // Import the Staff model
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule; // Import the Rule class for validation
use Illuminate\Validation\Rules\Password;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /**
     * POST /api/auth/register
     * Expects: { name, email, password, password_confirmation, account_type }
     * Returns: { message, user }
     */
    public function register(Request $request)
    {
        $data = $request->validate([
            'name'                  => ['required', 'string', 'max:255'],
            'email'                 => ['required', 'email', 'max:255', 'unique:users,email'],
            'password'              => ['required', 'confirmed', Password::min(8)],
            // Add validation for the account type from the frontend form
            'account_type'          => ['required', 'string', Rule::in(['customer', 'staff'])],
        ]);

        $user = User::create([
            'name'     => $data['name'],
            'email'    => $data['email'],
            'password' => Hash::make($data['password']),
        ]);

        // --- NEW LOGIC: Create a Staff record if the account type is 'staff' ---
        if ($data['account_type'] === 'staff') {
            // Split the full name into first and last names for the staff record
            $nameParts = explode(' ', $data['name'], 2);

            Staff::create([
                'user_id'    => $user->id,
                'first_name' => $nameParts[0],
                'last_name'  => $nameParts[1] ?? '', // Handle cases with only a first name
                'email'      => $user->email,
                'is_active'  => true, // Set staff as active by default
            ]);
        }
        
        // Auto-login newly registered user
        Auth::login($user, remember: false);
        $request->session()->regenerate();

        // Eager load the 'staff' relationship so the frontend knows the user's role
        $user->load('staff');

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

        // Eager load the 'staff' relationship on login
        $user->load('staff');

        return response()->json([
            'message' => 'Logged in',
            'user'    => $user,
        ]);
    }

    /**
     * GET /api/auth/me (auth:sanctum)
     */
    public function me(Request $request)
    {
        /** @var \App\Models\User $user */
        $user = $request->user();

        // Eager load the 'staff' relationship when checking the session
        $user->load('staff');

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
        $user->load('staff'); // Also load staff relationship for token login
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
}
