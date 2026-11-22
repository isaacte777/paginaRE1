// EXPORT: Exportación a Mermaid, PNG, SVG y Markdown con Popover No Intrusivo

/**
 * Alterna la visibilidad del popover flotante de exportación
 */
function toggleExportPopover(force) {
  const popover = document.getElementById('expPopover');
  if (!popover) return;

  const willShow = force !== undefined ? force : popover.hidden;
  popover.hidden = !willShow;

  if (willShow) {
    popover.style.transform = 'translate(-50%, -50%)';
    popover.style.top = '50%';
    popover.style.left = '50%';
    // Generar código previo para el drawer
    generateMermaidString();
  }
}

/**
 * Inicializa la capacidad de arrastrar la ventana de exportación desde la cabecera
 */
function initDraggableExportPopover() {
  const popover = document.getElementById('expPopover');
  const header = popover?.querySelector('.exp-popover-header');
  const closeBtn = popover?.querySelector('.exp-close');
  if (!popover || !header) return;

  if (closeBtn) {
    closeBtn.addEventListener('pointerdown', e => {
      e.stopPropagation();
    });
    closeBtn.addEventListener('click', e => {
      e.stopPropagation();
      toggleExportPopover(false);
    });
  }

  let isDragging = false;
  let startX = 0, startY = 0;
  let initialX = 0, initialY = 0;

  header.addEventListener('pointerdown', e => {
    if (e.target.closest('.exp-close')) return;
    isDragging = true;
    startX = e.clientX;
    startY = e.clientY;

    const rect = popover.getBoundingClientRect();
    initialX = rect.left;
    initialY = rect.top;

    popover.style.transform = 'none';
    popover.style.left = initialX + 'px';
    popover.style.top = initialY + 'px';

    header.setPointerCapture(e.pointerId);
    e.preventDefault();
  });

  header.addEventListener('pointermove', e => {
    if (!isDragging) return;
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    popover.style.left = (initialX + dx) + 'px';
    popover.style.top = (initialY + dy) + 'px';
  });

  header.addEventListener('pointerup', e => {
    isDragging = false;
    try { header.releasePointerCapture(e.pointerId); } catch {}
  });
}

/**
 * Genera la sintaxis Mermaid del estado actual
 */
function generateMermaidString() {
  let mermaid = 'graph TD\n';

  if (!STATE.nodes.length) {
    mermaid += '  Empty["(Lienzo Vacío)"]\n';
    return mermaid;
  }

  STATE.nodes.forEach(node => {
    const rawText = node.text || node.type;
    const label = escapeMermaidLabel(rawText.replace(/\n/g, '<br>'));
    const shape = getMermaidShape(node.type);
    mermaid += `  ${node.id}${shape[0]}"${label}"${shape[1]}\n`;
  });

  STATE.edges.forEach(edge => {
    const label = edge.label ? `|${escapeMermaidLabel(edge.label)}|` : '';
    mermaid += `  ${edge.from} -->${label} ${edge.to}\n`;
  });

  const previewCode = document.getElementById('expPreviewCode');
  if (previewCode) {
    previewCode.textContent = mermaid;
  }

  return mermaid;
}

/**
 * Copia el código Mermaid al portapapeles
 */
function exportMermaid(showDrawer = false) {
  const mermaid = generateMermaidString();
  const previewDrawer = document.getElementById('expPreviewDrawer');

  if (showDrawer && previewDrawer) {
    previewDrawer.hidden = false;
  }

  navigator.clipboard.writeText(mermaid).then(() => {
    showToast('Mermaid copiado al portapapeles', 'ok');
    log('ok', 'Mermaid (.md) copiado al portapapeles');
  }).catch(() => {
    if (previewDrawer) previewDrawer.hidden = false;
    showToast('Selecciona el código en la vista previa', 'info');
    log('warn', 'No se pudo copiar automáticamente al portapapeles');
  });
}

/**
 * Descarga archivo Markdown con el diagrama y resumen
 */
function downloadMermaidFile() {
  const mermaid = generateMermaidString();
  const title = (document.getElementById('projTitle')?.value || 'diagrama_flowlab').trim();

  const content = `# Diagrama de Flujo: ${title}
*Generado automáticamente con FlowLab · ${new Date().toLocaleString()}*

## Diagrama Mermaid
\`\`\`mermaid
${mermaid}\`\`\`

## Métricas del Flujo
- **Nodos totales:** ${STATE.nodes.length}
- **Conexiones:** ${STATE.edges.length}
- **Estado:** ${STATE.nodes.filter(n => n.status === 'done').length}/${STATE.nodes.length} completados
`;

  const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${title.toLowerCase().replace(/[^a-z0-9_]/g, '_')}.md`;
  a.click();
  URL.revokeObjectURL(url);

  showToast('Archivo .md descargado', 'ok');
  log('ok', 'Markdown (.md) descargado');
}

/**
 * Exporta el diagrama como imagen PNG de alta calidad
 */
function exportPNG() {
  if (!STATE.nodes.length) {
    showToast('No hay nodos para exportar', 'warn');
    return;
  }

  log('info', 'Generando imagen PNG...');
  showToast('Generando imagen PNG...', 'info', 1200);

  const b = bbox();
  const pad = 50;
  const width = Math.max(900, (b.maxX - b.minX) + pad * 2);
  const height = Math.max(600, (b.maxY - b.minY) + pad * 2);

  const canvas = document.createElement('canvas');
  canvas.width = width * 2; // Retina / 2x resolution
  canvas.height = height * 2;
  const ctx = canvas.getContext('2d');
  ctx.scale(2, 2);

  // Fondo
  ctx.fillStyle = '#080c14';
  ctx.fillRect(0, 0, width, height);

  // Grid sutil
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
  ctx.lineWidth = 1;
  const gridSize = 20;
  for (let x = 0; x < width; x += gridSize) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }
  for (let y = 0; y < height; y += gridSize) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }

  const offsetX = pad - b.minX;
  const offsetY = pad - b.minY;

  // Renderizar conexiones (Edges)
  STATE.edges.forEach(edge => {
    const fn = byId(edge.from);
    const tn = byId(edge.to);
    if (!fn || !tn) return;

    const side = autoSide(fn, tn);
    const p1 = anchorPoint(fn, side.o === 'h' ? (side.dx > 0 ? 'right' : 'left') : (side.dy > 0 ? 'bottom' : 'top'));
    const p2 = anchorPoint(tn, side.o === 'h' ? (side.dx > 0 ? 'left' : 'right') : (side.dy > 0 ? 'top' : 'bottom'));

    const x1 = p1.x + offsetX;
    const y1 = p1.y + offsetY;
    const x2 = p2.x + offsetX;
    const y2 = p2.y + offsetY;

    ctx.strokeStyle = '#85898d';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(x1, y1);

    if (side.o === 'h') {
      const mx = (x1 + x2) / 2;
      ctx.bezierCurveTo(mx, y1, mx, y2, x2, y2);
    } else {
      const my = (y1 + y2) / 2;
      ctx.bezierCurveTo(x1, my, x2, my, x2, y2);
    }
    ctx.stroke();

    // Etiqueta del edge
    if (edge.label) {
      const mx = (x1 + x2) / 2;
      const my = (y1 + y2) / 2;
      ctx.fillStyle = 'rgba(10, 14, 22, 0.85)';
      ctx.fillRect(mx - 24, my - 8, 48, 16);
      ctx.fillStyle = '#a0aec0';
      ctx.font = '9px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(edge.label, mx, my);
    }
  });

  // Renderizar Nodos
  STATE.nodes.forEach(node => {
    const x = node.x + offsetX;
    const y = node.y + offsetY;
    const w = node.w || 150;
    const h = node.h || 60;
    const r = 6;

    // Sombra del nodo
    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetY = 4;

    // Caja del nodo
    ctx.fillStyle = '#111726';
    ctx.beginPath();
    ctx.roundRect ? ctx.roundRect(x, y, w, h, r) : ctx.rect(x, y, w, h);
    ctx.fill();

    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;

    // Borde
    ctx.strokeStyle = getNodeBorderColor(node.type);
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Barra superior de tipo/color
    ctx.fillStyle = getNodeColor(node.type);
    ctx.beginPath();
    if (ctx.roundRect) {
      ctx.roundRect(x, y, w, 4, [r, r, 0, 0]);
    } else {
      ctx.rect(x, y, w, 4);
    }
    ctx.fill();

    // Texto de tipo
    ctx.fillStyle = '#718096';
    ctx.font = '600 8.5px "JetBrains Mono", monospace';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText((CONFIG.NODE_TYPES[node.type] || node.type).toUpperCase(), x + 8, y + 8);

    // Texto del nodo
    ctx.fillStyle = '#e2e8f0';
    ctx.font = '500 10.5px "JetBrains Mono", monospace';
    const lines = (node.text || '').split('\n');
    lines.forEach((line, i) => {
      if (i < 2) {
        ctx.fillText(line.substring(0, 22), x + 8, y + 22 + (i * 14));
      }
    });

    // Badge de estado
    if (node.status === 'done') {
      ctx.fillStyle = '#4ade80';
      ctx.font = 'bold 9px "JetBrains Mono", monospace';
      ctx.textAlign = 'right';
      ctx.fillText('✓', x + w - 8, y + 10);
    }
  });

  const title = (document.getElementById('projTitle')?.value || 'diagrama_flowlab').trim();
  canvas.toBlob(blob => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.toLowerCase().replace(/[^a-z0-9_]/g, '_')}.png`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Imagen PNG descargada', 'ok');
    log('ok', 'PNG descargado correctamente');
  });
}

/**
 * Exporta el diagrama completo a Vector SVG descargable
 */
function exportSVG() {
  if (!STATE.nodes.length) {
    showToast('No hay nodos para exportar', 'warn');
    return;
  }

  const b = bbox();
  const pad = 50;
  const width = Math.max(900, (b.maxX - b.minX) + pad * 2);
  const height = Math.max(600, (b.maxY - b.minY) + pad * 2);
  const offsetX = pad - b.minX;
  const offsetY = pad - b.minY;

  let svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <style>
      .bg { fill: #080c14; }
      .grid { stroke: rgba(255, 255, 255, 0.04); stroke-width: 1; }
      .edge { stroke: #85898d; stroke-width: 1.5; fill: none; }
      .node-box { fill: #111726; stroke-width: 1.5; rx: 6px; }
      .node-header { font-family: 'JetBrains Mono', monospace; font-size: 8.5px; font-weight: 600; fill: #718096; }
      .node-text { font-family: 'JetBrains Mono', monospace; font-size: 10.5px; font-weight: 500; fill: #e2e8f0; }
    </style>
    <marker id="arrow" markerUnits="userSpaceOnUse" markerWidth="10" markerHeight="10" refX="8.5" refY="4.5" orient="auto">
      <path d="M0,0 L9,4.5 L0,9 Z" fill="#85898d" />
    </marker>
  </defs>

  <rect width="100%" height="100%" class="bg" />
`;

  // Edges
  STATE.edges.forEach(edge => {
    const fn = byId(edge.from);
    const tn = byId(edge.to);
    if (!fn || !tn) return;

    const side = autoSide(fn, tn);
    const p1 = anchorPoint(fn, side.o === 'h' ? (side.dx > 0 ? 'right' : 'left') : (side.dy > 0 ? 'bottom' : 'top'));
    const p2 = anchorPoint(tn, side.o === 'h' ? (side.dx > 0 ? 'left' : 'right') : (side.dy > 0 ? 'top' : 'bottom'));

    const x1 = p1.x + offsetX;
    const y1 = p1.y + offsetY;
    const x2 = p2.x + offsetX;
    const y2 = p2.y + offsetY;

    let pathD = '';
    if (side.o === 'h') {
      const mx = (x1 + x2) / 2;
      pathD = `M ${x1} ${y1} C ${mx} ${y1}, ${mx} ${y2}, ${x2} ${y2}`;
    } else {
      const my = (y1 + y2) / 2;
      pathD = `M ${x1} ${y1} C ${x1} ${my}, ${x2} ${my}, ${x2} ${y2}`;
    }

    svgContent += `  <path d="${pathD}" class="edge" marker-end="url(#arrow)" />\n`;
  });

  // Nodes
  STATE.nodes.forEach(node => {
    const x = node.x + offsetX;
    const y = node.y + offsetY;
    const w = node.w || 150;
    const h = node.h || 60;
    const borderColor = getNodeBorderColor(node.type);
    const topColor = getNodeColor(node.type);
    const titleText = (CONFIG.NODE_TYPES[node.type] || node.type).toUpperCase();
    const contentText = escapeHTML(node.text || '');

    svgContent += `
  <g transform="translate(${x}, ${y})">
    <rect width="${w}" height="${h}" class="node-box" stroke="${borderColor}" />
    <rect width="${w}" height="4" fill="${topColor}" rx="2" />
    <text x="8" y="16" class="node-header">${titleText}</text>
    <text x="8" y="34" class="node-text">${contentText}</text>
  </g>`;
  });

  svgContent += '\n</svg>';

  const title = (document.getElementById('projTitle')?.value || 'diagrama_flowlab').trim();
  const blob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${title.toLowerCase().replace(/[^a-z0-9_]/g, '_')}.svg`;
  a.click();
  URL.revokeObjectURL(url);

  showToast('Vector SVG descargado', 'ok');
  log('ok', 'Vector SVG descargado');
}

// Helpers de forma y color
function getMermaidShape(type) {
  const shapes = {
    start: ['([', '])'],
    end: ['([', '])'],
    process: ['[', ']'],
    decision: ['{', '}'],
    loop: ['[[', ']]'],
    parallel: ['[/', '/]'],
    api: ['[\\', '/]'],
    db: ['[(', ')]'],
    ai: ['{{', '}}'],
    human: ['[/\\', '/\\]'],
    metrics: ['(', ')'],
    default: ['[', ']']
  };
  return shapes[type] || shapes.default;
}

function getNodeColor(type) {
  const colors = {
    start: '#4ade80',
    end: '#ef4444',
    process: '#38bdf8',
    decision: '#f59e0b',
    loop: '#a855f7',
    parallel: '#06b6d4',
    ai: '#ec4899',
    api: '#10b981',
    db: '#6366f1',
    hook: '#14b8a6',
    io: '#8b5cf6',
    tryc: '#f97316',
    err: '#f43f5e',
    delay: '#eab308',
    human: '#fb923c',
    varset: '#0ea5e9',
    metrics: '#38bdf8'
  };
  return colors[type] || '#64748b';
}

function getNodeBorderColor(type) {
  const colors = {
    start: '#22c55e',
    end: '#dc2626',
    process: '#0284c7',
    decision: '#d97706',
    loop: '#9333ea',
    parallel: '#0891b2',
    ai: '#db2777',
    api: '#059669',
    db: '#4f46e5',
    metrics: '#0284c7'
  };
  return colors[type] || '#334155';
}

function escapeMermaidLabel(text) {
  return String(text)
    .replace(/"/g, "'")
    .replace(/[\[\]\(\)\{\}]/g, '');
}

/**
 * Inicializa tooltips flotantes que siguen al cursor al pasar el mouse por las opciones del header y de la paleta lateral
 */
function initHeaderTooltips() {
  const tooltips = {
    'templateSelect': { title: 'plantillas', desc: 'Carga arquitecturas y flujos prediseñados (pipelines, comparación, web).' },
    'btnJson': { title: 'exportar json', desc: 'Guarda el proyecto completo y su estado en un archivo JSON local.' },
    'btnLoad': { title: 'abrir json', desc: 'Carga un diagrama guardado desde un archivo JSON local.' },
    'btnMermaid': { title: 'copiar mermaid', desc: 'Copia rápidamente el código Mermaid (.md) al portapapeles.' },
    'btnPng': { title: 'exportar png', desc: 'Genera y descarga una imagen PNG de alta resolución del diagrama.' },
    'btnChat': { title: 'chat & agentes', desc: 'Abre el panel con chat de IA, monitor de agentes y diagnósticos.' },
    'btnInsp': { title: 'inspector', desc: 'Muestra el inspector de propiedades detalladas del nodo o conexión.' },
    'btnExp': { title: 'exportar avanzado', desc: 'Menú flotante para exportar en Mermaid, Markdown, PNG y SVG.' },
    'btnNew': { title: 'nuevo diagrama', desc: 'Limpia el lienzo actual para crear un diagrama desde cero.' },
    'btnRun': { title: 'ejecutar', desc: 'Inicia la simulación paso a paso del flujo de nodos conectado.' },
    'btnClearLog': { title: 'limpiar', desc: 'Borra todo el historial de registros de la consola.' },
    'btnToggleCon': { title: 'minimizar consola', desc: 'Oculta por completo la consola inferior para maximizar el espacio.' },
    'btnShowConsole': { title: 'mostrar consola', desc: 'Vuelve a mostrar la consola inferior de registros.' },
    'consoleInput': { title: 'consola powershell', desc: 'Escribe comandos interactivos (help, nodes, run, status, clear, export, reset).' },

    // Herramientas de la paleta lateral
    'start': { title: 'inicio()', desc: 'Punto de entrada principal del diagrama de flujo.' },
    'end': { title: 'fin()', desc: 'Punto final o de salida del flujo de ejecución.' },
    'process': { title: 'proceso()', desc: 'Bloque de tarea, paso operativo o procesamiento lógico.' },
    'decision': { title: 'decision()', desc: 'Punto de bifurcación condicional (sí/no, ramificaciones).' },
    'loop': { title: 'bucle()', desc: 'Estructura de repetición o iteración sobre colecciones.' },
    'parallel': { title: 'paralelo()', desc: 'Ejecución concurrente de múltiples ramas de proceso.' },
    'io': { title: 'entrada_salida()', desc: 'Operaciones de lectura y escritura de datos o archivos.' },
    'db': { title: 'base_datos()', desc: 'Conexión, consulta o almacenamiento en base de datos.' },
    'varset': { title: 'variable()', desc: 'Declaración, asignación o modificación de variables.' },
    'api': { title: 'api_http()', desc: 'Llamada HTTP a servicios externos, REST o endpoints.' },
    'hook': { title: 'webhook()', desc: 'Disparador de eventos por webhooks o notificaciones.' },
    'tryc': { title: 'try_catch()', desc: 'Bloque de control de errores y excepciones.' },
    'err': { title: 'error()', desc: 'Nodo de interrupción o manejo explícito de fallos.' },
    'delay': { title: 'espera()', desc: 'Pausa temporal o retardo en la ejecución.' },
    'ai': { title: 'llm_ia()', desc: 'Invocación a modelos de lenguaje o agentes de IA.' },
    'human': { title: 'humano()', desc: 'Punto de aprobación, revisión o intervención manual.' },
    'metrics': { title: 'metrica()', desc: 'Panel interactivo de gráficos financieros, ROI y KPIs de rendimiento.' },
    'chart_line': { title: 'gráfico_línea()', desc: 'Visualización dinámica de tendencias temporales.' },
    'chart_bar': { title: 'gráfico_barras()', desc: 'Comparativa categórica de leads y métricas.' },
    'chart_donut': { title: 'gráfico_donut()', desc: 'Distribución porcentual por categorías.' },
    'chart_gauge': { title: 'gráfico_gauge()', desc: 'Velocímetro de cumplimiento de metas y objetivos.' },
    'chart_funnel': { title: 'gráfico_funnel()', desc: 'Embudo de conversión entre etapas del proceso.' }
  };

  const tooltipEl = document.getElementById('hoverTooltip');
  if (!tooltipEl) return;

  Object.keys(tooltips).forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;

    el.addEventListener('mouseenter', e => {
      const info = tooltips[id];
      tooltipEl.innerHTML = `
        <div style="font-weight:700; color:var(--tx0); margin-bottom:4px; border-bottom:1px solid var(--line); padding-bottom:3px;">:: ${info.title}</div>
        <div style="color:var(--tx2); font-weight:400; line-height:1.35;">${info.desc}</div>
      `;
      tooltipEl.hidden = false;
      tooltipEl.style.left = (e.clientX + 14) + 'px';
      tooltipEl.style.top = (e.clientY + 14) + 'px';
    });

    el.addEventListener('mousemove', e => {
      tooltipEl.style.left = (e.clientX + 14) + 'px';
      tooltipEl.style.top = (e.clientY + 14) + 'px';
    });

    el.addEventListener('mouseleave', () => {
      tooltipEl.hidden = true;
    });
  });

  document.querySelectorAll('[data-add]').forEach(el => {
    const addType = el.dataset.add;
    const info = tooltips[addType] || { title: addType, desc: 'Herramienta de nodo para el diagrama.' };

    el.addEventListener('mouseenter', e => {
      tooltipEl.innerHTML = `
        <div style="font-weight:700; color:var(--tx0); margin-bottom:4px; border-bottom:1px solid var(--line); padding-bottom:3px;">:: ${info.title}</div>
        <div style="color:var(--tx2); font-weight:400; line-height:1.35;">${info.desc}</div>
      `;
      tooltipEl.hidden = false;
      tooltipEl.style.left = (e.clientX + 14) + 'px';
      tooltipEl.style.top = (e.clientY + 14) + 'px';
    });

    el.addEventListener('mousemove', e => {
      tooltipEl.style.left = (e.clientX + 14) + 'px';
      tooltipEl.style.top = (e.clientY + 14) + 'px';
    });

    el.addEventListener('mouseleave', () => {
      tooltipEl.hidden = true;
    });
  });
}
