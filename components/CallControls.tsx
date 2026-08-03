'use client';

import React from 'react';

interface CallControlsProps {
  isAudioMuted: boolean;
  isVideoMuted: boolean;
  onToggleAudio: () => void;
  onToggleVideo: () => void;
  onHangUp: () => void;
}

export default function CallControls({
  isAudioMuted,
  isVideoMuted,
  onToggleAudio,
  onToggleVideo,
  onHangUp,
}: CallControlsProps) {
  return (
    <div className="flex items-center justify-center gap-4 p-3 bg-zinc-900/80 backdrop-blur-xl border border-zinc-800 rounded-full shadow-2xl">
      {/* Audio Mute/Unmute */}
      <button
        onClick={onToggleAudio}
        type="button"
        title={isAudioMuted ? 'Unmute microphone' : 'Mute microphone'}
        className={`p-3.5 rounded-full transition-all duration-200 cursor-pointer ${
          isAudioMuted
            ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40 hover:bg-rose-500/30'
            : 'bg-zinc-800 text-zinc-200 border border-zinc-700 hover:bg-zinc-700'
        }`}
      >
        {isAudioMuted ? (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
            />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
          </svg>
        ) : (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
            />
          </svg>
        )}
      </button>

      {/* Video Enable/Disable */}
      <button
        onClick={onToggleVideo}
        type="button"
        title={isVideoMuted ? 'Turn camera on' : 'Turn camera off'}
        className={`p-3.5 rounded-full transition-all duration-200 cursor-pointer ${
          isVideoMuted
            ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40 hover:bg-rose-500/30'
            : 'bg-zinc-800 text-zinc-200 border border-zinc-700 hover:bg-zinc-700'
        }`}
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

      {/* Hang Up */}
      <button
        onClick={onHangUp}
        type="button"
        title="End call"
        className="p-3.5 rounded-full bg-rose-600 hover:bg-rose-700 text-white shadow-lg shadow-rose-900/40 transition-all duration-200 active:scale-95 cursor-pointer ml-2"
      >
        <svg className="w-5 h-5 transform rotate-135" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 3c-4.97 0-9 4.03-9 9 0 2.12.74 4.07 1.97 5.61L4.35 19.4c-.39.39-.39 1.02 0 1.41.39.39 1.02.39 1.41 0l1.9-1.9C9.2 19.55 10.55 20 12 20c4.97 0 9-4.03 9-9 0-4.97-4.03-9-9-9zm-1 14.5v-3.09c0-.41.34-.75.75-.75h.5c.41 0 .75.34.75.75V17.5c-1 0-1.5-.5-2-1z" fillRule="evenodd" clipRule="evenodd" />
          <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
        </svg>
      </button>
    </div>
  );
}
