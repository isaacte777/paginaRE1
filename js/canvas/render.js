// RENDER: Renderización del canvas y nodos
function renderNodes() {
  DOM.world.querySelectorAll('.node').forEach(el => el.remove());
  const q = (document.getElementById('searchBox').value || '').toLowerCase();

  // Calcular dependencias bloqueadas y planilla financiera reactiva antes de renderizar
  computeBlocked();
  if (typeof evaluateFinanceSheet === 'function') {
    evaluateFinanceSheet();
  }

  STATE.nodes.forEach(n => {
    const d = document.createElement('div');
    const isFin = typeof isFinanceNodeType === 'function' && isFinanceNodeType(n.type);
    let cls = 'node ' + n.type + ' st-' + (n.status || 'pending');
    if (isFin && typeof getFinanceNodeToneClass === 'function') {
      cls += ' ' + getFinanceNodeToneClass(n.type);
    }
    if (STATE.sel && STATE.sel.kind === 'node' && STATE.sel.id === n.id) cls += ' selected';
    if (n.current) cls += ' current';

    // Aplicar estilos de circuito y dimming
    const isInCircuit = STATE.circuit &&
      (STATE.circuit.upstream.has(n.id) || STATE.circuit.downstream.has(n.id) || n.id === STATE.sel?.id);

    if (isInCircuit && STATE.circuitHighlight) {
      cls += ' circuit';
    }

    if (q) {
      const cellStr = isFin && n.params?.cellRef ? String(n.params.cellRef).toLowerCase() : '';
      cls += (n.text.toLowerCase().includes(q) || n.type.includes(q) || cellStr.includes(q)) ? ' match' : ' dimmed';
    } else if (STATE.statusFilter) {
      const hit = STATE.statusFilter === 'current' ? !!n.current : (n.status === STATE.statusFilter);
      if (!hit) cls += ' dimmed';
    } else if (STATE.sel && STATE.sel.kind === 'node' && STATE.circuitHighlight && !isInCircuit) {
      cls += ' dimmed';
    }
    d.className = cls;
    d.dataset.id = n.id;
    d.style.left = n.x + 'px';
    d.style.top = n.y + 'px';
    const txt = '<span class="txt">' + escapeHTML(n.text) + '</span>';
    let html = '';
    if (isFin && typeof renderFinanceNodeHtml === 'function') {
      html = renderFinanceNodeHtml(n);
    } else if (n.type.startsWith('chart_') && typeof renderChartNodeHtml === 'function') {
      html = renderChartNodeHtml(n);
    } else {
      html = (n.type === 'decision' || n.type === 'loop' || n.type === 'io') ? '<div class="core">' + txt + '</div>' : txt;
    }
    html += '<span class="badge">' + (CONFIG.BADGE[n.status] || '[ ]') + '</span>';
    if ((n.progress || 0) > 0) html += '<span class="pbar"><i style="width:' + clamp(n.progress, 0, 100) + '%"></i></span>';
    const isLocked = !!n.locked;
    const lockSvg = isLocked ?
      `<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>` :
      `<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 9.9-1"/></svg>`;
    html += `<span class="lock-badge ${isLocked ? 'locked' : ''}" data-node-lock="${n.id}" title="${isLocked ? 'Nodo bloqueado (clic para desbloquear)' : 'Nodo libre (clic para bloquear)'}">${lockSvg}</span>`;
    if (n.type !== 'note') {
      const ports = getNodePorts(n);
      html += ports.map(p => `<div class="port" data-side="${p.side}" style="${p.style}"></div>`).join('');
    }
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

    const isEdgeInCircuit = STATE.circuit && STATE.circuitHighlight &&
      (STATE.circuit.upstream.has(e.from) || STATE.circuit.downstream.has(e.from) || e.from === STATE.sel?.id) &&
      (STATE.circuit.upstream.has(e.to) || STATE.circuit.downstream.has(e.to) || e.to === STATE.sel?.id);

    const isDimmedEdge = STATE.sel && STATE.sel.kind === 'node' && STATE.circuitHighlight && !isEdgeInCircuit;

    const p = document.createElementNS(CONFIG.NS, 'path');
    p.setAttribute('d', g.d);
    p.setAttribute('class', 'edge' + (sel_edge ? ' sel' : '') + (isEdgeInCircuit ? ' circuit-edge' : '') + (isDimmedEdge ? ' dimmed-edge' : ''));
    p.setAttribute('marker-end', sel_edge ? 'url(#arrowSel)' : (isEdgeInCircuit ? 'url(#arrowSel)' : 'url(#arrow)'));
    p.dataset.edgeId = e.id;
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
      t.setAttribute('class', 'edge-label' + (isDimmedEdge ? ' dimmed' : ''));
      t.dataset.edgeLabelId = e.id;
      t.textContent = e.label;
      DOM.edgesG.appendChild(t);
    }
  });

  // Partículas de luz viajeras para animar el recorrido del circuito de principio a fin
  if (STATE.circuit && STATE.circuitHighlight) {
    STATE.edges.forEach(e => {
      const isEdgeInCircuit = (STATE.circuit.upstream.has(e.from) || STATE.circuit.downstream.has(e.from) || e.from === STATE.sel?.id) &&
        (STATE.circuit.upstream.has(e.to) || STATE.circuit.downstream.has(e.to) || e.to === STATE.sel?.id);

      if (isEdgeInCircuit) {
        const g = computeEdge(e);
        if (!g) return;
        for (let i = 0; i < 2; i++) {
          const particle = document.createElementNS(CONFIG.NS, 'circle');
          particle.setAttribute('r', '4');
          particle.setAttribute('class', 'circuit-particle');
          particle.style.offsetPath = `path("${g.d}")`;
          particle.style.animationDelay = (i * 0.75) + 's';
          DOM.edgesG.appendChild(particle);
        }
      }
    });
  }

  if (STATE.connecting) {
    const nf = byId(STATE.connecting.id);
    if (nf) {
      const p1 = anchorPoint(nf, STATE.connecting.side || 'right');
      const wp = screenToWorld(STATE.mouse.x, STATE.mouse.y);
      const dx = wp.x - p1.x;
      const dy = wp.y - p1.y;
      let d;
      if (Math.abs(dx) >= Math.abs(dy)) {
        const mx = (p1.x + wp.x) / 2;
        d = `M ${p1.x} ${p1.y} L ${mx} ${p1.y} L ${mx} ${wp.y} L ${wp.x} ${wp.y}`;
      } else {
        const my = (p1.y + wp.y) / 2;
        d = `M ${p1.x} ${p1.y} L ${p1.x} ${my} L ${wp.x} ${my} L ${wp.x} ${wp.y}`;
      }
      const tempPath = document.createElementNS(CONFIG.NS, 'path');
      tempPath.setAttribute('d', d);
      tempPath.setAttribute('class', 'edge connecting-preview');
      tempPath.setAttribute('marker-end', 'url(#arrowSel)');
      DOM.edgesG.appendChild(tempPath);
    }
  }
}

function computeEdge(e) {
  const nf = byId(e.from);
  const nt = byId(e.to);
  if (!nf || !nt) return null;

  const p1 = getEdgeAnchor(e, nf, true);
  const p2 = getEdgeAnchor(e, nt, false);

  // Espaciado y canales limpios para evitar solapamientos entre múltiples aristas
  const allEdges = STATE.edges;
  const sameChannelEdges = allEdges.filter(ex => {
    const exF = byId(ex.from);
    const exT = byId(ex.to);
    if (!exF || !exT) return false;
    return Math.abs(exF.x - nf.x) < 80 && Math.abs(exT.x - nt.x) < 80;
  });

  const edgeIdx = sameChannelEdges.findIndex(ex => ex.id === e.id);
  const totalEdges = sameChannelEdges.length;
  const channelOffset = totalEdges > 1 ? (edgeIdx - (totalEdges - 1) / 2) * 14 : 0;

  let d, lx, ly;

  if (p1.side === 'bottom' || p1.side === 'top') {
    const midY = (p1.y + p2.y) / 2 + channelOffset;
    d = `M ${p1.x} ${p1.y} L ${p1.x} ${midY} L ${p2.x} ${midY} L ${p2.x} ${p2.y}`;
    lx = (p1.x + p2.x) / 2;
    ly = midY - 8;
  } else {
    const midX = (p1.x + p2.x) / 2 + channelOffset;
    d = `M ${p1.x} ${p1.y} L ${midX} ${p1.y} L ${midX} ${p2.y} L ${p2.x} ${p2.y}`;
    lx = midX;
    ly = (p1.y + p2.y) / 2 - 8;
  }

  return { d, lx, ly, x2: p2.x, y2: p2.y };
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
