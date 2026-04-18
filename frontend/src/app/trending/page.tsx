'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Flame, Star } from 'lucide-react';
import { ProductCard } from '@/components/ui/ProductCard';

const CATEGORIES = ['All', 'Electronics', 'Fashion', 'Home', 'Sports', 'Beauty', 'Books', 'Toys'];
const TABS = ['Viral', 'Best Sellers', 'New Arrivals'];

const MOCK_PRODUCTS = Array.from({ length: 12 }, (_, i) => ({
  id: String(i + 1),
  name: ['Wireless Earbuds Pro', 'Smart LED Lamp', 'Yoga Mat Premium', 'Coffee Maker Deluxe', 'Running Shoes X', 'Laptop Stand Aluminium', 'Phone Holder Car', 'Bluetooth Speaker', 'Fitness Tracker', 'Desk Organizer', 'Night Light RGB', 'Water Bottle Smart'][i],
  price: [149, 89, 199, 349, 279, 159, 49, 199, 129, 79, 59, 89][i],
  storeName: ['TechWorld', 'HomeDecor', 'FitLife', 'KitchenPro', 'SportZone', 'DeskSetup', 'AutoGadgets', 'AudioHub', 'HealthTech', 'OfficePro', 'SmartHome', 'EcoLife'][i],
  rating: Number((4.5 + (i % 5) * 0.1).toFixed(1)),
  reviewCount: 100 + i * 80,
  discount: [20, 0, 15, 10, 25, 0, 30, 5, 0, 20, 15, 0][i],
}));

export default function TrendingPage() {
  const [activeTab, setActiveTab] = useState(0);
  const [activeCategory, setActiveCategory] = useState('All');

  return (
    <div className="max-w-lg mx-auto px-4 py-4">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <Flame size={20} className="text-[#f059da]" />
          <h1 className="text-2xl font-black text-white">Trending</h1>
        </div>
        <p className="text-white/40 text-sm">Viral products &amp; best sellers</p>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
        {TABS.map((tab, i) => (
          <motion.button key={tab} whileTap={{ scale: 0.95 }} onClick={() => setActiveTab(i)}
            className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all ${activeTab === i ? 'bg-[#00d4ff] text-black' : 'glass-card text-white/60 hover:text-white'}`}>
            {tab}
          </motion.button>
        ))}
      </div>

      {/* Categories */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {CATEGORIES.map(cat => (
          <motion.button key={cat} whileTap={{ scale: 0.95 }} onClick={() => setActiveCategory(cat)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${activeCategory === cat ? 'bg-[#7c3aed] text-white' : 'glass-card text-white/50 hover:text-white'}`}>
            {cat}
          </motion.button>
        ))}
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[{ icon: TrendingUp, label: 'Rising', value: '+28%', color: 'text-[#00d4ff]' },
          { icon: Flame, label: 'Hot Items', value: '1,234', color: 'text-[#f059da]' },
          { icon: Star, label: 'Top Rated', value: '4.9★', color: 'text-yellow-400' }].map(s => (
          <div key={s.label} className="glass-card p-3 text-center">
            <s.icon size={16} className={`${s.color} mx-auto mb-1`} />
            <p className={`${s.color} font-bold text-sm`}>{s.value}</p>
            <p className="text-white/40 text-xs">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-2 gap-3">
        {MOCK_PRODUCTS.map((product, i) => (
          <motion.div key={product.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}>
            <ProductCard product={product} />
          </motion.div>
        ))}
      </div>
    </div>
  );
}
