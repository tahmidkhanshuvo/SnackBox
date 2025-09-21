<?php

namespace App\Http\Controllers;

use App\Models\Complaint;
use App\Models\Staff;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class ComplaintController extends Controller
{
    /**
     * GET /api/complaints?status=&user_id=&handled_by=&q=&per_page=
     */
    public function index(Request $request)
    {
        $status   = $request->string('status')->toString();
        $userId   = $request->input('user_id');
        $handler  = $request->input('handled_by');
        $q        = $request->string('q')->toString();
        $perPage  = (int) $request->input('per_page', 15);

        $query = Complaint::query()->with(['user:id,name,email', 'handler:id,first_name,last_name']);

        if (in_array($status, ['Pending','Assigned','Resolved'], true)) {
            $query->where('status', $status);
        }
        if ($userId)   $query->where('user_id', $userId);
        if ($handler)  $query->where('handled_by', $handler);
        if ($q !== '') $query->where(function ($w) use ($q) {
            $w->where('complaint_text','like',"%{$q}%")
              ->orWhere('response','like',"%{$q}%");
        });

        return response()->json($query->latest()->paginate($perPage));
    }

    /**
     * POST /api/complaints
     * Body: { complaint_text }
     * (Route is protected; uses authenticated user)
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'complaint_text' => ['required','string'],
        ]);

        $complaint = Complaint::create([
            'user_id' => optional($request->user())->id,
            'complaint_text' => $data['complaint_text'],
            'status'  => 'Pending',
        ]);

        return response()->json($complaint, 201);
    }

    /**
     * PATCH /api/complaints/{complaint}
     * Body: { status?, response? }
     */
    public function update(Request $request, Complaint $complaint)
    {
        $data = $request->validate([
            'status'   => ['sometimes', Rule::in(['Pending','Assigned','Resolved'])],
            'response' => ['sometimes','nullable','string'],
        ]);

        $complaint->fill($data)->save();

        return response()->json($complaint->fresh()->load(['user:id,name,email','handler:id,first_name,last_name']));
    }

    /**
     * PATCH /api/complaints/{complaint}/assign/{staff}
     */
    public function assign(Request $request, Complaint $complaint, Staff $staff)
    {
        $complaint->handled_by = $staff->id;
        $complaint->status     = $complaint->status === 'Pending' ? 'Assigned' : $complaint->status;
        $complaint->save();

        return response()->json($complaint->fresh()->load('handler'));
    }

    /**
     * PATCH /api/complaints/{complaint}/resolve
     * Body: { response? }
     * Will try to set handled_by from the authenticated user's Staff record if not already set.
     */
    public function resolve(Request $request, Complaint $complaint)
    {
        $data = $request->validate([
            'response' => ['sometimes','nullable','string'],
        ]);

        // If no handler set, infer from current user (if they are linked to a Staff row)
        if (!$complaint->handled_by && $request->user()) {
            $staff = Staff::where('user_id', $request->user()->id)->first();
            if ($staff) {
                $complaint->handled_by = $staff->id;
            }
        }

        $complaint->status = 'Resolved';
        if ($data['response']) {
            $complaint->response = $data['response'];
        }
        $complaint->save();

        return response()->json($complaint->fresh()->load('handler'));
    }

    /**
     * PATCH /api/complaints/{complaint}/reply
     * Body: { reply }
     * Adds a reply to the complaint and updates the status if necessary.
     */
    public function reply(Request $request, Complaint $complaint)
    {
        $data = $request->validate([
            'reply' => ['required', 'string'],
        ]);

        // Append the reply to the existing response or create a new one
        $currentResponse = $complaint->response ?? '';
        $complaint->response = $currentResponse . "\n\n[Reply at " . now() . "]: " . $data['reply'];

        // If the complaint is still open, mark it as in_progress if assigned, otherwise leave as is
        if ($complaint->status === 'Pending' && $complaint->handled_by) {
            $complaint->status = 'Assigned';
        }

        $complaint->save();

        return response()->json($complaint->fresh()->load('handler'));
    }
}