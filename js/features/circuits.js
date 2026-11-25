// CIRCUITS: Dependencias, resaltado de recorrido y nodos bloqueados.
function computeCircuit(nodeId) {
  const upstream = new Set();
  const downstream = new Set();

  const visitUpstream = (id) => {
    STATE.edges.forEach(edge => {
      if (edge.to === id && !upstream.has(edge.from)) {
        upstream.add(edge.from);
        visitUpstream(edge.from);
      }
    });
  };
  const visitDownstream = (id) => {
    STATE.edges.forEach(edge => {
      if (edge.from === id && !downstream.has(edge.to)) {
        downstream.add(edge.to);
        visitDownstream(edge.to);
      }
    });
  };

  visitUpstream(nodeId);
  visitDownstream(nodeId);
  return { upstream, downstream };
}

function computeBlocked() {
  STATE.blocked.clear();
  STATE.nodes.forEach(node => {
    if (node.type === 'start' || node.type === 'note') return;
    const predecessors = STATE.edges
      .filter(edge => edge.to === node.id)
      .map(edge => byId(edge.from))
      .filter(Boolean);
    if (predecessors.length && !predecessors.every(predecessor => predecessor.status === 'done')) {
      STATE.blocked.add(node.id);
    }
  });
}

function renderBlockedBadge(nodeEl, nodeId) {
  if (!STATE.blocked.has(nodeId)) return;
  const badge = document.createElement('span');
  badge.className = 'blocked-badge';
  badge.textContent = '[blk]';
  nodeEl.appendChild(badge);
}

function toggleCircuit() {
  if (!STATE.sel || STATE.sel.kind !== 'node') return;
  STATE.circuit = computeCircuit(STATE.sel.id);
  STATE.circuitHighlight = !STATE.circuitHighlight;
  renderAll();
}
