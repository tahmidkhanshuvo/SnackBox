<?php

namespace App\Http\Controllers;

use App\Models\MenuItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class SuggestionController extends Controller
{
    /**
     * Get menu suggestions for the authenticated user.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function getSuggestions(Request $request)
    {
        $popularItems = $this->getPopularItems();
        $pastOrderItems = $this->getPastOrderItems();

        // Merge the collections and remove duplicates, keeping popular items first
        $suggestions = $popularItems->merge($pastOrderItems)->unique('id');

        return response()->json($suggestions);
    }

    /**
     * Get the most popular menu items.
     *
     * @return \Illuminate\Database\Eloquent\Collection
     */
    private function getPopularItems()
    {
        // Get the IDs of the most ordered menu items
        $popularItemIds = DB::table('order_items')
            ->select('menu_item_id', DB::raw('COUNT(menu_item_id) as occurrences'))
            ->groupBy('menu_item_id')
            ->orderByDesc('occurrences')
            ->limit(5) // Let's suggest top 5 popular items
            ->pluck('menu_item_id');

        // Fetch the corresponding MenuItem models
        return MenuItem::whereIn('id', $popularItemIds)->get();
    }

    /**
     * Get menu items from the user's past orders.
     *
     * @return \Illuminate\Database\Eloquent\Collection
     */
    private function getPastOrderItems()
    {
        $user = Auth::user();
        if (!$user) {
            return collect(); // Return an empty collection if no user is authenticated
        }

        // Get the IDs of menu items from the user's past orders
        $pastOrderItemIds = $user->orders()
            ->with('items.menuItem') // Eager load menu items
            ->get()
            ->flatMap(function ($order) {
                return $order->items;
            })
            ->pluck('menuItem.id')
            ->unique();

        // Fetch the corresponding MenuItem models
        return MenuItem::whereIn('id', $pastOrderItemIds)->get();
    }
}
