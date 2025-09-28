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

            $table->foreignId('user_id')
                  ->nullable()
                  ->constrained('users')
                  ->nullOnDelete();

            // Optional: link staff to a default/last shift (per ERD)
            $table->foreignId('shift_id')
                  ->nullable()
                  ->constrained('shifts')
                  ->nullOnDelete();

            $table->string('first_name')->nullable();
            $table->string('last_name')->nullable();
            $table->string('email')->nullable()->index();
            $table->string('phone')->nullable()->index();
            $table->string('position')->nullable();   // cashier, cook, manager, etc.
            $table->date('hired_at')->nullable();

            // New registrations start as pending until approved
            $table->boolean('is_active')->default(false);

            $table->timestamps();

            $table->index(['is_active', 'position']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('staff');
    }
};
