'use client';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { User, Settings, ShoppingBag, Heart, Bell, Shield, LogOut, ChevronRight, Star } from 'lucide-react';

const MENU_ITEMS = [
  { icon: ShoppingBag, label: 'My Orders', href: '/orders', badge: '3' },
  { icon: Heart, label: 'Wishlist', href: '/wishlist', badge: '12' },
  { icon: Bell, label: 'Notifications', href: '/notifications', badge: '5' },
  { icon: Settings, label: 'Settings', href: '/settings' },
  { icon: Shield, label: 'Privacy & Security', href: '/security' },
];

export default function ProfilePage() {
  return (
    <div className="max-w-lg mx-auto px-4 py-4">
      {/* Profile Header */}
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass-card p-6 mb-6 text-center relative overflow-hidden bg-gradient-to-br from-[#00d4ff]/5 to-[#7c3aed]/5">
        <div className="absolute inset-0 bg-glow-violet opacity-30" />
        <div className="relative">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#00d4ff] to-[#7c3aed] flex items-center justify-center mx-auto mb-3 text-2xl font-black text-white">JK</div>
          <h2 className="text-white text-xl font-bold mb-1">Jan Kowalski</h2>
          <p className="text-white/40 text-sm mb-3">jan.kowalski@email.com</p>
          <div className="flex justify-center gap-4">
            {[['23', 'Orders'], ['12', 'Wishlist'], ['4.8 ★', 'Rating']].map(([v, l]) => (
              <div key={l} className="text-center">
                <p className="text-[#00d4ff] font-bold">{v}</p>
                <p className="text-white/30 text-xs">{l}</p>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Seller/Creator CTAs */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <Link href="/seller">
          <motion.div whileHover={{ scale: 1.02 }} className="glass-card p-4 border border-[#00d4ff]/20 bg-[#00d4ff]/5">
            <Star size={20} className="text-[#00d4ff] mb-2" />
            <p className="text-white font-semibold text-sm">Seller Hub</p>
            <p className="text-white/40 text-xs">Manage your store</p>
          </motion.div>
        </Link>
        <Link href="/creator">
          <motion.div whileHover={{ scale: 1.02 }} className="glass-card p-4 border border-[#f059da]/20 bg-[#f059da]/5">
            <User size={20} className="text-[#f059da] mb-2" />
            <p className="text-white font-semibold text-sm">Creator Hub</p>
            <p className="text-white/40 text-xs">Earn with affiliates</p>
          </motion.div>
        </Link>
      </div>

      {/* Menu */}
      <div className="space-y-2 mb-6">
        {MENU_ITEMS.map(({ icon: Icon, label, href, badge }) => (
          <Link key={label} href={href}>
            <motion.div whileHover={{ x: 4 }} className="glass-card p-4 flex items-center gap-3">
              <div className="p-2 rounded-xl bg-white/5"><Icon size={18} className="text-white/60" /></div>
              <span className="text-white font-medium flex-1">{label}</span>
              {badge ? <span className="bg-[#00d4ff] text-black text-xs font-bold px-2 py-0.5 rounded-full">{badge}</span> : null}
              <ChevronRight size={16} className="text-white/30" />
            </motion.div>
          </Link>
        ))}
      </div>

      <motion.button whileTap={{ scale: 0.95 }} className="w-full glass-card p-4 flex items-center justify-center gap-2 text-red-400 hover:bg-red-400/10 transition-all">
        <LogOut size={18} />
        <span className="font-medium">Sign Out</span>
      </motion.button>
    </div>
  );
}
