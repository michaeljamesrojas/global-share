export interface SharedFile {
  fileName: string;
  fileSize: number;
  fileType: string;
  downloadUrl: string;
}

export type Status =
  | { mode: 'idle', message?: string }
  | { mode: 'error', message: string }
  | { mode: 'sharing-waiting', code: string }
  | { mode: 'sharing-sending', code: string, progress: number }
  | { mode: 'sharing-complete', code: string }
  | { mode: 'receiving-connecting' }
  | { mode: 'receiving-inprogress', progress: number }
  | { mode: 'receiving-complete' };


export type P2PMessage =
  | { type: 'METADATA'; payload: { fileName: string; fileSize: number; fileType: string } }
  | { type: 'CHUNK'; payload: ArrayBuffer }
  | { type: 'END' };
