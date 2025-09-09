<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Salary extends Model
{
    use HasFactory;

    protected $fillable = [
        'staff_id',
        'for_month',
        'amount',
        'paid_at',
        'status',
        'note',
    ];

    protected $casts = [
        'for_month' => 'date',
        'paid_at'   => 'date',
        'amount'    => 'decimal:2',
    ];

    /* Relationships */
    public function staff()
    {
        return $this->belongsTo(Staff::class);
    }

    /* Scopes & helpers */
    public function scopeForMonth($q, string $ym) // e.g. '2025-09'
    {
        return $q->whereRaw("DATE_FORMAT(for_month, '%Y-%m') = ?", [$ym]);
    }

    public function markPaid(?string $date = null): void
    {
        $this->paid_at = $date ?? now()->toDateString();
        $this->status  = 'paid';
        $this->saveQuietly();
    }
}
