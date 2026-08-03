'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { nanoid } from 'nanoid';

export default function HomePage() {
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateCall = () => {
    setIsCreating(true);
    // Generate an 8-character clean room ID
    const roomId = nanoid(8);
    router.push(`/room/${roomId}`);
  };

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col items-center justify-center relative p-6 overflow-hidden">
      {/* Background Glow Accents */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/3 w-80 h-80 bg-teal-500/10 blur-[100px] rounded-full pointer-events-none" />

      {/* Main Container */}
      <div className="max-w-2xl w-full text-center space-y-8 z-10">
        {/* Brand Tag */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-zinc-900 border border-zinc-800 text-xs font-medium text-emerald-400">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>OpenLine MVP • P2P WebRTC Call</span>
        </div>

        {/* Hero Title */}
        <div className="space-y-4">
          <h1 className="text-4xl sm:text-6xl font-bold tracking-tight bg-gradient-to-b from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
            Video Calls Without Boundaries or Accounts
          </h1>
          <p className="text-base sm:text-lg text-zinc-400 max-w-lg mx-auto leading-relaxed">
            Create a room in one click, share the link with your peer, and communicate directly via P2P WebRTC.
          </p>
        </div>

        {/* Call Creation Button */}
        <div className="pt-4 flex flex-col items-center gap-4">
          <button
            onClick={handleCreateCall}
            disabled={isCreating}
            type="button"
            className="group relative inline-flex items-center justify-center gap-3 px-8 py-4 text-base font-semibold text-zinc-950 bg-emerald-400 hover:bg-emerald-300 active:scale-95 rounded-2xl shadow-xl shadow-emerald-500/20 transition-all duration-200 cursor-pointer disabled:opacity-50"
          >
            {isCreating ? (
              <>
                <svg className="w-5 h-5 animate-spin text-zinc-950" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Creating room...</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5 transition-transform group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <span>Create Call</span>
              </>
            )}
          </button>
        </div>

        {/* Feature Cards Grid */}
        <div className="pt-12 grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
          <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800/80 backdrop-blur-xs">
            <div className="text-emerald-400 font-semibold text-sm mb-1">No Sign-up</div>
            <div className="text-zinc-400 text-xs leading-normal">
              No registration, emails, or passwords required. Everything is instant.
            </div>
          </div>

          <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800/80 backdrop-blur-xs">
            <div className="text-emerald-400 font-semibold text-sm mb-1">P2P Media Stream</div>
            <div className="text-zinc-400 text-xs leading-normal">
              Direct peer-to-peer browser connection powered by WebRTC.
            </div>
          </div>

          <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800/80 backdrop-blur-xs">
            <div className="text-emerald-400 font-semibold text-sm mb-1">Cross-Platform</div>
            <div className="text-zinc-400 text-xs leading-normal">
              Works seamlessly in modern desktop and mobile web browsers.
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
