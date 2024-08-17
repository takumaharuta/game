import React from 'react';
import { Link, usePage } from '@inertiajs/react';
import { FaSearch, FaUser, FaStar } from 'react-icons/fa';
import Header from '../Components/Header'; 

const calculateDisplayPrice = (price, discountPercentage) => {
    return Math.round(price * (100 - discountPercentage) / 100);
};

const formatPrice = (price) => {
    return new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY' }).format(price);
};

const renderStars = (rating) => {
    return (
        <>
            {[1, 2, 3, 4, 5].map((star) => (
                <FaStar
                    key={star}
                    className={star <= rating ? "text-yellow-400" : "text-gray-300"}
                />
            ))}
        </>
    );
};

const ContentCard = ({ content }) => (
  <div className="flex-shrink-0 w-48 mr-4">
    <img src={content.cover_image} alt={content.title} className="w-full h-64 object-cover mb-2" />
    <div className="flex items-center justify-between mb-1">
      <div className="flex items-baseline">
        {content.discount_percentage > 0 && (
          <span className="text-sm text-gray-500 line-through mr-1">
            {formatPrice(content.display_price)}
          </span>
        )}
        <span className="font-bold text-black">
          {formatPrice(calculateDisplayPrice(content.display_price, content.discount_percentage))}
        </span>
      </div>
      {content.discount_percentage > 0 && (
        <div className="bg-red-500 text-white text-xs px-1 py-0.5 rounded">
          {content.discount_percentage}% OFF
        </div>
      )}
    </div>
    <div className="text-sm font-medium truncate">{content.title}</div>
    <div className="text-sm text-gray-600">{content.author_name}</div>
    <div className="flex items-center text-sm">
      {renderStars(content.average_rating)}
      <span className="ml-1">
        {content.average_rating.toFixed(1)}
        <span className="text-gray-500 ml-1">
          ({content.rating_count}件)
        </span>
      </span>
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
      <Header />
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