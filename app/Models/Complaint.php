<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Complaint extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'subject',
        'message',
        'status',
        'response',
        'handled_by',
        'resolved_at',
    ];

    protected $casts = [
        'resolved_at' => 'datetime',
    ];

    /* Relationships */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function handler()
    {
        return $this->belongsTo(Staff::class, 'handled_by');
    }

    /* Scopes & helpers */
    public function scopeStatus($q, string $status)
    {
        return $q->where('status', $status);
    }

    public function markResolved(int $byStaffId, ?string $response = null): void
    {
        $this->handled_by  = $byStaffId;
        if ($response !== null) {
            $this->response = $response;
        }
        $this->status      = 'resolved';
        $this->resolved_at = now();
        $this->saveQuietly();
    }
}
