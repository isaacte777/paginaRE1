// CONSOLE: Gestión de la consola de logs
function log(type, msg) {
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
    const newHeight = Math.max(45, Math.min(500, startHeight + dy));
    wrap.style.height = newHeight + 'px';
  });

  handle.addEventListener('pointerup', e => {
    dragging = false;
    try { handle.releasePointerCapture(e.pointerId); } catch {}
  });
}

function simulateExecution() {
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
