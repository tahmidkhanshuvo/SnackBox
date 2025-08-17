<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('users', function (Blueprint $table) {
            $table->id(); // UserID
            $table->string('first_name')->nullable(); // First Name
            $table->string('last_name')->nullable(); // Last Name
            $table->string('contact_no')->unique()->nullable(); // Contact no
            $table->string('email')->unique(); // Email
            $table->string('password'); // Password
            $table->string('account_id')->unique()->nullable(); // AccountID (can be UUID or a custom string)
            $table->string('role')->default('customer'); // Role (e.g., 'customer', 'staff', 'admin')
            $table->rememberToken();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('users');
    }
};