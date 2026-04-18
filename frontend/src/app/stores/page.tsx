'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, SlidersHorizontal, Store } from 'lucide-react';
import { StoreCard } from '@/components/ui/StoreCard';
import { StoreCardSkeleton } from '@/components/ui/LoadingSkeleton';

const MOCK_STORES = Array.from({ length: 8 }, (_, i) => ({
  id: String(i + 1),
  name: ['TechWorld PL', 'Fashion Hub', 'Home & Deco', 'Sports Zone', 'Beauty Bar', 'Kids World', 'AutoGadgets', 'BookStore'][i],
  description: ['Best electronics and gadgets', 'Trendy fashion for everyone', 'Make your home beautiful', 'Everything for active lifestyle', 'Premium beauty products', 'Safe toys & learning materials', 'Smart car accessories', 'Books for curious minds'][i],
  category: ['Electronics', 'Fashion', 'Home', 'Sports', 'Beauty', 'Kids', 'Automotive', 'Books'][i],
  rating: Number((4.5 + (i % 5) * 0.1).toFixed(1)),
  productCount: 50 + i * 60,
}));

export default function StoresPage() {
  const [search, setSearch] = useState('');
  const [loading] = useState(false);
  const filtered = MOCK_STORES.filter(s => s.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="max-w-lg mx-auto px-4 py-4">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <Store size={20} className="text-[#7c3aed]" />
          <h1 className="text-2xl font-black text-white">Stores</h1>
        </div>
        <p className="text-white/40 text-sm">Discover verified sellers</p>
      </motion.div>

      {/* Search */}
      <div className="flex gap-2 mb-6">
        <div className="flex-1 glass-card flex items-center gap-2 px-3 py-2.5">
          <Search size={16} className="text-white/40" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search stores..." className="bg-transparent text-white placeholder:text-white/30 outline-none flex-1 text-sm" />
        </div>
        <button className="glass-card p-2.5 rounded-xl hover:bg-white/10 transition-all">
          <SlidersHorizontal size={18} className="text-white/60" />
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[['500+', 'Stores'], ['50K+', 'Products'], ['99%', 'Verified']].map(([v, l]) => (
          <div key={l} className="glass-card p-3 text-center">
            <p className="text-[#7c3aed] font-bold text-lg">{v}</p>
            <p className="text-white/40 text-xs">{l}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-3">
        {loading ? Array(4).fill(0).map((_, i) => <StoreCardSkeleton key={i} />) :
          filtered.map((store, i) => (
            <motion.div key={store.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <StoreCard store={store} />
            </motion.div>
          ))}
      </div>
    </div>
  );
}
