<?php

namespace App\Http\Controllers;

use App\Models\Shift;
use App\Models\StaffShift;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Log;

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
            'name'      => ['required','string','max:100','unique:shifts,name'],
            'starts_at' => ['required','date_format:H:i:s'],
            'ends_at'   => ['required','date_format:H:i:s'],
            'is_active' => ['sometimes','boolean'],
        ]);

        $shift = Shift::create($data + ['is_active' => $data['is_active'] ?? true]);

        return response()->json($shift, 201);
    }

    /**
     * GET /api/shifts/{shift}
     */
    public function show(Shift $shift)
    {
        return response()->json($shift);
    }

    /**
     * PUT /api/shifts/{shift}
     */
    public function update(Request $request, Shift $shift)
    {
        $data = $request->validate([
            'name'      => ['sometimes','required','string','max:100', Rule::unique('shifts','name')->ignore($shift->id)],
            'starts_at' => ['sometimes','required','date_format:H:i:s'],
            'ends_at'   => ['sometimes','required','date_format:H:i:s'],
            'is_active' => ['sometimes','boolean'],
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

    /* ---------------------------------------------------------
       Attendance actions below operate on StaffShift ID only
       Route: PATCH /api/shifts/{shiftShiftId}/<action>
       --------------------------------------------------------- */

    /**
     * PATCH /api/shifts/{staffShift}/accept
     */
    public function accept(Request $request, $staffShift)
    {
        $user = $request->user();
        if (! $user) return response()->json(['message' => 'Unauthorized'], 401);

        $staffId = $user->staff->id ?? null;
        if (! $staffId) return response()->json(['message' => 'Only staff can accept shifts'], 403);

        $ss = StaffShift::find($staffShift);
        if (! $ss || $ss->staff_id !== $staffId) {
            return response()->json(['message' => 'No assignment found for this shift'], 404);
        }

        if ($ss->status !== 'assigned') {
            return response()->json(['message' => 'Shift can only be accepted if assigned'], 400);
        }

        $ss->update(['status' => 'accepted']);
        Log::info("Shift accepted", ['staff_shift_id' => $ss->id, 'staff_id' => $staffId]);

        return response()->json(['message' => 'Shift accepted successfully']);
    }

    /**
     * PATCH /api/shifts/{staffShift}/mark-late
     */
    public function markLate(Request $request, $staffShift)
    {
        $user = $request->user();
        if (! $user) return response()->json(['message' => 'Unauthorized'], 401);

        $staffId = $user->staff->id ?? null;
        if (! $staffId) return response()->json(['message' => 'Only staff can update attendance'], 403);

        $ss = StaffShift::find($staffShift);
        if (! $ss || $ss->staff_id !== $staffId) {
            return response()->json(['message' => 'No assignment found for this shift'], 404);
        }

        if ($ss->status !== 'accepted') {
            return response()->json(['message' => 'Can mark late only from accepted status'], 400);
        }

        $ss->update(['status' => 'late']);
        Log::info("Shift marked late", ['staff_shift_id' => $ss->id, 'staff_id' => $staffId]);

        return response()->json(['message' => 'Shift marked as late']);
    }

    /**
     * PATCH /api/shifts/{staffShift}/mark-absent
     */
    public function markAbsent(Request $request, $staffShift)
    {
        $user = $request->user();
        if (! $user) return response()->json(['message' => 'Unauthorized'], 401);

        $staffId = $user->staff->id ?? null;
        if (! $staffId) return response()->json(['message' => 'Only staff can update attendance'], 403);

        $ss = StaffShift::find($staffShift);
        if (! $ss || $ss->staff_id !== $staffId) {
            return response()->json(['message' => 'No assignment found for this shift'], 404);
        }

        if ($ss->status !== 'accepted') {
            return response()->json(['message' => 'Can mark absent only from accepted status'], 400);
        }

        $ss->update(['status' => 'absent']);
        Log::info("Shift marked absent", ['staff_shift_id' => $ss->id, 'staff_id' => $staffId]);

        return response()->json(['message' => 'Shift marked as absent']);
    }

    /**
     * PATCH /api/shifts/{staffShift}/request-change
     * Body: { reason?: string }   (reason is logged for now)
     */
    public function requestChange(Request $request, $staffShift)
    {
        $user = $request->user();
        if (! $user) return response()->json(['message' => 'Unauthorized'], 401);

        $staffId = $user->staff->id ?? null;
        if (! $staffId) return response()->json(['message' => 'Only staff can request changes'], 403);

        $ss = StaffShift::find($staffShift);
        if (! $ss || $ss->staff_id !== $staffId) {
            return response()->json(['message' => 'No assignment found for this shift'], 404);
        }

        if (! in_array($ss->status, ['assigned','accepted'], true)) {
            return response()->json(['message' => 'Shift can only be changed if assigned or accepted'], 400);
        }

        $reason = trim((string) $request->input('reason', ''));
        if ($reason !== '') {
            Log::info("Shift change requested", [
                'staff_shift_id' => $ss->id,
                'staff_id'       => $staffId,
                'reason'         => $reason
            ]);
        }

        $ss->update(['status' => 'requested_change']);
        return response()->json(['message' => 'Change request submitted successfully']);
    }
}
