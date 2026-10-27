<?php

namespace Tests\Feature;

use App\Models\MenuItem;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class OrderSecurityTest extends TestCase
{
    use RefreshDatabase;

    public function test_customer_cannot_enter_staff_apis_or_change_someone_elses_order(): void
    {
        $customer = User::factory()->create(['role' => 'customer']);
        Sanctum::actingAs($customer);
        $this->getJson('/api/staff')->assertForbidden();
        $this->postJson('/api/menu-items', [])->assertForbidden();
        $item = MenuItem::create(['item_name' => 'Sandwich', 'category' => 'Snacks', 'price' => 120, 'availability' => true]);
        $id = $this->postJson('/api/orders', ['items' => [['menu_item_id' => $item->id, 'quantity' => 1]]])->assertCreated()->json('id');
        Sanctum::actingAs(User::factory()->create(['role' => 'customer']));
        $this->getJson("/api/orders/$id")->assertForbidden();
        $this->patchJson("/api/orders/$id/status", ['status' => 'cancelled'])->assertForbidden();
    }

    public function test_prices_and_customizations_are_validated_on_the_server(): void
    {
        Sanctum::actingAs(User::factory()->create(['role' => 'customer']));
        $item = MenuItem::create(['item_name' => 'Sandwich', 'category' => 'Snacks', 'price' => 120, 'availability' => true]);
        $line = ['menu_item_id' => $item->id, 'quantity' => 2, 'unit_price' => 1, 'selections' => ['size' => 'large'], 'addons' => ['extras' => ['cheese']]];
        $this->postJson('/api/orders', ['items' => [$line]])->assertCreated()->assertJsonPath('items.0.unit_price', '220.00')->assertJsonPath('total', '440.00');
        $line['addons'] = ['extras' => ['free-everything']];
        $this->postJson('/api/orders', ['items' => [$line]])->assertUnprocessable();
        $item->update(['availability' => false]);
        $this->postJson('/api/orders', ['items' => [['menu_item_id' => $item->id, 'quantity' => 1]]])->assertUnprocessable();
        $this->assertDatabaseCount('orders', 1);
    }
}
