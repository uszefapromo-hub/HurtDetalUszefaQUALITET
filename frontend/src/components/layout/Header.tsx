'use client';
import Link from 'next/link';
import { ShoppingCart, Bell, Search } from 'lucide-react';
import { motion } from 'framer-motion';

export function Header() {
  return (
    <header className="sticky top-0 z-40 glass-card border-b border-white/10 px-4 py-3">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <Link href="/" className="flex items-center gap-2">
          <motion.div whileHover={{ scale: 1.05 }} className="text-xl font-black">
            <span className="neon-text-cyan">Qualitet</span>
            <span className="text-white/60 font-light text-sm ml-1">Market</span>
          </motion.div>
        </Link>
        <div className="flex items-center gap-3">
          <button className="p-2 rounded-xl hover:bg-white/10 transition-all text-white/70 hover:text-white">
            <Search size={20} />
          </button>
          <button className="p-2 rounded-xl hover:bg-white/10 transition-all text-white/70 hover:text-white">
            <Bell size={20} />
          </button>
          <Link href="/cart" className="p-2 rounded-xl hover:bg-white/10 transition-all text-white/70 hover:text-white relative">
            <ShoppingCart size={20} />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#00d4ff] text-black text-xs rounded-full flex items-center justify-center font-bold">3</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
