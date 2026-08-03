import Peer from 'peerjs';

export const STUN_SERVERS = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
  { urls: 'stun:stun2.l.google.com:19302' },
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
