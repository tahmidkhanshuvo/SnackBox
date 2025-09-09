<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('inventory_movements', function (Blueprint $table) {
            $table->id();

            // Which menu item the movement is for
            $table->foreignId('menu_item_id')
                  ->constrained('menu_items')
                  ->cascadeOnDelete();

            // +N = stock in, -N = stock out, 0 allowed for corrections if you like
            $table->integer('delta_qty');

            // Movement type
            $table->enum('type', ['in', 'out', 'adjustment'])->default('adjustment');

            // Optional context
            $table->string('reason')->nullable();    // e.g., purchase, sale, spoilage
            $table->string('reference')->nullable(); // e.g., PO-123, ORD-456

            // Who did it (optional)
            $table->foreignId('performed_by')
                  ->nullable()
                  ->constrained('users')
                  ->nullOnDelete();

            // When it happened (distinct from created_at if you need backdated entries)
            $table->timestamp('performed_at')->useCurrent();

            $table->timestamps();

            $table->index(['menu_item_id', 'performed_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('inventory_movements');
    }
};
