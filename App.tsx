import React, { useState, useEffect, useCallback, useRef } from 'react';
import Peer, { DataConnection } from 'peerjs';
import { P2PMessage, SharedFile, Status } from './types';
import SendPanel from './components/SendPanel';
import ReceivePanel from './components/ReceivePanel';

// Constants for file chunking
const CHUNK_SIZE = 64 * 1024; // 64KB

const App: React.FC = () => {
  const [status, setStatus] = useState<Status>({ mode: 'idle' });
  const [receivedFile, setReceivedFile] = useState<SharedFile | null>(null);
  
  
  const peerRef = useRef<Peer | null>(null);
  const connectionRef = useRef<DataConnection | null>(null);
  const fileChunksRef = useRef<ArrayBuffer[]>([]);
  const errorStateRef = useRef<boolean>(false);

  const cleanup = useCallback(() => {
    connectionRef.current?.close();
    peerRef.current?.destroy();
    connectionRef.current = null;
    peerRef.current = null;
    fileChunksRef.current = [];
    errorStateRef.current = false;
    setStatus({ mode: 'idle' });
    setReceivedFile(null);
  }, []);

  const shareFile = useCallback((file: File, code: string) => {
    // Clear error state at start
    errorStateRef.current = false;
    
    // Clean up any existing connections but don't reset status yet
    connectionRef.current?.close();
    peerRef.current?.destroy();
    connectionRef.current = null;
    peerRef.current = null;
    fileChunksRef.current = [];
    setReceivedFile(null);

    try {
      const peer = new Peer(code);
      peerRef.current = peer;

      peer.on('open', (id) => {
        setStatus({ mode: 'sharing-waiting', code: id });
      });

      peer.on('connection', (conn) => {
        connectionRef.current = conn;
        setStatus({ mode: 'sharing-sending', code, progress: 0 });

        conn.on('open', () => {
          // 1. Send metadata
          conn.send({
            type: 'METADATA',
            payload: { fileName: file.name, fileSize: file.size, fileType: file.type },
          } as P2PMessage);

          // 2. Send file in chunks
          const reader = new FileReader();
          let offset = 0;
          
          reader.onload = (e) => {
              if (e.target?.result) {
                  const chunk = e.target.result as ArrayBuffer;
                  conn.send({ type: 'CHUNK', payload: chunk } as P2PMessage);
                  offset += chunk.byteLength;
                  
                  setStatus(prev => ({ ...prev, mode: 'sharing-sending', code, progress: (offset / file.size) * 100 }));
                  
                  if (offset < file.size) {
                      readSlice(offset);
                  } else {
                      conn.send({ type: 'END' } as P2PMessage);
                      setStatus({ mode: 'sharing-complete', code });
                  }
              }
          };

          const readSlice = (o: number) => {
              const slice = file.slice(o, o + CHUNK_SIZE);
              reader.readAsArrayBuffer(slice);
          };

          readSlice(0);
        });
        
        conn.on('close', () => {
          setStatus({ mode: 'idle', message: 'Receiver disconnected.' });
          cleanup();
        });
      });

      peer.on('error', (err) => {
        let message = 'An unknown error occurred.';
        if (err.type === 'unavailable-id') {
          message = 'This code is already in use. Please choose another.';
        } else if (err.type === 'peer-unavailable') {
          message = 'Could not find a peer with that code.';
        }
        
        errorStateRef.current = true;
        setStatus({ mode: 'error', message });
        
        connectionRef.current?.close();
        peerRef.current?.destroy();
        connectionRef.current = null;
        peerRef.current = null;
        fileChunksRef.current = [];
      });

      peer.on('disconnected', () => {
        // Don't override error states with disconnected message
        if (!errorStateRef.current) {
          setStatus({mode: 'idle', message: 'Connection lost. Please try again.'});
          cleanup();
        }
      });

    } catch (error) {
      errorStateRef.current = true;
      setStatus({ mode: 'error', message: 'Failed to create connection. Please try again.' });
    }

  }, [cleanup]);

  const requestFile = useCallback((code: string) => {
    // Clean up any existing connections but don't reset status yet
    connectionRef.current?.close();
    peerRef.current?.destroy();
    connectionRef.current = null;
    peerRef.current = null;
    fileChunksRef.current = [];
    setReceivedFile(null);

    const peer = new Peer();
    peerRef.current = peer;
    
    setStatus({ mode: 'receiving-connecting' });

    peer.on('open', () => {
        const conn = peer.connect(code);
        connectionRef.current = conn;

        conn.on('open', () => {
            setStatus({ mode: 'receiving-inprogress', progress: 0 });
        });

        conn.on('data', (data) => {
            const message = data as P2PMessage;
            if (message.type === 'METADATA') {
                setReceivedFile({ ...message.payload, downloadUrl: '' });
            } else if (message.type === 'CHUNK') {
                fileChunksRef.current.push(message.payload);
                setReceivedFile(prev => {
                    if (!prev) return null;
                    const receivedSize = fileChunksRef.current.reduce((acc, chunk) => acc + chunk.byteLength, 0);
                    setStatus({ mode: 'receiving-inprogress', progress: (receivedSize / prev.fileSize) * 100 });
                    return prev;
                });
            } else if (message.type === 'END') {
                setReceivedFile(prev => {
                    if (!prev) return null;
                    const fileBlob = new Blob(fileChunksRef.current, { type: prev.fileType });
                    const downloadUrl = URL.createObjectURL(fileBlob);
                    setStatus({ mode: 'receiving-complete' });
                    return { ...prev, downloadUrl };
                });
            }
        });
        conn.on('close', () => {
            setStatus({ mode: 'idle', message: 'Sender disconnected.'});
            cleanup();
        });
    });

    peer.on('error', (err) => {
        let message = 'An unknown error occurred.';
        if (err.type === 'peer-unavailable') {
            message = 'File not found. The code may be incorrect or the sender is offline.';
        }
        setStatus({ mode: 'error', message });
        connectionRef.current?.close();
        peerRef.current?.destroy();
        connectionRef.current = null;
        peerRef.current = null;
        fileChunksRef.current = [];
    });
     peer.on('disconnected', () => {
      setStatus({mode: 'idle', message: 'Connection lost. Please try again.'});
      cleanup();
    });

  }, [cleanup]);

  useEffect(() => {
    // Cleanup on component unmount
    return () => cleanup();
  }, [cleanup]);

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-4 selection:bg-cyan-400 selection:text-slate-900">
      <div className="w-full max-w-6xl mx-auto">
        <header className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-cyan-400 to-fuchsia-500 text-transparent bg-clip-text">
            Tempest Share
          </h1>
          <p className="text-slate-400 mt-2 text-lg">Your temporary P2P global clipboard. Files are sent directly.</p>
        </header>

        <main className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <SendPanel onShareFile={shareFile} status={status} onCancel={cleanup}/>
          <ReceivePanel onFileRequest={requestFile} status={status} receivedFile={receivedFile} onReset={cleanup} />
        </main>
        
        <footer className="text-center mt-12 text-slate-500 text-sm">
            <p>&copy; {new Date().getFullYear()} Tempest Share. Files are transferred peer-to-peer and are never stored on a server.</p>
        </footer>
      </div>
    </div>
  );
};

export default App;