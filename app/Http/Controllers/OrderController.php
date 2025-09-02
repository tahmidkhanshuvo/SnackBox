<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\MenuItem;
use App\Models\InventoryMovement;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class OrderController extends Controller
{
    /**
     * GET /api/orders?status=&user_id=&q=&per_page=
     */
    public function index(Request $request)
    {
        $status  = $request->string('status')->toString();
        $userId  = $request->input('user_id');
        $q       = $request->string('q')->toString();
        $perPage = (int) $request->input('per_page', 15);

        $query = Order::query()->with(['user:id,name,email'])->withCount('items');

        if (in_array($status, [
            Order::STATUS_PENDING, Order::STATUS_CONFIRMED, Order::STATUS_PREPARING,
            Order::STATUS_READY, Order::STATUS_PICKED_UP, Order::STATUS_COMPLETED,
            Order::STATUS_CANCELLED
        ], true)) {
            $query->where('status', $status);
        }

        if ($userId) $query->where('user_id', $userId);
        if ($q !== '') $query->where('reference', 'like', "%{$q}%");

        return response()->json($query->latest()->paginate($perPage));
    }

    /**
     * GET /api/orders/{order}
     */
    public function show(Order $order)
    {
        return response()->json(
            $order->load(['items.menuItem:id,item_name,category', 'user:id,name,email'])
        );
    }

    /**
     * POST /api/orders
     * Body:
     * {
     *   "reference": "POS-1001",
     *   "payment_method": "cash",
     *   "items": [
     *     { "menu_item_id": 1, "quantity": 2, "unit_price": 120.00 },
     *     { "menu_item_id": 3, "quantity": 1, "unit_price": 80.00 }
     *   ]
     * }
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'reference'       => ['nullable','string','max:100'],
            'payment_method'  => ['nullable','string','max:50'],
            'items'           => ['sometimes','array','min:1'],
            'items.*.menu_item_id' => ['required','exists:menu_items,id'],
            'items.*.quantity'     => ['required','integer','min:1'],
            'items.*.unit_price'   => ['required','numeric','min:0'],
        ]);

        $order = DB::transaction(function () use ($request, $data) {
            $order = Order::create([
                'user_id'        => optional($request->user())->id,
                'subtotal'       => 0,
                'tax'            => 0,
                'discount'       => 0,
                'total'          => 0,
                'status'         => Order::STATUS_PENDING,
                'payment_method' => $data['payment_method'] ?? null,
                'reference'      => $data['reference'] ?? null,
            ]);

            foreach (($data['items'] ?? []) as $line) {
                $order->items()->create([
                    'menu_item_id' => $line['menu_item_id'],
                    'quantity'     => $line['quantity'],
                    'unit_price'   => $line['unit_price'],
                    // line_total auto-calculated in OrderItem::saving()
                ]);
            }

            $order->recalcTotals();

            return $order;
        });

        return response()->json($order->fresh()->load('items.menuItem'), 201);
    }

    /**
     * POST /api/orders/{order}/items
     * Body: { menu_item_id, quantity, unit_price, merge? (bool) }
     * If merge=true and the item exists, quantity will be added to the existing line.
     */
    public function addItem(Request $request, Order $order)
    {
        $data = $request->validate([
            'menu_item_id' => ['required','exists:menu_items,id'],
            'quantity'     => ['required','integer','min:1'],
            'unit_price'   => ['required','numeric','min:0'],
            'merge'        => ['sometimes','boolean'],
        ]);

        $merge = (bool) ($data['merge'] ?? true);

        $item = $order->items()->where('menu_item_id', $data['menu_item_id'])->first();

        if ($item && $merge) {
            $item->quantity += $data['quantity'];
            $item->unit_price = $data['unit_price']; // latest price wins
            $item->save();
        } else {
            $item = $order->items()->create([
                'menu_item_id' => $data['menu_item_id'],
                'quantity'     => $data['quantity'],
                'unit_price'   => $data['unit_price'],
            ]);
        }

        // subtotal/total recalculated by OrderItem events
        return response()->json($order->fresh()->load('items.menuItem'));
    }

    /**
     * DELETE /api/orders/{order}/items/{orderItem}
     */
    public function removeItem(Order $order, OrderItem $orderItem)
    {
        if ($orderItem->order_id !== $order->id) {
            return response()->json(['message' => 'Item does not belong to this order'], 404);
        }

        $orderItem->delete();

        return response()->json($order->fresh()->load('items.menuItem'));
    }

    /**
     * PATCH /api/orders/{order}/status
     * Body: { status, allow_negative? (bool) }
     * When moving to 'confirmed', we deduct stock by creating inventory movements (type='out').
     */
    public function updateStatus(Request $request, Order $order)
    {
        $data = $request->validate([
            'status'         => ['required', Rule::in([
                Order::STATUS_PENDING, Order::STATUS_CONFIRMED, Order::STATUS_PREPARING,
                Order::STATUS_READY, Order::STATUS_PICKED_UP, Order::STATUS_COMPLETED,
                Order::STATUS_CANCELLED
            ])],
            'allow_negative' => ['sometimes','boolean'],
        ]);

        $new = $data['status'];
        $allowNegative = (bool) ($data['allow_negative'] ?? false);

        // If confirming, write inventory movements (once)
        if ($new === Order::STATUS_CONFIRMED) {
            $ref = "ORD-{$order->id}";
            $already = InventoryMovement::where('reference', $ref)->exists();

            if (! $already) {
                // check stock
                $insufficient = [];
                foreach ($order->items()->with('menuItem')->get() as $line) {
                    $stock = (int) $line->menuItem->stock;
                    if (!$allowNegative && $stock - $line->quantity < 0) {
                        $insufficient[] = [
                            'menu_item_id' => $line->menu_item_id,
                            'item_name'    => $line->menuItem->item_name,
                            'stock'        => $stock,
                            'required'     => $line->quantity,
                        ];
                    }
                }
                if ($insufficient) {
                    return response()->json([
                        'message' => 'Insufficient stock for one or more items.',
                        'items'   => $insufficient
                    ], 422);
                }

                DB::transaction(function () use ($order, $ref) {
                    foreach ($order->items as $line) {
                        InventoryMovement::create([
                            'menu_item_id' => $line->menuItem->id,
                            'delta_qty'    => -$line->quantity,
                            'type'         => 'out',
                            'reason'       => 'order',
                            'reference'    => $ref,
                            'performed_by' => optional(request()->user())->id,
                            'performed_at' => now(),
                        ]);
                    }
                });
            }
        }

        $order->status = $new;
        $order->save();

        return response()->json($order->fresh()->load('items.menuItem'));
    }
}
