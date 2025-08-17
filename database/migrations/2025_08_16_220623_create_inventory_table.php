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
        Schema::create('inventory', function (Blueprint $table) {
            $table->id(); // InventoryID
            $table->foreignId('menu_item_id')->unique()->constrained()->onDelete('cascade'); // Link to specific MenuItem
            $table->integer('quantity'); // Quantity
            $table->integer('min_stock_level')->default(5); // For stock alerts
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('inventory');
    }
};