<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Support\Facades\Storage;

class MenuItem extends Model
{
    use HasFactory;

    // UPDATED: Added 'price' to the fillable attributes
    protected $fillable = ['item_name', 'category', 'price', 'availability', 'image_path', 'image_alt'];

    // expose computed fields
    protected $appends = ['stock', 'image_url'];
    
    // NEW: Cast the price to a decimal with 2 places
    protected $casts = [
        'price' => 'decimal:2',
        'availability' => 'boolean',
    ];

    public function orderItems()
    {
        return $this->hasMany(OrderItem::class);
    }

    public function inventoryMovements()
    {
        return $this->hasMany(InventoryMovement::class);
    }

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
