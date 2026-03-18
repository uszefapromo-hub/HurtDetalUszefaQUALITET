'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Package, ShoppingBag, Zap, Plus, Eye, Star, Bell } from 'lucide-react';
import { StatCard } from '@/components/ui/StatCard';
import { formatCurrency } from '@/lib/utils';

const RECENT_ORDERS = [
  { id: 'QM-001', product: 'Wireless Headphones', amount: 239.20, status: 'paid', time: '5 min ago' },
  { id: 'QM-002', product: 'Smart LED Lamp', amount: 89, status: 'shipping', time: '1h ago' },
  { id: 'QM-003', product: 'Phone Stand', amount: 49, status: 'delivered', time: '2h ago' },
];

export default function SellerDashboard() {
  const [aiTip] = useState('📈 Your headphone category is trending! Consider adding more variants to capture demand.');

  return (
    <div className="max-w-lg mx-auto px-4 py-4">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-white">Seller Hub</h1>
            <p className="text-white/40 text-sm">Today&apos;s overview</p>
          </div>
          <button className="glass-card p-2 rounded-xl relative">
            <Bell size={20} className="text-white/60" />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#00d4ff] text-black text-xs rounded-full flex items-center justify-center font-bold">3</span>
          </button>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <StatCard title="Revenue Today" value={formatCurrency(1247.80)} change="12% vs yesterday" changePositive={true} icon={TrendingUp} color="cyan" />
        <StatCard title="Orders" value="23" change="5 new" changePositive={true} icon={ShoppingBag} color="violet" />
        <StatCard title="Products" value="156" change="3 low stock" changePositive={false} icon={Package} color="pink" />
        <StatCard title="Avg Rating" value="4.8 ★" change="0.1 up" changePositive={true} icon={Star} color="cyan" />
      </div>

      {/* AI Tip */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-4 mb-6 border border-[#7c3aed]/30 bg-[#7c3aed]/5">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-[#7c3aed]/20"><Zap size={18} className="text-[#7c3aed]" /></div>
          <div>
            <p className="text-[#7c3aed] text-xs font-semibold mb-1">AI Recommendation</p>
            <p className="text-white/70 text-sm">{aiTip}</p>
          </div>
        </div>
      </motion.div>

      {/* Quick Actions */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[{ icon: Plus, label: 'Add Product', color: 'bg-[#00d4ff]/20 text-[#00d4ff]' },
          { icon: Zap, label: 'Promote', color: 'bg-[#7c3aed]/20 text-[#7c3aed]' },
          { icon: Eye, label: 'Analytics', color: 'bg-[#f059da]/20 text-[#f059da]' }].map(({ icon: Icon, label, color }) => (
          <motion.button key={label} whileTap={{ scale: 0.9 }} className={`glass-card p-4 flex flex-col items-center gap-2 ${color}`}>
            <Icon size={22} />
            <span className="text-white text-xs font-medium">{label}</span>
          </motion.button>
        ))}
      </div>

      {/* Recent Orders */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-white font-semibold">Recent Orders</h2>
          <a href="/seller/orders" className="text-[#00d4ff] text-sm">See all</a>
        </div>
        <div className="space-y-2">
          {RECENT_ORDERS.map(order => (
            <div key={order.id} className="glass-card p-3 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-xl">📦</div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-medium truncate">{order.product}</p>
                <p className="text-white/40 text-xs">{order.id} · {order.time}</p>
              </div>
              <div className="text-right">
                <p className="text-[#00d4ff] font-bold text-sm">{formatCurrency(order.amount)}</p>
                <span className={`text-xs px-2 py-0.5 rounded-full ${order.status === 'paid' ? 'bg-green-400/20 text-green-400' : order.status === 'shipping' ? 'bg-[#00d4ff]/20 text-[#00d4ff]' : 'bg-white/10 text-white/40'}`}>{order.status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
