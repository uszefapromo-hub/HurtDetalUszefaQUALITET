export type GlobalProduct = {
  id: string
  name: string
  basePrice: number
  image: string
  category: string
  supplierName: string
  supplierShipping: string
}

export const GLOBAL_PRODUCTS: GlobalProduct[] = [
  {
    id: 'qm-home-001',
    name: 'Lampa stołowa LED Ambient',
    basePrice: 129,
    image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=1200&q=80',
    category: 'Home Decor',
    supplierName: 'Nordic Light Studio',
    supplierShipping: '2-5 dni roboczych',
  },
  {
    id: 'qm-home-002',
    name: 'Świeca sojowa Premium',
    basePrice: 49,
    image: 'https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=1200&q=80',
    category: 'Lifestyle',
    supplierName: 'PureScent Atelier',
    supplierShipping: '2-4 dni roboczych',
  },
  {
    id: 'qm-home-003',
    name: 'Organizer na biurko Minimal',
    basePrice: 89,
    image: 'https://images.unsplash.com/photo-1499951360447-b19be8fe80f5?auto=format&fit=crop&w=1200&q=80',
    category: 'Office',
    supplierName: 'Forma Living',
    supplierShipping: '3-6 dni roboczych',
  },
  {
    id: 'qm-home-004',
    name: 'Lustro dekoracyjne Aura',
    basePrice: 199,
    image: 'https://images.unsplash.com/photo-1618221118493-9cfa1a1c00da?auto=format&fit=crop&w=1200&q=80',
    category: 'Home Decor',
    supplierName: 'Aura Maison',
    supplierShipping: '3-7 dni roboczych',
  },
  {
    id: 'qm-home-005',
    name: 'Pled Soft Home',
    basePrice: 119,
    image: 'https://images.unsplash.com/photo-1567016432779-094069958ea5?auto=format&fit=crop&w=1200&q=80',
    category: 'Lifestyle',
    supplierName: 'SoftNest Textiles',
    supplierShipping: '2-5 dni roboczych',
  },
  {
    id: 'qm-home-006',
    name: 'Zestaw pojemników kuchennych',
    basePrice: 99,
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=1200&q=80',
    category: 'Kitchen',
    supplierName: 'Kitchen Craft Supply',
    supplierShipping: '2-4 dni roboczych',
  },
  {
    id: 'qm-home-007',
    name: 'Wazon Nordic Form',
    basePrice: 109,
    image: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1200&q=80',
    category: 'Home Decor',
    supplierName: 'Nordic Form Lab',
    supplierShipping: '3-6 dni roboczych',
  },
  {
    id: 'qm-home-008',
    name: 'Lampka nocna Moon Glow',
    basePrice: 139,
    image: 'https://images.unsplash.com/photo-1540932239986-30128078f3c5?auto=format&fit=crop&w=1200&q=80',
    category: 'Lifestyle',
    supplierName: 'Moonlight Works',
    supplierShipping: '2-5 dni roboczych',
  },
]

export const getGlobalProducts = (): GlobalProduct[] => GLOBAL_PRODUCTS

export const calculateStorePrice = (basePrice: number, marginPercent: number): number =>
  Math.round(basePrice * (1 + marginPercent / 100))
