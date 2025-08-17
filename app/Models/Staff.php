<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Staff extends Model
{
    use HasFactory;

    protected $primaryKey = 'StaffID';
    protected $fillable = ['Salary'];

    public function deliveries()
    {
        return $this->hasMany(Delivery::class, 'StaffID', 'StaffID');
    }

    public function shifts()
    {
        return $this->belongsToMany(Shift::class, 'StaffShift', 'StaffID', 'ShiftID');
    }

    public function wasteLogs()
    {
        return $this->hasMany(WasteLog::class, 'StaffID', 'StaffID');
    }
}
