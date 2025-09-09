<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /**
     * POST /api/auth/register
     * Expects: { name, email, password, password_confirmation }
     * Returns: { message, user }
     */
    public function register(Request $request)
    {
        $data = $request->validate([
            'name'                  => ['required', 'string', 'max:255'],
            'email'                 => ['required', 'email', 'max:255', 'unique:users,email'],
            'password'              => ['required', 'confirmed', Password::min(8)],
        ]);

        $user = User::create([
            'name'     => $data['name'],
            'email'    => $data['email'],
            'password' => Hash::make($data['password']),
        ]);

        // Auto-login newly registered user (session-based SPA)
        Auth::login($user, remember: false);
        $request->session()->regenerate();

        return response()->json([
            'message' => 'Registered',
            'user'    => $user,
        ], 201);
    }

    /**
     * POST /api/auth/login
     * Expects: { email, password, remember? }
     * For SPA: call GET /sanctum/csrf-cookie first
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

        // Prevent session fixation
        $request->session()->regenerate();

        return response()->json([
            'message' => 'Logged in',
            'user'    => Auth::user(),
        ]);
    }

    /**
     * GET /api/auth/me (auth:sanctum)
     */
    public function me(Request $request)
    {
        return response()->json([
            'user' => $request->user(),
        ]);
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

    /**
     * POST /api/auth/token
     * Body: { email, password }
     * Returns: { token, user }
     * No cookies, no CSRF: use Authorization: Bearer <token> afterwards.
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
        $user = $request->user();
        $token = $user->createToken('api')->plainTextToken;

        return response()->json([
            'token' => $token,
            'user'  => $user,
        ]);
    }

    /**
     * POST /api/auth/token/logout (auth:sanctum via token)
     * Revokes the current personal access token.
     */
    public function tokenLogout(Request $request)
    {
        $request->user()->currentAccessToken()?->delete();
        return response()->noContent();
    }
}
