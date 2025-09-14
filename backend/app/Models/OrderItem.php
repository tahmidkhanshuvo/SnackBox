<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Casts\Attribute;

class OrderItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_id',
        'menu_item_id',
        'quantity',
        'unit_price',
        'line_total',
        'note',        // user comment
        'addons',      // JSON
        'selections',  // JSON
    ];

    protected $casts = [
        'quantity'   => 'integer',
        'unit_price' => 'decimal:2',
        'line_total' => 'decimal:2',
        'addons'     => 'array',
        'selections' => 'array',
    ];

    // expose "comment" so frontend can read it uniformly
    protected $appends = ['comment'];

    public function getCommentAttribute(): ?string
    {
        return $this->note;
    }

    // Relationships
    public function order()     { return $this->belongsTo(Order::class); }
    public function menuItem()  { return $this->belongsTo(MenuItem::class, 'menu_item_id'); }

    // Auto-calc line_total and keep order totals correct
    protected static function booted(): void
    {
        static::saving(function (OrderItem $item) {
            $qty   = (int) ($item->quantity ?? 0);
            $price = (float) ($item->unit_price ?? 0);
            $item->line_total = $qty * $price;
        });

        $recalc = function (OrderItem $item) {
            if ($item->order) {
                $order = $item->order->fresh(['items']);
                $subtotal = $order->items->sum('line_total');
                $order->subtotal = $subtotal;
                $order->total    = ($order->subtotal ?? 0) + ($order->tax ?? 0) - ($order->discount ?? 0);
                $order->saveQuietly();
            }
        };

        static::saved($recalc);
        static::deleted($recalc);
    }
}
