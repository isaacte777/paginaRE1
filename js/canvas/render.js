// RENDER: Renderización del canvas y nodos
function renderNodes() {
  DOM.world.querySelectorAll('.node').forEach(el => el.remove());
  const q = (document.getElementById('searchBox').value || '').toLowerCase();

  // Calcular dependencias bloqueadas antes de renderizar
  computeBlocked();

  STATE.nodes.forEach(n => {
    const d = document.createElement('div');
    let cls = 'node ' + n.type + ' st-' + (n.status || 'pending');
    if (STATE.sel && STATE.sel.kind === 'node' && STATE.sel.id === n.id) cls += ' selected';
    if (n.current) cls += ' current';

    // Aplicar estilos de circuito
    const isInCircuit = STATE.circuit &&
      (STATE.circuit.upstream.has(n.id) || STATE.circuit.downstream.has(n.id) || n.id === STATE.sel?.id);
    if (isInCircuit && STATE.circuitHighlight) cls += ' circuit';

    if (q) {
      cls += (n.text.toLowerCase().includes(q) || n.type.includes(q)) ? ' match' : ' dimmed';
    } else if (STATE.statusFilter) {
      const hit = STATE.statusFilter === 'current' ? !!n.current : (n.status === STATE.statusFilter);
      if (!hit) cls += ' dimmed';
    }
    d.className = cls;
    d.dataset.id = n.id;
    d.style.left = n.x + 'px';
    d.style.top = n.y + 'px';
    const txt = '<span class="txt">' + escapeHTML(n.text) + '</span>';
    let html = (n.type === 'decision' || n.type === 'loop' || n.type === 'io') ? '<div class="core">' + txt + '</div>' : txt;
    html += '<span class="badge">' + (CONFIG.BADGE[n.status] || '[ ]') + '</span>';
    if ((n.progress || 0) > 0) html += '<span class="pbar"><i style="width:' + clamp(n.progress, 0, 100) + '%"></i></span>';
    if (n.type !== 'note') html += ['top', 'right', 'bottom', 'left'].map(s => '<div class="port" data-side="' + s + '"></div>').join('');
    d.innerHTML = html;

    // Renderizar indicador de bloqueo [blk]
    renderBlockedBadge(d, n.id);

    DOM.world.appendChild(d);
    n.w = d.offsetWidth;
    n.h = d.offsetHeight;
  });
}

function drawEdges() {
  DOM.edgesG.innerHTML = '';
  STATE.edges.forEach(e => {
    const g = computeEdge(e);
    if (!g) return;
    const sel_edge = STATE.sel && STATE.sel.kind === 'edge' && STATE.sel.id === e.id;
    const p = document.createElementNS(CONFIG.NS, 'path');
    p.setAttribute('d', g.d);
    p.setAttribute('class', 'edge' + (sel_edge ? ' sel' : ''));
    p.setAttribute('marker-end', sel_edge ? 'url(#arrowSel)' : 'url(#arrow)');
    DOM.edgesG.appendChild(p);
    const hit = document.createElementNS(CONFIG.NS, 'path');
    hit.setAttribute('d', g.d);
    hit.setAttribute('class', 'edge-hit');
    hit.dataset.id = e.id;
    DOM.edgesG.appendChild(hit);
    if (e.label) {
      const t = document.createElementNS(CONFIG.NS, 'text');
      t.setAttribute('x', g.lx);
      t.setAttribute('y', g.ly);
      t.setAttribute('class', 'edge-label');
      t.textContent = e.label;
      DOM.edgesG.appendChild(t);
    }
  });
}

function computeEdge(e) {
  const nf = byId(e.from);
  const nt = byId(e.to);
  if (!nf || !nt) return null;
  const s = autoSide(nf, nt);
  let d, lx, ly;
  if (s.o === 'h') {
    const x1 = s.dx > 0 ? nf.x + nf.w : nf.x;
    const y1 = nf.y + nf.h / 2;
    const x2 = s.dx > 0 ? nt.x : nt.x + nt.w;
    const y2 = nt.y + nt.h / 2;
    const mx = (x1 + x2) / 2;
    d = 'M' + x1 + ' ' + y1 + ' L' + mx + ' ' + y1 + ' L' + mx + ' ' + y2 + ' L' + x2 + ' ' + y2;
    lx = (x1 + x2) / 2;
    ly = y1 - 9;
    return { d, lx, ly, x2, y2 };
  }
  const y1 = s.dy > 0 ? nf.y + nf.h : nf.y;
  const x1 = nf.x + nf.w / 2;
  const y2 = s.dy > 0 ? nt.y : nt.y + nt.h;
  const x2 = nt.x + nt.w / 2;
  const my = (y1 + y2) / 2;
  d = 'M' + x1 + ' ' + y1 + ' L' + x1 + ' ' + my + ' L' + x2 + ' ' + my + ' L' + x2 + ' ' + y2;
  lx = (x1 + x2) / 2;
  ly = my - 8;
  return { d, lx, ly, x2, y2 };
}

function updateStatus() {
  document.getElementById('stNodes').textContent = 'nodos: ' + STATE.nodes.length;
  document.getElementById('stEdges').textContent = 'conexiones: ' + STATE.edges.length;
  document.getElementById('stZoom').textContent = 'zoom: ' + Math.round(STATE.zoom * 100) + '%';
}

function renderAll() {
  renderNodes();
  drawEdges();
  updatePanel();
  updateStatus();
  drawMinimap();
  saveState();
}
