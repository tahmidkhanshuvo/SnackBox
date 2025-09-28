<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Staff extends Model
{
    use HasFactory;

    /** Our table is singular 'staff' (not the default plural). */
    protected $table = 'staff';

    /** Mass-assignable columns. */
    protected $fillable = [
        'user_id',
        'first_name',
        'last_name',
        'email',
        'phone',
        'position',
        'hired_at',
        'is_active',
        'shift_id',
    ];

    /** Casts. */
    protected $casts = [
        'hired_at'  => 'date',
        'is_active' => 'boolean',
        'shift_id'  => 'integer',
    ];

    /** Computed attributes to include in API responses. */
    protected $appends = ['full_name'];

    /* ---------------- Relationships ---------------- */

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function salaries()
    {
        return $this->hasMany(Salary::class);
    }

    // Complaints this staff handled
    public function handledComplaints()
    {
        return $this->hasMany(Complaint::class, 'handled_by');
    }

    public function shift()
    {
        return $this->belongsTo(Shift::class);
    }

    public function staffShifts()
    {
        return $this->hasMany(StaffShift::class);
    }

    /* ---------------- Helpers / Scopes ---------------- */

    public function getFullNameAttribute(): string
    {
        return trim(($this->first_name ?? '') . ' ' . ($this->last_name ?? ''));
    }

    public function scopeActive($q, bool $active = true)
    {
        return $q->where('is_active', $active);
    }
}
