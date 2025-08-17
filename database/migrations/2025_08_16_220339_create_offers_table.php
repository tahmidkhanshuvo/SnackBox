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
        Schema::create('offers', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique()->nullable(); // For coupon codes
            $table->decimal('discount_percent', 5, 2)->nullable(); // DiscountPercent (e.g., 10.50 for 10.5%)
            $table->decimal('discount_amount', 10, 2)->nullable(); // Fixed amount discount
            $table->string('type'); // e.g., 'percentage', 'fixed_amount'
            $table->decimal('min_order_amount', 10, 2)->nullable(); // Minimum order value for offer to apply
            $table->decimal('max_discount_amount', 10, 2)->nullable(); // Maximum discount value
            $table->integer('usage_limit')->nullable(); // Total times this offer can be used
            $table->integer('used_count')->default(0); // Times this offer has been used
            $table->dateTime('start_date');
            $table->dateTime('end_date');
            $table->string('status')->default('active'); // Status (e.g., 'active', 'inactive', 'expired')
            $table->text('suggested_menu')->nullable(); // SuggestedMenu (for AI, could be JSON of menu item IDs later)
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('offers');
    }
};