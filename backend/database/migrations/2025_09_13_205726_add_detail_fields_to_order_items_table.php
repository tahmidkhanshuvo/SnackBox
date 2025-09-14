<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('order_items', function (Blueprint $table) {
            if (!Schema::hasColumn('order_items', 'note')) {
                $table->string('note', 500)->nullable()->after('unit_price');
            }
            if (!Schema::hasColumn('order_items', 'addons')) {
                $table->json('addons')->nullable()->after('note');
            }
            if (!Schema::hasColumn('order_items', 'selections')) {
                $table->json('selections')->nullable()->after('addons');
            }
        });
    }

    public function down(): void
    {
        Schema::table('order_items', function (Blueprint $table) {
            if (Schema::hasColumn('order_items', 'selections')) $table->dropColumn('selections');
            if (Schema::hasColumn('order_items', 'addons'))     $table->dropColumn('addons');
            if (Schema::hasColumn('order_items', 'note'))       $table->dropColumn('note');
        });
    }
};
