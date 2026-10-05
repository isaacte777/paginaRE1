import { useState, useEffect } from 'react'
import './App.css'
import Header from './components/Header'
import CategoryFilter from './components/CategoryFilter'
import ProductGrid from './components/ProductGrid'
import SearchBar from './components/SearchBar'
import { getProducts, getCategories } from './services/api'
import type { Product, Category } from './types'

function App() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('featured')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadCategories()
    loadProducts()
  }, [])

  useEffect(() => {
    loadProducts()
  }, [selectedCategory, searchQuery, sortBy])

  const loadCategories = async () => {
    try {
      const data = await getCategories()
      setCategories(data.categories)
    } catch (err) {
      console.error('Error al cargar categorías:', err)
    }
  }

  const loadProducts = async () => {
    setLoading(true)
    setError(null)
    try {
      const params: Record<string, string> = {}
      if (selectedCategory) params.category = selectedCategory
      if (searchQuery) params.search = searchQuery
      if (sortBy !== 'featured') params.sort = sortBy

      const data = await getProducts(params)
      setProducts(data.products)
    } catch (err) {
      setError('Error al cargar productos. Por favor, intenta nuevamente.')
      console.error('Error al cargar productos:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="app">
      <Header />
      
      <main className="main-content">
        <div className="container">
          <SearchBar 
            value={searchQuery}
            onChange={setSearchQuery}
          />

          <div className="filters-section">
            <CategoryFilter
              categories={categories}
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
            />

            <div className="sort-section">
              <label htmlFor="sort">Ordenar por:</label>
              <select 
                id="sort"
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value)}
                className="sort-select"
              >
                <option value="featured">Destacados</option>
                <option value="price_asc">Precio: Menor a Mayor</option>
                <option value="price_desc">Precio: Mayor a Menor</option>
                <option value="rating">Mejor Valorados</option>
              </select>
            </div>
          </div>

          {loading && (
            <div className="loading">
              <div className="spinner"></div>
              <p>Cargando productos...</p>
            </div>
          )}

          {error && (
            <div className="error-message">
              <p>{error}</p>
              <button onClick={loadProducts}>Reintentar</button>
            </div>
          )}

          {!loading && !error && products.length === 0 && (
            <div className="no-results">
              <p>No se encontraron productos</p>
            </div>
          )}

          {!loading && !error && products.length > 0 && (
            <ProductGrid products={products} />
          )}
        </div>
      </main>

      <footer className="footer">
        <p>© 2026 Comparador de Precios - Encuentra las mejores ofertas de Amazon, eBay y AliExpress</p>
      </footer>
    </div>
  )
}

export default App
