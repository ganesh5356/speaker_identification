import React, { useState } from 'react';

const DownloadReport = ({ resultData, onDownload }) => {
  const [downloading, setDownloading] = useState(false);

  const handleDownload = () => {
    setDownloading(true);
    if (onDownload) {
      onDownload(resultData);
    } else {
      // Clean fallback interaction
      setTimeout(() => {
        window.print();
        setDownloading(false);
      }, 500);
      return;
    }
    setTimeout(() => setDownloading(false), 1200);
  };

  return (
    <div className="download-report-container">
      <button
        className={`download-pdf-btn ${downloading ? 'is-loading' : ''}`}
        onClick={handleDownload}
        disabled={downloading}
      >
        <svg className="pdf-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="12" y1="18" x2="12" y2="12" />
          <polyline points="9 15 12 18 15 15" />
        </svg>
        <span>{downloading ? 'GENERATING REPORT...' : 'DOWNLOAD PDF'}</span>
      </button>
    </div>
  );
};

export default DownloadReport;
