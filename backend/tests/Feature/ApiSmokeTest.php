<?php

namespace Tests\Feature;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;
use Illuminate\Http\UploadedFile;
use App\Models\User;
use Laravel\Sanctum\Sanctum;

class ApiSmokeTest extends TestCase
{
    use RefreshDatabase;

    public function test_full_api_flow(): void
    {
        Storage::fake('public');

        // Create a user and authenticate (no session route needed)
        $user = User::factory()->create([
            'email' => 'admin@snackbox.test',
            'password' => bcrypt('secret123'),
        ]);
        Sanctum::actingAs($user, abilities: ['*']);

        // 1) Create a menu item
        $itemRes = $this->postJson('/api/menu-items', [
            'item_name'    => 'Chicken Sandwich',
            'category'     => 'Snacks',
            'availability' => true,
        ])->assertCreated();

        $menuItemId = $itemRes->json('id');

        // 2) Upload an image
        $file = UploadedFile::fake()->image('chicken.jpg', 600, 400);
        $this->post("/api/menu-items/{$menuItemId}/image", [
            'image'     => $file,
            'image_alt' => 'Delicious chicken sandwich',
        ])->assertOk();

        // 3) Stock IN (+50)
        $this->postJson("/api/menu-items/{$menuItemId}/inventory/move", [
            'type'     => 'in',
            'quantity' => 50,
            'reason'   => 'opening stock',
        ])->assertCreated();

        // 4) Check stock (50)
        $this->getJson("/api/menu-items/{$menuItemId}/stock")
            ->assertOk()
            ->assertJson(['stock' => 50]);

        // 5) Create an order with 2x item @ 120.00
        $orderRes = $this->postJson('/api/orders', [
            'reference' => 'POS-1',
            'items' => [
                ['menu_item_id' => $menuItemId, 'quantity' => 2, 'unit_price' => 120.00],
            ],
        ])->assertCreated();

        $orderId = $orderRes->json('id');

        // 6) Confirm order (deduct to 48)
        $this->patchJson("/api/orders/{$orderId}/status", [
            'status' => 'confirmed',
        ])->assertOk();

        $this->getJson("/api/menu-items/{$menuItemId}/stock")
            ->assertOk()
            ->assertJson(['stock' => 48]);

        // 7) Staff
        $staffRes = $this->postJson('/api/staff', [
            'first_name' => 'Sam',
            'last_name'  => 'Cook',
            'position'   => 'cashier',
            'is_active'  => true,
        ])->assertCreated();
        $staffId = $staffRes->json('id');

        // 8) Salary
        $ymd = now()->startOfMonth()->toDateString();
        $salaryRes = $this->postJson('/api/salaries', [
            'staff_id'  => $staffId,
            'for_month' => $ymd,
            'amount'    => 15000,
        ])->assertCreated();
        $salaryId = $salaryRes->json('id');

        $this->patchJson("/api/salaries/{$salaryId}/mark-paid", [])
            ->assertOk()
            ->assertJsonPath('status', 'paid');

        // 9) Complaint
        $complaintRes = $this->postJson('/api/complaints', [
            'subject' => 'Cold food',
            'message' => 'Soup was cold on arrival.',
        ])->assertCreated();
        $complaintId = $complaintRes->json('id');

        $this->patchJson("/api/complaints/{$complaintId}/assign/{$staffId}")
            ->assertOk();

        $this->patchJson("/api/complaints/{$complaintId}/resolve", [
            'response' => 'Sorry about that — we will improve.',
        ])->assertOk()->assertJsonPath('status', 'resolved');
    }
}
