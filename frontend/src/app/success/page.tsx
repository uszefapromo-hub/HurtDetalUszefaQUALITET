'use client';

import Link from 'next/link';
import { useEffect, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';

export default function SuccessPage() {
  const params = useSearchParams();
  const sessionId = useMemo(() => params.get('session_id') || '', [params]);

  useEffect(() => {
    try {
      localStorage.removeItem('qm_cart');
    } catch (_error) {}
  }, []);

  return (
    <div className="max-w-lg mx-auto px-4 py-16 text-center">
      <div className="w-20 h-20 rounded-full bg-green-400/20 flex items-center justify-center mx-auto mb-4 text-4xl">
        ✓
      </div>
      <h1 className="text-2xl font-black text-white mb-2">Dziękujemy za zakup!</h1>
      <p className="text-white/50 mb-6">Płatność została potwierdzona.</p>
      {sessionId ? (
        <p className="text-white/40 text-xs mb-6 break-all">ID sesji Stripe: {sessionId}</p>
      ) : null}
      <div className="flex items-center justify-center gap-3">
        <Link href="/stores" className="btn-primary inline-block px-6 py-3">Kontynuuj zakupy</Link>
        <Link href="/" className="btn-glass inline-block px-6 py-3">Start</Link>
      </div>
    </div>
  );
}
