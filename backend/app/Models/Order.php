<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    use HasFactory;

    public const STATUS_PENDING   = 'pending';
    public const STATUS_CONFIRMED = 'confirmed';
    public const STATUS_PREPARING = 'preparing';
    public const STATUS_READY     = 'ready';
    public const STATUS_PICKED_UP = 'picked_up';
    public const STATUS_COMPLETED = 'completed';
    public const STATUS_CANCELLED = 'cancelled';

    protected $fillable = [
        'user_id',
        'subtotal',
        'tax',
        'discount',
        'total',
        'status',
        'payment_method',
        'reference',
        // optional columns supported by controller:
        'accepted_by',
        'accepted_at',
        'cancel_reason',
        // (if your migration has it, controller will set `note` directly)
        // 'note',
    ];

    protected $casts = [
        'subtotal'    => 'decimal:2',
        'tax'         => 'decimal:2',
        'discount'    => 'decimal:2',
        'total'       => 'decimal:2',
        'accepted_at' => 'datetime',
    ];

    /* -------------------- Relationships -------------------- */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function items()
    {
        return $this->hasMany(OrderItem::class);
    }

    public function acceptedBy()
    {
        return $this->belongsTo(User::class, 'accepted_by');
    }

    /* -------------------- Helpers -------------------- */
    /**
     * Recalculate monetary totals.
     * Uses quantity * unit_price so it works whether or not an order_items.line_total column exists.
     */
    public function recalcTotals(): void
    {
        // Pull only what we need to avoid selecting non-existent columns.
        $lines = $this->items()->get(['quantity', 'unit_price']);

        $subtotal = 0.0;
        foreach ($lines as $l) {
            $qty  = (int)    ($l->quantity ?? 0);
            $unit = (float)  ($l->unit_price ?? 0);
            $subtotal += max(0, $qty) * max(0.0, $unit);
        }

        $tax      = (float) ($this->tax ?? 0);
        $discount = (float) ($this->discount ?? 0);

        $this->subtotal = $subtotal;
        $this->total    = max(0.0, $subtotal + $tax - $discount);

        // Avoid firing observers/listeners unnecessarily
        $this->saveQuietly();
    }

    public function scopeStatus($query, string $status)
    {
        return $query->where('status', $status);
    }

    protected static function booted(): void
    {
        static::creating(function (Order $order) {
            $order->subtotal ??= 0;
            $order->tax      ??= 0;
            $order->discount ??= 0;
            $order->total    ??= 0;
            $order->status   ??= self::STATUS_PENDING;
        });
    }
}
