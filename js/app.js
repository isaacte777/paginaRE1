// APP: Archivo principal que integra toda la aplicación
function initApp() {
  // Inicializar referencias DOM
  initDOM();

  // Cargar estado guardado
  const restoredProject = loadState();
  commitHistory();

  // Renderizar interfaz inicial
  renderAll();
  document.getElementById('btnSnap')?.classList.toggle('on', STATE.snapOn);
  const savedSpeed = document.getElementById('speedSel');
  if (savedSpeed) savedSpeed.value = String(STATE.speed);

  // Ajustar la vista automáticamente para que todo el mapa quepa centrado al iniciar
  if (!restoredProject) {
    requestAnimationFrame(() => {
      fitView();
    });
  }

  // Sincronizar título de proyecto entre desktop y mobile
  const pTitle = document.getElementById('projTitle');
  const pTitleMob = document.getElementById('projTitleMobile');
  if (pTitle && pTitleMob) {
    pTitleMob.value = pTitle.value;
    pTitle.addEventListener('input', () => { pTitleMob.value = pTitle.value; saveState(); });
    pTitleMob.addEventListener('input', () => { pTitle.value = pTitleMob.value; saveState(); });
  }

  // Registrar event listeners
  registerEventListeners();

  // Inicializar pestañas de panel e inspector v4
  initPanelTabs();
  initChat();
  if (typeof initAIAssistant === 'function') initAIAssistant();
  initHeaderTooltips();
  if (typeof initCustomDropdowns === 'function') initCustomDropdowns();
  initConsoleResize();
  initConsoleInput();
  initDraggableExportPopover();
  initMobileUI();
  initLiveSync();

  // Simular bridge activo
  STATE.bridgeActive = true;
  updateBridgeIndicator();

  // Log de inicio
  log('ok', 'FlowLab v3 - paginaRE iniciado');
  log('sync', 'Claude Code ↔ Qwen Coder');
  log('agent', 'orquestador de agentes IA activo');

  if (typeof initPowerShellTerminal === 'function') {
    initPowerShellTerminal();
  }
}

function isMobileLayout() {
  return window.matchMedia('(max-width: 768px)').matches;
}

function setMobilePalette(open) {
  if (!open) {
    closeMobilePalette();
    return;
  }

  const palette = document.getElementById('palette');
  const scrim = document.getElementById('mobileScrim');
  const menuButton = document.getElementById('btnMenu');
  const shouldOpen = isMobileLayout();

  if (palette) palette.classList.toggle('mobile-open', shouldOpen);
  if (scrim) scrim.hidden = !shouldOpen;
  if (menuButton) menuButton.setAttribute('aria-expanded', String(shouldOpen));
  if (shouldOpen) dismissMobilePaletteHint();
}

function toggleMobilePalette() {
  dismissMobilePaletteHint();
  const palette = document.getElementById('palette');
  setMobilePalette(!(palette && palette.classList.contains('mobile-open')));
}

function dismissMobilePaletteHint() {
  const hint = document.getElementById('mobilePaletteHint');
  if (hint) hint.hidden = true;
  try { sessionStorage.setItem('flowlab-mobile-palette-hint-seen', '1'); } catch {}
}

function closeMobilePalette() {
  // El cierre no depende del media query: tambi\u00e9n funciona si el tel\u00e9fono
  // rota mientras la bandeja est\u00e1 abierta.
  const palette = document.getElementById('palette');
  const scrim = document.getElementById('mobileScrim');
  const menuButton = document.getElementById('btnMenu');

  if (palette) palette.classList.remove('mobile-open');
  if (scrim) scrim.hidden = true;
  if (menuButton) menuButton.setAttribute('aria-expanded', 'false');
}

function initMobileUI() {
  const menuButton = document.getElementById('btnMenu');
  const scrim = document.getElementById('mobileScrim');
  const closeButton = document.getElementById('btnClosePalette');
  const hint = document.getElementById('mobilePaletteHint');

  if (menuButton) {
    menuButton.removeAttribute('onclick');
    menuButton.onclick = null;
    menuButton.setAttribute('type', 'button');
    menuButton.setAttribute('aria-controls', 'palette');
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.addEventListener('click', toggleMobilePalette);
  }
  if (scrim) scrim.addEventListener('click', closeMobilePalette);
  if (closeButton) closeButton.addEventListener('click', closeMobilePalette);
  if (hint) {
    hint.addEventListener('click', () => {
      dismissMobilePaletteHint();
      setMobilePalette(true);
    });
    try {
      if (!sessionStorage.getItem('flowlab-mobile-palette-hint-seen')) {
        requestAnimationFrame(() => {
          if (isMobileLayout()) hint.hidden = false;
        });
      }
    } catch {
      if (isMobileLayout()) hint.hidden = false;
    }
  }

  document.querySelectorAll('#palette .tool').forEach(tool => {
    tool.addEventListener('click', () => {
      if (isMobileLayout()) closeMobilePalette();
    });
  });
}

function registerEventListeners() {
  // Seguimiento exclusivo para gestos táctiles dentro del lienzo. Mantenerlo
  // local evita que un pellizco altere los controles de escritorio.
  const touchPointers = new Map();
  let pinchGesture = null;

  const getPinchPoints = () => Array.from(touchPointers.values()).slice(0, 2);
  const getPinchDistance = (a, b) => Math.hypot(b.x - a.x, b.y - a.y);

  const beginPinchGesture = () => {
    const [a, b] = getPinchPoints();
    if (!a || !b) return;
    const rect = DOM.vp.getBoundingClientRect();
    const centerX = (a.x + b.x) / 2;
    const centerY = (a.y + b.y) / 2;
    const distance = getPinchDistance(a, b);
    if (!distance) return;

    pinchGesture = {
      distance,
      zoom: STATE.zoom,
      worldX: (centerX - rect.left - STATE.pan.x) / STATE.zoom,
      worldY: (centerY - rect.top - STATE.pan.y) / STATE.zoom
    };

    // Un segundo dedo convierte cualquier arrastre o paneo de un dedo en zoom.
    STATE.dragging = null;
    STATE.panning = null;
    STATE.connecting = null;
    DOM.vp.classList.remove('panning');
  };

  const endPinchGesture = () => {
    pinchGesture = null;
    STATE.dragging = null;
    STATE.panning = null;
    STATE.connecting = null;
    DOM.vp.classList.remove('panning');
    saveState();
  };

  // Paleta de herramientas: clic para añadir al centro o arrastre para elegir
  // la posición exacta. El arrastre se limita a escritorio para no interferir
  // con la bandeja y los gestos táctiles de móvil.
  let paletteDrag = null;
  let skipPaletteClick = false;

  const clearPaletteDrag = () => {
    if (!paletteDrag) return;
    paletteDrag.tool.classList.remove('drag-origin');
    paletteDrag.ghost.remove();
    paletteDrag = null;
    document.body.classList.remove('palette-drag-active');
    DOM.vp.classList.remove('palette-drop-ready');
  };

  const pointIsOverViewport = (x, y) => {
    const r = DOM.vp.getBoundingClientRect();
    return x >= r.left && x <= r.right && y >= r.top && y <= r.bottom;
  };

  const movePaletteGhost = (x, y) => {
    if (!paletteDrag) return;
    const overCanvas = pointIsOverViewport(x, y);
    paletteDrag.ghost.style.left = x + 'px';
    paletteDrag.ghost.style.top = y + 'px';
    if (paletteDrag.moved) paletteDrag.ghost.classList.add('is-moving');
    paletteDrag.ghost.classList.toggle('over-canvas', overCanvas);
    DOM.vp.classList.toggle('palette-drop-ready', overCanvas);
  };

  const addPaletteNode = (type, x, y, animate = false, dimensions = null) => {
    const width = dimensions?.width || 170;
    const height = dimensions?.height || 60;
    const n = createNode(type, 'paso', Math.round(x - width / 2), Math.round(y - height / 2));
    STATE.nodes.push(n);
    STATE.isBlankCanvas = false;
    commitHistory();
    setSel({ kind: 'node', id: n.id });
    if (animate && typeof animateNodePlacement === 'function') animateNodePlacement(n.id);
    return n;
  };

  const makePaletteNodeGhost = type => {
    const previewNode = createNode(type, 'paso', 0, 0);
    const ghost = document.createElement('div');
    ghost.className = 'node ' + type + ' st-pending palette-node-ghost is-moving type-' + type;
    ghost.setAttribute('aria-hidden', 'true');

    const text = '<span class="txt">paso</span>';
    let html = '';
    if (type.startsWith('chart_') && typeof renderChartNodeHtml === 'function') {
      html = renderChartNodeHtml(previewNode);
    } else if (type === 'metrics' && typeof renderMetricsWidget === 'function') {
      html = renderMetricsWidget(previewNode);
    } else {
      html = (type === 'decision' || type === 'loop' || type === 'io')
        ? '<div class="core">' + text + '</div>'
        : text;
    }
    ghost.innerHTML = html + '<span class="badge">' + (CONFIG.BADGE.pending || '[ ]') + '</span>';
    return ghost;
  };

  document.querySelectorAll('[data-add]').forEach(tool => {
    tool.addEventListener('pointerdown', e => {
      if (isMobileLayout() || e.pointerType === 'touch' || e.button !== 0) return;

      const ghost = makePaletteNodeGhost(tool.dataset.add);
      document.body.appendChild(ghost);
      const dimensions = { width: ghost.offsetWidth || 170, height: ghost.offsetHeight || 60 };

      paletteDrag = {
        pointerId: e.pointerId,
        tool,
        type: tool.dataset.add,
        startX: e.clientX,
        startY: e.clientY,
        moved: false,
        ghost,
        dimensions
      };
      tool.classList.add('drag-origin');
      document.body.classList.add('palette-drag-active');
      movePaletteGhost(e.clientX, e.clientY);
      try { tool.setPointerCapture(e.pointerId); } catch {}
    });

    tool.addEventListener('click', () => {
      if (skipPaletteClick) {
        skipPaletteClick = false;
        return;
      }
      const r = DOM.vp.getBoundingClientRect();
      const p = screenToWorld(r.left + r.width / 2, r.top + r.height / 2);
      addPaletteNode(tool.dataset.add, p.x, p.y, true);
      if (isMobileLayout()) closeMobilePalette();
    });
  });

  // Herramientas de edición
  window.addEventListener('pointermove', e => {
    if (!paletteDrag || e.pointerId !== paletteDrag.pointerId) return;
    const distance = Math.hypot(e.clientX - paletteDrag.startX, e.clientY - paletteDrag.startY);
    if (distance > 4) paletteDrag.moved = true;
    movePaletteGhost(e.clientX, e.clientY);
    if (paletteDrag.moved) {
      e.preventDefault();
    }
  }, { passive: false });

  window.addEventListener('pointerup', e => {
    if (!paletteDrag || e.pointerId !== paletteDrag.pointerId) return;

    const drag = paletteDrag;
    const shouldAdd = drag.moved && pointIsOverViewport(e.clientX, e.clientY);
    clearPaletteDrag();
    if (!drag.moved) return;

    skipPaletteClick = true;
    window.setTimeout(() => { skipPaletteClick = false; }, 0);
    if (shouldAdd) {
      const p = screenToWorld(e.clientX, e.clientY);
      addPaletteNode(drag.type, p.x, p.y, true, drag.dimensions);
    }
    e.preventDefault();
  }, { passive: false });

  window.addEventListener('pointercancel', e => {
    if (paletteDrag && e.pointerId === paletteDrag.pointerId) clearPaletteDrag();
  });

  document.getElementById('toolDelete').addEventListener('click', deleteSel);
  document.getElementById('toolFit').addEventListener('click', fitView);
  document.getElementById('toolUndo').addEventListener('click', undo);
  document.getElementById('toolRedo').addEventListener('click', redo);
  document.getElementById('toolInspector')?.addEventListener('click', () => {
    toggleInspectorPanel();
    closeMobilePalette();
  });

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
    saveState();
  });
  document.getElementById('zFit').addEventListener('click', fitView);
  document.getElementById('btnSnap').addEventListener('click', e => {
    STATE.snapOn = !STATE.snapOn;
    e.target.classList.toggle('on', STATE.snapOn);
    saveState();
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
    STATE.isBlankCanvas = false;
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
    if (e.target.files[0]) importProjectFile(e.target.files[0]);
  });
  document.getElementById('btnNew').addEventListener('click', () => {
    resetState();
    commitHistory();
    log('warn', 'lienzo nuevo');
    renderAll();
  });

  // Consola y Terminal PowerShell
  document.getElementById('btnRun').addEventListener('click', () => simulateExecution());
  document.getElementById('btnClearLog').addEventListener('click', () => {
    if (typeof clearActiveTerminal === 'function') {
      clearActiveTerminal();
      return;
    }
    DOM.console.innerHTML = '';
    log('ok', 'log limpiado');
  });
  document.getElementById('btnToggleCon').addEventListener('click', () => {
    const wrap = document.getElementById('consoleWrap');
    const showBtn = document.getElementById('btnShowConsole');
    if (wrap) wrap.style.display = 'none';
    if (showBtn) showBtn.style.display = 'inline-block';
  });

  document.getElementById('btnShowConsole')?.addEventListener('click', () => {
    const wrap = document.getElementById('consoleWrap');
    const showBtn = document.getElementById('btnShowConsole');
    if (wrap) wrap.style.display = 'flex';
    if (showBtn) showBtn.style.display = 'none';
  });

  // Nuevos botones v4
  document.getElementById('btnMermaid')?.addEventListener('click', () => exportMermaid());
  document.getElementById('btnPng')?.addEventListener('click', () => exportPNG());
  document.getElementById('btnExp')?.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleExportPopover();
  });
  document.getElementById('btnHelp')?.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleHelpPopover();
  });

  // Cerrar popover de exportación, ayuda y menú contextual al hacer clic fuera
  document.addEventListener('pointerdown', e => {
    const pop = document.getElementById('expPopover');
    if (pop && !pop.hidden) {
      if (!pop.contains(e.target) && e.target.id !== 'btnExp' && !e.target.closest('#btnExp')) {
        toggleExportPopover(false);
      }
    }
    const ctxMenu = document.getElementById('nodeContextMenu');
    if (ctxMenu && !ctxMenu.hidden) {
      if (!ctxMenu.contains(e.target)) {
        hideNodeContextMenu();
      }
    }
  });

  // Menú contextual en nodos (clic derecho)
  DOM.world.addEventListener('contextmenu', e => {
    const nEl = e.target.closest('.node');
    if (nEl) {
      showNodeContextMenu(e, nEl.dataset.id);
    } else {
      e.preventDefault();
    }
  });

  // Speed control
  document.getElementById('speedSel')?.addEventListener('change', e => {
    STATE.speed = parseFloat(e.target.value);
    saveState();
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
      closeMobilePalette();
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

    if (e.pointerType === 'touch') {
      touchPointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      try { DOM.vp.setPointerCapture(e.pointerId); } catch {}
      if (touchPointers.size >= 2) {
        beginPinchGesture();
        e.preventDefault();
        return;
      }
    }

    if (e.button === 2 || e.button === 1) {
      STATE.panning = { sx: e.clientX, sy: e.clientY, ox: STATE.pan.x, oy: STATE.pan.y };
      DOM.vp.classList.add('panning');
      e.preventDefault();
      return;
    }
    if (e.button !== 0) return;

    // Comprobar si se hizo clic en el candado de bloqueo del nodo
    const lockEl = e.target.closest('.lock-badge');
    if (lockEl) {
      e.stopPropagation();
      e.preventDefault();
      const nodeId = lockEl.dataset.nodeLock;
      const n = byId(nodeId);
      if (n) {
        n.locked = !n.locked;
        commitHistory();
        renderAll();
        showToast(n.locked ? 'Nodo bloqueado (fijo)' : 'Nodo desbloqueado', 'info', 1500);
      }
      return;
    }

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
    STATE.mouse.x = e.clientX;
    STATE.mouse.y = e.clientY;

    if (e.pointerType === 'touch' && touchPointers.has(e.pointerId)) {
      touchPointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (pinchGesture && touchPointers.size >= 2) {
        const [a, b] = getPinchPoints();
        const distance = getPinchDistance(a, b);
        const rect = DOM.vp.getBoundingClientRect();
        const centerX = (a.x + b.x) / 2;
        const centerY = (a.y + b.y) / 2;
        const targetZoom = clamp(pinchGesture.zoom * (distance / pinchGesture.distance), CONFIG.ZOOM_MIN, CONFIG.ZOOM_MAX);

        STATE.zoom = targetZoom;
        STATE.pan.x = centerX - rect.left - pinchGesture.worldX * targetZoom;
        STATE.pan.y = centerY - rect.top - pinchGesture.worldY * targetZoom;
        applyTransform();
        e.preventDefault();
        return;
      }
    }

    if (STATE.connecting) {
      drawEdges();
      return;
    }

    if (STATE.dragging) {
      const n = byId(STATE.dragging.id);
      if (!n || n.locked) return;
      let nx = STATE.dragging.ox + (e.clientX - STATE.dragging.sx) / STATE.zoom;
      let ny = STATE.dragging.oy + (e.clientY - STATE.dragging.sy) / STATE.zoom;
      if (STATE.snapOn) {
        nx = Math.round(nx / CONFIG.SNAP_GRID) * CONFIG.SNAP_GRID;
        ny = Math.round(ny / CONFIG.SNAP_GRID) * CONFIG.SNAP_GRID;
      }
      n.x = Math.round(nx);
      n.y = Math.round(ny);
      STATE.dragging.moved = true;
      renderNodes();
      drawEdges();
      drawMinimap();
    } else if (STATE.panning) {
      STATE.pan.x = STATE.panning.ox + (e.clientX - STATE.panning.sx);
      STATE.pan.y = STATE.panning.oy + (e.clientY - STATE.panning.sy);
      applyTransform();
    }
  });

  window.addEventListener('pointerup', e => {
    if (e.pointerType === 'touch' && touchPointers.has(e.pointerId)) {
      const wasPinching = !!pinchGesture;
      touchPointers.delete(e.pointerId);
      try { DOM.vp.releasePointerCapture(e.pointerId); } catch {}
      if (wasPinching) {
        endPinchGesture();
        return;
      }
    }

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
      drawEdges();
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

  window.addEventListener('pointercancel', e => {
    if (e.pointerType !== 'touch' || !touchPointers.has(e.pointerId)) return;
    const wasPinching = !!pinchGesture;
    touchPointers.delete(e.pointerId);
    if (wasPinching) {
      endPinchGesture();
      return;
    }
    STATE.dragging = null;
    STATE.panning = null;
    STATE.connecting = null;
    DOM.vp.classList.remove('panning');
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

  // Auto-fit on window resize
  window.addEventListener('resize', () => {
    if (!isMobileLayout()) closeMobilePalette();
    requestAnimationFrame(() => {
      fitView();
    });
  });
}

function applyTransform() {
  if (DOM.world) {
    DOM.world.style.transform = `translate(${STATE.pan.x}px, ${STATE.pan.y}px) scale(${STATE.zoom})`;
  }
  const zoomLbl = document.getElementById('zoomLbl');
  if (zoomLbl) {
    zoomLbl.textContent = Math.round(STATE.zoom * 100) + '%';
  }
  updateStatus();
  if (typeof drawMinimap === 'function') drawMinimap();
}

function animateNodePlacement(id) {
  const element = nodeEl(id);
  if (!element) return;

  element.classList.remove('node-placed');
  requestAnimationFrame(() => {
    element.classList.add('node-placed');
    element.addEventListener('animationend', () => element.classList.remove('node-placed'), { once: true });
  });
}

function zoomAt(cx, cy, targetZoom) {
  const r = DOM.vp.getBoundingClientRect();
  const wx = (cx - r.left - STATE.pan.x) / STATE.zoom;
  const wy = (cy - r.top - STATE.pan.y) / STATE.zoom;
  STATE.zoom = clamp(targetZoom, 0.2, 3);
  STATE.pan.x = cx - r.left - wx * STATE.zoom;
  STATE.pan.y = cy - r.top - wy * STATE.zoom;
  applyTransform();
  saveState();
}

function fitView() {
  if (!STATE.nodes.length) {
    STATE.zoom = 1;
    STATE.pan = { x: 60, y: 80 };
    applyTransform();
    return;
  }
  const b = bbox();
  const r = DOM.vp.getBoundingClientRect();
  const w = r.width || 800;
  const h = r.height || 600;
  const bw = b.maxX - b.minX;
  const bh = b.maxY - b.minY;
  if (bw <= 0 || bh <= 0) return;
  const zx = (w - 80) / bw;
  const zy = (h - 80) / bh;
  STATE.zoom = clamp(Math.min(zx, zy, 1.5), 0.2, 2);
  STATE.pan.x = (w / 2) - ((b.minX + bw / 2) * STATE.zoom);
  STATE.pan.y = (h / 2) - ((b.minY + bh / 2) * STATE.zoom);
  applyTransform();
  saveState();
}

function drawMinimap() {
  if (!DOM.mmx || !DOM.minimap) return;
  const ctx = DOM.mmx;
  const w = DOM.minimap.width;
  const h = DOM.minimap.height;
  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = '#131416';
  ctx.fillRect(0, 0, w, h);

  if (!STATE.nodes.length) return;
  const b = bbox();
  const bw = b.maxX - b.minX || 1;
  const bh = b.maxY - b.minY || 1;
  const sc = Math.min((w - 20) / bw, (h - 20) / bh);
  const ox = (w - bw * sc) / 2 - b.minX * sc;
  const oy = (h - bh * sc) / 2 - b.minY * sc;

  DOM.minimap._map = { sc, ox, oy, b };

  ctx.fillStyle = '#4ade80';
  STATE.nodes.forEach(n => {
    const nx = n.x * sc + ox;
    const ny = n.y * sc + oy;
    const nw = Math.max(4, n.w * sc);
    const nh = Math.max(3, n.h * sc);
    ctx.fillRect(nx, ny, nw, nh);
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
