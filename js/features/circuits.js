// CIRCUITS: Análisis de circuitos (upstream/downstream) y bloqueos de dependencias

/**
 * Calcula el circuito completo (upstream + downstream) de un nodo
 * Retorna: { upstream: Set<id>, downstream: Set<id> }
 */
function computeCircuit(nodeId) {
  const upstream = new Set();
  const downstream = new Set();

  // Traversal upstream (predecesores)
  function traverseUp(id) {
    STATE.edges.forEach(e => {
      if (e.to === id && !upstream.has(e.from)) {
        upstream.add(e.from);
        traverseUp(e.from);
      }
    });
  }

  // Traversal downstream (sucesores)
  function traverseDown(id) {
    STATE.edges.forEach(e => {
      if (e.from === id && !downstream.has(e.to)) {
        downstream.add(e.to);
        traverseDown(e.to);
      }
    });
  }

  traverseUp(nodeId);
  traverseDown(nodeId);

  return { upstream, downstream };
}

/**
 * Marca nodos como bloqueados si sus predecesores no están "done"
 * Un nodo está bloqueado si:
 * - No es 'note' ni 'start'
 * - Tiene predecesores
 * - Al menos uno de ellos no tiene status === 'done'
 */
function computeBlocked() {
  STATE.blocked.clear();

  STATE.nodes.forEach(node => {
    // Skip especiales
    if (node.type === 'note' || node.type === 'start') return;

    // Buscar predecesores
    const predecessors = STATE.edges.filter(e => e.to === node.id).map(e => byId(e.from));
    if (!predecessors.length) return; // Sin dependencias

    // Si algún predecesor no está done, bloquear
    const allDone = predecessors.every(p => p && p.status === 'done');
    if (!allDone) {
      STATE.blocked.add(node.id);
    }
  });
}

/**
 * Renderiza indicador de bloqueo [blk] en el nodo
 */
function renderBlockedBadge(nodeEl, nodeId) {
  if (!STATE.blocked.has(nodeId)) {
    const badge = nodeEl.querySelector('.blocked-badge');
    if (badge) badge.remove();
    return;
  }

  let badge = nodeEl.querySelector('.blocked-badge');
  if (!badge) {
    badge = document.createElement('div');
    badge.className = 'blocked-badge';
    badge.textContent = '[blk]';
    nodeEl.appendChild(badge);
  }
}

/**
 * Aplica estilos de circuito al renderizar nodos
 */
function applyCircuitStyles(nodeEl, nodeId) {
  const isInCircuit = STATE.circuit &&
    (STATE.circuit.upstream.has(nodeId) || STATE.circuit.downstream.has(nodeId) || nodeId === STATE.sel?.id);

  nodeEl.classList.toggle('circuit', isInCircuit && STATE.circuitHighlight);
}

/**
 * Toggle circuit highlighting para nodo seleccionado
 */
function toggleCircuit() {
  if (!STATE.sel || STATE.sel.kind !== 'node') return;
  STATE.circuitHighlight = !STATE.circuitHighlight;
  STATE.circuit = computeCircuit(STATE.sel.id);
  renderAll();
}

/**
 * Limpiar circuito actual
 */
function clearCircuit() {
  STATE.circuit = null;
  STATE.circuitHighlight = false;
  renderAll();
}
