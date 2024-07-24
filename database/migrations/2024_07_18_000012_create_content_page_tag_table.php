<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('content_page_tag', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('content_page_id');
            $table->unsignedBigInteger('tag_id');
            $table->timestamp('created_at')->useCurrent();

            $table->foreign('content_page_id')
                  ->references('id')
                  ->on('content_pages')
                  ->onDelete('cascade');
            $table->foreign('tag_id')
                  ->references('id')
                  ->on('tags')
                  ->onDelete('cascade');

            $table->unique(['content_page_id', 'tag_id']);
        });
    }

    public function down()
    {
        Schema::dropIfExists('content_page_tag');
    }
};