// HELPERS: Funciones auxiliares reutilizables
function generateUID(prefix = '') {
  return prefix + Math.random().toString(36).slice(2, 8);
}

function byId(id, type = 'node') {
  if (type === 'node' || !type) {
    return STATE.nodes.find(n => n.id === id);
  } else if (type === 'edge') {
    return STATE.edges.find(e => e.id === id);
  }
  return null;
}

function escapeHTML(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function clamp(v, a, b) {
  return Math.max(a, Math.min(b, v));
}

function createNode(type, text, x, y) {
  return {
    id: generateUID('n'),
    type: type,
    text: text || type,
    x: Math.round(x),
    y: Math.round(y),
    w: 150,
    h: 60,
    status: 'pending',
    progress: 0,
    current: false,
    state: 'idle',
    params: {}
  };
}

function createEdge(fromId, toId, label = '', kind = 'normal') {
  return {
    id: generateUID('e'),
    from: fromId,
    to: toId,
    label: label,
    kind: kind
  };
}

function screenToWorld(cx, cy) {
  const r = DOM.vp.getBoundingClientRect();
  return {
    x: (cx - r.left - STATE.pan.x) / STATE.zoom,
    y: (cy - r.top - STATE.pan.y) / STATE.zoom
  };
}

function nodeEl(id) {
  return DOM.world.querySelector('.node[data-id="' + id + '"]');
}

function anchorPoint(n, side) {
  if (side === 'top') return { x: n.x + n.w / 2, y: n.y };
  if (side === 'bottom') return { x: n.x + n.w / 2, y: n.y + n.h };
  if (side === 'left') return { x: n.x, y: n.y + n.h / 2 };
  return { x: n.x + n.w, y: n.y + n.h / 2 };
}

function autoSide(nf, nt) {
  const dx = (nt.x + nt.w / 2) - (nf.x + nf.w / 2);
  const dy = (nt.y + nt.h / 2) - (nf.y + nf.h / 2);
  if (Math.abs(dx) > 0.3 * Math.abs(dy)) {
    return { o: 'h', dx: dx, dy: dy };
  }
  return { o: 'v', dx: dx, dy: dy };
}

function bbox() {
  if (!STATE.nodes.length) return { minX: 0, minY: 0, maxX: 800, maxY: 600 };
  return {
    minX: Math.min.apply(null, STATE.nodes.map(n => n.x)) - 60,
    minY: Math.min.apply(null, STATE.nodes.map(n => n.y)) - 100,
    maxX: Math.max.apply(null, STATE.nodes.map(n => n.x + n.w)) + 60,
    maxY: Math.max.apply(null, STATE.nodes.map(n => n.y + n.h)) + 60
  };
}

/**
 * Muestra notificación toast flotante no intrusiva
 */
function showToast(message, type = 'ok', duration = 2200) {
  let container = document.getElementById('toastContainer');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toastContainer';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  const icon = type === 'ok' ? '✓' : type === 'warn' ? '⚠️' : 'ℹ️';
  toast.innerHTML = `<span class="toast-icon">${icon}</span> <span>${escapeHTML(message)}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('fade-out');
    setTimeout(() => {
      if (toast.parentNode) toast.parentNode.removeChild(toast);
    }, 250);
  }, duration);
}
