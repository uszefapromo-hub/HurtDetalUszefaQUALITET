'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Bot, Home, Store, TrendingUp, User } from 'lucide-react'
import { motion } from 'framer-motion'

const navItems = [
  { href: '/', icon: Home, label: 'Start' },
  { href: '/trending', icon: TrendingUp, label: 'Trendy' },
  { href: '/ai', icon: Bot, label: 'AI' },
  { href: '/stores', icon: Store, label: 'Sklepy' },
  { href: '/profile', icon: User, label: 'Profil' },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass-card border-t border-white/10 px-2 pb-safe">
      <div className="flex items-center justify-around py-2 max-w-lg mx-auto">
        {navItems.map(({ href, icon: Icon, label }) => {
          const active = pathname === href
          return (
            <Link key={href} href={href} className="flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all">
              <motion.div whileTap={{ scale: 0.85 }} className={`p-2 rounded-xl transition-all ${active ? 'bg-[#00d4ff]/20 text-[#00d4ff]' : 'text-white/50 hover:text-white'}`}>
                <Icon size={22} className={active ? '[filter:drop-shadow(0_0_6px_#00d4ff)]' : ''} />
              </motion.div>
              <span className={`text-xs font-medium ${active ? 'text-[#00d4ff]' : 'text-white/40'}`}>{label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
