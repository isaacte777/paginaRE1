// CONSTANTS: Configuración central de FlowLab
const CONFIG = {
  KEY: 'flowlab-paginaRE-v3',
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
    human: 'Humano', note: 'Nota', sub: 'Subproceso'
  },

  // Esquema de parámetros por tipo de nodo (para inspectores)
  NODE_PARAMS: {
    ai: [
      { key: 'model', label: 'Modelo', type: 'select', options: ['gpt-4', 'gpt-3.5', 'claude'], default: 'gpt-4' },
      { key: 'temp', label: 'Temperatura', type: 'number', min: 0, max: 1, default: 0.7 },
      { key: 'prompt', label: 'Prompt', type: 'text', default: '' }
    ],
    db: [
      { key: 'dbtype', label: 'Tipo', type: 'select', options: ['postgres', 'mysql', 'mongodb'], default: 'postgres' },
      { key: 'query', label: 'Query', type: 'text', default: '' }
    ],
    api: [
      { key: 'method', label: 'Método', type: 'select', options: ['GET', 'POST', 'PUT', 'DELETE'], default: 'GET' },
      { key: 'url', label: 'URL', type: 'text', default: '' },
      { key: 'timeout', label: 'Timeout (ms)', type: 'number', default: 5000 }
    ],
    decision: [
      { key: 'condition', label: 'Condición', type: 'text', default: '' }
    ],
    delay: [
      { key: 'ms', label: 'Milisegundos', type: 'number', default: 1000 }
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
