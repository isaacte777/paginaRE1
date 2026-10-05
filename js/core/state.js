// STATE: Estado global de la aplicación
const STATE = {
  nodes: [],
  edges: [],
  pan: { x: 60, y: 80 },
  zoom: 1,
  sel: null,
  statusFilter: '',
  dragging: null,
  panning: null,
  connecting: null,
  editing: false,
  snapOn: true,
  history: [],
  hPtr: -1,

  // Nuevas características v4
  circuit: null,           // { upstream: Set<id>, downstream: Set<id> }
  blocked: new Set(),      // Nodos bloqueados por dependencias incompletas
  chatOpen: false,         // Panel de chat IA abierto
  agentOpen: false,        // Panel de monitoreo de agentes abierto
  syncOpen: false,         // Panel de sincronización abierto
  diagOpen: false,         // Panel de diagnósticos abierto
  bridgeActive: false,     // Indicador de conexión Claude+Qwen
  chatMessages: [],        // Historial de chat
  circuitHighlight: false, // Mostrar circuito actual
  exportFormat: 'mermaid', // 'mermaid' o 'png'
  speed: 1                 // Velocidad de ejecución (0.5, 1, 2, 4)
};

// Referencias a elementos DOM
const DOM = {
  vp: null,
  world: null,
  edgesG: null,
  panel: null,
  console: null,
  fileInput: null,
  minimap: null,
  mmx: null
};

function initDOM() {
  DOM.vp = document.getElementById('viewport');
  DOM.world = document.getElementById('world');
  DOM.edgesG = document.getElementById('edgesG');
  DOM.panel = document.getElementById('panel');
  DOM.console = document.getElementById('console');
  DOM.fileInput = document.getElementById('fileInput');
  DOM.minimap = document.getElementById('minimap');
  DOM.mmx = DOM.minimap ? DOM.minimap.getContext('2d') : null;
}

function resetState() {
  STATE.nodes = [];
  STATE.edges = [];
  STATE.pan = { x: 60, y: 80 };
  STATE.zoom = 1;
  STATE.sel = null;
  STATE.history = [];
  STATE.hPtr = -1;
}
