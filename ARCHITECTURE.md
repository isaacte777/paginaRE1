# FlowLab - Documentación de Arquitectura Modularizada

## 📋 Resumen Ejecutivo

FlowLab es una herramienta visual de orquestación de agentes IA (Claude + Qwen) construida con una **arquitectura modularizada** en lugar de monolítica. Cada funcionalidad está separada en módulos independientes organizados por responsabilidad.

**Estado**: ✓ Listo para usar  
**Ubicación**: `C:\xampp\htdocs\paginaRE`  
**Acceso**: `http://localhost/paginaRE/coordination.html`

---

## 🏗️ Estructura de Directorios

```
paginaRE/
├── coordination.html              # Punto de entrada principal
├── modules-dashboard.html         # Dashboard de monitoreo
│
├── css/                           # Estilos modularizados (4 archivos)
│   ├── theme.css                  # Variables de color, animaciones globales
│   ├── layout.css                 # Header, main layout, responsive
│   ├── nodes.css                  # Estilos de nodos y conexiones
│   └── ui.css                     # Componentes UI generales
│
└── js/                            # Lógica modularizada (17 archivos)
    ├── core/                      # Fundación (2 archivos)
    │   ├── constants.js           # CONFIG global, configuraciones
    │   └── state.js               # STATE global, referencias DOM, initDOM()
    │
    ├── utils/                     # Funciones auxiliares (2 archivos)
    │   ├── helpers.js             # generateUID, byId, createNode, escapeHTML, etc.
    │   └── storage.js             # saveState, loadState, exportJSON, importJSON
    │
    ├── canvas/                    # Renderizado del canvas (3 archivos)
    │   ├── render.js              # renderNodes, drawEdges, computeEdge
    │   ├── viewport.js            # applyTransform, zoom, pan, fitView
    │   └── minimap.js             # drawMinimap, interacción minimap
    │
    ├── interaction/               # Interacción del usuario (3 archivos)
    │   ├── gestures.js            # Eventos mouse, teclado, drag-drop
    │   ├── selection.js           # setSel, deleteSel
    │   └── editing.js             # startEdit, edición inline de nodos
    │
    ├── features/                  # Características avanzadas (4 archivos)
    │   ├── history.js             # commitHistory, undo, redo
    │   ├── templates.js           # getTemplate, plantillas predefinidas
    │   ├── export.js              # Funciones de exportación/importación
    │   └── execution.js           # Simulación de ejecución de flujos
    │
    ├── ui/                        # Componentes de interfaz (3 archivos)
    │   ├── panel.js               # updatePanel, propiedades nodo/edge
    │   ├── console.js             # log, simulateExecution
    │   └── footer.js              # Estadísticas e información de estado
    │
    └── app.js                     # Orquestador principal (1 archivo)
```

---

## 📊 Estadísticas

| Métrica | Valor |
|---------|-------|
| Archivos CSS | 4 |
| Archivos JS | 17 |
| Directorios funcionales | 7 |
| Líneas de código totales | ~3,500+ |
| Estado | ✓ Ready |
| Compatibilidad | Claude + Qwen |

---

## 🔄 Orden de Carga de Módulos

El archivo `coordination.html` carga los módulos en este orden (crítico para evitar dependencias circulares):

### Phase 1: Fundación
```html
<script src="js/core/constants.js"></script>
<script src="js/core/state.js"></script>
```
**Propósito**: Configuración global y estado de la aplicación

### Phase 2: Utilidades
```html
<script src="js/utils/helpers.js"></script>
<script src="js/utils/storage.js"></script>
```
**Propósito**: Funciones auxiliares disponibles globalmente

### Phase 3: Renderizado
```html
<script src="js/canvas/render.js"></script>
<script src="js/canvas/viewport.js"></script>
<script src="js/canvas/minimap.js"></script>
```
**Propósito**: Funciones de dibujo y manipulación del canvas

### Phase 4: Interacción
```html
<script src="js/interaction/gestures.js"></script>
<script src="js/interaction/selection.js"></script>
<script src="js/interaction/editing.js"></script>
```
**Propósito**: Manejo de entrada del usuario

### Phase 5: Features
```html
<script src="js/features/history.js"></script>
<script src="js/features/templates.js"></script>
<script src="js/features/export.js"></script>
<script src="js/features/execution.js"></script>
```
**Propósito**: Características avanzadas

### Phase 6: UI
```html
<script src="js/ui/panel.js"></script>
<script src="js/ui/console.js"></script>
```
**Propósito**: Componentes visuales

### Phase 7: Orquestador
```html
<script src="js/app.js"></script>
```
**Propósito**: Inicialización final y conectar todo

---

## 📚 Descripción de Módulos

### Core Modules

#### `constants.js`
- **Responsabilidad**: Configuración global
- **Contenidos**:
  - `CONFIG` object con:
    - `KEY`: Clave de almacenamiento
    - `ZOOM_MIN/MAX`: Límites de zoom
    - `SNAP_GRID`: Tamaño de grid para snap
    - `HISTORY_LIMIT`: Máximo de pasos en historial
    - `CONSOLE_MAX_LINES`: Máximo de líneas en consola
    - `NS`: Namespace para SVG
    - `BADGE`: Mapa de tipos
    - `NODE_TYPES`: Definición de tipos de nodos

#### `state.js`
- **Responsabilidad**: Estado global de la aplicación
- **Contenidos**:
  - `STATE` object con:
    - `nodes[]`: Array de nodos
    - `edges[]`: Array de conexiones
    - `pan`: {x, y} para desplazamiento
    - `zoom`: Factor de zoom
    - `sel`: Selección actual
    - `statusFilter`: Filtro de estado
    - `dragging`, `panning`, `connecting`, `editing`: Estados
    - `history[]`: Historial de cambios
  - `DOM`: Referencias a elementos del DOM
  - `initDOM()`: Inicializa referencias
  - `resetState()`: Reinicia el estado

### Utils Modules

#### `helpers.js`
- **Responsabilidad**: Funciones auxiliares reutilizables
- **Contenidos**:
  - `generateUID(prefix)`: Genera IDs únicos
  - `byId(id)`: Obtiene nodo por ID
  - `escapeHTML(s)`: Escapa caracteres HTML
  - `clamp(v, a, b)`: Limita valor entre rangos
  - `createNode(type, text, x, y)`: Factory para nodos
  - `createEdge(fromId, toId, label, kind)`: Factory para edges
  - `screenToWorld(cx, cy)`: Convierte coordenadas
  - `nodeEl(id)`: Obtiene elemento DOM del nodo
  - `anchorPoint(n, side)`: Calcula puntos de conexión
  - `autoSide(nf, nt)`: Determina lado automáticamente
  - `bbox()`: Bounding box del canvas

#### `storage.js`
- **Responsabilidad**: Persistencia de datos
- **Contenidos**:
  - `saveState()`: Guarda en localStorage
  - `loadState()`: Carga desde localStorage
  - `exportJSON()`: Exporta como JSON
  - `importJSON(file)`: Importa desde JSON

### Canvas Modules

#### `render.js`
- **Responsabilidad**: Renderización visual
- **Contenidos**:
  - `renderNodes()`: Dibuja todos los nodos
  - `drawEdges()`: Dibuja todas las conexiones
  - `computeEdge(e)`: Calcula ruta de conexión
  - `updateStatus()`: Actualiza estados visuales
  - `renderAll()`: Renderización completa

#### `viewport.js`
- **Responsabilidad**: Control de vista y zoom
- **Contenidos**:
  - `applyTransform()`: Aplica transformación
  - `zoomAt(cx, cy, nz)`: Zoom en punto específico
  - `fitView()`: Ajusta vista a contenido

#### `minimap.js`
- **Responsabilidad**: Minimap de navegación
- **Contenidos**:
  - `drawMinimap()`: Dibuja minimap en canvas
  - Interacción: clic en minimap desplaza el viewport

### Interaction Modules

#### `gestures.js`
- **Responsabilidad**: Eventos del usuario
- **Contenidos**:
  - Mouse events: down, move, up
  - Keyboard events: shortcuts
  - Drag & drop: nodos, conexiones
  - Context menu: operaciones

#### `selection.js`
- **Responsabilidad**: Selección de elementos
- **Contenidos**:
  - `setSel(s)`: Selecciona elemento
  - `deleteSel()`: Elimina selección

#### `editing.js`
- **Responsabilidad**: Edición de nodos
- **Contenidos**:
  - `startEdit(nEl)`: Inicia edición inline
  - Manejo de Enter/Blur para confirmar

### Features Modules

#### `history.js`
- **Responsabilidad**: Undo/Redo
- **Contenidos**:
  - `commitHistory()`: Guarda punto en historial
  - `restore(s)`: Restaura estado anterior
  - `undo()`: Deshacer
  - `redo()`: Rehacer

#### `templates.js`
- **Responsabilidad**: Plantillas predefinidas
- **Contenidos**:
  - `getTemplate(name)`: Retorna template
  - Plantillas: 'orquestador', 'web', 'blank'

#### `export.js`
- **Responsabilidad**: Import/Export
- **Contenidos**:
  - Referencia a funciones en storage.js

#### `execution.js`
- **Responsabilidad**: Simulación de ejecución
- **Contenidos**:
  - `simulateExecution()`: Anima ejecución de flujo
  - Transiciones de estados visuales

### UI Modules

#### `panel.js`
- **Responsabilidad**: Panel de propiedades
- **Contenidos**:
  - `updatePanel()`: Actualiza propiedades según selección
  - Interfaz para editar nodo/edge

#### `console.js`
- **Responsabilidad**: Consola de logs
- **Contenidos**:
  - `log(type, msg)`: Registra mensaje
  - `simulateExecution()`: Controla ejecución

### App Module

#### `app.js`
- **Responsabilidad**: Orquestación y arranque
- **Contenidos**:
  - `initApp()`: Inicializa la aplicación
  - `registerEventListeners()`: Registra todos los eventos
  - Conexión de todos los módulos

---

## 🎯 Ventajas de la Arquitectura Modularizada

### 1. **Mantenibilidad**
- Cada módulo tiene **una única responsabilidad**
- Fácil localizar y debuggear errores
- Cambios localizados sin efectos secundarios

### 2. **Escalabilidad**
- Agregar nuevas features sin romper existentes
- Posibilidad de lazy loading de módulos
- Reutilizar en otros proyectos

### 3. **Performance**
- Tree-shaking en builds de producción
- Separación de concerns minimiza bundle
- Código más eficiente sin duplicación

### 4. **Colaboración**
- Claude + Qwen pueden trabajar en módulos diferentes
- Conflictos minimizados
- Código reviews más enfocados

### 5. **Testing**
- Módulos desacoplados son fáciles de testear
- Mocks más simples
- Cobertura de tests más clara

---

## 🚀 Puntos de Acceso

| Recurso | URL |
|---------|-----|
| FlowLab Principal | `http://localhost/paginaRE/coordination.html` |
| Dashboard de Módulos | `http://localhost/paginaRE/modules-dashboard.html` |
| Ruta Local | `C:\xampp\htdocs\paginaRE` |

---

## 💡 Flujo de Desarrollo

### Agregar una Nueva Feature

1. **Identificar responsabilidad** → Categoría existente o crear nueva
2. **Crear archivo** en directorio correspondiente (ej: `js/features/newfeature.js`)
3. **Implementar función** con scope global (sin namespace)
4. **Registrar evento** en `app.js` → `registerEventListeners()`
5. **Importar en HTML** → Agregar `<script>` en orden correcto
6. **Testar** en `coordination.html`

### Debuggear un Error

1. Abrir `coordination.html` en navegador
2. Abrir Developer Console (F12)
3. Identificar módulo por stack trace
4. Ir a archivo específico (`js/[categoria]/[modulo].js`)
5. Debuggear localmente

### Optimizar Performance

1. Analizar con DevTools Performance tab
2. Identificar módulo lento
3. Optimizar función específica
4. Re-testear

---

## 🔧 Guía de Configuración

### Cambiar Colores (theme.css)
```css
:root {
  --primary: #00d9ff;    /* Color primario */
  --secondary: #00a3cc;  /* Color secundario */
  --success: #00cc66;    /* Éxito */
  --error: #ff4444;      /* Error */
}
```

### Agregar Tipo de Nodo Nuevo
1. Editar `constants.js` → agregar en `NODE_TYPES`
2. Editar `nodes.css` → agregar estilos `.pv-newtype`
3. Editar `templates.js` → usar en plantillas si necesario

### Cambiar Límites de Grid
Editar en `constants.js`:
```javascript
SNAP_GRID: 10,      // Menor = más fino
ZOOM_MIN: 0.2,      // Zoom mínimo
ZOOM_MAX: 5,        // Zoom máximo
```

---

## 📝 Notas de Implementación

- **No usar global scope sin necesidad** → Todas las funciones con scope global
- **Mantener orden de carga** → Dependencias respetadas
- **LocalStorage**: Persistencia automática en `STATE`
- **SVG Namespace**: Usar `CONFIG.NS` para crear elementos SVG
- **Event delegation**: Usar en `app.js` para eventos

---

## ✨ Próximas Mejoras Sugeridas

1. **Lazy Loading**: Cargar módulos bajo demanda
2. **Webpack Bundle**: Optimizar para producción
3. **Testing Suite**: Jest o Vitest
4. **API Integration**: Conectar con backend
5. **Real-time Sync**: WebSockets para colaboración

---

## 📞 Soporte

**Estado Actual**: Listo para usar ✓  
**Última Actualización**: 2026-10-03  
**Mantenedor**: Claude Code + Qwen Coder