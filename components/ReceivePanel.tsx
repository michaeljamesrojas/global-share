import React, { useState, ChangeEvent, FormEvent } from 'react';
import { type SharedFile, Status } from '../types';
import { AlertIcon } from './icons/AlertIcon';
import FileCard from './FileCard';
// FIX: Import the missing CheckIcon component to resolve the 'Cannot find name' error.
import { CheckIcon } from './icons/CheckIcon';

interface ReceivePanelProps {
  onFileRequest: (code: string) => void;
  status: Status;
  receivedFile: SharedFile | null;
}

const ReceivePanel: React.FC<ReceivePanelProps> = ({ onFileRequest, status, receivedFile }) => {
  const [code, setCode] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (code.trim().length === 0) return;
    onFileRequest(code);
    setCode('');
  };

  const renderContent = () => {
    switch (status.mode) {
      case 'receiving-connecting':
        return (
          <div className="text-center text-slate-300 flex flex-col items-center">
            <svg className="animate-spin h-8 w-8 text-fuchsia-400 mb-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            <p>Connecting to sender...</p>
          </div>
        );
      case 'receiving-inprogress':
        return (
           <div className="text-center text-slate-300">
                <p>Connected! Receiving file...</p>
                <div className="w-full bg-slate-700 rounded-full h-2.5 my-3">
                    <div className="bg-fuchsia-500 h-2.5 rounded-full" style={{ width: `${status.progress}%` }}></div>
                </div>
                {receivedFile && <p className="text-sm text-slate-400">{receivedFile.fileName}</p>}
           </div>
        );
      case 'receiving-complete':
        if (receivedFile) {
          return (
            <div>
              <h3 className="text-lg text-green-400 mb-2 flex items-center"><CheckIcon className="w-5 h-5 mr-2"/>File Received:</h3>
              <FileCard fileName={receivedFile.fileName} fileSize={receivedFile.fileSize} downloadUrl={receivedFile.downloadUrl}/>
            </div>
          );
        }
        return null;
      default:
        return (
          <>
            {status.mode === 'error' && (
              <div className="mb-4 bg-red-900/50 border border-red-500 text-red-300 px-4 py-3 rounded-lg flex items-center">
                  <AlertIcon className="w-5 h-5 mr-3"/>
                  <span>{status.message}</span>
              </div>
            )}
            {status.mode === 'idle' && status.message && (
                 <div className="mb-4 bg-blue-900/50 border border-blue-500 text-blue-300 px-4 py-3 rounded-lg flex items-center">
                    <AlertIcon className="w-5 h-5 mr-3"/>
                    <span>{status.message}</span>
                </div>
            )}
          </>
        )
    }
  }


  return (
    <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700 shadow-lg backdrop-blur-sm min-h-[380px] flex flex-col justify-center">
      <h2 className="text-2xl font-bold text-fuchsia-400 mb-4 text-center">Receive File</h2>

      <form onSubmit={handleSubmit} className="flex flex-col mb-6">
        <label htmlFor="code" className="text-slate-300 mb-2">Enter share code</label>
        <input
          id="code"
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Enter code from sender..."
          className="font-sans text-lg bg-slate-900 border border-slate-600 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-fuchsia-400 transition-colors"
        />
        <button
          type="submit"
          className="mt-6 w-full bg-fuchsia-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-fuchsia-400 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-fuchsia-300 disabled:bg-slate-600 disabled:cursor-not-allowed disabled:scale-100"
          disabled={code.trim().length === 0}
        >
          Find File
        </button>
      </form>
      
      <div className="flex-grow flex items-center justify-center">
        {renderContent()}
      </div>

    </div>
  );
};

export default ReceivePanel;
