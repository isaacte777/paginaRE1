// SELECTION: Gestión de selección, acciones rápidas de nodos, duplicación y menú contextual
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
  if (typeof updateMobileNodeBar === 'function') {
    updateMobileNodeBar();
  }
  updateNodeQuickBar();
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
  if (typeof updateMobileNodeBar === 'function') {
    updateMobileNodeBar();
  }
  updateNodeQuickBar();
}

window.deleteSelected = deleteSel;
window.setTab = function (tabName) {
  if (typeof switchRightPanelTab === 'function') switchRightPanelTab(tabName);
};

function centerOnNode(nodeId) {
  const n = byId(nodeId);
  if (!n || !DOM.vp) return;
  const r = DOM.vp.getBoundingClientRect();
  const vw = r.width || 800;
  const vh = r.height || 600;
  const nw = n.w || 190;
  const nh = n.h || 80;
  STATE.pan.x = Math.round(vw / 2 - (n.x + nw / 2) * STATE.zoom);
  STATE.pan.y = Math.round(vh / 2 - (n.y + nh / 2) * STATE.zoom);
  if (typeof applyTransform === 'function') applyTransform();
  if (typeof saveState === 'function') saveState();
}

function duplicateNodeById(nodeId) {
  const orig = byId(nodeId);
  if (!orig || typeof createNode !== 'function') return null;

  const snap = (typeof CONFIG !== 'undefined' && Number(CONFIG.SNAP_GRID)) || 12;
  const nx = Math.round((orig.x + 48) / snap) * snap;
  const ny = Math.round((orig.y + 36) / snap) * snap;
  const copy = createNode(orig.type, orig.text, nx, ny);
  copy.status = orig.status || 'pending';
  copy.progress = orig.progress || 0;
  copy.locked = false;
  copy.params = JSON.parse(JSON.stringify(orig.params || {}));

  if (typeof isFinanceNodeType === 'function' && isFinanceNodeType(copy.type)) {
    delete copy.params.cellRef;
    if (typeof ensureFinanceNodeDefaults === 'function') {
      ensureFinanceNodeDefaults(copy, STATE.nodes);
    }
  }

  STATE.nodes.push(copy);
  commitHistory();
  if (typeof evaluateFinanceSheet === 'function') evaluateFinanceSheet();
  setSel({ kind: 'node', id: copy.id });
  if (typeof showToast === 'function') {
    showToast(`Nodo duplicado: ${copy.text || copy.type}`, 'ok', 1500);
  }
  return copy;
}

function openNodeEditor(nodeId) {
  if (nodeId) {
    setSel({ kind: 'node', id: nodeId });
  }
  const rp = document.getElementById('rightPanel');
  if (rp && rp.classList.contains('is-collapsed')) {
    rp.classList.remove('is-collapsed');
  }
  if (typeof openMobileRightPanel === 'function' && typeof isCompactSidebarLayout === 'function' && isCompactSidebarLayout()) {
    openMobileRightPanel();
  }
  if (typeof switchRightPanelTab === 'function') {
    switchRightPanelTab('props');
  }
  requestAnimationFrame(() => {
    const inp =
      document.getElementById('finPropTitle') ||
      document.getElementById('nodeTxt') ||
      document.getElementById('edgeLbl');
    if (inp) {
      inp.focus();
      if (typeof inp.select === 'function' && inp.tagName === 'INPUT') inp.select();
    }
  });
}

let lastQuickBarSignature = '';

function updateNodeQuickBar() {
  const bar = document.getElementById('nodeQuickBar');
  if (!bar || !DOM.vp) return;

  const isMobile = typeof isMobileLayout === 'function' && isMobileLayout();
  if (
    isMobile ||
    !STATE.sel ||
    STATE.editing ||
    (STATE.dragging && STATE.dragging.moved) ||
    STATE.connecting
  ) {
    bar.hidden = true;
    return;
  }

  if (STATE.sel.kind === 'edge') {
    const edge = (STATE.edges || []).find(e => e.id === STATE.sel.id);
    if (!edge) {
      bar.hidden = true;
      return;
    }
    const f = byId(edge.from);
    const t = byId(edge.to);
    if (!f || !t) {
      bar.hidden = true;
      return;
    }
    const mx = ((f.x + (f.w || 180) / 2 + t.x + (t.w || 180) / 2) / 2) * STATE.zoom + STATE.pan.x;
    const my = ((f.y + (f.h || 70) / 2 + t.y + (t.h || 70) / 2) / 2) * STATE.zoom + STATE.pan.y - 34;

    const sig = `edge:${edge.id}:${edge.label || ''}`;
    if (lastQuickBarSignature !== sig) {
      lastQuickBarSignature = sig;
      bar.innerHTML = `
        <button type="button" class="nqb-btn is-primary" data-nqb-act="edit_edge" title="Editar etiqueta y estilo de conexión">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          <span>editar cable</span>
        </button>
        <button type="button" class="nqb-btn" data-nqb-act="reverse_edge" title="Invertir dirección de la flecha">⇄ invertir</button>
        <button type="button" class="nqb-btn is-danger" data-nqb-act="delete" title="Eliminar conexión">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
        </button>
      `;
      bindQuickBarEvents(bar);
    }

    bar.hidden = false;
    positionQuickBarInViewport(bar, mx, my);
    return;
  }

  const n = byId(STATE.sel.id);
  if (!n) {
    bar.hidden = true;
    return;
  }

  const isFin = typeof isFinanceNodeType === 'function' && isFinanceNodeType(n.type);
  const isFinChart = isFin && typeof getFinanceNodeDef === 'function' && Boolean(getFinanceNodeDef(n.type)?.isChart);
  const sig = `node:${n.id}:${n.type}:${n.status}:${Boolean(n.locked)}:${isFin}`;

  if (lastQuickBarSignature !== sig) {
    lastQuickBarSignature = sig;
    const midControls = isFin
      ? isFinChart
        ? ''
        : `<button type="button" class="nqb-btn" data-nqb-act="fin_val" title="Editar monto o fórmula en línea">fx / valor</button>
           <button type="button" class="nqb-btn" data-nqb-act="fin_sign" title="Invertir signo (+/-)">±</button>`
      : `<div class="nqb-st-group" role="group" aria-label="Estado rápido">
           <button type="button" class="nqb-st ${n.status === 'pending' ? 'is-on' : ''}" data-nqb-st="pending" title="Pendiente">○</button>
           <button type="button" class="nqb-st ${n.status === 'progress' ? 'is-on' : ''}" data-nqb-st="progress" title="En curso">◐</button>
           <button type="button" class="nqb-st ${n.status === 'done' ? 'is-on' : ''}" data-nqb-st="done" title="Hecho">✓</button>
           <button type="button" class="nqb-st ${n.status === 'error' ? 'is-on' : ''}" data-nqb-st="error" title="Error">✕</button>
         </div>`;

    bar.innerHTML = `
      <button type="button" class="nqb-btn is-primary" data-nqb-act="open_props" title="Abrir menú completo de edición">
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/><line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/><line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/><line x1="1" y1="14" x2="7" y2="14"/><line x1="9" y1="8" x2="15" y2="8"/><line x1="17" y1="16" x2="23" y2="16"/></svg>
        <span>editar</span>
      </button>
      ${midControls}
      <button type="button" class="nqb-btn" data-nqb-act="duplicate" title="Duplicar nodo (Ctrl+D)">
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
      </button>
      <button type="button" class="nqb-btn ${n.locked ? 'is-active' : ''}" data-nqb-act="lock" title="${n.locked ? 'Desbloquear posición' : 'Bloquear posición'}">
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
      </button>
      <button type="button" class="nqb-btn is-danger" data-nqb-act="delete" title="Eliminar nodo (Supr)">
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
      </button>
    `;
    bindQuickBarEvents(bar);
  }

  bar.hidden = false;
  const nw = n.w || 200;
  const anchorX = (n.x + nw / 2) * STATE.zoom + STATE.pan.x;
  const anchorY = n.y * STATE.zoom + STATE.pan.y - 36;
  positionQuickBarInViewport(bar, anchorX, anchorY);
}

function positionQuickBarInViewport(bar, cx, topY) {
  const vpRect = DOM.vp.getBoundingClientRect();
  const bw = bar.offsetWidth || 230;
  const bh = bar.offsetHeight || 28;
  const minTop = document.getElementById('finFormulaBar')?.hidden === false ? 46 : 8;
  const clampedLeft = clamp(Math.round(cx - bw / 2), 8, Math.max(8, vpRect.width - bw - 8));
  let finalTop = Math.round(topY);
  if (finalTop < minTop) {
    finalTop = minTop;
  } else if (finalTop > vpRect.height - bh - 44) {
    finalTop = Math.max(minTop, vpRect.height - bh - 44);
  }
  bar.style.left = clampedLeft + 'px';
  bar.style.top = finalTop + 'px';
}

function bindQuickBarEvents(bar) {
  bar.querySelectorAll('[data-nqb-act]').forEach(btn => {
    btn.addEventListener('click', ev => {
      ev.stopPropagation();
      const act = btn.dataset.nqbAct;
      if (!STATE.sel) return;
      if (act === 'open_props' || act === 'edit_edge') {
        openNodeEditor(STATE.sel.kind === 'node' ? STATE.sel.id : null);
      } else if (act === 'duplicate' && STATE.sel.kind === 'node') {
        duplicateNodeById(STATE.sel.id);
      } else if (act === 'lock' && STATE.sel.kind === 'node') {
        const nd = byId(STATE.sel.id);
        if (nd) {
          nd.locked = !nd.locked;
          commitHistory();
          lastQuickBarSignature = '';
          renderAll();
        }
      } else if (act === 'fin_sign' && STATE.sel.kind === 'node') {
        const nd = byId(STATE.sel.id);
        if (nd && nd.params) {
          nd.params.value = -(Number(nd.params.value) || 0);
          commitHistory();
          if (typeof evaluateFinanceSheet === 'function') evaluateFinanceSheet();
          renderAll();
        }
      } else if (act === 'fin_val' && STATE.sel.kind === 'node') {
        const el = typeof nodeEl === 'function' ? nodeEl(STATE.sel.id) : null;
        const valEl = el?.querySelector('.fin-card-val');
        if (el && valEl && typeof startEdit === 'function') {
          startEdit(el, { target: valEl });
        } else {
          openNodeEditor(STATE.sel.id);
        }
      } else if (act === 'reverse_edge' && STATE.sel.kind === 'edge') {
        const ed = (STATE.edges || []).find(x => x.id === STATE.sel.id);
        if (ed) {
          const tmp = ed.from;
          ed.from = ed.to;
          ed.to = tmp;
          commitHistory();
          renderAll();
        }
      } else if (act === 'delete') {
        deleteSel();
      }
    });
  });

  bar.querySelectorAll('[data-nqb-st]').forEach(btn => {
    btn.addEventListener('click', ev => {
      ev.stopPropagation();
      if (!STATE.sel || STATE.sel.kind !== 'node') return;
      const nd = byId(STATE.sel.id);
      if (!nd) return;
      const st = btn.dataset.nqbSt;
      nd.status = st;
      if (st === 'done') nd.progress = 100;
      else if (st === 'pending') nd.progress = 0;
      else if (st === 'progress' && (!nd.progress || nd.progress === 100)) nd.progress = 50;
      commitHistory();
      lastQuickBarSignature = '';
      renderAll();
    });
  });
}

let ctxNodeId = null;

function showNodeContextMenu(e, nodeId) {
  if (e && typeof e.preventDefault === 'function') e.preventDefault();
  if (e && typeof e.stopPropagation === 'function') e.stopPropagation();
  ctxNodeId = nodeId;
  setSel({ kind: 'node', id: nodeId });

  const menu = document.getElementById('nodeContextMenu');
  const n = byId(nodeId);
  const titleEl = document.getElementById('ctxNodeTitle');
  if (titleEl && n) {
    const label = n.params?.cellRef ? `[${n.params.cellRef}] ${n.text || n.type}` : `${n.text || n.type}`;
    titleEl.textContent = `:: ${label.slice(0, 26)}`;
  }
  const lockLbl = document.getElementById('ctxLockLabel');
  if (lockLbl && n) {
    lockLbl.textContent = n.locked ? 'Desbloquear posición' : 'Bloquear posición';
  }

  if (menu) {
    menu.hidden = false;
    const rawX = e?.clientX ?? window.innerWidth / 2;
    const rawY = e?.clientY ?? window.innerHeight / 2;
    const mRect = menu.getBoundingClientRect();
    const mW = mRect.width || 206;
    const mH = mRect.height || 260;
    const clampedX = Math.min(Math.max(8, rawX), Math.max(8, window.innerWidth - mW - 8));
    const clampedY = Math.min(Math.max(8, rawY), Math.max(8, window.innerHeight - mH - 8));
    menu.style.left = Math.round(clampedX) + 'px';
    menu.style.top = Math.round(clampedY) + 'px';
  }
}

function hideNodeContextMenu() {
  const menu = document.getElementById('nodeContextMenu');
  if (menu) menu.hidden = true;
  ctxNodeId = null;
}

function ctxAction(action) {
  if (!ctxNodeId) return;
  const targetId = ctxNodeId;
  const n = byId(targetId);
  hideNodeContextMenu();
  if (!n && action !== 'delete') return;

  if (action === 'delete') {
    setSel({ kind: 'node', id: targetId });
    deleteSel();
  } else if (action === 'edit_props' || action === 'inspect') {
    openNodeEditor(targetId);
  } else if (action === 'rename_inline') {
    const el = typeof nodeEl === 'function' ? nodeEl(targetId) : null;
    if (el && typeof startEdit === 'function') startEdit(el);
  } else if (action === 'duplicate') {
    duplicateNodeById(targetId);
  } else if (action === 'toggle_lock') {
    n.locked = !n.locked;
    commitHistory();
    renderAll();
  } else if (action === 'disconnect') {
    STATE.edges = (STATE.edges || []).filter(ed => ed.from !== targetId && ed.to !== targetId);
    commitHistory();
    renderAll();
  } else if (action === 'ask_ai') {
    setSel({ kind: 'node', id: n.id });
    if (typeof openAISidebarTab === 'function') openAISidebarTab(false);
  } else if (action === 'done' || action === 'pending' || action === 'progress' || action === 'error') {
    n.status = action;
    if (action === 'done') n.progress = 100;
    else if (action === 'pending') n.progress = 0;
    else if (action === 'progress' && (!n.progress || n.progress === 100)) n.progress = 50;
    commitHistory();
    renderAll();
  }
}

window.centerOnNode = centerOnNode;
window.duplicateNodeById = duplicateNodeById;
window.openNodeEditor = openNodeEditor;
window.updateNodeQuickBar = updateNodeQuickBar;
