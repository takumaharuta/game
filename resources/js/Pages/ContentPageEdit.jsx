import React, { useState, useCallback, useEffect } from 'react';
import axios from 'axios';
import { useDropzone } from 'react-dropzone';

const ContentPageEdit = ({ contentPage: initialContentPage = {}, content: initialContent = {} }) => {
    const [contentPage, setContentPage] = useState({
        title: '',
        description: '',
        price: '',
        discount: '',
        tags: [],
        is_published: false,
        cover_image: null,
        ...initialContentPage
    });
    const [content, setContent] = useState({
        scroll_type: 'default',
        ...initialContent
    });
    const [isSaved, setIsSaved] = useState(false);
    const [editMode, setEditMode] = useState(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        setContentPage(prev => ({
            ...prev,
            ...initialContentPage
        }));
        setContent(prev => ({
            ...prev,
            ...initialContent
        }));
    }, [initialContentPage, initialContent]);

    const resizeImage = useCallback((file) => {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    const scaleFactor = Math.min(400 / img.width, 400 / img.height);
                    canvas.width = img.width * scaleFactor;
                    canvas.height = img.height * scaleFactor;
                    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                    resolve(canvas.toDataURL('image/jpeg'));
                };
                img.src = e.target.result;
            };
            reader.readAsDataURL(file);
        });
    }, []);

    const onDrop = useCallback(async (acceptedFiles) => {
        if (!mounted) return;
        const file = acceptedFiles[0];
        if (file) {
            try {
                const resizedImage = await resizeImage(file);
                setContentPage(prev => ({ ...prev, cover_image: resizedImage }));
                setEditMode(null);
            } catch (error) {
                console.error('Error resizing image:', error);
            }
        }
    }, [mounted, resizeImage]);

    const { getRootProps, getInputProps } = useDropzone({
        onDrop,
        accept: 'image/*'
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setContentPage(prev => ({ ...prev, [name]: value }));
    };

    const handleContentInputChange = (e) => {
        const { name, value } = e.target;
        setContent(prev => ({ ...prev, [name]: value }));
    };

    const handleTagInput = (e) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            const tag = e.target.value.trim();
            if (tag && !contentPage.tags.includes(tag)) {
                setContentPage(prev => ({ ...prev, tags: [...prev.tags, tag] }));
                e.target.value = '';
            }
        }
    };

    const removeTag = (tagToRemove) => {
        setContentPage(prev => ({
            ...prev,
            tags: prev.tags.filter(tag => tag !== tagToRemove)
        }));
    };

    const saveContentPage = async () => {
        try {
            const response = await axios.post('/api/content-page', { ...contentPage, ...content });
            setIsSaved(true);
            console.log('Content page saved:', response.data);
        } catch (error) {
            console.error('Error saving content page:', error);
            // ここでエラーメッセージを表示するなどのエラーハンドリングを行う
        }
    };

    const handleEdit = (mode) => {
        setEditMode(mode);
    };

    if (!mounted) {
        return null;
    }

    return (
        <div className="content-page-edit">
            <header className="flex justify-between items-center p-4 bg-blue-500 text-white">
                <h1 className="text-2xl font-bold">コンテンツページ編集</h1>
                <div>
                    <button onClick={saveContentPage} className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mr-2">
                        保存
                    </button>
                    {!isSaved && (
                        <button onClick={() => setIsSaved(true)} className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded">
                            プレビュー
                        </button>
                    )}
                </div>
            </header>
            <main className="p-4">
                <div className="mb-4 p-4 border rounded shadow-md relative w-full flex flex-col">
                    <h2 className="text-xl font-bold mb-2">コンテンツ情報</h2>
                    <input
                        type="text"
                        name="title"
                        value={contentPage.title}
                        onChange={handleInputChange}
                        placeholder="タイトル"
                        className="w-full text-2xl font-bold mb-4 p-2 border rounded"
                    />
                    <div className="flex mb-4">
                        <div {...getRootProps()} className="w-1/2 border-2 border-dashed border-gray-300 rounded p-4 flex items-center justify-center">
                            <input {...getInputProps()} />
                            {contentPage.cover_image ? (
                                <img src={contentPage.cover_image} alt="カバー画像" className="max-w-full max-h-64" />
                            ) : (
                                <p>カバー画像をドラッグ＆ドロップまたはクリックして選択</p>
                            )}
                        </div>
                        <div className="w-1/2 ml-4 border p-4">
                            <input
                                type="number"
                                name="discount"
                                value={contentPage.discount}
                                onChange={handleInputChange}
                                placeholder="割引率"
                                className="w-full mb-2 p-2 border rounded"
                            />
                            <input
                                type="number"
                                name="price"
                                value={contentPage.price}
                                onChange={handleInputChange}
                                placeholder="価格"
                                className="w-full p-2 border rounded"
                            />
                        </div>
                    </div>
                    <div className="mb-4">
                        <input
                            type="text"
                            placeholder="タグを入力（Enterで追加）"
                            onKeyDown={handleTagInput}
                            className="w-full p-2 border rounded"
                        />
                        <div className="flex flex-wrap mt-2">
                            {contentPage.tags && contentPage.tags.map((tag, index) => (
                                <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded mr-2 mb-2">
                                    {tag}
                                    <button onClick={() => removeTag(tag)} className="ml-2 text-red-500">&times;</button>
                                </span>
                            ))}
                        </div>
                    </div>
                    <textarea
                        name="description"
                        value={contentPage.description}
                        onChange={handleInputChange}
                        placeholder="説明"
                        className="w-full h-32 p-2 border rounded"
                    />
                    <div className="mt-4">
                        <label className="flex items-center">
                            <input
                                type="checkbox"
                                name="is_published"
                                checked={contentPage.is_published}
                                onChange={(e) => setContentPage(prev => ({ ...prev, is_published: e.target.checked }))}
                                className="form-checkbox h-5 w-5 text-blue-600"
                            />
                            <span className="ml-2 text-gray-700">公開する</span>
                        </label>
                    </div>
                    <div className="mt-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="scroll_type">
                            スクロールタイプ
                        </label>
                        <select
                            id="scroll_type"
                            name="scroll_type"
                            value={content.scroll_type}
                            onChange={handleContentInputChange}
                            className="w-full p-2 border rounded"
                        >
                            <option value="default">デフォルト</option>
                            <option value="horizontal">横スクロール</option>
                            <option value="vertical">縦スクロール</option>
                        </select>
                    </div>
                </div>
            </main>
            {editMode && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="bg-white p-4 rounded max-w-lg w-full">
                        <h2 className="text-xl font-bold mb-4">{editMode === 'image' ? '画像' : 'コンテンツ情報'}を編集</h2>
                        {/* 編集モードの内容をここに追加 */}
                        <div className="flex justify-end space-x-2">
                            <button onClick={() => setEditMode(null)} className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded">
                                キャンセル
                            </button>
                            <button onClick={() => setEditMode(null)} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                                保存
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ContentPageEdit;