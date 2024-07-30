import React, { useState, useEffect } from 'react';
import { Link } from '@inertiajs/react';
import axios from 'axios';

const SearchMenu = ({ isVisible, onMouseEnter, onMouseLeave }) => {
    const [popularTags, setPopularTags] = useState([]);

    useEffect(() => {
        console.log('SearchMenu mounted');
        fetchPopularTags();
    }, []);
    
    const fetchPopularTags = async () => {
        console.log('Fetching popular tags');
        try {
            const response = await axios.get('/api/popular-tags');
            console.log('Popular tags response:', response.data);
            setPopularTags(response.data);
        } catch (error) {
            console.error('Failed to fetch popular tags:', error.response ? error.response.data : error.message);
        }
    };

    const formatCount = (count) => {
        return count >= 1000 ? `${(count / 1000).toFixed(1)}k` : count;
    };

    if (!isVisible) return null;

    return (
        <div
            className="absolute left-0 mt-2 w-64 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5"
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
        >
            <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
                <div className="px-4 py-2 text-sm text-gray-700 font-bold">カテゴリで探す</div>
                <Link href="/search?category=discount" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">割引中の作品</Link>
                <Link href="/search?category=high-rated" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">高評価の作品</Link>
                <Link href="/search?category=new-reviews" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">新着レビュー</Link>
                
                <div className="px-4 py-2 text-sm text-gray-700 font-bold mt-2">タグで探す</div>
                {popularTags.map((tag, index) => (
                    <Link 
                        key={index} 
                        href={`/search?tag=${encodeURIComponent(tag.name)}`} 
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                        #{tag.name} （{formatCount(tag.count)}件）
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default SearchMenu;