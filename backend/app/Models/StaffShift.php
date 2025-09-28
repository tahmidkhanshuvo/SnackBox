<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class StaffShift extends Model
{
    use HasFactory;

    protected $table = 'staff_shifts';

    // Common status labels (optional but handy)
    public const STATUS_ASSIGNED = 'assigned';
    public const STATUS_ACCEPTED = 'accepted';
    public const STATUS_LATE     = 'late';
    public const STATUS_ABSENT   = 'absent';
    public const STATUSES = [
        self::STATUS_ASSIGNED,
        self::STATUS_ACCEPTED,
        self::STATUS_LATE,
        self::STATUS_ABSENT,
    ];

    protected $fillable = [
        'staff_id',
        'shift_id',
        'date',    // YYYY-MM-DD
        'status',  // assigned | accepted | late | absent
    ];

    protected $casts = [
        'date'   => 'date',
        'status' => 'string',
    ];

    /* ---------------- Relationships ---------------- */

    public function shift()
    {
        return $this->belongsTo(Shift::class);
    }

    public function staff()
    {
        return $this->belongsTo(Staff::class);
    }

    /* ---------------- Scopes ---------------- */

    public function scopeOnDate($q, $date)
    {
        $d = $date instanceof \DateTimeInterface ? $date->format('Y-m-d') : (string) $date;
        return $q->whereDate('date', $d);
    }

    public function scopeInWeek($q, $start) // 7-day window starting at $start
    {
        $s = $start instanceof \DateTimeInterface ? Carbon::instance($start) : Carbon::parse($start);
        $e = (clone $s)->addDays(6);
        return $q->whereBetween('date', [$s->toDateString(), $e->toDateString()]);
    }

    public function scopeStatus($q, string $status)
    {
        return $q->where('status', $status);
    }

    /* ---------------- Boot ---------------- */

    protected static function booted(): void
    {
        static::creating(function (self $row) {
            if (!$row->status) {
                $row->status = self::STATUS_ASSIGNED;
            }
        });
    }
}
