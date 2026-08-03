import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'OpenLine — P2P Video & Audio Calls',
  description: 'Instant P2P video calls in your browser without registration or servers.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark h-full antialiased">
      <body className={`${inter.className} min-h-full bg-zinc-950 text-zinc-100 flex flex-col`}>
        {children}
      </body>
    </html>
  );
}
