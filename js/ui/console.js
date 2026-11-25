/**
 * Inicializa la terminal interactiva estilo PowerShell
 */
function initConsoleInput() {
  const input = document.getElementById('consoleInput');
  if (!input) return;

  input.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      const cmd = input.value.trim();
      if (!cmd) return;
      log('run', 'PS C:\\paginaRE> ' + cmd);
      input.value = '';
      executeConsoleCommand(cmd);
    }
  });
}

function executeConsoleCommand(cmd) {
  const parts = cmd.toLowerCase().split(' ');
  const action = parts[0];

  switch (action) {
    case 'help':
    case '?':
      log('ok', '=== Comandos disponibles en PowerShell FlowLab ===');
      log('ok', '  help / ?     - Muestra esta ayuda de comandos');
      log('ok', '  clear / cls  - Limpia la pantalla de la consola');
      log('ok', '  run          - Inicia la simulación del flujo de nodos');
      log('ok', '  nodes        - Muestra el listado completo de nodos');
      log('ok', '  edges        - Muestra todas las conexiones del diagrama');
      log('ok', '  status       - Muestra el progreso global y métricas');
      log('ok', '  export       - Exporta el diagrama completo a un JSON');
      log('ok', '  reset        - Restablece el lienzo a cero');
      break;

    case 'clear':
    case 'cls':
      DOM.console.innerHTML = '';
      log('ok', 'Consola limpiada.');
      break;

    case 'run':
    case 'ejecutar':
      simulateExecution();
      break;

    case 'nodes':
      log('ok', `Total de nodos en el diagrama: ${STATE.nodes.length}`);
      STATE.nodes.forEach(n => {
        log('info', `  - [${n.id}] tipo: ${n.type}, texto: "${n.text || ''}", estado: ${n.status || 'pending'}`);
      });
      break;

    case 'edges':
    case 'conexiones':
      log('ok', `Total de conexiones: ${STATE.edges.length}`);
      STATE.edges.forEach(e => {
        log('info', `  - ${e.from} --> ${e.to} ${e.label ? '(' + e.label + ')' : ''}`);
      });
      break;

    case 'status':
      const total = STATE.nodes.length;
      const done = STATE.nodes.filter(n => n.status === 'done').length;
      const pct = total > 0 ? Math.round((done / total) * 100) : 0;
      log('ok', `Progreso Global: ${pct}% (${done}/${total} completados)`);
      log('ok', `Nodos: ${total} | Conexiones: ${STATE.edges.length} | Zoom: ${Math.round(STATE.zoom * 100)}%`);
      break;

    case 'export':
      exportJSON();
      log('ok', 'Proyecto exportado correctamente a JSON.');
      break;

    case 'reset':
      resetState();
      commitHistory();
      renderAll();
      log('warn', 'Lienzo restablecido a cero.');
      break;

    default:
      log('err', `Comando no reconocido: "${cmd}". Escribe "help" para ver los comandos disponibles.`);
      break;
  }
}
function log(type, msg) {
  if (!DOM.console) return;
  const l = document.createElement('div');
  l.className = 'ln ' + type;
  const ts = new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  l.textContent = '[' + ts + '] ' + msg;
  DOM.console.appendChild(l);
  DOM.console.scrollTop = DOM.console.scrollHeight;

  // Limitar líneas del console
  while (DOM.console.children.length > CONFIG.CONSOLE_MAX_LINES) {
    DOM.console.children[0].remove();
  }

  if (typeof notifyFlowConsoleLog === 'function') {
    notifyFlowConsoleLog();
  }
}

/**
 * Permite redimensionar la consola verticalmente arrastrando el borde superior
 */
function initConsoleResize() {
  const handle = document.getElementById('consoleResizeHandle');
  const wrap = document.getElementById('consoleWrap');
  if (!handle || !wrap) return;

  let dragging = false;
  let startY = 0;
  let startHeight = 0;

  handle.addEventListener('pointerdown', e => {
    dragging = true;
    startY = e.clientY;
    startHeight = wrap.offsetHeight;
    handle.setPointerCapture(e.pointerId);
    e.preventDefault();
  });

  handle.addEventListener('pointermove', e => {
    if (!dragging) return;
    const dy = startY - e.clientY;
    const maxH = Math.round(window.innerHeight * 0.78);
    const newHeight = Math.max(76, Math.min(maxH, startHeight + dy));
    wrap.style.height = newHeight + 'px';
  });

  handle.addEventListener('pointerup', e => {
    dragging = false;
    try { handle.releasePointerCapture(e.pointerId); } catch {}
  });
}

function simulateExecution() {
  if (typeof switchTerminalTab === 'function') {
    switchTerminalTab('log');
  }
  log('run', 'iniciando ejecución...');
  const start = STATE.nodes.find(n => n.type === 'start');
  if (!start) {
    log('err', 'no hay nodo de inicio');
    return;
  }

  let current = start;
  const executeStep = async () => {
    if (!current) {
      log('ok', 'ejecución completada');
      renderAll();
      return;
    }

    current.current = true;
    renderAll();
    current.state = 'running';
    await new Promise(r => setTimeout(r, 800));

    const next = STATE.edges.find(e => e.from === current.id);
    if (!next) {
      current.state = 'ok';
      renderAll();
      log('ok', 'ejecución completada');
      return;
    }

    current.state = 'ok';
    current.status = 'done';
    current.progress = 100;

    const target = byId(next.to);
    if (!target) {
      renderAll();
      log('ok', 'ejecución completada');
      return;
    }

    target.state = 'idle';
    target.status = 'progress';
    target.progress = Math.random() * 60 + 20;
    current = target;
    renderAll();

    await new Promise(r => setTimeout(r, 500));
    executeStep();
  };

  executeStep();
}
