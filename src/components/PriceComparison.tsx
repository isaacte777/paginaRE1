import type { Price } from '../types'

interface PriceComparisonProps {
  prices: Price[]
}

function PriceComparison({ prices }: PriceComparisonProps) {
  // Calcular el mejor precio
  const pricesWithTotal = prices.map(p => ({
    ...p,
    total: p.price + p.shipping
  }))
  
  const lowestTotal = Math.min(...pricesWithTotal.map(p => p.total))
  
  const sortedPrices = [...pricesWithTotal].sort((a, b) => a.total - b.total)

  const getPlatformColor = (platform: string) => {
    const colors: Record<string, string> = {
      'Amazon': '#FF9900',
      'eBay': '#E53238',
      'AliExpress': '#E62E04'
    }
    return colors[platform] || '#666'
  }

  return (
    <div className="price-comparison">
      <h4 className="comparison-title">Comparación de precios:</h4>
      <div className="comparison-list">
        {sortedPrices.map((price, index) => {
          const isBest = price.total === lowestTotal
          const difference = price.total - lowestTotal
          const percentDiff = lowestTotal > 0 ? ((difference / lowestTotal) * 100).toFixed(1) : '0'

          return (
            <div 
              key={index}
              className={`comparison-item ${isBest ? 'best-deal' : ''}`}
            >
              <div className="comparison-header">
                <span 
                  className="platform-name"
                  style={{ color: getPlatformColor(price.platform) }}
                >
                  {price.platform}
                </span>
                {isBest && <span className="best-label">🏆 Mejor precio</span>}
              </div>

              <div className="comparison-details">
                <div className="price-breakdown">
                  <div className="price-row">
                    <span>Precio:</span>
                    <span>${price.price.toFixed(2)}</span>
                  </div>
                  <div className="price-row">
                    <span>Envío:</span>
                    <span>${price.shipping.toFixed(2)}</span>
                  </div>
                  <div className="price-row total">
                    <span>Total:</span>
                    <strong>${price.total.toFixed(2)}</strong>
                  </div>
                </div>

                <div className="additional-info">
                  <span className="availability">📦 {price.availability}</span>
                  <span className="rating">⭐ {price.seller_rating}</span>
                </div>

                {!isBest && difference > 0 && (
                  <div className="price-diff">
                    +${difference.toFixed(2)} ({percentDiff}% más caro)
                  </div>
                )}

                <a 
                  href={price.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="view-deal-btn"
                >
                  Ver en {price.platform} →
                </a>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default PriceComparison
