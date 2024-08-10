<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up()
    {
        Schema::create('content_pages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('content_id')->nullable()->constrained('contents')->onDelete('cascade');
            $table->foreignId('creator_id')->nullable()->constrained('users')->onDelete('set null');
            $table->string('title');
            $table->text('description')->nullable();
            $table->decimal('display_price', 10, 2)->nullable();
            $table->integer('discount_percentage')->nullable();
            $table->integer('purchase_count')->default(0); // 追加されたカラム
            $table->json('tags')->nullable();
            $table->text('cover_image')->nullable();
            $table->json('meta_data')->nullable(); // SEO関連のメタデータなど
            $table->boolean('is_published')->default(false);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('content_pages');
    }
};