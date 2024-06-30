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
        Schema::create('contents_tags', function (Blueprint $table) {
            $table->foreignId('content_id')->constrained('contents');
            $table->foreignId('tag_id')->constrained('tags');
            $table->timestamp('created_at')->useCurrent();
    
            $table->primary(['content_id', 'tag_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('contents_tags');
    }
};
