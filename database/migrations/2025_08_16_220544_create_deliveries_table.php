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
        Schema::create('deliveries', function (Blueprint $table) {
            $table->id(); // DeliveryID
            $table->foreignId('order_id')->unique()->constrained()->onDelete('cascade'); // One delivery per order
            $table->foreignId('staff_id')->nullable()->constrained()->onDelete('set null'); // Foreign key to staff, nullable until assigned
            $table->dateTime('delivery_time')->nullable(); // Expected or actual delivery time
            $table->date('delivery_date'); // DeliveryDate
            $table->dateTime('payment_date')->nullable(); // When payment was processed/confirmed
            $table->string('status')->default('pending'); // e.g., 'pending', 'assigned', 'en_route', 'delivered', 'failed'
            $table->timestamps();
        });
    }
    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('deliveries');
    }
};