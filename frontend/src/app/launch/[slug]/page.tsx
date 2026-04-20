'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { getAiStoreBySlug } from '@/lib/ai-store'
import type { AiStore } from '@/lib/ai-store'

export default function LaunchStorePage() {
  const params = useParams<{ slug: string }>()
  const slug = params?.slug || ''
  const [store, setStore] = useState<AiStore | null>(null)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    if (!slug) {
      setLoaded(true)
      return
    }

    setStore(getAiStoreBySlug(slug))
    setLoaded(true)
  }, [slug])

  if (!loaded) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <p className="text-white/70">Ładowanie sklepu...</p>
      </div>
    )
  }

  if (!store) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="glass-card p-6 text-center">
          <h1 className="text-2xl font-black text-white mb-2">Sklep nie został znaleziony</h1>
          <p className="text-white/60 mb-5">Nie znaleziono sklepu w localStorage. Utwórz go ponownie.</p>
          <Link href="/ai" className="inline-flex rounded-xl px-4 py-2.5 bg-[#7c3aed] text-white font-semibold hover:opacity-90">
            Wróć do /ai
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <section className="glass-card p-6 mb-6 border border-[#7c3aed]/30" style={{ backgroundColor: store.colors.background }}>
        <p className="text-sm uppercase tracking-wider text-[#00d4ff] mb-2">{store.brandName}</p>
        <h1 className="text-3xl md:text-4xl font-black text-white mb-2">{store.headline}</h1>
        <p className="text-white/70 max-w-3xl">{store.subheadline}</p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-black text-white mb-4">Produkty startowe</h2>
        {store.products.length === 0 ? (
          <div className="glass-card p-4 text-white/70">Brak produktów. Wygeneruj sklep z automatycznym importem produktów.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {store.products.map((product) => (
              <article key={product.id} className="glass-card overflow-hidden border border-white/10">
                <img src={product.image} alt={product.name} className="w-full h-44 object-cover" />
                <div className="p-4">
                  <p className="text-xs text-[#00d4ff] mb-1">{product.category}</p>
                  <h3 className="text-white font-semibold mb-2">{product.name}</h3>
                  <p className="text-[#c4b5fd] text-lg font-bold mb-2">{product.storePrice.toFixed(2)} zł</p>
                  <p className="text-white/55 text-xs">Cena bazowa platformy: {product.basePrice.toFixed(2)} zł</p>
                  <p className="text-white/55 text-xs">Dostawca: {product.supplierName}</p>
                  <p className="text-white/55 text-xs">Wysyłka: {product.supplierShipping}</p>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-black text-white mb-4">Informacje</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="glass-card p-4 border border-[#00d4ff]/20">
            <h3 className="text-white font-semibold mb-1">Automatyczna marża</h3>
            <p className="text-white/65 text-sm">Twoja marża jest naliczana automatycznie.</p>
          </div>
          <div className="glass-card p-4 border border-[#7c3aed]/25">
            <h3 className="text-white font-semibold mb-1">Centralny feed</h3>
            <p className="text-white/65 text-sm">Ceny bazowe pochodzą z centralnego feedu QualitetMarket.</p>
          </div>
          <div className="glass-card p-4 border border-[#00d4ff]/20">
            <h3 className="text-white font-semibold mb-1">Realizacja dostawy</h3>
            <p className="text-white/65 text-sm">Wysyłka jest realizowana przez dostawcę.</p>
          </div>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-black text-white mb-4">FAQ</h2>
        <div className="space-y-3">
          {store.faq.map((item) => (
            <div key={item.q} className="glass-card p-4 border border-white/10">
              <h3 className="text-white font-semibold mb-1">{item.q}</h3>
              <p className="text-white/70 text-sm">{item.a}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="glass-card p-5 mb-6 border border-[#7c3aed]/30">
        <h2 className="text-2xl font-black text-white mb-4">Polityka sklepu</h2>
        <p className="text-white/80 mb-2">
          <span className="text-[#00d4ff]">Dostawa:</span> {store.policy.shipping}
        </p>
        <p className="text-white/80">
          <span className="text-[#00d4ff]">Zwroty:</span> {store.policy.returns}
        </p>
      </section>

      <Link
        href="/seller"
        className="inline-flex rounded-xl px-5 py-3 font-bold text-black bg-gradient-to-r from-[#00d4ff] to-[#7c3aed] hover:opacity-90"
      >
        Otwórz mój panel
      </Link>
    </div>
  )
}
