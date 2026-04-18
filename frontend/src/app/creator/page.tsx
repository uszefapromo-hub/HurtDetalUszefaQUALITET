'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link2, TrendingUp, DollarSign, MousePointer, Copy, Share2, BarChart3, Zap } from 'lucide-react';
import { StatCard } from '@/components/ui/StatCard';
import { formatCurrency, formatNumber } from '@/lib/utils';

const TOP_PRODUCTS = [
  { id: '1', name: 'Wireless Headphones', commission: 12, clicks: 234, conversions: 18, earning: 43.20 },
  { id: '2', name: 'Smart Watch', commission: 8, clicks: 189, conversions: 12, earning: 57.60 },
  { id: '3', name: 'LED Strip Lights', commission: 15, clicks: 412, conversions: 31, earning: 69.75 },
];

export default function CreatorDashboard() {
  const [copied, setCopied] = useState('');
  const copyLink = (id: string) => { setCopied(id); setTimeout(() => setCopied(''), 2000); };

  return (
    <div className="max-w-lg mx-auto px-4 py-4">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <Link2 size={20} className="text-[#f059da]" />
          <h1 className="text-2xl font-black text-white">Creator Hub</h1>
        </div>
        <p className="text-white/40 text-sm">Your affiliate performance</p>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <StatCard title="Total Earnings" value={formatCurrency(170.55)} change="23% this month" changePositive={true} icon={DollarSign} color="cyan" />
        <StatCard title="Total Clicks" value={formatNumber(835)} change="12% up" changePositive={true} icon={MousePointer} color="violet" />
        <StatCard title="Conversions" value="61" change="8% up" changePositive={true} icon={TrendingUp} color="pink" />
        <StatCard title="Conv. Rate" value="7.3%" change="0.5% up" changePositive={true} icon={BarChart3} color="cyan" />
      </div>

      {/* My Referral Link */}
      <div className="glass-card p-4 mb-6 border border-[#f059da]/20">
        <p className="text-[#f059da] text-xs font-semibold mb-2">MY REFERRAL CODE</p>
        <div className="flex items-center gap-2 glass-card px-3 py-2.5 rounded-xl mb-3">
          <code className="text-[#00d4ff] text-sm flex-1">QUALITET-CREATOR-ABC123</code>
          <button onClick={() => copyLink('main')} className="text-white/50 hover:text-white">
            {copied === 'main' ? <span className="text-green-400 text-xs">Copied!</span> : <Copy size={14} />}
          </button>
        </div>
        <button className="btn-glass w-full flex items-center justify-center gap-2 py-2 text-sm">
          <Share2 size={14} /> Share My Link
        </button>
      </div>

      {/* Top Products */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-white font-semibold">Top Products to Promote</h2>
          <span className="text-white/30 text-xs">By earnings</span>
        </div>
        <div className="space-y-3">
          {TOP_PRODUCTS.map(product => (
            <div key={product.id} className="glass-card p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-white font-medium text-sm">{product.name}</h3>
                  <span className="text-[#00d4ff] text-xs">{product.commission}% commission</span>
                </div>
                <span className="text-[#00d4ff] font-bold">{formatCurrency(product.earning)}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
                <div className="glass-card p-2 text-center">
                  <p className="text-[#7c3aed] font-bold">{formatNumber(product.clicks)}</p>
                  <p className="text-white/40">Clicks</p>
                </div>
                <div className="glass-card p-2 text-center">
                  <p className="text-[#f059da] font-bold">{product.conversions}</p>
                  <p className="text-white/40">Sales</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => copyLink(product.id)} className="flex-1 btn-glass text-xs py-2 flex items-center justify-center gap-1">
                  <Copy size={12} />{copied === product.id ? 'Copied!' : 'Copy Link'}
                </button>
                <button className="flex-1 btn-primary text-xs py-2 flex items-center justify-center gap-1">
                  <Zap size={12} /> Promote
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
