<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class InventoryMovement extends Model
{
    use HasFactory;

    public const TYPE_IN         = 'in';
    public const TYPE_OUT        = 'out';
    public const TYPE_ADJUSTMENT = 'adjustment';

    protected $fillable = [
        'menu_item_id',
        'delta_qty',
        'type',
        'reason',
        'reference',
        'performed_by',
        'performed_at',
    ];

    protected $casts = [
        'delta_qty'    => 'integer',
        'performed_at' => 'datetime',
    ];

    /* -------------------- Relationships -------------------- */

    // Consistent naming with other models
    public function menuItem()
    {
        return $this->belongsTo(MenuItem::class, 'menu_item_id');
    }

    // Backward-compat alias
    public function item()
    {
        return $this->belongsTo(MenuItem::class, 'menu_item_id');
    }

    public function performer()
    {
        return $this->belongsTo(User::class, 'performed_by');
    }

    /* -------------------- Normalization -------------------- */

    public function setTypeAttribute($value): void
    {
        $v = strtolower((string) $value);

        // Keep valid values as-is, including 'adjustment'
        if (in_array($v, [self::TYPE_IN, self::TYPE_OUT, self::TYPE_ADJUSTMENT], true)) {
            $this->attributes['type'] = $v;
            return;
        }

        // Fallback: infer from delta_qty sign (no way to infer 'adjustment' here)
        $delta = (int) ($this->attributes['delta_qty'] ?? 0);
        $this->attributes['type'] = $delta < 0 ? self::TYPE_OUT : self::TYPE_IN;
    }
}
