import React, { useState, useEffect } from 'react';
import { Link } from '@inertiajs/inertia-react';
import axios from 'axios';
import Header from '../Components/Header';

const MAX_COMMENT_LENGTH = 500;

const PurchasedWorks = ({ purchasedWorks }) => {
    const [comments, setComments] = useState({});
    const [newComments, setNewComments] = useState({});
    const [newRatings, setNewRatings] = useState({});
    const [commentErrors, setCommentErrors] = useState({});
    const [editingCommentId, setEditingCommentId] = useState(null);

    useEffect(() => {
        purchasedWorks.forEach(work => fetchComments(work.id));
    }, []);

    const fetchComments = async (workId) => {
        try {
            const response = await axios.get(`/content-page/${workId}/comments`);
            setComments(prevComments => ({ ...prevComments, [workId]: response.data }));
        } catch (error) {
            console.error('Error fetching comments:', error);
        }
    };

    const handleCommentChange = (workId, content) => {
        if (content.length <= MAX_COMMENT_LENGTH) {
            setNewComments(prevComments => ({ ...prevComments, [workId]: content }));
        }
    };

    const handleRatingChange = (workId, rating) => {
        setNewRatings(prevRatings => ({ ...prevRatings, [workId]: rating }));
    };

    const submitComment = async (workId) => {
        try {
            const data = {
                content: newComments[workId],
                rating: newRatings[workId],
            };

            if (editingCommentId) {
                await axios.put(`/content-page/${workId}/comment/${editingCommentId}`, data);
            } else {
                await axios.post(`/content-page/${workId}/comment`, data);
            }
            setNewComments(prevComments => ({ ...prevComments, [workId]: '' }));
            setNewRatings(prevRatings => ({ ...prevRatings, [workId]: 0 }));
            fetchComments(workId);
            setCommentErrors(prevErrors => ({ ...prevErrors, [workId]: '' }));
            setEditingCommentId(null);
        } catch (error) {
            setCommentErrors(prevErrors => ({ 
                ...prevErrors, 
                [workId]: error.response?.data?.message || 'エラーが発生しました。'
            }));
        }
    };

    const startEditing = (workId, commentId, content, rating) => {
        setEditingCommentId(commentId);
        setNewComments(prevComments => ({ ...prevComments, [workId]: content }));
        setNewRatings(prevRatings => ({ ...prevRatings, [workId]: rating }));
    };

    const cancelEditing = (workId) => {
        setEditingCommentId(null);
        setNewComments(prevComments => ({ ...prevComments, [workId]: '' }));
        setNewRatings(prevRatings => ({ ...prevRatings, [workId]: 0 }));
    };

    const renderStars = (rating, workId, isEditing = false) => {
        return [1, 2, 3, 4, 5].map((star) => (
            <span
                key={star}
                className={`cursor-pointer ${star <= (isEditing ? newRatings[workId] : rating) ? 'text-yellow-500' : 'text-gray-300'}`}
                onClick={() => isEditing && handleRatingChange(workId, star)}
            >
                ★
            </span>
        ));
    };

    return (
        <div>
            <Header />
            <main className="container mx-auto p-4">
                <h1 className="text-2xl font-bold mb-4">購入済み作品一覧</h1>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {purchasedWorks.map((work) => (
                        <div key={work.id} className="border rounded-lg overflow-hidden">
                            <img src={work.cover_image} alt={work.title} className="w-full h-48 object-cover" />
                            <div className="p-4">
                                <h2 className="text-xl font-semibold mb-2">{work.title}</h2>
                                <p className="text-gray-600 mb-2">作者: {work.author_name}</p>
                                <p className="text-gray-500 mb-2">購入日: {work.purchase_date}</p>
                                <Link
                                    href={`/content-page/${work.id}`}
                                    className="inline-block bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 mb-2"
                                >
                                    作品を見る
                                </Link>
                                <div className="mt-4">
                                    <h3 className="text-lg font-semibold">コメント</h3>
                                    {comments[work.id] && comments[work.id].length > 0 ? (
                                        comments[work.id].map((comment) => (
                                            <div key={comment.id} className="bg-gray-100 p-2 rounded mt-2">
                                                {editingCommentId === comment.id ? (
                                                    <>
                                                        <textarea
                                                            value={newComments[work.id] || ''}
                                                            onChange={(e) => handleCommentChange(work.id, e.target.value)}
                                                            className="w-full mt-2 p-2 border rounded"
                                                            placeholder="コメントを入力..."
                                                        />
                                                        <p className="text-sm text-gray-500 mt-1">
                                                            {newComments[work.id]?.length || 0}/{MAX_COMMENT_LENGTH}文字
                                                        </p>
                                                        <div className="mt-2">
                                                            評価: {renderStars(comment.rating, work.id, true)}
                                                        </div>
                                                        <button
                                                            onClick={() => submitComment(work.id)}
                                                            className="mt-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 mr-2"
                                                        >
                                                            更新
                                                        </button>
                                                        <button
                                                            onClick={() => cancelEditing(work.id)}
                                                            className="mt-2 bg-gray-300 text-black px-4 py-2 rounded hover:bg-gray-400"
                                                        >
                                                            キャンセル
                                                        </button>
                                                    </>
                                                ) : (
                                                    <>
                                                        <p>{comment.content}</p>
                                                        <p className="text-sm text-gray-500">By: {comment.user.name}</p>
                                                        <div className="mt-1">
                                                            評価: {renderStars(comment.rating, work.id)}
                                                        </div>
                                                        <button
                                                            onClick={() => startEditing(work.id, comment.id, comment.content, comment.rating)}
                                                            className="mt-2 text-blue-500 hover:underline"
                                                        >
                                                            編集
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        ))
                                    ) : (
                                        <div>
                                            <textarea
                                                value={newComments[work.id] || ''}
                                                onChange={(e) => handleCommentChange(work.id, e.target.value)}
                                                className="w-full mt-2 p-2 border rounded"
                                                placeholder="コメントを入力..."
                                            />
                                            <p className="text-sm text-gray-500 mt-1">
                                                {newComments[work.id]?.length || 0}/{MAX_COMMENT_LENGTH}文字
                                            </p>
                                            <div className="mt-2">
                                                評価: {renderStars(0, work.id, true)}
                                            </div>
                                            {commentErrors[work.id] && <p className="text-red-500">{commentErrors[work.id]}</p>}
                                            <button
                                                onClick={() => submitComment(work.id)}
                                                className="mt-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                                            >
                                                コメントする
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
};

export default PurchasedWorks;