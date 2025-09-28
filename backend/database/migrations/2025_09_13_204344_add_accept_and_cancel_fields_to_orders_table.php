<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('orders')) return;

        Schema::table('orders', function (Blueprint $table) {
            // These may already exist from create_orders_table
            if (! Schema::hasColumn('orders', 'accepted_by')) {
                $table->foreignId('accepted_by')->nullable()->constrained('users')->nullOnDelete()->after('status');
            }
            if (! Schema::hasColumn('orders', 'accepted_at')) {
                $table->timestamp('accepted_at')->nullable()->after('accepted_by');
            }

            // These are new and safe to add if missing
            if (! Schema::hasColumn('orders', 'cancelled_by')) {
                $table->foreignId('cancelled_by')->nullable()->constrained('users')->nullOnDelete()->after('accepted_at');
            }
            if (! Schema::hasColumn('orders', 'cancelled_at')) {
                $table->timestamp('cancelled_at')->nullable()->after('cancelled_by');
            }

            // Keep your existing TEXT if it’s already there; only add if missing
            if (! Schema::hasColumn('orders', 'cancel_reason')) {
                $table->string('cancel_reason', 255)->nullable()->after('cancelled_at');
            }
        });
    }

    public function down(): void
    {
        if (! Schema::hasTable('orders')) return;

        Schema::table('orders', function (Blueprint $table) {
            if (Schema::hasColumn('orders', 'accepted_by'))   $table->dropConstrainedForeignId('accepted_by');
            if (Schema::hasColumn('orders', 'accepted_at'))   $table->dropColumn('accepted_at');
            if (Schema::hasColumn('orders', 'cancelled_by'))  $table->dropConstrainedForeignId('cancelled_by');
            if (Schema::hasColumn('orders', 'cancelled_at'))  $table->dropColumn('cancelled_at');
            if (Schema::hasColumn('orders', 'cancel_reason')) $table->dropColumn('cancel_reason');
        });
    }
};
