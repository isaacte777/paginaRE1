// PANEL: Actualización del panel lateral de propiedades, estadísticas y chat IA
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

  // Pestaña Props
  const sparkSvg =
    '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9L12 3z"/></svg>';
  const slidersSvg =
    '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/><line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/><line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/><line x1="1" y1="14" x2="7" y2="14"/><line x1="9" y1="8" x2="15" y2="8"/><line x1="17" y1="16" x2="23" y2="16"/></svg>';

  if (!STATE.sel) {
    p.innerHTML =
      '<div class="props-empty-wrap">' +
      '<div style="color:var(--tx3);font-size:10px;padding:4px 2px 12px">selecciona un nodo o conexión para editar sus propiedades</div>' +
      '<div class="props-ai-promo">' +
      '<div class="props-ai-promo__kicker">' + sparkSvg + '<span>asistente del flujo</span></div>' +
      '<div class="props-ai-promo__title">Crea nodos hablando con IA</div>' +
      '<p class="props-ai-promo__desc">Lee el contexto del archivo actual y genera nodos o flujos. Conecta <b>Ollama / LM Studio</b> en tu PC, una <b>API Key</b> o cualquier <b>URL</b>.</p>' +
      '<div class="props-ai-promo__btns">' +
      '<button type="button" class="btn primary" id="btnPromoOpenAI">' + sparkSvg + '<span>abrir chat ia</span></button>' +
      '<button type="button" class="btn" id="btnPromoCfgAI">' + slidersSvg + '<span>conectar</span></button>' +
      '</div>' +
      '</div>' +
      '</div>';

    document.getElementById('btnPromoOpenAI')?.addEventListener('click', () => {
      if (typeof openAISidebarTab === 'function') openAISidebarTab(false);
    });
    document.getElementById('btnPromoCfgAI')?.addEventListener('click', () => {
      if (typeof openAISidebarTab === 'function') openAISidebarTab(true);
    });
    return;
  }

  if (STATE.sel.kind === 'edge') {
    const e = STATE.edges.find(x => x.id === STATE.sel.id);
    if (!e) return;
    const f = byId(e.from);
    const t = byId(e.to);
    p.innerHTML = '<h3>conexión</h3>' +
      '<label>de</label><div style="font-size:10px;color:var(--tx2);margin-bottom:6px">' + escapeHTML(f ? f.text : e.from) + '</div>' +
      '<label>a</label><div style="font-size:10px;color:var(--tx2);margin-bottom:6px">' + escapeHTML(t ? t.text : e.to) + '</div>' +
      '<label>etiqueta</label><input type="text" id="edgeLbl" value="' + escapeHTML(e.label || '') + '">';
    document.getElementById('edgeLbl').addEventListener('input', ev => {
      const eg = STATE.edges.find(x => x.id === STATE.sel.id);
      if (eg) eg.label = ev.target.value;
      saveState();
      drawEdges();
    });
    return;
  }

  const n = byId(STATE.sel.id);
  if (!n) return;

  if (!n.params) n.params = {};

  if (typeof isFinanceNodeType === 'function' && isFinanceNodeType(n.type) && typeof renderFinanceNodeInspector === 'function') {
    renderFinanceNodeInspector(p, n);
    return;
  }

  // Información de circuito si existe
  let circuitInfoHtml = '';
  if (typeof computeCircuit === 'function') {
    const c = computeCircuit(n.id);
    const circuitSvg =
      '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>';
    circuitInfoHtml = `
      <div style="margin-top:12px;padding:8px;background:var(--bg2);border-radius:4px;border:1px solid var(--line)">
        <div style="font-size:10px;font-weight:600;color:var(--tx0);margin-bottom:4px">circuito de dependencias</div>
        <div style="font-size:9.5px;color:var(--tx2)">upstream (causas): ${c.upstream.size}</div>
        <div style="font-size:9.5px;color:var(--tx2)">downstream (efectos): ${c.downstream.size}</div>
        <button id="btnToggleCircuit" class="btn" style="width:100%;margin-top:6px;font-size:10px">${circuitSvg}<span>${STATE.circuitHighlight ? 'apagar circuito' : 'resaltar circuito'}</span></button>
      </div>
    `;
  }

  // Parámetros específicos por tipo si están definidos
  let paramsHtml = '';
  const typeParams = (CONFIG.NODE_PARAMS && CONFIG.NODE_PARAMS[n.type]) || [];
  if (typeParams.length > 0) {
    paramsHtml = '<div style="margin-top:10px;border-top:1px solid var(--line);padding-top:8px"><div style="font-size:10px;font-weight:600;margin-bottom:6px">parámetros ' + n.type + '</div>';
    typeParams.forEach(param => {
      const val = n.params[param.key] !== undefined ? n.params[param.key] : (n[param.key] !== undefined ? n[param.key] : param.default);
      if (param.type === 'select') {
        paramsHtml += '<label>' + param.label + '</label><select class="node-param-field" data-key="' + param.key + '">';
        param.options.forEach(opt => {
          paramsHtml += '<option value="' + opt + '" ' + (val === opt ? 'selected' : '') + '>' + opt + '</option>';
        });
        paramsHtml += '</select>';
      } else if (param.type === 'number') {
        paramsHtml += '<label>' + param.label + '</label><input type="number" class="node-param-field" data-key="' + param.key + '" value="' + val + '" ' + (param.min !== undefined ? 'min="' + param.min + '"' : '') + ' ' + (param.max !== undefined ? 'max="' + param.max + '"' : '') + '>';
      } else {
        paramsHtml += '<label>' + param.label + '</label><input type="text" class="node-param-field" data-key="' + param.key + '" value="' + escapeHTML(val || '') + '">';
      }
    });
    paramsHtml += '</div>';
  }

  let isBlocked = STATE.blocked && STATE.blocked.has(n.id);

  let html = '<h3>nodo</h3>' +
    '<label>tipo</label><div style="font-size:10px;color:var(--tx2);display:flex;align-items:center;gap:6px">' + (CONFIG.NODE_TYPES[n.type] || n.type) + ' ' + (isBlocked ? '<span style="color:#ff6b6b;font-weight:700">[bloqueado]</span>' : '') + '</div>' +
    '<label>texto</label><textarea id="nodeTxt">' + escapeHTML(n.text || '') + '</textarea>' +
    '<label>estado</label><select id="nodeStatus">' +
    '<option value="pending">[ ] pendiente</option>' +
    '<option value="progress">[~] en curso</option>' +
    '<option value="done">[✓] hecho</option>' +
    '<option value="error">[!] error</option>' +
    '</select>' +
    '<label>progreso</label><input type="number" id="nodeProg" min="0" max="100" value="' + (n.progress || 0) + '">' +
    '<div style="margin-top:10px"><label><input type="checkbox" id="nodeCurr" ' + (n.current ? 'checked' : '') + '> posición actual</label></div>' +
    paramsHtml +
    circuitInfoHtml;

  p.innerHTML = html;

  document.getElementById('nodeTxt').addEventListener('input', e => {
    n.text = e.target.value;
    commitHistory();
    renderNodes();
    drawMinimap();
    saveState();
    if (typeof renderInspector === 'function') renderInspector();
  });

  document.getElementById('nodeStatus').value = n.status || 'pending';
  document.getElementById('nodeStatus').addEventListener('change', e => {
    n.status = e.target.value;
    commitHistory();
    renderAll();
    if (typeof renderInspector === 'function') renderInspector();
  });

  document.getElementById('nodeProg').addEventListener('input', e => {
    n.progress = +e.target.value;
    renderNodes();
    saveState();
    if (typeof renderInspector === 'function') renderInspector();
  });

  document.getElementById('nodeCurr').addEventListener('change', e => {
    STATE.nodes.forEach(x => x.current = false);
    if (e.target.checked) n.current = true;
    renderNodes();
    saveState();
  });

  document.querySelectorAll('.node-param-field').forEach(inp => {
    inp.addEventListener('change', e => {
      const k = e.target.dataset.key;
      n.params[k] = e.target.value;
      n[k] = e.target.value;
      saveState();
      if (typeof renderInspector === 'function') renderInspector();
    });
  });

  const btnToggleCircuit = document.getElementById('btnToggleCircuit');
  if (btnToggleCircuit) {
    btnToggleCircuit.addEventListener('click', () => {
      toggleCircuit();
      updatePanel();
    });
  }
}

function renderStatsTab(container) {
  const total = STATE.nodes.length;
  const done = STATE.nodes.filter(n => n.status === 'done').length;
  const progress = STATE.nodes.filter(n => n.status === 'progress').length;
  const pending = STATE.nodes.filter(n => n.status === 'pending').length;
  const blocked = STATE.blocked ? STATE.blocked.size : 0;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;

  // Conteo por tipo
  const byType = {};
  STATE.nodes.forEach(n => {
    byType[n.type] = (byType[n.type] || 0) + 1;
  });

  let typesHtml = Object.entries(byType).map(([t, count]) => `
    <div class="stat-type-row" data-type="${t}" style="display:flex;justify-content:space-between;padding:4px 6px;font-size:10px;border-bottom:1px solid var(--line);cursor:pointer;border-radius:4px;transition:.15s" title="Clic para resaltar nodos de este tipo">
      <span style="color:var(--tx1);font-weight:500">${CONFIG.NODE_TYPES[t] || t}</span>
      <span style="font-weight:600">${count}</span>
    </div>
  `).join('');

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
