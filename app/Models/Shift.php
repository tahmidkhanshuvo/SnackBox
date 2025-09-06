<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Shift extends Model
{
    use HasFactory;

    // If your table is named "shifts" (recommended), no need to set $table.
    // protected $table = 'shifts';

    protected $fillable = [
        'name',        // e.g., "Morning", "Evening", "Night"
        'starts_at',   // time string "08:00:00"
        'ends_at',     // time string "16:00:00"
        'is_active',   // boolean
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    public function staff()
    {
        return $this->hasMany(Staff::class);
    }
}
