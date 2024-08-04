import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import axios from 'axios';
import { Inertia } from '@inertiajs/inertia';
import { usePage } from '@inertiajs/react';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

const CheckoutForm = ({ contentId, price }) => {
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [message, setMessage] = useState(null);
  const [paymentComplete, setPaymentComplete] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const stripe = useStripe();
  const elements = useElements();

  useEffect(() => {
    let timer;
    if (paymentComplete && countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    } else if (paymentComplete && countdown === 0) {
      Inertia.visit(`/content-page/${contentId}`);
    }
    return () => clearTimeout(timer);
  }, [paymentComplete, countdown, contentId]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setProcessing(true);
    setError(null);
    setMessage(null);

    if (!stripe || !elements) {
      return;
    }

    const cardElement = elements.getElement(CardElement);
    const {error, token} = await stripe.createToken(cardElement);

    if (error) {
      setError(error.message);
      setProcessing(false);
    } else {
      try {
        const response = await axios.post('/api/payment', { 
          stripeToken: token.id,
          contentId: contentId,
          amount: price 
        });
        if (response.data.success) {
          setMessage('決済が完了しました！');
          setPaymentComplete(true);
        } else {
          setError('決済に失敗しました。');
        }
      } catch (err) {
        setError('決済処理中にエラーが発生しました: ' + (err.response?.data?.message || err.message));
      }
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md mx-auto">
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
      {error && <div className="text-red-500 text-sm mb-4">{error}</div>}
      {message && <div className="text-green-500 text-sm mb-4">{message}</div>}
      {paymentComplete ? (
        <div className="text-green-500 text-sm mb-4">
          {countdown}秒後に作品ページに戻ります...
        </div>
      ) : (
        <button
          type="submit"
          disabled={!stripe || processing}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          {processing ? '処理中...' : `¥${price}を支払う`}
        </button>
      )}
    </form>
  );
};

const PaymentForm = () => {
  const { contentId } = usePage().props;
  const [price, setPrice] = useState(null);

  useEffect(() => {
    const fetchPrice = async () => {
      try {
        const response = await axios.get(`/api/content/${contentId}/price`);
        setPrice(response.data.price);
      } catch (error) {
        console.error('価格の取得に失敗しました:', error);
      }
    };

    fetchPrice();
  }, [contentId]);

  if (price === null) {
    return <div>価格を読み込み中...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden md:max-w-2xl">
        <div className="p-8">
          <h2 className="text-2xl font-bold mb-4">Stripe決済</h2>
          <Elements stripe={stripePromise}>
            <CheckoutForm contentId={contentId} price={price} />
          </Elements>
        </div>
      </div>
    </div>
  );
};

export default PaymentForm;