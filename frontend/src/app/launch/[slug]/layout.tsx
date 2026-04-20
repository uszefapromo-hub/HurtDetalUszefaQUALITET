import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Storefront Launch',
};

export default function LaunchSlugLayout({ children }: { children: React.ReactNode }) {
  return children;
}
