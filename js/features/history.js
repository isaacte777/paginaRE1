// HISTORY: Gestion del historial de cambios (deshacer/rehacer).
function commitHistory() {
  const snapshot = JSON.stringify({ nodes: STATE.nodes, edges: STATE.edges });
  if (STATE.history[STATE.hPtr] === snapshot) return;

  STATE.history = STATE.history.slice(0, STATE.hPtr + 1);
  STATE.history.push(snapshot);
  if (STATE.history.length > CONFIG.HISTORY_LIMIT) STATE.history.shift();
  STATE.hPtr = STATE.history.length - 1;
}

function restore(snapshot) {
  if (!snapshot) return;
  const data = JSON.parse(snapshot);
  STATE.nodes = data.nodes || [];
  STATE.edges = data.edges || [];
  STATE.sel = null;
  STATE.circuit = null;
  STATE.circuitHighlight = false;
  renderAll();
}

function undo() {
  if (STATE.hPtr <= 0) return;
  STATE.hPtr--;
  restore(STATE.history[STATE.hPtr]);
  log('warn', 'deshacer');
}

function redo() {
  if (STATE.hPtr >= STATE.history.length - 1) return;
  STATE.hPtr++;
  restore(STATE.history[STATE.hPtr]);
  log('warn', 'rehacer');
}
