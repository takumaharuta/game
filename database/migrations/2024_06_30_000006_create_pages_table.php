<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('pages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('content_id')->constrained('contents')->onDelete('cascade');
            $table->string('title');
            $table->text('content')->nullable();
            $table->float('position_x');
            $table->float('position_y');
            $table->string('cover_image')->nullable();
            $table->integer('page_number')->default(0); // デフォルト値を設定
            $table->boolean('has_choices')->default(false);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pages');
    }
};