import React, { useState, useRef, ChangeEvent, FormEvent } from 'react';
import { Status } from '../types';
import { UploadIcon } from './icons/UploadIcon';
import { CopyIcon } from './icons/CopyIcon';
import { CheckIcon } from './icons/CheckIcon';
import { AlertIcon } from './icons/AlertIcon';

interface SendPanelProps {
  onShareFile: (file: File, code: string) => void;
  status: Status;
  onCancel: () => void;
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const SendPanel: React.FC<SendPanelProps> = ({ onShareFile, status, onCancel }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [customCode, setCustomCode] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setCustomCode('');
    }
  };

  const handleShare = (event: FormEvent) => {
    event.preventDefault();
    if (selectedFile && customCode) {
      onShareFile(selectedFile, customCode);
    }
  };

  const handleCopyCode = () => {
    // FIX: Use the 'in' operator to safely check for the 'code' property on the 'status' union type.
    // This acts as a type guard, allowing TypeScript to correctly infer the type of 'status' within this block.
    if ('code' in status) {
      navigator.clipboard.writeText(status.code);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const resetState = () => {
    setSelectedFile(null);
    setCustomCode('');
    setIsCopied(false);
    if (fileInputRef.current) {
        fileInputRef.current.value = "";
    }
    onCancel();
  }

  const renderContent = () => {
    switch (status.mode) {
      case 'sharing-waiting':
      case 'sharing-sending':
      case 'sharing-complete':
        return (
          <div className="text-center">
            {status.mode === 'sharing-waiting' && (
              <>
                <p className="text-slate-300">Waiting for receiver to connect...</p>
                <p className="text-sm text-amber-400 mt-2">Do not close this page.</p>
              </>
            )}
            {status.mode === 'sharing-sending' && (
                <>
                    <p className="text-slate-300">Connected! Sending file...</p>
                    <div className="w-full bg-slate-700 rounded-full h-2.5 my-3">
                        <div className="bg-cyan-400 h-2.5 rounded-full" style={{ width: `${status.progress}%` }}></div>
                    </div>
                </>
            )}
             {status.mode === 'sharing-complete' && (
                <>
                    <div className="flex items-center justify-center text-green-400">
                        <CheckIcon className="w-6 h-6 mr-2"/>
                        <p>File sent successfully!</p>
                    </div>
                </>
            )}
            
            <div className="bg-slate-900 rounded-lg p-4 my-4 inline-flex items-center space-x-4 border border-slate-700">
                <span className="text-xl font-mono tracking-wider text-white break-all">{status.code}</span>
                <button onClick={handleCopyCode} className="p-2 rounded-md bg-slate-700 hover:bg-slate-600 transition-colors focus:outline-none focus:ring-2 focus:ring-fuchsia-400" aria-label="Copy code">
                    {isCopied ? <CheckIcon className="w-5 h-5 text-green-400" /> : <CopyIcon className="w-5 h-5 text-slate-300" />}
                </button>
            </div>
            
            <button
              onClick={resetState}
              className="mt-4 w-full bg-slate-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-slate-500 transition-colors"
            >
              Share Another File
            </button>
          </div>
        );
      default: // idle, error
        return (
          <>
            {/* Error display - show at top for visibility */}
            {status.mode === 'error' && (
              <div className="mb-4 bg-red-900/50 border border-red-500 text-red-300 px-4 py-3 rounded-lg">
                <div className="flex items-center mb-2">
                  <AlertIcon className="w-5 h-5 mr-3"/>
                  <span>{status.message}</span>
                </div>
                <button
                  onClick={resetState}
                  className="text-sm bg-red-600 hover:bg-red-500 px-3 py-1 rounded transition-colors"
                >
                  Try Again
                </button>
              </div>
            )}
            
            {status.mode === 'idle' && status.message && (
                 <div className="mb-4 bg-blue-900/50 border border-blue-500 text-blue-300 px-4 py-3 rounded-lg flex items-center">
                    <AlertIcon className="w-5 h-5 mr-3"/>
                    <span>{status.message}</span>
                </div>
            )}
            
            <div 
              className="border-2 border-dashed border-slate-600 rounded-lg p-8 text-center cursor-pointer hover:border-cyan-400 hover:bg-slate-800 transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" aria-label="File upload" />
              <div className="flex flex-col items-center text-slate-400">
                  <UploadIcon className="w-10 h-10 mb-3" />
                  {selectedFile ? (
                      <span>{selectedFile.name} ({formatFileSize(selectedFile.size)})</span>
                  ) : (
                      <span>Click to select or drop a file</span>
                  )}
              </div>
            </div>

            {selectedFile && (
              <form onSubmit={handleShare} className="mt-6" noValidate>
                <div>
                  <label htmlFor="custom-code" className="block text-sm font-medium text-slate-300 mb-2">Create a share code</label>
                   <input
                    id="custom-code"
                    type="text"
                    value={customCode}
                    onChange={(e) => setCustomCode(e.target.value)}
                    placeholder="e.g. project-files-final"
                    className={`w-full font-sans text-base bg-slate-900 border ${status.mode === 'error' ? 'border-red-500' : 'border-slate-600'} rounded-lg p-3 focus:outline-none focus:ring-2 ${status.mode === 'error' ? 'focus:ring-red-400' : 'focus:ring-cyan-400'} transition-colors`}
                    aria-describedby="code-error"
                    aria-invalid={status.mode === 'error'}
                  />
                </div>

                <button
                  type="submit"
                  disabled={!customCode.trim()}
                  className="mt-4 w-full bg-cyan-500 text-slate-900 font-bold py-3 px-4 rounded-lg hover:bg-cyan-400 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-cyan-300 disabled:bg-slate-600 disabled:cursor-not-allowed disabled:scale-100 flex items-center justify-center"
                >
                  Share File
                </button>
              </form>
            )}
          </>
        );
    }
  }

  return (
    <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700 shadow-lg backdrop-blur-sm min-h-[380px] flex flex-col justify-center">
      <h2 className="text-2xl font-bold text-cyan-400 mb-4 text-center">Send File</h2>
      {renderContent()}
    </div>
  );
};

export default SendPanel;
