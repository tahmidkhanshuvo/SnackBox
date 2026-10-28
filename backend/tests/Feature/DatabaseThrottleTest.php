<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Tests\TestCase;

class DatabaseThrottleTest extends TestCase
{
    use RefreshDatabase;

    public function test_database_backed_auth_throttle_keeps_validation_working(): void
    {
        config(['cache.default' => 'database', 'cache.limiter' => 'database']);
        Cache::purge();
        $this->app->forgetInstance(\Illuminate\Cache\RateLimiter::class);
        for ($attempt = 0; $attempt < 2; $attempt++) {
            $this->postJson('/api/token-register', [])->assertUnprocessable()->assertJsonValidationErrors('email');
        }
    }
}
