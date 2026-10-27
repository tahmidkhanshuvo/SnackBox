<?php

namespace Tests\Feature;

use App\Models\MenuItem;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class MediaStorageTest extends TestCase
{
    use RefreshDatabase;

    public function test_menu_images_survive_filesystem_replacement_and_old_uploads_are_removed(): void
    {
        Sanctum::actingAs(User::factory()->create(['role' => 'admin']));
        $item = MenuItem::create(['item_name' => 'Sandwich', 'price' => 120, 'availability' => true]);
        $image = UploadedFile::fake()->image('sandwich.png', 20, 20);
        $bytes = $image->getContent();
        $url = $this->post("/api/menu-items/{$item->id}/image", ['image' => $image])->assertOk()->json('image_url');
        $path = parse_url($url, PHP_URL_PATH);
        Storage::fake('public');
        $this->get($path)->assertOk()->assertHeader('Content-Type', 'image/png')->assertContent($bytes);
        $this->post("/api/menu-items/{$item->id}/image", ['image' => UploadedFile::fake()->image('replacement.png', 20, 20)])->assertOk();
        $this->get($path)->assertNotFound();
        $this->assertDatabaseCount('media_assets', 1);
        Sanctum::actingAs(User::factory()->create(['role' => 'customer']));
        $this->post("/api/menu-items/{$item->id}/image", ['image' => UploadedFile::fake()->image('forbidden.png')])->assertForbidden();
    }

    public function test_customer_avatar_is_durable_and_publicly_readable(): void
    {
        Sanctum::actingAs(User::factory()->create(['role' => 'customer']));
        $response = $this->patch('/api/auth/me', ['avatar' => UploadedFile::fake()->image('avatar.png', 20, 20)])->assertOk();
        $path = parse_url($response->json('user.avatar_url'), PHP_URL_PATH);
        Storage::fake('public');
        $this->get($path)->assertOk()->assertHeader('Content-Type', 'image/png');
    }
}
