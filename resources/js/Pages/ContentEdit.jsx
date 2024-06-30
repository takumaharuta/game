import React, { useState } from 'react';
import axios from 'axios';
import { useDropzone } from 'react-dropzone';

const ContentEdit = () => {
    const [content, setContent] = useState({ pages: [] });
    const [isSaved, setIsSaved] = useState(false);

    const addImage = (pageIndex, files) => {
        // 画像アップロード処理
        const file = files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const newPages = [...content.pages];
                if (!newPages[pageIndex].images) {
                    newPages[pageIndex].images = [];
                }
                newPages[pageIndex].images.push(reader.result);
                setContent({ ...content, pages: newPages });
            };
            reader.readAsDataURL(file);
        }
    };

    const addChoice = (pageIndex) => {
        const numChoices = parseInt(window.prompt('選択肢の数を入力してください (1-5):'), 10);
        if (numChoices > 0 && numChoices <= 5) {
            const newChoices = [];
            for (let i = 0; i < numChoices; i++) {
                const choiceText = window.prompt(`選択肢 ${i + 1} のテキストを入力してください`);
                if (choiceText) {
                    newChoices.push({ text: choiceText });
                }
            }
            const newPages = [...content.pages];
            if (!newPages[pageIndex].choices) {
                newPages[pageIndex].choices = [];
            }
            newPages[pageIndex].choices.push(...newChoices);
            setContent({ ...content, pages: newPages });
        } else {
            alert('選択肢の数は1から5の間で入力してください');
        }
    };

    const saveContent = async () => {
        const scrollType = window.confirm('縦スクロールにしますか？') ? 'vertical' : 'horizontal';
        try {
            await axios.post('/api/contents', { ...content, scrollType });
            setIsSaved(true);
        } catch (error) {
            console.error('Error saving content:', error);
        }
    };

    const { getRootProps, getInputProps } = useDropzone({
        onDrop: (acceptedFiles, pageIndex) => addImage(pageIndex, acceptedFiles)
    });

    return (
        <div>
            <header className="flex justify-between items-center bg-blue-500 p-4 shadow-md text-white">
                <div className="text-2xl font-bold">Gamebook</div>
                <div className="flex space-x-4">
                    {!isSaved ? (
                        <button onClick={saveContent} className="bg-blue-700 hover:bg-blue-900 text-white font-bold py-2 px-4 rounded">保存</button>
                    ) : (
                        <>
                            <button className="bg-blue-700 hover:bg-blue-900 text-white font-bold py-2 px-4 rounded">終了</button>
                            <button className="bg-blue-700 hover:bg-blue-900 text-white font-bold py-2 px-4 rounded">編集</button>
                            <button className="bg-blue-700 hover:bg-blue-900 text-white font-bold py-2 px-4 rounded">プレビュー</button>
                        </>
                    )}
                </div>
            </header>
            <main className="p-4">
                {!isSaved && (
                    <div className="flex justify-center mb-4">
                        <button onClick={() => setContent({ ...content, pages: [...content.pages, { images: [], choices: [] }] })} className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mx-2">新しいページを追加</button>
                    </div>
                )}
                {content.pages.map((page, index) => (
                    <div key={index} className="mb-4 p-4 border rounded shadow-md">
                        <div {...getRootProps({ className: 'dropzone' })}>
                            <input {...getInputProps()} />
                            <p>画像をドラッグ＆ドロップするか、クリックしてファイルを選択してください</p>
                        </div>
                        {page.images && page.images.map((image, imgIndex) => (
                            <img key={imgIndex} src={image} alt="Page content" className="mb-2 w-full" />
                        ))}
                        {page.choices && page.choices.map((choice, choiceIndex) => (
                            <div key={choiceIndex} className="flex flex-col mb-2">
                                <span className="font-bold mb-1">選択肢 {choiceIndex + 1}</span>
                                <button className="bg-gray-200 hover:bg-gray-300 text-black font-bold py-2 px-4 rounded mb-2">{choice.text}</button>
                            </div>
                        ))}
                        {!isSaved && (
                            <div className="flex space-x-2">
                                <button onClick={() => addImage(index)} className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">画像追加</button>
                                <button onClick={() => addChoice(index)} className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded">選択肢</button>
                            </div>
                        )}
                    </div>
                ))}
            </main>
        </div>
    );
};

export default ContentEdit;
