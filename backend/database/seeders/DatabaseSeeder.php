<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Carbon;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Check if staff record with id = 1 exists, insert only if not
        if (!DB::table('staff')->where('id', 1)->exists()) {
            DB::table('staff')->insert([
                [
                    'id' => 1,
                    'user_id' => 2,
                    'shift_id' => null,
                    'first_name' => 'Staff',
                    'last_name' => 'Member',
                    'email' => 'staff@example.com',
                    'phone' => '987-654-3210',
                    'position' => 'Staff',
                    'hired_at' => '2023-01-01',
                    'is_active' => true,
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
            ]);
        }

        // Seed Shifts (3 records), only if they don't exist
        $shifts = [
            ['Morning', '08:00:00', '16:00:00'],
            ['Evening', '16:00:00', '00:00:00'],
            ['Night', '00:00:00', '08:00:00'],
        ];
        foreach ($shifts as $shift) {
            if (!DB::table('shifts')->where('name', $shift[0])->exists()) {
                DB::table('shifts')->insert([
                    'name' => $shift[0],
                    'starts_at' => $shift[1],
                    'ends_at' => $shift[2],
                    'is_active' => true,
                    'status' => 'active',
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }

        // Seed Menu Items (5 records)
        DB::table('menu_items')->insert([
            [
                'item_name' => 'Margherita Pizza',
                'category' => 'Pizza',
                'price' => 7.75,
                'availability' => true,
                'image_path' => '/images/margherita.jpg',
                'image_alt' => 'Margherita Pizza',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'item_name' => 'Pepperoni Pizza',
                'category' => 'Pizza',
                'price' => 22.00,
                'availability' => true,
                'image_path' => '/images/pepperoni.jpg',
                'image_alt' => 'Pepperoni Pizza',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'item_name' => 'Caesar Salad',
                'category' => 'Salad',
                'price' => 10.00,
                'availability' => true,
                'image_path' => '/images/caesar.jpg',
                'image_alt' => 'Caesar Salad',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'item_name' => 'Chicken Wings',
                'category' => 'Appetizer',
                'price' => 6.25,
                'availability' => true,
                'image_path' => '/images/wings.jpg',
                'image_alt' => 'Chicken Wings',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'item_name' => 'Tiramisu',
                'category' => 'Dessert',
                'price' => 30.00,
                'availability' => true,
                'image_path' => '/images/tiramisu.jpg',
                'image_alt' => 'Tiramisu',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);

        // Seed Complaints (5 records, User ID 1 as customer, Staff ID 1 as handler)
        DB::table('complaints')->insert([
            [
                'user_id' => 1,
                'subject' => 'Delayed Delivery',
                'message' => 'My order was delayed by 2 hours.',
                'status' => 'Pending',
                'response' => null,
                'handled_by' => 1,
                'resolved_at' => null,
                'created_at' => Carbon::now()->subDays(2),
                'updated_at' => Carbon::now()->subDays(2),
            ],
            [
                'user_id' => 1,
                'subject' => 'Rude Staff',
                'message' => 'The staff was unprofessional.',
                'status' => 'Assigned',
                'response' => null,
                'handled_by' => 1,
                'resolved_at' => null,
                'created_at' => Carbon::now()->subDays(1),
                'updated_at' => Carbon::now()->subDays(1),
            ],
            [
                'user_id' => 1,
                'subject' => 'Cold Food',
                'message' => 'The food arrived cold.',
                'status' => 'Resolved',
                'response' => 'Apologies, a refund has been issued.',
                'handled_by' => 1,
                'resolved_at' => Carbon::now()->subHours(3),
                'created_at' => Carbon::now()->subDays(3),
                'updated_at' => Carbon::now()->subHours(3),
            ],
            [
                'user_id' => 1,
                'subject' => 'Missing Item',
                'message' => 'One item was missing from my order.',
                'status' => 'Pending',
                'response' => null,
                'handled_by' => 1,
                'resolved_at' => null,
                'created_at' => Carbon::now()->subDays(4),
                'updated_at' => Carbon::now()->subDays(4),
            ],
            [
                'user_id' => 1,
                'subject' => 'Overcharged',
                'message' => 'I was charged more than expected.',
                'status' => 'Closed',
                'response' => 'Issue resolved, amount refunded.',
                'handled_by' => 1,
                'resolved_at' => Carbon::now()->subDays(1),
                'created_at' => Carbon::now()->subDays(5),
                'updated_at' => Carbon::now()->subDays(1),
            ],
        ]);

        // Seed Orders (5 records, User ID 1 as customer)
        DB::table('orders')->insert([
            [
                'user_id' => 1,
                'subtotal' => 15.50,
                'tax' => 1.55,
                'discount' => 0.00,
                'total' => 17.05,
                'status' => 'pending',
                'payment_method' => 'card',
                'reference' => 'ORD-001',
                'accepted_by' => 1,
                'accepted_at' => Carbon::now()->subHours(2),
                'cancel_reason' => null,
                'created_at' => Carbon::now()->subHours(3),
                'updated_at' => Carbon::now()->subHours(3),
            ],
            [
                'user_id' => 1,
                'subtotal' => 22.00,
                'tax' => 2.20,
                'discount' => 2.00,
                'total' => 22.20,
                'status' => 'confirmed',
                'payment_method' => 'cash',
                'reference' => 'ORD-002',
                'accepted_by' => 1,
                'accepted_at' => Carbon::now()->subHours(1),
                'cancel_reason' => null,
                'created_at' => Carbon::now()->subHours(4),
                'updated_at' => Carbon::now()->subHours(1),
            ],
            [
                'user_id' => 1,
                'subtotal' => 10.00,
                'tax' => 1.00,
                'discount' => 0.00,
                'total' => 11.00,
                'status' => 'preparing',
                'payment_method' => 'bkash',
                'reference' => 'ORD-003',
                'accepted_by' => 1,
                'accepted_at' => Carbon::now()->subMinutes(30),
                'cancel_reason' => null,
                'created_at' => Carbon::now()->subHours(2),
                'updated_at' => Carbon::now()->subMinutes(30),
            ],
            [
                'user_id' => 1,
                'subtotal' => 18.75,
                'tax' => 1.88,
                'discount' => 1.00,
                'total' => 19.63,
                'status' => 'ready',
                'payment_method' => 'card',
                'reference' => 'ORD-004',
                'accepted_by' => 1,
                'accepted_at' => Carbon::now()->subHours(5),
                'cancel_reason' => null,
                'created_at' => Carbon::now()->subHours(6),
                'updated_at' => Carbon::now()->subHours(5),
            ],
            [
                'user_id' => 1,
                'subtotal' => 30.00,
                'tax' => 3.00,
                'discount' => 0.00,
                'total' => 33.00,
                'status' => 'completed',
                'payment_method' => 'cash',
                'reference' => 'ORD-005',
                'accepted_by' => 1,
                'accepted_at' => Carbon::now()->subDays(1),
                'cancel_reason' => null,
                'created_at' => Carbon::now()->subDays(2),
                'updated_at' => Carbon::now()->subDays(1),
            ],
        ]);

        // Seed Order Items (5 records, linked to Orders)
        DB::table('order_items')->insert([
            [
                'order_id' => 1,
                'menu_item_id' => 1,
                'quantity' => 2,
                'unit_price' => 7.75,
                'line_total' => 15.50,
                'note' => 'Extra spicy',
                'addons' => json_encode(['Extra Cheese' => 1.00]),
                'selections' => json_encode(['Size' => 'Large']),
                'created_at' => Carbon::now()->subHours(3),
                'updated_at' => Carbon::now()->subHours(3),
            ],
            [
                'order_id' => 2,
                'menu_item_id' => 2,
                'quantity' => 1,
                'unit_price' => 22.00,
                'line_total' => 22.00,
                'note' => 'No onions',
                'addons' => json_encode(['Extra Sauce' => 0.50]),
                'selections' => json_encode(['Size' => 'Medium']),
                'created_at' => Carbon::now()->subHours(4),
                'updated_at' => Carbon::now()->subHours(1),
            ],
            [
                'order_id' => 3,
                'menu_item_id' => 3,
                'quantity' => 1,
                'unit_price' => 10.00,
                'line_total' => 10.00,
                'note' => null,
                'addons' => null,
                'selections' => null,
                'created_at' => Carbon::now()->subHours(2),
                'updated_at' => Carbon::now()->subMinutes(30),
            ],
            [
                'order_id' => 4,
                'menu_item_id' => 4,
                'quantity' => 3,
                'unit_price' => 6.25,
                'line_total' => 18.75,
                'note' => 'Well-done',
                'addons' => json_encode(['Extra Topping' => 1.50]),
                'selections' => json_encode(['Size' => 'Small']),
                'created_at' => Carbon::now()->subHours(6),
                'updated_at' => Carbon::now()->subHours(5),
            ],
            [
                'order_id' => 5,
                'menu_item_id' => 5,
                'quantity' => 1,
                'unit_price' => 30.00,
                'line_total' => 30.00,
                'note' => 'No substitutions',
                'addons' => null,
                'selections' => null,
                'created_at' => Carbon::now()->subDays(2),
                'updated_at' => Carbon::now()->subDays(1),
            ],
        ]);

        // Seed Inventory Movements (5 records, linked to Menu Items)
        DB::table('inventory_movements')->insert([
            [
                'menu_item_id' => 1,
                'delta_qty' => 10,
                'type' => 'in',
                'reason' => 'New stock',
                'reference' => 'PO-001',
                'performed_by' => 1,
                'performed_at' => Carbon::now()->subDays(1),
                'created_at' => Carbon::now()->subDays(1),
                'updated_at' => Carbon::now()->subDays(1),
            ],
            [
                'menu_item_id' => 2,
                'delta_qty' => -5,
                'type' => 'out',
                'reason' => 'Sold',
                'reference' => 'ORD-002',
                'performed_by' => 1,
                'performed_at' => Carbon::now()->subHours(4),
                'created_at' => Carbon::now()->subHours(4),
                'updated_at' => Carbon::now()->subHours(4),
            ],
            [
                'menu_item_id' => 3,
                'delta_qty' => 0,
                'type' => 'adjustment',
                'reason' => 'Inventory check',
                'reference' => 'INV-001',
                'performed_by' => 1,
                'performed_at' => Carbon::now()->subDays(2),
                'created_at' => Carbon::now()->subDays(2),
                'updated_at' => Carbon::now()->subDays(2),
            ],
            [
                'menu_item_id' => 4,
                'delta_qty' => -3,
                'type' => 'out',
                'reason' => 'Spoilage',
                'reference' => null,
                'performed_by' => 1,
                'performed_at' => Carbon::now()->subHours(6),
                'created_at' => Carbon::now()->subHours(6),
                'updated_at' => Carbon::now()->subHours(6),
            ],
            [
                'menu_item_id' => 5,
                'delta_qty' => 5,
                'type' => 'in',
                'reason' => 'Restock',
                'reference' => 'PO-002',
                'performed_by' => 1,
                'performed_at' => Carbon::now()->subDays(3),
                'created_at' => Carbon::now()->subDays(3),
                'updated_at' => Carbon::now()->subDays(3),
            ],
        ]);

        // Seed Salaries (5 records, Staff ID 1)
        DB::table('salaries')->insert([
            [
                'staff_id' => 1,
                'for_month' => '2025-09-01',
                'amount' => 2000.00,
                'paid_at' => null,
                'status' => 'pending',
                'note' => 'Pending approval',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'staff_id' => 1,
                'for_month' => '2025-08-01',
                'amount' => 2000.00,
                'paid_at' => Carbon::now()->subDays(10),
                'status' => 'paid',
                'note' => 'Paid on time',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'staff_id' => 1,
                'for_month' => '2025-07-01',
                'amount' => 2000.00,
                'paid_at' => Carbon::now()->subDays(40),
                'status' => 'paid',
                'note' => 'Paid late',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'staff_id' => 1,
                'for_month' => '2025-06-01',
                'amount' => 2000.00,
                'paid_at' => null,
                'status' => 'failed',
                'note' => 'Payment failed',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'staff_id' => 1,
                'for_month' => '2025-05-01',
                'amount' => 2000.00,
                'paid_at' => Carbon::now()->subDays(80),
                'status' => 'paid',
                'note' => 'Paid early',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);

        // Seed Staff Shifts (5 records, Staff ID 1, Shift IDs 1-3)
        DB::table('staff_shifts')->insert([
            [
                'staff_id' => 1,
                'shift_id' => 1,
                'date' => '2025-09-20',
                'status' => 'assigned',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'staff_id' => 1,
                'shift_id' => 2,
                'date' => '2025-09-21',
                'status' => 'assigned',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'staff_id' => 1,
                'shift_id' => 3,
                'date' => '2025-09-22',
                'status' => 'assigned',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'staff_id' => 1,
                'shift_id' => 1,
                'date' => '2025-09-23',
                'status' => 'assigned',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'staff_id' => 1,
                'shift_id' => 2,
                'date' => '2025-09-24',
                'status' => 'assigned',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }
}