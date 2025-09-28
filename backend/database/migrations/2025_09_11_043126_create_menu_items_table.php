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
        Schema::create('menu_items', function (Blueprint $table) {
            $table->id();
            $table->string('item_name');
            $table->string('category')->nullable();
            // Securely define the price for each item
            $table->decimal('price', 8, 2)->default(0.00);
            // Correctly define availability as a boolean, defaulting to true
            $table->boolean('availability')->default(true);
            // Columns for image uploads
            $table->string('image_path')->nullable();
            $table->string('image_alt')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('menu_items');
    }
};
