import React, { useState, useRef, useEffect } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { FaSearch, FaUser, FaStar } from 'react-icons/fa';
import AccountMenu from '../Components/AccountMenu';

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

const FavoriteWorksPage = () => {
    const { favoriteWorks } = usePage().props;
    const [isMenuVisible, setIsMenuVisible] = useState(false);
    const menuRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsMenuVisible(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [menuRef]);

    const showMenu = () => setIsMenuVisible(true);
    const hideMenu = () => setIsMenuVisible(false);

    return (
        <div className="favorite-works-page">
            <header className="flex justify-between items-center p-4 bg-blue-500 text-white">
                <Link href="/" className="text-2xl font-bold">
                    Gamebook
                </Link>
                <div className="flex items-center">
                    <div className="relative mr-4">
                        <input type="text" placeholder="検索" className="p-2 pr-10 rounded text-black" />
                        <FaSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    </div>
                    <div 
                        ref={menuRef}
                        className="relative"
                    >
                        <button 
                            className="bg-gray-200 text-black font-bold py-2 px-4 rounded flex items-center"
                            onMouseEnter={showMenu}
                        >
                            <FaUser className="mr-2" />
                            アカウント
                        </button>
                        <AccountMenu 
                            isVisible={isMenuVisible} 
                            onMouseEnter={showMenu}
                            onMouseLeave={hideMenu}
                        />
                    </div>
                </div>
            </header>
            <main className="p-4">
                <h1 className="text-3xl font-bold mb-6">お気に入り作品一覧</h1>
                <div className="flex flex-wrap">
                    {favoriteWorks.map((work, index) => (
                        <FavoriteWorkCard key={index} work={work} />
                    ))}
                </div>
            </main>
        </div>
    );
};

export default FavoriteWorksPage;