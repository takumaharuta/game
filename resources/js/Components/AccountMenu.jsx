import React from 'react';
import { Link } from '@inertiajs/react';

const AccountMenu = ({ isVisible, onMouseEnter, onMouseLeave }) => {
    const menuItems = [
        { label: 'トップページ', href: '/' },
        { label: 'マイページ', href: '/dashboard' },
        { label: 'フォロー中のクリエイター', href: '/following' },
        { label: 'お気に入り作品', href: '/favorite-works' },
        { label: 'アカウント設定', href: '/account-settings' },
        { label: '作成画面', href: '/create' },
        { label: '通知設定', href: '/notification-settings' },
        { label: 'ログアウト', href: '/logout' },
        { label: 'お知らせ', href: '/announcements' },
        { label: 'よくある質問', href: '/faq' },
    ];

    if (!isVisible) return null;

    return (
        <div 
            className="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5"
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
        >
            <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
                {menuItems.map((item, index) => (
                    <Link
                        key={index}
                        href={item.href}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                        role="menuitem"
                    >
                        {item.label}
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default AccountMenu;