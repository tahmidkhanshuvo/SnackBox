<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Offer extends Model
{
    use HasFactory;

    protected $fillable = ['DiscountPercent', 'SuggestedMenu'];

    public function menuItems()
    {
        return $this->belongsToMany(MenuItem::class, 'OfferMenu', 'OfferID', 'ItemID');
    }
}
