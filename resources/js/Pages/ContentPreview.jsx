import React, { useState, useEffect } from 'react';
import { usePage } from '@inertiajs/inertia-react';
import { Inertia } from '@inertiajs/inertia';
import { motion, AnimatePresence } from 'framer-motion';
import styled from 'styled-components';

const PreviewContainer = styled.div`
  width: 100vw;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f0f0f0;
`;

const Page = styled(motion.div)`
  width: 80%;
  height: 80%;
  background-color: white;
  border-radius: 10px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  padding: 20px;
  position: absolute;
`;

const ChoiceButton = styled.button`
  margin: 10px;
  padding: 10px 20px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
`;

const Preview = () => {
  const { content } = usePage().props;
  const [currentPage, setCurrentPage] = useState(0);
  const [direction, setDirection] = useState(1);

  const goToNextPage = (choiceIndex = 0) => {
    if (currentPage < content.pages.length - 1) {
      setDirection(1);
      setCurrentPage(current => {
        const nextPage = content.pages[current].choices[choiceIndex]?.next_page || current + 1;
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

  if (!content) return <div>Loading...</div>;

  return (
    <PreviewContainer>
      <AnimatePresence initial={false} custom={direction}>
        <Page
          key={currentPage}
          custom={direction}
          initial={{ opacity: 0, x: 300 * direction }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -300 * direction }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        >
          <h2>{content.pages[currentPage].title}</h2>
          <p>{content.pages[currentPage].content}</p>
          {content.pages[currentPage].image && (
            <img src={content.pages[currentPage].image} alt="Page illustration" style={{ maxWidth: '100%', height: 'auto' }} />
          )}
          {content.pages[currentPage].choices && content.pages[currentPage].choices.length > 0 ? (
            content.pages[currentPage].choices.map((choice, index) => (
              <ChoiceButton key={index} onClick={() => goToNextPage(index)}>
                {choice.text}
              </ChoiceButton>
            ))
          ) : (
            <div>
              <ChoiceButton onClick={goToPrevPage} disabled={currentPage === 0}>前のページ</ChoiceButton>
              <ChoiceButton onClick={() => goToNextPage()} disabled={currentPage === content.pages.length - 1}>次のページ</ChoiceButton>
            </div>
          )}
        </Page>
      </AnimatePresence>
    </PreviewContainer>
  );
};

export default ContentPreview;