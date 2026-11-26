// STORAGE: Persistencia de datos en localStorage
function sanitizeDeprecatedChartNodes(nodesArr, edgesArr) {
  const removedIds = new Set();
  const cleanNodes = (Array.isArray(nodesArr) ? nodesArr : []).filter(n => {
    if (!n || n.type === 'metrics' || n.type === 'chart_line') {
      if (n && n.id) removedIds.add(n.id);
      return false;
    }
    return true;
  });
  const cleanEdges = (Array.isArray(edgesArr) ? edgesArr : []).filter(
    e => e && !removedIds.has(e.from) && !removedIds.has(e.to)
  );
  return { nodes: cleanNodes, edges: cleanEdges };
}

function storagePayload() {
  return {
    version: 1,
    nodes: STATE.nodes,
    edges: STATE.edges,
    pan: STATE.pan,
    zoom: STATE.zoom,
    snapOn: STATE.snapOn !== false,
    speed: Number(STATE.speed) || 1,
    canvasDomain: STATE.canvasDomain || 'workflow',
    financeCurrency: STATE.financeCurrency || 'USD',
    title: document.getElementById('projTitle')?.value || '',
    isBlankCanvas: STATE.isBlankCanvas === true,
    activeProjectId: STATE.activeProjectId || null
  };
}

function storageFingerprint(data) {
  return JSON.stringify({
    nodes: data.nodes,
    edges: data.edges,
    pan: data.pan,
    zoom: data.zoom,
    snapOn: data.snapOn !== false,
    speed: Number(data.speed) || 1,
    canvasDomain: data.canvasDomain || 'workflow',
    financeCurrency: data.financeCurrency || 'USD',
    title: data.title,
    isBlankCanvas: data.isBlankCanvas === true
  });
}

function activeCanvasStorageKey() {
  return typeof getUserStorageKey === 'function'
    ? getUserStorageKey('canvas')
    : CONFIG.KEY;
}

function saveState() {
  try {
    const data = storagePayload();
    const fingerprint = storageFingerprint(data);
    if (fingerprint !== STATE.persistenceFingerprint || !STATE.localSavedAt) {
      STATE.persistenceFingerprint = fingerprint;
      STATE.localSavedAt = Date.now();
    }
    data.savedAt = STATE.localSavedAt;
    data.fingerprint = STATE.persistenceFingerprint;

    localStorage.setItem(activeCanvasStorageKey(), JSON.stringify(data));
    const stSave = document.getElementById('stSave');
    if (stSave) stSave.textContent = 'auto-guardado';
    if (typeof queueLiveSync === 'function') queueLiveSync();
  } catch (e) {
    log('warn', 'no se pudo guardar');
  }
}

function loadState() {
  let restoredProject = false;
  try {
    const saved = localStorage.getItem(activeCanvasStorageKey());
    if (saved) {
      const data = JSON.parse(saved);
      if (Array.isArray(data.nodes) && Array.isArray(data.edges)) {
        const cleaned = sanitizeDeprecatedChartNodes(data.nodes, data.edges);
        STATE.nodes = cleaned.nodes;
        STATE.edges = cleaned.edges;
        STATE.pan = data.pan || { x: 60, y: 80 };
        STATE.zoom = data.zoom || 1;
        STATE.snapOn = data.snapOn !== false;
        STATE.speed = Number(data.speed) || 1;
        STATE.canvasDomain = data.canvasDomain === 'finance' ? 'finance' : 'workflow';
        STATE.financeCurrency = typeof data.financeCurrency === 'string' ? data.financeCurrency : 'USD';
        STATE.isBlankCanvas = data.isBlankCanvas === true;
        STATE.activeProjectId = typeof data.activeProjectId === 'string' ? data.activeProjectId : null;
        STATE.localSavedAt = Number(data.savedAt) || 0;
        STATE.persistenceFingerprint = data.fingerprint || storageFingerprint(data);
        if (typeof data.title === 'string') {
          const tEl = document.getElementById('projTitle');
          const tMobEl = document.getElementById('projTitleMobile');
          if (tEl) tEl.value = data.title;
          if (tMobEl) tMobEl.value = data.title;
        }
        restoredProject = true;
      }
    }
  } catch (e) {
    log('warn', 'error al cargar estado');
  }

  // Sin proyecto anterior, abrir la plantilla de ejemplo una única vez.
  // Un lienzo vacío guardado sigue siendo un proyecto válido.
  if (!restoredProject && STATE.nodes.length === 0 && !STATE.isBlankCanvas) {
    const template = getTemplate('orquestador');
    STATE.nodes = template.nodes;
    STATE.edges = template.edges;
  }

  return restoredProject;
}

function exportJSON() {
  const titleVal = (document.getElementById('projTitle')?.value || '').trim() || 'proyecto';
  const safeSlug = titleVal
    .toLowerCase()
    .replace(/[^a-z0-9áéíóúñ_-]+/gi, '_')
    .replace(/^_+|_+$/g, '') || 'proyecto';
  const data = {
    nodes: STATE.nodes,
    edges: STATE.edges,
    canvasDomain: STATE.canvasDomain || 'workflow',
    financeCurrency: STATE.financeCurrency || 'USD',
    title: titleVal,
    exported: new Date().toISOString()
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `flowlab-${safeSlug}.json`;
  a.click();
  URL.revokeObjectURL(url);
  log('ok', 'JSON exportado');
}

function importProjectFile(file) {
  const reader = new FileReader();
  reader.onload = (ev) => {
    const text = ev.target.result;
    if (file.name.endsWith('.json') || text.trim().startsWith('{')) {
      try {
        const data = JSON.parse(text);
        const cleaned = sanitizeDeprecatedChartNodes(data.nodes || [], data.edges || []);
        STATE.nodes = cleaned.nodes;
        STATE.edges = cleaned.edges;
        STATE.canvasDomain =
          data.canvasDomain === 'finance' ||
          (typeof isFinanceNodeType === 'function' && STATE.nodes.some(n => isFinanceNodeType(n.type)))
            ? 'finance'
            : 'workflow';
        if (typeof data.financeCurrency === 'string') {
          STATE.financeCurrency = data.financeCurrency;
        }
        if (typeof setWorkspaceDomain === 'function') {
          setWorkspaceDomain(STATE.canvasDomain, { silent: true });
        }
        STATE.isBlankCanvas = STATE.nodes.length === 0;
        STATE.activeProjectId = null;
        if (data.title) {
          const pTitle = document.getElementById('projTitle');
          const pTitleMob = document.getElementById('projTitleMobile');
          if (pTitle) pTitle.value = data.title;
          if (pTitleMob) pTitleMob.value = data.title;
        }
        STATE.history = [];
        STATE.hPtr = -1;
        commitHistory();
        renderAll();
        requestAnimationFrame(() => fitView());
        if (typeof refreshProjectsUI === 'function') refreshProjectsUI();
        showToast('Proyecto JSON importado con éxito', 'ok');
        log('ok', 'Archivo JSON importado correctamente');
      } catch (e) {
        showToast('Error al parsear archivo JSON', 'err');
        log('err', 'Error JSON: ' + e.message);
      }
    } else {
      try {
        parseMermaidImport(text);
        showToast('Diagrama Mermaid importado con éxito', 'ok');
        log('ok', 'Archivo Markdown/Mermaid importado correctamente');
      } catch (e) {
        showToast('Error al importar formato Mermaid', 'err');
        log('err', 'Error Mermaid: ' + e.message);
      }
    }
  };
  reader.readAsText(file);
}

function parseMermaidImport(text) {
  STATE.nodes = [];
  STATE.edges = [];
  const lines = text.split('\n');
  const nodeMap = new Map();
  let startX = 100, startY = 100, spacingX = 220, spacingY = 140, col = 0, row = 0;

  lines.forEach(line => {
    const trimmed = line.trim();
    const edgeMatch = trimmed.match(/^([a-zA-Z0-9_-]+)\s*(?:\[.*?\])?\s*-->\s*(?:\|([^|]+)\|\s*)?([a-zA-Z0-9_-]+)/);
    if (edgeMatch) {
      const fromId = edgeMatch[1];
      const label = edgeMatch[2] ? edgeMatch[2].trim() : '';
      const toId = edgeMatch[3];

      if (!nodeMap.has(fromId)) {
        const n = createNode('process', fromId, startX + (col * spacingX), startY + (row * spacingY));
        n.id = fromId;
        nodeMap.set(fromId, n);
        STATE.nodes.push(n);
        col++;
        if (col > 3) { col = 0; row++; }
      }
      if (!nodeMap.has(toId)) {
        const n = createNode('process', toId, startX + (col * spacingX), startY + (row * spacingY));
        n.id = toId;
        nodeMap.set(toId, n);
        STATE.nodes.push(n);
        col++;
        if (col > 3) { col = 0; row++; }
      }

      STATE.edges.push(createEdge(fromId, toId, label, 'normal'));
    }
  });

  if (STATE.nodes.length === 0) {
    const nMatch = text.matchAll(/([a-zA-Z0-9_-]+)\["([^"]+)"\]/g);
    for (const m of nMatch) {
      const id = m[1];
      const txt = m[2];
      if (!nodeMap.has(id)) {
        const n = createNode('process', txt, startX + (col * spacingX), startY + (row * spacingY));
        n.id = id;
        nodeMap.set(id, n);
        STATE.nodes.push(n);
        col++;
        if (col > 3) { col = 0; row++; }
      }
    }
  }

  STATE.history = [];
  STATE.hPtr = -1;
  STATE.isBlankCanvas = STATE.nodes.length === 0;
  commitHistory();
  renderAll();
}
