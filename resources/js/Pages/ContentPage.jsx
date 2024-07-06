import React, { useState, useEffect } from 'react';
import { FaStar } from 'react-icons/fa';

const ContentPage = () => {
    const [content, setContent] = useState(null);
    const [comments, setComments] = useState([]);
    const [showAllComments, setShowAllComments] = useState(false);
    const [userComment, setUserComment] = useState(null);
    const [relatedWorks, setRelatedWorks] = useState([]);

    useEffect(() => {
        // ここでAPIからコンテンツデータを取得する処理を実装
        // setContent(fetchedContent);
        // setComments(fetchedComments);
        // setRelatedWorks(fetchedRelatedWorks);
    }, []);

    const handleAddComment = () => {
        // コメント追加のモーダルを表示する処理
    };

    const handleEditComment = () => {
        // 自分のコメントを編集する処理
    };

    return (
        <div className="content-page">
            <header className="flex justify-between items-center p-4 bg-blue-500 text-white">
                <h1 className="text-2xl font-bold">作品ページ</h1>
                <div className="flex items-center">
                    <input type="text" placeholder="検索" className="p-2 rounded mr-2" />
                    <button className="bg-gray-200 text-black font-bold py-2 px-4 rounded">
                        アカウント
                    </button>
                </div>
            </header>
            {content && (
                <main className="p-4">
                    <h2 className="text-3xl font-bold mb-4">{content.title}</h2>
                    <div className="flex mb-4">
                        <img src={content.coverImage} alt={content.title} className="w-1/2 object-cover" />
                        <div className="w-1/2 ml-4 border p-4">
                            <div className="bg-red-500 text-white inline-block px-2 py-1 rounded mb-2">
                                {content.discount}% OFF
                            </div>
                            <div className="text-2xl mb-2">価格: <span className="text-red-500">¥{content.price}</span></div>
                            <div className="text-lg mb-2">参考価格: <span className="text-red-500 line-through">¥{content.originalPrice}</span></div>
                            <button className="bg-yellow-500 text-black font-bold py-2 px-4 rounded w-full mb-2">
                                購入する
                            </button>
                            <button className="border border-black text-black font-bold py-2 px-4 rounded w-full">
                                お気に入りに追加
                            </button>
                        </div>
                    </div>
                    <div className="mb-4">
                        {content.tags.map((tag, index) => (
                            <span key={index} className="bg-gray-200 px-2 py-1 rounded mr-2">{tag}</span>
                        ))}
                    </div>
                    <div className="mb-4">
                        <div>平均評価: {content.averageRating} {'★'.repeat(Math.round(content.averageRating))}{'☆'.repeat(5 - Math.round(content.averageRating))} (評価:{content.ratingCount}件)</div>
                        <div>作者名: {content.authorName}</div>
                        <div>公開日: {content.publishDate}</div>
                        <div>購入数: {content.purchaseCount}件</div>
                        <div>お気に入り数: {content.favoriteCount}件</div>
                        <div>月間ランキング: {content.monthlyRanking}位</div>
                        <div>週間ランキング: {content.weeklyRanking}位</div>
                    </div>
                    <div className="mb-4">{content.description}</div>
                    <div className="mb-4">
                        <div className="flex justify-between items-center mb-2">
                            <h3 className="text-xl font-bold">コメント一覧</h3>
                            <button onClick={handleAddComment} className="bg-blue-500 text-white font-bold py-2 px-4 rounded">
                                コメントを追加する
                            </button>
                        </div>
                        {comments.slice(0, showAllComments ? comments.length : 2).map((comment, index) => (
                            <div key={index} className="border p-2 mb-2">
                                <div className="flex justify-between">
                                    <span>{comment.userName}</span>
                                    <span>{comment.date}</span>
                                </div>
                                <div>{'★'.repeat(comment.rating)}{'☆'.repeat(5 - comment.rating)}</div>
                                <p>{comment.text}</p>
                                {comment.isOwnComment && (
                                    <button onClick={handleEditComment} className="text-blue-500">
                                        編集
                                    </button>
                                )}
                            </div>
                        ))}
                        {comments.length > 2 && !showAllComments && (
                            <button onClick={() => setShowAllComments(true)} className="text-blue-500">
                                もっと見る
                            </button>
                        )}
                    </div>
                    <div>
                        <h3 className="text-xl font-bold mb-2">関連作品</h3>
                        <div className="flex overflow-x-auto">
                            {relatedWorks.map((work, index) => (
                                <div key={index} className="flex-shrink-0 w-48 mr-4">
                                    <img src={work.coverImage} alt={work.title} className="w-full h-64 object-cover mb-2" />
                                    <div className="bg-red-500 text-white inline-block px-2 py-1 rounded mb-1">
                                        {work.discount}% OFF
                                    </div>
                                    <div className="font-bold">¥{work.price}</div>
                                    <div className="text-sm truncate">{work.title}</div>
                                    <div className="text-sm text-gray-600">{work.authorName}</div>
                                    <div className="text-sm">
                                        {'★'.repeat(Math.round(work.averageRating))}{'☆'.repeat(5 - Math.round(work.averageRating))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </main>
            )}
        </div>
    );
};

export default ContentPage;