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
        Schema::create('product_config_options', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('config_id')->constrained('product_configs')->cascadeOnDelete();
            $table->string('value', 100);
            $table->decimal('price_modifier', 10, 2)->default(0);
            $table->timestamp('created_at')->useCurrent();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('product_config_options');
    }
};
