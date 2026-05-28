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
        Schema::table('leave_applications', function (Blueprint $table) {
            $table->enum('day_period', ['whole', 'am', 'pm'])->default('whole')->nullable()->after('end_date');
            $table->decimal('total_days', 4, 1)->default(1)->change();
        });
    }

    public function down(): void
    {
        Schema::table('leave_applications', function (Blueprint $table) {
            $table->dropColumn('day_period');
            $table->integer('total_days')->default(1)->change();
        });
    }
};
