<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('contents_tags', function (Blueprint $table) {
        // 外部キー制約が存在する場合のみ削除を試みる
        if (Schema::hasColumn('contents_tags', 'content_id')) {
            $table->dropForeign(['content_id']);
        }
    });

        // テーブル名を変更
        Schema::rename('contents_tags', 'content_pages_tags');
    
        Schema::table('content_pages_tags', function (Blueprint $table) {
            $table->dropColumn('content_id');
            $table->foreignId('content_page_id')->after('id')->constrained('content_pages')->onDelete('cascade');
        });
    }

    public function down()
    {
        Schema::table('content_pages_tags', function (Blueprint $table) {
            $table->dropForeign(['content_page_id']);
            $table->dropColumn('content_page_id');
            $table->foreignId('content_id')->after('id');
        });

        Schema::rename('content_pages_tags', 'contents_tags');

        Schema::table('contents_tags', function (Blueprint $table) {
            $table->foreign('content_id')->references('id')->on('contents')->onDelete('cascade');
        });
    }
};