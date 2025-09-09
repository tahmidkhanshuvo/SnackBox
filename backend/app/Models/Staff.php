<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Staff extends Model
{
    use HasFactory;

    // IMPORTANT: our table name is 'staff' (not the default 'staffs')
    protected $table = 'staff';

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

    protected $casts = [
        'hired_at'  => 'date',
        'is_active' => 'boolean',
        'shift_id'  => 'integer',
    ];

    /* Relationships */
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

    /* Helpers */
    public function getFullNameAttribute(): string
    {
        return trim(($this->first_name ?? '') . ' ' . ($this->last_name ?? ''));
    }

    public function scopeActive($q, bool $active = true)
    {
        return $q->where('is_active', $active);
    }
}
