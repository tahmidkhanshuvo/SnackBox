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
        // NEW:
        'accepted_by',
        'accepted_at',
        'cancel_reason',
    ];

    protected $casts = [
        'subtotal'     => 'decimal:2',
        'tax'          => 'decimal:2',
        'discount'     => 'decimal:2',
        'total'        => 'decimal:2',
        // NEW:
        'accepted_at'  => 'datetime',
    ];

    /* -------------------- Relationships -------------------- */
    public function user()       { return $this->belongsTo(User::class); }
    public function items()      { return $this->hasMany(OrderItem::class); }
    public function acceptedBy() { return $this->belongsTo(User::class, 'accepted_by'); }

    /* -------------------- Helpers -------------------- */
    public function recalcTotals(): void
    {
        $subtotal = (float) $this->items()->sum('line_total');
        $this->subtotal = $subtotal;
        $this->total = $subtotal + (float) $this->tax - (float) $this->discount;
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
