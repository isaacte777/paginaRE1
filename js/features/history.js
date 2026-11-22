// HISTORY: Gestión del historial de cambios (undo/redo)
function commitHistory() {
  STATE.history = STATE.history.slice(0, STATE.hPtr + 1);
  STATE.history.push(JSON.stringify({
    nodes: STATE.nodes,
    edges: STATE.edges
  }));
  if (STATE.history.length > CONFIG.HISTORY_LIMIT) {
    STATE.history.shift();
  }
  STATE.hPtr = STATE.history.length - 1;
}

function restore(s) {
  const d = JSON.parse(s);
  STATE.nodes = d.nodes || [];
  STATE.edges = d.edges || [];
  STATE.sel = null;
  renderAll();
}

function undo() {
  if (STATE.hPtr > 0) {
    STATE.hPtr--;
    restore(STATE.history[STATE.hPtr]);
    log('warn', '↶ undo');
  }
}

function redo() {
  if (STATE.hPtr < STATE.history.length - 1) {
    STATE.hPtr++;
    restore(STATE.history[STATE.hPtr]);
    log('warn', '↷ redo');
  }
}
