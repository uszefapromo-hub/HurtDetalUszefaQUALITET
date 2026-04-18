'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Heart, MessageCircle, Share2, ShoppingCart, Play, TrendingUp, Zap } from 'lucide-react';
import { ProductCard } from '@/components/ui/ProductCard';
import { ProductCardSkeleton } from '@/components/ui/LoadingSkeleton';
import { formatCurrency } from '@/lib/utils';

const MOCK_FEED = [
  { id: '1', type: 'product', name: 'Premium Wireless Headphones', price: 299, image: null, storeName: 'TechStore PL', likes: 1247, comments: 89, rating: 4.8, reviewCount: 312, discount: 20 },
  { id: '2', type: 'product', name: 'Smart Watch Series X', price: 599, image: null, storeName: 'GadgetHub', likes: 892, comments: 54, rating: 4.6, reviewCount: 198, discount: 15 },
  { id: '3', type: 'product', name: 'Ergonomic Office Chair', price: 1299, image: null, storeName: 'HomeOffice Pro', likes: 2341, comments: 167, rating: 4.9, reviewCount: 876 },
];

const TRENDING_MOCK = [
  { id: '1', name: 'Wireless Earbuds', price: 149, storeName: 'AudioWorld', discount: 30, rating: 4.7, reviewCount: 543 },
  { id: '2', name: 'Phone Stand', price: 49, storeName: 'DeskSetup', discount: 0, rating: 4.5, reviewCount: 234 },
  { id: '3', name: 'LED Strip Lights', price: 89, storeName: 'SmartHome', discount: 25, rating: 4.6, reviewCount: 789 },
  { id: '4', name: 'Mechanical Keyboard', price: 349, storeName: 'TechStore PL', discount: 10, rating: 4.8, reviewCount: 432 },
];

function FeedItem({ item }: { item: typeof MOCK_FEED[0] }) {
  const [liked, setLiked] = useState(false);
  const price = item.discount ? item.price * (1 - item.discount / 100) : item.price;
  return (
    <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="glass-card overflow-hidden">
      <div className="flex items-center gap-3 p-3 border-b border-white/5">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#00d4ff] to-[#7c3aed] flex items-center justify-center text-xs font-bold">{item.storeName[0]}</div>
        <span className="text-white/70 text-sm font-medium">{item.storeName}</span>
        <span className="ml-auto text-white/30 text-xs">Just now</span>
      </div>
      <div className="relative aspect-video bg-gradient-to-br from-[#0f0f1a] to-[#14141f] flex items-center justify-center">
        <div className="text-6xl opacity-20">📦</div>
        {item.discount ? <div className="absolute top-3 left-3 bg-[#f059da] text-white text-xs font-bold px-2 py-1 rounded-lg">-{item.discount}%</div> : null}
        <button className="absolute inset-0 flex items-center justify-center">
          <motion.div whileHover={{ scale: 1.1 }} className="w-16 h-16 rounded-full glass-card flex items-center justify-center">
            <Play size={24} className="text-white ml-1" />
          </motion.div>
        </button>
      </div>
      <div className="p-4">
        <h3 className="text-white font-semibold mb-1">{item.name}</h3>
        <div className="flex items-center gap-2 mb-3">
          <span className="text-[#00d4ff] text-xl font-bold">{formatCurrency(price)}</span>
          {item.discount ? <span className="text-white/30 line-through text-sm">{formatCurrency(item.price)}</span> : null}
        </div>
        <motion.button whileTap={{ scale: 0.95 }} className="btn-primary w-full flex items-center justify-center gap-2 mb-4">
          <ShoppingCart size={18} />
          Buy Now
        </motion.button>
        <div className="flex items-center gap-4">
          <motion.button whileTap={{ scale: 0.8 }} onClick={() => setLiked(l => !l)} className={`flex items-center gap-1.5 transition-colors ${liked ? 'text-red-400' : 'text-white/50 hover:text-white'}`}>
            <Heart size={18} className={liked ? 'fill-red-400' : ''} />
            <span className="text-sm">{item.likes + (liked ? 1 : 0)}</span>
          </motion.button>
          <button className="flex items-center gap-1.5 text-white/50 hover:text-white transition-colors">
            <MessageCircle size={18} />
            <span className="text-sm">{item.comments}</span>
          </button>
          <button className="flex items-center gap-1.5 text-white/50 hover:text-white transition-colors ml-auto">
            <Share2 size={18} />
            <span className="text-sm">Share</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
}

export default function HomePage() {
  const [loading, setLoading] = useState(true);
  useEffect(() => { setTimeout(() => setLoading(false), 800); }, []);

  return (
    <div className="max-w-lg mx-auto px-4 py-4">
      {/* Hero Banner */}
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass-card p-6 mb-6 relative overflow-hidden bg-gradient-to-br from-[#00d4ff]/10 to-[#7c3aed]/10">
        <div className="absolute inset-0 bg-glow-cyan opacity-50" />
        <div className="relative">
          <div className="flex items-center gap-2 mb-2">
            <Zap size={16} className="text-[#00d4ff]" />
            <span className="text-[#00d4ff] text-xs font-semibold uppercase tracking-wider">Live Now</span>
          </div>
          <h1 className="text-2xl font-black text-white mb-1">Qualitet <span className="neon-text-cyan">Market</span></h1>
          <p className="text-white/50 text-sm mb-4">Discover the best products from verified stores</p>
          <div className="flex gap-3 text-xs">
            <span className="glass-card px-3 py-1.5 rounded-full text-white/70">🔥 1.2K live</span>
            <span className="glass-card px-3 py-1.5 rounded-full text-white/70">📦 50K+ products</span>
            <span className="glass-card px-3 py-1.5 rounded-full text-white/70">⭐ 4.8 avg</span>
          </div>
        </div>
      </motion.div>

      {/* Trending Section */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <TrendingUp size={16} className="text-[#00d4ff]" />
            <h2 className="text-white font-semibold">Trending Now</h2>
          </div>
          <a href="/trending" className="text-[#00d4ff] text-sm">See all</a>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {loading ? Array(4).fill(0).map((_, i) => <ProductCardSkeleton key={i} />) :
            TRENDING_MOCK.map(p => <ProductCard key={p.id} product={p} />)}
        </div>
      </div>

      {/* Feed */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <span className="w-2 h-2 rounded-full bg-[#00d4ff] animate-pulse" />
          <h2 className="text-white font-semibold">Live Feed</h2>
        </div>
        <div className="space-y-4">
          {loading ? Array(2).fill(0).map((_, i) => <div key={i} className="glass-card h-64 skeleton" />) :
            MOCK_FEED.map(item => <FeedItem key={item.id} item={item} />)}
        </div>
      </div>
    </div>
  );
}
