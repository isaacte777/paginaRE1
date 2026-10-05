export interface Price {
  platform: string
  price: number
  shipping: number
  url: string
  availability: string
  seller_rating: number
}

export interface Product {
  id: number
  name: string
  description: string
  image: string
  rating: number
  reviews: number
  featured: boolean
  category: string
  best_price: Price
  best_total: number
  prices: Price[]
}

export interface Category {
  id: string
  name: string
  icon: string
}
