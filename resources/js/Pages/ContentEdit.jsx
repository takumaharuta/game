import React, { useState, useCallback, useRef, useEffect } from 'react';
import axios from 'axios';
import { useDropzone } from 'react-dropzone';
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";

const ContentEdit = () => {
    const [content, setContent] = useState({ pages: [{ id: '1', images: [], choices: [] }] });
    const [isSaved, setIsSaved] = useState(false);
    const [scrollType, setScrollType] = useState('horizontal');
    const [editingPage, setEditingPage] = useState(null);
    const [editMode, setEditMode] = useState(null);
    const [choiceInputs, setChoiceInputs] = useState([]);
    const [choiceFlavor, setChoiceFlavor] = useState('default');
    const contentRef = useRef(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const resizeImage = useCallback((file) => {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new window.Image();
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

    const getNextPageId = (currentPageId) => {
        const parts = currentPageId.split('-');
        const mainNumber = parseInt(parts[0]);
        const nextMainNumber = mainNumber + 1;
        return parts.length > 1 
            ? `${nextMainNumber}-${parts.slice(1).join('-')}` 
            : `${nextMainNumber}`;
    };

    const onDrop = useCallback(async (acceptedFiles, pageId) => {
        if (!mounted || !pageId) return;

        const file = acceptedFiles[0];
        if (file) {
            try {
                const resizedImage = await resizeImage(file);
                setContent(prevContent => {
                    const newPages = prevContent.pages.map(page => 
                        page.id === pageId ? { ...page, images: [resizedImage], choices: [] } : page
                    );
                    const nextPageId = getNextPageId(pageId);
                    if (!newPages.some(page => page.id === nextPageId)) {
                        newPages.push({ id: nextPageId, images: [], choices: [] });
                    }
                    return { ...prevContent, pages: newPages };
                });
                setEditingPage(null);
                setEditMode(null);
            } catch (error) {
                console.error('Error resizing image:', error);
            }
        }
    }, [mounted, resizeImage]);

    const { getRootProps, getInputProps } = useDropzone({
        onDrop: (acceptedFiles) => onDrop(acceptedFiles, editingPage),
        accept: 'image/*'
    });

    const handleChoiceInput = (index, value) => {
        const newInputs = [...choiceInputs];
        newInputs[index] = value;
        setChoiceInputs(newInputs);
    };

    const saveChoices = () => {
        const validChoices = choiceInputs.filter(choice => choice.text.trim() !== '');
        if (validChoices.length < 2) {
            alert('少なくとも2つの選択肢を入力してください。');
            return;
        }

        setContent(prevContent => {
            const newPages = [...prevContent.pages];
            const currentPageIndex = newPages.findIndex(page => page.id === editingPage);
            const currentPage = { ...newPages[currentPageIndex] };
            
            const nextMainNumber = parseInt(currentPage.id.split('-')[0]) + 1;
            const newChoices = validChoices.map((choice, index) => ({
                text: choice.text,
                flavor: choiceFlavor,
                nextPageId: `${nextMainNumber}-${index + 1}${currentPage.id.includes('-') ? currentPage.id.slice(currentPage.id.indexOf('-')) : ''}`
            }));

            currentPage.choices = newChoices;
            currentPage.images = [];
            newPages[currentPageIndex] = currentPage;

            // 新しいページを追加
            newChoices.forEach((choice) => {
                if (!prevContent.pages.some(page => page.id === choice.nextPageId)) {
                    newPages.push({
                        id: choice.nextPageId,
                        images: [],
                        choices: []
                    });
                }
            });

            return { ...prevContent, pages: newPages };
        });

        setEditingPage(null);
        setEditMode(null);
        setChoiceInputs([]);
        setChoiceFlavor('default');
    };

    const saveContent = async () => {
        try {
            await axios.post('/api/contents', { ...content, scrollType });
            setIsSaved(true);
        } catch (error) {
            console.error('Error saving content:', error);
        }
    };

    const addNewPage = (pageId) => {
        setContent(prevContent => {
            const newPages = [...prevContent.pages];
            let newPageId;

            if (pageId.includes('-')) {
                // 分岐ページの場合
                const [mainId, subId] = pageId.split('-');
                newPageId = `${parseInt(mainId) + 1}-${subId}`;
            } else {
                // メインページの場合
                newPageId = `${parseInt(pageId) + 1}`;
            }
            console.log(newPageId);
    
            // 新しいページを挿入する正しい位置を見つける
            const currentIndex = newPages.findIndex(p => p.id === pageId);
            let insertIndex = currentIndex + 1;
            while (insertIndex < newPages.length && 
                   (parseInt(newPages[insertIndex].id.split('-')[0]) <= parseInt(newPageId.split('-')[0]))) {
                insertIndex++;
            }
    
            // 新しいページを挿入
            newPages.splice(insertIndex, 0, { id: newPageId, images: [], choices: [] });
            
            // 後続のページのIDを更新
            for (let i = insertIndex + 1; i < newPages.length; i++) {
                const currentId = newPages[i].id;
                if (currentId.includes('-')) {
                    const [mainId, subId] = currentId.split('-');
                    if (parseInt(mainId) >= parseInt(newPageId.split('-')[0])) {
                        newPages[i].id = `${parseInt(mainId) + 1}-${subId}`;
                    }
                } else if (parseInt(currentId) > parseInt(newPageId.split('-')[0])) {
                    newPages[i].id = `${parseInt(currentId) + 1}`;
                }
            }
    
            return { ...prevContent, pages: newPages };
        });
    };
    
    const deletePage = (pageId) => {
        setContent(prevContent => {
            const newPages = prevContent.pages.filter(page => page.id !== pageId);
            return { ...prevContent, pages: newPages };
        });
    };

    const renderPages = (pages) => {
        const rootPages = pages.filter(page => !page.id.includes('-'));
        return (
            <div className="flex flex-row space-x-4">
                {rootPages.map(page => (
                    <div key={page.id} className="flex flex-row space-x-4">
                        <PageContent page={page} />
                        {page.choices.length > 0 && (
                            <div className="flex flex-col space-y-4">
                                {page.choices.map((choice, index) => {
                                    const childPage = pages.find(p => p.id === choice.nextPageId);
                                    return (
                                        <div key={index} className="flex flex-row items-start space-x-4">
                                            <div className="w-32 p-2 bg-gray-200 rounded">
                                                選択肢{index + 1}: {choice.text}
                                            </div>
                                            {childPage && <PageContent page={childPage} isChild={true} />}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        );
    };

    const PageContent = ({ page, isChild = false }) => {
        const { getRootProps: getPageRootProps, getInputProps: getPageInputProps } = useDropzone({
            onDrop: (acceptedFiles) => onDrop(acceptedFiles, page.id),
            accept: 'image/*'
        });

        const handleEdit = () => {
            setEditingPage(page.id);
            if (page.images.length > 0) {
                setEditMode('image');
            } else if (page.choices.length > 0) {
                setEditMode('choice');
                setChoiceInputs(page.choices.map(choice => ({ text: choice.text, nextPageId: choice.nextPageId })));
                setChoiceFlavor(page.choices[0].flavor);
            } else {
                setEditMode('choice');
                setChoiceInputs([]);
                setChoiceFlavor('default');
            }
        };

        return (
            <div className="mb-4 p-4 border rounded shadow-md relative w-96 flex flex-col">
                <div className="overflow-auto">
                    <h2 className="text-xl font-bold mb-2">Page {page.id}</h2>
                    {page.images.map((image, imgIndex) => (
                        <img key={imgIndex} src={image} alt={`Page content ${imgIndex + 1}`} className="mb-2 w-full" style={{maxWidth: '100%', height: 'auto'}} />
                    ))}
                    {page.choices.map((choice, choiceIndex) => (
                        <div key={choiceIndex} className="mb-2">
                            <span className="font-bold">選択肢 {choiceIndex + 1}: </span>
                            {choice.text}
                        </div>
                    ))}
                </div>
                {!isSaved && (
                    <div className="flex flex-wrap justify-center space-x-2 mt-4">
                        {page.images.length === 0 && page.choices.length === 0 ? (
                            <>
                                <div {...getPageRootProps()} className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded cursor-pointer mb-2">
                                    <input {...getPageInputProps()} />
                                    画像追加
                                </div>
                                <button onClick={handleEdit} className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded mb-2">選択肢</button>
                            </>
                        ) : (
                            <button onClick={handleEdit} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-2">編集</button>
                        )}
                        <button onClick={() => addNewPage(page.id)} className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mb-2">右に1ページ追加</button>
                        {page.id !== '1' && (
                            <button onClick={() => deletePage(page.id)} className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded mb-2">削除</button>
                        )}
                    </div>
                )}
            </div>
        );
    };

    const handleDeleteChoice = (index) => {
        setContent(prevContent => {
            const currentPage = prevContent.pages.find(page => page.id === editingPage);
            const choiceToDelete = currentPage.choices[index];
            const childPageId = choiceToDelete.nextPageId;
            const childPage = prevContent.pages.find(page => page.id === childPageId);

            if (childPage && childPage.images.length > 0) {
                if (!window.confirm('この選択肢のルート先に画像が存在します。本当に削除しますか？')) {
                    return prevContent;
                }
            }

            const newChoices = currentPage.choices.filter((_, i) => i !== index);
            const newPages = prevContent.pages.map(page => 
                page.id === editingPage ? { ...page, choices: newChoices } : page
            ).filter(page => page.id !== childPageId);

            return { ...prevContent, pages: newPages };
        });

        setChoiceInputs(prevInputs => prevInputs.filter((_, i) => i !== index));
    };

    const handleSetNextPage = (index) => {
        const pageOptions = content.pages.map(page => page.id);
        const selectedNextPage = window.prompt("遷移先のページIDを選択してください", choiceInputs[index].nextPageId || "");
        if (selectedNextPage && pageOptions.includes(selectedNextPage)) {
            const newChoiceInputs = [...choiceInputs];
            newChoiceInputs[index] = { ...newChoiceInputs[index], nextPageId: selectedNextPage };
            setChoiceInputs(newChoiceInputs);
        } else if (selectedNextPage) {
            alert("選択されたページIDは存在しません。");
        }
    };

    if (!mounted) {
        return null;
    }

    return (
        <div className="h-screen flex flex-col overflow-hidden">
            <header className="flex-shrink-0 flex justify-between items-center bg-blue-500 p-4 shadow-md text-white">
                <div className="text-2xl font-bold">Gamebook</div>
                <div className="flex space-x-4">
                    {!isSaved ? (
                        <>
                            <select 
                                value={scrollType} 
                                onChange={(e) => setScrollType(e.target.value)}
                                className="bg-blue-700 text-white py-2 px-4 rounded"
                            >
                                <option value="horizontal">横スクロール</option>
                                <option value="vertical">縦スクロール</option>
                            </select>
                            <button onClick={saveContent} className="bg-blue-700 hover:bg-blue-900 text-white font-bold py-2 px-4 rounded">保存</button>
                        </>
                    ) : (
                        <>
                            <button className="bg-blue-700 hover:bg-blue-900 text-white font-bold py-2 px-4 rounded">終了</button>
                            <button onClick={() => setIsSaved(false)} className="bg-blue-700 hover:bg-blue-900 text-white font-bold py-2 px-4 rounded">編集</button>
                            <button className="bg-blue-700 hover:bg-blue-900 text-white font-bold py-2 px-4 rounded">プレビュー</button>
                        </>
                    )}
                </div>
            </header>
            <div className="flex-grow overflow-auto">
                <TransformWrapper
                    limitToBounds={false}
                    wheel={{ step: 50 }}
                    pinch={{ disabled: false }}
                    pan={{
                        disabled: false,
                        touchPadEnabled: true,
                        velocityEqualToMove: true,
                        velocity: true
                    }}
                >
                    <TransformComponent wrapperClass="w-full h-full" contentClass="w-full h-full">
                        <main className="p-4" ref={contentRef}>
                            {renderPages(content.pages)}
                        </main>
                    </TransformComponent>
                </TransformWrapper>
            </div>
            {editingPage !== null && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="bg-white p-4 rounded max-w-lg w-full">
                        <h2 className="text-xl font-bold mb-4">Page {editingPage} の{editMode === 'image' ? '画像' : '選択肢'}を編集</h2>
                        {editMode === 'image' && (
                            <div {...getRootProps()} className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer">
                                <input {...getInputProps()} />
                                <p>ここにドラッグ＆ドロップするか、クリックして画像を選択してください</p>
                            </div>
                        )}
                        {editMode === 'choice' && (
                            <>
                                {choiceInputs.map((choice, index) => (
                                    <div key={index} className="flex items-center mb-2">
                                        <input
                                            type="text"
                                            value={choice.text}
                                            onChange={(e) => handleChoiceInput(index, { ...choice, text: e.target.value })}
                                            placeholder={`選択肢 ${index + 1}`}
                                            className="flex-grow p-2 border rounded mr-2"
                                        />
                                        <button 
                                            onClick={() => handleDeleteChoice(index)}
                                            className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded mr-2"
                                        >
                                            削除
                                        </button>
                                        <button 
                                            onClick={() => handleSetNextPage(index)}
                                            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded"
                                        >
                                            遷移先指定
                                        </button>
                                    </div>
                                ))}
                                <button 
                                    onClick={() => setChoiceInputs([...choiceInputs, { text: '', nextPageId: null }])}
                                    className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mb-4"
                                >
                                    選択肢を追加
                                </button>
                                <select
                                    value={choiceFlavor}
                                    onChange={(e) => setChoiceFlavor(e.target.value)}
                                    className="w-full p-2 mb-4 border rounded"
                                >
                                    <option value="default">デフォルト</option>
                                    <option value="bubble">吹き出し</option>
                                    <option value="fancy">ファンシー</option>
                                </select>
                            </>
                        )}
                        <div className="flex justify-end space-x-2">
                            <button onClick={() => {setEditingPage(null); setEditMode(null);}} className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded">
                                キャンセル
                            </button>
                            <button onClick={editMode === 'choice' ? saveChoices : () => {setEditingPage(null); setEditMode(null);}} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                                保存
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ContentEdit;