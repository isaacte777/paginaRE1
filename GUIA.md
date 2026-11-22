# Comparador de Precios - Guía de Uso

## ✅ Backend Configurado

El backend en PHP está listo. Si tienes XAMPP corriendo, la API está disponible en:

```
http://localhost/paginaRE/backend/api/products.php
http://localhost/paginaRE/backend/api/categories.php
http://localhost/paginaRE/backend/api/compare.php?id=p001
```

## 🚀 Iniciar el Frontend

1. Abre una terminal en el directorio `frontend`:
   ```bash
   cd C:\xampp\htdocs\paginaRE\frontend
   ```

2. Inicia el servidor de desarrollo:
   ```bash
   npm run dev
   ```

3. Abre tu navegador en: `http://localhost:5173`

## 📋 Funcionalidades

### ✨ Ya implementadas:

- ✅ **Visualización de productos** con imágenes y descripciones
- ✅ **Comparación de precios** entre Amazon, eBay y AliExpress
- ✅ **Filtros por categoría** (Tecnología, Hogar, Ropa, Deportes)
- ✅ **Búsqueda** por nombre o descripción
- ✅ **Ordenamiento** por precio o valoración
- ✅ **Productos destacados** con badge especial
- ✅ **Cálculo automático** del mejor precio total (incluye envío)
- ✅ **Indicadores visuales** del mejor precio y diferencias porcentuales
- ✅ **Responsive design** para móviles y tablets

### 🎨 Características de Diseño:

- Colores distintivos por plataforma (Amazon: naranja, eBay: rojo, AliExpress: rojo oscuro)
- Badges de "Destacado" y "Mejor precio"
- Comparación expandible en cada producto
- Animaciones suaves y transiciones
- Diseño moderno y limpio

## 🔧 Endpoints de la API

### Obtener todos los productos
```bash
GET /backend/api/products.php
```

### Filtrar por categoría
```bash
GET /backend/api/products.php?category=tecnologia
```

### Buscar productos
```bash
GET /backend/api/products.php?search=iphone
```

### Ordenar productos
```bash
GET /backend/api/products.php?sort=price_asc
GET /backend/api/products.php?sort=price_desc
GET /backend/api/products.php?sort=rating
```

### Obtener categorías
```bash
GET /backend/api/categories.php
```

### Comparar precios de un producto
```bash
GET /backend/api/compare.php?id=p001
```

## 📦 Datos de Ejemplo

El sistema incluye 8 productos de ejemplo:
- 3 productos de tecnología (iPhone, Galaxy, MacBook, Audífonos Sony)
- 2 productos de hogar (Roomba, Cafetera Nespresso)
- 1 producto de ropa (Zapatillas Nike)
- 1 producto de deportes (Bicicleta Trek)

Cada producto tiene precios de las 3 plataformas con:
- Precio base
- Costo de envío
- Disponibilidad
- Rating del vendedor

## 🔄 Próximos Pasos

### Para integrar APIs reales:

1. **Amazon Product Advertising API**
   - Requiere cuenta de Amazon Associates
   - Documentación: https://webservices.amazon.com/paapi5/documentation/

2. **eBay Finding API**
   - Requiere cuenta de desarrollador de eBay
   - Documentación: https://developer.ebay.com/

3. **AliExpress API**
   - Requiere cuenta de Portals.aliexpress.com
   - Documentación: https://portals.aliexpress.com/

### Para agregar base de datos:

1. Crear base de datos en phpMyAdmin:
   ```sql
   CREATE DATABASE comparador_precios;
   ```

2. Crear tablas para productos, categorías y precios

3. Actualizar `config.php` con las credenciales

### Para mejorar:

- [ ] Agregar sistema de usuarios y favoritos
- [ ] Implementar historial de precios con gráficos
- [ ] Agregar alertas de precio
- [ ] Implementar caché de precios
- [ ] Agregar paginación para muchos productos
- [ ] Sistema de recomendaciones personalizadas
- [ ] Comparación de especificaciones técnicas

## 🐛 Solución de Problemas

### El frontend no carga datos:
1. Verifica que XAMPP esté corriendo
2. Abre `http://localhost/paginaRE/backend/api/products.php` en el navegador
3. Deberías ver un JSON con los productos

### Error de CORS:
Ya está configurado en `config.php` para permitir peticiones desde cualquier origen.

### Error 404 en la API:
Verifica que la ruta en `vite.config.js` apunte correctamente a tu instalación de XAMPP.

## 📝 Estructura de Archivos

```
paginaRE/
├── backend/
│   ├── api/
│   │   ├── products.php      # CRUD de productos
│   │   ├── categories.php    # Listado de categorías
│   │   └── compare.php       # Comparación detallada
│   ├── data/
│   │   └── products.json     # Datos simulados
│   ├── config.php            # Configuración y CORS
│   └── .htaccess            # Apache config
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Header.jsx
│   │   │   ├── SearchBar.jsx
│   │   │   ├── CategoryFilter.jsx
│   │   │   ├── ProductGrid.jsx
│   │   │   ├── ProductCard.jsx
│   │   │   └── PriceComparison.jsx
│   │   ├── services/
│   │   │   └── api.js        # Cliente API
│   │   ├── App.jsx           # Componente principal
│   │   ├── App.css           # Estilos
│   │   ├── index.css
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   └── vite.config.js        # Configuración Vite + proxy
└── README.md
```

## 🎯 ¡Listo para usar!

Tu comparador de precios está completamente funcional. Solo ejecuta `npm run dev` en el directorio frontend y comienza a comparar precios.
