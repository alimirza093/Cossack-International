<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('cart_items', function (Blueprint $table) {
            $table->uuid('id')->primary();

            $table->foreignUuid('cart_id')->constrained('cart')->cascadeOnDelete();

            $table->foreignUuid('product_id')->constrained('products')->cascadeOnDelete();

            $table->foreignUuid('variant_id')->nullable()->constrained('product_variants')->nullOnDelete();

            $table->json('selected_options')->nullable();
            $table->decimal('final_price', 10, 2)->default(0);
            $table->decimal('item_total', 10, 2)->default(0);
            $table->integer('quantity')->default(1);
            $table->timestamp('created_at')->useCurrent();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('cart_items');
    }
};
