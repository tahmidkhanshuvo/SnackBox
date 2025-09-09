<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use App\Models\MenuItem;
use App\Models\InventoryMovement;
use App\Models\Staff;
use App\Models\Salary;
use App\Models\Complaint;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // --- Users ---
        $admin = User::updateOrCreate(
            ['email' => 'admin@snackbox.test'],
            ['name' => 'Admin', 'password' => Hash::make('secret123')]
        );

        $customer = User::updateOrCreate(
            ['email' => 'customer@snackbox.test'],
            ['name' => 'Customer', 'password' => Hash::make('password')]
        );

        // --- Menu Items (no images seeded here; you can upload later via API) ---
        $itemsData = [
            ['item_name' => 'Chicken Sandwich', 'category' => 'Snacks', 'availability' => true],
            ['item_name' => 'Veggie Wrap',      'category' => 'Snacks', 'availability' => true],
            ['item_name' => 'Iced Coffee',      'category' => 'Drinks', 'availability' => true],
            ['item_name' => 'Hot Tea',          'category' => 'Drinks', 'availability' => true],
        ];

        $items = [];
        foreach ($itemsData as $data) {
            $items[] = MenuItem::updateOrCreate(
                ['item_name' => $data['item_name']],
                ['category' => $data['category'], 'availability' => $data['availability']]
            );
        }

        // --- Opening stock (auditable via inventory_movements) ---
        // +50 for each item
        foreach ($items as $item) {
            InventoryMovement::create([
                'menu_item_id' => $item->id,
                'delta_qty'    => 50,
                'type'         => 'in',
                'reason'       => 'opening stock',
                'reference'    => 'SEED-OPEN',
                'performed_by' => $admin->id,
                'performed_at' => now(),
            ]);
        }

        // --- Staff ---
        $staff = Staff::updateOrCreate(
            ['email' => 'sam.cook@snackbox.test'],
            [
                'first_name' => 'Sam',
                'last_name'  => 'Cook',
                'phone'      => '01700000000',
                'position'   => 'cashier',
                'hired_at'   => now()->subMonths(3)->toDateString(),
                'is_active'  => true,
                // link to user if you want a login for staff:
                'user_id'    => null,
            ]
        );

        // --- Salary (this month, paid) ---
        Salary::updateOrCreate(
            ['staff_id' => $staff->id, 'for_month' => now()->startOfMonth()->toDateString()],
            [
                'amount'  => 15000,
                'paid_at' => now()->toDateString(),
                'status'  => 'paid',
                'note'    => 'Seeded payment',
            ]
        );

        // --- Complaint (filed by customer, unassigned) ---
        Complaint::updateOrCreate(
            ['user_id' => $customer->id, 'subject' => 'Cold food'],
            [
                'message' => 'Soup arrived cold in the afternoon.',
                'status'  => 'open',
            ]
        );
    }
}
