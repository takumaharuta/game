<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ContentController;
use App\Http\Controllers\PaymentController;

// 認証が必要なルート
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/content', [ContentController::class, 'store']);
    Route::put('/content/{content}', [ContentController::class, 'update']);

    // ContentPage 関連のルート
    Route::post('/content-page', [ContentController::class, 'storeContentPage']);
    Route::put('/content-page/{id}', [ContentController::class, 'updateContentPage']);
    Route::put('/content-page/{id}/toggle-publish', [ContentController::class, 'togglePublishContentPage']);
    
    Route::post('/payment', [PaymentController::class, 'store']);
});