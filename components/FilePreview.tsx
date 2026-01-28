import React from 'react';
import { openFileInNewTab } from '../services/fileService';

interface FilePreviewProps {
    fileUrl: string;
    altText: string;
    onView?: () => void;
}

export const FilePreview: React.FC<FilePreviewProps> = ({ fileUrl, altText, onView }) => {
    const isPdf = fileUrl.startsWith('data:application/pdf') || fileUrl.toLowerCase().includes('.pdf');
    const isImage = fileUrl.startsWith('data:image/') || /\.(jpg|jpeg|png|webp|gif|svg)$/i.test(fileUrl);

    const handleView = () => {
        if (onView) onView();
        else openFileInNewTab(fileUrl);
    };

    if (isPdf) {
        return (
            <div
                onClick={handleView}
                className="h-full w-full bg-rose-50 border border-rose-100 rounded-xl flex flex-col items-center justify-center text-rose-500 cursor-pointer hover:bg-rose-100 transition-colors group"
                title="View PDF Report"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mb-1 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                <span className="text-[8px] font-black uppercase tracking-tighter">PDF</span>
            </div>
        );
    }

    if (isImage) {
        return (
            <img
                src={fileUrl}
                alt={altText}
                className="h-full w-full object-cover rounded-xl cursor-pointer ring-2 ring-slate-100 hover:ring-indigo-100 transition-all"
                onClick={handleView}
                onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    const fallback = target.nextSibling as HTMLElement;
                    if (fallback) fallback.style.display = 'flex';
                }}
            />
        );
    }

    return (
        <div
            onClick={handleView}
            className="h-full w-full bg-slate-100 border border-slate-200 rounded-xl flex flex-col items-center justify-center text-slate-500 cursor-pointer hover:bg-slate-200 transition-colors group"
            title="View Attachment"
        >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mb-1 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
            </svg>
            <span className="text-[8px] font-black uppercase tracking-tighter">FILE</span>
        </div>
    );
};
