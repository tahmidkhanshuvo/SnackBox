<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Hash;

class CreateAdministrator extends Command
{
    protected $signature = 'snackbox:create-admin';
    protected $description = 'Create a new administrator from explicitly configured environment values';

    public function handle(): int
    {
        $email = strtolower(trim((string) config('services.bootstrap_admin.email')));
        $password = (string) config('services.bootstrap_admin.password');
        if (!filter_var($email, FILTER_VALIDATE_EMAIL) || strlen($password) < 12) {
            $this->error('Set ADMIN_EMAIL and ADMIN_PASSWORD (at least 12 characters), then clear cached configuration.');
            return self::FAILURE;
        }
        if (User::where('email', $email)->exists()) {
            $this->info('That account already exists. Its role and password were preserved.');
            return self::SUCCESS;
        }
        User::create(['name' => 'SnackBox Administrator', 'email' => $email, 'password' => Hash::make($password), 'role' => 'admin']);
        $this->info('Administrator created. No credentials were printed.');
        return self::SUCCESS;
    }
}
