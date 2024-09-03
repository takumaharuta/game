import React, { useState, useEffect } from 'react';
import { Link, useForm } from '@inertiajs/react';

const CreatorDashboard = ({ creatorInfo, works }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  
  const { data, setData, post, processing, errors } = useForm({
    pen_name: creatorInfo?.name || '',
    bio: creatorInfo?.profile || '',
    profile_image: null
  });

  useEffect(() => {
    if (creatorInfo?.icon) {
      setPreviewImage(creatorInfo.icon);
    }
  }, [creatorInfo]);

  const handleSubmit = (e) => {
    e.preventDefault();
    post(creatorInfo ? '/creator/update' : '/creator/register', {
      preserveState: true,
      preserveScroll: true,
      onSuccess: () => {
        setIsEditing(false);
        setIsRegistering(false);
      },
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setData('profile_image', reader.result);
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const renderImageModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-4 rounded-lg" style={{ maxWidth: '90%', maxHeight: '90%' }}>
        <img 
          src={previewImage || creatorInfo?.icon || '/default-profile.png'} 
          alt="Profile Preview" 
          className="max-w-full max-h-[70vh] object-contain mb-4"
        />
        <div className="flex justify-center">
          <button 
            onClick={() => setShowImageModal(false)}
            className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded transition duration-300 ease-in-out"
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  );

  const renderCreatorInfo = () => (
    <div className="bg-white shadow-lg rounded-lg p-6 mb-6">
      <div className="flex flex-col md:flex-row items-center md:space-x-6">
        <div className="relative group cursor-pointer mb-4 md:mb-0" onClick={() => setShowImageModal(true)}>
          <img 
            src={creatorInfo.icon || '/default-profile.png'} 
            alt="Creator Icon" 
            className="w-40 h-40 rounded-full object-cover border-4 border-blue-500 transition duration-300 ease-in-out group-hover:opacity-75" 
          />
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-300 ease-in-out">
            <span className="text-white bg-black bg-opacity-50 px-2 py-1 rounded">拡大</span>
          </div>
        </div>
        <div>
          <h3 className="text-2xl font-bold text-gray-800">{creatorInfo.name}</h3>
          <p className="text-gray-600 mt-2">{creatorInfo.profile}</p>
        </div>
      </div>
      <button 
        onClick={() => setIsEditing(true)} 
        className="mt-4 bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded transition duration-300 ease-in-out transform hover:scale-105"
      >
        プロフィールを編集
      </button>
    </div>
  );

  const renderEditForm = () => (
    <form onSubmit={handleSubmit} className="bg-white shadow-lg rounded-lg p-6 space-y-4">
      <div>
        <label htmlFor="pen_name" className="block text-sm font-medium text-gray-700 mb-1">ペンネーム:</label>
        <input
          type="text"
          id="pen_name"
          value={data.pen_name}
          onChange={e => setData('pen_name', e.target.value)}
          className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
        {errors.pen_name && <div className="text-red-500 text-sm mt-1">{errors.pen_name}</div>}
      </div>
      <div>
        <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">自己紹介:</label>
        <textarea
          id="bio"
          value={data.bio}
          onChange={e => setData('bio', e.target.value)}
          className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows="4"
          required
        />
        {errors.bio && <div className="text-red-500 text-sm mt-1">{errors.bio}</div>}
      </div>
      <div>
        <label htmlFor="profile_image" className="block text-sm font-medium text-gray-700 mb-1">プロフィール画像:</label>
        <input
          type="file"
          id="profile_image"
          onChange={handleFileChange}
          className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {errors.profile_image && <div className="text-red-500 text-sm mt-1">{errors.profile_image}</div>}
        {previewImage && (
          <div className="mt-2">
            <img 
              src={previewImage} 
              alt="Preview" 
              className="w-32 h-32 object-cover rounded-full cursor-pointer"
              onClick={() => setShowImageModal(true)}
            />
          </div>
        )}
      </div>
      <div className="flex justify-end space-x-2">
        <button 
          type="submit" 
          disabled={processing} 
          className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded transition duration-300 ease-in-out transform hover:scale-105"
        >
          {creatorInfo ? '更新' : '登録'}
        </button>
        <button 
          type="button" 
          onClick={() => {
            setIsEditing(false);
            setPreviewImage(creatorInfo?.icon || null);
          }} 
          className="bg-gray-300 hover:bg-gray-400 text-black font-bold py-2 px-4 rounded transition duration-300 ease-in-out"
        >
          キャンセル
        </button>
      </div>
    </form>
  );

  const renderWorks = () => (
    <div className="mt-8">
      <h4 className="text-2xl font-bold text-gray-800 mb-4">作品一覧</h4>
      {works.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {works.map((work) => (
            <div key={work.id} className="bg-white shadow-lg rounded-lg overflow-hidden transition duration-300 ease-in-out transform hover:scale-105">
              <img src={work.cover_image} alt={work.title} className="w-full h-48 object-cover" />
              <div className="p-4">
                <h5 className="font-bold text-lg mb-2">{work.title}</h5>
                <Link 
                  href={`/content-page/${work.id}`} 
                  className="text-blue-500 hover:text-blue-600 transition duration-300 ease-in-out"
                >
                  詳細を見る
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-600">作品がありません。新しい作品を制作しましょう！</p>
      )}
      <div className="mt-6">
        <Link 
          href="/content-page/edit" 
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg transition duration-300 ease-in-out transform hover:scale-105 inline-block"
        >
          新しい作品を制作する
        </Link>
      </div>
    </div>
  );

  return (
    <div className="bg-gray-100 p-6 rounded-lg">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">クリエイターダッシュボード</h2>
      {creatorInfo ? (
        <>
          {isEditing ? renderEditForm() : renderCreatorInfo()}
          {renderWorks()}
        </>
      ) : isRegistering ? (
        renderEditForm()
      ) : (
        <div className="bg-white shadow-lg rounded-lg p-6 text-center">
          <p className="text-xl text-gray-600 mb-4">クリエイター情報が登録されていません。</p>
          <button 
            onClick={() => setIsRegistering(true)} 
            className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg transition duration-300 ease-in-out transform hover:scale-105"
          >
            クリエイター登録
          </button>
        </div>
      )}
      {showImageModal && renderImageModal()}
    </div>
  );
};

export default CreatorDashboard;