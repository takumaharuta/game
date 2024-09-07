import React from 'react';
import { usePage } from '@inertiajs/react';
import { Inertia } from '@inertiajs/inertia';

const ContentPagePreview = () => {
    const { contentPage } = usePage().props;

    const calculateDisplayPrice = () => {
        const price = contentPage.display_price;
        const discount = contentPage.discount_percentage;
        return Math.round(price * (100 - discount) / 100);
    };

    const handleEdit = () => {
        Inertia.get(`/content-page/edit/${contentPage.id}`);
    };
    
    const handlePublish = () => {
        Inertia.put(`/content-page/${contentPage.id}/publish`, {}, {
            preserveState: false,
            preserveScroll: false,
            onSuccess: () => {
                console.log('Publish successful');
                // ContentPageコンポーネントに直接遷移
                Inertia.visit(`/content-page/${contentPage.id}`);
            },
            onError: (errors) => {
                console.error('Publish failed', errors);
            }
        });
    };
    
    const formatDescription = (description) => {
        if (!description) return null;
        return description.split('\n').map((line, index) => (
            <React.Fragment key={index}>
                {line}
                <br />
            </React.Fragment>
        ));
    };
    
    return (
        <div className="content-page-preview">
            <header className="flex justify-between items-center p-4 bg-blue-500 text-white">
                <h1 className="text-2xl font-bold">Gamebook</h1>
                <div>
                    <button onClick={handleEdit} className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded mr-2">
                        編集
                    </button>
                    <button onClick={handlePublish} className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
                        公開する
                    </button>
                </div>
            </header>
            <main className="p-4">
                <h2 className="text-3xl font-bold mb-4">{contentPage.title}</h2>
                <div className="flex mb-6">
                    <div className="w-4/5 pr-4">
                        {contentPage.cover_image ? (
                            <img 
                                src={contentPage.cover_image}
                                alt="カバー画像" 
                                className="max-w-full max-h-64" 
                            />
                        ) : (
                            <p>カバー画像がありません</p>
                        )}
                    </div>
                    <div className="w-1/5 bg-gray-100 p-4 rounded">
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
                <div className="mb-6 p-4 border rounded shadow-md">
                    <h3 className="text-xl font-bold mb-2">説明</h3>
                    <p>{formatDescription(contentPage.description)}</p>
                </div>
                <div className="p-4 border rounded shadow-md">
                    <h3 className="text-xl font-bold mb-2">タグ</h3>
                    <div className="flex flex-wrap">
                        {Array.isArray(contentPage.tags) && contentPage.tags.length > 0 ? (
                            contentPage.tags.map((tag, index) => (
                                <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded mr-2 mb-2">
                                    {typeof tag === 'string' ? tag : tag.name}
                                </span>
                            ))
                        ) : (
                            <p>タグがありません</p>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default ContentPagePreview;