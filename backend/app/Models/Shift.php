<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class Shift extends Model
{
    use HasFactory;

    // protected $table = 'shifts';

    protected $fillable = [
        'name',        // e.g., "Morning", "Evening", "Night"
        'starts_at',   // "HH:MM:SS"
        'ends_at',     // "HH:MM:SS"
        'is_active',   // bool
        'status',      // optional status flag
    ];

    protected $casts = [
        'is_active' => 'boolean',
        // Store as TIME in DB; expose as "HH:MM:SS" strings to the app
        'starts_at' => 'string',
        'ends_at'   => 'string',
    ];

    protected $appends = ['label'];

    /* ---------------- Accessors / Mutators ---------------- */

    public function getLabelAttribute(): string
    {
        $s = $this->formatTime($this->starts_at);
        $e = $this->formatTime($this->ends_at);
        $n = trim((string) ($this->name ?? 'Shift'));
        return $s && $e ? "{$n} ({$s}–{$e})" : $n;
    }

    public function setStartsAtAttribute($value): void
    {
        $this->attributes['starts_at'] = $this->normalizeTime($value);
    }

    public function setEndsAtAttribute($value): void
    {
        $this->attributes['ends_at'] = $this->normalizeTime($value);
    }

    private function normalizeTime($value): ?string
    {
        if ($value === null || $value === '') return null;

        // Accept "H:i", "H:i:s", or Carbon/DateTime; store "H:i:s"
        if ($value instanceof \DateTimeInterface) {
            return $value->format('H:i:s');
        }
        $str = trim((string) $value);

        foreach (['H:i:s', 'H:i'] as $fmt) {
            try {
                $t = Carbon::createFromFormat($fmt, $str);
                return $t->format('H:i:s');
            } catch (\Throwable $e) {}
        }

        // Last resort: let strtotime try
        $ts = strtotime($str);
        return $ts ? date('H:i:s', $ts) : null;
    }

    private function formatTime(?string $t): ?string
    {
        if (!$t) return null;
        try {
            return Carbon::createFromFormat('H:i:s', $t)->format('H:i');
        } catch (\Throwable $e) {
            return $t;
        }
    }

    /* ---------------- Relationships ---------------- */

    public function staffShifts()
    {
        return $this->hasMany(StaffShift::class);
    }

    public function staff()
    {
        return $this->hasManyThrough(Staff::class, StaffShift::class);
    }

    /* ---------------- Scopes / Boot ---------------- */

    public function scopeActive($q, bool $active = true)
    {
        return $q->where('is_active', $active);
    }

    protected static function booted(): void
    {
        static::creating(function (self $shift) {
            if ($shift->is_active === null) $shift->is_active = true;
        });
    }
}
