<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('order_items', function (Blueprint $table) {
            $table->id();

            // Relations
            $table->foreignId('order_id')
                  ->constrained('orders')
                  ->cascadeOnDelete();

            $table->foreignId('menu_item_id')
                  ->constrained('menu_items'); // no cascade needed; items may be reused

            // Line details
            $table->unsignedInteger('quantity')->default(1);
            $table->decimal('unit_price', 10, 2)->default(0.00);
            $table->decimal('line_total', 10, 2)->default(0.00);

            $table->text('note')->nullable();
            $table->timestamps();

            $table->index(['order_id', 'menu_item_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('order_items');
    }
};
