// STORAGE: Persistencia de datos en localStorage
function saveState() {
  try {
    const data = {
      nodes: STATE.nodes,
      edges: STATE.edges,
      pan: STATE.pan,
      zoom: STATE.zoom,
      title: document.getElementById('projTitle').value
    };
    localStorage.setItem(CONFIG.KEY, JSON.stringify(data));
    document.getElementById('stSave').textContent = 'auto-guardado';
  } catch (e) {
    log('warn', 'no se pudo guardar');
  }
}

function loadState() {
  try {
    const saved = localStorage.getItem(CONFIG.KEY);
    if (saved) {
      const data = JSON.parse(saved);
      STATE.nodes = data.nodes || [];
      STATE.edges = data.edges || [];
      STATE.pan = data.pan || { x: 60, y: 80 };
      STATE.zoom = data.zoom || 1;
      if (data.title) document.getElementById('projTitle').value = data.title;
    }
  } catch (e) {
    log('warn', 'error al cargar estado');
  }

  // Asegurar que exista un nodo de métricas de ejemplo en el proyecto activo
  const hasMetrics = STATE.nodes.some(n => n.type === 'metrics');
  if (!hasMetrics && STATE.nodes.length > 0) {
    const endNode = STATE.nodes.find(n => n.type === 'end');
    const targetX = endNode ? endNode.x : 400;
    const targetY = endNode ? endNode.y + 140 : 1000;
    const metricsNode = createNode('metrics', 'Métrica Eficiencia:\n• ROI: +34.2%\n• Throughput: 140 op/s\n• Latencia: 42ms\n• Uptime: 99.98%', targetX, targetY);
    metricsNode.status = 'done';
    metricsNode.progress = 100;
    STATE.nodes.push(metricsNode);
    if (endNode) {
      STATE.edges.push(createEdge(endNode.id, metricsNode.id, 'Performance', 'normal'));
    }
    saveState();
  }
}

function exportJSON() {
  const data = {
    nodes: STATE.nodes,
    edges: STATE.edges,
    title: document.getElementById('projTitle').value,
    exported: new Date().toISOString()
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'flowlab-' + (+new Date()) + '.json';
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
        STATE.nodes = data.nodes || [];
        STATE.edges = data.edges || [];
        if (data.title) document.getElementById('projTitle').value = data.title;
        STATE.history = [];
        STATE.hPtr = -1;
        commitHistory();
        renderAll();
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
  commitHistory();
  renderAll();
}
