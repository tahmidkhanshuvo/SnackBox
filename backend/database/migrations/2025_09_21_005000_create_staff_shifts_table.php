<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateStaffShiftsTable extends Migration
{
    public function up()
    {
        Schema::create('staff_shifts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('staff_id')->constrained()->cascadeOnDelete();
            $table->foreignId('shift_id')->constrained()->cascadeOnDelete();
            $table->date('date');
            $table->string('status')->default('assigned');
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('staff_shifts');
    }
}