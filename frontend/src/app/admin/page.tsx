'use client'

import Link from 'next/link'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { Users, Store, Package, DollarSign, BarChart3, AlertTriangle, TrendingUp, Shield, Bot, Sparkles, Wrench } from 'lucide-react'
import { StatCard } from '@/components/ui/StatCard'
import { formatCurrency, formatNumber } from '@/lib/utils'

const TABS = ['Przegląd', 'Użytkownicy', 'Sklepy', 'Produkty', 'Płatności', 'Raporty']

const RECENT_ACTIVITY = [
  { type: 'user', text: 'Nowy sprzedawca: TechWorld PL', time: '2 min temu', color: 'text-[#00d4ff]' },
  { type: 'order', text: 'Zamówienie QM-9821 zakończone — 239,20 PLN', time: '5 min temu', color: 'text-green-400' },
  { type: 'store', text: 'Sklep „Beauty Bar” czeka na weryfikację', time: '12 min temu', color: 'text-yellow-400' },
  { type: 'report', text: 'Wygenerowano raport miesięczny', time: '1 godz. temu', color: 'text-[#7c3aed]' },
]

const AI_OPERATIONS = [
  { href: '/ai?tool=repair-helper', icon: Wrench, label: 'Diagnoza napraw' },
  { href: '/ai?tool=rewrite-supplier-description', icon: Sparkles, label: 'Czyszczenie hurtowni' },
  { href: '/ai?tool=generate-store', icon: Bot, label: 'Generator sklepu' },
]

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState(0)

  return (
    <div className="max-w-4xl mx-auto px-4 py-4">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <Shield size={20} className="text-[#7c3aed]" />
          <h1 className="text-2xl font-black text-white">Panel administratora</h1>
        </div>
        <p className="text-white/40 text-sm">Nadzór nad platformą, sellerami, feedami i AI.</p>
      </motion.div>

      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {TABS.map((tab, i) => (
          <motion.button key={tab} whileTap={{ scale: 0.95 }} onClick={() => setActiveTab(i)} className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all ${activeTab === i ? 'bg-[#7c3aed] text-white' : 'glass-card text-white/60 hover:text-white'}`}>
            {tab}
          </motion.button>
        ))}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <StatCard title="Przychód łącznie" value={formatCurrency(142680)} change="18% w tym miesiącu" changePositive={true} icon={DollarSign} color="cyan" />
        <StatCard title="Użytkownicy" value={formatNumber(12450)} change="234 nowych" changePositive={true} icon={Users} color="violet" />
        <StatCard title="Sklepy" value="521" change="12 oczekuje" changePositive={false} icon={Store} color="pink" />
        <StatCard title="Produkty" value={formatNumber(48920)} change="1,2 tys. nowych" changePositive={true} icon={Package} color="cyan" />
      </div>

      <div className="glass-card p-4 mb-6 border border-[#7c3aed]/25 bg-[#7c3aed]/5">
        <div className="flex items-center justify-between gap-3 mb-3">
          <div>
            <h2 className="text-white font-semibold">Operator AI</h2>
            <p className="text-white/40 text-sm">Szybki dostęp do napraw, feedów hurtowni i generatora sklepu.</p>
          </div>
          <Link href="/ai" className="text-[#c4b5fd] text-sm font-medium">Przejdź do Panelu AI</Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {AI_OPERATIONS.map(({ href, icon: Icon, label }) => (
            <Link key={label} href={href} className="glass-card p-4 flex items-center gap-3 hover:bg-white/10 transition-all">
              <div className="p-2 rounded-xl bg-[#7c3aed]/20"><Icon size={18} className="text-[#c4b5fd]" /></div>
              <span className="text-white text-sm font-medium">{label}</span>
            </Link>
          ))}
        </div>
      </div>

      <div className="glass-card p-4 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <BarChart3 size={16} className="text-[#00d4ff]" />
            <h3 className="text-white font-semibold">Analityka przychodu</h3>
          </div>
          <select className="bg-transparent text-white/40 text-xs outline-none">
            <option>Ostatnie 7 dni</option>
            <option>Ostatnie 30 dni</option>
            <option>Ostatni rok</option>
          </select>
        </div>
        <div className="h-40 flex items-end gap-1.5">
          {[40, 65, 45, 80, 55, 90, 72, 88, 60, 95, 78, 100, 85, 75].map((h, i) => (
            <motion.div key={i} initial={{ scaleY: 0 }} animate={{ scaleY: 1 }} transition={{ delay: i * 0.05 }} style={{ height: `${h}%` }} className={`flex-1 rounded-t-lg ${i === 13 ? 'bg-gradient-to-t from-[#7c3aed] to-[#00d4ff]' : 'bg-white/10 hover:bg-[#00d4ff]/30'} transition-colors cursor-pointer origin-bottom`} />
          ))}
        </div>
      </div>

      <div className="mb-6">
        <h3 className="text-white font-semibold mb-3">Ostatnia aktywność</h3>
        <div className="space-y-2">
          {RECENT_ACTIVITY.map((activity, i) => (
            <div key={i} className="glass-card p-3 flex items-center gap-3">
              <div className={`w-2 h-2 rounded-full flex-shrink-0 ${activity.color.replace('text-', 'bg-')}`} />
              <span className="text-white/70 text-sm flex-1">{activity.text}</span>
              <span className="text-white/30 text-xs">{activity.time}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {[
          { icon: Users, label: 'Zarządzaj użytkownikami', color: 'text-[#00d4ff]', bg: 'bg-[#00d4ff]/10' },
          { icon: Store, label: 'Zarządzaj sklepami', color: 'text-[#7c3aed]', bg: 'bg-[#7c3aed]/10' },
          { icon: Package, label: 'Zarządzaj produktami', color: 'text-[#f059da]', bg: 'bg-[#f059da]/10' },
          { icon: DollarSign, label: 'Płatności', color: 'text-green-400', bg: 'bg-green-400/10' },
          { icon: AlertTriangle, label: 'Raporty', color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
          { icon: TrendingUp, label: 'Analityka', color: 'text-[#00d4ff]', bg: 'bg-[#00d4ff]/10' },
        ].map(({ icon: Icon, label, color, bg }) => (
          <motion.button key={label} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.95 }} className={`glass-card p-4 flex items-center gap-3 ${color}`}>
            <div className={`p-2 rounded-xl ${bg}`}><Icon size={18} /></div>
            <span className="text-white text-sm font-medium">{label}</span>
          </motion.button>
        ))}
      </div>
    </div>
  )
}
