import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ContentPreview = ({ contentId }) => {
    const [content, setContent] = useState(null);
    const [currentPage, setCurrentPage] = useState(0);

    useEffect(() => {
        const fetchContent = async () => {
            const response = await axios.get(`/api/contents/${contentId}`);
            setContent(response.data);
        };
        fetchContent();
    }, [contentId]);

    if (!content) return <div>Loading...</div>;

    return (
        <div className={content.scroll_type === 'vertical' ? 'vertical-scroll' : 'horizontal-scroll'}>
            <header className="preview-header">
                <div className="logo">GameBook</div>
                <select onChange={(e) => setCurrentPage(Number(e.target.value))}>
                    {content.pages.map((page, index) => (
                        <option key={index} value={index}>Page {index + 1}</option>
                    ))}
                </select>
            </header>
            <div className="page">
                <img src={content.pages[currentPage].image_path} alt="Page content" />
                {content.pages[currentPage].choices.map((choice, index) => (
                    <button key={index} onClick={() => setCurrentPage(choice.next_page_id)}>
                        {choice.text}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default ContentPreview;