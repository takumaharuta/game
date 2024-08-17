import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Header from '../Components/Header';

const Mypage = () => {
  const [activeTab, setActiveTab] = useState('account-info');
  const [userInfo, setUserInfo] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editedInfo, setEditedInfo] = useState({
    name: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const navItems = [
    { id: 'account-info', label: 'アカウント情報' },
    { id: 'purchased-favorites', label: '購入済み/お気に入り' },
    { id: 'following-list', label: 'フォロー一覧' },
    { id: 'creator-dashboard', label: 'クリエイター画面' },
  ];

  useEffect(() => {
    if (activeTab === 'account-info') {
      fetchUserInfo();
    }
  }, [activeTab]);

  const fetchUserInfo = async () => {
    try {
      const response = await axios.get('/api/user-info');
      setUserInfo(response.data);
      setEditedInfo(prevState => ({
        ...prevState,
        name: response.data.name,
        email: response.data.email
      }));
    } catch (error) {
      console.error('Failed to fetch user info:', error);
      setError('ユーザー情報の取得に失敗しました。');
    }
  };

  const handleTabClick = (tabId) => {
    if (tabId !== activeTab) {
      setActiveTab(tabId);
    }
  };

  const handleEdit = () => {
    setEditMode(true);
    setError('');
    setSuccess('');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedInfo(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!editedInfo.currentPassword) {
      setError('現在のパスワードを入力してください。');
      return;
    }

    if (editedInfo.newPassword !== editedInfo.confirmNewPassword) {
      setError('新しいパスワードと確認用パスワードが一致しません。');
      return;
    }

    try {
      await axios.post('/api/update-user-info', editedInfo);
      setUserInfo({
        name: editedInfo.name,
        email: editedInfo.email
      });
      setEditMode(false);
      setEditedInfo(prevState => ({
        ...prevState,
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: ''
      }));
      setSuccess('ユーザー情報が正常に更新されました。');
    } catch (error) {
      console.error('Failed to update user info:', error);
      setError('更新に失敗しました。入力内容を確認してください。');
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="flex mb-8 overflow-hidden rounded-lg border border-gray-200">
          {navItems.map((item, index) => (
            <button
              key={index}
              onClick={() => handleTabClick(item.id)}
              disabled={activeTab === item.id}
              className={`flex-1 font-bold py-2 px-4 text-center ${
                activeTab === item.id
                  ? 'bg-blue-500 text-white cursor-default'
                  : 'bg-white text-blue-500 hover:bg-blue-50'
              } ${index > 0 ? 'border-l border-gray-200' : ''}`}
            >
              {item.label}
            </button>
          ))}
        </div>
        {activeTab === 'account-info' && userInfo && (
          <div className="bg-gray-100 p-4 rounded-lg">
            <h2 className="text-xl font-bold mb-4">アカウント情報</h2>
            {!editMode ? (
              <>
                <div className="mb-2"><strong>ユーザー名:</strong> {userInfo.name}</div>
                <div className="mb-2"><strong>メールアドレス:</strong> {userInfo.email}</div>
                <div className="mb-4"><strong>パスワード:</strong> ********</div>
                <button onClick={handleEdit} className="bg-blue-500 text-white px-4 py-2 rounded">
                  編集
                </button>
              </>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block mb-1">ユーザー名:</label>
                  <input
                    type="text"
                    name="name"
                    value={editedInfo.name}
                    onChange={handleChange}
                    className="w-full border rounded px-2 py-1"
                    required
                  />
                </div>
                <div>
                  <label className="block mb-1">メールアドレス:</label>
                  <input
                    type="email"
                    name="email"
                    value={editedInfo.email}
                    onChange={handleChange}
                    className="w-full border rounded px-2 py-1"
                    required
                  />
                </div>
                <div>
                  <label className="block mb-1">現在のパスワード:</label>
                  <input
                    type="password"
                    name="currentPassword"
                    value={editedInfo.currentPassword}
                    onChange={handleChange}
                    className="w-full border rounded px-2 py-1"
                    required
                  />
                </div>
                <div>
                  <label className="block mb-1">新しいパスワード (変更する場合のみ):</label>
                  <input
                    type="password"
                    name="newPassword"
                    value={editedInfo.newPassword}
                    onChange={handleChange}
                    className="w-full border rounded px-2 py-1"
                  />
                </div>
                <div>
                  <label className="block mb-1">新しいパスワード (確認):</label>
                  <input
                    type="password"
                    name="confirmNewPassword"
                    value={editedInfo.confirmNewPassword}
                    onChange={handleChange}
                    className="w-full border rounded px-2 py-1"
                  />
                </div>
                <div>
                  <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded mr-2">
                    保存
                  </button>
                  <button type="button" onClick={() => setEditMode(false)} className="bg-gray-300 text-black px-4 py-2 rounded">
                    キャンセル
                  </button>
                </div>
              </form>
            )}
            {error && <p className="text-red-500 mt-2">{error}</p>}
            {success && <p className="text-green-500 mt-2">{success}</p>}
          </div>
        )}
        {/* 他のタブのコンテンツをここに追加 */}
      </main>
    </div>
  );
};

export default Mypage;