'use client';

import React, { useState } from 'react';

interface CopyLinkButtonProps {
  url?: string;
  className?: string;
}

export default function CopyLinkButton({ url, className = '' }: CopyLinkButtonProps) {
  const [copied, setCopied] = useState(false);

  const getShareUrl = () => {
    if (url) return url;
    if (typeof window !== 'undefined') return window.location.href;
    return '';
  };

  const handleCopyOrShare = async () => {
    const shareUrl = getShareUrl();
    if (!shareUrl) return;

    // Try Web Share API on mobile if supported
    if (typeof navigator !== 'undefined' && navigator.share && /Mobi|Android/i.test(navigator.userAgent)) {
      try {
        await navigator.share({
          title: 'OpenLine P2P Call',
          text: 'Join my P2P video call on OpenLine',
          url: shareUrl,
        });
        return;
      } catch (err) {
        // User cancelled share or share failed; fallback to clipboard
        if ((err as Error).name === 'AbortError') return;
      }
    }

    // Fallback or desktop: Clipboard copy
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch {
        // Fallback for clipboard block
        prompt('Copy room link:', shareUrl);
      }
    }
  };

  return (
    <button
      onClick={handleCopyOrShare}
      type="button"
      className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 shadow-md active:scale-95 cursor-pointer ${
        copied
          ? 'bg-emerald-600 text-white shadow-emerald-900/30'
          : 'bg-zinc-800/90 hover:bg-zinc-700 text-zinc-100 border border-zinc-700/60 backdrop-blur-md'
      } ${className}`}
    >
      {copied ? (
        <>
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
          </svg>
          <span>Copied!</span>
        </>
      ) : (
        <>
          <svg className="w-4 h-4 text-zinc-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
            />
          </svg>
          <span>Copy link</span>
        </>
      )}
    </button>
  );
}
