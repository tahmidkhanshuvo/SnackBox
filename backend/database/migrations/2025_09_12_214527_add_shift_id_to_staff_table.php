<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Add shift_id only if it does not exist
        Schema::table('staff', function (Blueprint $table) {
            if (! Schema::hasColumn('staff', 'shift_id')) {
                $table->foreignId('shift_id')
                    ->nullable()
                    ->constrained('shifts')
                    ->nullOnDelete();
            }
        });
    }

    public function down(): void
    {
        Schema::table('staff', function (Blueprint $table) {
            if (Schema::hasColumn('staff', 'shift_id')) {
                // Drop FK then column (order matters)
                $table->dropForeign(['shift_id']);
                $table->dropColumn('shift_id');
            }
        });
    }
};
