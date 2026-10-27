<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class BootstrapTest extends TestCase
{
    use RefreshDatabase;

    public function test_administrator_setup_never_promotes_or_resets_an_existing_account(): void
    {
        $existing = User::factory()->create(['email' => 'owner@example.test', 'role' => 'customer']);
        $originalHash = $existing->password;
        config(['services.bootstrap_admin.email' => $existing->email, 'services.bootstrap_admin.password' => 'isolated-test-password']);
        $this->artisan('snackbox:create-admin')->assertSuccessful();
        $this->assertSame('customer', $existing->fresh()->role);
        $this->assertSame($originalHash, $existing->fresh()->password);
        config(['services.bootstrap_admin.email' => 'new-owner@example.test']);
        $this->artisan('snackbox:create-admin')->assertSuccessful();
        $created = User::where('email', 'new-owner@example.test')->firstOrFail();
        $this->assertSame('admin', $created->role);
        $this->assertTrue(Hash::check('isolated-test-password', $created->password));
    }

    public function test_demo_catalogue_setup_preserves_existing_items_and_stock(): void
    {
        $this->artisan('snackbox:seed-catalogue')->assertSuccessful();
        $this->assertDatabaseCount('menu_items', 5);
        $this->assertDatabaseCount('inventory_movements', 5);
        $this->artisan('snackbox:seed-catalogue')->assertSuccessful();
        $this->assertDatabaseCount('menu_items', 5);
        $this->assertDatabaseCount('inventory_movements', 5);
        $this->assertDatabaseCount('users', 0);
    }
}
