'use client'

import { Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { Bot, Send, Sparkles, Wrench, FileText, Megaphone, MessageCircleHeart, Tags, RadioTower, Store, BadgePercent, RefreshCw } from 'lucide-react'
import { api } from '@/lib/api'

type ToolKey =
  | 'chat'
  | 'product-description'
  | 'short-description'
  | 'cta'
  | 'seo-title'
  | 'social-post'
  | 'support-chat'
  | 'rewrite-supplier-description'
  | 'suggest-product-tags'
  | 'live-script'
  | 'repair-helper'
  | 'store-description'
  | 'generate-store'
  | 'marketing-pack'

type Message = {
  id: string
  role: 'user' | 'assistant'
  content: string
}

type Field = {
  name: string
  label: string
  type?: 'text' | 'textarea' | 'number' | 'select'
  placeholder?: string
  options?: string[]
}

const TOOL_CONFIG: Record<ToolKey, { label: string; icon: any; description: string; button: string; fields: Field[] }> = {
  chat: {
    label: 'Asystent AI',
    icon: Bot,
    description: 'Czat dla sprzedawcy, admina i operatora platformy.',
    button: 'Wyślij wiadomość',
    fields: [],
  },
  'product-description': {
    label: 'Opis produktu',
    icon: FileText,
    description: 'Długi opis sprzedażowy do karty produktu.',
    button: 'Generuj opis',
    fields: [
      { name: 'name', label: 'Nazwa produktu', placeholder: 'Np. Słuchawki bezprzewodowe Pro X' },
      { name: 'category', label: 'Kategoria', placeholder: 'Np. Audio / Elektronika' },
      { name: 'keywords', label: 'Słowa kluczowe', placeholder: 'np. ANC, Bluetooth 5.3, premium' },
      { name: 'language', label: 'Język', type: 'select', options: ['pl', 'en', 'de', 'fr'] },
    ],
  },
  'short-description': {
    label: 'Krótki opis',
    icon: Sparkles,
    description: 'Krótki opis do listingu, feedu i kafelka.',
    button: 'Skróć opis',
    fields: [
      { name: 'name', label: 'Nazwa produktu', placeholder: 'Np. Lampa LED Smart' },
      { name: 'category', label: 'Kategoria', placeholder: 'Np. Smart Home' },
      { name: 'description', label: 'Opis źródłowy', type: 'textarea', placeholder: 'Wklej aktualny opis produktu...' },
    ],
  },
  cta: {
    label: 'CTA',
    icon: BadgePercent,
    description: 'Wezwania do działania do przycisków i sekcji hero.',
    button: 'Generuj CTA',
    fields: [
      { name: 'name', label: 'Produkt', placeholder: 'Np. Smartwatch Active' },
      { name: 'audience', label: 'Grupa docelowa', placeholder: 'Np. aktywne osoby 25-40' },
      { name: 'tone', label: 'Ton', placeholder: 'Np. sprzedażowy, premium, dynamiczny' },
    ],
  },
  'seo-title': {
    label: 'SEO tytuł + meta',
    icon: Tags,
    description: 'Pakiet SEO do produktu i kampanii.',
    button: 'Generuj SEO',
    fields: [
      { name: 'name', label: 'Nazwa produktu', placeholder: 'Np. Kamera IP 4K' },
      { name: 'category', label: 'Kategoria', placeholder: 'Np. Monitoring' },
      { name: 'description', label: 'Opis źródłowy', type: 'textarea', placeholder: 'Dodaj opis lub specyfikację produktu...' },
    ],
  },
  'social-post': {
    label: 'Post social',
    icon: Megaphone,
    description: 'Hook, post i hashtagi do social media.',
    button: 'Generuj post',
    fields: [
      { name: 'product_name', label: 'Produkt', placeholder: 'Np. Słuchawki ANC' },
      { name: 'audience', label: 'Odbiorcy', placeholder: 'Np. młodzi profesjonaliści' },
      { name: 'platform', label: 'Platforma', type: 'select', options: ['instagram', 'facebook', 'tiktok', 'email', 'general'] },
      { name: 'tone', label: 'Ton', placeholder: 'Np. dynamiczny, premium' },
      { name: 'price', label: 'Cena', type: 'number', placeholder: '299' },
    ],
  },
  'support-chat': {
    label: 'Support klienta',
    icon: MessageCircleHeart,
    description: 'Odpowiedź dla klienta i podpowiedź statusu.',
    button: 'Generuj odpowiedź',
    fields: [
      { name: 'customer_message', label: 'Wiadomość klienta', type: 'textarea', placeholder: 'Klient pyta o status, zwrot, reklamację...' },
      { name: 'order_status', label: 'Status zamówienia', placeholder: 'Np. w przygotowaniu' },
      { name: 'context', label: 'Kontekst', type: 'textarea', placeholder: 'Np. brak jednej pozycji, przewoźnik opóźniony...' },
      { name: 'tone', label: 'Ton', placeholder: 'Np. empatyczny' },
    ],
  },
  'rewrite-supplier-description': {
    label: 'Czyszczenie opisu hurtowni',
    icon: RefreshCw,
    description: 'Porządkuje surowe opisy z feedów CSV/XML/API.',
    button: 'Wyczyść opis',
    fields: [
      { name: 'supplier_name', label: 'Hurtownia', placeholder: 'Np. BigBuy' },
      { name: 'name', label: 'Produkt', placeholder: 'Np. Krzesło gamingowe' },
      { name: 'category', label: 'Kategoria', placeholder: 'Np. Dom i ogród' },
      { name: 'raw_description', label: 'Surowy opis', type: 'textarea', placeholder: 'Wklej opis z hurtowni...' },
    ],
  },
  'suggest-product-tags': {
    label: 'Sugestie tagów',
    icon: Tags,
    description: 'Tagi do filtrowania, feedów i SEO.',
    button: 'Zaproponuj tagi',
    fields: [
      { name: 'name', label: 'Nazwa produktu', placeholder: 'Np. Projektor domowy 4K' },
      { name: 'category', label: 'Kategoria', placeholder: 'Np. RTV' },
      { name: 'description', label: 'Opis', type: 'textarea', placeholder: 'Dodaj opis produktu...' },
    ],
  },
  'live-script': {
    label: 'Skrypt live',
    icon: RadioTower,
    description: 'Skrypt do live commerce i transmisji sprzedażowej.',
    button: 'Generuj skrypt',
    fields: [
      { name: 'product_name', label: 'Produkt', placeholder: 'Np. Odkurzacz pionowy' },
      { name: 'audience', label: 'Odbiorcy', placeholder: 'Np. rodziny z dziećmi' },
      { name: 'angle', label: 'Kąt sprzedażowy', placeholder: 'Np. oszczędność czasu' },
      { name: 'duration_seconds', label: 'Długość (sekundy)', type: 'number', placeholder: '45' },
    ],
  },
  'repair-helper': {
    label: 'Pomoc naprawcza',
    icon: Wrench,
    description: 'Diagnoza brakujących importów, błędów akcji i problemów UI.',
    button: 'Przeanalizuj problem',
    fields: [
      { name: 'area', label: 'Obszar', placeholder: 'Np. frontend / seller / mobile / import hurtowni' },
      { name: 'symptoms', label: 'Objawy', type: 'textarea', placeholder: 'Opisz błąd i to co nie działa...' },
      { name: 'code_snippet', label: 'Fragment kodu', type: 'textarea', placeholder: 'Opcjonalnie wklej fragment kodu...' },
    ],
  },
  'store-description': {
    label: 'Opis sklepu',
    icon: Store,
    description: 'Opis marki lub sklepu dla marketplace.',
    button: 'Generuj opis sklepu',
    fields: [
      { name: 'store_name', label: 'Nazwa sklepu', placeholder: 'Np. TechZone Premium' },
      { name: 'category', label: 'Branża', placeholder: 'Np. elektronika' },
      { name: 'tone', label: 'Ton', type: 'select', options: ['profesjonalny', 'przyjazny', 'luksusowy', 'casualowy'] },
    ],
  },
  'generate-store': {
    label: 'Generator sklepu',
    icon: Store,
    description: 'Koncepcja sklepu z nazwą, sloganem i kategoriami.',
    button: 'Generuj sklep',
    fields: [
      { name: 'niche', label: 'Nisza', placeholder: 'Np. akcesoria dla home office' },
      { name: 'target_audience', label: 'Grupa docelowa', placeholder: 'Np. freelancerzy i małe firmy' },
      { name: 'style', label: 'Styl', type: 'select', options: ['nowoczesny', 'elegancki', 'minimalistyczny', 'kolorowy', 'profesjonalny'] },
    ],
  },
  'marketing-pack': {
    label: 'Pakiet marketingowy',
    icon: Megaphone,
    description: 'Post, e-mail, nagłówek i copy reklamowe.',
    button: 'Generuj pakiet',
    fields: [
      { name: 'product_name', label: 'Produkt', placeholder: 'Np. Kamera samochodowa' },
      { name: 'price', label: 'Cena', type: 'number', placeholder: '249' },
      { name: 'audience', label: 'Odbiorcy', placeholder: 'Np. kierowcy flotowi' },
      { name: 'platform', label: 'Platforma', placeholder: 'Np. general / facebook / email' },
    ],
  },
}

const TOOL_ORDER: ToolKey[] = [
  'chat',
  'product-description',
  'short-description',
  'cta',
  'seo-title',
  'social-post',
  'support-chat',
  'rewrite-supplier-description',
  'suggest-product-tags',
  'live-script',
  'repair-helper',
  'store-description',
  'generate-store',
  'marketing-pack',
]

const DEFAULT_VALUES: Record<ToolKey, Record<string, string>> = {
  chat: {},
  'product-description': { name: '', category: '', keywords: '', language: 'pl' },
  'short-description': { name: '', category: '', description: '' },
  cta: { name: '', audience: '', tone: 'sprzedażowy' },
  'seo-title': { name: '', category: '', description: '' },
  'social-post': { product_name: '', audience: '', platform: 'instagram', tone: 'dynamiczny', price: '' },
  'support-chat': { customer_message: '', order_status: '', context: '', tone: 'empatyczny' },
  'rewrite-supplier-description': { supplier_name: '', name: '', category: '', raw_description: '' },
  'suggest-product-tags': { name: '', category: '', description: '' },
  'live-script': { product_name: '', audience: '', angle: '', duration_seconds: '45' },
  'repair-helper': { area: '', symptoms: '', code_snippet: '' },
  'store-description': { store_name: '', category: '', tone: 'profesjonalny' },
  'generate-store': { niche: '', target_audience: '', style: 'nowoczesny' },
  'marketing-pack': { product_name: '', price: '', audience: '', platform: 'general' },
}

function stringifyResult(result: unknown) {
  if (typeof result === 'string') return result
  return JSON.stringify(result, null, 2)
}

function AICenterContent() {
  const searchParams = useSearchParams()
  const requestedTool = searchParams.get('tool') as ToolKey | null
  const [selectedTool, setSelectedTool] = useState<ToolKey>('chat')
  const [form, setForm] = useState<Record<string, string>>(DEFAULT_VALUES.chat)
  const [loading, setLoading] = useState(false)
  const [conversationId, setConversationId] = useState<string | undefined>()
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: 'Cześć — jestem centralnym asystentem AI Qualitet Market. Pomagam w opisach, supportcie, feedach hurtowni, live commerce i naprawach operacyjnych.',
    },
  ])
  const [result, setResult] = useState<string>('')
  const [error, setError] = useState<string>('')
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (requestedTool && TOOL_CONFIG[requestedTool]) {
      setSelectedTool(requestedTool)
      setForm(DEFAULT_VALUES[requestedTool])
      setResult('')
      setError('')
    }
  }, [requestedTool])

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, result])

  const currentConfig = TOOL_CONFIG[selectedTool]
  const currentFields = useMemo(() => currentConfig.fields, [currentConfig])

  function updateField(name: string, value: string) {
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  function resetForm(tool: ToolKey) {
    setForm(DEFAULT_VALUES[tool])
    setResult('')
    setError('')
  }

  async function submitTool() {
    setLoading(true)
    setError('')
    setResult('')

    try {
      let response: unknown = null
      switch (selectedTool) {
        case 'product-description':
          response = await api.ai.generateProductDescription(form)
          break
        case 'short-description':
          response = await api.ai.generateShortDescription(form)
          break
        case 'cta':
          response = await api.ai.generateCta(form)
          break
        case 'seo-title':
          response = await api.ai.generateSeoTitle(form)
          break
        case 'social-post':
          response = await api.ai.generateSocialPost({ ...form, price: form.price ? Number(form.price) : null })
          break
        case 'support-chat':
          response = await api.ai.supportChat(form)
          break
        case 'rewrite-supplier-description':
          response = await api.ai.rewriteSupplierDescription(form)
          break
        case 'suggest-product-tags':
          response = await api.ai.suggestProductTags(form)
          break
        case 'live-script':
          response = await api.ai.generateLiveScript({ ...form, duration_seconds: form.duration_seconds ? Number(form.duration_seconds) : 45 })
          break
        case 'repair-helper':
          response = await api.ai.repairHelper(form)
          break
        case 'store-description':
          response = await api.ai.generateStoreDescription(form)
          break
        case 'generate-store':
          response = await api.ai.generateStore(form)
          break
        case 'marketing-pack':
          response = await api.ai.generateMarketingPack({ ...form, price: form.price ? Number(form.price) : null })
          break
        default:
          return
      }
      setResult(stringifyResult(response))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Nie udało się wygenerować treści.')
    } finally {
      setLoading(false)
    }
  }

  async function sendChat() {
    const message = form.message?.trim()
    if (!message) return

    const userMessage: Message = { id: `${Date.now()}`, role: 'user', content: message }
    setMessages((prev) => [...prev, userMessage])
    setForm({ message: '' })
    setLoading(true)
    setError('')

    try {
      const response = await api.ai.chat({
        message,
        conversation_id: conversationId,
        context_type: 'general',
      }) as { conversationId?: string; message?: { content?: string } }

      if (response?.conversationId) setConversationId(response.conversationId)
      setMessages((prev) => [
        ...prev,
        {
          id: `${Date.now()}-assistant`,
          role: 'assistant',
          content: response?.message?.content || 'Brak odpowiedzi od AI.',
        },
      ])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Nie udało się wysłać wiadomości.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 grid gap-6 lg:grid-cols-[280px_1fr]">
      <aside className="glass-card p-4 h-fit">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#7c3aed] to-[#00d4ff] flex items-center justify-center">
            <Bot size={22} className="text-white" />
          </div>
          <div>
            <h1 className="text-white font-black text-xl">Panel AI</h1>
            <p className="text-[#00d4ff] text-xs">Centralny system AI platformy</p>
          </div>
        </div>
        <div className="space-y-2 max-h-[70vh] overflow-y-auto pr-1">
          {TOOL_ORDER.map((toolKey) => {
            const tool = TOOL_CONFIG[toolKey]
            const Icon = tool.icon
            const active = selectedTool === toolKey
            return (
              <button
                key={toolKey}
                onClick={() => {
                  setSelectedTool(toolKey)
                  resetForm(toolKey)
                }}
                className={`w-full text-left rounded-2xl border px-3 py-3 transition-all ${active ? 'border-[#00d4ff]/40 bg-[#00d4ff]/10' : 'border-white/10 bg-white/5 hover:bg-white/10'}`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl ${active ? 'bg-[#00d4ff]/20 text-[#00d4ff]' : 'bg-white/10 text-white/60'}`}>
                    <Icon size={16} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{tool.label}</p>
                    <p className="text-xs text-white/40">{tool.description}</p>
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </aside>

      <section className="space-y-4">
        <div className="glass-card p-5 border border-white/10">
          <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
            <div>
              <h2 className="text-2xl font-black text-white">{currentConfig.label}</h2>
              <p className="text-white/50">{currentConfig.description}</p>
            </div>
            {selectedTool !== 'chat' ? (
              <button onClick={() => resetForm(selectedTool)} className="px-4 py-2 rounded-xl border border-white/10 text-white/60 hover:text-white hover:bg-white/10 transition-all">
                Wyczyść formularz
              </button>
            ) : null}
          </div>

          {selectedTool === 'chat' ? (
            <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
              <div className="glass-card p-4 min-h-[480px] flex flex-col">
                <div className="flex-1 space-y-4 overflow-y-auto pr-1">
                  {messages.map((message) => (
                    <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${message.role === 'user' ? 'bg-gradient-to-br from-[#00d4ff] to-[#7c3aed] text-white rounded-tr-sm' : 'bg-white/5 text-white/80 rounded-tl-sm border border-white/10'}`}>
                        {message.content}
                      </div>
                    </div>
                  ))}
                  {loading ? <div className="text-white/50 text-sm">AI analizuje wiadomość…</div> : null}
                  <div ref={endRef} />
                </div>
                <div className="mt-4 flex gap-2">
                  <div className="flex-1 glass-card flex items-center gap-2 px-3 py-2.5 border border-white/10">
                    <input
                      value={form.message || ''}
                      onChange={(event) => updateField('message', event.target.value)}
                      onKeyDown={(event) => event.key === 'Enter' && sendChat()}
                      placeholder="Zadaj pytanie o produkt, support, sklep lub feed hurtowni…"
                      className="bg-transparent text-white placeholder:text-white/30 outline-none flex-1 text-sm"
                    />
                  </div>
                  <button onClick={sendChat} disabled={loading || !(form.message || '').trim()} className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#00d4ff] to-[#7c3aed] flex items-center justify-center disabled:opacity-50">
                    <Send size={16} className="text-white" />
                  </button>
                </div>
              </div>
              <div className="space-y-3">
                <div className="glass-card p-4 border border-[#7c3aed]/20 bg-[#7c3aed]/5">
                  <p className="text-[#c4b5fd] text-xs font-semibold mb-2">Szybkie zastosowania</p>
                  <ul className="text-sm text-white/70 space-y-2 list-disc pl-5">
                    <li>opisy produktów i SEO</li>
                    <li>odpowiedzi dla supportu</li>
                    <li>czyszczenie opisów hurtowni</li>
                    <li>diagnostyka problemów UI i integracji</li>
                  </ul>
                </div>
                <div className="glass-card p-4 border border-[#00d4ff]/20">
                  <p className="text-[#00d4ff] text-xs font-semibold mb-2">Podpowiedź</p>
                  <p className="text-sm text-white/70">Jeśli nie masz klucza AI w backendzie, system przejdzie w tryb lokalny i zwróci wersję roboczą odpowiedzi testowej.</p>
                </div>
                {error ? <div className="rounded-2xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-200">{error}</div> : null}
              </div>
            </div>
          ) : (
            <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
              <div className="space-y-4">
                {currentFields.map((field) => (
                  <label key={field.name} className="block">
                    <span className="block text-sm text-white/70 mb-2">{field.label}</span>
                    {field.type === 'textarea' ? (
                      <textarea
                        value={form[field.name] || ''}
                        onChange={(event) => updateField(field.name, event.target.value)}
                        placeholder={field.placeholder}
                        rows={field.name === 'code_snippet' ? 8 : 5}
                        className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/25 outline-none focus:border-[#00d4ff]/40"
                      />
                    ) : field.type === 'select' ? (
                      <select
                        value={form[field.name] || field.options?.[0] || ''}
                        onChange={(event) => updateField(field.name, event.target.value)}
                        className="w-full rounded-2xl border border-white/10 bg-[#0f0f1a] px-4 py-3 text-sm text-white outline-none focus:border-[#00d4ff]/40"
                      >
                        {(field.options || []).map((option) => (
                          <option key={option} value={option}>{option}</option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type={field.type === 'number' ? 'number' : 'text'}
                        value={form[field.name] || ''}
                        onChange={(event) => updateField(field.name, event.target.value)}
                        placeholder={field.placeholder}
                        className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/25 outline-none focus:border-[#00d4ff]/40"
                      />
                    )}
                  </label>
                ))}
                <div className="flex flex-wrap gap-3">
                  <button onClick={submitTool} disabled={loading} className="px-5 py-3 rounded-2xl bg-gradient-to-br from-[#00d4ff] to-[#7c3aed] text-white font-semibold disabled:opacity-50">
                    {loading ? 'Generowanie…' : currentConfig.button}
                  </button>
                  <button onClick={() => resetForm(selectedTool)} className="px-5 py-3 rounded-2xl border border-white/10 text-white/70 hover:text-white hover:bg-white/10 transition-all">
                    Wyczyść dane
                  </button>
                </div>
                {error ? <div className="rounded-2xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-200">{error}</div> : null}
              </div>

              <div className="space-y-4">
                <div className="glass-card p-4 border border-[#7c3aed]/20 bg-[#7c3aed]/5">
                  <p className="text-[#c4b5fd] text-xs font-semibold mb-2">Dobre użycie</p>
                  <p className="text-sm text-white/70">Wypełnij tylko te pola, które naprawdę masz. AI zostało ustawione tak, by nie wymyślało brakujących parametrów technicznych.</p>
                </div>
                <div className="glass-card p-4 min-h-[320px]">
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles size={16} className="text-[#00d4ff]" />
                    <p className="text-white font-semibold">Wynik</p>
                  </div>
                  {result ? (
                    <pre className="whitespace-pre-wrap break-words text-sm text-white/80 font-mono">{result}</pre>
                  ) : (
                    <p className="text-sm text-white/40">Tutaj pojawi się wygenerowana odpowiedź, JSON lub propozycja naprawy.</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

export default function AICenterPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-6xl mx-auto px-4 py-10">
          <div className="glass-card p-6 border border-white/10 text-white/70">
            Ładowanie panelu AI…
          </div>
        </div>
      }
    >
      <AICenterContent />
    </Suspense>
  )
}
