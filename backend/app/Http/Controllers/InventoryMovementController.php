<?php

namespace App\Http\Controllers;

use App\Models\MenuItem;
use App\Models\InventoryMovement;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;

class InventoryMovementController extends Controller
{
    /**
     * GET /api/menu-items/{menuItem}/movements
     * Query: type (in|out|adjustment), from (Y-m-d), to (Y-m-d), per_page, sortDir
     */
    public function index(Request $request, MenuItem $menuItem)
    {
        $type    = $request->string('type')->toString();
        $from    = $request->date('from', null);
        $to      = $request->date('to', null);
        $perPage = (int) $request->input('per_page', 15);
        $sortDir = strtolower($request->input('sortDir', 'desc')) === 'asc' ? 'asc' : 'desc';

        $q = $menuItem->inventoryMovements()->with(['performer:id,name,email']);

        if (in_array($type, ['in','out','adjustment'], true)) {
            $q->where('type', $type);
        }
        if ($from) {
            $q->whereDate('performed_at', '>=', $from);
        }
        if ($to) {
            $q->whereDate('performed_at', '<=', $to);
        }

        $movements = $q->orderBy('performed_at', $sortDir)->paginate($perPage);

        return response()->json([
            'menu_item_id' => $menuItem->id,
            'item_name'    => $menuItem->item_name,
            'stock'        => $menuItem->stock,
            'data'         => $movements,
        ]);
    }

    /**
     * GET /api/menu-items/{menuItem}/stock
     */
    public function stock(MenuItem $menuItem)
    {
        return response()->json([
            'menu_item_id' => $menuItem->id,
            'item_name'    => $menuItem->item_name,
            'stock'        => $menuItem->stock,
            'updated_at'   => now(),
        ]);
    }

    /**
     * POST /api/menu-items/{menuItem}/inventory/move
     * Body examples:
     *  - { "type":"in",  "quantity": 20, "reason":"purchase", "reference":"PO-1001" }
     *  - { "type":"out", "quantity": 2,  "reason":"sale",     "reference":"ORD-9" }
     *  - { "type":"adjustment", "delta_qty": -3, "reason":"spoilage" }
     * Optional: performed_at (datetime), allow_negative (bool)
     */
    public function store(Request $request, MenuItem $menuItem)
    {
        $data = $request->validate([
            'type'          => ['required', Rule::in(['in','out','adjustment'])],
            // quantity is required for in/out; delta_qty for adjustment
            'quantity'      => ['sometimes','integer','min:0'],
            'delta_qty'     => ['sometimes','integer'],
            'reason'        => ['sometimes','nullable','string','max:255'],
            'reference'     => ['sometimes','nullable','string','max:255'],
            'performed_at'  => ['sometimes','date'],
            'allow_negative'=> ['sometimes','boolean'],
        ]);

        // Determine signed delta
        $delta = 0;
        if ($data['type'] === 'in') {
            $qty = abs((int)($data['quantity'] ?? 0));
            $this->requireQuantity($qty);
            $delta = $qty;
        } elseif ($data['type'] === 'out') {
            $qty = abs((int)($data['quantity'] ?? 0));
            $this->requireQuantity($qty);
            $delta = -$qty;
        } else { // adjustment
            // Prefer delta_qty; fallback to quantity as a signed value
            if (array_key_exists('delta_qty', $data)) {
                $delta = (int) $data['delta_qty'];
            } elseif (array_keyExists('quantity', $data)) {
                $delta = (int) $data['quantity']; // can be positive or negative per client choice
            } else {
                return response()->json([
                    'message' => 'For adjustment, provide delta_qty (can be negative or positive).'
                ], 422);
            }
        }

        // Optional: prevent negative stock unless allow_negative=true
        $current = (int) $menuItem->stock;
        $allowNegative = (bool) ($data['allow_negative'] ?? false);
        if (!$allowNegative && ($current + $delta) < 0) {
            return response()->json([
                'message' => 'Insufficient stock for this operation.',
                'stock'   => $current,
                'attempt' => $delta,
            ], 422);
        }

        $movement = InventoryMovement::create([
            'menu_item_id' => $menuItem->id,
            'delta_qty'    => $delta,
            'type'         => $data['type'],
            'reason'       => $data['reason']    ?? null,
            'reference'    => $data['reference'] ?? null,
            'performed_by' => optional($request->user())->id,
            'performed_at' => $data['performed_at'] ?? now(),
        ]);

        return response()->json([
            'message'      => 'Movement recorded',
            'menu_item_id' => $menuItem->id,
            'stock'        => (int) $menuItem->fresh()->stock,
            'movement'     => $movement->load('performer:id,name,email'),
        ], 201);
    }

    /* ---------------- helpers ---------------- */

    private function requireQuantity(int $qty): void
    {
        if ($qty <= 0) {
            abort(response()->json([
                'message' => 'Quantity must be a positive integer.'
            ], 422));
        }
    }
}
