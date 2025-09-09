<?php

namespace App\Http\Controllers;

use App\Models\Shift;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class ShiftController extends Controller
{
    /**
     * GET /api/shifts?active=&q=&per_page=
     */
    public function index(Request $request)
    {
        $q       = $request->string('q')->toString();
        $active  = $request->input('active', null);
        $perPage = (int) $request->input('per_page', 15);

        $query = Shift::query();

        if ($q !== '') {
            $query->where('name', 'like', "%{$q}%");
        }

        if (!is_null($active)) {
            $bool = filter_var($active, FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE);
            if (!is_null($bool)) {
                $query->where('is_active', $bool);
            }
        }

        return response()->json($query->orderBy('name')->paginate($perPage));
    }

    /**
     * POST /api/shifts
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'name'      => ['required', 'string', 'max:100', 'unique:shifts,name'],
            'starts_at' => ['required', 'date_format:H:i:s'],
            'ends_at'   => ['required', 'date_format:H:i:s'],
            'is_active' => ['sometimes', 'boolean'],
        ]);

        $shift = Shift::create($data + ['is_active' => $data['is_active'] ?? true]);

        return response()->json($shift, 201);
    }

    /**
     * GET /api/shifts/{shift}
     */
    public function show(Shift $shift)
    {
        // Optionally eager-load staff counts later
        return response()->json($shift);
    }

    /**
     * PUT /api/shifts/{shift}
     */
    public function update(Request $request, Shift $shift)
    {
        $data = $request->validate([
            'name'      => ['sometimes', 'required', 'string', 'max:100', Rule::unique('shifts','name')->ignore($shift->id)],
            'starts_at' => ['sometimes', 'required', 'date_format:H:i:s'],
            'ends_at'   => ['sometimes', 'required', 'date_format:H:i:s'],
            'is_active' => ['sometimes', 'boolean'],
        ]);

        $shift->fill($data)->save();

        return response()->json($shift->fresh());
    }

    /**
     * PATCH /api/shifts/{shift}/toggle
     */
    public function toggleActive(Shift $shift)
    {
        $shift->is_active = ! $shift->is_active;
        $shift->save();

        return response()->json(['id' => $shift->id, 'is_active' => $shift->is_active]);
    }
}
