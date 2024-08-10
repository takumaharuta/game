<?php
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ContentController;
use App\Http\Controllers\ContentPageController;
use App\Http\Controllers\TopPageController;
use App\Http\Controllers\PaymentController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// トップページ（認証不要）
Route::get('/', [TopPageController::class, 'index'])->name('top');

Route::middleware('auth')->group(function () {
    // Dashboard
    Route::get('/dashboard', function () {
        return Inertia::render('Dashboard');
    })->name('dashboard');

    // Profile routes
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // Content routes
    Route::get('/content/edit/{id?}', [ContentController::class, 'edit'])->name('content.edit');
    Route::get('/content/preview/{id}', [ContentController::class, 'preview'])->name('content.preview');
    
    // ContentPage routes
    Route::get('/content-page', [ContentPageController::class, 'create'])->name('content-page.create');
    Route::post('/content-page', [ContentPageController::class, 'store'])->name('content-page.store');
    Route::get('/content-page/edit/{id?}', [ContentPageController::class, 'edit'])->name('content-page.edit');
    Route::get('/content-page/preview/{id}', [ContentPageController::class, 'preview'])->name('content-page.preview');
    Route::post('/content-page/{id}', [ContentPageController::class, 'update'])->name('content-page.update');
    Route::put('/content-page/{id}', [ContentPageController::class, 'publish'])->name('content-page.publish');
    
    // Payment routes
    Route::get('/payment/{id}', [PaymentController::class, 'showForm'])->name('payment.form');
    Route::post('/payment/{id}/process', [PaymentController::class, 'processPayment'])->name('payment.process');
});

// コンテンツページの表示（認証不要）
Route::get('/content-page/{id}', [ContentPageController::class, 'show'])->name('content-page.show');

require __DIR__.'/auth.php';