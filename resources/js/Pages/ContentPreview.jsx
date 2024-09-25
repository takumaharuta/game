import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ContentPreview = ({ content }) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [direction, setDirection] = useState(1);

  console.log('Content in ContentPreview:', content); // デバッグ用

  if (!content || !content.pages || content.pages.length === 0) {
    return <div>No content available</div>;
  }

  const goToNextPage = (choiceIndex = 0) => {
    if (currentPage < content.pages.length - 1) {
      setDirection(1);
      setCurrentPage(current => {
        const nextPage = content.pages[current].choices[choiceIndex]?.next_page ?? current + 1;
        return Math.min(nextPage, content.pages.length - 1);
      });
    }
  };

  const goToPrevPage = () => {
    if (currentPage > 0) {
      setDirection(-1);
      setCurrentPage(current => current - 1);
    }
  };

  const currentPageData = content.pages[currentPage];

  return (
    <div className="preview-container">
      <AnimatePresence initial={false} custom={direction}>
        <motion.div
          key={currentPage}
          custom={direction}
          initial={{ opacity: 0, x: 300 * direction }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -300 * direction }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="page"
        >
          <p>{currentPageData.content}</p>
          {currentPageData.image && (
            <img src={currentPageData.image} alt="Page illustration" style={{ maxWidth: '100%', height: 'auto' }} />
          )}
          {currentPageData.choices && currentPageData.choices.length > 0 ? (
            currentPageData.choices.map((choice, index) => (
              <button key={index} onClick={() => goToNextPage(index)} className="choice-button">
                {choice.text}
              </button>
            ))
          ) : (
            <div>
              <button onClick={goToPrevPage} disabled={currentPage === 0} className="choice-button">前のページ</button>
              <button onClick={() => goToNextPage()} disabled={currentPage === content.pages.length - 1} className="choice-button">次のページ</button>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default ContentPreview;