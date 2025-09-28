<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Staff;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

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
                  ->orWhereHas('staff', fn ($sq) => $sq->where('is_active', false));
            })
            ->orderByDesc('created_at')
            ->get()
            ->map(function (User $u) {
                return [
                    'id'          => $u->id,
                    'name'        => $u->name,
                    'email'       => $u->email,
                    'role'        => $u->role,
                    'created_at'  => $u->created_at,
                    'avatar_url'  => $u->avatar_url, // accessor from User model
                    'staff'       => $u->staff ? [
                        'id'         => $u->staff->id,
                        'is_active'  => (bool) $u->staff->is_active,
                        'first_name' => $u->staff->first_name,
                        'last_name'  => $u->staff->last_name,
                    ] : null,
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
        /** @var \App\Models\User $user */
        $user = DB::transaction(function () use ($id) {
            $user = User::with('staff')->lockForUpdate()->findOrFail($id);

            $role = strtolower((string) ($user->role ?? ''));
            if (in_array($role, ['admin', 'superadmin'], true)) {
                abort(response()->json(['message' => 'Cannot approve an admin user'], 400));
            }

            // Ensure staff row exists, then activate it
            if (!$user->staff) {
                $nameParts = explode(' ', (string) $user->name, 2);
                $user->setRelation('staff', Staff::create([
                    'user_id'    => $user->id,
                    'first_name' => $nameParts[0] ?? '',
                    'last_name'  => $nameParts[1] ?? '',
                    'email'      => $user->email,
                    'is_active'  => true,
                ]));
            } else {
                $user->staff->is_active = true;
                $user->staff->save();
            }

            // Normalize role
            if ($role === 'pending' || $role === '' || $role === null) {
                $user->role = 'staff';
            }

            if (Schema::hasColumn('users', 'approved_at')) {
                $user->approved_at = now();
            }

            $user->save();

            return $user->fresh('staff');
        });

        return response()->json([
            'message' => 'User approved successfully',
            'user'    => $user, // includes avatar_url & display_name via appends
        ]);
    }

    public function adminMenuItems()
    {
        $menuItems = \App\Models\MenuItem::query()->latest()->get();
        return response()->json($menuItems);
    }

    public function adminOrders()
    {
        $orders = \App\Models\Order::with([
                'user:id,name,email',
                'items.menuItem',
            ])
            ->latest()
            ->get();

        return response()->json($orders);
    }
}
