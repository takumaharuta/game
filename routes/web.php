<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ContentController;
use App\Http\Controllers\ContentPageController;
use App\Http\Controllers\TopPageController;
use App\Http\Controllers\FavoriteController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\PurchasedWorksController;
use App\Http\Controllers\TagController;
use App\Http\Controllers\CreatorController;
use App\Http\Controllers\CommentController;
use App\Http\Controllers\MypageController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// トップページ（認証不要）
Route::get('/', [TopPageController::class, 'index'])->name('top');

// 認証不要のルート（api.phpから移動）
Route::get('/tags', [TagController::class, 'index']);
Route::get('/top-tags', [TagController::class, 'getTopTags']);
Route::get('/content/{id}/price', [PaymentController::class, 'getPrice']);
Route::get('/content-page/{id}/purchase-count', [ContentPageController::class, 'getPurchaseCount']);
Route::get('/content-page/{id}/comments', [CommentController::class, 'index'])->name('comment.index');

Route::middleware('auth')->group(function () {
    // api.phpから移動したルート
    Route::get('/user', function (Request $request) {
        return $request->user();
    });
    
    // Mypage routes
    Route::get('/mypage', [MypageController::class, 'index'])->name('mypage');
    Route::get('/api/user-info', [MypageController::class, 'getUserInfo'])->name('user.info');
    
    // Profile routes
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // Content routes
    Route::get('/content/edit/{id?}', [ContentController::class, 'edit'])->name('content.edit');
    Route::get('/content/preview/{id}', [ContentController::class, 'preview'])->name('content.preview');
    
    // ContentPage routes
    Route::get('/content-page', [ContentPageController::class, 'create'])->name('content-page.create');
    Route::post('/content-page', [ContentPageController::class, 'store'])->name('content-page.store'); //こっちは新規作成時に呼び出されてる
    Route::get('/content-page/edit/{id?}', [ContentPageController::class, 'edit'])->name('content-page.edit');
    Route::get('/content-page/preview/{id}', [ContentPageController::class, 'preview'])->name('content-page.preview');
    Route::put('/content-page/{id}', [ContentPageController::class, 'update'])->name('content-page.update'); //これが更新時に呼び出されてる
    
    Route::put('/content-page/{id}/publish', [ContentPageController::class, 'publish'])->name('content-page.publish');

    // Payment routes
    Route::get('/payment/{id}', [PaymentController::class, 'showForm'])->name('payment.form');
    Route::post('/payment/{id}/process', [PaymentController::class, 'processPayment'])->name('payment.process');
    
    // Favorite routes
    Route::post('/toggle-favorite/{id}', [FavoriteController::class, 'toggle'])->name('favorite.toggle');
    Route::get('/favorite-works', [FavoriteController::class, 'index'])->name('favorite.index');
    
    // Comment routes
    Route::post('/content-page/{id}/comment', [CommentController::class, 'store'])->name('comment.store');
    Route::put('/content-page/{id}/comment/{commentId}', [CommentController::class, 'update'])->name('comment.update');
    
    // Creator routes
    Route::post('/creator/register', [CreatorController::class, 'register'])->name('creator.register');
    Route::post('/creator/update', [CreatorController::class, 'update'])->name('creator.update');

    // 購入済み作品一覧
    Route::get('/purchased-works', [PurchasedWorksController::class, 'index'])->name('purchased-works.index');
});

// コンテンツページの表示（認証不要）
Route::get('/content-page/{id}', [ContentPageController::class, 'show'])->name('content-page.show');

require __DIR__.'/auth.php';