// APP: Archivo principal que integra toda la aplicación
function initApp() {
  // Inicializar referencias DOM
  initDOM();

  // Cargar estado guardado
  loadState();
  commitHistory();

  // Renderizar interfaz inicial
  renderAll();

  // Registrar event listeners
  registerEventListeners();

  // Inicializar pestañas de panel e inspector v4
  initPanelTabs();
  initChat();

  // Simular bridge activo
  STATE.bridgeActive = true;
  updateBridgeIndicator();

  // Log de inicio
  log('ok', 'FlowLab v3 - paginaRE iniciado');
  log('sync', 'Claude Code ↔ Qwen Coder');
  log('agent', 'orquestador de agentes IA activo');
}

function registerEventListeners() {
  // Paleta de herramientas
  document.querySelectorAll('[data-add]').forEach(b => {
    b.addEventListener('click', () => {
      const r = DOM.vp.getBoundingClientRect();
      const p = screenToWorld(r.left + r.width / 2, r.top + r.height / 2);
      const n = createNode(b.dataset.add, 'paso', Math.round(p.x - 85), Math.round(p.y - 30));
      STATE.nodes.push(n);
      commitHistory();
      renderAll();
      setSel({ kind: 'node', id: n.id });
    });
  });

  // Herramientas de edición
  document.getElementById('toolDelete').addEventListener('click', deleteSel);
  document.getElementById('toolFit').addEventListener('click', fitView);
  document.getElementById('toolUndo').addEventListener('click', undo);
  document.getElementById('toolRedo').addEventListener('click', redo);

  // Zoom
  document.getElementById('zIn').addEventListener('click', () => {
    const r = DOM.vp.getBoundingClientRect();
    zoomAt(r.left + r.width / 2, r.top + r.height / 2, STATE.zoom * 1.2);
  });
  document.getElementById('zOut').addEventListener('click', () => {
    const r = DOM.vp.getBoundingClientRect();
    zoomAt(r.left + r.width / 2, r.top + r.height / 2, STATE.zoom / 1.2);
  });
  document.getElementById('zReset').addEventListener('click', () => {
    STATE.zoom = 1;
    applyTransform();
  });
  document.getElementById('zFit').addEventListener('click', fitView);
  document.getElementById('btnSnap').addEventListener('click', e => {
    STATE.snapOn = !STATE.snapOn;
    e.target.classList.toggle('on', STATE.snapOn);
  });

  // Búsqueda y filtro
  document.getElementById('searchBox').addEventListener('input', () => renderNodes());
  document.getElementById('filterStatus').addEventListener('change', e => {
    STATE.statusFilter = e.target.value;
    renderNodes();
  });

  // Plantillas
  document.getElementById('templateSelect').addEventListener('change', e => {
    if (!e.target.value) return;
    const tmpl = getTemplate(e.target.value);
    STATE.nodes = tmpl.nodes;
    STATE.edges = tmpl.edges;
    STATE.hPtr = -1;
    STATE.history = [];
    commitHistory();
    log('ok', 'plantilla: ' + e.target.value);
    renderAll();
    // Defer fitView to ensure DOM elements are fully rendered with correct dimensions
    requestAnimationFrame(() => {
      fitView();
    });
    e.target.value = '';
  });

  // Export/Import
  document.getElementById('btnJson').addEventListener('click', exportJSON);
  document.getElementById('btnLoad').addEventListener('click', () => {
    document.getElementById('fileInput').click();
  });
  document.getElementById('fileInput').addEventListener('change', e => {
    if (e.target.files[0]) importJSON(e.target.files[0]);
  });
  document.getElementById('btnNew').addEventListener('click', () => {
    resetState();
    commitHistory();
    log('warn', 'lienzo nuevo');
    renderAll();
  });

  // Consola
  document.getElementById('btnRun').addEventListener('click', () => simulateExecution());
  document.getElementById('btnClearLog').addEventListener('click', () => {
    DOM.console.innerHTML = '';
    log('ok', 'log limpiado');
  });
  document.getElementById('btnToggleCon').addEventListener('click', e => {
    document.getElementById('consoleWrap').classList.toggle('min');
    e.target.textContent = document.getElementById('consoleWrap').classList.contains('min') ? '⊞' : '—';
  });

  // Nuevos botones v4
  document.getElementById('btnMermaid')?.addEventListener('click', () => exportMermaid());
  document.getElementById('btnPng')?.addEventListener('click', () => exportPNG());
  document.getElementById('btnChat')?.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleChatPanel();
  });
  document.getElementById('btnInsp')?.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleInspectorPanel();
  });
  document.getElementById('btnExp')?.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleExportPopover();
  });

  // Cerrar popover de exportación al hacer clic fuera
  document.addEventListener('pointerdown', e => {
    const pop = document.getElementById('expPopover');
    if (pop && !pop.hidden) {
      if (!pop.contains(e.target) && e.target.id !== 'btnExp' && !e.target.closest('#btnExp')) {
        toggleExportPopover(false);
      }
    }
  });

  // Speed control
  document.getElementById('speedSel')?.addEventListener('change', e => {
    STATE.speed = parseFloat(e.target.value);
    log('info', `velocidad: ${STATE.speed}x`);
  });

  // Viewport (pan, zoom, interacción)
  DOM.vp.addEventListener('contextmenu', e => e.preventDefault());
  DOM.vp.addEventListener('wheel', e => {
    e.preventDefault();
    if (e.shiftKey) {
      STATE.pan.x -= e.deltaY;
      applyTransform();
      saveState();
      return;
    }
    zoomAt(e.clientX, e.clientY, STATE.zoom * (e.deltaY < 0 ? 1.12 : 0.9));
  }, { passive: false });

  // Keyboard shortcuts
  window.addEventListener('keydown', e => {
    const a = document.activeElement;
    const typing = a && (a.tagName === 'INPUT' || a.tagName === 'TEXTAREA' || a.tagName === 'SELECT' || a.isContentEditable);

    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
      if (typing) return;
      e.preventDefault();
      e.shiftKey ? redo() : undo();
      return;
    }
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
      if (typing) return;
      e.preventDefault();
      redo();
      return;
    }
    if (typing) return;
    if (e.key === 'Delete' || e.key === 'Backspace') {
      e.preventDefault();
      deleteSel();
    }
    if (e.key === 'Escape') {
      setSel(null);
      toggleExportPopover(false);
    }
  });

  // Minimap
  DOM.minimap.addEventListener('pointerdown', e => {
    e.stopPropagation();
    const m = DOM.minimap._map;
    if (!m) return;
    const r = DOM.minimap.getBoundingClientRect();
    const wx = (e.clientX - r.left - m.ox) / m.sc + m.b.minX;
    const wy = (e.clientY - r.top - m.oy) / m.sc + m.b.minY;
    const rv = DOM.vp.getBoundingClientRect();
    STATE.pan.x = rv.width / 2 - wx * STATE.zoom;
    STATE.pan.y = rv.height / 2 - wy * STATE.zoom;
    applyTransform();
  });

  // Viewport interactions (pan, drag, connect)
  DOM.vp.addEventListener('pointerdown', e => {
    if (e.target.closest('.zoombar') || e.target.closest('#minimap')) return;
    if (e.button === 2 || e.button === 1) {
      STATE.panning = { sx: e.clientX, sy: e.clientY, ox: STATE.pan.x, oy: STATE.pan.y };
      DOM.vp.classList.add('panning');
      e.preventDefault();
      return;
    }
    if (e.button !== 0) return;

    if (e.target.classList.contains('port')) {
      const nEl = e.target.closest('.node');
      STATE.connecting = { id: nEl.dataset.id, side: e.target.dataset.side };
      e.stopPropagation();
      e.preventDefault();
      return;
    }

    const nEl = e.target.closest('.node');
    if (nEl && !STATE.editing) {
      setSel({ kind: 'node', id: nEl.dataset.id });
      const n = byId(nEl.dataset.id);
      STATE.dragging = { id: n.id, sx: e.clientX, sy: e.clientY, ox: n.x, oy: n.y, moved: false };
      e.preventDefault();
      return;
    }

    const hEl = e.target.closest('.edge-hit');
    if (hEl) {
      setSel({ kind: 'edge', id: hEl.dataset.id });
      e.preventDefault();
      return;
    }

    setSel(null);
    STATE.panning = { sx: e.clientX, sy: e.clientY, ox: STATE.pan.x, oy: STATE.pan.y };
    DOM.vp.classList.add('panning');
  });

  window.addEventListener('pointermove', e => {
    if (STATE.dragging) {
      const n = byId(STATE.dragging.id);
      if (!n) return;
      let nx = STATE.dragging.ox + (e.clientX - STATE.dragging.sx) / STATE.zoom;
      let ny = STATE.dragging.oy + (e.clientY - STATE.dragging.sy) / STATE.zoom;
      if (STATE.snapOn) {
        nx = Math.round(nx / CONFIG.SNAP_GRID) * CONFIG.SNAP_GRID;
        ny = Math.round(ny / CONFIG.SNAP_GRID) * CONFIG.SNAP_GRID;
      }
      n.x = Math.round(nx);
      n.y = Math.round(ny);
      STATE.dragging.moved = true;
      const el = nodeEl(n.id);
      if (el) {
        el.style.left = n.x + 'px';
        el.style.top = n.y + 'px';
      }
      drawEdges();
      drawMinimap();
    } else if (STATE.panning) {
      STATE.pan.x = STATE.panning.ox + (e.clientX - STATE.panning.sx);
      STATE.pan.y = STATE.panning.oy + (e.clientY - STATE.panning.sy);
      applyTransform();
    }
  });

  window.addEventListener('pointerup', e => {
    if (STATE.connecting) {
      const t = document.elementFromPoint(e.clientX, e.clientY);
      const nEl = (t && t.closest) ? t.closest('.node') : null;
      if (nEl && nEl.dataset.id !== STATE.connecting.id) {
        const to = nEl.dataset.id;
        if (!STATE.edges.some(x => x.from === STATE.connecting.id && x.to === to)) {
          const ne = createEdge(STATE.connecting.id, to, '', 'normal');
          STATE.edges.push(ne);
          commitHistory();
          renderAll();
          setSel({ kind: 'edge', id: ne.id });
        }
      }
      STATE.connecting = null;
    }
    if (STATE.dragging) {
      if (STATE.dragging.moved) commitHistory();
      STATE.dragging = null;
      saveState();
    }
    if (STATE.panning) {
      STATE.panning = null;
      DOM.vp.classList.remove('panning');
      saveState();
    }
  });

  DOM.vp.addEventListener('dblclick', e => {
    const nEl = e.target.closest('.node');
    if (nEl) {
      startEdit(nEl);
      return;
    }
    if (e.target.closest('.edge-hit') || e.target.closest('.zoombar') || e.target.closest('#minimap')) return;
    const p = screenToWorld(e.clientX, e.clientY);
    const n = createNode('process', 'paso', Math.round(p.x - 85), Math.round(p.y - 29));
    STATE.nodes.push(n);
    commitHistory();
    renderAll();
    setSel({ kind: 'node', id: n.id });
  });
}

// Función auxiliar para actualizar indicador de bridge
function updateBridgeIndicator() {
  const dot = document.getElementById('bridgeDot');
  if (dot) {
    dot.style.color = STATE.bridgeActive ? '#4ade80' : '#ef4444';
    dot.textContent = STATE.bridgeActive ? '●' : '○';
  }
}

// Llamar a initApp cuando el DOM esté listo
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
