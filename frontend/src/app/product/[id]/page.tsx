'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Heart, Share2, Star, ShoppingCart, Zap, Shield, Truck, RotateCcw } from 'lucide-react';
import Link from 'next/link';
import { formatCurrency } from '@/lib/utils';

const MOCK_PRODUCT = {
  id: '1', name: 'Premium Wireless Headphones Pro X500', price: 299, discount: 20,
  description: 'Experience crystal-clear audio with our flagship wireless headphones. 40-hour battery life, active noise cancellation, and premium comfort for all-day wear.',
  rating: 4.8, reviewCount: 312, storeName: 'TechWorld PL', storeId: '1',
  features: ['40h battery', 'ANC', 'Hi-Res Audio', 'Fast charging', 'Foldable design'],
};

const REVIEWS = [
  { id: '1', author: 'Jan K.', rating: 5, text: 'Amazing sound quality! Best headphones I\'ve ever owned.', date: '2 days ago' },
  { id: '2', author: 'Maria S.', rating: 4, text: 'Great headphones, comfortable fit. ANC works perfectly.', date: '1 week ago' },
];

export default function ProductPage() {
  const [quantity, setQuantity] = useState(1);
  const [liked, setLiked] = useState(false);
  const price = MOCK_PRODUCT.discount ? MOCK_PRODUCT.price * (1 - MOCK_PRODUCT.discount / 100) : MOCK_PRODUCT.price;

  return (
    <div className="max-w-lg mx-auto pb-32">
      {/* Image */}
      <div className="relative aspect-square bg-gradient-to-br from-[#0f0f1a] to-[#14141f] flex items-center justify-center">
        <div className="text-8xl opacity-20">📦</div>
        {MOCK_PRODUCT.discount ? <div className="absolute top-4 left-4 bg-[#f059da] text-white text-sm font-bold px-3 py-1 rounded-xl">-{MOCK_PRODUCT.discount}%</div> : null}
        <div className="absolute top-4 right-4 flex gap-2">
          <Link href="/products" className="glass-card p-2 rounded-xl"><ArrowLeft size={18} className="text-white" /></Link>
          <motion.button whileTap={{ scale: 0.85 }} onClick={() => setLiked(l => !l)} className={`glass-card p-2 rounded-xl ${liked ? 'text-red-400' : 'text-white'}`}>
            <Heart size={18} className={liked ? 'fill-red-400' : ''} />
          </motion.button>
          <button className="glass-card p-2 rounded-xl"><Share2 size={18} className="text-white" /></button>
        </div>
      </div>

      <div className="px-4 py-4">
        <Link href={`/stores/${MOCK_PRODUCT.storeId}`} className="text-[#00d4ff] text-sm mb-2 inline-block hover:underline">{MOCK_PRODUCT.storeName}</Link>
        <h1 className="text-white text-xl font-bold mb-3">{MOCK_PRODUCT.name}</h1>

        {/* Rating */}
        <div className="flex items-center gap-2 mb-4">
          <div className="flex items-center gap-1">
            {Array(5).fill(0).map((_, i) => <Star key={i} size={14} className={i < Math.floor(MOCK_PRODUCT.rating) ? 'text-yellow-400 fill-yellow-400' : 'text-white/20'} />)}
          </div>
          <span className="text-white/60 text-sm">{MOCK_PRODUCT.rating} ({MOCK_PRODUCT.reviewCount} reviews)</span>
        </div>

        {/* Price */}
        <div className="flex items-center gap-3 mb-6 glass-card p-4 rounded-xl">
          <div>
            <span className="text-[#00d4ff] text-3xl font-black">{formatCurrency(price)}</span>
            {MOCK_PRODUCT.discount ? <span className="text-white/30 line-through ml-3">{formatCurrency(MOCK_PRODUCT.price)}</span> : null}
          </div>
        </div>

        {/* Quantity */}
        <div className="flex items-center gap-3 mb-6">
          <span className="text-white/60 text-sm">Quantity:</span>
          <div className="flex items-center gap-3 glass-card px-3 py-2 rounded-xl">
            <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="text-white/60 hover:text-white w-6 h-6 flex items-center justify-center">−</button>
            <span className="text-white font-bold w-8 text-center">{quantity}</span>
            <button onClick={() => setQuantity(q => q + 1)} className="text-white/60 hover:text-white w-6 h-6 flex items-center justify-center">+</button>
          </div>
        </div>

        {/* Features */}
        <div className="flex flex-wrap gap-2 mb-6">
          {MOCK_PRODUCT.features.map(f => <span key={f} className="glass-card px-3 py-1 rounded-full text-[#00d4ff] text-xs border border-[#00d4ff]/20">{f}</span>)}
        </div>

        {/* Trust badges */}
        <div className="grid grid-cols-3 gap-2 mb-6">
          {[{ icon: Shield, label: 'Secure' }, { icon: Truck, label: 'Fast Ship' }, { icon: RotateCcw, label: '30-day Return' }].map(({ icon: Icon, label }) => (
            <div key={label} className="glass-card p-2 flex flex-col items-center gap-1">
              <Icon size={16} className="text-[#00d4ff]" />
              <span className="text-white/60 text-xs">{label}</span>
            </div>
          ))}
        </div>

        <p className="text-white/60 text-sm mb-6">{MOCK_PRODUCT.description}</p>

        {/* Reviews */}
        <h3 className="text-white font-semibold mb-3">Reviews</h3>
        <div className="space-y-3 mb-8">
          {REVIEWS.map(r => (
            <div key={r.id} className="glass-card p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white font-medium text-sm">{r.author}</span>
                <span className="text-white/30 text-xs">{r.date}</span>
              </div>
              <div className="flex items-center gap-1 mb-2">
                {Array(5).fill(0).map((_, i) => <Star key={i} size={12} className={i < r.rating ? 'text-yellow-400 fill-yellow-400' : 'text-white/20'} />)}
              </div>
              <p className="text-white/60 text-sm">{r.text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Fixed Bottom CTA */}
      <div className="fixed bottom-16 left-0 right-0 p-4 glass-card border-t border-white/10 max-w-lg mx-auto">
        <div className="flex gap-3">
          <motion.button whileTap={{ scale: 0.95 }} className="flex-1 btn-glass flex items-center justify-center gap-2">
            <ShoppingCart size={18} /> Add to Cart
          </motion.button>
          <motion.button whileTap={{ scale: 0.95 }} className="flex-1 btn-primary flex items-center justify-center gap-2">
            <Zap size={18} /> Buy Now
          </motion.button>
        </div>
      </div>
    </div>
  );
}
