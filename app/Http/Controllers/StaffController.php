<?php

namespace App\Http\Controllers;

use App\Models\Staff;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class StaffController extends Controller
{
    /**
     * GET /api/staff?q=&active=&position=&per_page=
     */
    public function index(Request $request)
    {
        $q        = $request->string('q')->toString();
        $active   = $request->input('active', null);
        $position = $request->string('position')->toString();
        $perPage  = (int) $request->input('per_page', 15);

        $query = Staff::query();

        if ($q !== '') {
            $query->where(function ($w) use ($q) {
                $w->where('first_name', 'like', "%{$q}%")
                  ->orWhere('last_name', 'like', "%{$q}%")
                  ->orWhere('email', 'like', "%{$q}%")
                  ->orWhere('phone', 'like', "%{$q}%");
            });
        }

        if (!is_null($active)) {
            $bool = filter_var($active, FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE);
            if (!is_null($bool)) $query->where('is_active', $bool);
        }

        if ($position !== '') {
            $query->where('position', $position);
        }

        return response()->json($query->orderBy('first_name')->paginate($perPage));
    }

    /**
     * POST /api/staff
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'user_id'    => ['nullable','exists:users,id'],
            'first_name' => ['nullable','string','max:255'],
            'last_name'  => ['nullable','string','max:255'],
            'email'      => ['nullable','email','max:255', 'unique:staff,email'],
            'phone'      => ['nullable','string','max:50'],
            'position'   => ['nullable','string','max:100'],
            'hired_at'   => ['nullable','date'],
            'is_active'  => ['nullable','boolean'],
        ]);

        $staff = Staff::create($data + ['is_active' => $data['is_active'] ?? true]);

        return response()->json($staff, 201);
    }

    /**
     * GET /api/staff/{staff}
     */
    public function show(Staff $staff)
    {
        return response()->json($staff);
    }

    /**
     * PUT /api/staff/{staff}
     */
    public function update(Request $request, Staff $staff)
    {
        $data = $request->validate([
            'user_id'    => ['sometimes','nullable','exists:users,id'],
            'first_name' => ['sometimes','nullable','string','max:255'],
            'last_name'  => ['sometimes','nullable','string','max:255'],
            'email'      => ['sometimes','nullable','email','max:255', Rule::unique('staff','email')->ignore($staff->id)],
            'phone'      => ['sometimes','nullable','string','max:50'],
            'position'   => ['sometimes','nullable','string','max:100'],
            'hired_at'   => ['sometimes','nullable','date'],
            'is_active'  => ['sometimes','boolean'],
        ]);

        $staff->fill($data)->save();

        return response()->json($staff->fresh());
    }

    /**
     * PATCH /api/staff/{staff}/toggle
     */
    public function toggleActive(Staff $staff)
    {
        $staff->is_active = ! $staff->is_active;
        $staff->save();

        return response()->json(['id' => $staff->id, 'is_active' => $staff->is_active]);
    }
}
