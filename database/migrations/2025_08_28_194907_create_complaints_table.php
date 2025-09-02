<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('complaints', function (Blueprint $table) {
            $table->id();

            // Who submitted the complaint (customer)
            $table->foreignId('user_id')
                  ->nullable()
                  ->constrained('users')
                  ->nullOnDelete();

            $table->string('subject');
            $table->text('message');

            $table->enum('status', ['open','in_progress','resolved','closed'])
                  ->default('open');

            // Internal response / notes
            $table->text('response')->nullable();

            // Which staff handled it (optional)
            $table->foreignId('handled_by')
                  ->nullable()
                  ->constrained('staff')
                  ->nullOnDelete();

            $table->timestamp('resolved_at')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'handled_by', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('complaints');
    }
};
