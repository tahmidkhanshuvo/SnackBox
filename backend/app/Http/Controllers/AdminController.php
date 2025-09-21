<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Staff;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class AdminController extends Controller
{
    /**
     * Users awaiting approval:
     * - role = 'pending' OR
     * - has Staff row with is_active = false
     */
    public function pendingUsers()
    {
        $pending = User::with('staff')
            ->where(function ($q) {
                $q->where('role', 'pending')
                  ->orWhereHas('staff', fn($sq) => $sq->where('is_active', false));
            })
            ->orderByDesc('created_at')
            ->get()
            ->map(function (User $u) {
                $u->setAttribute(
                    'avatar_url',
                    $u->avatar_path ? Storage::disk('public')->url($u->avatar_path) : null
                );
                return [
                    'id'          => $u->id,
                    'name'        => $u->name,
                    'email'       => $u->email,
                    'role'        => $u->role,
                    'created_at'  => $u->created_at,
                    'staff'       => $u->staff ? [
                        'id'         => $u->staff->id,
                        'is_active'  => (bool) $u->staff->is_active,
                        'first_name' => $u->staff->first_name,
                        'last_name'  => $u->staff->last_name,
                    ] : null,
                    'avatar_url'  => $u->getAttribute('avatar_url'),
                ];
            });

        return response()->json($pending);
    }

    /**
     * Approve a pending user:
     * - set role => 'staff' if 'pending' or null
     * - ensure Staff row exists and set is_active => true
     */
    public function approveUser($id)
    {
        /** @var User $user */
        $user = User::with('staff')->findOrFail($id);

        $role = strtolower((string) ($user->role ?? ''));
        if (in_array($role, ['admin', 'superadmin'], true)) {
            return response()->json(['message' => 'Cannot approve an admin user'], 400);
        }

        // Ensure staff row exists
        if (!$user->staff) {
            $nameParts = explode(' ', $user->name, 2);
            $user->setRelation('staff', Staff::create([
                'user_id'    => $user->id,
                'first_name' => $nameParts[0] ?? '',
                'last_name'  => $nameParts[1] ?? '',
                'email'      => $user->email,
                'is_active'  => false,
            ]));
        }

        // Activate staff and normalize role
        $user->staff->is_active = true;
        $user->staff->save();

        if ($role === 'pending' || $role === '' || $role === null) {
            $user->role = 'staff';
        }
        if (schema_has_column('users', 'approved_at')) {
            $user->approved_at = now();
        }
        $user->save();

        $user->load('staff');
        $user = $this->augmentUser($user);

        return response()->json([
            'message' => 'User approved successfully',
            'user'    => $user,
        ]);
    }

    public function adminMenuItems()
    {
        $menuItems = \App\Models\MenuItem::query()->latest()->get();
        return response()->json($menuItems);
    }

    public function adminOrders()
    {
        $orders = \App\Models\Order::with(['user', 'items'])->latest()->get();
        return response()->json($orders);
    }

    /**
     * Attach avatar_url and preload staff.
     */
    protected function augmentUser(User $user): User
    {
        $user->load('staff');
        $url = $user->avatar_path ? Storage::disk('public')->url($user->avatar_path) : null;
        $user->setAttribute('avatar_url', $url);
        return $user;
    }
}

/**
 * Tiny helper to check column existence safely without importing Schema in signature.
 */
if (!function_exists('schema_has_column')) {
    function schema_has_column(string $table, string $column): bool
    {
        try {
            return \Illuminate\Support\Facades\Schema::hasColumn($table, $column);
        } catch (\Throwable $e) {
            return false;
        }
    }
}
