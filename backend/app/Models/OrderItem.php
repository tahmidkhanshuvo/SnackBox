<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Schema;

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

    // Expose "comment" so frontend can read it uniformly
    protected $appends = ['comment'];

    public function getCommentAttribute(): ?string
    {
        return $this->note;
    }

    /* -------------------- Relationships -------------------- */
    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    public function menuItem()
    {
        return $this->belongsTo(MenuItem::class, 'menu_item_id');
    }

    /* -------------------- Model hooks -------------------- */
    protected static function booted(): void
    {
        // Precompute line_total if column exists, based on qty * unit_price
        static::saving(function (OrderItem $item) {
            $qty   = (int)   ($item->quantity   ?? 0);
            $price = (float) ($item->unit_price ?? 0);
            $calc  = max(0, $qty) * max(0.0, $price);

            static $hasLineTotal = null;
            if ($hasLineTotal === null) {
                try {
                    $hasLineTotal = Schema::hasColumn($item->getTable(), 'line_total');
                } catch (\Throwable $e) {
                    $hasLineTotal = false;
                }
            }

            if ($hasLineTotal) {
                $item->line_total = $calc;
            } else {
                // Ensure we don't try to persist a non-existent column
                unset($item->line_total);
            }
        });

        // After any change, recompute order monetary totals via the model helper
        $recalc = function (OrderItem $item) {
            // Use relation if loaded; otherwise query minimal data
            $order = $item->relationLoaded('order') ? $item->order : $item->order()->first();
            if ($order) {
                $order->recalcTotals();
            }
        };

        static::saved($recalc);
        static::deleted($recalc);
    }
}
