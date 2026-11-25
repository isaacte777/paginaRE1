// LANDING FLOW DEMO: mini lienzo independiente para enseñar el uso de FlowLab.
// No lee ni modifica el proyecto real ni el estado compartido.
(() => {
  const root = document.getElementById('flowDemo');
  if (!root) return;

  const canvas = root.querySelector('#demoCanvas');
  const edgesSvg = root.querySelector('#demoEdges');
  const panel = root.querySelector('#demoPanel');
  const terminal = root.querySelector('#demoTerminal');
  const runButton = root.querySelector('#demoRun');
  const resetButton = root.querySelector('#demoReset');
  if (!canvas || !edgesSvg || !panel || !terminal || !runButton || !resetButton) return;

  const defaultNodes = () => ([
    { id: 'start', type: 'start', text: 'inicio', x: 50, y: 11 },
    { id: 'plan', type: 'process', text: 'planificar tareas', x: 50, y: 31 },
    { id: 'code', type: 'process', text: 'generar código', x: 27, y: 51 },
    { id: 'tests', type: 'process', text: 'generar pruebas', x: 73, y: 51 },
    { id: 'validate', type: 'decision', text: 'validar', x: 50, y: 71 },
    { id: 'end', type: 'end', text: 'completo', x: 50, y: 89 }
  ]);

  const defaultEdges = () => ([
    ['start', 'plan'], ['plan', 'code'], ['plan', 'tests'],
    ['code', 'validate'], ['tests', 'validate'], ['validate', 'end']
  ]);

  let nodes = defaultNodes();
  let edges = defaultEdges();
  let selectedId = 'plan';
  let dragging = null;
  let running = false;
  let runTimer = null;
  let nextId = 1;

  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  const selectedNode = () => nodes.find(node => node.id === selectedId) || null;
  const byId = id => nodes.find(node => node.id === id);

  const setTerminal = text => { terminal.textContent = `PS C:\\paginaRE> ${text}`; };

  const renderEdges = () => {
    edgesSvg.innerHTML = edges.map(([from, to]) => {
      const a = byId(from);
      const b = byId(to);
      if (!a || !b) return '';
      const active = a.running || b.running || (a.done && b.done);
      return `<line class="demo-edge${active ? ' active' : ''}" x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}"></line>`;
    }).join('');
  };

  const renderNodes = () => {
    canvas.querySelectorAll('.demo-node').forEach(node => node.remove());
    nodes.forEach(node => {
      const element = document.createElement('button');
      element.type = 'button';
      element.className = `demo-node demo-${node.type}${node.id === selectedId ? ' selected' : ''}${node.running ? ' running' : ''}${node.done ? ' done' : ''}`;
      element.dataset.demoNode = node.id;
      element.style.left = `${node.x}%`;
      element.style.top = `${node.y}%`;
      element.textContent = node.text;
      element.setAttribute('aria-label', `${node.text}, ${node.type}. Seleccionar o arrastrar.`);
      canvas.appendChild(element);
    });
  };

  const renderPanel = () => {
    const node = selectedNode();
    root.classList.toggle('has-demo-selection', Boolean(node));
    if (!node) {
      panel.innerHTML = '<strong>props</strong><p>Selecciona un nodo para ver sus propiedades, nombre y posición.</p>';
      return;
    }

    const connections = edges.filter(([from, to]) => from === node.id || to === node.id).length;
    panel.innerHTML = `
      <strong>props</strong>
      <div class="demo-prop-type">${node.type}</div>
      <label for="demoNodeName">nombre</label>
      <input id="demoNodeName" data-demo-name type="text" maxlength="28" value="${node.text.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}">
      <p>x: ${Math.round(node.x)} · y: ${Math.round(node.y)}<br>${connections} conexión${connections === 1 ? '' : 'es'} · arrastra para mover</p>
    `;
  };

  const render = () => {
    renderEdges();
    renderNodes();
    renderPanel();
  };

  const addNode = type => {
    const previousId = selectedId;
    const placed = [
      { x: 27, y: 23 }, { x: 73, y: 23 }, { x: 27, y: 72 },
      { x: 73, y: 72 }, { x: 50, y: 48 }
    ][nextId % 5];
    const labels = { start: 'inicio', process: 'nuevo paso', decision: 'decisión', end: 'fin', data: 'dato' };
    const node = { id: `new-${nextId++}`, type, text: labels[type] || 'paso', ...placed };
    nodes.push(node);
    if (previousId && byId(previousId)) edges.push([previousId, node.id]);
    selectedId = node.id;
    setTerminal(`añadido ${node.text}${previousId ? ' y conectado' : ''}`);
    render();

    requestAnimationFrame(() => {
      const element = canvas.querySelector(`[data-demo-node="${node.id}"]`);
      element?.classList.add('placed');
      element?.addEventListener('animationend', () => element.classList.remove('placed'), { once: true });
    });
  };

  root.querySelectorAll('[data-demo-add]').forEach(button => {
    button.addEventListener('click', () => addNode(button.dataset.demoAdd));
  });

  panel.addEventListener('input', event => {
    if (!event.target.matches('[data-demo-name]')) return;
    const node = selectedNode();
    if (!node) return;
    node.text = event.target.value || 'paso';
    const element = canvas.querySelector(`[data-demo-node="${node.id}"]`);
    if (element) {
      element.textContent = node.text;
      element.setAttribute('aria-label', `${node.text}, ${node.type}. Seleccionar o arrastrar.`);
    }
    setTerminal(`editando ${node.text}`);
  });

  canvas.addEventListener('pointerdown', event => {
    const element = event.target.closest('[data-demo-node]');
    if (!element) {
      selectedId = null;
      renderPanel();
      return;
    }

    const node = byId(element.dataset.demoNode);
    if (!node) return;
    selectedId = node.id;
    dragging = { id: node.id, pointerId: event.pointerId };
    canvas.setPointerCapture?.(event.pointerId);
    setTerminal(`moviendo ${node.text}`);
    render();
    event.preventDefault();
  });

  canvas.addEventListener('pointermove', event => {
    if (!dragging || event.pointerId !== dragging.pointerId) return;
    const node = byId(dragging.id);
    const rect = canvas.getBoundingClientRect();
    if (!node || !rect.width || !rect.height) return;
    node.x = clamp(((event.clientX - rect.left) / rect.width) * 100, 10, 90);
    node.y = clamp(((event.clientY - rect.top) / rect.height) * 100, 10, 90);
    renderEdges();
    const element = canvas.querySelector(`[data-demo-node="${node.id}"]`);
    if (element) {
      element.style.left = `${node.x}%`;
      element.style.top = `${node.y}%`;
    }
    renderPanel();
  });

  const endDrag = event => {
    if (!dragging || event.pointerId !== dragging.pointerId) return;
    const node = byId(dragging.id);
    dragging = null;
    canvas.releasePointerCapture?.(event.pointerId);
    if (node) {
      const element = canvas.querySelector(`[data-demo-node="${node.id}"]`);
      element?.classList.add('placed');
      element?.addEventListener('animationend', () => element.classList.remove('placed'), { once: true });
      setTerminal(`nodo colocado en ${Math.round(node.x)}, ${Math.round(node.y)}`);
    }
  };
  canvas.addEventListener('pointerup', endDrag);
  canvas.addEventListener('pointercancel', endDrag);

  const stopRun = () => {
    if (runTimer) window.clearTimeout(runTimer);
    runTimer = null;
    running = false;
    runButton.disabled = false;
  };

  const runFlow = index => {
    if (index >= nodes.length) {
      nodes.forEach(node => { node.running = false; node.done = true; });
      setTerminal('flujo completado ✓');
      stopRun();
      render();
      return;
    }
    nodes.forEach(node => { node.running = false; });
    nodes[index].running = true;
    selectedId = nodes[index].id;
    setTerminal(`ejecutando ${nodes[index].text}`);
    render();
    runTimer = window.setTimeout(() => {
      nodes[index].running = false;
      nodes[index].done = true;
      runFlow(index + 1);
    }, 420);
  };

  runButton.addEventListener('click', () => {
    if (running) return;
    nodes.forEach(node => { node.done = false; node.running = false; });
    running = true;
    runButton.disabled = true;
    runFlow(0);
  });

  resetButton.addEventListener('click', () => {
    stopRun();
    nodes = defaultNodes();
    edges = defaultEdges();
    selectedId = 'plan';
    nextId = 1;
    setTerminal('demostración restablecida');
    render();
  });

  render();
})();
