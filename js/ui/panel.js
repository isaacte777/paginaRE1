// PANEL: Actualización del panel lateral de propiedades y estadísticas
let currentPanelTab = 'props';

function initPanelTabs() {
  const tabProps = document.getElementById('tabProps');
  const tabStats = document.getElementById('tabStats');
  if (tabProps && tabStats) {
    tabProps.addEventListener('click', () => {
      currentPanelTab = 'props';
      tabProps.classList.add('on');
      tabStats.classList.remove('on');
      updatePanel();
    });
    tabStats.addEventListener('click', () => {
      currentPanelTab = 'stats';
      tabStats.classList.add('on');
      tabProps.classList.remove('on');
      updatePanel();
    });
  }
}

function updatePanel() {
  const p = DOM.panel;
  if (!p) return;
  p.innerHTML = '';

  if (currentPanelTab === 'stats') {
    renderStatsTab(p);
    return;
  }

  // Pestaña Props
  if (!STATE.sel) {
    p.innerHTML = '<div style="color:var(--tx3);font-size:9.5px;padding:8px">selecciona un nodo o conexión</div>';
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

  // Información de circuito si existe
  let circuitInfoHtml = '';
  if (typeof computeCircuit === 'function') {
    const c = computeCircuit(n.id);
    circuitInfoHtml = `
      <div style="margin-top:12px;padding:8px;background:var(--bg2);border-radius:4px;border:1px solid var(--line)">
        <div style="font-size:10px;font-weight:600;color:var(--tx0);margin-bottom:4px">circuito de dependencias</div>
        <div style="font-size:9.5px;color:var(--tx2)">upstream (causas): ${c.upstream.size}</div>
        <div style="font-size:9.5px;color:var(--tx2)">downstream (efectos): ${c.downstream.size}</div>
        <button id="btnToggleCircuit" class="btn" style="width:100%;margin-top:6px;font-size:10px">${STATE.circuitHighlight ? '⚡ apagar circuito' : '⚡ resaltar circuito'}</button>
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
    <div style="display:flex;justify-content:space-between;padding:3px 0;font-size:10px;border-bottom:1px solid var(--line)">
      <span style="color:var(--tx2)">${CONFIG.NODE_TYPES[t] || t}</span>
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
        <div style="font-size:10px;font-weight:600;margin-bottom:4px">Desglose por Tipo</div>
        ${typesHtml}
      </div>
    </div>
  `;
}
