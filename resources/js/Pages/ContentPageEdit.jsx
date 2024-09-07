import React, { useState, useCallback, useEffect } from 'react';
import { Link } from '@inertiajs/inertia-react';
import axios from 'axios';
import { useDropzone } from 'react-dropzone';
import { Inertia } from '@inertiajs/inertia';
import Header from '../Components/Header';

const ContentPageEdit = ({ contentPage: initialContentPage = {} }) => {
    const [contentPage, setContentPage] = useState(() => ({
        title: '',
        description: '',
        display_price: 1000,
        discount_percentage: 0,
        cover_image: null,
        ...initialContentPage,
        tags: Array.isArray(initialContentPage.tags)
            ? initialContentPage.tags.map(tag => typeof tag === 'string' ? { name: tag } : tag)
            : []
    }));

    const [mounted, setMounted] = useState(false);
    const [tagSuggestions, setTagSuggestions] = useState([]);
    const [existingTags, setExistingTags] = useState([]);
    const [tagInput, setTagInput] = useState('');
    const [priceError, setPriceError] = useState('');
    const [isPreviewMode, setIsPreviewMode] = useState(false);
    

    useEffect(() => {
        setMounted(true);
        fetchExistingTags();
    }, []);

    useEffect(() => {
        setContentPage(prev => ({
            ...prev,
            ...initialContentPage,
            tags: Array.isArray(initialContentPage.tags)
                ? initialContentPage.tags.map(tag => typeof tag === 'string' ? { name: tag } : tag)
                : []
        }));
    }, [initialContentPage]);

    const fetchExistingTags = async () => {
        try {
            const response = await axios.get('/tags');
            setExistingTags(response.data);
        } catch (error) {
            console.error('Error fetching existing tags:', error);
        }
    };

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
            const reader = new FileReader();
            reader.onloadend = () => {
                setContentPage(prev => ({ ...prev, cover_image: reader.result }));
            };
            reader.readAsDataURL(file);
        }
    }, [mounted]);

    const { getRootProps, getInputProps } = useDropzone({
        onDrop,
        accept: 'image/*'
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        if (name === 'display_price') {
            const numValue = parseInt(value, 10);
            if (isNaN(numValue) || numValue < 0) {
                setPriceError('価格は0以上の整数で入力してください');
            } else {
                setPriceError('');
                setContentPage(prev => ({ ...prev, [name]: numValue }));
            }
        } else {
            setContentPage(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleTagInputChange = (e) => {
        const input = e.target.value;
        setTagInput(input);

        if (input.trim()) {
            const suggestions = existingTags.filter(tag => 
                tag.name.toLowerCase().includes(input.toLowerCase())
            );
            setTagSuggestions(suggestions);
        } else {
            setTagSuggestions([]);
        }
    };

    const handleTagSelect = (selectedTag) => {
        if (!contentPage.tags.some(tag => tag.name === selectedTag.name)) {
            setContentPage(prev => ({
                ...prev,
                tags: [...prev.tags, { name: selectedTag.name }]
            }));
        }
        setTagInput('');
        setTagSuggestions([]);
    };

    const handleTagInput = (e) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            const tagName = tagInput.trim();
            if (tagName && !contentPage.tags.some(tag => tag.name === tagName)) {
                setContentPage(prev => ({ 
                    ...prev, 
                    tags: [...prev.tags, { name: tagName }] 
                }));
                setTagInput('');
                setTagSuggestions([]);
            }
        }
    };

    const removeTag = (tagNameToRemove) => {
        setContentPage(prev => ({
            ...prev,
            tags: prev.tags.filter(tag => tag.name !== tagNameToRemove)
        }));
    };
    
    
        const saveContentPage = () => {
            const formData = {
                ...contentPage,
                tags: contentPage.tags.map(tag => tag.name)
            };
        
            console.log('saveContentPage called', formData);
        
            if (contentPage.id) {
                console.log('Updating existing page', contentPage.id);
                Inertia.put(`/content-page/${contentPage.id}`, formData, {
                    preserveState: false,
                    preserveScroll: true,
                    onSuccess: (page) => {
                        console.log('Update successful', page);
                    },
                    onError: (errors) => {
                        console.error('Update failed', errors);
                    }
                });
            } else {
                console.log('Creating new page');
                Inertia.post('/content-page', formData, {
                    preserveState: false,
                    preserveScroll: true,
                    onSuccess: (page) => {
                        console.log('Creation successful', page);
                    },
                    onError: (errors) => {
                        console.error('Creation failed', errors);
                    }
                });
            }
        };

    const calculateDisplayPrice = () => {
        const price = contentPage.display_price;
        const discount = contentPage.discount_percentage;
        return Math.round(price * (100 - discount) / 100);
    };

    if (!mounted) {
        return null;
    }

    return (
        <div className="content-page-edit">
            <header className="flex justify-between items-center p-4 bg-blue-500 text-white">
                <h1 className="text-2xl font-bold">Gamebook</h1>
                <div>
                    <button onClick={saveContentPage} className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mr-2">
                        保存
                    </button>
                </div>
            </header>
            <main className="p-4">
                {isPreviewMode ? (
                    <div className="flex">
                        <div className="w-4/5 pr-4">
                            {contentPage.cover_image ? (
                                <img 
                                    src={contentPage.cover_image.startsWith('data:') ? contentPage.cover_image : `/storage/${contentPage.cover_image}`} 
                                    alt="カバー画像" 
                                    className="max-w-full max-h-64" 
                                />
                            ) : (
                                <p>カバー画像をドラッグ＆ドロップまたはクリックして選択</p>
                            )}
                        </div>
                        <div className="w-1/5 bg-gray-100 p-4 rounded">
                            <h2 className="text-2xl font-bold mb-4">{contentPage.title}</h2>
                            {contentPage.discount_percentage > 0 && (
                                <div className="bg-red-500 text-white font-bold py-2 px-4 rounded inline-block mb-2">
                                    {contentPage.discount_percentage}% OFF
                                </div>
                            )}
                            {contentPage.discount_percentage > 0 ? (
                                <>
                                    <p className="text-gray-500 line-through">参考価格: {contentPage.display_price}円</p>
                                    <p className="text-xl font-bold">{calculateDisplayPrice()}円</p>
                                </>
                            ) : (
                                <p className="text-xl font-bold">{contentPage.display_price}円</p>
                            )}
                        </div>
                    </div>
                ) : (
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
                                    <img 
                                        src={contentPage.cover_image.startsWith('data:') 
                                            ? contentPage.cover_image 
                                            : contentPage.cover_image.startsWith('http') 
                                                ? contentPage.cover_image 
                                                : `/storage/${contentPage.cover_image}`} 
                                        alt="カバー画像" 
                                        className="max-w-full max-h-64" 
                                    />
                                ) : (
                                    <p>カバー画像をドラッグ＆ドロップまたはクリックして選択</p>
                                )}
                            </div>
                            <div className="w-1/2 ml-4 border p-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="discount_percentage">
                                    割引率
                                </label>
                                <select
                                    id="discount_percentage"
                                    name="discount_percentage"
                                    value={contentPage.discount_percentage}
                                    onChange={handleInputChange}
                                    className="w-full mb-2 p-2 border rounded"
                                >
                                    {[...Array(20)].map((_, i) => (
                                        <option key={i} value={i * 5}>{i * 5}%</option>
                                    ))}
                                </select>
                                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="display_price">
                                    価格
                                </label>
                                <input
                                    type="number"
                                    id="display_price"
                                    name="display_price"
                                    value={contentPage.display_price}
                                    onChange={handleInputChange}
                                    className={`w-full p-2 border rounded ${priceError ? 'border-red-500' : ''}`}
                                />
                                {priceError && <p className="text-red-500 text-sm">{priceError}</p>}
                                <p className="mt-2">表示単価: {calculateDisplayPrice()}円</p>
                            </div>
                        </div>
                        <div className="mb-4 relative">
                            <input
                                type="text"
                                value={tagInput}
                                onChange={handleTagInputChange}
                                onKeyDown={handleTagInput}
                                placeholder="タグを入力（Enterで追加）"
                                className="w-full p-2 border rounded"
                            />
                            {tagSuggestions.length > 0 && (
                                <div className="absolute z-10 w-full bg-white border rounded mt-1">
                                    {tagSuggestions.map((tag, index) => (
                                        <div 
                                            key={index} 
                                            className="p-2 hover:bg-gray-100 cursor-pointer"
                                            onClick={() => handleTagSelect(tag)}
                                        >
                                            <span>{tag.name}</span>
                                            <span className="ml-2 text-sm text-gray-500">({tag.count})</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        <div className="flex flex-wrap mt-2">
                            {contentPage.tags.map((tag, index) => (
                                <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded mr-2 mb-2">
                                    {tag.name}
                                    <button onClick={() => removeTag(tag.name)} className="ml-2 text-red-500">&times;</button>
                                </span>
                            ))}
                        </div>
                        <textarea
                            name="description"
                            value={contentPage.description}
                            onChange={handleInputChange}
                            placeholder="説明"
                            className="w-full h-32 p-2 border rounded"
                        />
                    </div>
                )}
                {isPreviewMode && (
                    <div className="mt-4">
                        <h3 className="text-xl font-bold mb-2">説明</h3>
                        <p>{contentPage.description}</p>
                        <div className="mt-4">
                            <h3 className="text-xl font-bold mb-2">タグ</h3>
                            <div className="flex flex-wrap">
                                {contentPage.tags.map((tag, index) => (
                                    <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded mr-2 mb-2">
                                        {tag.name}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default ContentPageEdit;