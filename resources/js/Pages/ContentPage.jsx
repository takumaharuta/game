import React, { useState, useEffect } from 'react';
import { usePage } from '@inertiajs/react';
import { Inertia } from '@inertiajs/inertia';
import { FaStar } from 'react-icons/fa';

const ContentPage = () => {
    const { contentPage, isCreator } = usePage().props;
    const [showAllComments, setShowAllComments] = useState(false);
    const [comments, setComments] = useState([]);
    const [relatedWorks, setRelatedWorks] = useState([]);

    useEffect(() => {
        // APIからコメントと関連作品を取得する処理
        // この部分は実際のAPIエンドポイントに合わせて実装する必要があります
        // setComments(fetchedComments);
        // setRelatedWorks(fetchedRelatedWorks);
    }, []);

    const handleEdit = () => {
        Inertia.get(`/content-page/edit/${contentPage.id}`);
    };

    const handleAddComment = () => {
        // コメント追加のモーダルを表示する処理
        // 実際の実装はアプリケーションの要件に応じて行う
    };

    const handleEditComment = () => {
        // 自分のコメントを編集する処理
        // 実際の実装はアプリケーションの要件に応じて行う
    };

    return (
        <div className="content-page">
            <header className="flex justify-between items-center p-4 bg-blue-500 text-white">
                <h1 className="text-2xl font-bold">Gamebook</h1>
                <div>
                    {isCreator ? (
                        <button onClick={handleEdit} className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded">
                            編集
                        </button>
                    ) : (
                        <div className="flex items-center">
                            <input type="text" placeholder="検索" className="p-2 rounded mr-2" />
                            <button className="bg-gray-200 text-black font-bold py-2 px-4 rounded">
                                アカウント
                            </button>
                        </div>
                    )}
                </div>
            </header>
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
                        <div className="text-2xl mb-2">価格: <span className="text-red-500">¥{contentPage.display_price}</span></div>
                        {contentPage.original_price && (
                            <div className="text-lg mb-2">参考価格: <span className="text-red-500 line-through">¥{contentPage.original_price}</span></div>
                        )}
                        <button className="bg-yellow-500 text-black font-bold py-2 px-4 rounded w-full mb-2">
                            購入する
                        </button>
                        <button className="border border-black text-black font-bold py-2 px-4 rounded w-full">
                            お気に入りに追加
                        </button>
                    </div>
                </div>
                <div className="mb-4 border p-4 rounded">
                    {contentPage.tags && contentPage.tags.map((tag, index) => (
                        <span key={index} className="bg-gray-200 px-2 py-1 rounded mr-2">{tag}</span>
                    ))}
                </div>
                <div className="mb-4 border p-4 rounded">
                    <div>平均評価: {contentPage.average_rating} {'★'.repeat(Math.round(contentPage.average_rating))}{'☆'.repeat(5 - Math.round(contentPage.average_rating))} (評価:{contentPage.rating_count}件)</div>
                    <div>作者名: {contentPage.author_name}</div>
                    <div>公開日: {contentPage.publish_date}</div>
                    <div>購入数: {contentPage.purchase_count}件</div>
                    <div>お気に入り数: {contentPage.favorite_count}件</div>
                    <div>月間ランキング: {contentPage.monthly_ranking}位</div>
                    <div>週間ランキング: {contentPage.weekly_ranking}位</div>
                </div>
                <div className="mb-4 border p-4 rounded">
                    <h3 className="text-xl font-bold mb-2">作品詳細</h3>
                    <p>{contentPage.description}</p>
                </div>
                <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                        <h3 className="text-xl font-bold">コメント一覧</h3>
                        <button onClick={handleAddComment} className="bg-blue-500 text-white font-bold py-2 px-4 rounded">
                            コメントを追加する
                        </button>
                    </div>
                    <div className="border p-4 rounded">
                        {comments.slice(0, showAllComments ? comments.length : 2).map((comment, index) => (
                            <div key={index} className="border-b last:border-b-0 pb-2 mb-2 last:pb-0 last:mb-0">
                                <div className="flex justify-between">
                                    <span>{comment.user_name}</span>
                                    <span>{comment.date}</span>
                                </div>
                                <div>{'★'.repeat(comment.rating)}{'☆'.repeat(5 - comment.rating)}</div>
                                <p>{comment.text}</p>
                                {comment.is_own_comment && (
                                    <button onClick={handleEditComment} className="text-blue-500">
                                        編集
                                    </button>
                                )}
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