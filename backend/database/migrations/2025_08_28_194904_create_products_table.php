<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // ERD: MenuItem (id, item_name, category, availability)
        Schema::create('menu_items', function (Blueprint $table) {
            $table->id();                                  // ItemID
            $table->string('item_name');                   // Name/label
            $table->string('category')->nullable();        // Category
            $table->boolean('availability')->default(true);// Availability
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('menu_items');
    }
};
