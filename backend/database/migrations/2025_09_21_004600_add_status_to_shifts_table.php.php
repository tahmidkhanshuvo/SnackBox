<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddStatusToShiftsTable extends Migration
{
    public function up()
    {
        Schema::table('shifts', function (Blueprint $table) {
            $table->string('status')->nullable()->after('is_active')->default('active');
        });
    }

    public function down()
    {
        Schema::table('shifts', function (Blueprint $table) {
            $table->dropColumn('status');
        });
    }
}