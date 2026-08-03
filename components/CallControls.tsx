'use client';

import React from 'react';

interface CallControlsProps {
  isAudioMuted: boolean;
  isVideoMuted: boolean;
  isScreenSharing: boolean;
  unreadChatCount: number;
  isMobileDevice?: boolean;
  onToggleAudio: () => void;
  onToggleVideo: () => void;
  onToggleScreenShare: () => void;
  onToggleChat: () => void;
  onOpenSettings: () => void;
  onFlipCamera?: () => void;
  onTogglePiP?: () => void;
  onHangUp: () => void;
}

export default function CallControls({
  isAudioMuted,
  isVideoMuted,
  isScreenSharing,
  unreadChatCount,
  isMobileDevice = false,
  onToggleAudio,
  onToggleVideo,
  onToggleScreenShare,
  onToggleChat,
  onOpenSettings,
  onFlipCamera,
  onTogglePiP,
  onHangUp,
}: CallControlsProps) {
  return (
    <div className="flex items-center justify-center gap-2 sm:gap-3.5 p-2.5 sm:p-3.5 bg-zinc-900/90 backdrop-blur-2xl border border-zinc-800/90 rounded-full shadow-2xl max-w-full overflow-x-auto pb-[calc(0.75rem+env(safe-area-inset-bottom,0))]">
      {/* Audio Mute/Unmute */}
      <button
        onClick={onToggleAudio}
        type="button"
        title={isAudioMuted ? 'Unmute microphone (M)' : 'Mute microphone (M)'}
        className={`min-w-[44px] min-h-[44px] p-3 rounded-full transition-all duration-200 cursor-pointer active:scale-95 flex items-center justify-center ${
          isAudioMuted
            ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40 hover:bg-rose-500/30'
            : 'bg-zinc-800 text-zinc-200 border border-zinc-700/80 hover:bg-zinc-700'
        }`}
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

      {/* Video Camera Toggle */}
      <button
        onClick={onToggleVideo}
        type="button"
        title={isVideoMuted ? 'Turn camera on (V)' : 'Turn camera off (V)'}
        className={`min-w-[44px] min-h-[44px] p-3 rounded-full transition-all duration-200 cursor-pointer active:scale-95 flex items-center justify-center ${
          isVideoMuted
            ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40 hover:bg-rose-500/30'
            : 'bg-zinc-800 text-zinc-200 border border-zinc-700/80 hover:bg-zinc-700'
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

      {/* Mobile Camera Flip Button (only on mobile screens) */}
      {isMobileDevice && onFlipCamera && (
        <button
          onClick={onFlipCamera}
          type="button"
          title="Flip camera"
          className="min-w-[44px] min-h-[44px] p-3 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700/80 transition-all duration-200 cursor-pointer active:scale-95 flex items-center justify-center"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      )}

      {/* Screen Sharing Toggle */}
      <button
        onClick={onToggleScreenShare}
        type="button"
        title={isScreenSharing ? 'Stop screen sharing (S)' : 'Share screen (S)'}
        className={`min-w-[44px] min-h-[44px] p-3 rounded-full transition-all duration-200 cursor-pointer active:scale-95 flex items-center justify-center ${
          isScreenSharing
            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 hover:bg-emerald-500/30 animate-pulse'
            : 'bg-zinc-800 text-zinc-200 border border-zinc-700/80 hover:bg-zinc-700'
        }`}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      </button>

      {/* Chat Drawer Toggle */}
      <button
        onClick={onToggleChat}
        type="button"
        title="In-call Chat (C)"
        className="relative min-w-[44px] min-h-[44px] p-3 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700/80 transition-all duration-200 cursor-pointer active:scale-95 flex items-center justify-center"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
        {unreadChatCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-emerald-500 text-zinc-950 font-bold text-[10px] flex items-center justify-center border border-zinc-900 animate-bounce">
            {unreadChatCount}
          </span>
        )}
      </button>

      {/* Native Picture-in-Picture Popout Toggle */}
      {onTogglePiP && (
        <button
          onClick={onTogglePiP}
          type="button"
          title="Picture-in-Picture window"
          className="min-w-[44px] min-h-[44px] p-3 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700/80 transition-all duration-200 cursor-pointer active:scale-95 flex items-center justify-center hidden sm:flex"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        </button>
      )}

      {/* Resolution & Settings Modal Toggle */}
      <button
        onClick={onOpenSettings}
        type="button"
        title="Settings & Resolution"
        className="min-w-[44px] min-h-[44px] p-3 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700/80 transition-all duration-200 cursor-pointer active:scale-95 flex items-center justify-center"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </button>

      {/* Hang Up (End Call) */}
      <button
        onClick={onHangUp}
        type="button"
        title="End call (E)"
        className="min-w-[44px] min-h-[44px] p-3 rounded-full bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-900/40 transition-all duration-200 active:scale-95 cursor-pointer ml-1 flex items-center justify-center"
      >
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 9c-1.6 0-3.15.25-4.6.72v3.1c0 .39-.23.74-.56.9-.98.49-1.87 1.12-2.66 1.85-.18.18-.43.28-.7.28-.28 0-.53-.11-.71-.29L.29 13.08a.996.996 0 010-1.41C3.41 8.5 7.46 7 12 7s8.59 1.5 11.71 4.67c.39.39.39 1.02 0 1.41l-2.48 2.48c-.18.18-.43.29-.71.29-.27 0-.52-.11-.7-.28a11.27 11.27 0 00-2.67-1.85.996.996 0 01-.56-.9v-3.1C15.15 9.25 13.6 9 12 9z" />
        </svg>
      </button>
    </div>
  );
}
