import React from 'react';
import { Link } from '@inertiajs/react';
import { FaStar } from 'react-icons/fa';

const FavoriteWorkCard = ({ work }) => (
    <div className="flex-shrink-0 w-48 mr-4 mb-4">
        <Link href={`/content-page/${work.id}`}>
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
        </Link>
    </div>
);

const FavoriteWorks = ({ favoriteWorks }) => {
    return (
        <div className="favorite-works">
            <h2 className="text-2xl font-bold mb-4">お気に入り作品一覧</h2>
            <div className="flex flex-wrap">
                {favoriteWorks.map((work, index) => (
                    <FavoriteWorkCard key={index} work={work} />
                ))}
            </div>
        </div>
    );
};

export default FavoriteWorks;