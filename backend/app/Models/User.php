<?php

namespace App\Models;

use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasOne; // Import the HasOne relationship
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     * Adjust according to your users table.
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
    ];

    /**
     * The attributes hidden for arrays / JSON.
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Attribute casting.
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed', // It's good practice to ensure password is cast to hashed
    ];

    /**
     * --- THIS IS THE FIX ---
     * Defines the one-to-one relationship between a User and a Staff profile.
     * This tells Laravel how to find the staff details for a given user.
     */
    public function staff(): HasOne
    {
        return $this->hasOne(Staff::class);
    }
}

