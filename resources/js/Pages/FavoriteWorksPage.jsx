import React, { useState, useRef, useEffect } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { FaSearch, FaUser, FaStar } from 'react-icons/fa';
import AccountMenu from '../Components/AccountMenu';
import SearchMenu from '../Components/SearchMenu';

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
    const [isAccountMenuVisible, setIsAccountMenuVisible] = useState(false);
    const [isSearchMenuVisible, setIsSearchMenuVisible] = useState(false);
    const accountMenuRef = useRef(null);
    const searchMenuRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (accountMenuRef.current && !accountMenuRef.current.contains(event.target)) {
                setIsAccountMenuVisible(false);
            }
            if (searchMenuRef.current && !searchMenuRef.current.contains(event.target)) {
                setIsSearchMenuVisible(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [accountMenuRef, searchMenuRef]);

    const showAccountMenu = () => setIsAccountMenuVisible(true);
    const hideAccountMenu = () => setIsAccountMenuVisible(false);
    const showSearchMenu = () => setIsSearchMenuVisible(true);
    const hideSearchMenu = () => setIsSearchMenuVisible(false);

    return (
        <div className="favorite-works-page">
            <header className="flex justify-between items-center p-4 bg-blue-500 text-white">
                <Link href="/" className="text-2xl font-bold">
                    Gamebook
                </Link>
                <div className="flex items-center">
                    <div 
                        ref={searchMenuRef}
                        className="relative mr-4"
                    >
                        <input
                            type="text"
                            placeholder="検索"
                            className="p-2 pr-10 rounded text-black"
                            onMouseEnter={showSearchMenu}
                        />
                        <FaSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <SearchMenu 
                            isVisible={isSearchMenuVisible} 
                            onMouseEnter={showSearchMenu}
                            onMouseLeave={hideSearchMenu}
                        />
                    </div>
                    <div 
                        ref={accountMenuRef}
                        className="relative"
                    >
                        <button 
                            className="bg-gray-200 text-black font-bold py-2 px-4 rounded flex items-center"
                            onMouseEnter={showAccountMenu}
                        >
                            <FaUser className="mr-2" />
                            アカウント
                        </button>
                        <AccountMenu 
                            isVisible={isAccountMenuVisible} 
                            onMouseEnter={showAccountMenu}
                            onMouseLeave={hideAccountMenu}
                        />
                    </div>
                </div>
            </header>
            <main className="p-4">
                <h1 className="text-3xl font-bold mb-6">お気に入り作品一覧</h1>
                {favoriteWorks.length > 0 ? (
                    <div className="flex flex-wrap">
                        {favoriteWorks.map((work, index) => (
                            <FavoriteWorkCard key={index} work={work} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8">
                        <p className="text-xl text-gray-600">お気に入りに登録している作品はありません</p>
                        <Link href="/" className="mt-4 inline-block bg-blue-500 text-white font-bold py-2 px-4 rounded hover:bg-blue-600">
                            作品を探す
                        </Link>
                    </div>
                )}
            </main>
        </div>
    );
};

export default FavoriteWorksPage;