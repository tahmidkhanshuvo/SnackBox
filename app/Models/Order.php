<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    use HasFactory;

    protected $primaryKey = 'OrderID';
    protected $fillable = [
        'UserID', 'Status'
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'UserID', 'UserID');
    }

    public function orderQueue()
    {
        return $this->hasOne(OrderQueue::class, 'OrderID', 'OrderID');
    }

    public function menuItems()
    {
        return $this->belongsToMany(MenuItem::class, 'OrderMenu', 'OrderID', 'ItemID');
    }
}
