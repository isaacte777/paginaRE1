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
