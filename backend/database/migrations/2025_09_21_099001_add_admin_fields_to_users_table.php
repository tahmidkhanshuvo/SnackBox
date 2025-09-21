<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            if (!Schema::hasColumn('users', 'role')) {
                $table->string('role')->default('customer')->index();
            }
            if (!Schema::hasColumn('users', 'approved_at')) {
                $table->timestamp('approved_at')->nullable();
            }
            if (!Schema::hasColumn('users', 'avatar_path')) {
                $table->string('avatar_path')->nullable();
            }
            if (!Schema::hasColumn('users', 'contact_no')) {
                $table->string('contact_no', 50)->nullable();
            }
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            if (Schema::hasColumn('users', 'contact_no'))  $table->dropColumn('contact_no');
            if (Schema::hasColumn('users', 'avatar_path')) $table->dropColumn('avatar_path');
            if (Schema::hasColumn('users', 'approved_at')) $table->dropColumn('approved_at');
            if (Schema::hasColumn('users', 'role'))        $table->dropColumn('role');
        });
    }
};
