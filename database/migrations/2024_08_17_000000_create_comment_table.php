<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('comments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('content_page_id')->constrained('content_pages')->onDelete('cascade');
            $table->text('content');
            $table->integer('rating');
            $table->timestamps();
            $table->unique(['user_id', 'content_page_id']);
        });
    }

    public function down()
    {
        Schema::dropIfExists('comments');
    }
};