'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { nanoid } from 'nanoid';

export default function HomePage() {
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);
  const [joinRoomId, setJoinRoomId] = useState('');

  const handleCreateCall = () => {
    setIsCreating(true);
    const roomId = nanoid(8);
    router.push(`/room/${roomId}`);
  };

  const handleJoinCall = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanId = joinRoomId.trim();
    if (cleanId) {
      router.push(`/room/${cleanId}`);
    }
  };

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col items-center justify-center relative p-6 overflow-hidden select-none">
      {/* Background Glow Accents */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-emerald-500/10 blur-[140px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/3 w-[400px] h-[400px] bg-teal-500/10 blur-[120px] rounded-full pointer-events-none" />

      {/* Main Content Container */}
      <div className="max-w-3xl w-full text-center space-y-10 z-10 my-auto">
        {/* Brand Tag */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-900/90 border border-zinc-800 text-xs font-medium text-emerald-400 shadow-xl backdrop-blur-md">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>OpenLine • Instant P2P WebRTC Video Call</span>
        </div>

        {/* Hero Title */}
        <div className="space-y-4">
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight bg-gradient-to-b from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent leading-tight">
            High Quality Video Calls <br />
            <span className="text-emerald-400">Without Accounts</span>
          </h1>
          <p className="text-base sm:text-lg text-zinc-400 max-w-xl mx-auto leading-relaxed">
            Direct peer-to-peer WebRTC calls up to <strong className="text-zinc-200 font-semibold">1080p Full HD</strong> with instant <strong className="text-zinc-200 font-semibold">screen sharing</strong> and zero sign-ups required.
          </p>
        </div>

        {/* Action Panel: Create or Join */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto">
          {/* Create Call Button */}
          <button
            onClick={handleCreateCall}
            disabled={isCreating}
            type="button"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 text-base font-bold text-zinc-950 bg-emerald-400 hover:bg-emerald-300 active:scale-95 rounded-2xl shadow-xl shadow-emerald-500/20 transition-all duration-150 cursor-pointer disabled:opacity-50"
          >
            {isCreating ? (
              <>
                <svg className="w-5 h-5 animate-spin text-zinc-950" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Creating Room...</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <span>New Call</span>
              </>
            )}
          </button>

          {/* Join Existing Room Form */}
          <form onSubmit={handleJoinCall} className="w-full sm:w-auto flex items-center gap-2">
            <input
              type="text"
              value={joinRoomId}
              onChange={(e) => setJoinRoomId(e.target.value)}
              placeholder="Enter Room Code"
              className="w-full sm:w-44 px-4 py-3.5 rounded-2xl bg-zinc-900 border border-zinc-800 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-500 transition"
            />
            <button
              type="submit"
              disabled={!joinRoomId.trim()}
              className="px-5 py-3.5 rounded-2xl bg-zinc-800 hover:bg-zinc-700 active:scale-95 text-zinc-100 font-semibold text-sm border border-zinc-700/80 transition cursor-pointer disabled:opacity-40"
            >
              Join
            </button>
          </form>
        </div>

        {/* Features Highlights Grid */}
        <div className="pt-10 grid grid-cols-1 sm:grid-cols-4 gap-4 text-left">
          <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 backdrop-blur-md space-y-1">
            <div className="text-emerald-400 font-bold text-sm flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <span>1080p HD Video</span>
            </div>
            <p className="text-zinc-400 text-xs leading-normal">
              Select resolution up to Full HD (1080p) or lower for saving bandwidth.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 backdrop-blur-md space-y-1">
            <div className="text-emerald-400 font-bold text-sm flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span>Screen Share</span>
            </div>
            <p className="text-zinc-400 text-xs leading-normal">
              Share your display, application window, or browser tab with 1 click.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 backdrop-blur-md space-y-1">
            <div className="text-emerald-400 font-bold text-sm flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              <span>Mobile Adapted</span>
            </div>
            <p className="text-zinc-400 text-xs leading-normal">
              Optimized touch interface, camera flip toggle, and picture-in-picture view.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 backdrop-blur-md space-y-1">
            <div className="text-emerald-400 font-bold text-sm flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <span>P2P Encrypted</span>
            </div>
            <p className="text-zinc-400 text-xs leading-normal">
              Direct peer connection without intermediary servers storing your media.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
