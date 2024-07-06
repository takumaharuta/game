import React, { useState, useEffect, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { useNavigate } from 'react-router-dom';

const ContentPageEdit = () => {
    const [title, setTitle] = useState('');
    const [coverImage, setCoverImage] = useState(null);
    const [discount, setDiscount] = useState('0');
    const [price, setPrice] = useState('');
    const [tags, setTags] = useState([]);
    const [description, setDescription] = useState('');
    const [isPublished, setIsPublished] = useState(false);
    const [isDirty, setIsDirty] = useState(false);
    
    const navigate = useNavigate();

    useEffect(() => {
        // ここでAPIから既存のデータを取得する処理を実装
    }, []);

    useEffect(() => {
        setIsDirty(true);
    }, [title, coverImage, discount, price, tags, description]);

    const onDrop = useCallback(acceptedFiles => {
        setCoverImage(acceptedFiles[0]);
    }, []);

    const { getRootProps, getInputProps } = useDropzone({ onDrop });

    const handleSave = async () => {
        // ここで保存処理を実装
        // APIを呼び出してデータを保存
        setIsDirty(false);
    };

    const handlePublishToggle = () => {
        const action = isPublished ? '出品停止' : '出品';
        if (window.confirm(`${action}しますか？`)) {
            setIsPublished(!isPublished);
            // ここでAPI呼び出しを実装して出品状態を更新
        }
    };

    const handleNavigateAway = (event) => {
        if (isDirty) {
            event.preventDefault();
            event.returnValue = ''; // For older browsers
            return '変更の保存がされていませんがよろしいですか？';
        }
    };

    useEffect(() => {
        window.addEventListener('beforeunload', handleNavigateAway);
        return () => {
            window.removeEventListener('beforeunload', handleNavigateAway);
        };
    }, [isDirty]);

    return (
        <div className="content-page-edit">
            <header className="flex justify-between items-center p-4 bg-blue-500 text-white">
                <h1 className="text-2xl font-bold">作品編集</h1>
                <div>
                    <button onClick={handleSave} className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mr-2">
                        保存
                    </button>
                    <button onClick={handlePublishToggle} className={`${isPublished ? 'bg-red-500 hover:bg-red-700' : 'bg-yellow-500 hover:bg-yellow-700'} text-white font-bold py-2 px-4 rounded`}>
                        {isPublished ? '出品停止中' : '出品中'}
                    </button>
                </div>
            </header>
            <main className="p-4">
                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="作品名"
                    className="w-full text-2xl font-bold mb-4 p-2 border rounded"
                />
                <div className="flex mb-4">
                    <div {...getRootProps()} className="w-1/2 border-2 border-dashed border-gray-300 rounded p-4 flex items-center justify-center">
                        <input {...getInputProps()} />
                        {coverImage ? (
                            <img src={URL.createObjectURL(coverImage)} alt="表紙" className="max-w-full max-h-64" />
                        ) : (
                            <p>表紙をドラッグ＆ドロップまたはクリックして選択</p>
                        )}
                    </div>
                    <div className="w-1/2 ml-4 border p-4">
                        <select
                            value={discount}
                            onChange={(e) => setDiscount(e.target.value)}
                            className="w-full mb-2 p-2 border rounded"
                        >
                            <option value="0">割引なし</option>
                            <option value="10">10% OFF</option>
                            <option value="20">20% OFF</option>
                            <option value="30">30% OFF</option>
                        </select>
                        <input
                            type="number"
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                            placeholder="定価"
                            className="w-full p-2 border rounded"
                        />
                    </div>
                </div>
                <div className="mb-4">
                    <input
                        type="text"
                        placeholder="タグを入力（カンマ区切り）"
                        className="w-full p-2 border rounded"
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ',') {
                                e.preventDefault();
                                const newTag = e.target.value.trim();
                                if (newTag && !tags.includes(newTag)) {
                                    setTags([...tags, newTag]);
                                    e.target.value = '';
                                }
                            }
                        }}
                    />
                    <div className="flex flex-wrap mt-2">
                        {tags.map((tag, index) => (
                            <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded mr-2 mb-2">
                                {tag}
                                <button onClick={() => setTags(tags.filter((_, i) => i !== index))} className="ml-2 text-red-500">&times;</button>
                            </span>
                        ))}
                    </div>
                </div>
                <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="作品紹介"
                    className="w-full h-32 p-2 border rounded"
                />
            </main>
        </div>
    );
};

export default ContentPageEdit;