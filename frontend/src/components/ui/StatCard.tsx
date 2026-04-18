'use client';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string;
  change?: string;
  changePositive?: boolean;
  icon: LucideIcon;
  color?: 'cyan' | 'violet' | 'pink';
}

export function StatCard({ title, value, change, changePositive, icon: Icon, color = 'cyan' }: StatCardProps) {
  const colors = {
    cyan: { bg: 'bg-[#00d4ff]/10', text: 'text-[#00d4ff]', glow: 'shadow-[0_0_20px_rgba(0,212,255,0.2)]' },
    violet: { bg: 'bg-[#7c3aed]/10', text: 'text-[#7c3aed]', glow: 'shadow-[0_0_20px_rgba(124,58,237,0.2)]' },
    pink: { bg: 'bg-[#f059da]/10', text: 'text-[#f059da]', glow: 'shadow-[0_0_20px_rgba(240,89,218,0.2)]' },
  };
  const c = colors[color];
  return (
    <motion.div whileHover={{ scale: 1.02 }} className={`glass-card p-4 ${c.glow}`}>
      <div className="flex items-start justify-between mb-3">
        <p className="text-white/50 text-sm">{title}</p>
        <div className={`p-2 rounded-xl ${c.bg}`}>
          <Icon size={18} className={c.text} />
        </div>
      </div>
      <p className="text-white text-2xl font-bold mb-1">{value}</p>
      {change ? (
        <p className={`text-xs font-medium ${changePositive ? 'text-green-400' : 'text-red-400'}`}>
          {changePositive ? '↑' : '↓'} {change}
        </p>
      ) : null}
    </motion.div>
  );
}
