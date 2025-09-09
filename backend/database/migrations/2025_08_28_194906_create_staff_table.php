<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('staff', function (Blueprint $table) {
            $table->id();

            // Optional link to a login user (if a staff member also logs into the app)
            $table->foreignId('user_id')
                  ->nullable()
                  ->constrained('users')
                  ->nullOnDelete();

            $table->string('first_name')->nullable();
            $table->string('last_name')->nullable();
            $table->string('email')->nullable()->index();   // keep nullable if you don't require email for staff
            $table->string('phone')->nullable()->index();
            $table->string('position')->nullable();         // e.g., cashier, cook, manager
            $table->date('hired_at')->nullable();
            $table->boolean('is_active')->default(true);

            $table->timestamps();

            // Helpful compound index for lookups
            $table->index(['is_active', 'position']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('staff');
    }
};
