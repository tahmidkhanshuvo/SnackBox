<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class OrderItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_id',
        'menu_item_id',
        'quantity',
        'unit_price',
        'line_total',
        'note',
    ];

    protected $casts = [
        'quantity'   => 'integer',
        'unit_price' => 'decimal:2',
        'line_total' => 'decimal:2',
    ];

    // Relationships
    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    public function menuItem()
    {
        return $this->belongsTo(MenuItem::class, 'menu_item_id');
    }

    // Auto-calc line_total and keep order totals correct
    protected static function booted(): void
    {
        static::saving(function (OrderItem $item) {
            // Default unit_price from menu item if not provided
            if (is_null($item->unit_price) && $item->relationLoaded('menuItem') && $item->menuItem) {
                // If you later add a price on menu_items, you can pull it here.
                // $item->unit_price = $item->menuItem->price;
            }

            $qty = (int) ($item->quantity ?? 0);
            $price = (float) ($item->unit_price ?? 0);
            $item->line_total = $qty * $price;
        });

        // After save/delete, recalc parent order totals
        $recalc = function (OrderItem $item) {
            if ($item->order) {
                $order = $item->order->fresh(['items']);
                $subtotal = $order->items->sum('line_total');
                // Leave tax/discount as-is; just recompute subtotal & total
                $order->subtotal = $subtotal;
                $order->total    = ($order->subtotal ?? 0)
                                 + ($order->tax ?? 0)
                                 - ($order->discount ?? 0);
                $order->saveQuietly();
            }
        };

        static::saved($recalc);
        static::deleted($recalc);
    }
}
