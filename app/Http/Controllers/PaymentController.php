<?php

namespace App\Http\Controllers;

use App\Models\ContentPage;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Stripe\Stripe;
use Stripe\Charge;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Config;

class PaymentController extends Controller
{
    public function showForm($id)
    {
        $contentPage = ContentPage::findOrFail($id);
        $calculatedPrice = $this->calculatePrice($contentPage);
        return Inertia::render('StripePaymentForm', [
            'contentId' => $id,
            'title' => $contentPage->title,
            'price' => $calculatedPrice,
            'originalPrice' => $contentPage->display_price,
            'discountPercentage' => $contentPage->discount_percentage
        ]);
    }

    public function processPayment(Request $request, $id)
    {
        DB::beginTransaction();

        try {
            Log::info('Payment process started', ['content_id' => $id, 'token' => substr($request->stripeToken, 0, 5) . '...']);
            
            $contentPage = ContentPage::findOrFail($id);
            $calculatedPrice = $this->calculatePrice($contentPage);
            
            Log::info('Price calculated', ['price' => $calculatedPrice]);
            
            $stripeKey = Config::get('services.stripe.secret');
            Log::info('Stripe key config', ['key' => substr($stripeKey, 0, 5) . '...']);
            
            if (empty($stripeKey)) {
                throw new \Exception('Stripe API key is not set');
            }
            
            Stripe::setApiKey($stripeKey);
            
            $charge = Charge::create([
                'amount' => $calculatedPrice,
                'currency' => 'jpy',
                'source' => $request->stripeToken,
                'description' => "Payment for content: {$contentPage->title}",
            ]);
            
            Log::info('Stripe charge created', ['charge_id' => $charge->id]);
    
            // 支払い成功時の処理
            $contentPage->purchases()->create([
                'user_id' => auth()->id(),
                'amount' => $calculatedPrice,
                'transaction_id' => $charge->id,
            ]);
    
            DB::commit();
    
            Log::info('Payment successful', [
                'user_id' => auth()->id(),
                'content_id' => $id,
                'amount' => $calculatedPrice,
            ]);
    
            return response()->json([
                'success' => true,
                'message' => '支払いが完了しました。',
                'contentId' => $id
            ]);
    
        } catch (\Stripe\Exception\CardException $e) {
            DB::rollBack();
            Log::error('Stripe card error', ['error' => $e->getMessage(), 'content_id' => $id]);
            return response()->json([
                'success' => false,
                'message' => 'カード決済に失敗しました: ' . $e->getMessage()
            ], 400);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Payment processing error', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'content_id' => $id
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Payment processing error: ' . $e->getMessage()
            ], 500);
        }
    }

    private function calculatePrice($contentPage)
    {
        return round($contentPage->display_price * (100 - $contentPage->discount_percentage) / 100);
    }
}