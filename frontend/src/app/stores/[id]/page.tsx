'use client';
import { motion } from 'framer-motion';
import { Share2, Heart, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { ProductCard } from '@/components/ui/ProductCard';

const MOCK_STORE = {
  id: '1', name: 'TechWorld PL', description: 'Your #1 destination for the latest electronics, gadgets, and smart home devices. We offer premium products at competitive prices with fast delivery.',
  category: 'Electronics', rating: 4.8, reviewCount: 1247, productCount: 342, followers: 5621,
};
const MOCK_PRODUCTS = Array.from({ length: 6 }, (_, i) => ({ id: String(i + 1), name: `Product ${i + 1}`, price: 100 + i * 50, storeName: 'TechWorld PL', rating: 4.5, reviewCount: 100, discount: i === 0 ? 20 : 0 }));

export default function StorePage() {
  return (
    <div className="max-w-lg mx-auto">
      {/* Banner */}
      <div className="relative h-48 bg-gradient-to-br from-[#00d4ff]/20 to-[#7c3aed]/20">
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-transparent to-transparent" />
        <div className="absolute top-4 left-4">
          <Link href="/stores" className="glass-card p-2 rounded-xl inline-flex">
            <ArrowLeft size={18} className="text-white" />
          </Link>
        </div>
        <div className="absolute top-4 right-4 flex gap-2">
          <button className="glass-card p-2 rounded-xl"><Share2 size={18} className="text-white" /></button>
          <button className="glass-card p-2 rounded-xl"><Heart size={18} className="text-white" /></button>
        </div>
        <div className="absolute bottom-4 left-4 flex items-end gap-3">
          <div className="w-16 h-16 rounded-2xl glass-card border-2 border-[#00d4ff]/40 flex items-center justify-center text-2xl bg-[#0a0a0f]">🏪</div>
          <div>
            <h1 className="text-white text-xl font-black">{MOCK_STORE.name}</h1>
            <span className="text-[#00d4ff] text-xs">{MOCK_STORE.category}</span>
          </div>
        </div>
      </div>

      <div className="px-4 py-4">
        {/* Stats */}
        <div className="grid grid-cols-4 gap-2 mb-4 glass-card p-3">
          {[['4.8', 'Rating'], ['342', 'Products'], ['5.6K', 'Followers'], ['1.2K', 'Reviews']].map(([v, l]) => (
            <div key={l} className="text-center">
              <p className="text-[#00d4ff] font-bold text-sm">{v}</p>
              <p className="text-white/40 text-xs">{l}</p>
            </div>
          ))}
        </div>

        <p className="text-white/60 text-sm mb-6">{MOCK_STORE.description}</p>

        <motion.button whileTap={{ scale: 0.95 }} className="btn-primary w-full mb-6">Follow Store</motion.button>

        <h2 className="text-white font-semibold mb-3">Products</h2>
        <div className="grid grid-cols-2 gap-3">
          {MOCK_PRODUCTS.map(p => <ProductCard key={p.id} product={p} />)}
        </div>
      </div>
    </div>
  );
}
