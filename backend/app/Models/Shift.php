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
        'status',      // Add status field for temporary use
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'starts_at' => 'datetime:H:i:s', // Cast to time only
        'ends_at' => 'datetime:H:i:s',   // Cast to time only
    ];

    /**
     * Get the staff assignments for this shift.
     */
    public function staffShifts()
    {
        return $this->hasMany(StaffShift::class);
    }

    /**
     * Get the staff associated with this shift through staff shifts.
     */
    public function staff()
    {
        return $this->hasManyThrough(Staff::class, StaffShift::class);
    }
}