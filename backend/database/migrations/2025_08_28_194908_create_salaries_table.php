<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('salaries', function (Blueprint $table) {
            $table->id();

            // Staff → Salaries (1 : M)
            $table->foreignId('staff_id')
                  ->constrained('staff')
                  ->cascadeOnDelete();

            // Treat month as a date (use 1st of month, e.g., 2025-09-01)
            $table->date('for_month');

            $table->decimal('amount', 10, 2)->default(0.00);
            $table->date('paid_at')->nullable();

            $table->enum('status', ['pending','paid','failed'])->default('pending');
            $table->text('note')->nullable();

            $table->timestamps();

            // Ensure only one record per staff per month
            $table->unique(['staff_id', 'for_month']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('salaries');
    }
};
