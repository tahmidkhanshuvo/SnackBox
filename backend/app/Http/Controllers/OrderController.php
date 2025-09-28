<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\MenuItem;
use App\Models\InventoryMovement;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Validation\Rule;

class OrderController extends Controller
{
    /** Helper: detect staff/admin across common schemas (role field, boolean flags, or staff table) */
    private function isStaff(?User $user): bool
    {
        if (!$user) return false;

        // Common boolean flags
        if (isset($user->is_admin) && $user->is_admin) return true;
        if (isset($user->is_staff) && $user->is_staff) return true;

        // role string patterns
        $role = strtolower((string) ($user->role ?? ''));
        if (in_array($role, ['admin','manager','staff'], true)) return true;

        // Relation flag often exposed by API responses (frontend checks user.staff)
        if (property_exists($user, 'staff') && $user->staff) return true;
        if (method_exists($user, 'staff') && $user->staff) return true;

        // Fallback: check staff table if it exists
        try {
            if (class_exists(\App\Models\Staff::class)) {
                return \App\Models\Staff::where('user_id', $user->id)->exists();
            }
        } catch (\Throwable $e) {
            // ignore
        }
        return false;
    }

    /**
     * GET /api/orders?status=&user_id=&q=&per_page=&with=items
     * - Non-staff: forcibly scoped to their own orders
     * - Staff: may filter by user_id or see all
     */
    public function index(Request $request)
    {
        $status  = $request->string('status')->toString();
        $q       = $request->string('q')->toString();
        $perPage = (int) $request->input('per_page', 15);
        $user    = $request->user();
        $isStaff = $this->isStaff($user);

        $withParam = collect(explode(',', (string) $request->query('with', '')))
            ->map(fn($s) => trim($s))->filter()->values();

        $query = Order::query()
            ->with(['user:id,name,email'])
            ->withCount('items');

        if ($withParam->contains('items') || $withParam->contains('items.menuItem')) {
            $query->with(['items.menuItem']);
        }

        if (in_array($status, [
            Order::STATUS_PENDING, Order::STATUS_CONFIRMED, Order::STATUS_PREPARING,
            Order::STATUS_READY, Order::STATUS_PICKED_UP, Order::STATUS_COMPLETED,
            Order::STATUS_CANCELLED
        ], true)) {
            $query->where('status', $status);
        }

        if ($isStaff) {
            if ($request->filled('user_id')) {
                $query->where('user_id', $request->input('user_id'));
            }
        } else {
            $query->where('user_id', $user?->id ?? 0);
        }

        if ($q !== '') $query->where('reference', 'like', "%{$q}%");

        return response()->json($query->latest()->paginate($perPage));
    }

    /**
     * GET /api/orders/{order}
     * - Non-staff: must be the owner
     */
    public function show(Request $request, Order $order)
    {
        $user = $request->user();
        if (!$this->isStaff($user) && $order->user_id !== ($user?->id)) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $relations = ['items.menuItem', 'user:id,name,email'];
        if (method_exists($order, 'acceptedBy')) $relations[] = 'acceptedBy:id,name';
        if (method_exists($order, 'assignedTo')) $relations[] = 'assignedTo:id,name';

        return response()->json($order->load($relations));
    }

    /**
     * POST /api/orders
     * - Always created for the signed-in user
     * - Accepts optional order note (saved if column exists)
     * - Accepts optional client-computed unit_price (clamped to >= menu price)
     */
    public function store(Request $request)
    {
        $auth = $request->user();
        if (!$auth) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        $data = $request->validate([
            'reference'            => ['nullable','string','max:100'],
            'payment_method'       => ['nullable','string','max:50'],
            'note'                 => ['sometimes','nullable','string','max:1000'], // order-level note (optional)
            'items'                => ['required','array','min:1'],
            'items.*.menu_item_id' => ['required','exists:menu_items,id'],
            'items.*.quantity'     => ['required','integer','min:1'],
            'items.*.note'         => ['sometimes','nullable','string','max:500'],
            'items.*.addons'       => ['sometimes','nullable','array'],
            'items.*.selections'   => ['sometimes','nullable','array'],
            'items.*.unit_price'   => ['sometimes','numeric','min:0'],  // from cart (base + addons)
            'items.*.base_price'   => ['sometimes','numeric','min:0'],  // optional, ignored by server math
        ]);

        $order = DB::transaction(function () use ($auth, $data) {
            $order = Order::create([
                'user_id'        => $auth->id,
                'subtotal'       => 0,
                'tax'            => 0,
                'discount'       => 0,
                'total'          => 0,
                'status'         => Order::STATUS_PENDING,
                'payment_method' => $data['payment_method'] ?? 'online',
                'reference'      => $data['reference'] ?? null,
            ]);

            // Order-level note if column exists
            if (isset($data['note']) && Schema::hasColumn('orders', 'note')) {
                $order->note = $data['note'];
                $order->save();
            }

            $menuItemIds = collect($data['items'])->pluck('menu_item_id')->unique();
            $menuItems   = MenuItem::findMany($menuItemIds)->keyBy('id');

            foreach ($data['items'] as $line) {
                $menuItem = $menuItems->get($line['menu_item_id']);
                if (!$menuItem || !isset($menuItem->price)) {
                    throw new \Exception('Invalid menu item or missing price: '.$line['menu_item_id']);
                }

                // Use client-provided unit_price if present, but never below base DB price
                $clientUnit = isset($line['unit_price']) ? (float) $line['unit_price'] : null;
                $unitPrice  = is_null($clientUnit)
                    ? (float) $menuItem->price
                    : max((float) $menuItem->price, $clientUnit);

                $order->items()->create([
                    'menu_item_id' => $line['menu_item_id'],
                    'quantity'     => $line['quantity'],
                    'unit_price'   => $unitPrice,
                    'note'         => $line['note']        ?? null,
                    'addons'       => $line['addons']      ?? null,
                    'selections'   => $line['selections']  ?? null,
                ]);
            }

            // Ensure totals are correct
            $order->recalcTotals();

            return $order;
        });

        return response()->json($order->fresh()->load('items.menuItem'), 201);
    }

    public function addItem(Request $request, Order $order)
    {
        $user = $request->user();
        $isStaff = $this->isStaff($user);

        if (!$isStaff && $order->user_id !== ($user?->id)) {
            return response()->json(['message' => 'Forbidden'], 403);
        }
        if (!$isStaff && $order->status !== Order::STATUS_PENDING) {
            return response()->json(['message' => 'You can only modify a pending order.'], 422);
        }

        $data = $request->validate([
            'menu_item_id' => ['required','exists:menu_items,id'],
            'quantity'     => ['required','integer','min:1'],
            'unit_price'   => ['sometimes','numeric','min:0'], // now optional; we’ll clamp below
            'merge'        => ['sometimes','boolean'],
            'note'         => ['sometimes','nullable','string','max:500'],
            'addons'       => ['sometimes','nullable','array'],
            'selections'   => ['sometimes','nullable','array'],
        ]);

        $merge = (bool) ($data['merge'] ?? true);

        // Derive effective unit price with safety clamp
        $menu = MenuItem::find($data['menu_item_id']);
        if (!$menu || !isset($menu->price)) {
            return response()->json(['message' => 'Invalid menu item.'], 422);
        }
        $clientUnit = array_key_exists('unit_price', $data) ? (float) $data['unit_price'] : null;
        $unitPrice  = is_null($clientUnit)
            ? (float) $menu->price
            : max((float) $menu->price, $clientUnit);

        $item = $order->items()->where('menu_item_id', $data['menu_item_id'])->first();

        if ($item && $merge) {
            $item->quantity   += $data['quantity'];
            $item->unit_price  = $unitPrice;
            if (array_key_exists('note', $data))       $item->note = $data['note'];
            if (array_key_exists('addons', $data))     $item->addons = $data['addons'];
            if (array_key_exists('selections', $data)) $item->selections = $data['selections'];
            $item->save();
        } else {
            $order->items()->create([
                'menu_item_id' => $data['menu_item_id'],
                'quantity'     => $data['quantity'],
                'unit_price'   => $unitPrice,
                'note'         => $data['note']        ?? null,
                'addons'       => $data['addons']      ?? null,
                'selections'   => $data['selections']  ?? null,
            ]);
        }

        // Totals after mutation
        $order->recalcTotals();

        return response()->json($order->fresh()->load('items.menuItem'));
    }

    public function removeItem(Request $request, Order $order, OrderItem $orderItem)
    {
        $user = $request->user();
        $isStaff = $this->isStaff($user);

        if ($orderItem->order_id !== $order->id) {
            return response()->json(['message' => 'Item does not belong to this order'], 404);
        }
        if (!$isStaff && $order->user_id !== ($user?->id)) {
            return response()->json(['message' => 'Forbidden'], 403);
        }
        if (!$isStaff && $order->status !== Order::STATUS_PENDING) {
            return response()->json(['message' => 'You can only modify a pending order.'], 422);
        }

        $orderItem->delete();

        // Totals after mutation
        $order->recalcTotals();

        return response()->json($order->fresh()->load('items.menuItem'));
    }

    /**
     * PATCH /api/orders/{order}/status (alias: PATCH /api/orders/{order})
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
            'reason'         => ['sometimes','nullable','string','max:500'],
        ]);

        $new           = $data['status'];
        $allowNegative = (bool) ($data['allow_negative'] ?? false);
        $reason        = $data['reason'] ?? null;
        $user          = $request->user();
        $isStaff       = $this->isStaff($user);
        $isOwner       = $user && $user->id === $order->user_id;

        if ($isOwner && !$isStaff) {
            if ($new !== Order::STATUS_CANCELLED) {
                return response()->json(['message' => 'You can only cancel your own order.'], 403);
            }
            if ($order->status !== Order::STATUS_PENDING) {
                return response()->json(['message' => 'Only pending orders can be cancelled.'], 422);
            }
            $order->status = Order::STATUS_CANCELLED;
            if ($reason && Schema::hasColumn('orders', 'cancel_reason')) {
                $order->cancel_reason = $reason;
            }
            $order->save();

            return response()->json($order->fresh()->load(['items.menuItem','user:id,name,email','acceptedBy:id,name']));
        }

        if (!$isStaff) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        if (in_array($order->status, [Order::STATUS_COMPLETED, Order::STATUS_CANCELLED], true)) {
            return response()->json(['message' => 'Finalized orders cannot be changed.'], 422);
        }

        if ($new === Order::STATUS_CONFIRMED) {
            if (Schema::hasColumn('orders', 'accepted_by') && empty($order->accepted_by)) {
                $order->accepted_by = $user?->id;
            }
            if (Schema::hasColumn('orders', 'accepted_at') && empty($order->accepted_at)) {
                $order->accepted_at = now();
            }

            $ref = "ORD-{$order->id}";
            $already = InventoryMovement::where('reference', $ref)->exists();

            if (! $already) {
                $insufficient = [];
                foreach ($order->items()->with('menuItem')->get() as $line) {
                    $stock = (int) ($line->menuItem->stock ?? 0);
                    if (!$allowNegative && $stock - $line->quantity < 0) {
                        $insufficient[] = [
                            'menu_item_id' => $line->menu_item_id,
                            'item_name'    => $line->menuItem->item_name ?? 'Item',
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

                DB::transaction(function () use ($order, $ref, $user) {
                    foreach ($order->items as $line) {
                        InventoryMovement::create([
                            'menu_item_id' => $line->menuItem->id,
                            'delta_qty'    => -$line->quantity,
                            'type'         => 'out',
                            'reason'       => 'order',
                            'reference'    => $ref,
                            'performed_by' => optional($user)->id,
                            'performed_at' => now(),
                        ]);
                    }
                });
            }
        }

        if ($new === Order::STATUS_CANCELLED && $reason && Schema::hasColumn('orders', 'cancel_reason')) {
            $order->cancel_reason = $reason;
        }

        $order->status = $new;
        $order->save();

        return response()->json($order->fresh()->load(['items.menuItem','user:id,name,email','acceptedBy:id,name']));
    }
}
