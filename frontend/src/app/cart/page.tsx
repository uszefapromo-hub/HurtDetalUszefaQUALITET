'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Minus, Plus, Trash2, Tag, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { formatCurrency } from '@/lib/utils';

const INITIAL_ITEMS = [
  { id: '1', name: 'Premium Wireless Headphones', price: 239.20, quantity: 1, storeName: 'TechWorld PL' },
  { id: '2', name: 'Smart LED Lamp', price: 89, quantity: 2, storeName: 'HomeDecor' },
];

export default function CartPage() {
  const [items, setItems] = useState(INITIAL_ITEMS);
  const [coupon, setCoupon] = useState('');
  const [discount, setDiscount] = useState(0);
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const total = subtotal * (1 - discount / 100);

  const updateQty = (id: string, delta: number) => setItems(prev => prev.map(i => i.id === id ? { ...i, quantity: Math.max(1, i.quantity + delta) } : i));
  const remove = (id: string) => setItems(prev => prev.filter(i => i.id !== id));
  const applyCoupon = () => { if (coupon === 'QUALITET10') setDiscount(10); };

  return (
    <div className="max-w-lg mx-auto px-4 py-4">
      <div className="flex items-center gap-2 mb-6">
        <ShoppingCart size={20} className="text-[#00d4ff]" />
        <h1 className="text-xl font-black text-white">Cart</h1>
        <span className="ml-auto text-white/40 text-sm">{items.length} items</span>
      </div>

      <div className="space-y-3 mb-6">
        <AnimatePresence>
          {items.map(item => (
            <motion.div key={item.id} layout exit={{ opacity: 0, x: -100 }} className="glass-card p-4 flex gap-3">
              <div className="w-16 h-16 rounded-xl bg-white/5 flex items-center justify-center text-2xl flex-shrink-0">📦</div>
              <div className="flex-1 min-w-0">
                <p className="text-white/50 text-xs mb-0.5">{item.storeName}</p>
                <h3 className="text-white font-medium text-sm line-clamp-2 mb-2">{item.name}</h3>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 glass-card px-2 py-1 rounded-lg">
                    <button onClick={() => updateQty(item.id, -1)} className="text-white/60 hover:text-white"><Minus size={12} /></button>
                    <span className="text-white text-sm font-bold w-6 text-center">{item.quantity}</span>
                    <button onClick={() => updateQty(item.id, 1)} className="text-white/60 hover:text-white"><Plus size={12} /></button>
                  </div>
                  <span className="text-[#00d4ff] font-bold">{formatCurrency(item.price * item.quantity)}</span>
                </div>
              </div>
              <button onClick={() => remove(item.id)} className="text-white/30 hover:text-red-400 transition-colors self-start">
                <Trash2 size={16} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Coupon */}
      <div className="glass-card p-4 mb-4">
        <div className="flex gap-2">
          <div className="flex-1 flex items-center gap-2 bg-white/5 rounded-xl px-3">
            <Tag size={14} className="text-white/40" />
            <input value={coupon} onChange={e => setCoupon(e.target.value)} placeholder="Discount code" className="bg-transparent text-white placeholder:text-white/30 outline-none flex-1 py-2 text-sm" />
          </div>
          <motion.button whileTap={{ scale: 0.95 }} onClick={applyCoupon} className="btn-glass px-4 py-2 text-sm">Apply</motion.button>
        </div>
        {discount > 0 ? <p className="text-green-400 text-xs mt-2">✓ {discount}% discount applied!</p> : null}
      </div>

      {/* Summary */}
      <div className="glass-card p-4 mb-6 space-y-2">
        <div className="flex justify-between text-white/60 text-sm"><span>Subtotal</span><span>{formatCurrency(subtotal)}</span></div>
        {discount > 0 ? <div className="flex justify-between text-green-400 text-sm"><span>Discount ({discount}%)</span><span>-{formatCurrency(subtotal * discount / 100)}</span></div> : null}
        <div className="flex justify-between text-white/60 text-sm"><span>Shipping</span><span className="text-green-400">Free</span></div>
        <div className="border-t border-white/10 pt-2 flex justify-between text-white font-bold text-lg"><span>Total</span><span className="text-[#00d4ff]">{formatCurrency(total)}</span></div>
      </div>

      <Link href="/checkout">
        <motion.button whileTap={{ scale: 0.95 }} className="btn-primary w-full flex items-center justify-center gap-2 text-lg">
          Checkout <ArrowRight size={18} />
        </motion.button>
      </Link>
    </div>
  );
}
