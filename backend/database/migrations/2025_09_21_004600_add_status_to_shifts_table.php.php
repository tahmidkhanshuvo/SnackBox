<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddStatusToShiftsTable extends Migration
{
    public function up()
    {
        Schema::table('shifts', function (Blueprint $table) {
            // Keep after is_active as you intended; index for quick admin filtering
            if (!Schema::hasColumn('shifts', 'status')) {
                $table->string('status')->default('active')->after('is_active')->index();
            }
        });
    }

    public function down()
    {
        Schema::table('shifts', function (Blueprint $table) {
            if (Schema::hasColumn('shifts', 'status')) {
                $table->dropIndex(['status']);
                $table->dropColumn('status');
            }
        });
    }
}
