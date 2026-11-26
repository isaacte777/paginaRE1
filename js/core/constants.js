// CONSTANTS: Configuración central de FlowLab
const CONFIG = {
  KEY: 'flowlab-paginaRE-v3',
  PROJECTS_KEY: 'flowlab-saved-projects-v1',
  ZOOM_MIN: 0.25,
  ZOOM_MAX: 2.5,
  SNAP_GRID: 12,
  HISTORY_LIMIT: 60,
  CONSOLE_MAX_LINES: 100,
  NS: 'http://www.w3.org/2000/svg',

  BADGE: {
    pending: '[ ]',
    progress: '[~]',
    done: '[✓]',
    error: '[!]'
  },

  NODE_TYPES: {
    start: 'Inicio', end: 'Fin', process: 'Proceso',
    decision: 'Decisión', loop: 'Bucle', parallel: 'Paralelo',
    io: 'E/S', db: 'BD', varset: 'Variable',
    api: 'API', hook: 'Webhook', tryc: 'Try/Catch',
    err: 'Error', delay: 'Espera', ai: 'IA/LLM',
    human: 'Humano', note: 'Nota', sub: 'Subproceso',
    chart_bar: 'Gráfico Barras',
    chart_donut: 'Gráfico Donut',
    chart_gauge: 'Gráfico Gauge',
    chart_funnel: 'Gráfico Funnel'
  },

  // Esquema de parámetros por tipo de nodo (para el menú de edición avanzado)
  NODE_PARAMS: {
    ai: [
      { key: 'model', label: 'Modelo', type: 'select', options: ['gpt-4o', 'gpt-4o-mini', 'claude-3.5-sonnet', 'gemini-2.0-flash', 'qwen2.5-coder'], default: 'gpt-4o' },
      { key: 'temp', label: 'Temperatura', type: 'number', min: 0, max: 2, step: 0.1, default: 0.7 },
      { key: 'prompt', label: 'Prompt / Instrucción', type: 'textarea', default: '' }
    ],
    db: [
      { key: 'dbtype', label: 'Motor BD', type: 'select', options: ['postgres', 'mysql', 'mongodb', 'sqlite', 'redis', 'supabase'], default: 'postgres' },
      { key: 'table', label: 'Tabla / Colección', type: 'text', default: '' },
      { key: 'query', label: 'Consulta / Operación', type: 'textarea', default: '' }
    ],
    api: [
      { key: 'method', label: 'Método HTTP', type: 'select', options: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'], default: 'GET' },
      { key: 'url', label: 'Endpoint URL', type: 'text', default: '' },
      { key: 'timeout', label: 'Timeout (ms)', type: 'number', min: 100, max: 120000, default: 5000 }
    ],
    decision: [
      { key: 'condition', label: 'Expresión / Regla de decisión', type: 'text', default: '' },
      { key: 'trueBranch', label: 'Etiqueta si cumple', type: 'text', default: 'Sí' },
      { key: 'falseBranch', label: 'Etiqueta si no cumple', type: 'text', default: 'No' }
    ],
    loop: [
      { key: 'iterator', label: 'Colección / Límite', type: 'text', default: 'items' },
      { key: 'maxIter', label: 'Máx. iteraciones', type: 'number', min: 1, max: 10000, default: 50 }
    ],
    parallel: [
      { key: 'strategy', label: 'Sincronización', type: 'select', options: ['Esperar todas (All)', 'Primera completada (Race)', 'Independiente'], default: 'Esperar todas (All)' }
    ],
    io: [
      { key: 'direction', label: 'Dirección', type: 'select', options: ['Entrada', 'Salida', 'Archivo / Reporte'], default: 'Entrada' },
      { key: 'format', label: 'Formato', type: 'select', options: ['JSON', 'CSV', 'PDF', 'Formulario', 'Texto'], default: 'JSON' }
    ],
    varset: [
      { key: 'varName', label: 'Variable', type: 'text', default: 'resultado' },
      { key: 'varValue', label: 'Valor / Expresión', type: 'text', default: '' }
    ],
    hook: [
      { key: 'event', label: 'Evento disparador', type: 'text', default: 'webhook.received' },
      { key: 'auth', label: 'Validación', type: 'select', options: ['HMAC Secret', 'Bearer Token', 'Público'], default: 'HMAC Secret' }
    ],
    tryc: [
      { key: 'retries', label: 'Reintentos', type: 'number', min: 0, max: 10, default: 2 },
      { key: 'fallback', label: 'Acción de respaldo', type: 'text', default: '' }
    ],
    err: [
      { key: 'code', label: 'Código / Severidad', type: 'select', options: ['CRÍTICO', 'ERROR', 'ADVERTENCIA'], default: 'ERROR' },
      { key: 'notify', label: 'Canal de alerta', type: 'text', default: '' }
    ],
    human: [
      { key: 'assignee', label: 'Responsable / Rol', type: 'text', default: '' },
      { key: 'slaHours', label: 'SLA estimado (horas)', type: 'number', min: 1, max: 720, default: 24 }
    ],
    process: [
      { key: 'owner', label: 'Responsable / Área', type: 'text', default: '' },
      { key: 'estimate', label: 'Duración estimada', type: 'text', default: '' }
    ],
    sub: [
      { key: 'subflow', label: 'Módulo / Subflujo destino', type: 'text', default: '' }
    ],
    delay: [
      { key: 'ms', label: 'Tiempo de espera (ms)', type: 'number', min: 0, max: 3600000, default: 1000 }
    ],
    chart_bar: [
      { key: 'subtitle', label: 'Subtítulo personalizado', type: 'text', default: '' },
      { key: 'unit', label: 'Unidad visual', type: 'select', options: ['Automático', '%', 'Monto $', 'Unidades'], default: 'Automático' }
    ],
    chart_donut: [
      { key: 'subtitle', label: 'Subtítulo personalizado', type: 'text', default: '' }
    ],
    chart_gauge: [
      { key: 'targetPct', label: 'Meta objetivo (%)', type: 'number', min: 1, max: 100, default: 85 },
      { key: 'subtitle', label: 'Subtítulo personalizado', type: 'text', default: '' }
    ],
    chart_funnel: [
      { key: 'subtitle', label: 'Subtítulo personalizado', type: 'text', default: '' }
    ]
  },

  // Indicadores visuales para estados
  STATE_INDICATOR: {
    pending: '○',
    progress: '◐',
    done: '◑',
    error: '✕',
    blocked: '⊘'
  }
};
