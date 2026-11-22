# Nodos de estadísticas (5 gráficos) — Guía de integración

Cinco componentes de React que renderizan nodos de gráficos con estética de
"mapa de flujos" oscuro. **Sin dependencias externas**: solo React + Tailwind CSS v4.
No usan librerías de gráficos (todo es SVG y divs), así que funcionan en
cualquier proyecto React (Vite, Next.js, TanStack, CRA, etc.).

## Archivos

| Archivo | Para qué sirve |
|---|---|
| `stat-nodes/StatNodes.tsx` | Los 5 componentes de gráficos + el contenedor `NodeShell`. Es el único archivo de código obligatorio. |
| `stat-nodes/stat-nodes.css` | Variables de color, tokens de Tailwind v4 y animaciones. Obligatorio para que se vean bien. |
| `stat-nodes/DemoPage.tsx` | Página de ejemplo con datos inventados. Solo de referencia; bórrala si quieres. |

## Requisitos

1. **React 18 o 19.**
2. **Tailwind CSS v4** (los componentes usan clases de utilidad como
   `bg-node`, `text-node-muted`, `rounded-xl`, `flex`, etc.).
   - Si tu proyecto usa Tailwind v3, pide a tu IA que traduzca el bloque
     `@theme inline` a `tailwind.config.js` (colores `node`, `node-border`,
     `node-text`, `node-muted`, `viz-1..5`, `viz-up`, `viz-down`).
   - Si no usas Tailwind, tu IA deberá reemplazar las clases por CSS propio;
     los colores ya están como variables CSS (`var(--viz-1)`, etc.).
3. Fuente monoespaciada opcional: "JetBrains Mono" (si no está, cae en
   `ui-monospace` del sistema).

## Instalación

1. Copia `stat-nodes/StatNodes.tsx` a tu carpeta de componentes.
2. Pega el contenido de `stat-nodes/stat-nodes.css` en tu CSS global
   (debajo de `@import "tailwindcss"`).
3. Importa y usa los componentes (ver `DemoPage.tsx`).

## Los 5 componentes y sus props

### 1. `LineChartNode` — tendencia en el tiempo
```tsx
<LineChartNode
  title="Performance"        // título del nodo
  subtitle="ROI semanal"     // subtítulo opcional
  unit="%"                   // sufijo de los valores
  accent="var(--viz-1)"      // color principal (cualquier color CSS)
  data={[{ label: "Semana 1", value: 12 }, { label: "Semana 2", value: 15 }]}
/>
```
Muestra valor grande, variación % entre primer y último punto, min/max y
hover por punto.

### 2. `BarChartNode` — comparar categorías
```tsx
<BarChartNode
  title="Leads por canal"
  data={[{ label: "SEO", value: 420, previous: 360 }]}  // `previous` es opcional
/>
```
Compara el valor actual contra el período anterior; hover por barra con
variación %.

### 3. `DonutChartNode` — distribución de un total
```tsx
<DonutChartNode
  title="Tráfico por dispositivo"
  centerLabel="visitas"
  data={[{ label: "Desktop", value: 5400, color: "var(--viz-2)" }]}  // `color` opcional
/>
```
Centro con total o % de la porción en hover, leyenda lateral.

### 4. `GaugeNode` — progreso hacia una meta
```tsx
<GaugeNode
  title="Meta mensual"
  value={7400}
  target={10000}
  unit="$"
  thresholds={[0.5, 0.85]}  // opcional: cortes para "en riesgo" / "en camino" / "meta ok"
/>
```
Cambia color y etiqueta según el avance; aguja y arco animados.

### 5. `FunnelNode` — conversión entre etapas
```tsx
<FunnelNode
  title="Conversión"
  data={[{ label: "Visitas", value: 14000 }, { label: "Registro", value: 640 }]}
/>
```
Muestra % de conversión paso a paso (rojo si cae por debajo de 40%) y
conversión total en el pie.

## Notas para la IA que lo integre

- Todos los componentes son **controlados**: reciben datos por props, no
  hacen fetch. Conéctalos a tu estado o API.
- `NodeShell` es el contenedor común (borde, barra de acento, handles de
  conexión arriba/abajo). Si tu mapa de nodos usa React Flow o similar,
  puedes envolver estos componentes dentro de tus nodos personalizados y
  quitar los `span` de handles que trae `NodeShell`.
- El formato de números (`fmt`) abrevia: 1.2k, 3.4M.
- Los colores se controlan con las variables CSS `--viz-1` a `--viz-5`,
  `--viz-up`, `--viz-down` y las de superficie `--node*` / `--canvas*`.
  Cambiando esas variables se retoca todo el tema sin tocar los componentes.
- TypeScript estricto: los tipos `Point`, `Bar`, `Slice`, `Stage` están
  exportados desde `StatNodes.tsx`.
