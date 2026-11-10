
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Them cot deleted_at de ho tro xoa mem nguoi dung.
     */
    public function up(): void
    {
        Schema::table('nguoidung', function (Blueprint $table) {
            $table->softDeletes();
        });
    }

    /**
     * Go bo cot deleted_at neu rollback migration.
     */
    public function down(): void
    {
        Schema::table('nguoidung', function (Blueprint $table) {
            $table->dropSoftDeletes();
        });
    }
};
