<?php

namespace App\Http\Controllers;

use App\Models\Salary;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class SalaryController extends Controller
{
    /**
     * GET /api/salaries?staff_id=&month=YYYY-MM&status=&per_page=
     */
    public function index(Request $request)
    {
        $staffId = $request->input('staff_id');
        $month   = $request->string('month')->toString(); // YYYY-MM
        $status  = $request->string('status')->toString();
        $perPage = (int) $request->input('per_page', 15);

        $q = Salary::query()->with('staff');

        if ($staffId) $q->where('staff_id', $staffId);
        if ($month !== '') $q->whereRaw("DATE_FORMAT(for_month, '%Y-%m') = ?", [$month]);
        if (in_array($status, ['pending','paid','failed'], true)) $q->where('status', $status);

        return response()->json($q->orderBy('for_month','desc')->paginate($perPage));
    }

    /**
     * POST /api/salaries
     * Body: { staff_id, for_month (date), amount, paid_at?, status?, note? }
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'staff_id'  => ['required','exists:staff,id'],
            'for_month' => ['required','date'],
            'amount'    => ['required','numeric','min:0'],
            'paid_at'   => ['nullable','date'],
            'status'    => ['nullable', Rule::in(['pending','paid','failed'])],
            'note'      => ['nullable','string'],
        ]);

        // Enforce unique (staff_id, for_month)
        $exists = Salary::where('staff_id', $data['staff_id'])
            ->whereDate('for_month', $data['for_month'])
            ->exists();

        if ($exists) {
            return response()->json(['message' => 'Salary for this staff and month already exists.'], 422);
        }

        $salary = Salary::create($data + ['status' => $data['status'] ?? 'pending']);

        return response()->json($salary, 201);
    }

    /**
     * PATCH /api/salaries/{salary}/mark-paid
     * Body: { paid_at? }
     */
    public function markPaid(Request $request, Salary $salary)
    {
        $request->validate([
            'paid_at' => ['nullable','date'],
        ]);

        $salary->markPaid($request->input('paid_at'));

        return response()->json($salary->fresh());
    }
}
