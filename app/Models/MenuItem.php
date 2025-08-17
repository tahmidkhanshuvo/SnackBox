<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MenuItem extends Model
{
    use HasFactory;

    protected $primaryKey = 'ItemID';
    protected $fillable = ['Category', 'Availability', 'Quantity'];

    public function orders()
    {
        return $this->belongsToMany(Order::class, 'OrderMenu', 'ItemID', 'OrderID');
    }

    public function wasteLogs()
    {
        return $this->hasMany(WasteLog::class, 'ItemID', 'ItemID');
    }
}
