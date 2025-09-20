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
        $q = $request->string('q')->toString();
        $active = $request->input('active', null);
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
            'name' => ['required', 'string', 'max:100', 'unique:shifts,name'],
            'starts_at' => ['required', 'date_format:H:i:s'],
            'ends_at' => ['required', 'date_format:H:i:s'],
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
        return response()->json($shift);
    }

    /**
     * PUT /api/shifts/{shift}
     */
    public function update(Request $request, Shift $shift)
    {
        $data = $request->validate([
            'name' => ['sometimes', 'required', 'string', 'max:100', Rule::unique('shifts', 'name')->ignore($shift->id)],
            'starts_at' => ['sometimes', 'required', 'date_format:H:i:s'],
            'ends_at' => ['sometimes', 'required', 'date_format:H:i:s'],
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
        $shift->is_active = !$shift->is_active;
        $shift->save();

        return response()->json(['id' => $shift->id, 'is_active' => $shift->is_active]);
    }

    /**
     * PATCH /api/shifts/{shift}/mark-late
     */
    public function markLate(Request $request, $shift)
    {
        $staffId = $request->user()->staff_id ?? $request->user()->staff->id;
        if (!$request->user()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $date = $request->input('date');
        if (!$date) {
            return response()->json(['message' => 'Date is required'], 400);
        }

        Log::info("Marking late: staff_id={$staffId}, staff_shift_id={$shift}, date={$date}");

        $staffShift = StaffShift::where('id', $shift)
            ->where('staff_id', $staffId)
            ->where('date', $date)
            ->first();

        if (!$staffShift) {
            Log::warning("No StaffShift found for id={$shift}, staff_id={$staffId}, date={$date}");
            return response()->json(['message' => 'No assignment found for this shift and date'], 404);
        }

        $staffShift->update(['status' => 'late']);
        return response()->json(['message' => 'Shift marked as late']);
    }

    /**
     * PATCH /api/shifts/{shift}/mark-absent
     */
    public function markAbsent(Request $request, $shift)
    {
        $staffId = $request->user()->staff_id ?? $request->user()->staff->id;
        if (!$request->user()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $date = $request->input('date');
        if (!$date) {
            return response()->json(['message' => 'Date is required'], 400);
        }

        Log::info("Marking absent: staff_id={$staffId}, staff_shift_id={$shift}, date={$date}");

        $staffShift = StaffShift::where('id', $shift)
            ->where('staff_id', $staffId)
            ->where('date', $date)
            ->first();

        if (!$staffShift) {
            Log::warning("No StaffShift found for id={$shift}, staff_id={$staffId}, date={$date}");
            return response()->json(['message' => 'No assignment found for this shift and date'], 404);
        }

        $staffShift->update(['status' => 'absent']);
        return response()->json(['message' => 'Shift marked as absent']);
    }

    /**
     * PATCH /api/shifts/{shift}/accept
     */
    public function accept(Request $request, $shift)
    {
        $staffId = $request->user()->staff_id ?? $request->user()->staff->id;
        if (!$request->user()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $date = $request->input('date');
        if (!$date) {
            return response()->json(['message' => 'Date is required'], 400);
        }

        Log::info("Accepting shift: staff_id={$staffId}, staff_shift_id={$shift}, date={$date}");

        $staffShift = StaffShift::where('id', $shift)
            ->where('staff_id', $staffId)
            ->where('date', $date)
            ->first();

        if (!$staffShift) {
            Log::warning("No StaffShift found for id={$shift}, staff_id={$staffId}, date={$date}");
            return response()->json(['message' => 'No assignment found for this shift and date'], 404);
        }

        if ($staffShift->status !== 'assigned') {
            return response()->json(['message' => 'Shift can only be accepted if assigned'], 400);
        }

        $staffShift->update(['status' => 'accepted']);
        Log::info("Shift accepted: staffShift={$staffShift->id}, new_status=accepted");

        return response()->json(['message' => 'Shift accepted successfully']);
    }

    /**
     * PATCH /api/shifts/{shift}/request-change
     */
    public function requestChange(Request $request, $shift)
    {
        $staffId = $request->user()->staff_id ?? $request->user()->staff->id;
        if (!$request->user()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $date = $request->input('date');
        $reason = $request->input('reason');
        if (!$date || !$reason) {
            return response()->json(['message' => 'Date and reason are required'], 400);
        }

        Log::info("Requesting change: staff_id={$staffId}, staff_shift_id={$shift}, date={$date}, reason={$reason}");

        $staffShift = StaffShift::where('id', $shift)
            ->where('staff_id', $staffId)
            ->where('date', $date)
            ->first();

        if (!$staffShift) {
            Log::warning("No StaffShift found for id={$shift}, staff_id={$staffId}, date={$date}");
            return response()->json(['message' => 'No assignment found for this shift and date'], 404);
        }

        if (!in_array($staffShift->status, ['assigned', 'accepted'])) {
            return response()->json(['message' => 'Shift can only be changed if assigned or accepted'], 400);
        }

        $staffShift->update(['status' => 'requested_change', 'change_reason' => $reason]);
        Log::info("Change requested: staffShift={$staffShift->id}, new_status=requested_change, reason={$reason}");

        return response()->json(['message' => 'Change request submitted successfully']);
    }
}