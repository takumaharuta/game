import React from 'react';
import { Link } from '@inertiajs/inertia-react';
import Header from '../Components/Header';

const PurchasedWorks = ({ purchasedWorks }) => {
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
                                    className="inline-block bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                                >
                                    作品を見る
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
};

export default PurchasedWorks;