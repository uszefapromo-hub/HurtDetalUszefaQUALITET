'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Store, Package, DollarSign, BarChart3, AlertTriangle, TrendingUp, Shield } from 'lucide-react';
import { StatCard } from '@/components/ui/StatCard';
import { formatCurrency, formatNumber } from '@/lib/utils';

const TABS = ['Overview', 'Users', 'Stores', 'Products', 'Payments', 'Reports'];

const RECENT_ACTIVITY = [
  { type: 'user', text: 'New seller registered: TechWorld PL', time: '2 min ago', color: 'text-[#00d4ff]' },
  { type: 'order', text: 'Order QM-9821 completed — 239.20 PLN', time: '5 min ago', color: 'text-green-400' },
  { type: 'store', text: 'Store "Beauty Bar" pending review', time: '12 min ago', color: 'text-yellow-400' },
  { type: 'report', text: 'Monthly report generated', time: '1h ago', color: 'text-[#7c3aed]' },
];

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div className="max-w-4xl mx-auto px-4 py-4">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <Shield size={20} className="text-[#7c3aed]" />
          <h1 className="text-2xl font-black text-white">Admin Panel</h1>
        </div>
        <p className="text-white/40 text-sm">Platform overview and management</p>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {TABS.map((tab, i) => (
          <motion.button key={tab} whileTap={{ scale: 0.95 }} onClick={() => setActiveTab(i)}
            className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all ${activeTab === i ? 'bg-[#7c3aed] text-white' : 'glass-card text-white/60 hover:text-white'}`}>
            {tab}
          </motion.button>
        ))}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <StatCard title="Total Revenue" value={formatCurrency(142680)} change="18% this month" changePositive={true} icon={DollarSign} color="cyan" />
        <StatCard title="Users" value={formatNumber(12450)} change="234 new" changePositive={true} icon={Users} color="violet" />
        <StatCard title="Stores" value="521" change="12 pending" changePositive={false} icon={Store} color="pink" />
        <StatCard title="Products" value={formatNumber(48920)} change="1.2K new" changePositive={true} icon={Package} color="cyan" />
      </div>

      {/* Analytics Chart Placeholder */}
      <div className="glass-card p-4 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <BarChart3 size={16} className="text-[#00d4ff]" />
            <h3 className="text-white font-semibold">Revenue Analytics</h3>
          </div>
          <select className="bg-transparent text-white/40 text-xs outline-none">
            <option>Last 7 days</option><option>Last 30 days</option><option>Last year</option>
          </select>
        </div>
        <div className="h-40 flex items-end gap-1.5">
          {[40, 65, 45, 80, 55, 90, 72, 88, 60, 95, 78, 100, 85, 75].map((h, i) => (
            <motion.div key={i} initial={{ scaleY: 0 }} animate={{ scaleY: 1 }} transition={{ delay: i * 0.05 }} style={{ height: `${h}%` }}
              className={`flex-1 rounded-t-lg ${i === 13 ? 'bg-gradient-to-t from-[#7c3aed] to-[#00d4ff]' : 'bg-white/10 hover:bg-[#00d4ff]/30'} transition-colors cursor-pointer origin-bottom`} />
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="mb-6">
        <h3 className="text-white font-semibold mb-3">Recent Activity</h3>
        <div className="space-y-2">
          {RECENT_ACTIVITY.map((a, i) => (
            <div key={i} className="glass-card p-3 flex items-center gap-3">
              <div className={`w-2 h-2 rounded-full flex-shrink-0 ${a.color.replace('text-', 'bg-')}`} />
              <span className="text-white/70 text-sm flex-1">{a.text}</span>
              <span className="text-white/30 text-xs">{a.time}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {[{ icon: Users, label: 'Manage Users', color: 'text-[#00d4ff]', bg: 'bg-[#00d4ff]/10' },
          { icon: Store, label: 'Manage Stores', color: 'text-[#7c3aed]', bg: 'bg-[#7c3aed]/10' },
          { icon: Package, label: 'Manage Products', color: 'text-[#f059da]', bg: 'bg-[#f059da]/10' },
          { icon: DollarSign, label: 'Payments', color: 'text-green-400', bg: 'bg-green-400/10' },
          { icon: AlertTriangle, label: 'Reports', color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
          { icon: TrendingUp, label: 'Analytics', color: 'text-[#00d4ff]', bg: 'bg-[#00d4ff]/10' },
        ].map(({ icon: Icon, label, color, bg }) => (
          <motion.button key={label} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.95 }} className={`glass-card p-4 flex items-center gap-3 ${color}`}>
            <div className={`p-2 rounded-xl ${bg}`}><Icon size={18} /></div>
            <span className="text-white text-sm font-medium">{label}</span>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
