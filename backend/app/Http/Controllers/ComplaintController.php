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

        if (in_array($status, ['open','in_progress','resolved','closed'], true)) {
            $query->where('status', $status);
        }
        if ($userId)   $query->where('user_id', $userId);
        if ($handler)  $query->where('handled_by', $handler);
        if ($q !== '') $query->where(function ($w) use ($q) {
            $w->where('subject','like',"%{$q}%")
              ->orWhere('message','like',"%{$q}%")
              ->orWhere('response','like',"%{$q}%");
        });

        return response()->json($query->latest()->paginate($perPage));
    }

    /**
     * POST /api/complaints
     * Body: { subject, message }
     * (Route is protected; uses authenticated user)
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'subject' => ['required','string','max:255'],
            'message' => ['required','string'],
        ]);

        $complaint = Complaint::create([
            'user_id' => optional($request->user())->id,
            'subject' => $data['subject'],
            'message' => $data['message'],
            'status'  => 'open',
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
            'status'   => ['sometimes', Rule::in(['open','in_progress','resolved','closed'])],
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
        $complaint->status     = $complaint->status === 'open' ? 'in_progress' : $complaint->status;
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

        $complaint->markResolved($complaint->handled_by ?? 0, $data['response'] ?? null);

        return response()->json($complaint->fresh()->load('handler'));
    }
}
