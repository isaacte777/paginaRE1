// SELECTION: Gestión de selección de nodos y conexiones
function setSel(s) {
  STATE.sel = s;
  if (STATE.sel && STATE.sel.kind === 'node' && typeof computeCircuit === 'function') {
    STATE.circuit = computeCircuit(STATE.sel.id);
    STATE.circuitHighlight = true;
  } else {
    STATE.circuit = null;
    STATE.circuitHighlight = false;
    const searchBox = document.getElementById('searchBox');
    if (searchBox && searchBox.value) {
      searchBox.value = '';
    }
  }
  renderAll();
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

let ctxNodeId = null;

function showNodeContextMenu(e, nodeId) {
  e.preventDefault();
  e.stopPropagation();
  ctxNodeId = nodeId;
  setSel({ kind: 'node', id: nodeId });

  const menu = document.getElementById('nodeContextMenu');
  const n = byId(nodeId);
  const titleEl = document.getElementById('ctxNodeTitle');
  if (titleEl && n) {
    titleEl.textContent = `:: ${n.type} (${n.id.substring(0, 6)})`;
  }

  if (menu) {
    menu.hidden = false;
    menu.style.left = e.clientX + 'px';
    menu.style.top = e.clientY + 'px';
  }
}

function hideNodeContextMenu() {
  const menu = document.getElementById('nodeContextMenu');
  if (menu) menu.hidden = true;
  ctxNodeId = null;
}

function ctxAction(action) {
  if (!ctxNodeId) return;
  const n = byId(ctxNodeId);

  if (action === 'delete') {
    deleteSel();
  } else if (action === 'inspect') {
    const insp = document.getElementById('inspWrap');
    if (insp) {
      insp.hidden = false;
      if (typeof renderInspector === 'function') renderInspector();
    }
  } else if (action === 'done') {
    if (n) {
      n.status = 'done';
      n.progress = 100;
      commitHistory();
      renderAll();
    }
  } else if (action === 'pending') {
    if (n) {
      n.status = 'pending';
      n.progress = 0;
      commitHistory();
      renderAll();
    }
  }
  hideNodeContextMenu();
}
