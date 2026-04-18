'use client';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Heart, ShoppingCart, Star } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export interface Product {
  id: string;
  name: string;
  price: number;
  image?: string;
  rating?: number;
  reviewCount?: number;
  storeId?: string;
  storeName?: string;
  discount?: number;
}

export function ProductCard({ product }: { product: Product }) {
  const discountedPrice = product.discount ? product.price * (1 - product.discount / 100) : product.price;
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, boxShadow: '0 12px 40px rgba(0,212,255,0.15)' }}
      className="glass-card overflow-hidden cursor-pointer group"
    >
      <Link href={`/product/${product.id}`}>
        <div className="relative aspect-square bg-white/5 overflow-hidden">
          {product.image ? (
            <Image src={product.image} alt={product.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-white/20 text-4xl">📦</div>
          )}
          {product.discount ? (
            <div className="absolute top-2 left-2 bg-[#f059da] text-white text-xs font-bold px-2 py-1 rounded-lg">-{product.discount}%</div>
          ) : null}
          <button className="absolute top-2 right-2 p-2 rounded-full glass-card opacity-0 group-hover:opacity-100 transition-all hover:text-red-400">
            <Heart size={16} />
          </button>
        </div>
        <div className="p-3">
          <p className="text-white/50 text-xs mb-1">{product.storeName}</p>
          <h3 className="text-white font-medium text-sm line-clamp-2 mb-2">{product.name}</h3>
          {product.rating ? (
            <div className="flex items-center gap-1 mb-2">
              <Star size={12} className="text-yellow-400 fill-yellow-400" />
              <span className="text-white/60 text-xs">{product.rating} ({product.reviewCount})</span>
            </div>
          ) : null}
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[#00d4ff] font-bold">{formatCurrency(discountedPrice)}</span>
              {product.discount ? <span className="text-white/30 text-xs line-through ml-2">{formatCurrency(product.price)}</span> : null}
            </div>
            <motion.button whileTap={{ scale: 0.9 }} className="p-2 bg-[#00d4ff]/20 hover:bg-[#00d4ff]/40 text-[#00d4ff] rounded-lg transition-all">
              <ShoppingCart size={14} />
            </motion.button>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
