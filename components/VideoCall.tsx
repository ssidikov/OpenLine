'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import type Peer from 'peerjs';
import type { MediaConnection } from 'peerjs';
import CallControls from './CallControls';
import CopyLinkButton from './CopyLinkButton';

interface VideoCallProps {
  roomId: string;
}

export default function VideoCall({ roomId }: VideoCallProps) {
  const router = useRouter();

  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);

  const [isConnected, setIsConnected] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isVideoMuted, setIsVideoMuted] = useState(false);
  const [needsPlayInteraction, setNeedsPlayInteraction] = useState(false);

  const peerRef = useRef<Peer | null>(null);
  const currentCallRef = useRef<MediaConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);

  // Helper to handle incoming/outgoing media calls
  const setupMediaCall = (call: MediaConnection) => {
    currentCallRef.current = call;

    call.on('stream', (incomingRemoteStream) => {
      setIsConnected(true);

      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = incomingRemoteStream;
        remoteVideoRef.current
          .play()
          .catch((err) => {
            console.warn('Autoplay blocked by browser policy:', err);
            setNeedsPlayInteraction(true);
          });
      }
    });

    call.on('close', () => {
      setIsConnected(false);
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = null;
      }
    });

    call.on('error', (err) => {
      console.error('Call error:', err);
      setIsConnected(false);
    });
  };

  useEffect(() => {
    let isSubscribed = true;

    async function initCall() {
      try {
        // 1. Get user media (camera + microphone)
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            facingMode: 'user',
          },
          audio: true,
        });

        if (!isSubscribed) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        localStreamRef.current = stream;

        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }

        // 2. Import peer helper dynamically to ensure browser environment
        const { createPeer } = await import('../lib/peer');

        // Try creating peer with roomId (Host role)
        const peerInstance = createPeer(roomId);
        peerRef.current = peerInstance;

        peerInstance.on('open', (id) => {
          console.log('Peer connected with ID:', id);
        });

        // Listen for incoming calls (Host or Guest receiving call)
        peerInstance.on('call', (incomingCall) => {
          console.log('Incoming call received');
          incomingCall.answer(stream);
          setupMediaCall(incomingCall);
        });

        peerInstance.on('error', (err) => {
          console.warn('Peer error type:', err.type, err.message);

          const errorType = err.type as string;
          // If roomId is taken, user is Guest -> Create peer with random ID & call Host
          if (errorType === 'unavailable-id' || errorType === 'id-taken') {
            console.log('Room occupied, joining as guest...');
            peerInstance.destroy();

            const guestPeer = createPeer();
            peerRef.current = guestPeer;

            guestPeer.on('open', (guestId) => {
              console.log('Guest peer connected with ID:', guestId);
              const outgoingCall = guestPeer.call(roomId, stream);
              if (outgoingCall) {
                setupMediaCall(outgoingCall);
              }
            });

            guestPeer.on('call', (incomingCall) => {
              incomingCall.answer(stream);
              setupMediaCall(incomingCall);
            });

            guestPeer.on('error', (guestErr) => {
              console.error('Guest peer error:', guestErr);
              setErrorMessage('Could not connect to the room. Please check the link.');
            });
          } else if (err.type === 'peer-unavailable') {
            setErrorMessage('The room host has not connected yet. Check the link or wait for the host.');
          } else {
            console.error('General peer error:', err);
          }
        });
      } catch (err) {
        console.error('Error getting user media:', err);
        setErrorMessage(
          'Could not access camera or microphone. Please allow permissions in your browser settings.'
        );
      }
    }

    initCall();

    // Clean up resources on unmount
    return () => {
      isSubscribed = false;
      if (currentCallRef.current) {
        currentCallRef.current.close();
      }
      if (peerRef.current) {
        peerRef.current.destroy();
      }
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, [roomId]);

  // Handle Mute Audio Toggle
  const toggleAudio = () => {
    if (localStreamRef.current) {
      const audioTracks = localStreamRef.current.getAudioTracks();
      audioTracks.forEach((track) => {
        track.enabled = isAudioMuted;
      });
      setIsAudioMuted(!isAudioMuted);
    }
  };

  // Handle Mute Video Toggle
  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTracks = localStreamRef.current.getVideoTracks();
      videoTracks.forEach((track) => {
        track.enabled = isVideoMuted;
      });
      setIsVideoMuted(!isVideoMuted);
    }
  };

  // Handle Hang Up
  const handleHangUp = () => {
    if (currentCallRef.current) {
      currentCallRef.current.close();
    }
    if (peerRef.current) {
      peerRef.current.destroy();
    }
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
    }
    router.push('/');
  };

  // Manual playback trigger if autoplay is blocked by browser
  const handlePlayRemoteVideo = () => {
    if (remoteVideoRef.current) {
      remoteVideoRef.current
        .play()
        .then(() => setNeedsPlayInteraction(false))
        .catch(console.error);
    }
  };

  return (
    <div className="relative w-full h-[calc(100vh-4rem)] max-w-7xl mx-auto flex flex-col justify-between p-4 overflow-hidden rounded-2xl bg-zinc-950 border border-zinc-800/80 shadow-2xl">
      {/* Top Header Overlay */}
      <div className="absolute top-6 left-6 right-6 z-20 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-3 bg-zinc-900/80 backdrop-blur-md px-4 py-2 rounded-xl border border-zinc-800 pointer-events-auto">
          <div className={`w-2.5 h-2.5 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500 animate-ping'}`} />
          <span className="text-xs font-mono text-zinc-300">
            Room: <strong className="text-zinc-100">{roomId}</strong>
          </span>
        </div>

        <div className="pointer-events-auto">
          <CopyLinkButton />
        </div>
      </div>

      {/* Main Video View Container */}
      <div className="relative flex-1 w-full bg-zinc-900/50 rounded-xl overflow-hidden flex items-center justify-center border border-zinc-800/50">
        {/* Remote Video (Fullscreen / Main Stage) */}
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          className={`w-full h-full object-cover transition-opacity duration-300 ${
            isConnected ? 'opacity-100' : 'opacity-0 hidden'
          }`}
        />

        {/* Remote Video Unmute / Play Fallback Overlay for Safari */}
        {needsPlayInteraction && (
          <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/70 backdrop-blur-sm">
            <button
              onClick={handlePlayRemoteVideo}
              type="button"
              className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-sm transition shadow-lg cursor-pointer flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
              </svg>
              Enable Video Playback
            </button>
          </div>
        )}

        {/* Waiting Placeholder */}
        {!isConnected && !errorMessage && (
          <div className="flex flex-col items-center justify-center gap-4 text-center p-6 z-10">
            <div className="relative flex items-center justify-center">
              <div className="w-16 h-16 rounded-full border-2 border-emerald-500/30 border-t-emerald-500 animate-spin" />
              <svg className="w-6 h-6 text-emerald-400 absolute" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-medium text-zinc-200">Waiting for peer...</h3>
              <p className="text-xs text-zinc-400 max-w-sm mt-1">
                Send the link to a peer to start the call
              </p>
            </div>
            <CopyLinkButton className="mt-2" />
          </div>
        )}

        {/* Error Overlay */}
        {errorMessage && (
          <div className="flex flex-col items-center justify-center gap-4 text-center p-6 z-30 max-w-md bg-zinc-900/90 border border-rose-500/30 rounded-2xl backdrop-blur-md">
            <div className="w-12 h-12 rounded-full bg-rose-500/20 flex items-center justify-center text-rose-400">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <p className="text-sm text-zinc-200">{errorMessage}</p>
            <button
              onClick={() => router.push('/')}
              type="button"
              className="px-5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium border border-zinc-700 transition"
            >
              Back to Home
            </button>
          </div>
        )}

        {/* Local Video (Floating Picture-in-Picture Overlay) */}
        <div className="absolute bottom-6 right-6 z-20 w-36 h-48 md:w-48 md:h-64 rounded-2xl overflow-hidden border-2 border-zinc-700/80 shadow-2xl bg-zinc-950 transition-all duration-300">
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className={`w-full h-full object-cover transform -scale-x-100 ${
              isVideoMuted ? 'opacity-0' : 'opacity-100'
            }`}
          />
          {isVideoMuted && (
            <div className="absolute inset-0 flex items-center justify-center bg-zinc-900 text-zinc-500">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 3l18 18" />
              </svg>
            </div>
          )}
          <div className="absolute bottom-2 left-2 text-[10px] bg-black/60 backdrop-blur-xs px-2 py-0.5 rounded text-zinc-300 font-medium">
            You {isAudioMuted && '(mic off)'}
          </div>
        </div>
      </div>

      {/* Bottom Controls Bar */}
      <div className="mt-4 flex items-center justify-center z-20">
        <CallControls
          isAudioMuted={isAudioMuted}
          isVideoMuted={isVideoMuted}
          onToggleAudio={toggleAudio}
          onToggleVideo={toggleVideo}
          onHangUp={handleHangUp}
        />
      </div>
    </div>
  );
}
