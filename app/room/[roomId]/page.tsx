import React from 'react';
import VideoCall from '@/components/VideoCall';

interface RoomPageProps {
  params: Promise<{
    roomId: string;
  }>;
  searchParams: Promise<{
    mode?: string;
  }>;
}

export default async function RoomPage({ params, searchParams }: RoomPageProps) {
  const { roomId } = await params;
  const { mode } = (await searchParams) || {};
  const initialMode = mode === 'audio' ? 'audio' : 'video';

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col justify-between p-2 md:p-6">
      <VideoCall roomId={roomId} initialMode={initialMode} />
    </main>
  );
}
