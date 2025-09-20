<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class StaffShift extends Model
{
    use HasFactory;

    protected $table = 'staff_shifts';

    protected $fillable = [
        'staff_id',
        'shift_id',
        'date',
        'status', // e.g., "assigned", "accepted", "late", "absent"
    ];

    protected $casts = [
        'date' => 'date',
    ];

    public function shift()
    {
        return $this->belongsTo(Shift::class);
    }

    public function staff()
    {
        return $this->belongsTo(Staff::class);
    }
}