<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\TagController;
use App\Http\Controllers\ContentController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

// 認証が不要なルート
Route::get('/tags', [TagController::class, 'index']);

// 認証が必要なルート
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    Route::post('/content', [ContentController::class, 'store']);
    Route::put('/content/{content}', [ContentController::class, 'update']);

    // ContentPage 関連のルート
    Route::post('/content-page', [ContentController::class, 'storeContentPage']);
    Route::put('/content-page/{id}', [ContentController::class, 'updateContentPage']);
    Route::put('/content-page/{id}/toggle-publish', [ContentController::class, 'togglePublishContentPage']);
});