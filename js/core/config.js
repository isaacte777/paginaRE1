// Configuración central de FlowLab
const CONFIG = {
  KEY: 'flowlab-paginaRE-v3',
  ZOOM_MIN: 0.25,
  ZOOM_MAX: 2.5,
  SNAP_GRID: 12,
  HISTORY_LIMIT: 60,
  CONSOLE_MAX_LINES: 100,
  NS: 'http://www.w3.org/2000/svg',

  THEME: {
    bg0: '#0b0c0d',
    bg1: '#131416',
    bg2: '#1a1c1e',
    bg3: '#222527',
    line: '#2e3134',
    line2: '#43474b',
    tx0: '#f2f2f2',
    tx1: '#c9ccd0',
    tx2: '#8b9095',
    tx3: '#5c6166',
    white: '#e9e9e9',
    black: '#101112'
  },

  BADGE: {
    pending: '[ ]',
    progress: '[~]',
    done: '[✓]',
    error: '[!]'
  }
};

// Estado global
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
  panelTab: 'props'
};

// Referencias a elementos DOM
const DOM = {
  vp: null,
  world: null,
  edgesG: null,
  panel: null,
  console: null,
  fileInput: null
};

function initDOM() {
  DOM.vp = document.getElementById('viewport');
  DOM.world = document.getElementById('world');
  DOM.edgesG = document.getElementById('edgesG');
  DOM.panel = document.getElementById('panel');
  DOM.console = document.getElementById('console');
  DOM.fileInput = document.getElementById('fileInput');
}
