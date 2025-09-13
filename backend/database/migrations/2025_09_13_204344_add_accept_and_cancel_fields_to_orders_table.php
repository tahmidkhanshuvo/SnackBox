<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            // Who accepted the order (staff)
            $table->foreignId('accepted_by')
                  ->nullable()
                  ->after('status')
                  ->constrained('users')
                  ->nullOnDelete();

            // When it was accepted
            $table->timestamp('accepted_at')->nullable()->after('accepted_by');

            // Why it was cancelled (customer/staff)
            $table->string('cancel_reason', 500)->nullable()->after('reference');
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            if (Schema::hasColumn('orders', 'cancel_reason')) {
                $table->dropColumn('cancel_reason');
            }
            if (Schema::hasColumn('orders', 'accepted_at')) {
                $table->dropColumn('accepted_at');
            }
            if (Schema::hasColumn('orders', 'accepted_by')) {
                $table->dropForeign(['accepted_by']);
                $table->dropColumn('accepted_by');
            }
        });
    }
};
