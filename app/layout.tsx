import type { Metadata, Viewport } from 'next';
import { Inter, Outfit } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const outfit = Outfit({ subsets: ['latin'], variable: '--font-outfit' });

export const metadata: Metadata = {
  title: 'OpenLine — Instant P2P Video Calls',
  description: 'Private, peer-to-peer browser video calls up to 1080p with screen sharing, no accounts required.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#09090b',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`dark h-full antialiased ${inter.variable} ${outfit.variable}`}>
      <body className={`${inter.className} min-h-full bg-zinc-950 text-zinc-100 flex flex-col font-sans`}>
        {children}
      </body>
    </html>
  );
}
