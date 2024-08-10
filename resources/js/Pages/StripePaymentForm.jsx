import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Inertia } from '@inertiajs/inertia';
import { usePage } from '@inertiajs/react';
import axios from 'axios';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

const CheckoutForm = ({ contentId, price, originalPrice, discountPercentage }) => {
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState('pending'); // 'pending', 'success', 'error'
  const [countdown, setCountdown] = useState(5);
  const stripe = useStripe();
  const elements = useElements();

  useEffect(() => {
    let timer;
    if (paymentStatus === 'success' && countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    } else if (paymentStatus === 'success' && countdown === 0) {
      Inertia.visit(`/content-page/${contentId}`);
    }
    return () => clearTimeout(timer);
  }, [paymentStatus, countdown, contentId]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setProcessing(true);
    setError(null);
  
    if (!stripe || !elements) {
      setError('Stripe.js has not loaded yet. Please try again later.');
      setProcessing(false);
      return;
    }
  
    const cardElement = elements.getElement(CardElement);
    const {error, token} = await stripe.createToken(cardElement);
  
    if (error) {
      setError(error.message);
      setProcessing(false);
      setPaymentStatus('error');
    } else {
      try {
        const response = await axios.post(`/payment/${contentId}/process`, { 
          stripeToken: token.id
        });
        
        if (response.data.success) {
          setPaymentStatus('success');
        } else {
          setError(response.data.message || '決済に失敗しました。');
          setPaymentStatus('error');
        }
      } catch (err) {
        setError('決済処理中にエラーが発生しました: ' + (err.response?.data?.message || err.message));
        setPaymentStatus('error');
      }
      setProcessing(false);
    }
  };

  const renderPaymentForm = () => (
    <form onSubmit={handleSubmit} className="w-full max-w-md mx-auto">
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2">価格情報</h3>
        {discountPercentage > 0 ? (
          <>
            <p className="text-gray-500 line-through">元の価格: ¥{originalPrice}</p>
            <p className="text-red-500 font-bold">割引価格: ¥{price} ({discountPercentage}% OFF)</p>
          </>
        ) : (
          <p className="font-bold">価格: ¥{price}</p>
        )}
      </div>
      <div className="mb-4">
        <label htmlFor="card-element" className="block text-sm font-medium text-gray-700">
          クレジットカード情報
        </label>
        <div className="mt-1">
          <CardElement
            id="card-element"
            options={{
              style: {
                base: {
                  fontSize: '16px',
                  color: '#424770',
                  '::placeholder': {
                    color: '#aab7c4',
                  },
                },
                invalid: {
                  color: '#9e2146',
                },
              },
              hidePostalCode: true,
            }}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
      </div>
      <button
        type="submit"
        disabled={!stripe || processing}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        {processing ? '処理中...' : `¥${price}を支払う`}
      </button>
    </form>
  );

  const renderSuccessMessage = () => (
    <div className="text-center">
      <h3 className="text-lg font-semibold mb-2 text-green-500">支払いが完了しました！</h3>
      <p>{countdown}秒後に作品ページに戻ります...</p>
    </div>
  );

  const renderErrorMessage = () => (
    <div className="text-center">
      <h3 className="text-lg font-semibold mb-2 text-red-500">エラーが発生しました</h3>
      <p>{error}</p>
      <button
        onClick={() => setPaymentStatus('pending')}
        className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
      >
        再試行
      </button>
    </div>
  );

  return (
    <div>
      {paymentStatus === 'pending' && renderPaymentForm()}
      {paymentStatus === 'success' && renderSuccessMessage()}
      {paymentStatus === 'error' && renderErrorMessage()}
    </div>
  );
};

const StripePaymentForm = () => {
  const { contentId, price, title, originalPrice, discountPercentage } = usePage().props;

  if (!contentId || !price || !title) {
    return <div className="text-red-500">エラー: 必要な情報が不足しています。</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden md:max-w-2xl">
        <div className="p-8">
          <h2 className="text-2xl font-bold mb-4">{title} - Stripe決済</h2>
          <Elements stripe={stripePromise}>
            <CheckoutForm 
              contentId={contentId} 
              price={price} 
              originalPrice={originalPrice}
              discountPercentage={discountPercentage}
            />
          </Elements>
        </div>
      </div>
    </div>
  );
};

export default StripePaymentForm;