import type { Product, Category, Price } from '../types'

const MOCK_CATEGORIES: Category[] = [
  { id: 'electronics', name: 'Electrónica', icon: '📱' },
  { id: 'clothing', name: 'Ropa', icon: '👕' },
  { id: 'home', name: 'Hogar', icon: '🏠' },
  { id: 'sports', name: 'Deportes', icon: '⚽' },
  { id: 'toys', name: 'Juguetes', icon: '🧸' },
  { id: 'books', name: 'Libros', icon: '📚' },
]

const MOCK_PRODUCTS: Product[] = [
  {
    id: 1,
    name: 'Auriculares Bluetooth Pro',
    description: 'Auriculares inalámbricos con cancelación de ruido activa y 30h de batería',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=300&fit=crop',
    rating: 4.5,
    reviews: 234,
    featured: true,
    category: 'electronics',
    best_price: { platform: 'Amazon', price: 49.99, shipping: 0, url: '#', availability: 'En stock', seller_rating: 4.8 },
    best_total: 49.99,
    prices: [
      { platform: 'Amazon', price: 49.99, shipping: 0, url: '#', availability: 'En stock', seller_rating: 4.8 },
      { platform: 'eBay', price: 44.99, shipping: 5.99, url: '#', availability: 'En stock', seller_rating: 4.3 },
      { platform: 'AliExpress', price: 35.99, shipping: 8.99, url: '#', availability: '2-3 semanas', seller_rating: 4.1 },
    ]
  },
  {
    id: 2,
    name: 'Smartwatch Deportivo',
    description: 'Reloj inteligente con GPS, monitor cardíaco y resistencia al agua IP68',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=300&fit=crop',
    rating: 4.2,
    reviews: 156,
    featured: true,
    category: 'electronics',
    best_price: { platform: 'AliExpress', price: 29.99, shipping: 3.99, url: '#', availability: '1-2 semanas', seller_rating: 4.0 },
    best_total: 33.98,
    prices: [
      { platform: 'Amazon', price: 59.99, shipping: 0, url: '#', availability: 'En stock', seller_rating: 4.7 },
      { platform: 'eBay', price: 45.99, shipping: 4.99, url: '#', availability: 'En stock', seller_rating: 4.2 },
      { platform: 'AliExpress', price: 29.99, shipping: 3.99, url: '#', availability: '1-2 semanas', seller_rating: 4.0 },
    ]
  },
  {
    id: 3,
    name: 'Camiseta Deportiva Premium',
    description: 'Camiseta transpirable de alta calidad para entrenamiento deportivo',
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=300&fit=crop',
    rating: 4.0,
    reviews: 89,
    featured: false,
    category: 'clothing',
    best_price: { platform: 'eBay', price: 15.99, shipping: 2.99, url: '#', availability: 'En stock', seller_rating: 4.1 },
    best_total: 18.98,
    prices: [
      { platform: 'Amazon', price: 24.99, shipping: 0, url: '#', availability: 'En stock', seller_rating: 4.6 },
      { platform: 'eBay', price: 15.99, shipping: 2.99, url: '#', availability: 'En stock', seller_rating: 4.1 },
      { platform: 'AliExpress', price: 9.99, shipping: 4.99, url: '#', availability: '2-4 semanas', seller_rating: 3.8 },
    ]
  },
  {
    id: 4,
    name: 'Lámpara LED Inteligente',
    description: 'Lámpara WiFi con 16 millones de colores compatible con Alexa y Google Home',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop',
    rating: 4.3,
    reviews: 312,
    featured: true,
    category: 'home',
    best_price: { platform: 'Amazon', price: 19.99, shipping: 0, url: '#', availability: 'En stock', seller_rating: 4.9 },
    best_total: 19.99,
    prices: [
      { platform: 'Amazon', price: 19.99, shipping: 0, url: '#', availability: 'En stock', seller_rating: 4.9 },
      { platform: 'eBay', price: 17.99, shipping: 3.99, url: '#', availability: 'En stock', seller_rating: 4.0 },
      { platform: 'AliExpress', price: 12.99, shipping: 5.99, url: '#', availability: '2-3 semanas', seller_rating: 3.9 },
    ]
  },
  {
    id: 5,
    name: 'Balón de Fútbol Profesional',
    description: 'Balón tamaño oficial FIFA con costuras termoselladas',
    image: 'https://images.unsplash.com/photo-1614632537197-38a17061c2bd?w=400&h=300&fit=crop',
    rating: 4.6,
    reviews: 178,
    featured: false,
    category: 'sports',
    best_price: { platform: 'eBay', price: 22.99, shipping: 3.99, url: '#', availability: 'En stock', seller_rating: 4.4 },
    best_total: 26.98,
    prices: [
      { platform: 'Amazon', price: 34.99, shipping: 0, url: '#', availability: 'En stock', seller_rating: 4.7 },
      { platform: 'eBay', price: 22.99, shipping: 3.99, url: '#', availability: 'En stock', seller_rating: 4.4 },
      { platform: 'AliExpress', price: 15.99, shipping: 7.99, url: '#', availability: '2-3 semanas', seller_rating: 3.7 },
    ]
  },
  {
    id: 6,
    name: 'Set de Construcción 500 piezas',
    description: 'Set de bloques de construcción compatibles con marcas líderes, 500 piezas',
    image: 'https://images.unsplash.com/photo-1587654780291-39c9404d7dd0?w=400&h=300&fit=crop',
    rating: 4.4,
    reviews: 267,
    featured: true,
    category: 'toys',
    best_price: { platform: 'AliExpress', price: 18.99, shipping: 4.99, url: '#', availability: '1-2 semanas', seller_rating: 4.0 },
    best_total: 23.98,
    prices: [
      { platform: 'Amazon', price: 39.99, shipping: 0, url: '#', availability: 'En stock', seller_rating: 4.8 },
      { platform: 'eBay', price: 29.99, shipping: 3.99, url: '#', availability: 'En stock', seller_rating: 4.2 },
      { platform: 'AliExpress', price: 18.99, shipping: 4.99, url: '#', availability: '1-2 semanas', seller_rating: 4.0 },
    ]
  },
  {
    id: 7,
    name: 'Mochila Antirrobo USB',
    description: 'Mochila impermeable con puerto USB y compartimento para laptop 15.6"',
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=300&fit=crop',
    rating: 4.1,
    reviews: 145,
    featured: false,
    category: 'clothing',
    best_price: { platform: 'AliExpress', price: 24.99, shipping: 5.99, url: '#', availability: '2-3 semanas', seller_rating: 3.9 },
    best_total: 30.98,
    prices: [
      { platform: 'Amazon', price: 44.99, shipping: 0, url: '#', availability: 'En stock', seller_rating: 4.5 },
      { platform: 'eBay', price: 34.99, shipping: 4.99, url: '#', availability: 'En stock', seller_rating: 4.0 },
      { platform: 'AliExpress', price: 24.99, shipping: 5.99, url: '#', availability: '2-3 semanas', seller_rating: 3.9 },
    ]
  },
  {
    id: 8,
    name: 'Novela Best Seller 2026',
    description: 'La novela más vendida del año, tapa dura con ilustraciones exclusivas',
    image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=300&fit=crop',
    rating: 4.7,
    reviews: 523,
    featured: true,
    category: 'books',
    best_price: { platform: 'Amazon', price: 14.99, shipping: 0, url: '#', availability: 'En stock', seller_rating: 4.9 },
    best_total: 14.99,
    prices: [
      { platform: 'Amazon', price: 14.99, shipping: 0, url: '#', availability: 'En stock', seller_rating: 4.9 },
      { platform: 'eBay', price: 12.99, shipping: 3.99, url: '#', availability: 'En stock', seller_rating: 4.3 },
      { platform: 'AliExpress', price: 8.99, shipping: 6.99, url: '#', availability: '3-4 semanas', seller_rating: 3.5 },
    ]
  },
]

// Funciones mock que simulan el backend
export async function getProducts(params: Record<string, string> = {}): Promise<{ products: Product[] }> {
  // Simular delay de red
  await new Promise(resolve => setTimeout(resolve, 500))
  
  let filtered = [...MOCK_PRODUCTS]
  
  if (params.category) {
    filtered = filtered.filter(p => p.category === params.category)
  }
  
  if (params.search) {
    const search = params.search.toLowerCase()
    filtered = filtered.filter(p => 
      p.name.toLowerCase().includes(search) || 
      p.description.toLowerCase().includes(search)
    )
  }
  
  if (params.sort === 'price_asc') {
    filtered.sort((a, b) => a.best_total - b.best_total)
  } else if (params.sort === 'price_desc') {
    filtered.sort((a, b) => b.best_total - a.best_total)
  } else if (params.sort === 'rating') {
    filtered.sort((a, b) => b.rating - a.rating)
  } else {
    // featured first
    filtered.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0))
  }
  
  return { products: filtered }
}

export async function getProduct(id: string): Promise<Product> {
  await new Promise(resolve => setTimeout(resolve, 300))
  const product = MOCK_PRODUCTS.find(p => p.id === parseInt(id))
  if (!product) throw new Error('Product not found')
  return product
}

export async function getCategories(): Promise<{ categories: Category[] }> {
  await new Promise(resolve => setTimeout(resolve, 300))
  return { categories: MOCK_CATEGORIES }
}

export async function compareProduct(id: string): Promise<{ prices: Price[] }> {
  await new Promise(resolve => setTimeout(resolve, 300))
  const product = MOCK_PRODUCTS.find(p => p.id === parseInt(id))
  if (!product) throw new Error('Product not found')
  return { prices: product.prices }
}
