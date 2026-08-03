'use client';

import React, { useEffect, useState } from 'react';
import { VideoQuality, QUALITY_PRESETS, UserMediaConfig } from '@/lib/types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentConfig: UserMediaConfig;
  onUpdateConfig: (newConfig: Partial<UserMediaConfig>) => void;
}

export default function SettingsModal({
  isOpen,
  onClose,
  currentConfig,
  onUpdateConfig,
}: SettingsModalProps) {
  const [cameras, setCameras] = useState<MediaDeviceInfo[]>([]);
  const [mics, setMics] = useState<MediaDeviceInfo[]>([]);

  useEffect(() => {
    if (!isOpen) return;
    navigator.mediaDevices.enumerateDevices().then((devices) => {
      setCameras(devices.filter((d) => d.kind === 'videoinput'));
      setMics(devices.filter((d) => d.kind === 'audioinput'));
    }).catch(console.warn);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <h3 className="font-semibold text-base text-zinc-100">Call Settings</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition cursor-pointer"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Max Resolution Options */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-zinc-300 block">Max Video Resolution</label>
          <div className="grid grid-cols-2 gap-2">
            {(Object.keys(QUALITY_PRESETS) as VideoQuality[]).map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => onUpdateConfig({ quality: q })}
                className={`py-2.5 px-3 rounded-xl border text-xs font-medium transition cursor-pointer flex flex-col items-center justify-center gap-0.5 ${
                  currentConfig.quality === q
                    ? 'bg-emerald-500/15 border-emerald-500 text-emerald-400'
                    : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                }`}
              >
                <span className="font-bold">{q}</span>
                <span className="text-[10px] opacity-70">
                  {QUALITY_PRESETS[q].width}x{QUALITY_PRESETS[q].height}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Camera Selector */}
        {cameras.length > 0 && (
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-300 block">Camera Input</label>
            <select
              value={currentConfig.videoDeviceId || ''}
              onChange={(e) => onUpdateConfig({ videoDeviceId: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-200 focus:outline-none focus:border-emerald-500 cursor-pointer"
            >
              {cameras.map((c, i) => (
                <option key={c.deviceId || i} value={c.deviceId}>
                  {c.label || `Camera ${i + 1}`}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Mic Selector */}
        {mics.length > 0 && (
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-300 block">Microphone Input</label>
            <select
              value={currentConfig.audioDeviceId || ''}
              onChange={(e) => onUpdateConfig({ audioDeviceId: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-200 focus:outline-none focus:border-emerald-500 cursor-pointer"
            >
              {mics.map((m, i) => (
                <option key={m.deviceId || i} value={m.deviceId}>
                  {m.label || `Microphone ${i + 1}`}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Done Button */}
        <button
          type="button"
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-100 font-semibold text-xs transition cursor-pointer border border-zinc-700"
        >
          Done
        </button>
      </div>
    </div>
  );
}
