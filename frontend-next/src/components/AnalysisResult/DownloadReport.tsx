"use client";

import React, { useState } from "react";
import { FileText, Loader2 } from "lucide-react";
import type { ResultData } from "@/lib/data";

interface DownloadReportProps {
  resultData?: ResultData;
  onOpenReport?: (data: ResultData) => void;
}

export function DownloadReport({ resultData, onOpenReport }: DownloadReportProps) {
  const [downloading, setDownloading] = useState(false);

  const handleDownload = () => {
    if (onOpenReport && resultData) {
      onOpenReport(resultData);
      return;
    }
    setDownloading(true);
    setTimeout(() => {
      window.print();
      setDownloading(false);
    }, 400);
  };

  return (
    <button
      onClick={handleDownload}
      disabled={downloading}
      className="btn btn-primary flex items-center gap-2 py-2 px-4 shadow-sm"
    >
      {downloading ? (
        <Loader2 size={13} className="animate-spin" />
      ) : (
        <FileText size={13} />
      )}
      <span>{downloading ? "GENERATING..." : "DOWNLOAD PDF REPORT"}</span>
    </button>
  );
}
