export type VideoQuality = '1080p' | '720p' | '480p' | '360p';

export interface QualityPreset {
  label: string;
  width: number;
  height: number;
  fps: number;
}

export const QUALITY_PRESETS: Record<VideoQuality, QualityPreset> = {
  '1080p': { label: '1080p (Full HD)', width: 1920, height: 1080, fps: 30 },
  '720p': { label: '720p (HD)', width: 1280, height: 720, fps: 30 },
  '480p': { label: '480p (SD)', width: 854, height: 480, fps: 30 },
  '360p': { label: '360p (Low Bandwidth)', width: 640, height: 360, fps: 24 },
};

export interface ChatMessage {
  id: string;
  sender: 'you' | 'peer';
  text: string;
  timestamp: string;
}

export interface UserMediaConfig {
  audioDeviceId?: string;
  videoDeviceId?: string;
  quality: VideoQuality;
  facingMode?: 'user' | 'environment';
}
