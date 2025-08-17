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
        Schema::create('orders', function (Blueprint $table) {
            $table->id(); // OrderID
            $table->foreignId('user_id')->constrained()->onDelete('cascade'); // Foreign key to users
            $table->string('status')->default('pending'); // Status (e.g., pending, preparing, ready, delivering, completed, cancelled)
            $table->boolean('has_queue')->default(false); // HasQueue
            $table->integer('order_queue')->nullable(); // OrderQueue
            $table->decimal('total_amount', 10, 2)->default(0.00); // To store calculated total
            $table->string('payment_status')->default('pending'); // e.g., 'pending', 'paid', 'failed'
            $table->string('qr_code_identifier')->nullable()->unique(); // For QR-based table ordering
            $table->string('table_identifier')->nullable(); // Table number/name for QR orders
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};