'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, Package, ShoppingBag, Zap, Plus, Eye, Star, Bell, Bot, MessageSquareText, Sparkles, Link2, Download, CheckCircle2 } from 'lucide-react'
import { StatCard } from '@/components/ui/StatCard'
import { api } from '@/lib/api'
import { formatCurrency } from '@/lib/utils'

const RECENT_ORDERS = [
  { id: 'QM-001', product: 'Słuchawki bezprzewodowe', amount: 239.2, status: 'opłacone', time: '5 min temu' },
  { id: 'QM-002', product: 'Inteligentna lampa LED', amount: 89, status: 'wysyłka', time: '1 godz. temu' },
  { id: 'QM-003', product: 'Uchwyt do telefonu', amount: 49, status: 'dostarczone', time: '2 godz. temu' },
]

const AI_ACTIONS = [
  { href: '/ai?tool=product-description', icon: Sparkles, label: 'Generuj opis' },
  { href: '/ai?tool=social-post', icon: Bot, label: 'Post social' },
  { href: '/ai?tool=support-chat', icon: MessageSquareText, label: 'Odpowiedź support' },
]

export default function SellerDashboard() {
  const [aiTip] = useState('Kategoria audio rośnie. Dodaj warianty premium, skrócone opisy i CTA do kampanii remarketingowej.')
  const [supplierName, setSupplierName] = useState('')
  const [sourceUrl, setSourceUrl] = useState('')
  const [authValue, setAuthValue] = useState('')
  const [isSavingSupplier, setIsSavingSupplier] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [importedProductsCount, setImportedProductsCount] = useState(0)
  const [supplierStatus, setSupplierStatus] = useState<string | null>(null)
  const [supplierError, setSupplierError] = useState<string | null>(null)

  useEffect(() => {
    const loadSupplier = async () => {
      try {
        const configRes = await api.seller.supplier.get()
        const supplier = configRes?.supplier as
          | {
              supplierName?: string
              sourceUrl?: string
              authMasked?: string
              authConfigured?: boolean
            }
          | undefined
          | null

        if (supplier) {
          setSupplierName(supplier.supplierName || '')
          setSourceUrl(supplier.sourceUrl || '')
          setAuthValue('')
          setSupplierStatus(supplier.supplierName ? `Connected: ${supplier.supplierName}` : null)
        }

        const productsRes = await api.seller.supplier.listImportedProducts()
        setImportedProductsCount(Array.isArray(productsRes?.products) ? productsRes.products.length : 0)
      } catch {
        setSupplierError('Unable to load supplier settings')
      }
    }

    loadSupplier()
  }, [])

  const handleSaveSupplier = async () => {
    setSupplierError(null)
    setSupplierStatus(null)
    setIsSavingSupplier(true)

    try {
      const response = await api.seller.supplier.save({
        supplierName,
        sourceUrl,
        authValue,
      })
      const supplier = (response as { supplier?: { supplierName?: string } })?.supplier
      setSupplierStatus(supplier?.supplierName ? `Connected: ${supplier.supplierName}` : 'Supplier config saved')
      setAuthValue('')
    } catch (error) {
      setSupplierError(error instanceof Error ? error.message : 'Unable to save supplier config')
    } finally {
      setIsSavingSupplier(false)
    }
  }

  const handleImportProducts = async () => {
    setSupplierError(null)
    setIsImporting(true)

    try {
      const response = await api.seller.supplier.importProducts()
      const payload = response as { importedCount?: number; totalProducts?: number }
      setImportedProductsCount(payload.totalProducts || 0)
      setSupplierStatus(`Imported ${payload.importedCount || 0} products`)
    } catch (error) {
      setSupplierError(error instanceof Error ? error.message : 'Unable to import products')
    } finally {
      setIsImporting(false)
    }
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-4">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-white">Panel sprzedawcy</h1>
            <p className="text-white/40 text-sm">Dzisiejszy przegląd sklepu</p>
          </div>
          <button className="glass-card p-2 rounded-xl relative">
            <Bell size={20} className="text-white/60" />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#00d4ff] text-black text-xs rounded-full flex items-center justify-center font-bold">3</span>
          </button>
        </div>
      </motion.div>

      <div className="grid grid-cols-2 gap-3 mb-6">
        <StatCard title="Przychód dziś" value={formatCurrency(1247.8)} change="12% vs wczoraj" changePositive={true} icon={TrendingUp} color="cyan" />
        <StatCard title="Zamówienia" value="23" change="5 nowych" changePositive={true} icon={ShoppingBag} color="violet" />
        <StatCard title="Produkty" value="156" change="3 z niskim stanem" changePositive={false} icon={Package} color="pink" />
        <StatCard title="Śr. ocena" value="4.8 ★" change="+0,1" changePositive={true} icon={Star} color="cyan" />
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-4 mb-4 border border-[#7c3aed]/30 bg-[#7c3aed]/5">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-[#7c3aed]/20"><Zap size={18} className="text-[#7c3aed]" /></div>
          <div>
            <p className="text-[#c4b5fd] text-xs font-semibold mb-1">Rekomendacja AI</p>
            <p className="text-white/70 text-sm">{aiTip}</p>
          </div>
        </div>
      </motion.div>

      <div className="glass-card p-4 mb-6 border border-[#00d4ff]/20">
        <div className="flex items-center justify-between gap-3 mb-3">
          <div>
            <h2 className="text-white font-semibold">Szybkie akcje AI</h2>
            <p className="text-white/40 text-sm">Twórz opisy, treści sprzedażowe i odpowiedzi dla klientów.</p>
          </div>
          <Link href="/ai" className="text-[#00d4ff] text-sm font-medium">Otwórz Studio AI</Link>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {AI_ACTIONS.map(({ href, icon: Icon, label }) => (
            <Link key={label} href={href} className="glass-card p-3 flex flex-col items-center gap-2 text-center hover:bg-white/10 transition-all">
              <Icon size={20} className="text-[#00d4ff]" />
              <span className="text-white text-xs font-medium">{label}</span>
            </Link>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { icon: Plus, label: 'Dodaj produkt', color: 'bg-[#00d4ff]/20 text-[#00d4ff]' },
          { icon: Zap, label: 'Promuj', color: 'bg-[#7c3aed]/20 text-[#7c3aed]' },
          { icon: Eye, label: 'Analityka', color: 'bg-[#f059da]/20 text-[#f059da]' },
        ].map(({ icon: Icon, label, color }) => (
          <motion.button key={label} whileTap={{ scale: 0.9 }} className={`glass-card p-4 flex flex-col items-center gap-2 ${color}`}>
            <Icon size={22} />
            <span className="text-white text-xs font-medium">{label}</span>
          </motion.button>
        ))}
      </div>

      <div className="glass-card p-4 mb-6 border border-[#00d4ff]/30 bg-[#00d4ff]/5">
        <div className="flex items-center gap-2 mb-1">
          <Link2 size={17} className="text-[#00d4ff]" />
          <h2 className="text-white font-semibold">Connect Supplier</h2>
        </div>
        <p className="text-white/50 text-sm mb-4">Connect one supplier feed per seller and import products into your store.</p>

        <div className="space-y-3">
          <input
            value={supplierName}
            onChange={(e) => setSupplierName(e.target.value)}
            placeholder="Supplier name"
            className="w-full rounded-xl bg-black/20 border border-white/10 px-3 py-2 text-white text-sm placeholder:text-white/40 outline-none focus:border-[#00d4ff]/60"
          />
          <input
            value={sourceUrl}
            onChange={(e) => setSourceUrl(e.target.value)}
            placeholder="API URL or XML feed URL"
            className="w-full rounded-xl bg-black/20 border border-white/10 px-3 py-2 text-white text-sm placeholder:text-white/40 outline-none focus:border-[#00d4ff]/60"
          />
          <input
            value={authValue}
            onChange={(e) => setAuthValue(e.target.value)}
            placeholder="API key / login (optional)"
            type="password"
            className="w-full rounded-xl bg-black/20 border border-white/10 px-3 py-2 text-white text-sm placeholder:text-white/40 outline-none focus:border-[#00d4ff]/60"
          />
        </div>

        <div className="grid grid-cols-2 gap-3 mt-4">
          <button
            onClick={handleSaveSupplier}
            disabled={isSavingSupplier || !supplierName.trim() || !sourceUrl.trim()}
            className="rounded-xl py-2 px-3 bg-white/10 hover:bg-white/15 text-white text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSavingSupplier ? 'Saving...' : 'Save supplier'}
          </button>
          <button
            onClick={handleImportProducts}
            disabled={isImporting}
            className="rounded-xl py-2 px-3 bg-[#00d4ff] text-black text-sm font-bold hover:bg-[#4ae5ff] disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
          >
            <Download size={15} />
            {isImporting ? 'Importing...' : 'Import products'}
          </button>
        </div>

        <div className="mt-3 flex items-center justify-between">
          <p className="text-white/60 text-xs">Products in your store: <span className="text-white font-semibold">{importedProductsCount}</span></p>
          {supplierStatus && (
            <p className="text-green-300 text-xs inline-flex items-center gap-1">
              <CheckCircle2 size={14} />
              {supplierStatus}
            </p>
          )}
        </div>
        {supplierError && <p className="mt-2 text-rose-300 text-xs">{supplierError}</p>}
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-white font-semibold">Ostatnie zamówienia</h2>
          <a href="/seller/orders" className="text-[#00d4ff] text-sm">Zobacz wszystkie</a>
        </div>
        <div className="space-y-2">
          {RECENT_ORDERS.map((order) => (
            <div key={order.id} className="glass-card p-3 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-xl">📦</div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-medium truncate">{order.product}</p>
                <p className="text-white/40 text-xs">{order.id} · {order.time}</p>
              </div>
              <div className="text-right">
                <p className="text-[#00d4ff] font-bold text-sm">{formatCurrency(order.amount)}</p>
                <span className={`text-xs px-2 py-0.5 rounded-full ${order.status === 'opłacone' ? 'bg-green-400/20 text-green-400' : order.status === 'wysyłka' ? 'bg-[#00d4ff]/20 text-[#00d4ff]' : 'bg-white/10 text-white/40'}`}>{order.status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
