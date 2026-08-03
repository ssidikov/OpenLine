'use client';

import React, { useEffect, useRef, useState } from 'react';
import { VideoQuality, QUALITY_PRESETS, UserMediaConfig } from '@/lib/types';
import { getUserMediaStream } from '@/lib/peer';

interface GreenroomModalProps {
  roomId: string;
  initialMode?: 'video' | 'audio';
  onJoin: (config: UserMediaConfig, stream: MediaStream) => void;
}

export default function GreenroomModal({ roomId, initialMode = 'video', onJoin }: GreenroomModalProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const isJoinedRef = useRef<boolean>(false);

  const [callMode, setCallMode] = useState<'video' | 'audio'>(initialMode);
  const [cameras, setCameras] = useState<MediaDeviceInfo[]>([]);
  const [mics, setMics] = useState<MediaDeviceInfo[]>([]);
  const [selectedCamera, setSelectedCamera] = useState<string>('');
  const [selectedMic, setSelectedMic] = useState<string>('');
  const [selectedQuality, setSelectedQuality] = useState<VideoQuality>('720p');
  
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isVideoMuted, setIsVideoMuted] = useState(false);
  const [audioLevel, setAudioLevel] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const closeAudioContext = () => {
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
  };

  // Enumerate available devices
  const loadDevices = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoInputs = devices.filter((d) => d.kind === 'videoinput');
      const audioInputs = devices.filter((d) => d.kind === 'audioinput');

      setCameras(videoInputs);
      setMics(audioInputs);

      if (videoInputs.length > 0 && !selectedCamera) {
        setSelectedCamera(videoInputs[0].deviceId);
      }
      if (audioInputs.length > 0 && !selectedMic) {
        setSelectedMic(audioInputs[0].deviceId);
      }
    } catch (err) {
      console.warn('Device enumeration error:', err);
    }
  };

  const setupAudioMeter = (stream: MediaStream) => {
    try {
      closeAudioContext();

      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const audioCtx = new AudioCtx();
      audioContextRef.current = audioCtx;

      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 64;
      source.connect(analyser);
      analyserRef.current = analyser;

      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      const updateLevel = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        const avg = sum / dataArray.length;
        setAudioLevel(Math.min(100, Math.round((avg / 128) * 100)));
        animFrameRef.current = requestAnimationFrame(updateLevel);
      };

      updateLevel();
    } catch (e) {
      console.warn('AudioContext meter failed:', e);
    }
  };

  useEffect(() => {
    let active = true;

    const initPreview = async () => {
      // Stop existing stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => {
          track.enabled = false;
          track.stop();
        });
        streamRef.current = null;
      }

      if (videoRef.current) {
        videoRef.current.pause();
        videoRef.current.srcObject = null;
      }

      try {
        const config: UserMediaConfig = {
          callMode,
          quality: selectedQuality,
          videoDeviceId: selectedCamera || undefined,
          audioDeviceId: selectedMic || undefined,
        };

        const stream = await getUserMediaStream(config);
        if (!active) return;
        streamRef.current = stream;

        // Apply initial mute state
        stream.getAudioTracks().forEach((t) => (t.enabled = !isAudioMuted));
        if (config.callMode === 'video') {
          stream.getVideoTracks().forEach((t) => (t.enabled = !isVideoMuted));
        }

        if (videoRef.current && config.callMode === 'video') {
          videoRef.current.srcObject = stream;
        }

        // Audio meter setup
        setupAudioMeter(stream);
        await loadDevices();
        setIsLoading(false);
      } catch (err) {
        if (!active) return;
        console.error('Greenroom preview error:', err);
        setErrorMsg('Microphone or camera permission denied. Please allow browser access.');
        setIsLoading(false);
      }
    };

    initPreview();

    return () => {
      active = false;
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      closeAudioContext();
      if (!isJoinedRef.current && streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
    };
  }, [callMode, selectedQuality, selectedCamera, selectedMic]);

  const toggleAudio = () => {
    if (streamRef.current) {
      const nextState = !isAudioMuted;
      streamRef.current.getAudioTracks().forEach((t) => (t.enabled = !nextState));
      setIsAudioMuted(nextState);
    }
  };

  const toggleVideo = () => {
    if (streamRef.current && callMode === 'video') {
      const nextState = !isVideoMuted;
      streamRef.current.getVideoTracks().forEach((t) => (t.enabled = !nextState));
      setIsVideoMuted(nextState);
    }
  };

  const handleJoinCall = () => {
    if (streamRef.current) {
      isJoinedRef.current = true;
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      closeAudioContext();

      onJoin(
        {
          callMode,
          quality: selectedQuality,
          videoDeviceId: selectedCamera || undefined,
          audioDeviceId: selectedMic || undefined,
        },
        streamRef.current
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/90 backdrop-blur-xl animate-fadeIn">
      <div className="w-full max-w-2xl bg-zinc-900 border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 pb-4 border-b border-zinc-800/80 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-zinc-100">Ready to join?</h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              Room: <span className="font-mono text-emerald-400 font-semibold">{roomId}</span>
            </p>
          </div>

          {/* Mode Selector Pill */}
          <div className="flex items-center gap-1 p-1 bg-zinc-950 border border-zinc-800 rounded-2xl">
            <button
              type="button"
              onClick={() => setCallMode('video')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                callMode === 'video'
                  ? 'bg-emerald-500 text-zinc-950 shadow-md'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <span>Video Call</span>
            </button>

            <button
              type="button"
              onClick={() => setCallMode('audio')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                callMode === 'audio'
                  ? 'bg-emerald-500 text-zinc-950 shadow-md'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
              <span>Audio Only</span>
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 overflow-y-auto max-h-[75vh]">
          {/* Video Preview or Audio Avatar Box */}
          {callMode === 'video' ? (
            <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-zinc-950 border border-zinc-800 flex items-center justify-center group shadow-inner">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover transform -scale-x-100 transition-opacity duration-300 ${
                  isVideoMuted || isLoading ? 'opacity-0' : 'opacity-100'
                }`}
              />

              {isLoading && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-zinc-400">
                  <div className="w-8 h-8 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
                  <span className="text-xs font-medium">Starting camera preview...</span>
                </div>
              )}

              {isVideoMuted && !isLoading && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-zinc-950/90 text-zinc-400">
                  <div className="w-14 h-14 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center">
                    <svg className="w-7 h-7 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 3l18 18" />
                    </svg>
                  </div>
                  <span className="text-xs">Camera is turned off</span>
                </div>
              )}

              {/* In-video Quick Toggle Controls */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-zinc-900/80 backdrop-blur-md px-4 py-2 rounded-full border border-zinc-700/60 shadow-xl">
                <button
                  type="button"
                  onClick={toggleAudio}
                  className={`p-2.5 rounded-full transition cursor-pointer ${
                    isAudioMuted ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40' : 'bg-zinc-800 text-zinc-200 hover:bg-zinc-700'
                  }`}
                  title={isAudioMuted ? 'Unmute microphone' : 'Mute microphone'}
                >
                  {isAudioMuted ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3l18 18" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                    </svg>
                  )}
                </button>

                <button
                  type="button"
                  onClick={toggleVideo}
                  className={`p-2.5 rounded-full transition cursor-pointer ${
                    isVideoMuted ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40' : 'bg-zinc-800 text-zinc-200 hover:bg-zinc-700'
                  }`}
                  title={isVideoMuted ? 'Turn camera on' : 'Turn camera off'}
                >
                  {isVideoMuted ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3l18 18" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          ) : (
            /* Audio Only Mode Avatar Box */
            <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-zinc-950 border border-zinc-800 flex flex-col items-center justify-center p-6 gap-4 shadow-inner">
              <div className="relative flex items-center justify-center">
                <div
                  className="w-24 h-24 rounded-full bg-emerald-500/10 border-2 border-emerald-500/30 flex items-center justify-center transition-transform duration-100"
                  style={{ transform: `scale(${1 + (isAudioMuted ? 0 : audioLevel / 200)})` }}
                >
                  <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
                    <svg className="w-8 h-8 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="text-center space-y-1">
                <h3 className="font-semibold text-sm text-zinc-200">Audio Only Call Mode</h3>
                <p className="text-xs text-zinc-400">Your camera will be off during this call to save data.</p>
              </div>

              <button
                type="button"
                onClick={toggleAudio}
                className={`px-5 py-2.5 rounded-full transition cursor-pointer flex items-center gap-2 text-xs font-semibold ${
                  isAudioMuted
                    ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                    : 'bg-zinc-800 text-zinc-200 hover:bg-zinc-700 border border-zinc-700'
                }`}
              >
                {isAudioMuted ? 'Unmute Mic' : 'Mute Mic'}
              </button>
            </div>
          )}

          {/* Audio Level Meter */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-medium text-zinc-400">
              <span>Mic Audio Level</span>
              <span className={isAudioMuted ? 'text-rose-400' : 'text-emerald-400'}>
                {isAudioMuted ? 'Muted' : `${audioLevel}%`}
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-zinc-800 overflow-hidden">
              <div
                className={`h-full transition-all duration-75 ${
                  isAudioMuted ? 'bg-zinc-700' : 'bg-emerald-400'
                }`}
                style={{ width: `${isAudioMuted ? 0 : audioLevel}%` }}
              />
            </div>
          </div>

          {/* Device & Quality Options Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Mic Select */}
            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs font-semibold text-zinc-300 block">Microphone Device</label>
              <select
                value={selectedMic}
                onChange={(e) => setSelectedMic(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-200 focus:outline-none focus:border-emerald-500 cursor-pointer"
              >
                {mics.map((m, i) => (
                  <option key={m.deviceId || i} value={m.deviceId}>
                    {m.label || `Microphone ${i + 1}`}
                  </option>
                ))}
              </select>
            </div>

            {/* Camera Select (only in Video mode) */}
            {callMode === 'video' && (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-300 block">Camera Device</label>
                <select
                  value={selectedCamera}
                  onChange={(e) => setSelectedCamera(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-200 focus:outline-none focus:border-emerald-500 cursor-pointer"
                >
                  {cameras.map((c, i) => (
                    <option key={c.deviceId || i} value={c.deviceId}>
                      {c.label || `Camera ${i + 1}`}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Max Resolution Selector (only in Video mode) */}
            {callMode === 'video' && (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-300 block">Max Video Resolution</label>
                <select
                  value={selectedQuality}
                  onChange={(e) => setSelectedQuality(e.target.value as VideoQuality)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-200 focus:outline-none focus:border-emerald-500 cursor-pointer"
                >
                  {(Object.keys(QUALITY_PRESETS) as VideoQuality[]).map((q) => (
                    <option key={q} value={q}>
                      {QUALITY_PRESETS[q].label} ({QUALITY_PRESETS[q].width}x{QUALITY_PRESETS[q].height})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
              {errorMsg}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-zinc-800/80 bg-zinc-950/40 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={handleJoinCall}
            disabled={isLoading || !!errorMsg}
            className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-emerald-400 hover:bg-emerald-300 active:scale-97 text-zinc-950 font-bold text-sm shadow-xl shadow-emerald-500/20 transition-all duration-150 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <span>{callMode === 'audio' ? 'Join Audio Call' : 'Join Video Call'}</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
