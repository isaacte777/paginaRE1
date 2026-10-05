// SELECTION: Gestión de selección de nodos y conexiones
function setSel(s) {
  STATE.sel = s;
  if (STATE.sel && STATE.sel.kind === 'node' && typeof computeCircuit === 'function') {
    STATE.circuit = computeCircuit(STATE.sel.id);
  } else {
    STATE.circuit = null;
  }
  DOM.world.querySelectorAll('.node').forEach(el => {
    el.classList.toggle('selected', !!(STATE.sel && STATE.sel.kind === 'node' && STATE.sel.id === el.dataset.id));
    if (typeof applyCircuitStyles === 'function') {
      applyCircuitStyles(el, el.dataset.id);
    }
  });
  drawEdges();
  updatePanel();
  if (typeof renderInspector === 'function') {
    renderInspector();
  }
}

function deleteSel() {
  if (!STATE.sel) return;
  if (STATE.sel.kind === 'node') {
    STATE.nodes = STATE.nodes.filter(n => n.id !== STATE.sel.id);
    STATE.edges = STATE.edges.filter(e => e.from !== STATE.sel.id && e.to !== STATE.sel.id);
  } else {
    STATE.edges = STATE.edges.filter(e => e.id !== STATE.sel.id);
  }
  STATE.sel = null;
  STATE.circuit = null;
  commitHistory();
  renderAll();
}
