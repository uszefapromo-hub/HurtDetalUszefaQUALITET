import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Generator sklepu',
};

export default function AiLayout({ children }: { children: React.ReactNode }) {
  return children;
}
