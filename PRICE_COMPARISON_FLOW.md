# Flujo de Implementación: Página de Comparación de Precios

**Proyecto**: paginaRE - FlowLab + Comparador de Precios  
**Fecha**: 2026-10-03  
**Status**: Planificación - Flujo y Objetivos  
**Integración**: Sistema FlowLab modularizado (19 módulos)

---

## 1. VISIÓN GENERAL

Crear una página de comparación de precios de productos que:
- Se integre nativamente con la arquitectura modularizada de FlowLab
- Actúe como un **nodo ejecutable** dentro de FlowLab
- Acceda a datos de productos desde el backend existente
- Permita a usuarios comparar precios entre plataformas
- Se sincronice con el estado global de FlowLab
- Persista preferencias en localStorage

---

## 2. ARQUITECTURA DE INTEGRACIÓN

### 2.1 Ubicación de Módulos

```
paginaRE/
├── js/
│   ├── features/
│   │   ├── price-comparison.js          ← NUEVO: Lógica principal
│   │   ├── price-alerts.js              ← NUEVO: Sistema de alertas
│   │   └── price-history.js             ← NUEVO: Historial y gráficos
│   │
│   └── ui/
│       ├── comparison-panel.js          ← NUEVO: Panel de comparación
│       └── price-widgets.js             ← NUEVO: Componentes visuales
│
└── pages/
    └── price-comparison.html            ← NUEVO: Página principal
```

### 2.2 Orden de Carga (Respetando Dependencias)

```
1. core/          (CONFIG + STATE)
2. utils/         (helpers.js, storage.js)
3. canvas/        (render.js, viewport.js, minimap.js)
4. interaction/   (selection.js, editing.js)
5. features/      (history.js, templates.js, export.js)
   ↓ LUEGO:
6. features/      (price-comparison.js, price-alerts.js, price-history.js) ← NUEVA CARGA
7. ui/            (panel.js, console.js)
   ↓ LUEGO:
8. ui/            (comparison-panel.js, price-widgets.js) ← NUEVA CARGA
9. app.js         (Orchestrator)
```

---

## 3. OBJETIVOS Y FASES

### FASE 1: Infraestructura Base (Semana 1)

**Objetivos**:
- [ ] Extender STATE con propiedades de comparación
- [ ] Crear módulo price-comparison.js con estructura base
- [ ] Implementar API endpoints para productos
- [ ] Crear página HTML de comparación

**Tareas**:

1.1. **Extender STATE en core/state.js**
```javascript
const STATE = {
  // ... existente ...
  
  // Nuevas propiedades para comparación
  comparison: {
    selectedProducts: [],      // Array de IDs de productos
    filters: {
      category: null,
      priceRange: { min: 0, max: 5000 },
      minRating: 0,
      availability: 'any'
    },
    sortBy: 'price_asc',       // price_asc, price_desc, rating, reviews
    viewMode: 'table',         // table, cards, detailed
    currency: 'USD'
  },
  
  alerts: {
    enabled: [],               // Array de alertas activas
    watchlist: [],             // Productos monitoreados
    priceDropThreshold: 10     // Porcentaje
  },
  
  priceHistory: {
    cached: {},                // Historial local de precios
    lastUpdate: null,
    updateInterval: 3600000    // 1 hora
  }
};
```

1.2. **Crear js/features/price-comparison.js**
```javascript
// Módulo de comparación de precios
const PriceComparison = {
  // Estado local
  products: [],
  vendors: [],
  
  // Inicialización
  init() {
    this.loadVendors();
    this.attachEventListeners();
    log('ok', 'módulo de comparación de precios cargado');
  },
  
  // Búsqueda y filtrado
  async search(query) {
    const response = await fetch(`/api/products.php?search=${encodeURIComponent(query)}`);
    const data = await response.json();
    this.products = data.products || [];
    return this.products;
  },
  
  filter(filters) {
    let filtered = this.products;
    
    if (filters.category) {
      filtered = filtered.filter(p => p.category === filters.category);
    }
    
    if (filters.minRating) {
      filtered = filtered.filter(p => p.rating >= filters.minRating);
    }
    
    // Rango de precio (incluyendo envío)
    if (filters.priceRange) {
      filtered = filtered.filter(p => {
        const bestTotal = p.best_total || p.prices[0].price;
        return bestTotal >= filters.priceRange.min && bestTotal <= filters.priceRange.max;
      });
    }
    
    return filtered;
  },
  
  // Ordenamiento
  sort(products, sortBy) {
    const sorted = [...products];
    
    switch (sortBy) {
      case 'price_asc':
        sorted.sort((a, b) => (a.best_total || a.prices[0].price) - (b.best_total || b.prices[0].price));
        break;
      case 'price_desc':
        sorted.sort((a, b) => (b.best_total || b.prices[0].price) - (a.best_total || a.prices[0].price));
        break;
      case 'rating':
        sorted.sort((a, b) => b.rating - a.rating);
        break;
      case 'reviews':
        sorted.sort((a, b) => b.reviews - a.reviews);
        break;
    }
    
    return sorted;
  },
  
  // Obtener mejor precio
  getBestPrice(product) {
    let best = product.prices[0];
    let lowestTotal = best.price + best.shipping;
    
    product.prices.forEach(price => {
      const total = price.price + price.shipping;
      if (total < lowestTotal) {
        lowestTotal = total;
        best = price;
      }
    });
    
    return { price: best, total: lowestTotal };
  },
  
  attachEventListeners() {
    // Delegación de eventos
    document.addEventListener('click', (e) => {
      if (e.target.matches('[data-action="compare"]')) {
        const productId = e.target.dataset.productId;
        this.toggleProductSelection(productId);
      }
      
      if (e.target.matches('[data-action="add-alert"]')) {
        const productId = e.target.dataset.productId;
        this.addPriceAlert(productId);
      }
    });
  },
  
  toggleProductSelection(productId) {
    const idx = STATE.comparison.selectedProducts.indexOf(productId);
    if (idx >= 0) {
      STATE.comparison.selectedProducts.splice(idx, 1);
    } else {
      STATE.comparison.selectedProducts.push(productId);
    }
    saveState();
    log('sync', `Productos seleccionados: ${STATE.comparison.selectedProducts.length}`);
  },
  
  loadVendors() {
    // Vendors conocidos
    this.vendors = [
      { id: 'amazon', name: 'Amazon', icon: '🛒', color: '#FF9900' },
      { id: 'ebay', name: 'eBay', icon: '⚡', color: '#E53238' },
      { id: 'aliexpress', name: 'AliExpress', icon: '🌏', color: '#E62E04' },
      { id: 'mercadolibre', name: 'Mercado Libre', icon: '🟡', color: '#FFE600' }
    ];
  }
};
```

1.3. **Crear js/features/price-alerts.js**
```javascript
// Sistema de alertas de precios
const PriceAlerts = {
  init() {
    this.loadAlerts();
    this.startMonitoring();
    log('ok', 'sistema de alertas de precios activo');
  },
  
  addAlert(productId, threshold) {
    const alert = {
      id: generateId(),
      productId,
      threshold,          // Caída de precio en %
      createdAt: Date.now(),
      active: true
    };
    
    STATE.alerts.enabled.push(alert);
    saveState();
    
    log('ok', `Alerta creada para producto ${productId} (-${threshold}%)`);
    return alert;
  },
  
  removeAlert(alertId) {
    STATE.alerts.enabled = STATE.alerts.enabled.filter(a => a.id !== alertId);
    saveState();
  },
  
  startMonitoring() {
    setInterval(() => {
      this.checkPrices();
    }, STATE.comparison.priceDropThreshold * 60000);
  },
  
  async checkPrices() {
    for (const alert of STATE.alerts.enabled) {
      const product = await this.getProduct(alert.productId);
      const currentPrice = product.best_total;
      const previousPrice = STATE.priceHistory.cached[alert.productId];
      
      if (previousPrice) {
        const dropPercent = ((previousPrice - currentPrice) / previousPrice) * 100;
        if (dropPercent >= alert.threshold) {
          this.notifyPriceDrop(product, dropPercent, currentPrice, previousPrice);
        }
      }
      
      STATE.priceHistory.cached[alert.productId] = currentPrice;
    }
    
    saveState();
  },
  
  async getProduct(productId) {
    const response = await fetch(`/api/products.php?id=${productId}`);
    return await response.json();
  },
  
  notifyPriceDrop(product, dropPercent, currentPrice, previousPrice) {
    const message = `${product.name} bajó ${dropPercent.toFixed(1)}%: $${currentPrice} (era $${previousPrice})`;
    log('alert', message);
    
    // Notificación del navegador
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Alerta de Precio', {
        body: message,
        icon: product.image
      });
    }
  },
  
  loadAlerts() {
    // Cargar desde localStorage
    const stored = localStorage.getItem('priceAlerts');
    if (stored) {
      STATE.alerts = JSON.parse(stored);
    }
  }
};
```

1.4. **Crear js/ui/comparison-panel.js**
```javascript
// Panel de comparación UI
const ComparisonPanel = {
  init() {
    this.render();
    log('ok', 'panel de comparación renderizado');
  },
  
  render() {
    const container = document.getElementById('comparisonPanel');
    if (!container) return;
    
    const html = `
      <div class="comparison-header">
        <h3>Comparador de Precios</h3>
        <p>Selecciona productos para comparar precios entre plataformas</p>
      </div>
      
      <div class="comparison-filters">
        <input type="text" id="searchProducts" placeholder="Buscar producto..." class="search-input">
        <select id="categoryFilter" class="filter-select">
          <option value="">Todas las categorías</option>
          <option value="tecnologia">Tecnología</option>
          <option value="hogar">Hogar</option>
          <option value="ropa">Ropa y Accesorios</option>
          <option value="deportes">Deportes</option>
        </select>
      </div>
      
      <div class="comparison-results" id="resultsContainer">
        <p class="text-muted">Cargando productos...</p>
      </div>
      
      <div class="comparison-selected">
        <h4>Productos Seleccionados (${STATE.comparison.selectedProducts.length})</h4>
        <div id="selectedList" class="selected-list"></div>
      </div>
    `;
    
    container.innerHTML = html;
    this.attachHandlers();
  },
  
  attachHandlers() {
    const searchInput = document.getElementById('searchProducts');
    const categoryFilter = document.getElementById('categoryFilter');
    
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.handleSearch(e.target.value);
      });
    }
    
    if (categoryFilter) {
      categoryFilter.addEventListener('change', (e) => {
        STATE.comparison.filters.category = e.target.value;
        this.loadProducts();
      });
    }
  },
  
  async handleSearch(query) {
    if (query.length < 2) return;
    
    const products = await PriceComparison.search(query);
    this.displayProducts(products);
  },
  
  displayProducts(products) {
    const container = document.getElementById('resultsContainer');
    
    const filtered = PriceComparison.filter(STATE.comparison.filters);
    const sorted = PriceComparison.sort(filtered, STATE.comparison.sortBy);
    
    const html = sorted.map(p => `
      <div class="product-card">
        <img src="${p.image}" alt="${p.name}" class="product-image">
        <h5>${p.name}</h5>
        <p class="product-category">${p.category}</p>
        <p class="product-rating">⭐ ${p.rating} (${p.reviews} reseñas)</p>
        <p class="best-price">Mejor precio: <strong>$${p.best_total.toFixed(2)}</strong></p>
        <button data-action="compare" data-product-id="${p.id}" class="btn-compare">
          ${STATE.comparison.selectedProducts.includes(p.id) ? '✓ Comparando' : 'Comparar'}
        </button>
      </div>
    `).join('');
    
    container.innerHTML = html || '<p class="text-muted">No se encontraron productos</p>';
  },
  
  async loadProducts() {
    const response = await fetch('/api/products.php');
    const data = await response.json();
    this.displayProducts(data.products);
  }
};
```

**Endpoints API Requeridos**:
- ✅ `GET /api/products.php` (existente)
- ✅ `GET /api/products.php?id=p001` (existente)
- ✅ `GET /api/products.php?category=tecnologia` (existente)
- ✅ `GET /api/products.php?search=iphone` (existente)

---

### FASE 2: Visualización Avanzada (Semana 2)

**Objetivos**:
- [ ] Crear tabla comparativa interactiva
- [ ] Implementar gráficos de variación de precios
- [ ] Añadir sistema de exportación (CSV, JSON)
- [ ] Crear historial de búsquedas

**Tareas**:

2.1. **Tabla Comparativa Avanzada**
```javascript
const ComparisonTable = {
  render(selectedProductIds) {
    const products = selectedProductIds.map(id => 
      PriceComparison.products.find(p => p.id === id)
    );
    
    if (products.length === 0) {
      return '<p>Selecciona al menos un producto para comparar</p>';
    }
    
    // Obtener todas las plataformas únicas
    const platforms = new Set();
    products.forEach(p => {
      p.prices.forEach(pr => platforms.add(pr.platform));
    });
    
    let html = '<table class="comparison-table"><thead><tr><th>Plataforma</th>';
    products.forEach(p => html += `<th>${p.name}<br><small>⭐${p.rating}</small></th>`);
    html += '</tr></thead><tbody>';
    
    platforms.forEach(platform => {
      html += `<tr><td><strong>${platform}</strong></td>`;
      products.forEach(product => {
        const priceInfo = product.prices.find(p => p.platform === platform);
        if (priceInfo) {
          const total = priceInfo.price + priceInfo.shipping;
          html += `
            <td>
              <div class="price-info">
                <strong>$${priceInfo.price}</strong>
                ${priceInfo.shipping > 0 ? `<small>+$${priceInfo.shipping} envío</small>` : ''}
                <small class="availability">${priceInfo.availability}</small>
                <small class="seller-rating">Vendedor: ${priceInfo.seller_rating}⭐</small>
              </div>
            </td>
          `;
        } else {
          html += '<td class="unavailable">No disponible</td>';
        }
      });
      html += '</tr>';
    });
    
    html += '</tbody></table>';
    return html;
  }
};
```

2.2. **Gráficos de Variación**
- Integración con Chart.js o Plotly
- Mostrar tendencia de precios en últimos 30 días
- Comparar precios entre plataformas

2.3. **Exportación**
```javascript
const ComparisonExport = {
  exportToCSV(selectedProducts) {
    const csv = this.generateCSV(selectedProducts);
    this.downloadFile(csv, 'comparacion-precios.csv', 'text/csv');
  },
  
  generateCSV(products) {
    let csv = 'Producto,Categoría,Rating,Plataforma,Precio,Envío,Total,Disponibilidad\n';
    
    products.forEach(p => {
      p.prices.forEach(price => {
        csv += `"${p.name}","${p.category}",${p.rating},"${price.platform}",${price.price},${price.shipping},${price.price + price.shipping},"${price.availability}"\n`;
      });
    });
    
    return csv;
  },
  
  downloadFile(content, filename, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
};
```

---

### FASE 3: Integración FlowLab (Semana 3)

**Objetivos**:
- [ ] Crear nodo ejecutable "comparador_precios" en FlowLab
- [ ] Pasar datos entre nodos FlowLab y comparador
- [ ] Implementar acciones en flujos (búsqueda, filtrado, alertas)
- [ ] Sincronizar estado con localStorage

**Tareas**:

3.1. **Nodo Ejecutable FlowLab**
- Tipo: `price-comparison`
- Inputs: `{productIds[], filters{}, action}`
- Outputs: `{results[], bestPrices[], recommendations[]}`
- Status: pending/progress/done/error

3.2. **Integración con Estado Global**
```javascript
// En app.js - Extensión para price-comparison
const executeNode = function(node) {
  // ... código existente ...
  
  if (node.type === 'price-comparison') {
    PriceComparison.executeFlowNode(node);
  }
};

// En price-comparison.js
PriceComparison.executeFlowNode = async function(node) {
  node.status = 'progress';
  
  try {
    const products = node.inputs.productIds.map(id => 
      this.products.find(p => p.id === id)
    );
    
    const filtered = this.filter(node.inputs.filters || {});
    const sorted = this.sort(filtered, STATE.comparison.sortBy);
    
    node.outputs = {
      results: sorted,
      bestPrices: sorted.map(p => this.getBestPrice(p)),
      count: sorted.length
    };
    
    node.status = 'done';
    log('ok', `nodo comparador: ${sorted.length} productos procesados`);
  } catch (error) {
    node.status = 'error';
    node.error = error.message;
    log('error', `Error en nodo comparador: ${error.message}`);
  }
};
```

---

### FASE 4: Testing y Optimización (Semana 4)

**Objetivos**:
- [ ] Tests unitarios para cada módulo
- [ ] Performance testing (carga de datos)
- [ ] UX testing con usuarios reales
- [ ] Documentación técnica

**Tareas**:

4.1. **Tests**
- Búsqueda y filtrado de productos
- Cálculo de mejores precios
- Gestión de alertas
- Persistencia en localStorage

4.2. **Performance**
- Caching de productos
- Lazy loading de imágenes
- Compresión de datos históricos

4.3. **Documentación**
- API documentation
- User guide
- Developer guide

---

## 4. FLUJO DE DATOS

```
┌─────────────────────────────────────────────────────────────┐
│                     USUARIO FINAL                           │
└──────────────────────────┬──────────────────────────────────┘
                           │
                    (búsqueda/filtro)
                           │
                           ▼
        ┌──────────────────────────────────┐
        │   Página: price-comparison.html  │
        │  ┌────────────────────────────┐  │
        │  │  Search / Category Filter  │  │
        │  └────────────────────────────┘  │
        │  ┌────────────────────────────┐  │
        │  │  Selected Products List    │  │
        │  └────────────────────────────┘  │
        └──────────┬───────────────────────┘
                   │
        (API calls)│
                   ▼
        ┌──────────────────────────────────┐
        │   Backend: /api/products.php     │
        │   ├─ search?query=               │
        │   ├─ category=                   │
        │   ├─ featured=                   │
        │   └─ sort=price_asc              │
        └──────────┬───────────────────────┘
                   │
        (JSON data)│
                   ▼
        ┌──────────────────────────────────┐
        │   data/products.json             │
        │   └─ 8 productos                 │
        │   └─ múltiples plataformas       │
        └──────────────────────────────────┘


┌─────────────────────────────────────────────────────────────┐
│                   FLOWLAB INTEGRATION                        │
└─────────────────────────────────────────────────────────────┘

STATE (global)
├── comparison
│   ├── selectedProducts: []
│   ├── filters: {}
│   ├── sortBy: 'price_asc'
│   └── viewMode: 'table'
│
├── alerts
│   ├── enabled: []
│   └── watchlist: []
│
└── priceHistory
    ├── cached: {}
    └── updateInterval: 3600000


Modules Chain:
core/state.js
    ↓
utils/helpers.js + storage.js
    ↓
features/price-comparison.js
    ↓
features/price-alerts.js
    ↓
features/price-history.js
    ↓
ui/comparison-panel.js
    ↓
ui/price-widgets.js
    ↓
app.js (orchestrator)
```

---

## 5. STATE MANAGEMENT DETAILS

### 5.1 Extensión de STATE

```javascript
// En core/state.js - Agregar:
const STATE = {
  // ... existente ...
  
  comparison: {
    selectedProducts: [],
    filters: {
      category: null,
      priceRange: { min: 0, max: 5000 },
      minRating: 0,
      availability: 'any'
    },
    sortBy: 'price_asc',
    viewMode: 'table',
    currency: 'USD',
    lastSearch: ''
  },
  
  alerts: {
    enabled: [],
    watchlist: [],
    notificationsOn: true,
    priceDropThreshold: 10
  },
  
  priceHistory: {
    cached: {},
    lastUpdate: null,
    updateInterval: 3600000,
    retentionDays: 30
  }
};
```

### 5.2 Sincronización LocalStorage

```javascript
// En utils/storage.js - Agregar:
function saveComparisonState() {
  const toSave = {
    selectedProducts: STATE.comparison.selectedProducts,
    filters: STATE.comparison.filters,
    watchlist: STATE.alerts.watchlist,
    priceHistory: STATE.priceHistory
  };
  localStorage.setItem('priceComparison', JSON.stringify(toSave));
}

function loadComparisonState() {
  const saved = localStorage.getItem('priceComparison');
  if (saved) {
    const data = JSON.parse(saved);
    STATE.comparison.selectedProducts = data.selectedProducts || [];
    STATE.comparison.filters = data.filters || {};
    STATE.alerts.watchlist = data.watchlist || [];
    STATE.priceHistory = data.priceHistory || {};
  }
}
```

---

## 6. API ENDPOINTS REQUERIDOS

### Existentes (✅ Funcionales)
- `GET /api/products.php` - Lista todos los productos
- `GET /api/products.php?id=p001` - Producto específico
- `GET /api/products.php?category=tecnologia` - Por categoría
- `GET /api/products.php?featured=true` - Destacados
- `GET /api/products.php?search=iphone` - Búsqueda
- `GET /api/products.php?sort=price_asc` - Ordenamiento

### Nuevos a Crear (⏳ Implementar)
- `GET /api/price-history.php?product_id=p001` - Historial de precios
- `GET /api/alerts.php` - Obtener alertas del usuario
- `POST /api/alerts.php` - Crear nueva alerta
- `DELETE /api/alerts.php?alert_id=a001` - Eliminar alerta
- `GET /api/vendors.php` - Lista de plataformas conocidas
- `WS /ws/prices` - WebSocket para actualizaciones en tiempo real

---

## 7. MÓDULOS Y RESPONSABILIDADES

| Módulo | Responsabilidad | Dependencias |
|--------|-----------------|--------------|
| `price-comparison.js` | Búsqueda, filtrado, cálculo de mejores precios | helpers.js, storage.js |
| `price-alerts.js` | Sistema de alertas y monitoreo | price-comparison.js |
| `price-history.js` | Historial de precios y gráficos | storage.js |
| `comparison-panel.js` | Renderización UI del panel | price-comparison.js, ui.js |
| `price-widgets.js` | Componentes visuales reutilizables | theme.css |

---

## 8. COMPONENTES UI

### 8.1 Búsqueda
- Input de búsqueda con autocompletado
- Filtros: categoría, rango de precio, rating mínimo
- Botones: Limpiar filtros, Guardar búsqueda

### 8.2 Tabla Comparativa
- Productos seleccionados en columnas
- Plataformas en filas
- Colores para destacar mejor precio
- Iconos de disponibilidad

### 8.3 Alertas
- Toggle para habilitar/deshabilitar alertas
- Configuración de umbral de caída de precio
- Lista de productos monitoreados
- Historial de alertas disparadas

### 8.4 Exportación
- Botón CSV
- Botón JSON
- Compartir enlace

---

## 9. TEMAS Y ESTILOS

### Usar Variables CSS Existentes (theme.css)
```css
/* Colores */
--bg0: #0b0c0d
--bg1: #131416
--tx0: #f2f2f2
--tx1: #c9ccd0

/* Nuevas variables para comparación */
--price-best: #4a9eff
--price-avg: #8b9095
--price-high: #ff6b6b
--available: #50c878
--unavailable: #a0a0a0
```

---

## 10. CHECKLIST DE IMPLEMENTACIÓN

### Preparación (Pre-Code)
- [ ] Revisar arquitectura FlowLab completa
- [ ] Planificar estructura de archivos
- [ ] Diseñar wireframes de UI
- [ ] Definir contrato de API

### FASE 1: Infraestructura
- [ ] Extender STATE con propiedades de comparación
- [ ] Crear price-comparison.js
- [ ] Crear price-alerts.js
- [ ] Crear comparison-panel.js
- [ ] Crear página HTML price-comparison.html
- [ ] Verificar carga de módulos en orden correcto
- [ ] Testing: búsqueda y filtrado básico

### FASE 2: Visualización
- [ ] Crear tabla comparativa
- [ ] Crear price-history.js
- [ ] Añadir gráficos de variación
- [ ] Implementar exportación CSV/JSON
- [ ] Testing: tabla y gráficos

### FASE 3: Integración FlowLab
- [ ] Crear nodo ejecutable price-comparison
- [ ] Conectar con STATE global
- [ ] Implementar execution logic
- [ ] Testing: flujos end-to-end

### FASE 4: Pulido
- [ ] Tests unitarios
- [ ] Performance optimization
- [ ] Documentation
- [ ] User testing
- [ ] Fix bugs encontrados

---

## 11. ORDEN DE DESARROLLO RECOMENDADO

```
Semana 1:
├── Lunes: STATE extension + price-comparison.js base
├── Martes: API endpoints + search functionality
├── Miércoles: UI básico + comparison-panel.js
├── Jueves: price-alerts.js
└── Viernes: Testing y fix bugs

Semana 2:
├── Lunes: Tabla comparativa avanzada
├── Martes: Gráficos de variación
├── Miércoles: Exportación (CSV, JSON)
├── Jueves: price-history.js
└── Viernes: Performance optimization

Semana 3:
├── Lunes: Integración con nodo FlowLab
├── Martes: WebSocket para updates en tiempo real
├── Miércoles: Sincronización STATE
├── Jueves: Integration testing
└── Viernes: Bug fixes

Semana 4:
├── Lunes: Unit tests para cada módulo
├── Martes: E2E testing
├── Miércoles: Documentation
├── Jueves: UX refinement
└── Viernes: Final polish
```

---

## 12. TECNOLOGÍAS Y LIBRERÍAS

### Fronted Stack
- **Vanilla JavaScript** (sin dependencias externas de la UI)
- **Chart.js** (gráficos - opcional en FASE 2)
- **LocalStorage** (persistencia)

### Backend Stack
- **PHP** (existente)
- **JSON** (data format)
- **WebSocket** (tiempo real - FASE 3)

### Testing
- **Jest** (unit tests)
- **Cypress** (E2E tests)

---

## 13. SEGURIDAD Y VALIDACIÓN

- Sanitizar inputs de búsqueda
- Validar filtros en backend
- CORS headers correctos
- Rate limiting en API
- XSS prevention en rendering
- CSRF tokens para POST requests

---

## 14. ACCESIBILIDAD

- WCAG 2.1 AA compliance
- Aria labels en elementos interactivos
- Keyboard navigation completo
- Dark theme support (ya existe en FlowLab)
- Screen reader friendly

---

## 15. PRÓXIMOS PASOS INMEDIATOS

1. **Revisar** este documento con el equipo
2. **Validar** que la arquitectura se alinea con FlowLab
3. **Crear** rama para development
4. **Implementar** FASE 1 base
5. **Hacer demo** al stakeholder cada viernes

---

**Documento creado**: 2026-10-03  
**Próxima revisión**: 2026-10-10  
**Owner**: Development Team + Claude + Qwen
