'use client';

import React, { useState, useRef, useEffect } from 'react';

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
  onCopyLink?: () => void;
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
  onCopyLink,
  onHangUp,
}: CallControlsProps) {
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const moreMenuRef = useRef<HTMLDivElement | null>(null);
  const moreButtonRef = useRef<HTMLButtonElement | null>(null);

  // Close popover on click outside or Escape
  useEffect(() => {
    const handlePointerDown = (e: MouseEvent | TouchEvent) => {
      if (
        isMoreOpen &&
        moreMenuRef.current &&
        !moreMenuRef.current.contains(e.target as Node) &&
        moreButtonRef.current &&
        !moreButtonRef.current.contains(e.target as Node)
      ) {
        setIsMoreOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMoreOpen) {
        setIsMoreOpen(false);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('touchstart', handlePointerDown);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('touchstart', handlePointerDown);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isMoreOpen]);

  return (
    <div className="relative flex flex-col items-center">
      {/* "More Options" Popover Menu */}
      {isMoreOpen && (
        <div
          ref={moreMenuRef}
          role="menu"
          aria-orientation="vertical"
          className="absolute bottom-full mb-3 z-50 w-60 p-1.5 rounded-2xl bg-zinc-900/95 backdrop-blur-2xl border border-zinc-800/90 shadow-2xl shadow-black/80 animate-popoverIn origin-bottom space-y-1 select-none"
        >
          {/* Screen Share Toggle */}
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              onToggleScreenShare();
              setIsMoreOpen(false);
            }}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-colors cursor-pointer active:scale-98 ${
              isScreenSharing
                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
                : 'text-zinc-200 hover:bg-zinc-800/80'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <svg className="w-4 h-4 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span>{isScreenSharing ? 'Stop Sharing' : 'Share Screen'}</span>
            </div>
            <kbd className="px-1.5 py-0.5 text-[10px] font-mono text-zinc-500 bg-zinc-950/80 rounded border border-zinc-800">
              S
            </kbd>
          </button>

          {/* Picture-in-Picture */}
          {onTogglePiP && (
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                onTogglePiP();
                setIsMoreOpen(false);
              }}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium text-zinc-200 hover:bg-zinc-800/80 transition-colors cursor-pointer active:scale-98"
            >
              <div className="flex items-center gap-2.5">
                <svg className="w-4 h-4 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                <span>Picture-in-Picture</span>
              </div>
            </button>
          )}

          {/* Mobile Flip Camera */}
          {isMobileDevice && onFlipCamera && (
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                onFlipCamera();
                setIsMoreOpen(false);
              }}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium text-zinc-200 hover:bg-zinc-800/80 transition-colors cursor-pointer active:scale-98"
            >
              <div className="flex items-center gap-2.5">
                <svg className="w-4 h-4 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>Flip Camera</span>
              </div>
            </button>
          )}

          {/* Copy Room Link */}
          {onCopyLink && (
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                onCopyLink();
                setIsMoreOpen(false);
              }}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium text-zinc-200 hover:bg-zinc-800/80 transition-colors cursor-pointer active:scale-98"
            >
              <div className="flex items-center gap-2.5">
                <svg className="w-4 h-4 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <span>Copy Room Link</span>
              </div>
            </button>
          )}

          {/* Settings & Resolution */}
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              onOpenSettings();
              setIsMoreOpen(false);
            }}
            className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium text-zinc-200 hover:bg-zinc-800/80 transition-colors cursor-pointer active:scale-98 border-t border-zinc-800/60 pt-2.5"
          >
            <div className="flex items-center gap-2.5">
              <svg className="w-4 h-4 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>Settings & Quality</span>
            </div>
          </button>
        </div>
      )}

      {/* Main Floating Minimalistic Dock */}
      <div className="flex items-center gap-1.5 sm:gap-2 p-1.5 sm:p-2 bg-zinc-900/85 backdrop-blur-2xl border border-zinc-800/90 rounded-full shadow-2xl shadow-black/60 pb-[calc(0.5rem+env(safe-area-inset-bottom,0))]">
        {/* 1. Microphone Button */}
        <button
          onClick={onToggleAudio}
          type="button"
          aria-label={isAudioMuted ? 'Unmute microphone' : 'Mute microphone'}
          title={isAudioMuted ? 'Unmute microphone (M)' : 'Mute microphone (M)'}
          className={`relative w-11 h-11 sm:w-12 sm:h-12 rounded-full transition-all duration-150 cursor-pointer active:scale-95 flex items-center justify-center ${
            isAudioMuted
              ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30 hover:bg-rose-500/25'
              : 'bg-zinc-800/80 text-zinc-100 border border-zinc-700/60 hover:bg-zinc-700/80'
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

        {/* 2. Video Camera Button */}
        <button
          onClick={onToggleVideo}
          type="button"
          aria-label={isVideoMuted ? 'Turn camera on' : 'Turn camera off'}
          title={isVideoMuted ? 'Turn camera on (V)' : 'Turn camera off (V)'}
          className={`relative w-11 h-11 sm:w-12 sm:h-12 rounded-full transition-all duration-150 cursor-pointer active:scale-95 flex items-center justify-center ${
            isVideoMuted
              ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30 hover:bg-rose-500/25'
              : 'bg-zinc-800/80 text-zinc-100 border border-zinc-700/60 hover:bg-zinc-700/80'
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

        {/* 3. In-Call Chat Button */}
        <button
          onClick={onToggleChat}
          type="button"
          aria-label="In-call chat"
          title="In-call Chat (C)"
          className="relative w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-zinc-800/80 hover:bg-zinc-700/80 text-zinc-100 border border-zinc-700/60 transition-all duration-150 cursor-pointer active:scale-95 flex items-center justify-center"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          {unreadChatCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-emerald-500 text-zinc-950 font-bold text-[10px] flex items-center justify-center border-2 border-zinc-900 shadow-sm animate-pulse">
              {unreadChatCount}
            </span>
          )}
        </button>

        {/* 4. "More" / Options Button */}
        <button
          ref={moreButtonRef}
          onClick={() => setIsMoreOpen((prev) => !prev)}
          type="button"
          aria-label="More call options"
          aria-expanded={isMoreOpen}
          aria-haspopup="true"
          title="More options"
          className={`w-11 h-11 sm:w-12 sm:h-12 rounded-full border transition-all duration-150 cursor-pointer active:scale-95 flex items-center justify-center ${
            isMoreOpen || isScreenSharing
              ? 'bg-zinc-700 text-white border-zinc-600 shadow-inner'
              : 'bg-zinc-800/80 hover:bg-zinc-700/80 text-zinc-100 border-zinc-700/60'
          }`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
          </svg>
        </button>

        {/* Separator */}
        <div className="w-[1px] h-6 bg-zinc-800 mx-0.5" />

        {/* 5. Hang Up / End Call (Red Danger Button) */}
        <button
          onClick={onHangUp}
          type="button"
          aria-label="End call"
          title="End call (E)"
          className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-950/50 transition-all duration-150 active:scale-95 cursor-pointer flex items-center justify-center"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 9c-1.6 0-3.15.25-4.6.72v3.1c0 .39-.23.74-.56.9-.98.49-1.87 1.12-2.66 1.85-.18.18-.43.28-.7.28-.28 0-.53-.11-.71-.29L.29 13.08a.996.996 0 010-1.41C3.41 8.5 7.46 7 12 7s8.59 1.5 11.71 4.67c.39.39.39 1.02 0 1.41l-2.48 2.48c-.18.18-.43.29-.71.29-.27 0-.52-.11-.7-.28a11.27 11.27 0 00-2.67-1.85.996.996 0 01-.56-.9v-3.1C15.15 9.25 13.6 9 12 9z" />
          </svg>
        </button>
      </div>
    </div>
  );
}
