<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('staff_shifts', function (Blueprint $table) {
            // Speed up common queries
            $table->index('date');    // staff_shifts_date_index
            $table->index('status');  // staff_shifts_status_index

            // Prevent duplicate assignment of the same shift on the same day
            $table->unique(
                ['staff_id', 'date', 'shift_id'],
                'staff_shifts_unique_staff_date_shift'
            );
        });
    }

    public function down(): void
    {
        Schema::table('staff_shifts', function (Blueprint $table) {
            // Drop unique first (explicit name)
            $table->dropUnique('staff_shifts_unique_staff_date_shift');

            // Drop the indexes (default Laravel names)
            $table->dropIndex('staff_shifts_date_index');
            $table->dropIndex('staff_shifts_status_index');
        });
    }
};
