import React from 'react';
import { Link } from '@inertiajs/react';

const CreatorDashboard = ({ creatorInfo, works }) => {
  return (
    <div className="bg-gray-100 p-4 rounded-lg">
      <h2 className="text-xl font-bold mb-4">クリエイター画面</h2>
      {creatorInfo ? (
        <>
          <div className="mb-4">
            <img src={creatorInfo.icon} alt="Creator Icon" className="w-20 h-20 rounded-full mb-2" />
            <h3 className="text-lg font-semibold">{creatorInfo.name}</h3>
            <p>{creatorInfo.profile}</p>
          </div>
          <h4 className="text-lg font-semibold mb-2">作品一覧</h4>
          {works.length > 0 ? (
            <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {works.map((work) => (
                <li key={work.id} className="border p-2 rounded">
                  <img src={work.cover_image} alt={work.title} className="w-full h-40 object-cover mb-2" />
                  <h5 className="font-semibold">{work.title}</h5>
                </li>
              ))}
            </ul>
          ) : (
            <p>作品がありません。</p>
          )}
        </>
      ) : (
        <p>クリエイター情報が登録されていません。</p>
      )}
      <div className="mt-4">
        <Link href="/content-page/create" className="bg-blue-500 text-white px-4 py-2 rounded">
          作品を制作する
        </Link>
      </div>
    </div>
  );
};

export default CreatorDashboard;