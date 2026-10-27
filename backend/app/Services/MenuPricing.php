<?php
namespace App\Services;

use App\Models\MenuItem;
use Illuminate\Validation\ValidationException;

class MenuPricing
{
    // Existing customization prices now have a server-owned source of truth.
    public static function unitPrice(MenuItem $item, array $line): float
    {
        $selections = $line['selections'] ?? [];
        $addons = $line['addons'] ?? [];
        $options = ['size' => ['regular' => 0, 'large' => 60], 'spice' => ['mild' => 0, 'medium' => 0, 'hot' => 0]];
        $extras = ['extras' => ['cheese' => 40, 'bacon' => 80, 'avocado' => 70], 'sauces' => ['garlic' => 20, 'chipotle' => 25, 'bbq' => 20]];
        $price = (float) $item->price;
        foreach ($selections as $group => $choice) {
            if (!is_string($choice) || !isset($options[$group]) || !array_key_exists($choice, $options[$group])) self::invalid();
            $price += $options[$group][$choice];
        }
        foreach ($addons as $group => $choices) {
            if (!isset($extras[$group]) || !is_array($choices) || count($choices) > ($group === 'sauces' ? 2 : 3) || count(array_unique($choices, SORT_REGULAR)) !== count($choices)) self::invalid();
            foreach ($choices as $choice) {
                if (!is_string($choice) || !array_key_exists($choice, $extras[$group])) self::invalid();
                $price += $extras[$group][$choice];
            }
        }
        return round($price, 2);
    }

    private static function invalid(): never
    {
        throw ValidationException::withMessages(['items' => ['Invalid menu customization. Please review your cart.']]);
    }
}
