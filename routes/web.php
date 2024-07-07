<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ContentController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    // Profile routes
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // Content routes
    Route::get('/content/edit/{id?}', [ContentController::class, 'edit'])->name('content.edit');
    Route::get('/content/preview/{id}', [ContentController::class, 'preview'])->name('content.preview');
    Route::get('/content-page/{id}', [ContentController::class, 'showContentPage'])->name('content.page');
    Route::get('/content-page/edit/{id?}', [\App\Http\Controllers\ContentController::class, 'editContentPage'])
        ->name('content.page.edit');
});

require __DIR__.'/auth.php';
