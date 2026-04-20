'use client'

import { FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'
import { saveAiStore, setCurrentAiStore } from '@/lib/ai-store'
import type { AiStore } from '@/lib/ai-store'

type GeneratorResponse = {
  ok: boolean
  store?: AiStore
  error?: string
}

export default function AiStoreBuilderPage() {
  const router = useRouter()
  const [storeName, setStoreName] = useState('')
  const [category, setCategory] = useState('Elektronika')
  const [audience, setAudience] = useState('Młodzi dorośli 18-35')
  const [style, setStyle] = useState('Dark premium')
  const [marginPercent, setMarginPercent] = useState(35)
  const [autoImportProducts, setAutoImportProducts] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/.netlify/functions/ai-store-generator', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          storeName,
          category,
          audience,
          style,
          marginPercent,
          autoImportProducts,
        }),
      })

      const data = (await res.json()) as GeneratorResponse

      if (!res.ok || !data.ok || !data.store?.slug) {
        console.error('AI store creation failed response:', {
          status: res.status,
          data,
        })
        setError(data.error || 'Błąd tworzenia sklepu')
        return
      }

      saveAiStore(data.store)
      setCurrentAiStore(data.store.slug)
      router.push(`/launch/${data.store.slug}`)
    } catch (error) {
      console.error('AI store creation request failed:', error)
      setError('Wystąpił błąd połączenia. Spróbuj ponownie.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-black text-white mb-2">AI Otwiera Twój Sklep</h1>
        <p className="text-white/60">Wpisz dane, a system utworzy gotowy sklep dropshippingowy.</p>
      </div>

      <form onSubmit={onSubmit} className="glass-card p-5 space-y-4">
        <div>
          <label className="block text-sm text-white/70 mb-1">Nazwa sklepu</label>
          <input
            value={storeName}
            onChange={(e) => setStoreName(e.target.value)}
            required
            className="w-full rounded-xl bg-black/20 border border-white/10 px-3 py-2.5 text-white placeholder:text-white/30 outline-none focus:border-[#7c3aed]/70"
            placeholder="Np. Neon Trend Store"
          />
        </div>

        <div>
          <label className="block text-sm text-white/70 mb-1">Kategoria</label>
          <input
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full rounded-xl bg-black/20 border border-white/10 px-3 py-2.5 text-white placeholder:text-white/30 outline-none focus:border-[#7c3aed]/70"
          />
        </div>

        <div>
          <label className="block text-sm text-white/70 mb-1">Grupa docelowa</label>
          <input
            value={audience}
            onChange={(e) => setAudience(e.target.value)}
            className="w-full rounded-xl bg-black/20 border border-white/10 px-3 py-2.5 text-white placeholder:text-white/30 outline-none focus:border-[#7c3aed]/70"
          />
        </div>

        <div>
          <label className="block text-sm text-white/70 mb-1">Styl sklepu</label>
          <input
            value={style}
            onChange={(e) => setStyle(e.target.value)}
            className="w-full rounded-xl bg-black/20 border border-white/10 px-3 py-2.5 text-white placeholder:text-white/30 outline-none focus:border-[#7c3aed]/70"
          />
        </div>

        <div>
          <label className="block text-sm text-white/70 mb-1">Marża %</label>
          <input
            value={marginPercent}
            onChange={(e) => setMarginPercent(Number(e.target.value))}
            type="number"
            min={0}
            className="w-full rounded-xl bg-black/20 border border-white/10 px-3 py-2.5 text-white placeholder:text-white/30 outline-none focus:border-[#7c3aed]/70"
          />
        </div>

        <label className="flex items-center gap-2 text-white/80 text-sm">
          <input
            checked={autoImportProducts}
            onChange={(e) => setAutoImportProducts(e.target.checked)}
            type="checkbox"
            className="accent-[#7c3aed]"
          />
          Automatycznie importuj produkty
        </label>

        {error ? <p className="text-red-300 text-sm">{error}</p> : null}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl px-4 py-3 font-bold text-black bg-gradient-to-r from-[#00d4ff] to-[#7c3aed] hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? 'Generowanie sklepu...' : 'Generuj gotowy sklep'}
        </button>
      </form>
    </div>
  )
}
