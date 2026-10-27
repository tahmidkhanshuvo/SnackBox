<?php

namespace App\Console\Commands;

use App\Models\InventoryMovement;
use App\Models\MenuItem;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class SeedDemoCatalogue extends Command
{
    protected $signature = 'snackbox:seed-catalogue';
    protected $description = 'Populate an empty demo catalogue without creating accounts or replacing data';

    public function handle(): int
    {
        if (MenuItem::exists()) {
            $this->info('The catalogue already contains items. Existing data was preserved.');
            return self::SUCCESS;
        }
        $items = [
            ['Classic Burger', 'Burgers', 180, 'photo-1568901346375-23c9450c58cd'],
            ['Margherita Pizza', 'Pizza', 320, 'photo-1513104890138-7c749659a591'],
            ['Garden Salad', 'Salad', 140, 'photo-1512621776951-a57141f2eefd'],
            ['Chocolate Cake', 'Dessert', 160, 'photo-1578985545062-69928b1d9587'],
            ['Cappuccino', 'Beverages', 110, 'photo-1509042239860-f550ce710b93'],
        ];
        DB::transaction(function () use ($items) {
            foreach ($items as [$name, $category, $price, $photo]) {
                $item = MenuItem::create([
                    'item_name' => $name, 'category' => $category, 'price' => $price,
                    'availability' => true, 'image_alt' => $name . ' — illustrative demo photo',
                    'image_path' => "https://images.unsplash.com/$photo?auto=format&fit=crop&w=720&q=80",
                ]);
                InventoryMovement::create(['menu_item_id' => $item->id, 'delta_qty' => 20, 'type' => 'in', 'reason' => 'Demo opening stock', 'reference' => 'DEMO-CATALOGUE', 'performed_at' => now()]);
            }
        });
        $this->info('Five illustrative demo items created. No accounts or orders were changed.');
        return self::SUCCESS;
    }
}
