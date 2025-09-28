<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * Mass-assignable attributes.
     */
    protected $fillable = [
        'name',
        'first_name',
        'last_name',
        'email',
        'password',
        'contact_no',
        'account_id',
        'role',
        // Note: avatar_path is set explicitly (not mass-filled), so it's optional here.
        // 'avatar_path',
    ];

    /**
     * Hidden attributes for arrays / JSON.
     */
    protected $hidden = [
        'password',
        'remember_token',
        'avatar_path', // avoid leaking internal storage path
    ];

    /**
     * Attribute casting.
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
        'password'          => 'hashed',
    ];

    /**
     * Computed attributes automatically included in JSON.
     */
    protected $appends = [
        'display_name',
        'avatar_url',
    ];

    /**
     * One-to-one Staff profile.
     * Staff table is explicitly named 'staff' (model handles it), FK is user_id.
     */
    public function staff(): HasOne
    {
        return $this->hasOne(Staff::class, 'user_id', 'id');
    }

    /* ----------------- Convenience helpers for roles/approval ----------------- */

    /** True if role is 'admin' or 'superadmin'. */
    public function isAdmin(): bool
    {
        $role = strtolower((string) ($this->role ?? ''));
        return in_array($role, ['admin', 'superadmin'], true);
    }

    /** True if role is 'staff'. */
    public function isStaff(): bool
    {
        return strtolower((string) ($this->role ?? '')) === 'staff';
    }

    /** True if the related staff row exists and is active/approved. */
    public function isStaffApproved(): bool
    {
        return (bool) ($this->staff?->is_active ?? false);
    }

    /** Virtual display name: prefer split name when available, fallback to name. */
    public function getDisplayNameAttribute(): string
    {
        $first = trim((string) ($this->first_name ?? ''));
        $last  = trim((string) ($this->last_name ?? ''));
        $full  = trim($first . ' ' . $last);
        return $full !== '' ? $full : (string) ($this->name ?? '');
    }

    /** Public URL for avatar file stored on the 'public' disk. */
    public function getAvatarUrlAttribute(): ?string
    {
        $path = (string) ($this->attributes['avatar_path'] ?? '');
        return $path !== '' ? Storage::disk('public')->url($path) : null;
    }
}
