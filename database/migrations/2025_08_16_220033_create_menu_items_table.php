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
            $table->id(); // ItemID
            $table->string('name'); // ItemName
            $table->text('description')->nullable();
            $table->decimal('price', 8, 2);
            $table->string('category'); // Category
            $table->boolean('availability')->default(true); // Availability
            // WasteLog is a single attribute in ERD. For detailed logging, a separate table would be better.
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
