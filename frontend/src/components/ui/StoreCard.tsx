'use client';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Star, Package, ChevronRight } from 'lucide-react';

export interface Store {
  id: string;
  name: string;
  description?: string;
  logo?: string;
  banner?: string;
  rating?: number;
  productCount?: number;
  category?: string;
}

export function StoreCard({ store }: { store: Store }) {
  return (
    <motion.div
      whileHover={{ y: -4, boxShadow: '0 12px 40px rgba(124,58,237,0.2)' }}
      className="glass-card overflow-hidden cursor-pointer group"
    >
      <Link href={`/stores/${store.id}`}>
        <div className="relative h-24 bg-gradient-to-br from-[#7c3aed]/20 to-[#00d4ff]/20">
          {store.banner ? <Image src={store.banner} alt={store.name} fill className="object-cover opacity-40" /> : null}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-3 left-3 flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl glass-card border border-white/20 flex items-center justify-center overflow-hidden">
              {store.logo ? <Image src={store.logo} alt={store.name} width={40} height={40} className="object-cover" /> : <span className="text-lg">🏪</span>}
            </div>
            <h3 className="text-white font-semibold text-sm drop-shadow">{store.name}</h3>
          </div>
        </div>
        <div className="p-3">
          {store.description ? <p className="text-white/50 text-xs line-clamp-2 mb-3">{store.description}</p> : null}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {store.rating ? (
                <div className="flex items-center gap-1">
                  <Star size={12} className="text-yellow-400 fill-yellow-400" />
                  <span className="text-white/60 text-xs">{store.rating}</span>
                </div>
              ) : null}
              {store.productCount !== undefined ? (
                <div className="flex items-center gap-1">
                  <Package size={12} className="text-white/40" />
                  <span className="text-white/60 text-xs">{store.productCount} products</span>
                </div>
              ) : null}
            </div>
            <ChevronRight size={14} className="text-white/30 group-hover:text-[#00d4ff] transition-colors" />
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
