import Peer from 'peerjs';
import { QUALITY_PRESETS, UserMediaConfig } from './types';

export const STUN_SERVERS = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
  { urls: 'stun:stun2.l.google.com:19302' },
  { urls: 'stun:stun3.l.google.com:19302' },
  { urls: 'stun:stun4.l.google.com:19302' },
];

export function createPeer(id?: string): Peer {
  const options = {
    config: {
      iceServers: STUN_SERVERS,
    },
    debug: 1,
  };

  return id ? new Peer(id, options) : new Peer(options);
}

export async function getUserMediaStream(config: UserMediaConfig): Promise<MediaStream> {
  const preset = QUALITY_PRESETS[config.quality] || QUALITY_PRESETS['720p'];

  let videoConstraints: MediaTrackConstraints | boolean = false;

  if (config.callMode !== 'audio') {
    videoConstraints = {
      width: { ideal: preset.width },
      height: { ideal: preset.height },
      frameRate: { ideal: preset.fps },
    };

    if (config.videoDeviceId) {
      videoConstraints.deviceId = { exact: config.videoDeviceId };
    } else if (config.facingMode) {
      videoConstraints.facingMode = { ideal: config.facingMode };
    }
  }

  const audioConstraints: MediaTrackConstraints | boolean = config.audioDeviceId
    ? { deviceId: { exact: config.audioDeviceId } }
    : true;

  return await navigator.mediaDevices.getUserMedia({
    video: videoConstraints,
    audio: audioConstraints,
  });
}

