'use client'

import Link from 'next/link'
import { Bot, ShoppingCart, Bell, Search } from 'lucide-react'
import { motion } from 'framer-motion'

export function Header() {
  return (
    <header className="sticky top-0 z-40 glass-card border-b border-white/10 px-4 py-3">
      <div className="flex items-center justify-between max-w-7xl mx-auto gap-3">
        <Link href="/" className="flex items-center gap-2" aria-label="QualitetMarket">
          <motion.div whileHover={{ scale: 1.05 }} className="text-xl font-black">
            <span className="neon-text-cyan">Qualitet</span><span className="text-white">Market</span>
          </motion.div>
        </Link>
        <div className="flex items-center gap-2">
          <Link href="/ai" className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl bg-[#7c3aed]/15 text-[#c4b5fd] border border-[#7c3aed]/30 hover:bg-[#7c3aed]/25 transition-all">
            <Bot size={16} />
            <span className="text-sm font-medium">Studio AI</span>
          </Link>
          <button aria-label="Szukaj" className="p-2 rounded-xl hover:bg-white/10 transition-all text-white/70 hover:text-white">
            <Search size={20} />
          </button>
          <button aria-label="Powiadomienia" className="p-2 rounded-xl hover:bg-white/10 transition-all text-white/70 hover:text-white">
            <Bell size={20} />
          </button>
          <Link aria-label="Koszyk" href="/cart" className="p-2 rounded-xl hover:bg-white/10 transition-all text-white/70 hover:text-white relative">
            <ShoppingCart size={20} />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#00d4ff] text-black text-xs rounded-full flex items-center justify-center font-bold">3</span>
          </Link>
        </div>
      </div>
    </header>
  )
}
