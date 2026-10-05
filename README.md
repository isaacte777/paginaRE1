# Comparador de Precios - PaginaRE

Aplicación web para comparar precios de productos entre Amazon, eBay y AliExpress.

## Características

- 🔍 Búsqueda y comparación de productos
- 💰 Precios actualizados de múltiples plataformas
- 📊 Visualización clara del mejor precio
- 🏷️ Categorías variadas: Tecnología, Hogar, Ropa, Deportes, etc.
- ⭐ Productos recomendados

## Tecnologías

- **Frontend:** React + Vite
- **Backend:** PHP (API REST)
- **Base de datos:** MySQL (opcional para datos persistentes)

## Instalación

### Backend (PHP API)

1. Asegúrate de tener XAMPP corriendo
2. La API estará disponible en `http://localhost/paginaRE/backend/api/`

### Frontend (React)

```bash
cd frontend
npm install
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`

## Estructura

```
paginaRE/
├── backend/
│   ├── api/
│   │   ├── products.php      # Endpoints de productos
│   │   ├── categories.php    # Endpoints de categorías
│   │   └── compare.php       # Comparación de precios
│   ├── data/
│   │   └── products.json     # Datos simulados
│   └── config.php            # Configuración
├── frontend/
│   ├── src/
│   │   ├── components/       # Componentes React
│   │   ├── services/         # Servicios API
│   │   ├── pages/            # Páginas
│   │   └── App.jsx
│   └── package.json
└── README.md
```

## Próximos pasos

- Integrar APIs reales de Amazon, eBay y AliExpress
- Agregar base de datos MySQL para caché de precios
- Implementar autenticación de usuarios
- Agregar favoritos y listas de deseos
