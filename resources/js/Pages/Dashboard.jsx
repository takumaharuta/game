import React from 'react';
import { Link } from '@inertiajs/inertia-react';
import Header from '../Components/Header';

const Dashboard = () => {
  const navItems = [
    { href: '/account-info', label: 'アカウント情報' },
    { href: '/purchased-favorites', label: '購入済み/お気に入り' },
    { href: '/following-list', label: 'フォロー一覧' },
    { href: '/creator-dashboard', label: 'クリエイター画面' },
  ];

  const isActive = (path) => window.location.pathname.startsWith(path);

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="flex mb-8 overflow-hidden rounded-lg border border-gray-200">
          {navItems.map((item, index) => (
            <Link
              key={index}
              href={item.href}
              className={`flex-1 font-bold py-2 px-4 text-center ${
                isActive(item.href)
                  ? 'bg-blue-500 text-white'
                  : 'bg-white text-blue-500 hover:bg-blue-50'
              } ${index > 0 ? 'border-l border-gray-200' : ''}`}
            >
              {item.label}
            </Link>
          ))}
        </div>
        {/* 既存のダッシュボードコンテンツがあればここに配置 */}
      </main>
    </div>
  );
};

export default Dashboard;