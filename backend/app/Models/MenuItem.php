<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Support\Facades\Storage;

class MenuItem extends Model
{
    use HasFactory;

    /**
     * Mass-assignable fields.
     */
    protected $fillable = [
        'item_name',
        'category',
        'price',
        'availability',
        'image_path',
        'image_alt',
        // 'description', // add here if/when you add it to the table
    ];

    /**
     * Default attributes (new items are available by default).
     */
    protected $attributes = [
        'availability' => true,
    ];

    /**
     * Include computed props in API responses.
     */
    protected $appends = ['stock', 'image_url'];

    /**
     * Casts.
     * Note: 'decimal:2' returns strings in JSON to preserve precision (OK for display).
     */
    protected $casts = [
        'price'        => 'decimal:2',
        'availability' => 'boolean',
    ];

    /* -------------------- Relationships -------------------- */

    public function orderItems()
    {
        return $this->hasMany(OrderItem::class);
    }

    public function inventoryMovements()
    {
        return $this->hasMany(InventoryMovement::class);
    }

    /* -------------------- Accessors -------------------- */

    // Current stock = SUM of ledger deltas
    public function stock(): Attribute
    {
        return Attribute::get(fn () => (int) $this->inventoryMovements()->sum('delta_qty'));
    }

    // Full public URL for the stored image (uses the 'public' disk)
    public function imageUrl(): Attribute
    {
        return Attribute::get(function () {
            return $this->image_path
                ? Storage::disk('public')->url($this->image_path)
                : null;
        });
    }
}
