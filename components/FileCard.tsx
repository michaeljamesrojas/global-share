import React from 'react';
import { DownloadIcon } from './icons/DownloadIcon';

interface FileCardProps {
    fileName: string;
    fileSize: number;
    downloadUrl: string;
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const FileCard: React.FC<FileCardProps> = ({ fileName, fileSize, downloadUrl }) => {
    return (
        <div className="bg-slate-700/50 rounded-lg p-4 flex items-center justify-between border border-slate-600 w-full">
            <div className="flex-1 min-w-0">
                <p className="text-white font-medium truncate" title={fileName}>{fileName}</p>
                <p className="text-sm text-slate-400">{formatFileSize(fileSize)}</p>
            </div>
            <a
                href={downloadUrl}
                download={fileName}
                className="ml-4 flex-shrink-0 bg-green-600 text-white p-3 rounded-full hover:bg-green-500 transition-colors focus:outline-none focus:ring-2 focus:ring-green-400"
                aria-label={`Download ${fileName}`}
                target="_blank" 
                rel="noopener noreferrer"
            >
                <DownloadIcon className="w-5 h-5" />
            </a>
        </div>
    );
};

export default FileCard;