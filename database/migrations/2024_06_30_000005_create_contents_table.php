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
        Schema::create('contents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('creator_id')->constrained('creators');
            $table->text('title');
            $table->text('description');
            $table->decimal('price', 8, 2);
            $table->boolean('is_available');
            $table->integer('review_count')->default(0);
            $table->decimal('average_rating', 3, 2)->nullable();
            $table->dateTime('release_date');
            $table->text('sample_file_path')->nullable();
            $table->text('file_path');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('contents');
    }
};
