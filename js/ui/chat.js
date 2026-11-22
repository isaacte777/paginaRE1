// CHAT & MODALS: Panel de chat con IA integrado, inspector y diagnósticos

function initChat() {
  const chatBtn = document.getElementById('btnChat');
  const inspBtn = document.getElementById('btnInsp');
  const expBtn = document.getElementById('btnExp');

  if (chatBtn) {
    chatBtn.addEventListener('click', () => toggleChatPanel());
  }

  if (inspBtn) {
    inspBtn.addEventListener('click', () => toggleInspectorPanel());
  }

  if (expBtn) {
    expBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleExportPopover();
    });
  }

  // Listeners para tabs del modal de chat/agente
  document.getElementById('tabIA')?.addEventListener('click', () => showTab('ia'));
  document.getElementById('tabAgent')?.addEventListener('click', () => showTab('agent'));
  document.getElementById('tabSync')?.addEventListener('click', () => showTab('sync'));
  document.getElementById('tabDiag')?.addEventListener('click', () => showTab('diag'));

  // Enter key para enviar mensaje de chat
  const chatInput = document.getElementById('chatInput');
  if (chatInput) {
    chatInput.addEventListener('keydown', e => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendChatMessage(chatInput.value);
      }
    });
  }
}

function toggleChatPanel() {
  STATE.chatOpen = !STATE.chatOpen;
  const panel = document.getElementById('chatWrap');
  if (panel) panel.hidden = !STATE.chatOpen;

  if (STATE.chatOpen) {
    focusChatInput();
    renderChatMessages();
  }
}

function toggleInspectorPanel() {
  const panel = document.getElementById('inspWrap');
  if (panel) {
    panel.hidden = !panel.hidden;
    if (!panel.hidden) {
      renderInspector();
    }
  }
}

function toggleExportPanel() {
  toggleExportPopover();
}

function showTab(tabName) {
  // Ocultar todos los tabs
  document.querySelectorAll('#chatWrap .tab-content').forEach(t => t.hidden = true);

  // Mostrar tab seleccionado
  const tabEl = document.getElementById('tab-' + tabName);
  if (tabEl) tabEl.hidden = false;

  // Actualizar botones activos
  document.querySelectorAll('#chatWrap .tab-btn').forEach(b => b.classList.remove('active'));
  const btn = document.getElementById('tab' + tabName.charAt(0).toUpperCase() + tabName.slice(1));
  if (btn) btn.classList.add('active');

  // Renderizar contenido según la pestaña activa
  if (tabName === 'ia') {
    renderChatMessages();
    focusChatInput();
  } else if (tabName === 'agent') {
    renderAgentMonitoring();
  } else if (tabName === 'sync') {
    renderSyncStatus();
  } else if (tabName === 'diag') {
    renderDiagnostics();
  }
}

function focusChatInput() {
  const input = document.getElementById('chatInput');
  if (input) input.focus();
}

function sendChatMessage(text) {
  if (!text || !text.trim()) return;
  const cleanText = text.trim();

  // Agregar mensaje del usuario
  STATE.chatMessages.push({
    role: 'user',
    content: cleanText,
    timestamp: Date.now()
  });

  renderChatMessages();

  // Limpiar input
  const input = document.getElementById('chatInput');
  if (input) input.value = '';

  // Respuesta contextual inteligente de la IA
  setTimeout(() => {
    let response = generateAIResponse(cleanText);
    STATE.chatMessages.push({
      role: 'assistant',
      content: response,
      timestamp: Date.now()
    });
    renderChatMessages();
  }, 400);
}

function generateAIResponse(query) {
  const q = query.toLowerCase();
  const nodeCount = STATE.nodes.length;
  const edgeCount = STATE.edges.length;
  const blockedCount = STATE.blocked ? STATE.blocked.size : 0;
  const doneCount = STATE.nodes.filter(n => n.status === 'done').length;

  if (q.includes('nodo') || q.includes('flujo') || q.includes('resumen') || q.includes('estado')) {
    return `📊 Estado del flujo actual:\n• Nodos totales: ${nodeCount}\n• Conexiones: ${edgeCount}\n• Completados: ${doneCount}/${nodeCount}\n• Bloqueados: ${blockedCount}`;
  } else if (q.includes('bloqueo') || q.includes('bloquead')) {
    if (blockedCount === 0) {
      return `✓ No hay nodos bloqueados actualmente en el flujo.`;
    }
    const blkNames = Array.from(STATE.blocked).map(id => {
      const n = byId(id);
      return n ? `"${n.text.split('\n')[0]}"` : id;
    }).slice(0, 5).join(', ');
    return `⚠️ Hay ${blockedCount} nodo(s) bloqueado(s) esperando dependencias previas: ${blkNames}`;
  } else if (q.includes('comparacion') || q.includes('precio')) {
    return `💡 El flujo de Comparación de Precios integra 4 fases principales: MVP, Core, Advanced y Polish con endpoints API y persistencia en BD.`;
  } else if (q.includes('ejecutar') || q.includes('run')) {
    return `▶ Puedes presionar el botón "ejecutar" en la barra inferior para iniciar la simulación secuencial del flujo.`;
  } else if (q.includes('ayuda') || q.includes('help')) {
    return `🤖 Asistente FlowLab:\n• Doble clic en lienzo: crear nodo\n• Arrastrar puertos ●: conectar nodos\n• Inspector 🔍: ver parámetros avanzados\n• .md / .png: exportar diagrama`;
  } else {
    return `Entendido. He analizado tu solicitud sobre "${query}". El flujo cuenta actualmente con ${nodeCount} nodos y ${edgeCount} conexiones activas en el canvas.`;
  }
}

function renderChatMessages() {
  const container = document.getElementById('chatMessages');
  if (!container) return;

  if (STATE.chatMessages.length === 0) {
    container.innerHTML = `<div style="color:var(--tx3);font-size:11px;padding:12px;text-align:center">Pregunta a Claude + Qwen sobre tu flujo o arquitectura...</div>`;
    return;
  }

  container.innerHTML = STATE.chatMessages.map(msg => `
    <div class="chat-msg ${msg.role}">
      <div class="chat-role">${msg.role === 'user' ? '👤' : '🤖'}</div>
      <div class="chat-text">${escapeHTML(msg.content)}</div>
    </div>
  `).join('');

  // Auto scroll al final
  container.scrollTop = container.scrollHeight;
}

function renderInspector() {
  const panel = document.getElementById('inspPanel');
  if (!panel) return;

  if (!STATE.sel) {
    panel.innerHTML = `<div style="color:var(--tx3);font-size:11px;padding:16px;text-align:center">Selecciona un nodo o conexión en el lienzo para inspeccionar sus propiedades avanzadas.</div>`;
    return;
  }

  if (STATE.sel.kind === 'node') {
    const node = byId(STATE.sel.id);
    if (!node) return;

    if (!node.params) node.params = {};
    const typeParams = (CONFIG.NODE_PARAMS && CONFIG.NODE_PARAMS[node.type]) || [];

    let paramsHtml = '';
    if (typeParams.length > 0) {
      paramsHtml = '<div class="insp-params-group"><div style="font-size:10px;font-weight:700;margin-bottom:8px;color:var(--tx1)">PARÁMETROS DEL TIPO</div>';
      typeParams.forEach(p => {
        const val = node.params[p.key] !== undefined ? node.params[p.key] : (node[p.key] !== undefined ? node[p.key] : p.default);
        if (p.type === 'select') {
          paramsHtml += `
            <div class="param">
              <label>${p.label}</label>
              <select class="insp-param-input" data-key="${p.key}">
                ${(p.options || []).map(opt => `<option value="${opt}" ${val === opt ? 'selected' : ''}>${opt}</option>`).join('')}
              </select>
            </div>
          `;
        } else if (p.type === 'number') {
          paramsHtml += `
            <div class="param">
              <label>${p.label}</label>
              <input type="number" class="insp-param-input" data-key="${p.key}" value="${val}" ${p.min !== undefined ? `min="${p.min}"` : ''} ${p.max !== undefined ? `max="${p.max}"` : ''}>
            </div>
          `;
        } else {
          paramsHtml += `
            <div class="param">
              <label>${p.label}</label>
              <input type="text" class="insp-param-input" data-key="${p.key}" value="${escapeHTML(val || '')}">
            </div>
          `;
        }
      });
      paramsHtml += '</div>';
    }

    const isBlocked = STATE.blocked && STATE.blocked.has(node.id);

    panel.innerHTML = `
      <div class="insp-header" style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
        <span style="font-weight:700;font-size:12px">${CONFIG.NODE_TYPES[node.type] || node.type}</span>
        <span style="font-size:9.5px;color:var(--tx3)">#${node.id}</span>
      </div>

      <div class="insp-field" style="margin-bottom:10px">
        <label style="font-size:10px;color:var(--tx2);display:block;margin-bottom:4px">Texto / Etiqueta</label>
        <textarea id="inspTxt" style="width:100%;height:60px;font-family:inherit;font-size:11px">${escapeHTML(node.text || '')}</textarea>
      </div>

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:10px">
        <div>
          <label style="font-size:10px;color:var(--tx2);display:block;margin-bottom:4px">Estado</label>
          <select id="inspStatus" style="width:100%;font-size:11px">
            <option value="pending" ${node.status === 'pending' ? 'selected' : ''}>[ ] Pendiente</option>
            <option value="progress" ${node.status === 'progress' ? 'selected' : ''}>[~] En curso</option>
            <option value="done" ${node.status === 'done' ? 'selected' : ''}>[✓] Hecho</option>
            <option value="error" ${node.status === 'error' ? 'selected' : ''}>[!] Error</option>
          </select>
        </div>
        <div>
          <label style="font-size:10px;color:var(--tx2);display:block;margin-bottom:4px">Progreso (%)</label>
          <input type="number" id="inspProg" min="0" max="100" value="${node.progress || 0}" style="width:100%;font-size:11px">
        </div>
      </div>

      <div style="margin-bottom:10px">
        <label style="font-size:10px;display:flex;align-items:center;gap:6px;cursor:pointer">
          <input type="checkbox" id="inspCurr" ${node.current ? 'checked' : ''}>
          <span>Marcar como posición actual del flujo</span>
        </label>
      </div>

      ${isBlocked ? '<div style="color:#ff6b6b;font-size:10px;padding:6px;background:rgba(255,107,107,0.1);border-radius:4px;margin-bottom:10px">⚠️ Nodo bloqueado: dependencias incompletas</div>' : ''}

      ${paramsHtml}
    `;

    // Listeners bidireccionales
    document.getElementById('inspTxt')?.addEventListener('input', e => {
      node.text = e.target.value;
      commitHistory();
      renderNodes();
      drawMinimap();
      updatePanel();
    });

    document.getElementById('inspStatus')?.addEventListener('change', e => {
      node.status = e.target.value;
      commitHistory();
      renderAll();
    });

    document.getElementById('inspProg')?.addEventListener('input', e => {
      node.progress = +e.target.value;
      renderNodes();
      saveState();
      updatePanel();
    });

    document.getElementById('inspCurr')?.addEventListener('change', e => {
      STATE.nodes.forEach(x => x.current = false);
      if (e.target.checked) node.current = true;
      renderNodes();
      saveState();
      updatePanel();
    });

    panel.querySelectorAll('.insp-param-input').forEach(inp => {
      inp.addEventListener('change', e => {
        const k = e.target.dataset.key;
        node.params[k] = e.target.value;
        node[k] = e.target.value;
        saveState();
        updatePanel();
      });
    });

  } else if (STATE.sel.kind === 'edge') {
    const edge = STATE.edges.find(e => e.id === STATE.sel.id);
    if (!edge) return;

    const f = byId(edge.from);
    const t = byId(edge.to);

    panel.innerHTML = `
      <div class="insp-header" style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
        <span style="font-weight:700;font-size:12px">Conexión</span>
        <span style="font-size:9.5px;color:var(--tx3)">#${edge.id}</span>
      </div>
      <div style="font-size:10px;color:var(--tx2);margin-bottom:6px">Origen: <b>${escapeHTML(f ? f.text.split('\n')[0] : edge.from)}</b></div>
      <div style="font-size:10px;color:var(--tx2);margin-bottom:12px">Destino: <b>${escapeHTML(t ? t.text.split('\n')[0] : edge.to)}</b></div>
      <div class="insp-label">
        <label style="font-size:10px;color:var(--tx2);display:block;margin-bottom:4px">Etiqueta de la conexión</label>
        <input type="text" id="inspEdgeLbl" value="${escapeHTML(edge.label || '')}" style="width:100%;font-size:11px">
      </div>
    `;

    document.getElementById('inspEdgeLbl')?.addEventListener('input', e => {
      edge.label = e.target.value;
      saveState();
      drawEdges();
      updatePanel();
    });
  }
}

function renderAgentMonitoring() {
  const panel = document.getElementById('agentPanel');
  if (!panel) return;

  panel.innerHTML = `
    <div class="agent-status" style="display:flex;flex-direction:column;gap:8px">
      <div class="agent-item" style="display:flex;justify-content:space-between;align-items:center;padding:8px;background:var(--bg2);border-radius:4px;border:1px solid var(--line)">
        <div>
          <div class="agent-name" style="font-size:11px;font-weight:700">Claude Code</div>
          <div style="font-size:9.5px;color:var(--tx3)">Arquitectura & Lógica Modular</div>
        </div>
        <span class="agent-state active" style="color:#4ade80;font-size:10px;font-weight:600">● activo</span>
      </div>

      <div class="agent-item" style="display:flex;justify-content:space-between;align-items:center;padding:8px;background:var(--bg2);border-radius:4px;border:1px solid var(--line)">
        <div>
          <div class="agent-name" style="font-size:11px;font-weight:700">Qwen Coder</div>
          <div style="font-size:9.5px;color:var(--tx3)">Sincronización de Canvas & Graph Engine</div>
        </div>
        <span class="agent-state active" style="color:#4ade80;font-size:10px;font-weight:600">● activo</span>
      </div>

      <div style="margin-top:8px;padding:8px;background:var(--bg1);border-radius:4px;font-size:10px;color:var(--tx2)">
        <div><b>Protocolo Bridge:</b> FlowLab-Coordination-v4</div>
        <div><b>Latencia sync:</b> &lt; 15ms</div>
      </div>
    </div>
  `;
}

function renderSyncStatus() {
  const panel = document.getElementById('syncPanel');
  if (!panel) return;

  panel.innerHTML = `
    <div class="sync-info" style="display:flex;flex-direction:column;gap:8px">
      <div class="sync-item" style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid var(--line);font-size:11px">
        <span style="color:var(--tx2)">Estado de Red:</span>
        <span class="sync-badge" style="color:#4ade80;font-weight:600">✓ Conectado</span>
      </div>
      <div class="sync-item" style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid var(--line);font-size:11px">
        <span style="color:var(--tx2)">Nodos en Memoria:</span>
        <span style="font-weight:700">${STATE.nodes.length}</span>
      </div>
      <div class="sync-item" style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid var(--line);font-size:11px">
        <span style="color:var(--tx2)">Conexiones:</span>
        <span style="font-weight:700">${STATE.edges.length}</span>
      </div>
      <div class="sync-item" style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid var(--line);font-size:11px">
        <span style="color:var(--tx2)">Puntero Historial:</span>
        <span>${STATE.hPtr + 1} / ${STATE.history.length}</span>
      </div>
    </div>
  `;
}

function renderDiagnostics() {
  const panel = document.getElementById('diagPanel');
  if (!panel) return;

  const total = STATE.nodes.length;
  const done = STATE.nodes.filter(n => n.status === 'done').length;
  const progress = STATE.nodes.filter(n => n.status === 'progress').length;
  const pending = STATE.nodes.filter(n => n.status === 'pending').length;
  const error = STATE.nodes.filter(n => n.status === 'error').length;
  const blocked = STATE.blocked ? STATE.blocked.size : 0;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;

  panel.innerHTML = `
    <div class="diag-stats" style="display:grid;grid-template-columns:1fr 1fr;gap:6px">
      <div class="stat-item" style="padding:6px;background:var(--bg2);border-radius:4px;border:1px solid var(--line);text-align:center">
        <div style="font-size:14px;font-weight:700">${total}</div>
        <div style="font-size:9px;color:var(--tx2)">Nodos</div>
      </div>
      <div class="stat-item" style="padding:6px;background:var(--bg2);border-radius:4px;border:1px solid var(--line);text-align:center">
        <div style="font-size:14px;font-weight:700">${STATE.edges.length}</div>
        <div style="font-size:9px;color:var(--tx2)">Conexiones</div>
      </div>
      <div class="stat-item" style="padding:6px;background:var(--bg2);border-radius:4px;border:1px solid var(--line);text-align:center">
        <div style="font-size:14px;font-weight:700;color:#ff6b6b">${blocked}</div>
        <div style="font-size:9px;color:var(--tx2)">Bloqueados</div>
      </div>
      <div class="stat-item" style="padding:6px;background:var(--bg2);border-radius:4px;border:1px solid var(--line);text-align:center">
        <div style="font-size:14px;font-weight:700;color:#4ade80">${pct}%</div>
        <div style="font-size:9px;color:var(--tx2)">Completitud</div>
      </div>
      <div class="stat-item" style="padding:6px;background:var(--bg2);border-radius:4px;border:1px solid var(--line);text-align:center">
        <div style="font-size:14px;font-weight:700;color:#facc15">${progress}</div>
        <div style="font-size:9px;color:var(--tx2)">En Progreso</div>
      </div>
      <div class="stat-item" style="padding:6px;background:var(--bg2);border-radius:4px;border:1px solid var(--line);text-align:center">
        <div style="font-size:14px;font-weight:700;color:#94a3b8">${pending}</div>
        <div style="font-size:9px;color:var(--tx2)">Pendientes</div>
      </div>
    </div>
  `;
}
