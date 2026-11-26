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

function getEdgeEndpoints(e) {
  const nf = byId(e.from);
  const nt = byId(e.to);
  if (!nf || !nt) return null;

  if (typeof chooseSmartEdgeSides === 'function') {
    const smart = chooseSmartEdgeSides(e, nf, nt);
    return { nf, nt, sourceSide: smart.sourceSide, targetSide: smart.targetSide };
  }

  const dx = (nt.x + nt.w / 2) - (nf.x + nf.w / 2);
  const dy = (nt.y + nt.h / 2) - (nf.y + nf.h / 2);
  const isHoriz = Math.abs(dx) >= Math.abs(dy);

  const sourceSide = isHoriz ? (dx >= 0 ? 'right' : 'left') : (dy >= 0 ? 'bottom' : 'top');
  const targetSide = isHoriz ? (dx >= 0 ? 'left' : 'right') : (dy >= 0 ? 'top' : 'bottom');

  return { nf, nt, sourceSide, targetSide };
}

function getEdgeAnchor(e, n, isFrom) {
  const ep = getEdgeEndpoints(e);
  if (!ep) return { x: n.x + n.w / 2, y: n.y + n.h / 2, side: 'right' };

  const side = isFrom ? ep.sourceSide : ep.targetSide;

  const allEdges = STATE.edges.filter(ex => ex.from === n.id || ex.to === n.id);
  const sameSideEdges = allEdges.filter(ex => {
    const xep = getEdgeEndpoints(ex);
    if (!xep) return false;
    const s = (ex.from === n.id) ? xep.sourceSide : xep.targetSide;
    return s === side;
  });

  sameSideEdges.sort((a, b) => {
    const aOther = byId(a.from === n.id ? a.to : a.from);
    const bOther = byId(b.from === n.id ? b.to : b.from);
    if (!aOther || !bOther) return 0;
    return (side === 'left' || side === 'right') ? ((aOther.y + aOther.h/2) - (bOther.y + bOther.h/2)) : ((aOther.x + aOther.w/2) - (bOther.x + bOther.w/2));
  });

  const idx = sameSideEdges.findIndex(ex => ex.id === e.id);
  const total = sameSideEdges.length;
  const pct = total <= 1 ? 0.5 : 0.2 + (0.6 * idx) / (total - 1);

  if (side === 'top') return { x: n.x + n.w * pct, y: n.y, side };
  if (side === 'bottom') return { x: n.x + n.w * pct, y: n.y + n.h, side };
  if (side === 'left') return { x: n.x, y: n.y + n.h * pct, side };
  return { x: n.x + n.w, y: n.y + n.h * pct, side };
}

function getNodePorts(n) {
  if (n.type === 'note') return [];
  const connectedEdges = STATE.edges.filter(e => e.from === n.id || e.to === n.id);

  if (connectedEdges.length === 0) {
    return [
      { side: 'top', style: 'top: -7px; left: 50%; margin-left: -6px;' },
      { side: 'bottom', style: 'bottom: -7px; left: 50%; margin-left: -6px;' },
      { side: 'left', style: 'left: -7px; top: 50%; margin-top: -6px;' },
      { side: 'right', style: 'right: -7px; top: 50%; margin-top: -6px;' }
    ];
  }

  const ports = [];
  const usedSides = new Set();
  connectedEdges.forEach(e => {
    const isFrom = (e.from === n.id);
    const anchor = getEdgeAnchor(e, n, isFrom);
    if (!anchor) return;
    usedSides.add(anchor.side);

    let style = '';
    if (anchor.side === 'top' || anchor.side === 'bottom') {
      const leftPct = Math.round(((anchor.x - n.x) / n.w) * 100);
      style = `top: ${anchor.side === 'top' ? '-7px' : 'auto'}; bottom: ${anchor.side === 'bottom' ? '-7px' : 'auto'}; left: ${leftPct}%; margin-left: -6px;`;
    } else {
      const topPct = Math.round(((anchor.y - n.y) / n.h) * 100);
      style = `left: ${anchor.side === 'left' ? '-7px' : 'auto'}; right: ${anchor.side === 'right' ? '-7px' : 'auto'}; top: ${topPct}%; margin-top: -6px;`;
    }

    ports.push({ side: anchor.side, style, edgeId: e.id });
  });

  // Conservar puertos libres en los lados vacíos para que siempre se pueda tirar una nueva conexión
  if (!usedSides.has('top')) ports.push({ side: 'top', style: 'top: -7px; left: 50%; margin-left: -6px;' });
  if (!usedSides.has('bottom')) ports.push({ side: 'bottom', style: 'bottom: -7px; left: 50%; margin-left: -6px;' });
  if (!usedSides.has('left')) ports.push({ side: 'left', style: 'left: -7px; top: 50%; margin-top: -6px;' });
  if (!usedSides.has('right')) ports.push({ side: 'right', style: 'right: -7px; top: 50%; margin-top: -6px;' });

  return ports;
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
  const icon =
    type === 'ok'
      ? '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>'
      : type === 'warn'
        ? '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>'
        : '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>';
  toast.innerHTML = `<span class="toast-icon">${icon}</span> <span>${escapeHTML(message)}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('fade-out');
    setTimeout(() => {
      if (toast.parentNode) toast.parentNode.removeChild(toast);
    }, 250);
  }, duration);
}
