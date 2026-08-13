'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import type Peer from 'peerjs';
import type { MediaConnection, DataConnection } from 'peerjs';
import { QUALITY_PRESETS, ChatMessage, UserMediaConfig } from '@/lib/types';
import { getUserMediaStream } from '@/lib/peer';
import CallControls from './CallControls';
import CopyLinkButton from './CopyLinkButton';
import ChatDrawer from './ChatDrawer';
import SettingsModal from './SettingsModal';

interface VideoCallProps {
  roomId: string;
  initialMode?: 'video' | 'audio';
}

export default function VideoCall({ roomId, initialMode = 'video' }: VideoCallProps) {
  // Video element refs
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);

  // Connection & Media State
  const [isConnected, setIsConnected] = useState(false);
  const [isInitializingMedia, setIsInitializingMedia] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [needsPlayInteraction, setNeedsPlayInteraction] = useState(false);
  const [copiedToast, setCopiedToast] = useState(false);

  // Media Config
  const [mediaConfig, setMediaConfig] = useState<UserMediaConfig>({
    quality: '720p',
    facingMode: 'user',
    callMode: initialMode,
  });
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isVideoMuted, setIsVideoMuted] = useState(initialMode === 'audio');
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isSwappedView, setIsSwappedView] = useState(false);
  const [isMobileDevice] = useState(() => {
    if (typeof window !== 'undefined') {
      return /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent);
    }
    return false;
  });

  // Modals & Drawers
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [unreadChatCount, setUnreadChatCount] = useState(0);

  // Peer & Stream Refs
  const peerRef = useRef<Peer | null>(null);
  const currentCallRef = useRef<MediaConnection | null>(null);
  const dataConnRef = useRef<DataConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const screenStreamRef = useRef<MediaStream | null>(null);

  // Handle incoming/outgoing data channel for chat
  const setupDataConnection = useCallback((dataConn: DataConnection) => {
    dataConnRef.current = dataConn;

    dataConn.on('data', (data) => {
      try {
        const payload = data as { type: string; text: string; timestamp: string };
        if (payload.type === 'chat') {
          const newMsg: ChatMessage = {
            id: String(Date.now()),
            sender: 'peer',
            text: payload.text,
            timestamp: payload.timestamp || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          };
          setMessages((prev) => [...prev, newMsg]);
          setIsChatOpen((open) => {
            if (!open) setUnreadChatCount((count) => count + 1);
            return open;
          });
        }
      } catch (err) {
        console.error('Data channel parse error:', err);
      }
    });

    dataConn.on('close', () => {
      dataConnRef.current = null;
    });
  }, []);

  // Handle incoming/outgoing media call
  const setupMediaCall = useCallback((call: MediaConnection) => {
    currentCallRef.current = call;

    call.on('stream', (incomingRemoteStream) => {
      setIsConnected(true);

      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = incomingRemoteStream;
        remoteVideoRef.current
          .play()
          .catch((err) => {
            console.warn('Autoplay blocked:', err);
            setNeedsPlayInteraction(true);
          });
      }
    });

    call.on('close', () => {
      setIsConnected(false);
      if (remoteVideoRef.current) {
        remoteVideoRef.current.pause();
        remoteVideoRef.current.srcObject = null;
      }
    });

    call.on('error', (err) => {
      console.error('Call error:', err);
      setIsConnected(false);
    });
  }, []);

  // Helper to stop all active tracks
  const stopAllMediaTracks = useCallback(() => {
    if (localVideoRef.current) {
      localVideoRef.current.pause();
      localVideoRef.current.srcObject = null;
    }
    if (remoteVideoRef.current) {
      remoteVideoRef.current.pause();
      remoteVideoRef.current.srcObject = null;
    }
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach((t) => {
        t.enabled = false;
        t.stop();
      });
      screenStreamRef.current = null;
    }
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((t) => {
        t.enabled = false;
        t.stop();
      });
      localStreamRef.current = null;
    }
  }, []);

  // Initialize Media and Peer on mount (Direct & Fluid call start)
  const initCall = useCallback(async () => {
    setIsInitializingMedia(true);
    setErrorMessage(null);

    try {
      // 1. Request user media directly
      const config: UserMediaConfig = {
        callMode: initialMode,
        quality: '720p',
        facingMode: 'user',
      };
      setMediaConfig(config);

      const stream = await getUserMediaStream(config);
      localStreamRef.current = stream;

      // Apply initial video mute if audio-only
      if (initialMode === 'audio') {
        stream.getVideoTracks().forEach((t) => (t.enabled = false));
        setIsVideoMuted(true);
      }

      if (localVideoRef.current && initialMode !== 'audio') {
        localVideoRef.current.srcObject = stream;
        localVideoRef.current.play().catch(console.warn);
      }

      setIsInitializingMedia(false);

      // 2. Initialize WebRTC Peer connection
      const { createPeer } = await import('@/lib/peer');
      const peerInstance = createPeer(roomId);
      peerRef.current = peerInstance;

      peerInstance.on('open', (id) => {
        console.log('Host peer connected:', id);
      });

      peerInstance.on('connection', (dataConn) => {
        setupDataConnection(dataConn);
      });

      peerInstance.on('call', (incomingCall) => {
        incomingCall.answer(stream);
        setupMediaCall(incomingCall);
      });

      peerInstance.on('error', (err) => {
        const errorType = err.type as string;
        // If room is occupied, join as guest
        if (errorType === 'unavailable-id' || errorType === 'id-taken') {
          console.log('Room occupied, joining as guest...');
          peerInstance.destroy();

          const guestPeer = createPeer();
          peerRef.current = guestPeer;

          guestPeer.on('open', () => {
            const dataConn = guestPeer.connect(roomId);
            setupDataConnection(dataConn);

            const outgoingCall = guestPeer.call(roomId, stream);
            if (outgoingCall) {
              setupMediaCall(outgoingCall);
            }
          });

          guestPeer.on('connection', (dataConn) => {
            setupDataConnection(dataConn);
          });

          guestPeer.on('call', (incomingCall) => {
            incomingCall.answer(stream);
            setupMediaCall(incomingCall);
          });

          guestPeer.on('error', (guestErr) => {
            console.error('Guest peer error:', guestErr);
            setErrorMessage('Could not connect to the room. Please verify the link.');
          });
        } else if (err.type === 'peer-unavailable') {
          setErrorMessage('Waiting for host or room link is invalid.');
        } else {
          console.error('Peer error:', err);
        }
      });
    } catch (err) {
      console.error('Call initialization error:', err);
      setIsInitializingMedia(false);
      setErrorMessage('Camera or Microphone access was denied. Please allow permissions to start the call.');
    }
  }, [roomId, initialMode, setupDataConnection, setupMediaCall]);

  useEffect(() => {
    initCall();

    return () => {
      stopAllMediaTracks();
      if (dataConnRef.current) dataConnRef.current.close();
      if (currentCallRef.current) currentCallRef.current.close();
      if (peerRef.current) peerRef.current.destroy();
    };
  }, [initCall, stopAllMediaTracks]);

  // Ensure local video element stays connected to stream
  useEffect(() => {
    if (localVideoRef.current && localStreamRef.current && !isScreenSharing && !isInitializingMedia) {
      if (localVideoRef.current.srcObject !== localStreamRef.current) {
        localVideoRef.current.srcObject = localStreamRef.current;
      }
      localVideoRef.current.play().catch(console.warn);
    }
  }, [isInitializingMedia, isScreenSharing, isSwappedView]);

  // Toggle Audio Mute
  const toggleAudio = () => {
    if (localStreamRef.current) {
      const audioTracks = localStreamRef.current.getAudioTracks();
      const nextState = !isAudioMuted;
      audioTracks.forEach((t) => (t.enabled = !nextState));
      setIsAudioMuted(nextState);
    }
  };

  // Toggle Video Mute
  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTracks = localStreamRef.current.getVideoTracks();
      const nextState = !isVideoMuted;
      videoTracks.forEach((t) => (t.enabled = !nextState));
      setIsVideoMuted(nextState);
    }
  };

  // Screen Share Toggle
  const toggleScreenShare = async () => {
    if (isScreenSharing) {
      if (screenStreamRef.current) {
        screenStreamRef.current.getTracks().forEach((track) => {
          track.enabled = false;
          track.stop();
        });
        screenStreamRef.current = null;
      }

      if (localStreamRef.current) {
        const cameraTrack = localStreamRef.current.getVideoTracks()[0];
        if (cameraTrack && currentCallRef.current) {
          const pc = currentCallRef.current.peerConnection;
          const sender = pc?.getSenders().find((s) => s.track?.kind === 'video');
          if (sender) {
            await sender.replaceTrack(cameraTrack);
          }
        }
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = localStreamRef.current;
        }
      }

      setIsScreenSharing(false);
    } else {
      try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: true,
        });

        screenStreamRef.current = screenStream;
        const screenTrack = screenStream.getVideoTracks()[0];

        if (currentCallRef.current) {
          const pc = currentCallRef.current.peerConnection;
          const sender = pc?.getSenders().find((s) => s.track?.kind === 'video');
          if (sender) {
            await sender.replaceTrack(screenTrack);
          }
        }

        if (localVideoRef.current) {
          localVideoRef.current.srcObject = screenStream;
        }

        setIsScreenSharing(true);

        screenTrack.onended = () => {
          toggleScreenShare();
        };
      } catch (err) {
        console.warn('Screen share cancelled or failed:', err);
      }
    }
  };

  // Mobile Camera Flip
  const handleFlipCamera = async () => {
    const nextMode = mediaConfig.facingMode === 'user' ? 'environment' : 'user';
    setMediaConfig((prev) => ({ ...prev, facingMode: nextMode }));

    try {
      const newStream = await getUserMediaStream({
        ...mediaConfig,
        facingMode: nextMode,
      });

      newStream.getAudioTracks().forEach((t) => {
        t.enabled = false;
        t.stop();
      });

      const newVideoTrack = newStream.getVideoTracks()[0];
      if (newVideoTrack && localStreamRef.current) {
        const oldVideoTrack = localStreamRef.current.getVideoTracks()[0];
        if (oldVideoTrack) {
          localStreamRef.current.removeTrack(oldVideoTrack);
          oldVideoTrack.enabled = false;
          oldVideoTrack.stop();
        }
        localStreamRef.current.addTrack(newVideoTrack);

        if (currentCallRef.current) {
          const pc = currentCallRef.current.peerConnection;
          const sender = pc?.getSenders().find((s) => s.track?.kind === 'video');
          if (sender) {
            await sender.replaceTrack(newVideoTrack);
          }
        }

        if (localVideoRef.current) {
          localVideoRef.current.srcObject = localStreamRef.current;
        }
      }
    } catch (err) {
      console.error('Camera flip error:', err);
    }
  };

  // Update In-Call Settings / Resolution
  const handleUpdateConfig = async (newConfig: Partial<UserMediaConfig>) => {
    const updated = { ...mediaConfig, ...newConfig };
    setMediaConfig(updated);

    if (updated.quality && localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        const preset = QUALITY_PRESETS[updated.quality];
        try {
          await videoTrack.applyConstraints({
            width: { ideal: preset.width },
            height: { ideal: preset.height },
            frameRate: { ideal: preset.fps },
          });
        } catch (err) {
          console.warn('Could not apply constraints:', err);
        }
      }
    }
  };

  // Send P2P Chat Message
  const handleSendMessage = (text: string) => {
    const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newMsg: ChatMessage = {
      id: String(Date.now()),
      sender: 'you',
      text,
      timestamp: nowStr,
    };
    setMessages((prev) => [...prev, newMsg]);

    if (dataConnRef.current && dataConnRef.current.open) {
      dataConnRef.current.send({
        type: 'chat',
        text,
        timestamp: nowStr,
      });
    }
  };

  // Picture-in-Picture Toggle
  const handleTogglePiP = async () => {
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else if (remoteVideoRef.current && document.pictureInPictureEnabled) {
        await remoteVideoRef.current.requestPictureInPicture();
      }
    } catch (err) {
      console.warn('PiP error:', err);
    }
  };

  // Copy Room Link
  const handleCopyLink = async () => {
    if (typeof window !== 'undefined') {
      try {
        await navigator.clipboard.writeText(window.location.href);
        setCopiedToast(true);
        setTimeout(() => setCopiedToast(false), 2000);
      } catch {
        prompt('Copy room link:', window.location.href);
      }
    }
  };

  // Hang Up
  const handleHangUp = () => {
    stopAllMediaTracks();
    if (dataConnRef.current) dataConnRef.current.close();
    if (currentCallRef.current) currentCallRef.current.close();
    if (peerRef.current) peerRef.current.destroy();
    window.location.href = '/';
  };

  // Keyboard Shortcuts Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['input', 'textarea'].includes((e.target as HTMLElement)?.tagName?.toLowerCase())) {
        return;
      }
      switch (e.key.toLowerCase()) {
        case 'm':
          toggleAudio();
          break;
        case 'v':
          toggleVideo();
          break;
        case 's':
          toggleScreenShare();
          break;
        case 'c':
          setIsChatOpen((prev) => !prev);
          break;
        case 'e':
          handleHangUp();
          break;
        case 'f':
          if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(() => {});
          } else {
            document.exitFullscreen().catch(() => {});
          }
          break;
        case 'escape':
          setIsChatOpen(false);
          setIsSettingsOpen(false);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAudioMuted, isVideoMuted, isScreenSharing]);

  const handlePlayRemoteVideo = () => {
    if (remoteVideoRef.current) {
      remoteVideoRef.current
        .play()
        .then(() => setNeedsPlayInteraction(false))
        .catch(console.error);
    }
  };

  return (
    <div className="relative w-full h-[calc(100vh-2rem)] md:h-[calc(100vh-3rem)] max-w-7xl mx-auto flex flex-col justify-between p-2 md:p-4 overflow-hidden rounded-3xl bg-zinc-950 border border-zinc-800/80 shadow-2xl">
      {/* Top Header Floating Minimal Bar */}
      <div className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-2 bg-zinc-900/80 backdrop-blur-xl px-3 py-1.5 rounded-full border border-zinc-800 pointer-events-auto shadow-lg">
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400 animate-ping'}`} />
          <span className="text-xs font-mono text-zinc-300">
            {roomId}
          </span>
          <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-zinc-800/80 text-emerald-400 font-medium border border-zinc-700/50">
            {mediaConfig.callMode === 'audio' ? 'Audio' : mediaConfig.quality}
          </span>
        </div>

        <div className="pointer-events-auto">
          <CopyLinkButton />
        </div>
      </div>

      {/* Copied Toast Indicator */}
      {copiedToast && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full bg-emerald-500 text-zinc-950 font-semibold text-xs shadow-xl animate-fadeIn">
          Link copied to clipboard!
        </div>
      )}

      {/* Main Call View Stage */}
      <div className="relative flex-1 w-full bg-zinc-900/60 rounded-2xl overflow-hidden flex items-center justify-center border border-zinc-800/50">
        {/* Remote Video Stream */}
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          className={`w-full h-full object-cover transition-all duration-300 ${
            isSwappedView
              ? 'w-36 h-48 md:w-56 md:h-72 absolute bottom-4 right-4 z-30 rounded-2xl border-2 border-zinc-700 shadow-2xl cursor-pointer'
              : 'w-full h-full'
          } ${isConnected && mediaConfig.callMode !== 'audio' ? 'opacity-100' : 'opacity-0 hidden'}`}
          onClick={isSwappedView ? () => setIsSwappedView(false) : undefined}
        />

        {/* Remote Audio Avatar (Audio Call Mode) */}
        {isConnected && mediaConfig.callMode === 'audio' && !isSwappedView && (
          <div className="flex flex-col items-center justify-center gap-4 text-center p-6 z-10 animate-fadeIn">
            <div className="w-24 h-24 rounded-full bg-emerald-500/10 border-2 border-emerald-500/30 flex items-center justify-center animate-pulse shadow-2xl">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
                <svg className="w-8 h-8 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              </div>
            </div>
            <div className="space-y-0.5">
              <h3 className="text-base font-bold text-zinc-100">Peer Connected</h3>
              <p className="text-xs text-emerald-400 font-medium">Audio Call Active</p>
            </div>
          </div>
        )}

        {/* Safari Autoplay Interaction Overlay */}
        {needsPlayInteraction && (
          <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fadeIn">
            <button
              onClick={handlePlayRemoteVideo}
              type="button"
              className="px-6 py-3 rounded-2xl bg-emerald-400 hover:bg-emerald-300 active:scale-96 text-zinc-950 font-bold text-sm transition-all shadow-xl cursor-pointer flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
              </svg>
              Click to Enable Audio/Video Playback
            </button>
          </div>
        )}

        {/* Waiting for Peer / Initializing State */}
        {!isConnected && !errorMessage && (
          <div className="flex flex-col items-center justify-center gap-3.5 text-center p-6 z-10 animate-fadeIn">
            {isInitializingMedia ? (
              <>
                <div className="w-10 h-10 rounded-full border-2 border-emerald-500/30 border-t-emerald-400 animate-spin" />
                <p className="text-sm font-medium text-zinc-300">Starting camera & audio...</p>
              </>
            ) : (
              <>
                <div className="relative flex items-center justify-center">
                  <div className="w-14 h-14 rounded-full border-2 border-emerald-500/20 border-t-emerald-400 animate-spin" />
                  <svg className="w-5 h-5 text-emerald-400 absolute" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-semibold text-zinc-200">Waiting for peer to join...</h3>
                  <p className="text-xs text-zinc-400 max-w-xs">
                    Share this room link with your peer to connect instantly.
                  </p>
                </div>
                <CopyLinkButton className="mt-1" />
              </>
            )}
          </div>
        )}

        {/* Connection Error Card */}
        {errorMessage && (
          <div className="flex flex-col items-center justify-center gap-3 text-center p-6 z-30 max-w-md bg-zinc-900/95 border border-rose-500/30 rounded-3xl backdrop-blur-xl shadow-2xl animate-fadeIn">
            <div className="w-12 h-12 rounded-full bg-rose-500/20 flex items-center justify-center text-rose-400">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <p className="text-xs text-zinc-200 leading-relaxed">{errorMessage}</p>
            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={initCall}
                type="button"
                className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-xs font-bold transition-all active:scale-96 cursor-pointer"
              >
                Retry
              </button>
              <button
                onClick={handleHangUp}
                type="button"
                className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium border border-zinc-700 transition-all active:scale-96 cursor-pointer"
              >
                Back Home
              </button>
            </div>
          </div>
        )}

        {/* Local Camera Stream (PiP or Swapped Stage) */}
        <div
          onClick={() => isConnected && mediaConfig.callMode !== 'audio' && setIsSwappedView((prev) => !prev)}
          className={`transition-all duration-300 overflow-hidden bg-zinc-950 shadow-2xl ${
            isSwappedView
              ? 'absolute inset-0 w-full h-full z-10'
              : 'absolute bottom-4 right-4 z-20 w-32 h-44 sm:w-44 sm:h-60 rounded-2xl border border-zinc-700/80 cursor-pointer hover:border-emerald-500/60'
          }`}
          title={isConnected && mediaConfig.callMode !== 'audio' ? 'Tap to swap views' : undefined}
        >
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className={`w-full h-full object-cover ${
              isScreenSharing ? '' : 'transform -scale-x-100'
            } ${isVideoMuted || mediaConfig.callMode === 'audio' ? 'opacity-0' : 'opacity-100'}`}
          />

          {(isVideoMuted || mediaConfig.callMode === 'audio') && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 bg-zinc-900 text-zinc-400 p-2">
              <div className="w-9 h-9 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center">
                <svg className="w-4 h-4 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              </div>
              <span className="text-[10px] text-zinc-400 font-medium">
                {mediaConfig.callMode === 'audio' ? 'Audio Only' : 'Camera Off'}
              </span>
            </div>
          )}

          <div className="absolute bottom-2 left-2 text-[10px] bg-black/70 backdrop-blur-xs px-2 py-0.5 rounded text-zinc-300 font-medium flex items-center gap-1">
            <span>{isScreenSharing ? 'Screen' : 'You'}</span>
            {isAudioMuted && <span className="text-rose-400">(mic off)</span>}
          </div>
        </div>
      </div>

      {/* Bottom Floating Minimalistic Call Controls */}
      <div className="mt-3 flex items-center justify-center z-20">
        <CallControls
          isAudioMuted={isAudioMuted}
          isVideoMuted={isVideoMuted}
          isScreenSharing={isScreenSharing}
          unreadChatCount={unreadChatCount}
          isMobileDevice={isMobileDevice}
          onToggleAudio={toggleAudio}
          onToggleVideo={toggleVideo}
          onToggleScreenShare={toggleScreenShare}
          onToggleChat={() => {
            setIsChatOpen((prev) => !prev);
            setUnreadChatCount(0);
          }}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onFlipCamera={handleFlipCamera}
          onTogglePiP={handleTogglePiP}
          onCopyLink={handleCopyLink}
          onHangUp={handleHangUp}
        />
      </div>

      {/* Chat Drawer */}
      <ChatDrawer
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        messages={messages}
        onSendMessage={handleSendMessage}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        currentConfig={mediaConfig}
        onUpdateConfig={handleUpdateConfig}
      />
    </div>
  );
}
