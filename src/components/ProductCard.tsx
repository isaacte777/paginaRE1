import { useState } from 'react'
import PriceComparison from './PriceComparison'
import type { Product } from '../types'

interface ProductCardProps {
  product: Product
}

function ProductCard({ product }: ProductCardProps) {
  const [showComparison, setShowComparison] = useState(false)
  const bestPrice = product.best_price

  const getPlatformColor = (platform: string) => {
    const colors: Record<string, string> = {
      'Amazon': '#FF9900',
      'eBay': '#E53238',
      'AliExpress': '#E62E04'
    }
    return colors[platform] || '#666'
  }

  return (
    <div className="product-card">
      {product.featured && (
        <div className="featured-badge">⭐ Destacado</div>
      )}
      
      <div className="product-image-wrapper">
        <img 
          src={product.image} 
          alt={product.name}
          className="product-image"
        />
      </div>

      <div className="product-info">
        <h3 className="product-name">{product.name}</h3>
        <p className="product-description">{product.description}</p>
        
        <div className="product-rating">
          <span className="stars">{'⭐'.repeat(Math.round(product.rating))}</span>
          <span className="rating-text">{product.rating} ({product.reviews} reseñas)</span>
        </div>

        <div className="price-info">
          <div className="best-price-section">
            <span className="price-label">Mejor precio:</span>
            <div className="price-details">
              <span 
                className="platform-badge"
                style={{ backgroundColor: getPlatformColor(bestPrice.platform) }}
              >
                {bestPrice.platform}
              </span>
              <span className="price-amount">${bestPrice.price.toFixed(2)}</span>
            </div>
            {bestPrice.shipping > 0 && (
              <span className="shipping-info">+ ${bestPrice.shipping.toFixed(2)} envío</span>
            )}
            <div className="total-price">
              Total: <strong>${product.best_total.toFixed(2)}</strong>
            </div>
          </div>

          <button 
            className="compare-btn"
            onClick={() => setShowComparison(!showComparison)}
          >
            {showComparison ? '🔼 Ocultar' : '🔽 Comparar precios'}
          </button>
        </div>

        {showComparison && (
          <PriceComparison 
            prices={product.prices}
          />
        )}

        <a 
          href={bestPrice.url}
          target="_blank"
          rel="noopener noreferrer"
          className="buy-btn"
        >
          Ir a la tienda →
        </a>
      </div>
    </div>
  )
}

export default ProductCard
