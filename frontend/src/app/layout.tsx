import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Header } from '@/components/layout/Header';
import { BottomNav } from '@/components/layout/BottomNav';

export const metadata: Metadata = {
  title: {
    default: 'QualitetMarket | Marketplace B2B/B2C',
    template: 'QualitetMarket | %s',
  },
  applicationName: 'QualitetMarket',
  description: 'QualitetMarket — marketplace B2B/B2C.',
  manifest: '/manifest.json',
};

export const viewport: Viewport = {
  themeColor: '#0a0a0f',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pl" className="dark">
      <body className="bg-[#0a0a0f] text-white min-h-screen font-sans">
        <Header />
        <main className="pb-24 min-h-screen">{children}</main>
        <BottomNav />
      </body>
    </html>
  );
}
