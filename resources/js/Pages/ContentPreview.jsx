import React, { useState, useEffect } from 'react';
import { Link } from '@inertiajs/inertia-react';
import axios from 'axios';

const ContentPreview = ({ content }) => {
  const [loadedContent, setLoadedContent] = useState(null);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);

  useEffect(() => {
    if (content && content.id) {
      setLoadedContent(content);
    } else {
      const contentId = new URLSearchParams(window.location.search).get('id');
      if (contentId) {
        axios.get(`/api/contents/${contentId}`)
          .then(response => {
            setLoadedContent(response.data);
          })
          .catch(error => console.error('Error fetching content:', error));
      }
    }
  }, [content]);

  const handleNextPage = () => {
    if (currentPageIndex < loadedContent.pages.length - 1) {
      setCurrentPageIndex(currentPageIndex + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPageIndex > 0) {
      setCurrentPageIndex(currentPageIndex - 1);
    }
  };

  if (!loadedContent || loadedContent.pages.length === 0) {
    return <div>Loading...</div>;
  }

  const currentPage = loadedContent.pages[currentPageIndex];

  const getImageSrc = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('data:')) return imagePath;
    if (imagePath.startsWith('http')) return imagePath;
    return `/storage/${imagePath}`;
  };

  return (
    <div className="content-preview">
      <h1>{loadedContent.title}</h1>
      <div className="page">
        <h2>{currentPage.title}</h2>
        {currentPage.image && (
          <img 
            src={getImageSrc(currentPage.image)}
            alt={currentPage.title} 
            className="max-w-full max-h-64" 
          />
        )}
        <p>{currentPage.content}</p>
      </div>
      <div className="navigation">
        <button 
          onClick={handlePreviousPage} 
          disabled={currentPageIndex === 0}
          className="nav-button"
        >
          前のページ
        </button>
        <span>{currentPageIndex + 1} / {loadedContent.pages.length}</span>
        <button 
          onClick={handleNextPage} 
          disabled={currentPageIndex === loadedContent.pages.length - 1}
          className="nav-button"
        >
          次のページ
        </button>
      </div>
      <Link href={`/content/edit/${loadedContent.id}`} className="edit-link">
        編集に戻る
      </Link>
    </div>
  );
};

export default ContentPreview;