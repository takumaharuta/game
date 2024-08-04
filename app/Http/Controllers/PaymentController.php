<?php

namespace App\Http\Controllers;

use App\Http\Requests\StorePaymentRequest;
use Exception;
use Illuminate\Http\JsonResponse;
use Inertia\Inertia;
use Inertia\Response;
use Stripe\Stripe;
use Stripe\Charge;
use Illuminate\Support\Facades\Log;
use App\Models\ContentPage;

class PaymentController extends Controller
{
    public function __construct()
    {
        $apiKey = config('stripe.stripe_secret_key');
        Log::info('Stripe API Key from config: ' . substr($apiKey, 0, 5) . '...');  // APIキーの最初の5文字のみをログに記録
        Stripe::setApiKey($apiKey);
    }

    /**
     * 決済フォーム表示
     */
    public function create($id)
    {
        try {
            $contentPage = ContentPage::findOrFail($id);
            \Log::info('Payment create method called', ['id' => $id, 'price' => $contentPage->display_price]);
            
            return Inertia::render('StripePaymentForm', [
                'contentId' => $id,
                'price' => $contentPage->display_price,
                'title' => $contentPage->title
            ]);
        } catch (\Exception $e) {
            \Log::error('Error in payment create', ['id' => $id, 'error' => $e->getMessage()]);
            return Inertia::render('ErrorPage', [
                'message' => 'コンテンツの取得に失敗しました。: ' . $e->getMessage()
            ]);
        }
    }

    /**
     * 決済実行
     */
    public function store(StorePaymentRequest $request): JsonResponse
    {
        Log::info('Entering store method');
        try {
            Log::info('Attempting to create Stripe charge');
            $charge = Charge::create([
                'source' => $request->stripeToken,
                'amount' => 1000,
                'currency' => 'jpy',
            ]);

            Log::info('Charge created successfully');
            return response()->json([
                'success' => true,
                'message' => '決済が完了しました！',
                'charge' => $charge
            ]);
        } catch (Exception $e) {
            Log::error('Stripe charge failed: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => '決済に失敗しました！(' . $e->getMessage() . ')'
            ], 400);
        }
    }
}