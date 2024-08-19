import React, { useState, useEffect, useCallback } from 'react';
import { usePage } from '@inertiajs/react';
import { Inertia } from '@inertiajs/inertia';
import { FaStar, FaSearch, FaUser, FaHeart } from 'react-icons/fa';
import Header from '../Components/Header';
import axios from 'axios';

const calculateDisplayPrice = (price, discountPercentage) => {
    return Math.round(price * (100 - discountPercentage) / 100);
};

const formatPrice = (price) => {
    return new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY' }).format(price);
};

const ContentPage = () => {
    const { contentPage, isCreator, isFavorite, auth } = usePage().props;
    const [showAllComments, setShowAllComments] = useState(false);
    const [comments, setComments] = useState([]);
    const [relatedWorks, setRelatedWorks] = useState([]);
    const [isCurrentlyFavorite, setIsCurrentlyFavorite] = useState(isFavorite);
    const [isLoading, setIsLoading] = useState(false);
    const [favoriteCount, setFavoriteCount] = useState(contentPage.favorites_count || 0);
    const [purchaseCount, setPurchaseCount] = useState(contentPage.purchase_count || 0);

    useEffect(() => {
        // コメントを取得する処理
        const fetchComments = async () => {
            try {
                const response = await axios.get(`/content-page/${contentPage.id}/comments`);
                setComments(response.data);
            } catch (error) {
                console.error('Error fetching comments:', error);
            }
        };
        fetchComments();
        // ... 他の副作用 ...
    }, [contentPage.id]);
    
    useEffect(() => {
        // 購入数を再取得する関数
        const fetchPurchaseCount = async () => {
            try {
                const response = await axios.get(`/content-page/${contentPage.id}/purchase-count`);
                setPurchaseCount(response.data.purchaseCount);
            } catch (error) {
                console.error('Error fetching purchase count:', error);
            }
        };
        
        // コンポーネントがマウントされたときと、
        // ページにフォーカスが戻ってきたときに購入数を再取得
        fetchPurchaseCount();
        window.addEventListener('focus', fetchPurchaseCount);
        
        return () => {
            window.removeEventListener('focus', fetchPurchaseCount);
        };
    }, [contentPage.id]);

    const handleEdit = () => {
        Inertia.get(`/content-page/edit/${contentPage.id}`);
    };
    
    const handlePurchase = useCallback(() => {
        // 現在の購入画面遷移機能を維持
        Inertia.get(`/payment/${contentPage.id}`, {}, {
            preserveState: true,
            preserveScroll: true,
            onSuccess: () => {
                // 購入処理が成功した場合、購入数を再取得
                axios.get(`/content-page/${contentPage.id}/purchase-count`)
                    .then(response => {
                        setPurchaseCount(response.data.purchaseCount);
                    })
                    .catch(error => {
                        console.error('Error fetching updated purchase count:', error);
                    });
            }
        });
    }, [contentPage.id]);

    const renderStars = (rating) => {
        return (
            <>
                {[1, 2, 3, 4, 5].map((star) => (
                    <FaStar
                        key={star}
                        className={star <= rating ? "text-yellow-400" : "text-gray-300"}
                    />
                ))}
            </>
        );
    };
    
    const handleFavoriteToggle = useCallback(async () => {
        if (isLoading) return;

        setIsLoading(true);
        try {
            const response = await axios.post(`/toggle-favorite/${contentPage.id}`);
            setIsCurrentlyFavorite(response.data.isFavorite);
            setFavoriteCount(response.data.favoriteCount);
        } catch (error) {
            console.error('Error toggling favorite:', error);
        } finally {
            setIsLoading(false);
        }
    }, [contentPage.id, isLoading]);
    
    // 日付をフォーマットする関数
    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('ja-JP', options);
    };
    
    return (
        <div className="content-page">
            <Header />
            <main className="p-4">
                <h2 className="text-3xl font-bold mb-4">{contentPage.title}</h2>
                <div className="flex mb-4">
                    <div className="w-2/3 pr-4">
                        {contentPage.cover_image ? (
                            <img 
                                src={contentPage.cover_image.startsWith('data:') 
                                    ? contentPage.cover_image 
                                    : contentPage.cover_image.startsWith('http') 
                                        ? contentPage.cover_image 
                                        : `/storage/${contentPage.cover_image}`}
                                alt={contentPage.title}
                                className="w-full object-cover"
                            />
                        ) : (
                            <p>カバー画像がありません</p>
                        )}
                    </div>
                    <div className="w-1/3 border p-4">
                        {contentPage.discount_percentage > 0 && (
                        <div className="bg-red-500 text-white inline-block px-2 py-1 rounded mb-2">
                            {contentPage.discount_percentage}% OFF
                        </div>
                        )}
                        <div className="text-2xl mb-2">
                            価格: <span className="text-red-500">
                                {formatPrice(calculateDisplayPrice(contentPage.display_price, contentPage.discount_percentage))}
                            </span>
                        </div>
                        {contentPage.discount_percentage > 0 && (
                            <div className="text-lg mb-2">
                                参考価格: <span className="text-gray-500 line-through">
                                    {formatPrice(contentPage.display_price)}
                                </span>
                            </div>
                        )}
                        <button 
                            onClick={handlePurchase}
                            className="bg-yellow-500 text-black font-bold py-2 px-4 rounded w-full mb-2"
                        >
                            購入する
                        </button>
                        <button 
                            onClick={handleFavoriteToggle}
                            disabled={isLoading}
                            className={`border ${isCurrentlyFavorite ? 'bg-red-500 text-white' : 'border-black text-black'} font-bold py-2 px-4 rounded w-full flex items-center justify-center ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            <FaHeart className="mr-2" />
                            {isLoading ? '処理中...' : (isCurrentlyFavorite ? 'お気に入り済み' : 'お気に入りに追加')}
                        </button>
                    </div>
                </div>
                <div className="mb-4 border p-4 rounded">
                    {contentPage.tags && contentPage.tags.map((tag, index) => (
                        <span key={index} className="bg-gray-200 px-2 py-1 rounded mr-2">{tag.name}</span>
                    ))}
                </div>
                <div className="mb-4 border p-4 rounded">
                    <div className="flex items-center">
                        <span className="mr-2">評価:</span>
                        {renderStars(contentPage.average_rating)}
                        <span className="ml-2">
                            {contentPage.average_rating.toFixed(1)}
                            <span className="text-gray-500 ml-1">
                                ({contentPage.rating_count}件)
                            </span>
                        </span>
                    </div>
                    <div>作者名: {contentPage.author_name}</div>
                    <div>公開日: {formatDate(contentPage.publish_date || contentPage.created_at)}</div>
                    <div>購入数: {purchaseCount}件</div>
                    <div>お気に入り数: {favoriteCount}件</div>
                    <div>月間ランキング: {contentPage.monthly_ranking}位</div>
                    <div>週間ランキング: {contentPage.weekly_ranking}位</div>
                </div>
                <div className="mb-4 border p-4 rounded">
                    <h3 className="text-xl font-bold mb-2">作品詳細</h3>
                    <p>{contentPage.description}</p>
                </div>
                <div className="mb-4">
                    <h3 className="text-xl font-bold mb-2">コメント一覧</h3>
                    <div className="border p-4 rounded">
                        {comments.slice(0, showAllComments ? comments.length : 2).map((comment, index) => (
                            <div key={index} className="border-b last:border-b-0 pb-2 mb-2 last:pb-0 last:mb-0">
                                <div className="flex justify-between">
                                    <span>{comment.user.name}</span>
                                    <span>{formatDate(comment.created_at)}</span>
                                </div>
                                <p>{comment.content}</p>
                                <div className="flex items-center mt-1">
                                    <span className="mr-2">評価:</span>
                                    {renderStars(comment.rating)}
                                </div>
                            </div>
                        ))}
                        {comments.length > 2 && !showAllComments && (
                            <button onClick={() => setShowAllComments(true)} className="text-blue-500 mt-2">
                                もっと見る
                            </button>
                        )}
                    </div>
                </div>
                <div>
                    <h3 className="text-xl font-bold mb-2">関連作品</h3>
                    <div className="flex overflow-x-auto">
                        {relatedWorks.map((work, index) => (
                            <div key={index} className="flex-shrink-0 w-48 mr-4">
                                <img src={work.cover_image} alt={work.title} className="w-full h-64 object-cover mb-2" />
                                {work.discount_percentage > 0 && (
                                    <div className="bg-red-500 text-white inline-block px-2 py-1 rounded mb-1">
                                        {work.discount_percentage}% OFF
                                    </div>
                                )}
                                <div className="font-bold">¥{work.display_price}</div>
                                <div className="text-sm truncate">{work.title}</div>
                                <div className="text-sm text-gray-600">{work.author_name}</div>
                                <div className="text-sm">
                                    {'★'.repeat(Math.round(work.average_rating))}{'☆'.repeat(5 - Math.round(work.average_rating))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default ContentPage;