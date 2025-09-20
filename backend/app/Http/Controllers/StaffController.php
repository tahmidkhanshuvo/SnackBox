<?php

namespace App\Http\Controllers;

use App\Models\Staff;
use App\Models\StaffShift;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Carbon\Carbon;

class StaffController extends Controller
{
    /**
     * GET /api/staff?q=&active=&position=&shift_id=&per_page=
     */
    public function index(Request $request)
    {
        $q         = $request->string('q')->toString();
        $active    = $request->input('active', null);
        $position  = $request->string('position')->toString();
        $shiftId   = $request->input('shift_id', null);
        $perPage   = (int) $request->input('per_page', 15);

        $query = Staff::query()->with('shift');

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
            if (!is_null($bool)) {
                $query->where('is_active', $bool);
            }
        }

        if ($position !== '') {
            $query->where('position', $position);
        }

        if (!is_null($shiftId) && $shiftId !== '') {
            $query->where('shift_id', (int) $shiftId);
        }

        return response()->json(
            $query->orderBy('first_name')->paginate($perPage)
        );
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
            'shift_id'   => ['nullable','integer','exists:shifts,id'],
        ]);

        $staff = Staff::create($data + ['is_active' => $data['is_active'] ?? true]);

        return response()->json($staff->load('shift'), 201);
    }

    /**
     * GET /api/staff/{staff}
     */
    public function show(Staff $staff)
    {
        return response()->json($staff->load('shift'));
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
            'shift_id'   => ['sometimes','nullable','integer','exists:shifts,id'],
        ]);

        $staff->fill($data)->save();

        return response()->json($staff->fresh()->load('shift'));
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

    /**
     * GET /api/staff/{staff}/shifts?week=
     * Fetches staff shifts for a specific week.
     */
    public function shifts(Request $request, Staff $staff)
    {
        $week = $request->input('week'); // YYYY-MM-DD format
        if (!$week) {
            return response()->json(['message' => 'Week parameter is required'], 400);
        }

        $startDate = Carbon::parse($week);
        $endDate = $startDate->copy()->addDays(6);

        $shifts = $staff->staffShifts()
            ->with('shift')
            ->whereBetween('date', [$startDate, $endDate])
            ->orderBy('date')
            ->get();

        return response()->json($shifts);
    }
}