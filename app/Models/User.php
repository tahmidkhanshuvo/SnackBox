<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class User extends Model
{
    use HasFactory;

    protected $primaryKey = 'UserID';
    protected $fillable = [
        'FirstName', 'LastName', 'ContactNo', 'Email', 'FullName', 'TotalSpent'
    ];

    public function subscriptions()
    {
        return $this->hasOne(Subscription::class, 'UserID', 'UserID');
    }

    public function orders()
    {
        return $this->hasMany(Order::class, 'UserID', 'UserID');
    }

    public function feedbacks()
    {
        return $this->hasMany(Feedback::class, 'UserID', 'UserID');
    }

    public function complaints()
    {
        return $this->hasMany(Complaint::class, 'UserID', 'UserID');
    }

    public function account()
    {
        return $this->hasOne(UserAccount::class, 'UserID', 'UserID');
    }
}
