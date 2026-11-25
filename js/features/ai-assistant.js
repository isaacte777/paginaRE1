// AI ASSISTANT: Chat con IA en barra lateral con contexto vivo del proyecto,
// creación inteligente de nodos y conexión vía Local (PC/Laptop), API Key o URL.

(function () {
  const STORAGE_KEY = 'flowlab-ai-config-v1';

  const LOCAL_PRESETS = {
    ollama: {
      name: 'Ollama (Local)',
      url: 'http://localhost:11434/v1/chat/completions',
      baseUrl: 'http://localhost:11434',
      defaultModel: 'qwen2.5-coder:7b'
    },
    lmstudio: {
      name: 'LM Studio (Local)',
      url: 'http://localhost:1234/v1/chat/completions',
      baseUrl: 'http://localhost:1234',
      defaultModel: 'local-model'
    },
    jan: {
      name: 'Jan AI (Local)',
      url: 'http://localhost:1337/v1/chat/completions',
      baseUrl: 'http://localhost:1337',
      defaultModel: 'llama3.2'
    },
    llamacpp: {
      name: 'llama.cpp / LocalAI',
      url: 'http://localhost:8080/v1/chat/completions',
      baseUrl: 'http://localhost:8080',
      defaultModel: 'default'
    },
    textgen: {
      name: 'TextGen WebUI',
      url: 'http://localhost:5000/v1/chat/completions',
      baseUrl: 'http://localhost:5000',
      defaultModel: 'default'
    }
  };

  const CLOUD_PROVIDERS = {
    openai: {
      name: 'OpenAI',
      url: 'https://api.openai.com/v1/chat/completions',
      defaultModel: 'gpt-4o-mini',
      placeholderKey: 'sk-...'
    },
    gemini: {
      name: 'Google Gemini',
      url: 'https://generativelanguage.googleapis.com/v1beta',
      defaultModel: 'gemini-2.0-flash',
      placeholderKey: 'AIzaSy...'
    },
    anthropic: {
      name: 'Anthropic Claude',
      url: 'https://api.anthropic.com/v1/messages',
      defaultModel: 'claude-3-5-sonnet-latest',
      placeholderKey: 'sk-ant-...'
    },
    openrouter: {
      name: 'OpenRouter',
      url: 'https://openrouter.ai/api/v1/chat/completions',
      defaultModel: 'meta-llama/llama-3.3-70b-instruct:free',
      placeholderKey: 'sk-or-v1-...'
    },
    groq: {
      name: 'Groq',
      url: 'https://api.groq.com/openai/v1/chat/completions',
      defaultModel: 'llama-3.3-70b-versatile',
      placeholderKey: 'gsk_...'
    },
    deepseek: {
      name: 'DeepSeek',
      url: 'https://api.deepseek.com/chat/completions',
      defaultModel: 'deepseek-chat',
      placeholderKey: 'sk-...'
    }
  };

  const TYPE_ALIASES = {
    inicio: 'start',
    start: 'start',
    fin: 'end',
    end: 'end',
    proceso: 'process',
    process: 'process',
    task: 'process',
    step: 'process',
    decision: 'decision',
    condicion: 'decision',
    condition: 'decision',
    if: 'decision',
    bucle: 'loop',
    loop: 'loop',
    paralelo: 'parallel',
    parallel: 'parallel',
    io: 'io',
    input: 'io',
    output: 'io',
    entrada: 'io',
    salida: 'io',
    db: 'db',
    database: 'db',
    basedatos: 'db',
    postgres: 'db',
    sql: 'db',
    varset: 'varset',
    variable: 'varset',
    api: 'api',
    http: 'api',
    endpoint: 'api',
    hook: 'hook',
    webhook: 'hook',
    tryc: 'tryc',
    try: 'tryc',
    err: 'err',
    error: 'err',
    delay: 'delay',
    wait: 'delay',
    espera: 'delay',
    ai: 'ai',
    llm: 'ai',
    ia: 'ai',
    agent: 'ai',
    human: 'human',
    humano: 'human',
    manual: 'human',
    metrics: 'metrics',
    metrica: 'metrics',
    kpi: 'metrics',
    chart_line: 'chart_line',
    chart_bar: 'chart_bar',
    chart_donut: 'chart_donut',
    chart_gauge: 'chart_gauge',
    chart_funnel: 'chart_funnel'
  };

  const DEFAULT_CONFIG = {
    mode: 'builtin', // 'local' | 'api' | 'url' | 'builtin'
    includeContext: true,
    autoApply: true,
    local: {
      preset: 'ollama',
      url: LOCAL_PRESETS.ollama.url,
      model: LOCAL_PRESETS.ollama.defaultModel
    },
    api: {
      provider: 'openai',
      apiKey: '',
      model: CLOUD_PROVIDERS.openai.defaultModel
    },
    url: {
      endpoint: '',
      format: 'openai', // 'openai' | 'webhook'
      apiKey: '',
      model: ''
    }
  };

  let aiConfig = loadAIConfig();
  let messages = [];
  let isGenerating = false;
  let currentAbort = null;
  let editingModeTab = aiConfig.mode === 'builtin' ? 'local' : aiConfig.mode;

  function loadAIConfig() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return structuredCloneFallback(DEFAULT_CONFIG);
      const parsed = JSON.parse(raw);
      return {
        ...structuredCloneFallback(DEFAULT_CONFIG),
        ...parsed,
        local: { ...DEFAULT_CONFIG.local, ...(parsed.local || {}) },
        api: { ...DEFAULT_CONFIG.api, ...(parsed.api || {}) },
        url: { ...DEFAULT_CONFIG.url, ...(parsed.url || {}) }
      };
    } catch {
      return structuredCloneFallback(DEFAULT_CONFIG);
    }
  }

  function structuredCloneFallback(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  function saveAIConfig() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(aiConfig));
    } catch {}
    updateProviderHeaderUI();
  }

  function normalizeNodeType(rawType) {
    if (!rawType) return 'process';
    const key = String(rawType)
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9_]/g, '');
    if (CONFIG.NODE_TYPES[key]) return key;
    return TYPE_ALIASES[key] || 'process';
  }

  // =========================================================================
  // SERIALIZADOR DE CONTEXTO DEL PROYECTO ACTIVO
  // =========================================================================
  function buildWorkspaceContext() {
    const title = (document.getElementById('projTitle')?.value || 'sin_titulo').trim();
    const nodes = STATE.nodes || [];
    const edges = STATE.edges || [];
    const blockedIds = STATE.blocked ? Array.from(STATE.blocked) : [];

    const counts = {
      totalNodes: nodes.length,
      totalEdges: edges.length,
      pending: nodes.filter(n => n.status === 'pending').length,
      progress: nodes.filter(n => n.status === 'progress').length,
      done: nodes.filter(n => n.status === 'done').length,
      error: nodes.filter(n => n.status === 'error').length,
      blocked: blockedIds.length
    };

    let selected = null;
    if (STATE.sel) {
      if (STATE.sel.kind === 'node') {
        const sn = byId(STATE.sel.id);
        if (sn) {
          const incoming = edges
            .filter(e => e.to === sn.id)
            .map(e => ({ from: e.from, fromText: byId(e.from)?.text || '', label: e.label || '' }));
          const outgoing = edges
            .filter(e => e.from === sn.id)
            .map(e => ({ to: e.to, toText: byId(e.to)?.text || '', label: e.label || '' }));
          selected = {
            kind: 'node',
            id: sn.id,
            type: sn.type,
            text: sn.text,
            status: sn.status,
            progress: sn.progress || 0,
            x: sn.x,
            y: sn.y,
            params: sn.params || {},
            incoming,
            outgoing
          };
        }
      } else if (STATE.sel.kind === 'edge') {
        const se = byId(STATE.sel.id, 'edge');
        if (se) {
          selected = {
            kind: 'edge',
            id: se.id,
            from: se.from,
            to: se.to,
            label: se.label || ''
          };
        }
      }
    }

    const compactNodes = nodes.slice(0, 120).map(n => ({
      id: n.id,
      type: n.type,
      text: n.text,
      status: n.status || 'pending',
      blocked: blockedIds.includes(n.id)
    }));

    const compactEdges = edges.slice(0, 200).map(e => ({
      id: e.id,
      from: e.from,
      to: e.to,
      label: e.label || ''
    }));

    return {
      projectTitle: title,
      summary: counts,
      selected,
      nodes: compactNodes,
      edges: compactEdges
    };
  }

  function buildSystemPrompt() {
    const ctxBlock = aiConfig.includeContext
      ? '\n\nCONTEXTO ACTUAL DEL ARCHIVO EN EL LIENZO (JSON):\n' +
        JSON.stringify(buildWorkspaceContext(), null, 2)
      : '\n\n(El usuario desactivó temporalmente el envío del contexto del lienzo).';

    return (
      'Eres el Asistente IA integrado en FlowLab (sistema visual de flujos y arquitectura). ' +
      'Hablas en español de forma clara, directa y útil.\n\n' +
      'CAPACIDAD DE CREAR Y EDITAR NODOS EN EL LIENZO:\n' +
      'Cuando el usuario te pida crear nodos, diseñar un flujo, expandir pasos, conectar bloques, cambiar estados o modificar el diagrama, ' +
      'debes explicar brevemente tu propuesta y añadir AL FINAL de tu mensaje un único bloque de código con la etiqueta ```flowlab-actions contenant JSON válido.\n\n' +
      'Tipos de nodo válidos (type): start, end, process, decision, loop, parallel, io, db, varset, api, hook, tryc, err, delay, ai, human, metrics, chart_line, chart_bar, chart_donut, chart_gauge, chart_funnel.\n' +
      'Estados válidos (status): pending, progress, done, error.\n\n' +
      'Formato exacto del bloque ```flowlab-actions:\n' +
      '```flowlab-actions\n' +
      '{\n' +
      '  "summary": "Descripción corta de los cambios",\n' +
      '  "operations": [\n' +
      '    { "op": "add_node", "ref": "p1", "type": "start", "text": "Inicio", "status": "pending" },\n' +
      '    { "op": "add_node", "ref": "p2", "type": "decision", "text": "¿Datos válidos?", "after": "p1" },\n' +
      '    { "op": "add_node", "ref": "p3", "type": "db", "text": "Guardar registro", "after": "p2" },\n' +
      '    { "op": "add_node", "ref": "p4", "type": "err", "text": "Notificar error", "after": "p2" },\n' +
      '    { "op": "add_edge", "from": "p1", "to": "p2", "label": "" },\n' +
      '    { "op": "add_edge", "from": "p2", "to": "p3", "label": "Sí" },\n' +
      '    { "op": "add_edge", "from": "p2", "to": "p4", "label": "No" }\n' +
      '  ]\n' +
      '}\n' +
      '```\n' +
      'También puedes usar:\n' +
      '- `{ "op": "update_node", "id": "<id_existente>", "text": "Nuevo texto", "status": "done" }`\n' +
      '- `{ "op": "delete_node", "id": "<id_existente>" }`\n' +
      '- `{ "op": "clear_canvas" }` (SOLO si el usuario pide explícitamente borrar/reemplazar todo el lienzo).\n' +
      '- Si el usuario dice "a partir de este nodo" o hay un nodo seleccionado (`selected.id`), conecta desde ese `id` existente usando `"after": "<selected.id>"` y `{ "op": "add_edge", "from": "<selected.id>", "to": "p1" }`.\n' +
      '- Si el usuario SOLO hace una pregunta o pide analizar el diagrama sin pedir cambios, responde normalmente SIN incluir ```flowlab-actions.' +
      ctxBlock
    );
  }

  // =========================================================================
  // EXTRACCIÓN DE ACCIONES DE LA RESPUESTA DEL MODELO
  // =========================================================================
  function extractActionsFromReply(rawContent) {
    const text = String(rawContent || '');
    let parsedActions = null;
    let cleanReply = text;

    // 1. Buscar bloque ```flowlab-actions ... ```
    const actionRegex = /```flowlab-actions\s*([\s\S]*?)```/i;
    const match = text.match(actionRegex);
    if (match) {
      parsedActions = tryParseActionPayload(match[1]);
      if (parsedActions) {
        cleanReply = text.replace(match[0], '').trim();
      }
    }

    // 2. Fallback: bloque ```json ... ``` que contenga "operations" o "nodes"
    if (!parsedActions) {
      const jsonBlocks = [...text.matchAll(/```(?:json)?\s*([\s\S]*?)```/gi)];
      for (const jm of jsonBlocks) {
        const candidate = tryParseActionPayload(jm[1]);
        if (candidate && candidate.operations && candidate.operations.length > 0) {
          parsedActions = candidate;
          cleanReply = text.replace(jm[0], '').trim();
          break;
        }
      }
    }

    return {
      cleanReply: cleanReply || 'He preparado los nodos solicitados para tu flujo.',
      actions: parsedActions
    };
  }

  function tryParseActionPayload(jsonStr) {
    try {
      const cleaned = String(jsonStr)
        .trim()
        .replace(/,\s*([\]}])/g, '$1');
      const data = JSON.parse(cleaned);
      if (!data || typeof data !== 'object') return null;

      if (Array.isArray(data.operations)) {
        return {
          summary: data.summary || 'Cambios sugeridos en el flujo',
          operations: data.operations
        };
      }

      // Soportar formato alternativo { nodes: [...], edges: [...] }
      if (Array.isArray(data.nodes)) {
        const ops = [];
        data.nodes.forEach((n, idx) => {
          ops.push({
            op: 'add_node',
            ref: n.ref || n.id || 'ai_' + idx,
            type: n.type || 'process',
            text: n.text || n.label || n.name || 'Paso ' + (idx + 1),
            status: n.status || 'pending',
            x: n.x,
            y: n.y,
            after: n.after
          });
        });
        if (Array.isArray(data.edges)) {
          data.edges.forEach(e => {
            ops.push({
              op: 'add_edge',
              from: e.from || e.source,
              to: e.to || e.target,
              label: e.label || ''
            });
          });
        }
        return {
          summary: data.summary || `${ops.filter(o => o.op === 'add_node').length} nodos generados`,
          operations: ops
        };
      }
    } catch {}
    return null;
  }

  // =========================================================================
  // MOTOR DE AUTO-LAYOUT Y APLICACIÓN DE OPERACIONES AL LIENZO
  // =========================================================================
  function resolveRefOrNodeId(token, refMap) {
    if (!token) return null;
    if (token === 'SELECTED' && STATE.sel && STATE.sel.kind === 'node') {
      return STATE.sel.id;
    }
    if (refMap.has(token)) return refMap.get(token);
    const existing = byId(token);
    if (existing) return existing.id;
    return null;
  }

  function findFreePosition(x, y, w = 150, h = 60) {
    let cx = Math.round(x / CONFIG.SNAP_GRID) * CONFIG.SNAP_GRID;
    let cy = Math.round(y / CONFIG.SNAP_GRID) * CONFIG.SNAP_GRID;
    let guard = 0;
    while (
      guard < 30 &&
      STATE.nodes.some(
        n => Math.abs(n.x - cx) < (n.w + w) * 0.48 && Math.abs(n.y - cy) < (n.h + h) * 0.65
      )
    ) {
      cx += 36;
      cy += 24;
      guard++;
    }
    return { x: cx, y: cy };
  }

  function applyAIGraphActions(actionPayload) {
    if (!actionPayload || !Array.isArray(actionPayload.operations)) {
      return { addedNodes: [], addedEdges: [], updatedCount: 0 };
    }

    const ops = actionPayload.operations;
    const refMap = new Map();
    const pendingNewNodes = [];
    const pendingEdges = [];
    let updatedCount = 0;

    // 1. Procesar limpieza o borrados/actualizaciones previas y recolectar nuevos nodos
    ops.forEach((op, index) => {
      if (!op || typeof op !== 'object') return;
      const kind = String(op.op || op.action || '').toLowerCase();

      if (kind === 'clear_canvas') {
        STATE.nodes = [];
        STATE.edges = [];
        STATE.sel = null;
        STATE.isBlankCanvas = false;
      } else if (kind === 'delete_node' && op.id) {
        const targetId = resolveRefOrNodeId(op.id, refMap);
        if (targetId) {
          STATE.nodes = STATE.nodes.filter(n => n.id !== targetId);
          STATE.edges = STATE.edges.filter(e => e.from !== targetId && e.to !== targetId);
          updatedCount++;
        }
      } else if (kind === 'update_node' && op.id) {
        const targetId = resolveRefOrNodeId(op.id, refMap);
        const target = targetId ? byId(targetId) : null;
        if (target) {
          if (typeof op.text === 'string' && op.text.trim()) target.text = op.text.trim();
          if (op.type) target.type = normalizeNodeType(op.type);
          if (op.status && CONFIG.BADGE[op.status]) target.status = op.status;
          if (typeof op.progress === 'number') target.progress = clamp(op.progress, 0, 100);
          if (op.params && typeof op.params === 'object') {
            target.params = { ...(target.params || {}), ...op.params };
          }
          updatedCount++;
        }
      } else if (kind === 'add_node') {
        const type = normalizeNodeType(op.type);
        const text = String(op.text || op.label || CONFIG.NODE_TYPES[type] || 'Paso').trim();
        const nodeObj = createNode(type, text, 0, 0);
        if (op.status && CONFIG.BADGE[op.status]) nodeObj.status = op.status;
        if (typeof op.progress === 'number') nodeObj.progress = clamp(op.progress, 0, 100);
        if (op.params && typeof op.params === 'object') nodeObj.params = { ...op.params };

        const refKey = String(op.ref || op.id || 'ref_' + index);
        refMap.set(refKey, nodeObj.id);

        pendingNewNodes.push({
          refKey,
          node: nodeObj,
          explicitX: typeof op.x === 'number' && Number.isFinite(op.x) ? op.x : null,
          explicitY: typeof op.y === 'number' && Number.isFinite(op.y) ? op.y : null,
          afterRaw: op.after || null
        });
      } else if (kind === 'add_edge') {
        pendingEdges.push({
          fromRaw: op.from || op.source,
          toRaw: op.to || op.target,
          label: typeof op.label === 'string' ? op.label : ''
        });
      }
    });

    // 2. Calcular posiciones limpias en árbol para los nuevos nodos
    if (pendingNewNodes.length > 0) {
      const newById = new Map(pendingNewNodes.map(item => [item.node.id, item]));
      const parentsMap = new Map(pendingNewNodes.map(item => [item.node.id, []]));
      const childrenMap = new Map(pendingNewNodes.map(item => [item.node.id, []]));
      let externalAnchorNode = null;

      // Inferir relaciones desde edges y "after"
      pendingEdges.forEach(pe => {
        const fId = resolveRefOrNodeId(pe.fromRaw, refMap);
        const tId = resolveRefOrNodeId(pe.toRaw, refMap);
        if (!fId || !tId) return;
        if (newById.has(tId) && newById.has(fId)) {
          parentsMap.get(tId).push(fId);
          childrenMap.get(fId).push(tId);
        } else if (!newById.has(fId) && newById.has(tId)) {
          const existingParent = byId(fId);
          if (existingParent && !externalAnchorNode) externalAnchorNode = existingParent;
        }
      });

      pendingNewNodes.forEach(item => {
        if (!item.afterRaw) return;
        const afterId = resolveRefOrNodeId(item.afterRaw, refMap);
        if (!afterId) return;
        if (newById.has(afterId)) {
          if (!parentsMap.get(item.node.id).includes(afterId)) {
            parentsMap.get(item.node.id).push(afterId);
            childrenMap.get(afterId).push(item.node.id);
          }
        } else {
          const existingParent = byId(afterId);
          if (existingParent && !externalAnchorNode) externalAnchorNode = existingParent;
        }
      });

      // Asignar niveles por profundidad topológica
      const levelMap = new Map();
      const roots = pendingNewNodes
        .map(i => i.node.id)
        .filter(id => (parentsMap.get(id) || []).length === 0);

      if (roots.length === 0 && pendingNewNodes.length > 0) {
        roots.push(pendingNewNodes[0].node.id);
      }

      const queue = roots.map(id => ({ id, lvl: 0 }));
      const visitCount = new Map();

      while (queue.length > 0) {
        const { id, lvl } = queue.shift();
        const prev = levelMap.get(id);
        if (prev === undefined || lvl > prev) {
          levelMap.set(id, lvl);
        }
        const visits = (visitCount.get(id) || 0) + 1;
        visitCount.set(id, visits);
        if (visits > pendingNewNodes.length * 2) continue;

        (childrenMap.get(id) || []).forEach(childId => {
          queue.push({ id: childId, lvl: (levelMap.get(id) || 0) + 1 });
        });
      }

      // Asegurar nivel para nodos desconectados
      let fallbackLvl = 0;
      pendingNewNodes.forEach(item => {
        if (!levelMap.has(item.node.id)) {
          levelMap.set(item.node.id, fallbackLvl++);
        }
      });

      // Agrupar por nivel
      const layers = new Map();
      pendingNewNodes.forEach(item => {
        const lvl = levelMap.get(item.node.id) || 0;
        if (!layers.has(lvl)) layers.set(lvl, []);
        layers.get(lvl).push(item);
      });

      // Determinar punto de origen en el lienzo
      let centerX = 440;
      let startY = 96;

      if (externalAnchorNode) {
        centerX = externalAnchorNode.x + externalAnchorNode.w / 2;
        startY = externalAnchorNode.y + externalAnchorNode.h + 96;
      } else if (STATE.nodes.length > 0) {
        const b = bbox();
        centerX = b.maxX + 180;
        startY = Math.max(72, b.minY + 100);
      }

      const H_GAP = 224;
      const V_GAP = 132;

      Array.from(layers.keys())
        .sort((a, b) => a - b)
        .forEach(lvl => {
          const rowItems = layers.get(lvl);
          const count = rowItems.length;
          rowItems.forEach((item, idx) => {
            if (item.explicitX !== null && item.explicitY !== null) {
              const pos = findFreePosition(item.explicitX, item.explicitY, item.node.w, item.node.h);
              item.node.x = pos.x;
              item.node.y = pos.y;
            } else {
              const rawX = centerX + (idx - (count - 1) / 2) * H_GAP - item.node.w / 2;
              const rawY = startY + lvl * V_GAP;
              const pos = findFreePosition(rawX, rawY, item.node.w, item.node.h);
              item.node.x = pos.x;
              item.node.y = pos.y;
            }
            STATE.nodes.push(item.node);
          });
        });

      STATE.isBlankCanvas = false;
    }

    // 3. Crear conexiones resueltas
    const createdEdges = [];
    pendingEdges.forEach(pe => {
      const fromId = resolveRefOrNodeId(pe.fromRaw, refMap);
      const toId = resolveRefOrNodeId(pe.toRaw, refMap);
      if (!fromId || !toId || fromId === toId) return;
      if (!STATE.edges.some(e => e.from === fromId && e.to === toId)) {
        const edge = createEdge(fromId, toId, pe.label || '', 'normal');
        STATE.edges.push(edge);
        createdEdges.push(edge);
      }
    });

    // También auto-conectar cuando se usó "after" pero el modelo olvidó add_edge explícito
    pendingNewNodes.forEach(item => {
      if (!item.afterRaw) return;
      const fromId = resolveRefOrNodeId(item.afterRaw, refMap);
      const toId = item.node.id;
      if (!fromId || fromId === toId) return;
      const alreadyHasIncoming = STATE.edges.some(e => e.to === toId);
      if (!alreadyHasIncoming) {
        const edge = createEdge(fromId, toId, '', 'normal');
        STATE.edges.push(edge);
        createdEdges.push(edge);
      }
    });

    const addedNodes = pendingNewNodes.map(i => i.node);

    if (addedNodes.length > 0 || createdEdges.length > 0 || updatedCount > 0) {
      commitHistory();
      renderAll();

      addedNodes.forEach(n => {
        if (typeof animateNodePlacement === 'function') animateNodePlacement(n.id);
      });

      if (addedNodes.length > 0) {
        STATE.sel = { kind: 'node', id: addedNodes[0].id };
        renderAll();
        focusNodesOnCanvas(addedNodes.map(n => n.id));
      }

      if (typeof log === 'function') {
        log(
          'agent',
          `IA aplicó: +${addedNodes.length} nodo(s), +${createdEdges.length} conexión(es)` +
            (updatedCount ? `, ${updatedCount} editado(s)` : '')
        );
      }
    }

    return { addedNodes, addedEdges: createdEdges, updatedCount };
  }

  function focusNodesOnCanvas(nodeIds) {
    if (!nodeIds || !nodeIds.length || !DOM.vp) return;
    const targets = nodeIds.map(id => byId(id)).filter(Boolean);
    if (!targets.length) return;

    const minX = Math.min(...targets.map(n => n.x)) - 70;
    const minY = Math.min(...targets.map(n => n.y)) - 70;
    const maxX = Math.max(...targets.map(n => n.x + n.w)) + 70;
    const maxY = Math.max(...targets.map(n => n.y + n.h)) + 70;

    const r = DOM.vp.getBoundingClientRect();
    const w = r.width || 800;
    const h = r.height || 600;
    const bw = Math.max(1, maxX - minX);
    const bh = Math.max(1, maxY - minY);

    const targetZoom = clamp(Math.min((w - 80) / bw, (h - 80) / bh, 1.15), 0.35, 1.4);
    STATE.zoom = targetZoom;
    STATE.pan.x = w / 2 - ((minX + bw / 2) * targetZoom);
    STATE.pan.y = h / 2 - ((minY + bh / 2) * targetZoom);
    if (typeof applyTransform === 'function') applyTransform();
    if (typeof saveState === 'function') saveState();
  }

  // =========================================================================
  // MOTOR INTEGRADO OFFLINE (SIN SERVIDOR EXTERNO NI API KEY)
  // =========================================================================
  function runBuiltinAssistant(userPrompt) {
    const q = userPrompt.toLowerCase().trim();
    const ctx = buildWorkspaceContext();
    const selNode = ctx.selected && ctx.selected.kind === 'node' ? ctx.selected : null;

    const wantsCreation =
      /\b(crea|crear|genera|generar|agrega|agregar|anade|añade|añadir|construye|arma|diseña|disena|haz|hacer|nuevo nodo|nuevos nodos|flujo de|proceso de|rama|ramas|expande|expandir|conecta)\b/i.test(
        q
      );

    // 1. Solicitudes de creación de flujos o nodos
    if (wantsCreation) {
      return generateBuiltinFlowProposal(userPrompt, q, selNode);
    }

    // 2. Consultas analíticas con contexto real del archivo actual
    if (q.includes('bloque') || q.includes('cuello') || q.includes('pendiente')) {
      const blockedNodes = ctx.nodes.filter(n => n.blocked);
      if (blockedNodes.length === 0) {
        return {
          cleanReply:
            `Revisé **${ctx.projectTitle}** y actualmente **no hay nodos bloqueados**.\n\n` +
            `• Completados: **${ctx.summary.done}/${ctx.summary.totalNodes}**\n` +
            `• En curso: **${ctx.summary.progress}** · Pendientes: **${ctx.summary.pending}**\n\n` +
            `Si quieres añadir validaciones o pasos nuevos, dime por ejemplo: *"agrega una validación y manejo de error"*.`,
          actions: null
        };
      }
      const list = blockedNodes
        .slice(0, 6)
        .map(n => `• \`${n.text.split('\n')[0]}\` (${n.type})`)
        .join('\n');
      return {
        cleanReply:
          `Detecté **${blockedNodes.length} nodo(s) bloqueado(s)** en **${ctx.projectTitle}** esperando tareas previas:\n\n` +
          `${list}\n\nCompleta los nodos de entrada anteriores para desbloquear la ruta crítica.`,
        actions: null
      };
    }

    if (selNode && (q.includes('este nodo') || q.includes('seleccionado') || q.includes('explica'))) {
      const inc = selNode.incoming.length
        ? selNode.incoming.map(i => `"${i.fromText.split('\n')[0]}"`).join(', ')
        : 'ninguna (nodo raíz)';
      const out = selNode.outgoing.length
        ? selNode.outgoing.map(o => `"${o.toText.split('\n')[0]}"`).join(', ')
        : 'ninguna (nodo hoja)';
      return {
        cleanReply:
          `Nodo seleccionado en **${ctx.projectTitle}**:\n` +
          `• **Nombre**: \`${selNode.text.replace(/\n/g, ' ')}\`\n` +
          `• **Tipo**: \`${selNode.type}\` · **Estado**: \`${selNode.status}\`\n` +
          `• **Entradas**: ${inc}\n` +
          `• **Salidas**: ${out}\n\n` +
          `Pídeme *"expande este nodo con 2 ramas"* o *"agrega un paso después de este nodo"* para construir sobre él.`,
        actions: null
      };
    }

    // Resumen inteligente del archivo actual
    const sampleNodes = ctx.nodes
      .slice(0, 5)
      .map(n => `\`${n.text.split('\n')[0]}\``)
      .join(', ');

    return {
      cleanReply:
        `Estoy leyendo el contexto vivo de **${ctx.projectTitle}** (**${ctx.summary.totalNodes} nodos** y **${ctx.summary.totalEdges} conexiones**, **${ctx.summary.done}** completados).\n` +
        (sampleNodes ? `\nNodos principales: ${sampleNodes}${ctx.nodes.length > 5 ? '…' : ''}.\n` : '') +
        (selNode ? `\nTienes seleccionado **\`${selNode.text.split('\n')[0]}\`**.\n` : '') +
        `\nPuedes pedirme crear nodos directamente (ej. *"crea un flujo de autenticación con base de datos"*, *"añade un nodo de decisión con Sí y No"*) o pulsar **conectar** arriba para enlazar **Ollama / LM Studio en tu PC**, una **API Key** o una **URL propia**.`,
      actions: null
    };
  }

  function generateBuiltinFlowProposal(rawPrompt, q, selNode) {
    const anchorId = selNode ? selNode.id : null;

    // Caso A: Expandir nodo seleccionado o crear bifurcación Sí/No
    if (
      (q.includes('rama') || q.includes('decision') || q.includes('decisión') || q.includes('bifurca') || q.includes('expande')) &&
      selNode
    ) {
      const ops = [
        { op: 'add_node', ref: 'd1', type: 'decision', text: '¿Validación correcta?', after: anchorId },
        { op: 'add_node', ref: 'ok1', type: 'process', text: 'Continuar proceso', after: 'd1' },
        { op: 'add_node', ref: 'err1', type: 'err', text: 'Gestionar excepción', after: 'd1' },
        { op: 'add_edge', from: anchorId, to: 'd1', label: '' },
        { op: 'add_edge', from: 'd1', to: 'ok1', label: 'Sí' },
        { op: 'add_edge', from: 'd1', to: 'err1', label: 'No' }
      ];
      return {
        cleanReply: `He diseñado una bifurcación de decisión con rutas **Sí / No** conectada directamente a **\`${selNode.text.split('\n')[0]}\`**.`,
        actions: { summary: 'Rama de decisión Sí/No conectada', operations: ops }
      };
    }

    // Caso B: Flujo de login / autenticación / registro
    if (q.includes('login') || q.includes('autentic') || q.includes('sesion') || q.includes('sesión') || q.includes('registro')) {
      const ops = [
        { op: 'add_node', ref: 'a1', type: 'start', text: 'Inicio autenticación', ...(anchorId ? { after: anchorId } : {}) },
        { op: 'add_node', ref: 'a2', type: 'io', text: 'Recibir credenciales', after: 'a1' },
        { op: 'add_node', ref: 'a3', type: 'db', text: 'Verificar usuario en BD', after: 'a2' },
        { op: 'add_node', ref: 'a4', type: 'decision', text: '¿Credenciales válidas?', after: 'a3' },
        { op: 'add_node', ref: 'a5', type: 'api', text: 'Emitir token JWT', after: 'a4' },
        { op: 'add_node', ref: 'a6', type: 'err', text: 'Rechazar acceso (401)', after: 'a4' },
        { op: 'add_node', ref: 'a7', type: 'end', text: 'Sesión activa', after: 'a5' },
        ...(anchorId ? [{ op: 'add_edge', from: anchorId, to: 'a1', label: '' }] : []),
        { op: 'add_edge', from: 'a1', to: 'a2', label: '' },
        { op: 'add_edge', from: 'a2', to: 'a3', label: '' },
        { op: 'add_edge', from: 'a3', to: 'a4', label: '' },
        { op: 'add_edge', from: 'a4', to: 'a5', label: 'Sí' },
        { op: 'add_edge', from: 'a4', to: 'a6', label: 'No' },
        { op: 'add_edge', from: 'a5', to: 'a7', label: '' }
      ];
      return {
        cleanReply: 'He creado un flujo completo de **autenticación** con entrada de credenciales, consulta en base de datos, decisión condicional, emisión de JWT y control de error.',
        actions: { summary: 'Flujo de autenticación (7 nodos)', operations: ops }
      };
    }

    // Caso C: Flujo de pagos / ventas / ecommerce / pedidos
    if (q.includes('venta') || q.includes('pago') || q.includes('compra') || q.includes('pedido') || q.includes('checkout')) {
      const ops = [
        { op: 'add_node', ref: 'v1', type: 'start', text: 'Nuevo pedido', ...(anchorId ? { after: anchorId } : {}) },
        { op: 'add_node', ref: 'v2', type: 'db', text: 'Validar stock', after: 'v1' },
        { op: 'add_node', ref: 'v3', type: 'api', text: 'Pasarela de pago', after: 'v2' },
        { op: 'add_node', ref: 'v4', type: 'decision', text: '¿Pago aprobado?', after: 'v3' },
        { op: 'add_node', ref: 'v5', type: 'hook', text: 'Enviar confirmación', after: 'v4' },
        { op: 'add_node', ref: 'v6', type: 'err', text: 'Reintentar / notificar', after: 'v4' },
        { op: 'add_node', ref: 'v7', type: 'end', text: 'Orden completada', after: 'v5' },
        ...(anchorId ? [{ op: 'add_edge', from: anchorId, to: 'v1', label: '' }] : []),
        { op: 'add_edge', from: 'v1', to: 'v2', label: '' },
        { op: 'add_edge', from: 'v2', to: 'v3', label: '' },
        { op: 'add_edge', from: 'v3', to: 'v4', label: '' },
        { op: 'add_edge', from: 'v4', to: 'v5', label: 'Aprobado' },
        { op: 'add_edge', from: 'v4', to: 'v6', label: 'Falló' },
        { op: 'add_edge', from: 'v5', to: 'v7', label: '' }
      ];
      return {
        cleanReply: 'He armado un flujo de **procesamiento de ventas y pagos** con verificación de inventario, pasarela API, validación de cobro y webhook de confirmación.',
        actions: { summary: 'Flujo de ventas y pagos (7 nodos)', operations: ops }
      };
    }

    // Caso D: Nodo único específico (ej. "agrega un nodo de métricas" / "añade nodo base de datos...")
    if (q.includes('metrica') || q.includes('métrica') || q.includes('grafico') || q.includes('gráfico') || q.includes('kpi')) {
      let mType = 'metrics';
      if (q.includes('barra')) mType = 'chart_bar';
      else if (q.includes('linea') || q.includes('línea')) mType = 'chart_line';
      else if (q.includes('donut')) mType = 'chart_donut';
      else if (q.includes('gauge')) mType = 'chart_gauge';
      else if (q.includes('funnel') || q.includes('embudo')) mType = 'chart_funnel';

      const lastNode = anchorId || (STATE.nodes.length ? STATE.nodes[STATE.nodes.length - 1].id : null);
      const ops = [
        { op: 'add_node', ref: 'm1', type: mType, text: 'Panel KPIs del flujo', ...(lastNode ? { after: lastNode } : {}) },
        ...(lastNode ? [{ op: 'add_edge', from: lastNode, to: 'm1', label: 'métricas' }] : [])
      ];
      return {
        cleanReply: `He añadido un nodo visual **\`${CONFIG.NODE_TYPES[mType] || mType}\`** conectado a tu flujo para monitorear indicadores clave.`,
        actions: { summary: `Añadir ${CONFIG.NODE_TYPES[mType] || mType}`, operations: ops }
      };
    }

    // Caso E: Extraer lista separada por comas o pasos personalizados del texto del usuario
    const colonParts = rawPrompt.split(/[:：]/);
    if (colonParts.length > 1) {
      const steps = colonParts
        .slice(1)
        .join(':')
        .split(/[,;→>-]+/)
        .map(s => s.trim())
        .filter(Boolean);
      if (steps.length >= 2) {
        const ops = [];
        steps.forEach((stepText, idx) => {
          const ref = 's' + (idx + 1);
          const inferredType =
            idx === 0 && !anchorId
              ? 'start'
              : idx === steps.length - 1
                ? 'end'
                : stepText.includes('?')
                  ? 'decision'
                  : 'process';
          ops.push({
            op: 'add_node',
            ref,
            type: inferredType,
            text: stepText,
            after: idx === 0 ? anchorId : 's' + idx
          });
          if (idx === 0 && anchorId) {
            ops.push({ op: 'add_edge', from: anchorId, to: ref, label: '' });
          } else if (idx > 0) {
            ops.push({ op: 'add_edge', from: 's' + idx, to: ref, label: '' });
          }
        });
        return {
          cleanReply: `He generado una secuencia conectada con los **${steps.length} pasos** que indicaste.`,
          actions: { summary: `Secuencia de ${steps.length} pasos`, operations: ops }
        };
      }
    }

    // Caso F: Creación genérica de nodo o subflujo basado en la descripción del usuario
    const cleanedTopic = rawPrompt
      .replace(/^(por favor\s+)?(crea|crear|genera|generar|agrega|agregar|añade|añadir|anade|haz|hacer|un|una|el|la|flujo de|nodo de|proceso de)\s+/gi, '')
      .trim() || 'Nuevo proceso';

    let singleNodeType = 'process';
    if (q.includes('ia') || q.includes('agente') || q.includes('llm')) singleNodeType = 'ai';
    else if (q.includes('base de datos') || q.includes('bd') || q.includes('sql')) singleNodeType = 'db';
    else if (q.includes('api') || q.includes('endpoint') || q.includes('http')) singleNodeType = 'api';
    else if (q.includes('webhook')) singleNodeType = 'hook';

    if (q.includes('nodo')) {
      const parentId = anchorId || (STATE.nodes.length ? STATE.nodes[STATE.nodes.length - 1].id : null);
      const ops = [
        {
          op: 'add_node',
          ref: 'u1',
          type: singleNodeType,
          text: cleanedTopic.slice(0, 48),
          ...(parentId ? { after: parentId } : {})
        },
        ...(parentId ? [{ op: 'add_edge', from: parentId, to: 'u1', label: '' }] : [])
      ];
      return {
        cleanReply: `He creado el nodo **\`${cleanedTopic.slice(0, 48)}\`** (${CONFIG.NODE_TYPES[singleNodeType]}) en tu lienzo.`,
        actions: { summary: `Nodo "${cleanedTopic.slice(0, 28)}"`, operations: ops }
      };
    }

    // Subflujo estructurado de 5 pasos sobre la temática pedida
    const titleShort = cleanedTopic.slice(0, 32);
    const ops = [
      { op: 'add_node', ref: 'g1', type: 'start', text: `Inicio: ${titleShort}`, ...(anchorId ? { after: anchorId } : {}) },
      { op: 'add_node', ref: 'g2', type: 'io', text: 'Entrada y preparación', after: 'g1' },
      { op: 'add_node', ref: 'g3', type: singleNodeType, text: `Ejecutar ${titleShort}`, after: 'g2' },
      { op: 'add_node', ref: 'g4', type: 'decision', text: '¿Resultado válido?', after: 'g3' },
      { op: 'add_node', ref: 'g5', type: 'end', text: 'Proceso completado', after: 'g4' },
      ...(anchorId ? [{ op: 'add_edge', from: anchorId, to: 'g1', label: '' }] : []),
      { op: 'add_edge', from: 'g1', to: 'g2', label: '' },
      { op: 'add_edge', from: 'g2', to: 'g3', label: '' },
      { op: 'add_edge', from: 'g3', to: 'g4', label: '' },
      { op: 'add_edge', from: 'g4', to: 'g5', label: 'OK' }
    ];

    return {
      cleanReply:
        `He estructurado un flujo base para **${cleanedTopic}** con nodos de inicio, entrada, procesamiento, validación y cierre.\n\n` +
        `*(Tip: conecta **Ollama / LM Studio** en tu PC o tu **API Key / URL** desde el botón **conectar** para respuestas generativas abiertas con cualquier LLM).*`,
      actions: { summary: `Flujo: ${titleShort} (5 nodos)`, operations: ops }
    };
  }

  // =========================================================================
  // CLIENTES HTTP: LOCAL (OLLAMA / LM STUDIO) · CLOUD API · CUSTOM URL
  // =========================================================================
  function buildConversationMessages(userText) {
    const sysPrompt = buildSystemPrompt();
    const recentHistory = messages
      .filter(m => (m.role === 'user' || m.role === 'assistant') && !m.isError)
      .slice(-10)
      .map(m => ({
        role: m.role,
        content: m.rawModelText || m.content
      }));

    return [
      { role: 'system', content: sysPrompt },
      ...recentHistory,
      { role: 'user', content: userText }
    ];
  }

  async function callExternalAI(userText, signal) {
    const mode = aiConfig.mode;
    if (mode === 'builtin') {
      await new Promise(r => setTimeout(r, 260));
      return runBuiltinAssistant(userText);
    }

    const chatMsgs = buildConversationMessages(userText);

    if (mode === 'local') {
      return await callLocalProvider(chatMsgs, signal);
    }

    if (mode === 'api') {
      return await callCloudProvider(chatMsgs, signal);
    }

    if (mode === 'url') {
      return await callCustomUrlProvider(userText, chatMsgs, signal);
    }

    return runBuiltinAssistant(userText);
  }

  async function callLocalProvider(chatMsgs, signal) {
    const endpoint = (aiConfig.local.url || LOCAL_PRESETS.ollama.url).trim();
    const model = (aiConfig.local.model || 'qwen2.5-coder:7b').trim();

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model,
          messages: chatMsgs,
          temperature: 0.35,
          stream: false
        }),
        signal
      });

      // Fallback automático al endpoint nativo de Ollama (/api/chat) si /v1/chat/completions da 404
      if (res.status === 404 && endpoint.includes('11434')) {
        const origin = new URL(endpoint).origin;
        const nativeRes = await fetch(origin + '/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ model, messages: chatMsgs, stream: false }),
          signal
        });
        if (!nativeRes.ok) {
          throw new Error(`Ollama respondió HTTP ${nativeRes.status}`);
        }
        const nativeJson = await nativeRes.json();
        return extractActionsFromReply(nativeJson?.message?.content || '');
      }

      if (!res.ok) {
        const errBody = await res.text().catch(() => '');
        throw new Error(`Servidor local respondió HTTP ${res.status}${errBody ? ': ' + errBody.slice(0, 140) : ''}`);
      }

      const data = await res.json();
      const text =
        data?.choices?.[0]?.message?.content ||
        data?.message?.content ||
        data?.response ||
        '';
      return extractActionsFromReply(text);
    } catch (err) {
      if (err.name === 'AbortError') throw err;
      const isHttpsPage = window.location.protocol === 'https:';
      throw new Error(
        `No se pudo conectar con tu IA local en ${endpoint}.\n` +
          `• Verifica que el servidor local (Ollama / LM Studio) esté encendido y el modelo "${model}" descargado.\n` +
          (isHttpsPage
            ? `• Como abriste la web desde HTTPS, habilita CORS en tu IA local (en Ollama ejecuta: OLLAMA_ORIGINS="*" ollama serve; en LM Studio activa "Enable CORS" en Local Server).`
            : `• En Ollama puedes permitir orígenes con: OLLAMA_ORIGINS="*" ollama serve.`)
      );
    }
  }

  async function callCloudProvider(chatMsgs, signal) {
    const providerKey = aiConfig.api.provider || 'openai';
    const prov = CLOUD_PROVIDERS[providerKey] || CLOUD_PROVIDERS.openai;
    const apiKey = (aiConfig.api.apiKey || '').trim();
    const model = (aiConfig.api.model || prov.defaultModel).trim();

    if (!apiKey) {
      throw new Error(`Ingresa tu API Key de ${prov.name} en el panel "conectar".`);
    }

    // Google Gemini REST API directa (compatible con CORS desde navegador)
    if (providerKey === 'gemini') {
      const sysMsg = chatMsgs.find(m => m.role === 'system')?.content || '';
      const contents = chatMsgs
        .filter(m => m.role !== 'system')
        .map(m => ({
          role: m.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: m.content }]
        }));

      const url = `${prov.url}/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: sysMsg }] },
          contents,
          generationConfig: { temperature: 0.35 }
        }),
        signal
      });
      if (!res.ok) {
        const errTxt = await res.text().catch(() => '');
        throw new Error(`Gemini API HTTP ${res.status}: ${errTxt.slice(0, 160)}`);
      }
      const data = await res.json();
      const replyText =
        data?.candidates?.[0]?.content?.parts?.map(p => p.text || '').join('') || '';
      return extractActionsFromReply(replyText);
    }

    // Anthropic Claude Messages API (acceso directo desde navegador)
    if (providerKey === 'anthropic') {
      const sysMsg = chatMsgs.find(m => m.role === 'system')?.content || '';
      const userAssistantMsgs = chatMsgs
        .filter(m => m.role !== 'system')
        .map(m => ({ role: m.role, content: m.content }));

      const res = await fetch(prov.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true'
        },
        body: JSON.stringify({
          model,
          max_tokens: 2048,
          system: sysMsg,
          messages: userAssistantMsgs
        }),
        signal
      });
      if (!res.ok) {
        const errTxt = await res.text().catch(() => '');
        throw new Error(`Claude API HTTP ${res.status}: ${errTxt.slice(0, 160)}`);
      }
      const data = await res.json();
      const replyText = (data?.content || []).map(c => c.text || '').join('');
      return extractActionsFromReply(replyText);
    }

    // Proveedores compatibles con OpenAI (OpenAI, OpenRouter, Groq, DeepSeek)
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`
    };
    if (providerKey === 'openrouter') {
      headers['HTTP-Referer'] = window.location.origin;
      headers['X-Title'] = 'FlowLab paginaRE';
    }

    const res = await fetch(prov.url, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model,
        messages: chatMsgs,
        temperature: 0.35
      }),
      signal
    });

    if (!res.ok) {
      const errTxt = await res.text().catch(() => '');
      throw new Error(`${prov.name} HTTP ${res.status}: ${errTxt.slice(0, 160)}`);
    }

    const data = await res.json();
    const replyText = data?.choices?.[0]?.message?.content || '';
    return extractActionsFromReply(replyText);
  }

  async function callCustomUrlProvider(userText, chatMsgs, signal) {
    const endpoint = (aiConfig.url.endpoint || '').trim();
    if (!endpoint) {
      throw new Error('Ingresa la URL del endpoint o servidor en el panel "conectar".');
    }

    const headers = { 'Content-Type': 'application/json' };
    if (aiConfig.url.apiKey && aiConfig.url.apiKey.trim()) {
      headers.Authorization = `Bearer ${aiConfig.url.apiKey.trim()}`;
    }

    let bodyPayload;
    if (aiConfig.url.format === 'webhook') {
      bodyPayload = {
        message: userText,
        systemPrompt: buildSystemPrompt(),
        context: aiConfig.includeContext ? buildWorkspaceContext() : null,
        history: chatMsgs.filter(m => m.role !== 'system')
      };
    } else {
      bodyPayload = {
        model: (aiConfig.url.model || 'default').trim(),
        messages: chatMsgs,
        temperature: 0.35,
        stream: false
      };
    }

    const res = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify(bodyPayload),
      signal
    });

    if (!res.ok) {
      const errTxt = await res.text().catch(() => '');
      throw new Error(`Endpoint URL respondió HTTP ${res.status}: ${errTxt.slice(0, 150)}`);
    }

    const data = await res.json();
    const rawReply =
      data?.choices?.[0]?.message?.content ||
      data?.message?.content ||
      data?.reply ||
      data?.response ||
      data?.output ||
      data?.text ||
      (typeof data?.content === 'string' ? data.content : '');

    const extracted = extractActionsFromReply(rawReply);
    if (!extracted.actions && (Array.isArray(data?.operations) || Array.isArray(data?.nodes))) {
      extracted.actions = tryParseActionPayload(JSON.stringify(data));
    }
    return extracted;
  }

  // =========================================================================
  // DETECCIÓN DE MODELOS LOCALES Y TEST DE CONEXIÓN
  // =========================================================================
  async function detectLocalModels() {
    const statusEl = document.getElementById('aiTestStatus');
    const chipsWrap = document.getElementById('aiDetectedModels');
    const urlInput = document.getElementById('aiLocalUrl');
    const rawUrl = (urlInput?.value || aiConfig.local.url || LOCAL_PRESETS.ollama.url).trim();

    if (statusEl) {
      statusEl.className = 'ai-test-status is-pending';
      statusEl.textContent = '◌ Buscando modelos en tu PC...';
    }
    if (chipsWrap) chipsWrap.innerHTML = '';

    let origin;
    try {
      origin = new URL(rawUrl).origin;
    } catch {
      if (statusEl) {
        statusEl.className = 'ai-test-status is-err';
        statusEl.textContent = '✕ URL local inválida.';
      }
      return;
    }

    const foundModels = [];

    // 1. Intentar /api/tags (Ollama)
    try {
      const r1 = await fetch(origin + '/api/tags', { method: 'GET' });
      if (r1.ok) {
        const j1 = await r1.json();
        if (Array.isArray(j1?.models)) {
          j1.models.forEach(m => {
            if (m?.name && !foundModels.includes(m.name)) foundModels.push(m.name);
          });
        }
      }
    } catch {}

    // 2. Intentar /v1/models (LM Studio, Jan, llama.cpp, LocalAI, Ollama reciente)
    try {
      const r2 = await fetch(origin + '/v1/models', { method: 'GET' });
      if (r2.ok) {
        const j2 = await r2.json();
        if (Array.isArray(j2?.data)) {
          j2.data.forEach(m => {
            if (m?.id && !foundModels.includes(m.id)) foundModels.push(m.id);
          });
        }
      }
    } catch {}

    if (foundModels.length === 0) {
      if (statusEl) {
        statusEl.className = 'ai-test-status is-err';
        statusEl.textContent =
          window.location.protocol === 'https:'
            ? '✕ Sin respuesta local. Enciende Ollama/LM Studio y activa CORS (OLLAMA_ORIGINS="*").'
            : '✕ No se detectó servidor activo en ' + origin;
      }
      return;
    }

    const modelInput = document.getElementById('aiLocalModel');
    if (modelInput && foundModels[0]) {
      modelInput.value = foundModels[0];
    }

    if (statusEl) {
      statusEl.className = 'ai-test-status is-ok';
      statusEl.textContent = `✓ ${foundModels.length} modelo(s) detectado(s) en tu equipo`;
    }

    if (chipsWrap) {
      chipsWrap.innerHTML = foundModels
        .slice(0, 10)
        .map(
          name =>
            `<button type="button" class="ai-model-chip" data-model="${escapeHTML(name)}">${escapeHTML(name)}</button>`
        )
        .join('');

      chipsWrap.querySelectorAll('.ai-model-chip').forEach(btn => {
        btn.addEventListener('click', () => {
          if (modelInput) modelInput.value = btn.dataset.model;
          chipsWrap.querySelectorAll('.ai-model-chip').forEach(b => b.classList.remove('is-selected'));
          btn.classList.add('is-selected');
        });
      });
    }
  }

  async function testCurrentConnection() {
    readConfigFormIntoState(false);
    const statusEl = document.getElementById('aiTestStatus');
    if (!statusEl) return;

    if (editingModeTab === 'builtin') {
      statusEl.className = 'ai-test-status is-ok';
      statusEl.textContent = '✓ Motor integrado listo (no requiere conexión externa)';
      return;
    }

    statusEl.className = 'ai-test-status is-pending';
    statusEl.textContent = '◌ Probando conexión...';

    const prevMode = aiConfig.mode;
    aiConfig.mode = editingModeTab;
    const t0 = performance.now();

    try {
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), 12000);
      await callExternalAI('Responde únicamente con la palabra OK.', ctrl.signal);
      clearTimeout(timer);
      const ms = Math.round(performance.now() - t0);
      statusEl.className = 'ai-test-status is-ok';
      statusEl.textContent = `✓ Conexión exitosa (${ms} ms)`;
    } catch (err) {
      statusEl.className = 'ai-test-status is-err';
      statusEl.textContent = '✕ ' + (err.message || 'Error al conectar').split('\n')[0];
    } finally {
      aiConfig.mode = prevMode;
    }
  }

  // =========================================================================
  // INTERFAZ DE USUARIO DEL PANEL LATERAL IA
  // =========================================================================
  function getActiveProviderSummary() {
    if (aiConfig.mode === 'local') {
      const preset = LOCAL_PRESETS[aiConfig.local.preset];
      const label = preset ? preset.name.replace(' (Local)', '') : 'IA Local';
      const mod = aiConfig.local.model ? ` · ${aiConfig.local.model}` : '';
      return { connected: true, text: `${label}${mod}` };
    }
    if (aiConfig.mode === 'api') {
      const prov = CLOUD_PROVIDERS[aiConfig.api.provider] || CLOUD_PROVIDERS.openai;
      const hasKey = Boolean(aiConfig.api.apiKey && aiConfig.api.apiKey.trim());
      return {
        connected: hasKey,
        text: hasKey ? `${prov.name} · ${aiConfig.api.model}` : `${prov.name} (falta key)`
      };
    }
    if (aiConfig.mode === 'url') {
      const hasUrl = Boolean(aiConfig.url.endpoint && aiConfig.url.endpoint.trim());
      let host = 'URL personalizada';
      try {
        host = new URL(aiConfig.url.endpoint).host || host;
      } catch {}
      return { connected: hasUrl, text: hasUrl ? `URL · ${host}` : 'URL (sin configurar)' };
    }
    return { connected: false, text: 'Asistente integrado' };
  }

  function updateProviderHeaderUI() {
    const info = getActiveProviderSummary();
    const lbl = document.getElementById('aiProviderLabel');
    const dot = document.getElementById('aiProviderDot');
    const tabDot = document.getElementById('aiTabDot');

    if (lbl) lbl.textContent = info.text;
    if (dot) dot.classList.toggle('is-live', info.connected);
    if (tabDot) tabDot.classList.toggle('is-live', info.connected);
  }

  function updateAIChatContextUI() {
    const ctxBtn = document.getElementById('btnAiToggleCtx');
    const ctxSum = document.getElementById('aiCtxSummary');
    const selBadge = document.getElementById('aiSelBadge');
    const autoBtn = document.getElementById('btnAiAutoApply');

    if (ctxBtn) ctxBtn.classList.toggle('is-active', aiConfig.includeContext);
    if (autoBtn) autoBtn.classList.toggle('is-active', aiConfig.autoApply);

    if (ctxSum) {
      const nCount = (STATE.nodes || []).length;
      const eCount = (STATE.edges || []).length;
      ctxSum.textContent = aiConfig.includeContext
        ? `contexto: ${nCount}n · ${eCount}c`
        : 'contexto: off';
    }

    if (selBadge) {
      if (STATE.sel && STATE.sel.kind === 'node') {
        const sn = byId(STATE.sel.id);
        if (sn) {
          const shortTxt = sn.text.split('\n')[0].slice(0, 18);
          selBadge.textContent = `🎯 ${shortTxt}`;
          selBadge.title = `Nodo en foco: ${sn.text.replace(/\n/g, ' ')}`;
          selBadge.hidden = false;
          return;
        }
      }
      selBadge.hidden = true;
    }
  }

  function formatAssistantMarkdown(rawText) {
    const safe = escapeHTML(rawText || '');
    return safe
      .replace(/`([^`\n]+)`/g, '<code class="ai-inline-code">$1</code>')
      .replace(/\*\*([^*\n]+)\*\*/g, '<strong>$1</strong>')
      .replace(/\*([^*\n]+)\*/g, '<em>$1</em>')
      .replace(/\n/g, '<br>');
  }

  function renderAIMessages() {
    const container = document.getElementById('aiMessages');
    if (!container) return;

    if (messages.length === 0) {
      container.innerHTML = `
        <div class="ai-welcome">
          <div class="ai-welcome-badge">✦ copiloto del lienzo</div>
          <h4>Habla con tu flujo y crea nodos</h4>
          <p>Tengo contexto en vivo del proyecto abierto. Conecta <b>Ollama / LM Studio</b> en tu PC, una <b>API Key</b> o una <b>URL</b>, o usa las acciones rápidas:</p>
          <div class="ai-quick-grid">
            <button type="button" class="ai-quick-btn" data-prompt="Analiza el flujo actual, resume su arquitectura y dime si hay bloqueos o mejoras.">
              <span class="ai-quick-icon">🔍</span>
              <span>Analizar este archivo</span>
            </button>
            <button type="button" class="ai-quick-btn" data-prompt="Crea un flujo de autenticación con recepción de credenciales, base de datos, decisión y emisión de token.">
              <span class="ai-quick-icon">➕</span>
              <span>Crear flujo de login</span>
            </button>
            <button type="button" class="ai-quick-btn" data-prompt="Expande el nodo seleccionado con una decisión Sí y No conectada.">
              <span class="ai-quick-icon">🌿</span>
              <span>Expandir con Sí / No</span>
            </button>
            <button type="button" class="ai-quick-btn" data-prompt="Agrega un nodo de métricas KPI conectado al flujo.">
              <span class="ai-quick-icon">📊</span>
              <span>Añadir nodo de métricas</span>
            </button>
          </div>
        </div>
      `;

      container.querySelectorAll('.ai-quick-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          sendAIChatMessage(btn.dataset.prompt);
        });
      });
      return;
    }

    container.innerHTML = messages
      .map((msg, idx) => {
        if (msg.role === 'user') {
          return `
            <div class="ai-msg ai-msg--user">
              <div class="ai-bubble ai-bubble--user">${escapeHTML(msg.content).replace(/\n/g, '<br>')}</div>
            </div>
          `;
        }

        let actionCardHtml = '';
        if (msg.actions && Array.isArray(msg.actions.operations) && msg.actions.operations.length > 0) {
          const previewOps = msg.actions.operations
            .filter(o => o.op === 'add_node' || o.op === 'update_node')
            .slice(0, 5)
            .map(
              o =>
                `<div class="ai-op-row"><span class="ai-op-tag">${escapeHTML(normalizeNodeType(o.type))}</span><span>${escapeHTML(o.text || o.id || '')}</span></div>`
            )
            .join('');

          if (msg.applied) {
            actionCardHtml = `
              <div class="ai-action-card is-applied">
                <div class="ai-action-head">
                  <span class="ai-action-title">✓ ${escapeHTML(msg.appliedSummary || msg.actions.summary || 'Aplicado al lienzo')}</span>
                </div>
                ${previewOps ? `<div class="ai-op-list">${previewOps}</div>` : ''}
                <div class="ai-action-btns">
                  ${
                    msg.createdNodeIds && msg.createdNodeIds.length
                      ? `<button type="button" class="ai-card-btn" data-focus-idx="${idx}">⌖ enfocar</button>`
                      : ''
                  }
                  <button type="button" class="ai-card-btn" data-undo-idx="${idx}">↶ deshacer</button>
                </div>
              </div>
            `;
          } else {
            actionCardHtml = `
              <div class="ai-action-card">
                <div class="ai-action-head">
                  <span class="ai-action-title">✦ ${escapeHTML(msg.actions.summary || 'Propuesta de nodos')}</span>
                </div>
                ${previewOps ? `<div class="ai-op-list">${previewOps}</div>` : ''}
                <div class="ai-action-btns">
                  <button type="button" class="ai-card-btn is-primary" data-apply-idx="${idx}">+ crear en el lienzo</button>
                </div>
              </div>
            `;
          }
        }

        return `
          <div class="ai-msg ai-msg--assistant ${msg.isError ? 'is-error' : ''}">
            <div class="ai-msg-meta">${escapeHTML(msg.providerTag || 'IA')}</div>
            <div class="ai-bubble ai-bubble--assistant">
              <div class="ai-bubble-text">${formatAssistantMarkdown(msg.content)}</div>
              ${actionCardHtml}
            </div>
          </div>
        `;
      })
      .join('');

    if (isGenerating) {
      const thinkingEl = document.createElement('div');
      thinkingEl.className = 'ai-msg ai-msg--assistant';
      thinkingEl.innerHTML = `
        <div class="ai-bubble ai-bubble--assistant ai-typing">
          <span class="ai-typing-dots"><i></i><i></i><i></i></span>
          <span>analizando contexto del flujo...</span>
        </div>
      `;
      container.appendChild(thinkingEl);
    }

    // Bind botones de tarjetas de acción
    container.querySelectorAll('[data-apply-idx]').forEach(btn => {
      btn.addEventListener('click', () => {
        const m = messages[Number(btn.dataset.applyIdx)];
        if (!m || !m.actions) return;
        const res = applyAIGraphActions(m.actions);
        m.applied = true;
        m.createdNodeIds = res.addedNodes.map(n => n.id);
        m.appliedSummary = `${res.addedNodes.length} nodo(s) · ${res.addedEdges.length} conexión(es)`;
        updateAIChatContextUI();
        renderAIMessages();
      });
    });

    container.querySelectorAll('[data-focus-idx]').forEach(btn => {
      btn.addEventListener('click', () => {
        const m = messages[Number(btn.dataset.focusIdx)];
        if (m && m.createdNodeIds) focusNodesOnCanvas(m.createdNodeIds);
      });
    });

    container.querySelectorAll('[data-undo-idx]').forEach(btn => {
      btn.addEventListener('click', () => {
        if (typeof undo === 'function') {
          undo();
          const m = messages[Number(btn.dataset.undoIdx)];
          if (m) m.applied = false;
          updateAIChatContextUI();
          renderAIMessages();
          showToast('Cambios de IA deshechos', 'info', 1600);
        }
      });
    });

    container.scrollTop = container.scrollHeight;
  }

  async function sendAIChatMessage(rawInput) {
    const text = String(rawInput || '').trim();
    if (!text || isGenerating) return;

    const inputEl = document.getElementById('aiChatInput');
    if (inputEl && inputEl.value.trim() === text) {
      inputEl.value = '';
    }

    messages.push({
      role: 'user',
      content: text,
      timestamp: Date.now()
    });

    isGenerating = true;
    currentAbort = new AbortController();
    toggleGeneratingControls(true);
    renderAIMessages();

    const provSummary = getActiveProviderSummary();

    try {
      const result = await callExternalAI(text, currentAbort.signal);
      const assistantMsg = {
        role: 'assistant',
        content: result.cleanReply,
        rawModelText: result.cleanReply,
        actions: result.actions,
        applied: false,
        createdNodeIds: [],
        providerTag: provSummary.text,
        timestamp: Date.now()
      };

      if (
        result.actions &&
        Array.isArray(result.actions.operations) &&
        result.actions.operations.length > 0 &&
        aiConfig.autoApply
      ) {
        const applied = applyAIGraphActions(result.actions);
        assistantMsg.applied = true;
        assistantMsg.createdNodeIds = applied.addedNodes.map(n => n.id);
        assistantMsg.appliedSummary =
          `${applied.addedNodes.length} nodo(s) · ${applied.addedEdges.length} conexión(es)` +
          (applied.updatedCount ? ` · ${applied.updatedCount} editado(s)` : '');
      }

      messages.push(assistantMsg);
    } catch (err) {
      if (err.name === 'AbortError') {
        messages.push({
          role: 'assistant',
          content: 'Generación detenida.',
          isError: true,
          providerTag: provSummary.text,
          timestamp: Date.now()
        });
      } else {
        messages.push({
          role: 'assistant',
          content: err.message || 'Ocurrió un error al consultar el proveedor de IA.',
          isError: true,
          providerTag: provSummary.text,
          timestamp: Date.now()
        });
      }
    } finally {
      isGenerating = false;
      currentAbort = null;
      toggleGeneratingControls(false);
      updateAIChatContextUI();
      renderAIMessages();
    }
  }

  function toggleGeneratingControls(busy) {
    const stopBtn = document.getElementById('btnAiStop');
    const sendBtn = document.getElementById('btnAiSend');
    if (stopBtn) stopBtn.hidden = !busy;
    if (sendBtn) sendBtn.disabled = busy;
  }

  // =========================================================================
  // FORMULARIO DE CONFIGURACIÓN (LOCAL PC · API KEY · URL · INTEGRADO)
  // =========================================================================
  function syncConfigFormFromState() {
    editingModeTab = aiConfig.mode;
    switchConfigModeTab(editingModeTab);

    const localPreset = document.getElementById('aiLocalPreset');
    const localUrl = document.getElementById('aiLocalUrl');
    const localModel = document.getElementById('aiLocalModel');
    if (localPreset) localPreset.value = aiConfig.local.preset || 'ollama';
    if (localUrl) localUrl.value = aiConfig.local.url || LOCAL_PRESETS.ollama.url;
    if (localModel) localModel.value = aiConfig.local.model || LOCAL_PRESETS.ollama.defaultModel;

    const cloudProv = document.getElementById('aiCloudProvider');
    const cloudKey = document.getElementById('aiCloudKey');
    const cloudModel = document.getElementById('aiCloudModel');
    if (cloudProv) cloudProv.value = aiConfig.api.provider || 'openai';
    if (cloudKey) cloudKey.value = aiConfig.api.apiKey || '';
    if (cloudModel) cloudModel.value = aiConfig.api.model || CLOUD_PROVIDERS.openai.defaultModel;

    const customUrl = document.getElementById('aiCustomUrl');
    const customFmt = document.getElementById('aiCustomFormat');
    const customKey = document.getElementById('aiCustomKey');
    const customModel = document.getElementById('aiCustomModel');
    if (customUrl) customUrl.value = aiConfig.url.endpoint || '';
    if (customFmt) customFmt.value = aiConfig.url.format || 'openai';
    if (customKey) customKey.value = aiConfig.url.apiKey || '';
    if (customModel) customModel.value = aiConfig.url.model || '';
  }

  function readConfigFormIntoState(commitActiveMode = true) {
    if (commitActiveMode) {
      aiConfig.mode = editingModeTab;
    }

    const localPreset = document.getElementById('aiLocalPreset');
    const localUrl = document.getElementById('aiLocalUrl');
    const localModel = document.getElementById('aiLocalModel');
    if (localPreset) aiConfig.local.preset = localPreset.value;
    if (localUrl) aiConfig.local.url = localUrl.value.trim();
    if (localModel) aiConfig.local.model = localModel.value.trim();

    const cloudProv = document.getElementById('aiCloudProvider');
    const cloudKey = document.getElementById('aiCloudKey');
    const cloudModel = document.getElementById('aiCloudModel');
    if (cloudProv) aiConfig.api.provider = cloudProv.value;
    if (cloudKey) aiConfig.api.apiKey = cloudKey.value.trim();
    if (cloudModel) aiConfig.api.model = cloudModel.value.trim();

    const customUrl = document.getElementById('aiCustomUrl');
    const customFmt = document.getElementById('aiCustomFormat');
    const customKey = document.getElementById('aiCustomKey');
    const customModel = document.getElementById('aiCustomModel');
    if (customUrl) aiConfig.url.endpoint = customUrl.value.trim();
    if (customFmt) aiConfig.url.format = customFmt.value;
    if (customKey) aiConfig.url.apiKey = customKey.value.trim();
    if (customModel) aiConfig.url.model = customModel.value.trim();
  }

  function switchConfigModeTab(mode) {
    editingModeTab = mode;
    document.querySelectorAll('[data-ai-mode-tab]').forEach(btn => {
      btn.classList.toggle('is-active', btn.dataset.aiModeTab === mode);
    });
    document.querySelectorAll('[data-ai-mode-pane]').forEach(pane => {
      pane.hidden = pane.dataset.aiModePane !== mode;
    });
    const statusEl = document.getElementById('aiTestStatus');
    if (statusEl) {
      statusEl.textContent = '';
      statusEl.className = 'ai-test-status';
    }
  }

  function toggleConfigDrawer(forceState) {
    const drawer = document.getElementById('aiConfigDrawer');
    const btn = document.getElementById('btnAiConfig');
    if (!drawer) return;

    const nextOpen = typeof forceState === 'boolean' ? forceState : drawer.hidden;
    drawer.hidden = !nextOpen;
    if (btn) btn.classList.toggle('is-active', nextOpen);
    if (nextOpen) {
      syncConfigFormFromState();
    }
  }

  function openAISidebarTab(openConfig = false) {
    const panelEl = document.getElementById('rightPanel') || document.querySelector('aside.panel');
    if (panelEl && window.matchMedia('(max-width: 980px)').matches) {
      panelEl.classList.add('mobile-open');
    }

    if (typeof switchRightPanelTab === 'function') {
      switchRightPanelTab('ai');
    }

    if (openConfig) {
      toggleConfigDrawer(true);
    } else {
      setTimeout(() => {
        document.getElementById('aiChatInput')?.focus();
      }, 40);
    }
  }

  function initAIAssistant() {
    updateProviderHeaderUI();
    updateAIChatContextUI();
    renderAIMessages();

    document.getElementById('btnAiConfig')?.addEventListener('click', () => toggleConfigDrawer());
    document.getElementById('btnAiProviderPill')?.addEventListener('click', () => toggleConfigDrawer());

    document.getElementById('btnAiClear')?.addEventListener('click', () => {
      messages = [];
      renderAIMessages();
      showToast('Conversación limpiada', 'info', 1400);
    });

    document.querySelectorAll('[data-ai-mode-tab]').forEach(btn => {
      btn.addEventListener('click', () => switchConfigModeTab(btn.dataset.aiModeTab));
    });

    // Cambios de preset en modo Local PC
    document.getElementById('aiLocalPreset')?.addEventListener('change', e => {
      const p = LOCAL_PRESETS[e.target.value];
      if (!p) return;
      const urlEl = document.getElementById('aiLocalUrl');
      const modEl = document.getElementById('aiLocalModel');
      if (urlEl) urlEl.value = p.url;
      if (modEl) modEl.value = p.defaultModel;
    });

    // Cambios de proveedor en modo Cloud API
    document.getElementById('aiCloudProvider')?.addEventListener('change', e => {
      const p = CLOUD_PROVIDERS[e.target.value];
      if (!p) return;
      const modEl = document.getElementById('aiCloudModel');
      const keyEl = document.getElementById('aiCloudKey');
      if (modEl) modEl.value = p.defaultModel;
      if (keyEl) keyEl.placeholder = p.placeholderKey;
    });

    // Mostrar/ocultar API Key
    document.getElementById('btnToggleKeyVis')?.addEventListener('click', () => {
      const keyEl = document.getElementById('aiCloudKey');
      if (!keyEl) return;
      keyEl.type = keyEl.type === 'password' ? 'text' : 'password';
    });

    document.getElementById('btnDetectLocalModels')?.addEventListener('click', detectLocalModels);
    document.getElementById('btnAiTest')?.addEventListener('click', testCurrentConnection);

    document.getElementById('btnAiSaveConfig')?.addEventListener('click', () => {
      readConfigFormIntoState(true);
      saveAIConfig();
      toggleConfigDrawer(false);
      showToast('Conexión IA actualizada: ' + getActiveProviderSummary().text, 'ok', 2000);
    });

    document.getElementById('btnAiToggleCtx')?.addEventListener('click', () => {
      aiConfig.includeContext = !aiConfig.includeContext;
      saveAIConfig();
      updateAIChatContextUI();
    });

    document.getElementById('btnAiAutoApply')?.addEventListener('click', () => {
      aiConfig.autoApply = !aiConfig.autoApply;
      saveAIConfig();
      updateAIChatContextUI();
    });

    document.getElementById('btnAiSend')?.addEventListener('click', () => {
      const inputEl = document.getElementById('aiChatInput');
      if (inputEl) sendAIChatMessage(inputEl.value);
    });

    document.getElementById('btnAiStop')?.addEventListener('click', () => {
      if (currentAbort) currentAbort.abort();
    });

    const inputEl = document.getElementById('aiChatInput');
    if (inputEl) {
      inputEl.addEventListener('keydown', e => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          sendAIChatMessage(inputEl.value);
        }
      });
    }

    document.getElementById('btnCloseRightPanel')?.addEventListener('click', () => {
      document.getElementById('rightPanel')?.classList.remove('mobile-open');
    });
  }

  window.initAIAssistant = initAIAssistant;
  window.openAISidebarTab = openAISidebarTab;
  window.updateAIChatContextUI = updateAIChatContextUI;
  window.sendAIChatMessage = sendAIChatMessage;
})();
