import React from 'react';
import { Link, usePage } from '@inertiajs/react';
import { FaSearch, FaUser } from 'react-icons/fa';

const ContentCard = ({ content }) => (
  <div className="flex-shrink-0 w-48 mr-4">
    <img src={content.cover_image} alt={content.title} className="w-full h-64 object-cover mb-2" />
    {content.discount_percentage > 0 && (
      <div className="bg-red-500 text-white inline-block px-2 py-1 rounded mb-1">
        {content.discount_percentage}% OFF
      </div>
    )}
    <div className="font-bold">¥{content.display_price}</div>
    <div className="text-sm truncate">{content.title}</div>
    <div className="text-sm text-gray-600">{content.author_name}</div>
    <div className="text-sm">
      {'★'.repeat(Math.round(content.average_rating))}{'☆'.repeat(5 - Math.round(content.average_rating))}
    </div>
  </div>
);

const ContentSection = ({ title, contents }) => (
  <div className="mb-8">
    <h2 className="text-2xl font-bold mb-4">{title}</h2>
    <div className="flex overflow-x-auto pb-4">
      {contents.map((content, index) => (
        <Link key={index} href={`/content-page/${content.id}`}>
          <ContentCard content={content} />
        </Link>
      ))}
    </div>
  </div>
);

const TopPage = ({ recommendedContents, rankingContents, latestContents }) => {
  const { auth } = usePage().props;

  return (
    <div className="top-page">
      <header className="flex justify-between items-center p-4 bg-blue-500 text-white">
        <h1 className="text-2xl font-bold">GameBook</h1>
        <div className="flex items-center">
          <div className="relative mr-4">
            <input
              type="text"
              placeholder="検索"
              className="p-2 pr-10 rounded text-black"
            />
            <FaSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
          {auth && auth.user ? (
            <Link href="/dashboard" className="bg-gray-200 text-black font-bold py-2 px-4 rounded flex items-center">
              <FaUser className="mr-2" />
              マイページ
            </Link>
          ) : (
            <Link href="/login" className="bg-gray-200 text-black font-bold py-2 px-4 rounded flex items-center">
              <FaUser className="mr-2" />
              アカウント
            </Link>
          )}
        </div>
      </header>

      <main className="p-4">
        <div className="text-center my-12">
          <h1 className="text-6xl font-bold text-blue-600">GameBook</h1>
          <p className="text-xl mt-4">ゲームブックの新しい世界へようこそ</p>
        </div>

        <ContentSection title="あなたにおすすめ" contents={recommendedContents} />
        <ContentSection title="ランキング" contents={rankingContents} />
        <ContentSection title="最新作" contents={latestContents} />
      </main>
    </div>
  );
};

export default TopPage;