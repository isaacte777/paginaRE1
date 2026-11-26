// PANEL: Menú de edición avanzado de nodos y conexiones, estadísticas y chat IA
let currentPanelTab = 'props';

function switchRightPanelTab(tabName) {
  currentPanelTab = tabName;
  const tabProps = document.getElementById('tabProps');
  const tabStats = document.getElementById('tabStats');
  const tabAI = document.getElementById('tabAI');
  const panelBody = DOM.panel || document.getElementById('panel');
  const aiView = document.getElementById('aiSidebarView');

  if (tabProps) tabProps.classList.toggle('on', tabName === 'props');
  if (tabStats) tabStats.classList.toggle('on', tabName === 'stats');
  if (tabAI) tabAI.classList.toggle('on', tabName === 'ai');

  if (tabName === 'ai') {
    if (panelBody) panelBody.hidden = true;
    if (aiView) aiView.hidden = false;
    if (typeof updateAIChatContextUI === 'function') updateAIChatContextUI();
  } else {
    if (panelBody) panelBody.hidden = false;
    if (aiView) aiView.hidden = true;
    updatePanel();
  }
}

function initPanelTabs() {
  document.getElementById('tabProps')?.addEventListener('click', () => switchRightPanelTab('props'));
  document.getElementById('tabStats')?.addEventListener('click', () => switchRightPanelTab('stats'));
  document.getElementById('tabAI')?.addEventListener('click', () => {
    switchRightPanelTab('ai');
    setTimeout(() => document.getElementById('aiChatInput')?.focus(), 30);
  });
}

function buildWorkflowNodeTypeSelectHtml(currentType) {
  const groups = [
    {
      label: 'Flujo y Control',
      types: ['start', 'process', 'decision', 'loop', 'parallel', 'delay', 'sub', 'end']
    },
    {
      label: 'Datos, Integración e IA',
      types: ['io', 'db', 'varset', 'api', 'hook', 'ai', 'human', 'tryc', 'err', 'note']
    },
    {
      label: 'Gráficos de Flujo',
      types: ['chart_bar', 'chart_donut', 'chart_gauge', 'chart_funnel']
    }
  ];

  return groups
    .map(
      g =>
        `<optgroup label="${escapeHTML(g.label)}">${g.types
          .map(
            t =>
              `<option value="${escapeHTML(t)}" ${t === currentType ? 'selected' : ''}>${escapeHTML(CONFIG.NODE_TYPES[t] || t)}</option>`
          )
          .join('')}</optgroup>`
    )
    .join('');
}

function renderEmptyEditorState(p) {
  const sparkSvg =
    '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9L12 3z"/></svg>';
  const slidersSvg =
    '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/><line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/><line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/><line x1="1" y1="14" x2="7" y2="14"/><line x1="9" y1="8" x2="15" y2="8"/><line x1="17" y1="16" x2="23" y2="16"/></svg>';

  const nodes = Array.isArray(STATE.nodes) ? STATE.nodes : [];
  const quickPickHtml =
    nodes.length > 0
      ? `
        <div class="insp-section" style="margin-bottom:10px">
          <div class="insp-sec-head"><span>seleccionar nodo para editar (${nodes.length})</span></div>
          <div class="insp-node-picker">
            ${nodes
              .slice(0, 24)
              .map(nd => {
                const isFin = typeof isFinanceNodeType === 'function' && isFinanceNodeType(nd.type);
                const prefix = isFin && nd.params?.cellRef ? `[${nd.params.cellRef}] ` : '';
                const typeTag = isFin ? 'fx' : CONFIG.NODE_TYPES[nd.type] || nd.type;
                return `
                  <button type="button" class="insp-pick-row" data-pick-edit-node="${escapeHTML(nd.id)}">
                    <span class="insp-pick-row__name">${escapeHTML(prefix + (nd.text || nd.type))}</span>
                    <span class="insp-pick-row__tag">${escapeHTML(typeTag)}</span>
                  </button>`;
              })
              .join('')}
          </div>
        </div>`
      : `<div style="color:var(--tx3);font-size:10px;padding:4px 2px 12px">haz clic en cualquier nodo o conexión del lienzo para abrir su menú de edición</div>`;

  p.innerHTML =
    '<div class="props-empty-wrap">' +
    quickPickHtml +
    '<div class="props-ai-promo">' +
    '<div class="props-ai-promo__kicker">' + sparkSvg + '<span>asistente del flujo</span></div>' +
    '<div class="props-ai-promo__title">Crea o edita hablando con IA</div>' +
    '<p class="props-ai-promo__desc">Lee el contexto del lienzo actual y construye flujos o planillas financieras con métricas en vivo.</p>' +
    '<div class="props-ai-promo__btns">' +
    '<button type="button" class="btn primary" id="btnPromoOpenAI">' + sparkSvg + '<span>abrir chat ia</span></button>' +
    '<button type="button" class="btn" id="btnPromoCfgAI">' + slidersSvg + '<span>conectar</span></button>' +
    '</div>' +
    '</div>' +
    '</div>';

  p.querySelectorAll('[data-pick-edit-node]').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.pickEditNode;
      if (typeof setSel === 'function') setSel({ kind: 'node', id });
      if (typeof centerOnNode === 'function') centerOnNode(id);
    });
  });

  document.getElementById('btnPromoOpenAI')?.addEventListener('click', () => {
    if (typeof openAISidebarTab === 'function') openAISidebarTab(false);
  });
  document.getElementById('btnPromoCfgAI')?.addEventListener('click', () => {
    if (typeof openAISidebarTab === 'function') openAISidebarTab(true);
  });
}

function renderEdgeInspector(p, e) {
  const f = byId(e.from);
  const t = byId(e.to);
  const fromName = f ? `${f.params?.cellRef ? `[${f.params.cellRef}] ` : ''}${f.text || f.type}` : e.from;
  const toName = t ? `${t.params?.cellRef ? `[${t.params.cellRef}] ` : ''}${t.text || t.type}` : e.to;
  const quickLabels = ['Sí', 'No', 'OK', 'Error', '100%', '+', '-', ''];

  p.innerHTML = `
    <div class="insp-shell">
      <div class="insp-header">
        <div class="insp-header__meta">
          <span class="insp-badge">conexión</span>
          <span class="insp-type-tag">${escapeHTML(e.kind === 'error' ? 'flujo error' : 'estándar')}</span>
        </div>
        <div class="insp-quick-actions">
          <button type="button" class="insp-act-btn" id="edgeActReverse" title="Invertir sentido de la conexión">⇄</button>
          <button type="button" class="insp-act-btn is-danger" id="edgeActDelete" title="Eliminar conexión">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
          </button>
        </div>
      </div>

      <div class="insp-section">
        <div class="insp-sec-head"><span>extremos conectados</span></div>
        <div class="insp-conn-list">
          <div class="insp-conn-item">
            <span class="insp-type-tag">origen</span>
            <button type="button" class="insp-conn-jump" id="edgeJumpFrom">${escapeHTML(fromName)}</button>
          </div>
          <div class="insp-conn-item">
            <span class="insp-type-tag">destino</span>
            <button type="button" class="insp-conn-jump" id="edgeJumpTo">${escapeHTML(toName)}</button>
          </div>
        </div>
      </div>

      <div class="insp-section">
        <div class="insp-sec-head"><span>etiqueta y tipo de cable</span></div>
        <label>texto sobre el cable</label>
        <input type="text" id="edgeLbl" placeholder="Ej: Sí, No, OK, Error..." value="${escapeHTML(e.label || '')}">
        <div class="insp-chip-row">
          ${quickLabels
            .map(
              lbl =>
                `<button type="button" class="insp-chip" data-edge-quick-lbl="${escapeHTML(lbl)}">${lbl === '' ? 'limpiar' : escapeHTML(lbl)}</button>`
            )
            .join('')}
        </div>

        <label>comportamiento visual</label>
        <select id="edgeKindSel">
          <option value="normal" ${(e.kind || 'normal') !== 'error' ? 'selected' : ''}>Flujo normal</option>
          <option value="error" ${e.kind === 'error' ? 'selected' : ''}>Ruta de excepción / error</option>
        </select>
      </div>
    </div>
  `;

  document.getElementById('edgeJumpFrom')?.addEventListener('click', () => {
    if (f) {
      setSel({ kind: 'node', id: f.id });
      if (typeof centerOnNode === 'function') centerOnNode(f.id);
    }
  });
  document.getElementById('edgeJumpTo')?.addEventListener('click', () => {
    if (t) {
      setSel({ kind: 'node', id: t.id });
      if (typeof centerOnNode === 'function') centerOnNode(t.id);
    }
  });

  document.getElementById('edgeActReverse')?.addEventListener('click', () => {
    const tmp = e.from;
    e.from = e.to;
    e.to = tmp;
    commitHistory();
    renderAll();
  });

  document.getElementById('edgeActDelete')?.addEventListener('click', () => {
    if (typeof deleteSel === 'function') deleteSel();
  });

  document.getElementById('edgeLbl')?.addEventListener('input', ev => {
    e.label = ev.target.value;
    saveState();
    drawEdges();
    if (typeof updateNodeQuickBar === 'function') updateNodeQuickBar();
  });

  p.querySelectorAll('[data-edge-quick-lbl]').forEach(btn => {
    btn.addEventListener('click', () => {
      e.label = btn.dataset.edgeQuickLbl || '';
      commitHistory();
      drawEdges();
      saveState();
      updatePanel();
    });
  });

  document.getElementById('edgeKindSel')?.addEventListener('change', ev => {
    e.kind = ev.target.value;
    commitHistory();
    drawEdges();
    saveState();
    updatePanel();
  });
}

function updatePanel() {
  if (typeof updateAIChatContextUI === 'function') updateAIChatContextUI();
  if (typeof syncFormulaBarUI === 'function') syncFormulaBarUI();
  if (currentPanelTab === 'ai') return;

  const p = DOM.panel;
  if (!p) return;
  p.innerHTML = '';

  if (currentPanelTab === 'stats') {
    if (
      typeof renderFinanceMetricsPanel === 'function' &&
      typeof isFinanceNodeType === 'function' &&
      (STATE.canvasDomain === 'finance' || (STATE.nodes || []).some(nd => isFinanceNodeType(nd.type)))
    ) {
      renderFinanceMetricsPanel(p);
    } else {
      renderStatsTab(p);
    }
    return;
  }

  if (!STATE.sel) {
    renderEmptyEditorState(p);
    return;
  }

  if (STATE.sel.kind === 'edge') {
    const e = STATE.edges.find(x => x.id === STATE.sel.id);
    if (!e) {
      renderEmptyEditorState(p);
      return;
    }
    renderEdgeInspector(p, e);
    return;
  }

  const n = byId(STATE.sel.id);
  if (!n) {
    renderEmptyEditorState(p);
    return;
  }

  if (!n.params || typeof n.params !== 'object') n.params = {};

  if (typeof isFinanceNodeType === 'function' && isFinanceNodeType(n.type) && typeof renderFinanceNodeInspector === 'function') {
    renderFinanceNodeInspector(p, n);
    return;
  }

  // Parámetros específicos por tipo de nodo
  let paramsHtml = '';
  const typeParams = (CONFIG.NODE_PARAMS && CONFIG.NODE_PARAMS[n.type]) || [];
  if (typeParams.length > 0) {
    paramsHtml = `
      <div class="insp-section">
        <div class="insp-sec-head"><span>parámetros · ${escapeHTML(CONFIG.NODE_TYPES[n.type] || n.type)}</span></div>
        ${typeParams
          .map(param => {
            const val =
              n.params[param.key] !== undefined
                ? n.params[param.key]
                : n[param.key] !== undefined
                  ? n[param.key]
                  : param.default;
            if (param.type === 'select') {
              return `<label>${escapeHTML(param.label)}</label>
                <select class="node-param-field" data-key="${escapeHTML(param.key)}">
                  ${param.options
                    .map(
                      opt =>
                        `<option value="${escapeHTML(opt)}" ${val === opt ? 'selected' : ''}>${escapeHTML(opt)}</option>`
                    )
                    .join('')}
                </select>`;
            }
            if (param.type === 'number') {
              return `<label>${escapeHTML(param.label)}</label>
                <input type="number" class="node-param-field" data-key="${escapeHTML(param.key)}" value="${Number(val ?? 0)}" ${param.min !== undefined ? `min="${param.min}"` : ''} ${param.max !== undefined ? `max="${param.max}"` : ''} ${param.step !== undefined ? `step="${param.step}"` : ''}>`;
            }
            if (param.type === 'textarea') {
              return `<label>${escapeHTML(param.label)}</label>
                <textarea rows="2" class="node-param-field" data-key="${escapeHTML(param.key)}">${escapeHTML(val || '')}</textarea>`;
            }
            return `<label>${escapeHTML(param.label)}</label>
              <input type="text" class="node-param-field" data-key="${escapeHTML(param.key)}" value="${escapeHTML(val || '')}">`;
          })
          .join('')}
      </div>
    `;
  }

  const isBlocked = Boolean(STATE.blocked && STATE.blocked.has(n.id));
  const curStatus = n.status || 'pending';
  const curProg = clamp(Number(n.progress) || 0, 0, 100);
  const incomingEdges = (STATE.edges || []).filter(ed => ed.to === n.id);
  const outgoingEdges = (STATE.edges || []).filter(ed => ed.from === n.id);

  let circuitBtnHtml = '';
  if (typeof computeCircuit === 'function') {
    const c = computeCircuit(n.id);
    circuitBtnHtml = `
      <div class="insp-circuit-row">
        <span>causas: <b>${c.upstream.size}</b> · efectos: <b>${c.downstream.size}</b></span>
        <button type="button" id="btnToggleCircuit" class="insp-mini-btn">${STATE.circuitHighlight ? 'apagar ruta' : 'resaltar ruta'}</button>
      </div>
    `;
  }

  const candidatesToConnect = (STATE.nodes || []).filter(
    cand => cand.id !== n.id && !(STATE.edges || []).some(ed => ed.from === n.id && ed.to === cand.id)
  );

  const connectionsSectionHtml = `
    <div class="insp-section">
      <div class="insp-sec-head">
        <span>conexiones (${incomingEdges.length} ent · ${outgoingEdges.length} sal)</span>
      </div>
      ${circuitBtnHtml}
      ${
        incomingEdges.length || outgoingEdges.length
          ? `<div class="insp-conn-list">
              ${incomingEdges
                .map(ed => {
                  const src = byId(ed.from);
                  const srcName = src ? `${src.params?.cellRef ? `[${src.params.cellRef}] ` : ''}${src.text || src.type}` : ed.from;
                  return `
                    <div class="insp-conn-item">
                      <button type="button" class="insp-conn-jump" data-jump-node="${escapeHTML(ed.from)}" title="Ir al nodo origen">← ${escapeHTML(srcName)}</button>
                      <input type="text" class="insp-conn-lbl" data-edge-lbl="${escapeHTML(ed.id)}" placeholder="etiqueta" value="${escapeHTML(ed.label || '')}">
                      <button type="button" class="insp-conn-del" data-del-edge="${escapeHTML(ed.id)}" title="Desconectar">×</button>
                    </div>`;
                })
                .join('')}
              ${outgoingEdges
                .map(ed => {
                  const dst = byId(ed.to);
                  const dstName = dst ? `${dst.params?.cellRef ? `[${dst.params.cellRef}] ` : ''}${dst.text || dst.type}` : ed.to;
                  return `
                    <div class="insp-conn-item">
                      <button type="button" class="insp-conn-jump" data-jump-node="${escapeHTML(ed.to)}" title="Ir al nodo destino">→ ${escapeHTML(dstName)}</button>
                      <input type="text" class="insp-conn-lbl" data-edge-lbl="${escapeHTML(ed.id)}" placeholder="etiqueta" value="${escapeHTML(ed.label || '')}">
                      <button type="button" class="insp-conn-del" data-del-edge="${escapeHTML(ed.id)}" title="Desconectar">×</button>
                    </div>`;
                })
                .join('')}
            </div>`
          : `<div style="font-size:9px;color:var(--tx3);padding:2px 0 4px">Sin conexiones directas todavía.</div>`
      }
      ${
        candidatesToConnect.length > 0
          ? `<div class="insp-connect-adder">
              <select id="inspQuickConnectSel">
                <option value="">+ conectar salida hacia...</option>
                ${candidatesToConnect
                  .slice(0, 40)
                  .map(
                    c =>
                      `<option value="${escapeHTML(c.id)}">${escapeHTML((c.params?.cellRef ? `[${c.params.cellRef}] ` : '') + (c.text || c.type))}</option>`
                  )
                  .join('')}
              </select>
            </div>`
          : ''
      }
    </div>
  `;

  p.innerHTML = `
    <div class="insp-shell">
      <div class="insp-header">
        <div class="insp-header__meta">
          <span class="insp-badge">${escapeHTML(CONFIG.NODE_TYPES[n.type] || n.type)}</span>
          ${isBlocked ? '<span class="insp-type-tag is-danger">dep. pendiente</span>' : ''}
          ${n.locked ? '<span class="insp-type-tag is-warn">fijo</span>' : ''}
        </div>
        <div class="insp-quick-actions">
          <button type="button" class="insp-act-btn" id="nodeActCenter" title="Centrar en pantalla">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/></svg>
          </button>
          <button type="button" class="insp-act-btn" id="nodeActDup" title="Duplicar nodo (Ctrl+D)">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
          </button>
          <button type="button" class="insp-act-btn ${n.locked ? 'is-on' : ''}" id="nodeActLock" title="${n.locked ? 'Desbloquear posición' : 'Bloquear posición'}">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          </button>
          <button type="button" class="insp-act-btn" id="nodeActAI" title="Consultar a la IA sobre este nodo">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9L12 3z"/></svg>
          </button>
          <button type="button" class="insp-act-btn is-danger" id="nodeActDel" title="Eliminar nodo">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
          </button>
        </div>
      </div>

      <div class="insp-section">
        <div class="insp-sec-head"><span>identidad y tipo</span></div>
        <label>título / etiqueta</label>
        <textarea id="nodeTxt" rows="2" placeholder="Nombre o acción del nodo...">${escapeHTML(n.text || '')}</textarea>

        <label>cambiar tipo de nodo</label>
        <select id="nodeTypeSwitcher">${buildWorkflowNodeTypeSelectHtml(n.type)}</select>
      </div>

      <div class="insp-section">
        <div class="insp-sec-head"><span>estado y avance</span></div>
        <div class="insp-status-pills" role="radiogroup" aria-label="Estado del nodo">
          <button type="button" class="insp-st-pill st-pending ${curStatus === 'pending' ? 'is-on' : ''}" data-set-status="pending">pendiente</button>
          <button type="button" class="insp-st-pill st-progress ${curStatus === 'progress' ? 'is-on' : ''}" data-set-status="progress">en curso</button>
          <button type="button" class="insp-st-pill st-done ${curStatus === 'done' ? 'is-on' : ''}" data-set-status="done">hecho</button>
          <button type="button" class="insp-st-pill st-error ${curStatus === 'error' ? 'is-on' : ''}" data-set-status="error">error</button>
        </div>
        <select id="nodeStatus" hidden>
          <option value="pending" ${curStatus === 'pending' ? 'selected' : ''}>[ ] pendiente</option>
          <option value="progress" ${curStatus === 'progress' ? 'selected' : ''}>[~] en curso</option>
          <option value="done" ${curStatus === 'done' ? 'selected' : ''}>[✓] hecho</option>
          <option value="error" ${curStatus === 'error' ? 'selected' : ''}>[!] error</option>
        </select>

        <div class="insp-prog-head">
          <label style="margin:0">progreso</label>
          <span id="nodeProgPctLbl">${curProg}%</span>
        </div>
        <div class="insp-prog-row">
          <input type="range" id="nodeProgRange" min="0" max="100" step="5" value="${curProg}">
          <input type="number" id="nodeProg" min="0" max="100" value="${curProg}">
        </div>
        <div class="insp-chip-row">
          <button type="button" class="insp-chip" data-prog-preset="0">0%</button>
          <button type="button" class="insp-chip" data-prog-preset="25">25%</button>
          <button type="button" class="insp-chip" data-prog-preset="50">50%</button>
          <button type="button" class="insp-chip" data-prog-preset="75">75%</button>
          <button type="button" class="insp-chip" data-prog-preset="100">100%</button>
        </div>

        <label class="insp-check-row">
          <input type="checkbox" id="nodeCurr" ${n.current ? 'checked' : ''}>
          <span>marcar como paso actual en ejecución</span>
        </label>
      </div>

      ${paramsHtml}

      <div class="insp-section">
        <div class="insp-sec-head"><span>notas y documentación</span></div>
        <textarea id="nodeNotes" rows="2" placeholder="Detalles técnicos, criterios de éxito o comentarios...">${escapeHTML(n.params.notes || '')}</textarea>
      </div>

      ${connectionsSectionHtml}
    </div>
  `;

  document.getElementById('nodeActCenter')?.addEventListener('click', () => {
    if (typeof centerOnNode === 'function') centerOnNode(n.id);
  });
  document.getElementById('nodeActDup')?.addEventListener('click', () => {
    if (typeof duplicateNodeById === 'function') duplicateNodeById(n.id);
  });
  document.getElementById('nodeActLock')?.addEventListener('click', () => {
    n.locked = !n.locked;
    commitHistory();
    renderAll();
  });
  document.getElementById('nodeActAI')?.addEventListener('click', () => {
    if (typeof openAISidebarTab === 'function') openAISidebarTab(false);
  });
  document.getElementById('nodeActDel')?.addEventListener('click', () => {
    if (typeof deleteSel === 'function') deleteSel();
  });

  document.getElementById('nodeTxt')?.addEventListener('input', e => {
    n.text = e.target.value;
    if (n.params && n.params.title !== undefined) n.params.title = e.target.value;
    renderNodes();
    drawEdges();
    if (typeof updateNodeQuickBar === 'function') updateNodeQuickBar();
    drawMinimap();
    saveState();
  });
  document.getElementById('nodeTxt')?.addEventListener('change', () => {
    commitHistory();
  });

  document.getElementById('nodeTypeSwitcher')?.addEventListener('change', e => {
    n.type = e.target.value;
    commitHistory();
    renderAll();
  });

  const applyStatus = nextSt => {
    n.status = nextSt;
    if (nextSt === 'done') n.progress = 100;
    else if (nextSt === 'pending') n.progress = 0;
    else if (nextSt === 'progress' && (!n.progress || n.progress === 100)) n.progress = 50;
    commitHistory();
    renderAll();
  };

  p.querySelectorAll('[data-set-status]').forEach(btn => {
    btn.addEventListener('click', () => applyStatus(btn.dataset.setStatus));
  });

  document.getElementById('nodeStatus')?.addEventListener('change', e => {
    applyStatus(e.target.value);
  });

  const syncProgress = val => {
    const clean = clamp(Number(val) || 0, 0, 100);
    n.progress = clean;
    const rEl = document.getElementById('nodeProgRange');
    const nEl = document.getElementById('nodeProg');
    const lbl = document.getElementById('nodeProgPctLbl');
    if (rEl && rEl.value !== String(clean)) rEl.value = String(clean);
    if (nEl && nEl.value !== String(clean)) nEl.value = String(clean);
    if (lbl) lbl.textContent = `${clean}%`;
    renderNodes();
    saveState();
  };

  document.getElementById('nodeProgRange')?.addEventListener('input', e => syncProgress(e.target.value));
  document.getElementById('nodeProgRange')?.addEventListener('change', () => commitHistory());
  document.getElementById('nodeProg')?.addEventListener('input', e => syncProgress(e.target.value));
  document.getElementById('nodeProg')?.addEventListener('change', () => commitHistory());

  p.querySelectorAll('[data-prog-preset]').forEach(btn => {
    btn.addEventListener('click', () => {
      const val = Number(btn.dataset.progPreset) || 0;
      if (val === 100) n.status = 'done';
      else if (val > 0 && n.status === 'pending') n.status = 'progress';
      syncProgress(val);
      commitHistory();
      updatePanel();
      if (typeof updateNodeQuickBar === 'function') updateNodeQuickBar();
    });
  });

  document.getElementById('nodeCurr')?.addEventListener('change', e => {
    STATE.nodes.forEach(x => (x.current = false));
    if (e.target.checked) n.current = true;
    commitHistory();
    renderNodes();
    saveState();
  });

  p.querySelectorAll('.node-param-field').forEach(inp => {
    const handler = e => {
      const k = e.target.dataset.key;
      const val = e.target.type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value;
      n.params[k] = val;
      n[k] = val;
      renderNodes();
      drawEdges();
      saveState();
    };
    inp.addEventListener('input', handler);
    inp.addEventListener('change', () => commitHistory());
  });

  document.getElementById('nodeNotes')?.addEventListener('input', e => {
    n.params.notes = e.target.value;
    saveState();
  });

  document.getElementById('btnToggleCircuit')?.addEventListener('click', () => {
    toggleCircuit();
    updatePanel();
  });

  p.querySelectorAll('[data-jump-node]').forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.dataset.jumpNode;
      setSel({ kind: 'node', id: targetId });
      if (typeof centerOnNode === 'function') centerOnNode(targetId);
    });
  });

  p.querySelectorAll('[data-edge-lbl]').forEach(inp => {
    inp.addEventListener('change', e => {
      const ed = (STATE.edges || []).find(x => x.id === inp.dataset.edgeLbl);
      if (ed) {
        ed.label = e.target.value;
        commitHistory();
        drawEdges();
        saveState();
      }
    });
  });

  p.querySelectorAll('[data-del-edge]').forEach(btn => {
    btn.addEventListener('click', () => {
      const edId = btn.dataset.delEdge;
      STATE.edges = (STATE.edges || []).filter(x => x.id !== edId);
      commitHistory();
      renderAll();
    });
  });

  document.getElementById('inspQuickConnectSel')?.addEventListener('change', e => {
    const toId = e.target.value;
    if (!toId || typeof createEdge !== 'function') return;
    STATE.edges.push(createEdge(n.id, toId, '', 'normal'));
    commitHistory();
    renderAll();
  });
}

function renderStatsTab(container) {
  const total = STATE.nodes.length;
  const done = STATE.nodes.filter(n => n.status === 'done').length;
  const blocked = STATE.blocked ? STATE.blocked.size : 0;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;

  const byType = {};
  STATE.nodes.forEach(n => {
    byType[n.type] = (byType[n.type] || 0) + 1;
  });

  const typesHtml = Object.entries(byType)
    .map(
      ([t, count]) => `
    <div class="stat-type-row" data-type="${t}" style="display:flex;justify-content:space-between;padding:4px 6px;font-size:10px;border-bottom:1px solid var(--line);cursor:pointer;border-radius:4px;transition:.15s" title="Clic para resaltar nodos de este tipo">
      <span style="color:var(--tx1);font-weight:500">${CONFIG.NODE_TYPES[t] || t}</span>
      <span style="font-weight:600">${count}</span>
    </div>
  `
    )
    .join('');

  container.innerHTML = `
    <h3>estadísticas</h3>
    <div style="display:flex;flex-direction:column;gap:8px">
      <div style="padding:8px;background:var(--bg2);border-radius:4px;border:1px solid var(--line)">
        <div style="display:flex;justify-content:space-between;font-size:10px;margin-bottom:4px">
          <span>Progreso Global</span>
          <span style="font-weight:700">${pct}%</span>
        </div>
        <div style="height:6px;background:var(--bg1);border-radius:3px;overflow:hidden">
          <div style="height:100%;width:${pct}%;background:#4ade80"></div>
        </div>
      </div>

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px">
        <div style="padding:6px;background:var(--bg2);border-radius:4px;border:1px solid var(--line);text-align:center">
          <div style="font-size:14px;font-weight:700">${total}</div>
          <div style="font-size:9px;color:var(--tx2)">Nodos</div>
        </div>
        <div style="padding:6px;background:var(--bg2);border-radius:4px;border:1px solid var(--line);text-align:center">
          <div style="font-size:14px;font-weight:700">${STATE.edges.length}</div>
          <div style="font-size:9px;color:var(--tx2)">Conexiones</div>
        </div>
        <div style="padding:6px;background:var(--bg2);border-radius:4px;border:1px solid var(--line);text-align:center">
          <div style="font-size:14px;font-weight:700;color:#4ade80">${done}</div>
          <div style="font-size:9px;color:var(--tx2)">Hechos</div>
        </div>
        <div style="padding:6px;background:var(--bg2);border-radius:4px;border:1px solid var(--line);text-align:center">
          <div style="font-size:14px;font-weight:700;color:#ff6b6b">${blocked}</div>
          <div style="font-size:9px;color:var(--tx2)">Bloqueados</div>
        </div>
      </div>

      <div style="margin-top:4px">
        <div style="font-size:10px;font-weight:600;margin-bottom:4px">Desglose por Tipo (clic para resaltar)</div>
        ${typesHtml}
      </div>
    </div>
  `;

  container.querySelectorAll('.stat-type-row').forEach(row => {
    row.addEventListener('click', () => {
      const type = row.dataset.type;
      const searchBox = document.getElementById('searchBox');
      if (searchBox) searchBox.value = type;
      renderNodes();

      const firstNode = STATE.nodes.find(n => n.type === type);
      if (firstNode) {
        setSel({ kind: 'node', id: firstNode.id });
      }
      showToast(`Filtrando por tipo: ${CONFIG.NODE_TYPES[type] || type}`, 'info', 1500);
    });
  });
}
