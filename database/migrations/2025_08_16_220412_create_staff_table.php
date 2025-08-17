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
        Schema::create('staff', function (Blueprint $table) {
            $table->id(); // StaffID
            $table->foreignId('user_id')->constrained()->onDelete('cascade'); // Link to user authentication
            $table->decimal('salary', 10, 2)->nullable(); // Salary
            $table->decimal('amount', 10, 2)->nullable(); // Additional amount (bonus/payment)
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('staff');
    }
};
