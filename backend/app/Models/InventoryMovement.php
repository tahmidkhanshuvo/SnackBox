<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class InventoryMovement extends Model
{
    use HasFactory;

    protected $fillable = [
        'menu_item_id', 'delta_qty', 'type', 'reason', 'reference', 'performed_by', 'performed_at'
    ];

    protected $casts = [
        'performed_at' => 'datetime',
    ];

    public function item()
    {
        return $this->belongsTo(MenuItem::class, 'menu_item_id');
    }

    public function performer()
    {
        return $this->belongsTo(User::class, 'performed_by');
    }
}
