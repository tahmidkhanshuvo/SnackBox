<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Carbon;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        DB::transaction(function () {

            // --- USERS (parents first) ---
            $customerEmail = 'customer@example.com';
            $staffEmail    = 'staff@example.com';

            // Customer user
            $customer = DB::table('users')->where('email', $customerEmail)->first();
            if (!$customer) {
                $customerId = DB::table('users')->insertGetId([
                    'name'       => 'Customer One',
                    'email'      => $customerEmail,
                    'password'   => Hash::make('password'),
                    'created_at' => now(), 'updated_at' => now(),
                ]);
            } else {
                $customerId = $customer->id;
                DB::table('users')->where('id', $customerId)->update(['updated_at' => now()]);
            }

            // Staff-linked user
            $staffUser = DB::table('users')->where('email', $staffEmail)->first();
            if (!$staffUser) {
                $staffUserId = DB::table('users')->insertGetId([
                    'name'       => 'Staff Member',
                    'email'      => $staffEmail,
                    'password'   => Hash::make('password'),
                    'created_at' => now(), 'updated_at' => now(),
                ]);
            } else {
                $staffUserId = $staffUser->id;
                DB::table('users')->where('id', $staffUserId)->update(['updated_at' => now()]);
            }

            // --- SHIFTS ---
            $shiftsData = [
                ['name' => 'Morning', 'starts_at' => '08:00:00', 'ends_at' => '16:00:00', 'status' => 'active'],
                ['name' => 'Evening', 'starts_at' => '16:00:00', 'ends_at' => '00:00:00', 'status' => 'active'],
                ['name' => 'Night',   'starts_at' => '00:00:00', 'ends_at' => '08:00:00', 'status' => 'active'],
            ];
            $shiftIds = [];
            foreach ($shiftsData as $s) {
                $row = DB::table('shifts')->where('name', $s['name'])->first();
                if (!$row) {
                    $id = DB::table('shifts')->insertGetId([
                        'name'       => $s['name'],
                        'starts_at'  => $s['starts_at'],
                        'ends_at'    => $s['ends_at'],
                        'is_active'  => true,
                        'status'     => $s['status'],
                        'created_at' => now(), 'updated_at' => now(),
                    ]);
                } else {
                    $id = $row->id;
                    DB::table('shifts')->where('id', $id)->update([
                        'starts_at'  => $s['starts_at'],
                        'ends_at'    => $s['ends_at'],
                        'is_active'  => true,
                        'status'     => $s['status'],
                        'updated_at' => now(),
                    ]);
                }
                $shiftIds[$s['name']] = $id;
            }

            // --- STAFF (link to staff user + a real shift id) ---
            $staff = DB::table('staff')->where('email', $staffEmail)->first();
            if (!$staff) {
                $staffId = DB::table('staff')->insertGetId([
                    'user_id'    => $staffUserId,
                    'shift_id'   => $shiftIds['Morning'] ?? null,
                    'first_name' => 'Staff',
                    'last_name'  => 'Member',
                    'email'      => $staffEmail,
                    'phone'      => '987-654-3210',
                    'position'   => 'Staff',
                    'hired_at'   => '2023-01-01',
                    'is_active'  => true,
                    'created_at' => now(), 'updated_at' => now(),
                ]);
            } else {
                $staffId = $staff->id;
                DB::table('staff')->where('id', $staffId)->update([
                    'user_id'    => $staffUserId,
                    'shift_id'   => $shiftIds['Morning'] ?? null,
                    'position'   => 'Staff',
                    'is_active'  => true,
                    'updated_at' => now(),
                ]);
            }

            // --- MENU ITEMS ---
            $menuSeed = [
                ['item_name' => 'Margherita Pizza', 'category' => 'Pizza',     'price' => 7.75, 'image_path' => 'https://t3.ftcdn.net/jpg/02/91/35/16/360_F_291351654_FFAS60r2iHUkOY69RPRwEOVS76EU4SdA.jpg', 'image_alt' => 'A delicious Margherita Pizza with fresh tomatoes and basil'],
                ['item_name' => 'Pepperoni Pizza',  'category' => 'Pizza',     'price' => 22.0, 'image_path' => '/storage/images/pepperoni.jpg', 'image_alt' => 'A spicy Pepperoni Pizza with melted cheese'],
                ['item_name' => 'Caesar Salad',     'category' => 'Salad',     'price' => 10.0, 'image_path' => '/storage/images/caesar.jpg',    'image_alt' => 'A fresh Caesar Salad with croutons and dressing'],
                ['item_name' => 'Chicken Wings',    'category' => 'Appetizer', 'price' => 6.25, 'image_path' => '/storage/images/chicken_wings.jpg', 'image_alt' => 'Crispy Chicken Wings with sauce'],
                ['item_name' => 'Tiramisu',         'category' => 'Dessert',   'price' => 30.0, 'image_path' => '/storage/images/tiramisu.jpg',  'image_alt' => 'A creamy Tiramisu dessert with coffee flavor'],
            ];
            $menuIds = [];
            foreach ($menuSeed as $m) {
                $row = DB::table('menu_items')->where('item_name', $m['item_name'])->first();
                $payload = [
                    'category'    => $m['category'],
                    'price'       => $m['price'],
                    'availability'=> true,
                    'image_path'  => $m['image_path'],
                    'image_alt'   => $m['image_alt'],
                    'updated_at'  => now(),
                ];
                if (!$row) {
                    $id = DB::table('menu_items')->insertGetId($payload + ['item_name' => $m['item_name'], 'created_at' => now()]);
                } else {
                    $id = $row->id;
                    DB::table('menu_items')->where('id', $id)->update($payload);
                }
                $menuIds[$m['item_name']] = $id;
            }

            // --- ORDERS (reference real IDs) ---
            $ordersSeed = [
                ['ref' => 'ORD-001', 'subtotal' => 15.50, 'tax' => 1.55, 'discount' => 0.00, 'total' => 17.05, 'status' => 'pending',   'payment_method' => 'card', 'accepted_by' => $staffId, 'accepted_at' => Carbon::now()->subHours(2)],
                ['ref' => 'ORD-002', 'subtotal' => 22.00, 'tax' => 2.20, 'discount' => 2.00, 'total' => 22.20, 'status' => 'confirmed', 'payment_method' => 'cash', 'accepted_by' => $staffId, 'accepted_at' => Carbon::now()->subHours(1)],
                ['ref' => 'ORD-003', 'subtotal' => 10.00, 'tax' => 1.00, 'discount' => 0.00, 'total' => 11.00, 'status' => 'preparing', 'payment_method' => 'bkash','accepted_by' => $staffId, 'accepted_at' => Carbon::now()->subMinutes(30)],
                ['ref' => 'ORD-004', 'subtotal' => 18.75, 'tax' => 1.88, 'discount' => 1.00, 'total' => 19.63, 'status' => 'ready',     'payment_method' => 'card', 'accepted_by' => $staffId, 'accepted_at' => Carbon::now()->subHours(5)],
                ['ref' => 'ORD-005', 'subtotal' => 30.00, 'tax' => 3.00, 'discount' => 0.00, 'total' => 33.00, 'status' => 'completed', 'payment_method' => 'cash', 'accepted_by' => $staffId, 'accepted_at' => Carbon::now()->subDays(1)],
            ];
            $orderIds = [];
            foreach ($ordersSeed as $o) {
                $row = DB::table('orders')->where('reference', $o['ref'])->first();
                $payload = [
                    'user_id'       => $customerId,
                    'subtotal'      => $o['subtotal'],
                    'tax'           => $o['tax'],
                    'discount'      => $o['discount'],
                    'total'         => $o['total'],
                    'status'        => $o['status'],
                    'payment_method'=> $o['payment_method'],
                    'accepted_by'   => $o['accepted_by'],
                    'accepted_at'   => $o['accepted_at'],
                    'updated_at'    => now(),
                ];
                if (!$row) {
                    $id = DB::table('orders')->insertGetId($payload + [
                        'reference'  => $o['ref'],
                        'created_at' => Carbon::now()->subHours(3),
                    ]);
                } else {
                    $id = $row->id;
                    DB::table('orders')->where('id', $id)->update($payload);
                }
                $orderIds[$o['ref']] = $id;
            }

            // --- ORDER ITEMS ---
            $orderItems = [
                ['ref' => 'ORD-001', 'item' => 'Margherita Pizza', 'qty' => 2, 'unit' => 7.75, 'line' => 15.50, 'note' => 'Extra spicy', 'addons' => ['Extra Cheese' => 1.00], 'sel' => ['Size' => 'Large']],
                ['ref' => 'ORD-002', 'item' => 'Pepperoni Pizza',  'qty' => 1, 'unit' => 22.00, 'line' => 22.00, 'note' => 'No onions',   'addons' => ['Extra Sauce'  => 0.50], 'sel' => ['Size' => 'Medium']],
                ['ref' => 'ORD-003', 'item' => 'Caesar Salad',     'qty' => 1, 'unit' => 10.00, 'line' => 10.00, 'note' => null,         'addons' => null,                      'sel' => null],
                ['ref' => 'ORD-004', 'item' => 'Chicken Wings',    'qty' => 3, 'unit' => 6.25,  'line' => 18.75, 'note' => 'Well-done',  'addons' => ['Extra Topping' => 1.50], 'sel' => ['Size' => 'Small']],
                ['ref' => 'ORD-005', 'item' => 'Tiramisu',         'qty' => 1, 'unit' => 30.00, 'line' => 30.00, 'note' => 'No substitutions', 'addons' => null,                'sel' => null],
            ];
            foreach ($orderItems as $oi) {
                $orderId = $orderIds[$oi['ref']] ?? null;
                $menuId  = $menuIds[$oi['item']] ?? null;
                if (!$orderId || !$menuId) continue;

                // Avoid duplicates by matching order_id + menu_item_id + note
                $exists = DB::table('order_items')
                    ->where(compact('orderId', 'menuId'))
                    ->where('note', $oi['note'])
                    ->first();

                if (!$exists) {
                    DB::table('order_items')->insert([
                        'order_id'     => $orderId,
                        'menu_item_id' => $menuId,
                        'quantity'     => $oi['qty'],
                        'unit_price'   => $oi['unit'],
                        'line_total'   => $oi['line'],
                        'note'         => $oi['note'],
                        'addons'       => $oi['addons'] ? json_encode($oi['addons']) : null,
                        'selections'   => $oi['sel'] ? json_encode($oi['sel']) : null,
                        'created_at'   => now()->subHours(2),
                        'updated_at'   => now()->subHours(1),
                    ]);
                }
            }

            // --- INVENTORY MOVEMENTS ---
            $inv = [
                ['item' => 'Margherita Pizza', 'delta' => 10,  'type' => 'in',          'reason' => 'New stock',  'ref' => 'PO-001', 'when' => Carbon::now()->subDays(1)],
                ['item' => 'Pepperoni Pizza',  'delta' => -5,  'type' => 'out',         'reason' => 'Sold',       'ref' => 'ORD-002','when' => Carbon::now()->subHours(4)],
                ['item' => 'Caesar Salad',     'delta' => 0,   'type' => 'adjustment',  'reason' => 'Inventory check', 'ref' => 'INV-001','when' => Carbon::now()->subDays(2)],
                ['item' => 'Chicken Wings',    'delta' => -3,  'type' => 'out',         'reason' => 'Spoilage',   'ref' => null,     'when' => Carbon::now()->subHours(6)],
                ['item' => 'Tiramisu',         'delta' => 5,   'type' => 'in',          'reason' => 'Restock',    'ref' => 'PO-002', 'when' => Carbon::now()->subDays(3)],
            ];
            foreach ($inv as $row) {
                $menuId = $menuIds[$row['item']] ?? null;
                if (!$menuId) continue;
                $exists = DB::table('inventory_movements')
                    ->where('menu_item_id', $menuId)
                    ->where('type', $row['type'])
                    ->where('reason', $row['reason'])
                    ->where('reference', $row['ref'])
                    ->first();
                if (!$exists) {
                    DB::table('inventory_movements')->insert([
                        'menu_item_id' => $menuId,
                        'delta_qty'    => $row['delta'],
                        'type'         => $row['type'],
                        'reason'       => $row['reason'],
                        'reference'    => $row['ref'],
                        'performed_by' => $staffId,
                        'performed_at' => $row['when'],
                        'created_at'   => $row['when'],
                        'updated_at'   => $row['when'],
                    ]);
                }
            }

            // --- SALARIES ---
            $salaries = [
                ['ym' => '2025-09-01', 'amount' => 2000.00, 'status' => 'pending', 'note' => 'Pending approval', 'paid_at' => null],
                ['ym' => '2025-08-01', 'amount' => 2000.00, 'status' => 'paid',    'note' => 'Paid on time',     'paid_at' => Carbon::now()->subDays(10)],
                ['ym' => '2025-07-01', 'amount' => 2000.00, 'status' => 'paid',    'note' => 'Paid late',        'paid_at' => Carbon::now()->subDays(40)],
                ['ym' => '2025-06-01', 'amount' => 2000.00, 'status' => 'failed',  'note' => 'Payment failed',   'paid_at' => null],
                ['ym' => '2025-05-01', 'amount' => 2000.00, 'status' => 'paid',    'note' => 'Paid early',       'paid_at' => Carbon::now()->subDays(80)],
            ];
            foreach ($salaries as $sal) {
                $exists = DB::table('salaries')
                    ->where('staff_id', $staffId)
                    ->where('for_month', $sal['ym'])
                    ->first();
                if (!$exists) {
                    DB::table('salaries')->insert([
                        'staff_id'   => $staffId,
                        'for_month'  => $sal['ym'],
                        'amount'     => $sal['amount'],
                        'paid_at'    => $sal['paid_at'],
                        'status'     => $sal['status'],
                        'note'       => $sal['note'],
                        'created_at' => now(), 'updated_at' => now(),
                    ]);
                }
            }

            // --- STAFF SHIFTS ---
            $staffShiftRows = [
                ['name' => 'Morning', 'date' => '2025-09-20'],
                ['name' => 'Evening', 'date' => '2025-09-21'],
                ['name' => 'Night',   'date' => '2025-09-22'],
                ['name' => 'Morning', 'date' => '2025-09-23'],
                ['name' => 'Evening', 'date' => '2025-09-24'],
            ];
            foreach ($staffShiftRows as $ss) {
                $shiftId = $shiftIds[$ss['name']] ?? null;
                if (!$shiftId) continue;
                $exists = DB::table('staff_shifts')
                    ->where('staff_id', $staffId)
                    ->where('shift_id', $shiftId)
                    ->where('date', $ss['date'])
                    ->first();
                if (!$exists) {
                    DB::table('staff_shifts')->insert([
                        'staff_id'   => $staffId,
                        'shift_id'   => $shiftId,
                        'date'       => $ss['date'],
                        'status'     => 'assigned',
                        'created_at' => now(), 'updated_at' => now(),
                    ]);
                }
            }

            // --- COMPLAINTS (link to real user/staff) ---
            $complaints = [
                ['subject' => 'Delayed Delivery', 'message' => 'My order was delayed by 2 hours.',              'status' => 'Pending',  'response' => null,                         'created_at' => Carbon::now()->subDays(2), 'updated_at' => Carbon::now()->subDays(2)],
                ['subject' => 'Rude Staff',       'message' => 'The staff was unprofessional.',                 'status' => 'Assigned', 'response' => null,                         'created_at' => Carbon::now()->subDays(1), 'updated_at' => Carbon::now()->subDays(1)],
                ['subject' => 'Cold Food',        'message' => 'The food arrived cold.',                        'status' => 'Resolved', 'response' => 'Apologies, a refund issued.', 'created_at' => Carbon::now()->subDays(3), 'updated_at' => Carbon::now()->subHours(3), 'resolved_at' => Carbon::now()->subHours(3)],
                ['subject' => 'Missing Item',     'message' => 'One item was missing from my order.',           'status' => 'Pending',  'response' => null,                         'created_at' => Carbon::now()->subDays(4), 'updated_at' => Carbon::now()->subDays(4)],
                ['subject' => 'Overcharged',      'message' => 'I was charged more than expected.',             'status' => 'Closed',   'response' => 'Issue resolved, refunded.',  'created_at' => Carbon::now()->subDays(5), 'updated_at' => Carbon::now()->subDays(1), 'resolved_at' => Carbon::now()->subDays(1)],
            ];
            foreach ($complaints as $c) {
                $exists = DB::table('complaints')
                    ->where('user_id', $customerId)
                    ->where('subject', $c['subject'])
                    ->first();
                if (!$exists) {
                    DB::table('complaints')->insert([
                        'user_id'     => $customerId,
                        'subject'     => $c['subject'],
                        'message'     => $c['message'],
                        'status'      => $c['status'],
                        'response'    => $c['response'] ?? null,
                        'handled_by'  => $staffId,
                        'resolved_at' => $c['resolved_at'] ?? null,
                        'created_at'  => $c['created_at'],
                        'updated_at'  => $c['updated_at'],
                    ]);
                }
            }
        });
    }
}
