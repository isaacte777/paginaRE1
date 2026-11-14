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

function importJSON(file) {
  const reader = new FileReader();
  reader.onload = (ev) => {
    try {
      const data = JSON.parse(ev.target.result);
      STATE.nodes = data.nodes || [];
      STATE.edges = data.edges || [];
      if (data.title) document.getElementById('projTitle').value = data.title;
      STATE.history = [];
      STATE.hPtr = -1;
      commitHistory();
      renderAll();
      log('ok', 'JSON cargado');
    } catch (e) {
      log('err', 'Error JSON: ' + e.message);
    }
  };
  reader.readAsText(file);
}
