<?php

// app/Http/Controllers/AdminController.php
namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Staff;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AdminController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth:sanctum');
        $this->middleware(function ($request, $next) {
            if (Auth::user()->role !== 'admin') {
                return response()->json(['message' => 'Unauthorized'], 403);
            }
            return $next($request);
        });
    }

    public function pendingUsers()
    {
        $pendingUsers = User::where('role', 'pending')
            ->with('staff')
            ->get()
            ->map(function ($user) {
                $user->setAttribute('avatar_url', $user->avatar_path ? Storage::disk('public')->url($user->avatar_path) : null);
                return $user;
            });
        return response()->json($pendingUsers);
    }

    public function approveUser($id)
    {
        $user = User::findOrFail($id);
        if ($user->role !== 'pending') {
            return response()->json(['message' => 'User is not pending approval'], 400);
        }

        $user->role = 'staff';
        $user->approved_at = now();
        $user->save();

        $staff = Staff::firstOrCreate(
            ['user_id' => $user->id],
            ['first_name' => explode(' ', $user->name)[0], 'last_name' => explode(' ', $user->name, 2)[1] ?? '', 'email' => $user->email, 'is_active' => true]
        );
        $staff->is_active = true;
        $staff->save();

        $user = $this->augmentUser($user);

        return response()->json(['message' => 'User approved successfully', 'user' => $user]);
    }

    public function adminMenuItems()
    {
        $menuItems = \App\Models\MenuItem::all(); // Adjust filtering if needed
        return response()->json($menuItems);
    }

    public function adminOrders()
    {
        $orders = \App\Models\Order::with('user', 'items')->get(); // Adjust filtering if needed
        return response()->json($orders);
    }

    protected function augmentUser(User $user): User
    {
        $user->load('staff');
        $url = $user->avatar_path ? Storage::disk('public')->url($user->avatar_path) : null;
        $user->setAttribute('avatar_url', $url);
        return $user;
    }
}