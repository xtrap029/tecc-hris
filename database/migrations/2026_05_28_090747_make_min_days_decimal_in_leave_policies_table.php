<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('leave_policies', function (Blueprint $table) {
            $table->decimal('min_days_per_application', 4, 1)->default(0.5)->change();
        });
    }

    public function down(): void
    {
        Schema::table('leave_policies', function (Blueprint $table) {
            $table->integer('min_days_per_application')->default(1)->change();
        });
    }
};
