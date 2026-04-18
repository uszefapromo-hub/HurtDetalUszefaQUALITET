'use client';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { formatCurrency, formatNumber } from '@/lib/utils';

export interface Creator {
  id: string;
  name: string;
  avatar?: string;
  earnings?: number;
  clicks?: number;
  conversions?: number;
  tier?: string;
}

export function CreatorCard({ creator }: { creator: Creator }) {
  return (
    <motion.div whileHover={{ scale: 1.02 }} className="glass-card p-4">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#00d4ff] to-[#7c3aed] flex items-center justify-center overflow-hidden">
          {creator.avatar ? <Image src={creator.avatar} alt={creator.name} width={48} height={48} className="rounded-full object-cover" /> : <span className="text-white font-bold">{creator.name[0]}</span>}
        </div>
        <div>
          <h3 className="text-white font-semibold">{creator.name}</h3>
          {creator.tier ? <span className="text-[#00d4ff] text-xs font-medium bg-[#00d4ff]/10 px-2 py-0.5 rounded-full">{creator.tier}</span> : null}
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2">
        <div className="text-center">
          <p className="text-[#00d4ff] font-bold text-sm">{creator.earnings ? formatCurrency(creator.earnings) : '—'}</p>
          <p className="text-white/40 text-xs">Earnings</p>
        </div>
        <div className="text-center">
          <p className="text-[#7c3aed] font-bold text-sm">{creator.clicks ? formatNumber(creator.clicks) : '—'}</p>
          <p className="text-white/40 text-xs">Clicks</p>
        </div>
        <div className="text-center">
          <p className="text-white font-bold text-sm">{creator.conversions ? formatNumber(creator.conversions) : '—'}</p>
          <p className="text-white/40 text-xs">Sales</p>
        </div>
      </div>
    </motion.div>
  );
}
