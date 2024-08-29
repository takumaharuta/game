import React, { useState, useEffect, useRef } from 'react';
import { Link } from '@inertiajs/inertia-react';
import axios from 'axios';

const Header = () => {
    const [showAccountMenu, setShowAccountMenu] = useState(false);
    const [showSearchMenu, setShowSearchMenu] = useState(false);
    const [topTags, setTopTags] = useState([]);
    const accountMenuRef = useRef(null);
    const searchMenuRef = useRef(null);

    useEffect(() => {
        fetchTopTags();

        const handleClickOutside = (event) => {
            if (accountMenuRef.current && !accountMenuRef.current.contains(event.target)) {
                setShowAccountMenu(false);
            }
            if (searchMenuRef.current && !searchMenuRef.current.contains(event.target)) {
                setShowSearchMenu(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const fetchTopTags = async () => {
        try {
            const response = await axios.get('/top-tags');
            setTopTags(response.data.slice(0, 5));
        } catch (error) {
            console.error('Error fetching top tags:', error);
        }
    };

    return (
        <header className="flex justify-between items-center p-4 bg-blue-500 text-white">
            <Link href="/" className="text-2xl font-bold">GameBook</Link>
            <div className="flex items-center">
                <div 
                    className="relative mr-4" 
                    onMouseEnter={() => setShowSearchMenu(true)}
                    onMouseLeave={() => setShowSearchMenu(false)}
                    ref={searchMenuRef}
                >
                    <input 
                        type="text" 
                        placeholder="検索" 
                        className="p-2 pr-10 rounded text-black"
                    />
                    {showSearchMenu && (
                        <>
                            <div className="absolute left-0 w-full h-2 bg-transparent" />
                            <div className="absolute top-full left-0 w-64 bg-white text-black shadow-lg rounded mt-2 p-2">
                                <h3 className="font-bold mb-2">カテゴリで探す</h3>
                                <ul>
                                    <li><Link href="/search?category=discount" className="block py-1 hover:bg-gray-100">割引中の作品</Link></li>
                                    <li><Link href="/search?category=top-rated" className="block py-1 hover:bg-gray-100">高評価の作品</Link></li>
                                    <li><Link href="/search?category=new-reviews" className="block py-1 hover:bg-gray-100">新着レビュー</Link></li>
                                </ul>
                                <h3 className="font-bold mt-4 mb-2">タグで探す</h3>
                                <ul>
                                    {topTags.map(tag => (
                                        <li key={tag.id}>
                                            <Link href={`/search?tag=${tag.name}`} className="block py-1 hover:bg-gray-100">
                                                #{tag.name} ({tag.count}件)
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </>
                    )}
                </div>
                <div 
                    className="relative" 
                    onMouseEnter={() => setShowAccountMenu(true)}
                    onMouseLeave={() => setShowAccountMenu(false)}
                    ref={accountMenuRef}
                >
                    <button className="bg-gray-200 text-black font-bold py-2 px-4 rounded flex items-center">
                        アカウント
                    </button>
                    {showAccountMenu && (
                        <>
                            <div className="absolute left-0 w-full h-2 bg-transparent" />
                            <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-md overflow-hidden shadow-xl z-10">
                                <Link href="/mypage" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">マイページ</Link>
                                <Link href="/announcements" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">お知らせ</Link>
                                <Link href="/faq" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">よくある質問</Link>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;