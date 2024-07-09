<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

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

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    Route::post('/content', [ContentController::class, 'store']);
    Route::put('/content/{content}', [ContentController::class, 'update']);

    // ContentPage 関連の新しいルート
    Route::post('/content-page', [ContentController::class, 'storeContentPage']);
    Route::put('/content-page/{id}', [ContentController::class, 'updateContentPage']);
    Route::put('/content-page/{id}/toggle-publish', [ContentController::class, 'togglePublishContentPage']);
});