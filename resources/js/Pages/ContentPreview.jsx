import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from '@inertiajs/inertia-react';
import axios from 'axios';
import { useSpring, animated } from 'react-spring';
import { useDrag } from '@use-gesture/react';

const ContentPreview = ({ content }) => {
  const [loadedContent, setLoadedContent] = useState(null);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [showChoices, setShowChoices] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    console.log('Initial content:', content);
    if (content && content.id) {
      console.log('Setting content from props');
      setLoadedContent(content);
      setLoading(false);
    } else {
      const contentId = new URLSearchParams(window.location.search).get('id');
      if (contentId) {
        console.log('Fetching content with ID:', contentId);
        axios.get(`/api/contents/${contentId}`)
          .then(response => {
            console.log('Fetched content:', response.data);
            setLoadedContent(response.data);
            setLoading(false);
          })
          .catch(error => {
            console.error('Error fetching content:', error);
            setError('コンテンツの読み込み中にエラーが発生しました。');
            setLoading(false);
          });
      } else {
        setError('コンテンツIDが見つかりません。');
        setLoading(false);
      }
    }
  }, [content]);

  const contentPages = useMemo(() => {
    return loadedContent && loadedContent.pages ? loadedContent.pages.slice(1) : [];
  }, [loadedContent]);

  const handleNextPage = useCallback(() => {
    const currentPage = contentPages[currentPageIndex];
    if (currentPage.choices && currentPage.choices.length > 0) {
      setShowChoices(true);
    } else {
      setCurrentPageIndex(prevIndex => 
        prevIndex < contentPages.length - 1 ? prevIndex + 1 : prevIndex
      );
    }
  }, [contentPages, currentPageIndex]);

  const handlePreviousPage = useCallback(() => {
    setCurrentPageIndex(prevIndex => prevIndex > 0 ? prevIndex - 1 : prevIndex);
  }, []);

  const handleChoiceSelection = useCallback((nextPageId) => {
    const nextPageIndex = contentPages.findIndex(page => page.id === nextPageId);
    if (nextPageIndex !== -1) {
      setCurrentPageIndex(nextPageIndex);
      setShowChoices(false);
    }
  }, [contentPages]);

  const [{ x }, api] = useSpring(() => ({ x: 0 }));

  const bind = useDrag(({ active, movement: [mx], direction: [xDir], cancel }) => {
    if (isMobile && active && Math.abs(mx) > 50) {
      if (xDir > 0) {
        handlePreviousPage();
      } else {
        handleNextPage();
      }
      cancel();
    }
    api.start({ x: active ? mx : 0, immediate: active });
  }, { axis: 'x' });

  const handleKeyDown = useCallback((event) => {
    if (event.key === 'ArrowRight') {
      handleNextPage();
    } else if (event.key === 'ArrowLeft') {
      handlePreviousPage();
    }
  }, [handleNextPage, handlePreviousPage]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const handleClick = useCallback((event) => {
    if (!isMobile) {
      const clickX = event.clientX;
      const windowWidth = window.innerWidth;
      if (clickX < windowWidth / 2) {
        handlePreviousPage();
      } else {
        handleNextPage();
      }
    }
  }, [isMobile, handlePreviousPage, handleNextPage]);

  if (loading) {
    return <div>Loading...</div>;
  }
  if (error) {
    return <div>Error: {error}</div>;
  }
  if (!contentPages || contentPages.length === 0) {
    return <div>No content available</div>;
  }

  const currentPage = contentPages[currentPageIndex];

  const getImageSrc = (imagePath) => {
    if (!imagePath) return null;
    return imagePath;
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header className="flex justify-between items-center p-4 bg-blue-500 text-white">
        <Link href="/" className="text-2xl font-bold">GameBook</Link>
        <div>
          {/* ここに必要に応じて追加のヘッダー要素を配置できます */}
        </div>
      </header>

      <div style={{ flex: 1, padding: '20px' }} className="content-preview" onClick={handleClick}>
        <h1>{loadedContent.title}</h1>
        <animated.div 
          {...(isMobile ? bind() : {})} 
          style={{ x, touchAction: isMobile ? 'none' : 'auto' }} 
          className="page"
        >
          <h2>{currentPage.title}</h2>
          {currentPage.cover_image && (
            <img 
              src={getImageSrc(currentPage.cover_image)}
              alt={currentPage.title} 
              className="max-w-full max-h-64" 
            />
          )}
          <p>{currentPage.content}</p>
        </animated.div>
        {showChoices ? (
          <div className="choices">
            <h3>選択してください：</h3>
            {currentPage.choices.map((choice) => (
              <button
                key={choice.id}
                onClick={() => handleChoiceSelection(choice.next_page_id)}
                className="choice-button"
              >
                {choice.text}
              </button>
            ))}
          </div>
        ) : (
          <div className="navigation">
            <button 
              onClick={handlePreviousPage} 
              disabled={currentPageIndex === 0}
              className="nav-button"
            >
              前のページ
            </button>
            <span>{currentPageIndex + 1} / {contentPages.length}</span>
            <button 
              onClick={handleNextPage} 
              disabled={currentPageIndex === contentPages.length - 1}
              className="nav-button"
            >
              次のページ
            </button>
          </div>
        )}
        <Link href={`/content/edit/${loadedContent.id}`} className="edit-link">
          編集に戻る
        </Link>
      </div>
    </div>
  );
};

export default ContentPreview;