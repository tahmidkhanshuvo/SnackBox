<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateShiftsTable extends Migration
{
    public function up()
    {
        Schema::create('shifts', function (Blueprint $table) {
            $table->id();

            // e.g., "Morning", "Evening", "Night"
            $table->string('name', 100)->unique();

            // Stored as TIME; app exposes "HH:MM:SS"
            $table->time('starts_at');
            $table->time('ends_at');

            $table->boolean('is_active')->default(true)->index();

            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('shifts');
    }
}
