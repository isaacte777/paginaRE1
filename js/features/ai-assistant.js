// AI ASSISTANT: Chat con IA en barra lateral con contexto vivo del proyecto,
// creación inteligente de nodos y conexión vía Local (PC/Laptop), API Key o URL.

(function () {
  const STORAGE_KEY = 'flowlab-ai-config-v1';

  const AI_SVG = {
    spark:
      '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9L12 3z"/></svg>',
    search:
      '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>',
    plusSquare:
      '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="3"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>',
    branch:
      '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><line x1="6" y1="3" x2="6" y2="15"/><circle cx="18" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M18 9a9 9 0 0 1-9 9"/></svg>',
    chart:
      '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/><line x1="2" y1="20" x2="22" y2="20"/></svg>',
    target:
      '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3"/><line x1="12" y1="2" x2="12" y2="5"/><line x1="12" y1="19" x2="12" y2="22"/><line x1="2" y1="12" x2="5" y2="12"/><line x1="19" y1="12" x2="22" y2="12"/></svg>',
    undo:
      '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><polyline points="9 14 4 9 9 4"/><path d="M20 20v-7a4 4 0 0 0-4-4H4"/></svg>',
    check:
      '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>',
    cross:
      '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>',
    loader:
      '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>',
    plus:
      '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" aria-hidden="true"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>',
    eye:
      '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>',
    eyeOff:
      '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>',
    alert:
      '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
    settings:
      '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>'
  };

  class AIConnectionError extends Error {
    constructor(title, details = '', code = 'CONNECTION_ERROR') {
      const fullMessage = details ? `${title}\n${details}` : title;
      super(fullMessage);
      this.name = 'AIConnectionError';
      this.title = title;
      this.details = details;
      this.code = code;
    }
  }

  function setStatusIndicator(el, kind, title, details = '') {
    if (!el) return;
    if (!kind) {
      el.className = 'ai-test-status';
      el.innerHTML = '';
      return;
    }
    const icon = kind === 'ok' ? AI_SVG.check : kind === 'err' ? AI_SVG.alert : AI_SVG.loader;
    el.className = `ai-test-status is-${kind}`;
    el.innerHTML =
      `<div class="ai-status-head">${icon}<span>${escapeHTML(title)}</span></div>` +
      (details ? `<div class="ai-status-detail">${escapeHTML(details)}</div>` : '');

    try {
      el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    } catch {}
  }

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
    omniroute: {
      name: 'Omniroute (Local)',
      url: 'http://localhost:20128/v1/chat/completions',
      baseUrl: 'http://localhost:20128',
      defaultModel: 'default'
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
      apiKey: '',
      model: LOCAL_PRESETS.ollama.defaultModel
    },
    api: {
      provider: 'openai',
      apiKey: '',
      model: CLOUD_PROVIDERS.openai.defaultModel
    },
    url: {
      endpoint: '',
      format: 'openai', // 'openai' | 'openai_exact' | 'webhook'
      apiKey: '',
      model: ''
    }
  };

  let aiConfig = loadAIConfig();
  let messages = [];
  let isGenerating = false;
  let currentAbort = null;
  let editingModeTab = aiConfig.mode === 'builtin' ? 'local' : aiConfig.mode;

  // Estado visual en vivo de la conexión actual ('idle' | 'ok' | 'error')
  let connectionHealth = {
    state: 'idle',
    title: '',
    detail: '',
    resolvedEndpoint: ''
  };

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
  // NORMALIZACIÓN DE URL, ENCABEZADOS HTTP, PARSER UNIVERSAL Y DIAGNÓSTICO DE RED
  // =========================================================================
  function isLocalOrPrivateHost(hostname) {
    const h = String(hostname || '').toLowerCase();
    return (
      h === 'localhost' ||
      h === '127.0.0.1' ||
      h === '[::1]' ||
      h === '0.0.0.0' ||
      h.endsWith('.local') ||
      /^10\.\d+\.\d+\.\d+$/.test(h) ||
      /^192\.168\.\d+\.\d+$/.test(h) ||
      /^172\.(1[6-9]|2\d|3[0-1])\.\d+\.\d+$/.test(h)
    );
  }

  function sanitizeApiKey(rawKey) {
    if (rawKey === null || rawKey === undefined) return '';
    let cleaned = String(rawKey)
      .replace(/[\u200B-\u200D\uFEFF\r\n]/g, '')
      .trim()
      .replace(/^["']+|["']+$/g, '')
      .trim();

    // Evitar "Bearer Bearer ..." si el usuario pegó el prefijo completo
    cleaned = cleaned.replace(/^Bearer\s+/i, '').trim();
    if (!cleaned) return '';

    for (let i = 0; i < cleaned.length; i++) {
      if (cleaned.charCodeAt(i) > 255) {
        throw new AIConnectionError(
          'Formato de clave o token inválido',
          'El Token / API Key contiene caracteres no permitidos en cabeceras HTTP (ej. comillas tipográficas o símbolos especiales). Vuelve a copiarlo sin espacios extra.',
          'INVALID_HEADER'
        );
      }
    }
    return cleaned;
  }

  function buildRequestHeaders({ apiKey = '', extraHeaders = {} } = {}) {
    const headers = {
      Accept: 'application/json, text/event-stream, text/plain, */*',
      'Content-Type': 'application/json',
      ...extraHeaders
    };
    const cleanKey = sanitizeApiKey(apiKey);
    if (cleanKey.length > 0) {
      headers.Authorization = `Bearer ${cleanKey}`;
    }
    return headers;
  }

  function normalizeGatewayUrl(rawInput, labelContext = 'endpoint') {
    let raw = String(rawInput || '')
      .trim()
      .replace(/^["']+|["']+$/g, '')
      .trim();

    if (!raw) {
      throw new AIConnectionError(
        `Falta configurar la URL (${labelContext})`,
        'Ingresa una dirección válida, por ejemplo: http://localhost:20128 o http://localhost:11434/v1/chat/completions.',
        'EMPTY_URL'
      );
    }

    // Autocompletar http:// o https:// si el usuario escribió ej. "localhost:20128"
    if (!/^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//.test(raw)) {
      const hostCandidate = raw.split('/')[0].split(':')[0];
      const useHttp =
        isLocalOrPrivateHost(hostCandidate) || !hostCandidate.includes('.');
      raw = (useHttp ? 'http://' : 'https://') + raw;
    }

    let parsed;
    try {
      parsed = new URL(raw);
    } catch {
      throw new AIConnectionError(
        'URL con formato inválido',
        `No se pudo interpretar "${rawInput}". Verifica el protocolo (http:// o https://), host y puerto (ej. http://localhost:20128).`,
        'INVALID_URL'
      );
    }

    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      throw new AIConnectionError(
        `Protocolo no soportado (${parsed.protocol})`,
        'La URL debe comenzar con http:// o https://.',
        'INVALID_PROTOCOL'
      );
    }

    return parsed.toString();
  }

  function buildCandidateEndpoints(normalizedUrl, formatMode = 'openai') {
    const parsed = new URL(normalizedUrl);
    const cleanPath = parsed.pathname.replace(/\/+$/, '');
    const search = parsed.search || '';
    const candidates = [];

    const addUnique = u => {
      if (u && !candidates.includes(u)) candidates.push(u);
    };

    if (formatMode === 'webhook' || formatMode === 'openai_exact') {
      addUnique(normalizedUrl);
      return candidates;
    }

    // Modo compatible con OpenAI (Ollama, LM Studio, Omniroute, LiteLLM, vLLM, OpenRouter...)
    if (cleanPath === '') {
      // El usuario ingresó solo el origen base, ej. http://localhost:20128
      addUnique(`${parsed.origin}/v1/chat/completions${search}`);
      addUnique(`${parsed.origin}/api/v1/chat/completions${search}`);
      addUnique(`${parsed.origin}/chat/completions${search}`);
      addUnique(`${parsed.origin}/api/chat${search}`);
      addUnique(normalizedUrl);
    } else if (/\/v\d+$/i.test(cleanPath)) {
      // Ej. http://localhost:20128/v1 o .../api/v1
      addUnique(`${parsed.origin}${cleanPath}/chat/completions${search}`);
      addUnique(normalizedUrl);
    } else {
      // Ruta explícita provista por el usuario
      addUnique(normalizedUrl);
      if (!/\/(chat\/completions|completions|chat|messages|generate|responses)$/i.test(cleanPath)) {
        addUnique(`${parsed.origin}${cleanPath}/v1/chat/completions${search}`);
        addUnique(`${parsed.origin}${cleanPath}/chat/completions${search}`);
      }
      if (parsed.port === '11434' || cleanPath.includes('/v1/chat/completions')) {
        addUnique(`${parsed.origin}/api/chat`);
      }
    }

    return candidates;
  }

  async function probeOriginReachability(targetUrl) {
    let timer = null;
    try {
      const origin = new URL(targetUrl).origin;
      const ctrl = new AbortController();
      timer = setTimeout(() => ctrl.abort(), 1600);
      const res = await fetch(origin + '/', {
        method: 'GET',
        mode: 'no-cors',
        cache: 'no-store',
        signal: ctrl.signal
      });
      return res ? 'reachable' : 'unknown';
    } catch {
      return 'unreachable';
    } finally {
      if (timer) clearTimeout(timer);
    }
  }

  async function tryLocalSameOriginProxy(targetUrl, method, headers, bodyObj, signal) {
    let targetParsed;
    try {
      targetParsed = new URL(targetUrl);
    } catch {
      return null;
    }

    const pageHost = window.location.hostname;
    const pageIsLocal = isLocalOrPrivateHost(pageHost);
    const targetIsLocal = isLocalOrPrivateHost(targetParsed.hostname);

    // Si la página está en un servidor remoto en la nube y el destino es localhost del usuario,
    // el proxy del servidor remoto NO apunta a la PC del usuario. Solo usar proxy para localhost
    // cuando FlowLab corre localmente (Vite / XAMPP en la misma máquina) o para URLs públicas.
    if (targetIsLocal && !pageIsLocal) {
      return null;
    }

    const proxyEndpoints = ['api/ai-proxy', 'api/ai-proxy.php'];
    for (const proxyUrl of proxyEndpoints) {
      try {
        const res = await fetch(proxyUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            targetUrl,
            method,
            headers,
            body: bodyObj
          }),
          signal
        });

        if (!res.ok) continue;
        const ctype = res.headers.get('content-type') || '';
        if (!ctype.includes('application/json')) continue;

        const wrapper = await res.json();
        if (!wrapper || wrapper.ok !== true || typeof wrapper.upstreamStatus !== 'number') {
          continue;
        }

        return {
          status: wrapper.upstreamStatus,
          ok: wrapper.upstreamStatus >= 200 && wrapper.upstreamStatus < 300,
          contentType: wrapper.contentType || 'application/json',
          rawText: typeof wrapper.body === 'string' ? wrapper.body : JSON.stringify(wrapper.body ?? '')
        };
      } catch (e) {
        if (e && e.name === 'AbortError') throw e;
      }
    }
    return null;
  }

  async function diagnoseNetworkFailure(err, targetUrl, modeLabel) {
    if (err instanceof AIConnectionError) return err;

    let parsed;
    try {
      parsed = new URL(targetUrl);
    } catch {
      return new AIConnectionError(
        'URL inválida',
        `Revisa el formato de la dirección "${targetUrl}".`,
        'INVALID_URL'
      );
    }

    const hostPort = parsed.host;
    const portInfo = parsed.port ? ` (puerto ${parsed.port})` : '';
    const isHttpsPage = window.location.protocol === 'https:';
    const isHttpTarget = parsed.protocol === 'http:';
    const isLocalTarget = isLocalOrPrivateHost(parsed.hostname);

    // Caso contenido mixto bloqueado por navegador (HTTPS -> HTTP público)
    if (isHttpsPage && isHttpTarget && !isLocalTarget) {
      return new AIConnectionError(
        `Contenido mixto bloqueado (${hostPort})`,
        `El navegador bloquea peticiones HTTP inseguras (${targetUrl}) desde una página HTTPS (${window.location.origin}).\n` +
          `• Usa un endpoint con https:// o ejecuta FlowLab localmente en http://localhost.`,
        'MIXED_CONTENT'
      );
    }

    // Sondear si el puerto/servidor responde en modo no-cors para distinguir CORS vs Puerto Cerrado
    const reachability = await probeOriginReachability(targetUrl);

    if (reachability === 'reachable') {
      return new AIConnectionError(
        `Bloqueo de CORS en ${hostPort}`,
        `El servicio en ${parsed.origin} SÍ está encendido y responde, pero bloqueó la petición del navegador por política CORS.\n` +
          `• En gateways locales (Omniroute, LiteLLM, vLLM): habilita CORS permitiendo el origen "${window.location.origin}" y las cabeceras "Content-Type, Authorization".\n` +
          `• En Ollama: ejecuta OLLAMA_ORIGINS="*" ollama serve.\n` +
          `• En LM Studio: activa "Enable CORS" en Local Server.\n` +
          `• Alternativa sin CORS: abre FlowLab con "npm run dev" o XAMPP en tu PC.`,
        'CORS_BLOCKED'
      );
    }

    if (isHttpsPage && isHttpTarget && isLocalTarget) {
      return new AIConnectionError(
        `No se pudo conectar a ${hostPort} (CORS / Red Privada o puerto inactivo)`,
        `Falló la conexión desde HTTPS (${window.location.origin}) hacia tu servidor local (${targetUrl}). Verifica:\n` +
          `1. Servicio activo: confirma que tu pasarela (${modeLabel}) esté ejecutándose en ${parsed.origin}${portInfo}.\n` +
          `2. Permiso CORS + Red Privada: Chrome/Edge exigen que el gateway local devuelva "Access-Control-Allow-Origin: *" y "Access-Control-Allow-Private-Network: true".\n` +
          `3. Ruta correcta: en pasarelas OpenAI suele ser ${parsed.origin}/v1/chat/completions.`,
        'HTTPS_LOCAL_BLOCKED'
      );
    }

    return new AIConnectionError(
      `Sin conexión con ${hostPort}${portInfo}`,
      `La petición a ${targetUrl} falló (Failed to fetch). Causas probables:\n` +
        `1. Puerto no disponible o servicio apagado: verifica que el servidor (${modeLabel}) esté iniciado y escuchando en ${parsed.origin}.\n` +
        `2. URL o puerto incorrecto: revisa que la dirección y el puerto${portInfo} coincidan con tu pasarela.\n` +
        `3. Bloqueo CORS: si el servidor sí responde en terminal/Postman, habilita CORS para permitir "Content-Type" y "Authorization".`,
      'NETWORK_UNREACHABLE'
    );
  }

  function extractProviderErrorDetail(rawText) {
    if (!rawText) return '';
    try {
      const j = JSON.parse(rawText);
      const msg =
        (typeof j?.error === 'string' ? j.error : j?.error?.message) ||
        j?.message ||
        j?.detail ||
        (Array.isArray(j?.detail) ? j.detail.map(d => d.msg || JSON.stringify(d)).join('; ') : '');
      if (msg) return String(msg).trim().slice(0, 240);
    } catch {}
    return String(rawText).replace(/\s+/g, ' ').trim().slice(0, 200);
  }

  function buildHttpStatusError(status, finalUrl, rawErrText, modelName) {
    const detailMsg = extractProviderErrorDetail(rawErrText);
    const suffix = detailMsg ? `\nDetalle del servidor: ${detailMsg}` : '';

    if (status === 401 || status === 403) {
      return new AIConnectionError(
        `Autenticación rechazada (HTTP ${status})`,
        `El servidor en ${finalUrl} rechazó las credenciales. Verifica que tu API Key o Token Bearer sea válido y tenga permisos.${suffix}`,
        'HTTP_AUTH'
      );
    }
    if (status === 404) {
      return new AIConnectionError(
        `Endpoint o modelo no encontrado (HTTP 404)`,
        `No se encontró la ruta ${finalUrl} o el modelo "${modelName || 'default'}" no existe en el servidor.\n` +
          `• Verifica la URL del endpoint (ej. /v1/chat/completions) y el nombre exacto del modelo.${suffix}`,
        'HTTP_404'
      );
    }
    if (status === 405) {
      return new AIConnectionError(
        `Método HTTP no permitido (HTTP 405)`,
        `La URL ${finalUrl} no acepta peticiones POST de chat. Asegúrate de apuntar a la ruta correcta (ej. /v1/chat/completions).${suffix}`,
        'HTTP_405'
      );
    }
    if (status === 400 || status === 422) {
      return new AIConnectionError(
        `Solicitud rechazada por la pasarela (HTTP ${status})`,
        `Revisa que el nombre del modelo ("${modelName || 'default'}") sea válido en tu proveedor y que el formato de petición coincida.${suffix}`,
        'HTTP_400'
      );
    }
    if (status === 429) {
      return new AIConnectionError(
        'Límite de peticiones o cuota excedida (HTTP 429)',
        `El proveedor limitó temporalmente las solicitudes o tu cuenta agotó saldo/cuota.${suffix}`,
        'HTTP_429'
      );
    }
    return new AIConnectionError(
      `Error del servidor de IA (HTTP ${status})`,
      `El endpoint ${finalUrl} devolvió un fallo interno.${suffix}`,
      'HTTP_' + status
    );
  }

  function normalizeContentField(content) {
    if (typeof content === 'string') return content;
    if (Array.isArray(content)) {
      return content
        .map(part => {
          if (typeof part === 'string') return part;
          if (part && typeof part.text === 'string') return part.text;
          if (part && typeof part.content === 'string') return part.content;
          return '';
        })
        .join('');
    }
    return '';
  }

  function parseUniversalAIResponse(rawText, contentType = '') {
    const trimmed = String(rawText || '').trim();
    if (!trimmed) {
      return { replyText: '', parsedJson: null };
    }

    // 1. Soporte automático para respuestas SSE (text/event-stream: "data: {...}")
    // Muchos gateways locales como Omniroute o LiteLLM envían SSE incluso con stream: false
    if (
      contentType.includes('text/event-stream') ||
      /^data:\s*\{/m.test(trimmed)
    ) {
      const lines = trimmed.split(/\r?\n/);
      let acc = '';
      for (const line of lines) {
        const clean = line.trim();
        if (!clean.startsWith('data:')) continue;
        const payloadStr = clean.slice(5).trim();
        if (!payloadStr || payloadStr === '[DONE]') continue;
        try {
          const chunk = JSON.parse(payloadStr);
          if (chunk?.error) {
            const errMsg = typeof chunk.error === 'string' ? chunk.error : chunk.error.message;
            throw new AIConnectionError('Error reportado por el stream de IA', errMsg || JSON.stringify(chunk.error));
          }
          const delta =
            normalizeContentField(chunk?.choices?.[0]?.delta?.content) ||
            normalizeContentField(chunk?.choices?.[0]?.message?.content) ||
            chunk?.choices?.[0]?.text ||
            chunk?.message?.content ||
            chunk?.response ||
            chunk?.token ||
            '';
          acc += delta;
        } catch (e) {
          if (e instanceof AIConnectionError) throw e;
        }
      }
      if (acc) return { replyText: acc, parsedJson: null };
    }

    // 2. JSON estándar (OpenAI, Ollama, Anthropic, Gemini, Webhooks personalizados)
    try {
      const data = JSON.parse(trimmed);
      if (data && data.error && !data.choices && !data.message && !data.reply) {
        const errMsg =
          typeof data.error === 'string'
            ? data.error
            : data.error.message || JSON.stringify(data.error);
        throw new AIConnectionError('El proveedor devolvió un error', String(errMsg), 'PROVIDER_ERROR');
      }

      const replyText =
        normalizeContentField(data?.choices?.[0]?.message?.content) ||
        (typeof data?.choices?.[0]?.text === 'string' ? data.choices[0].text : '') ||
        normalizeContentField(data?.message?.content) ||
        (typeof data?.response === 'string' ? data.response : '') ||
        (typeof data?.reply === 'string' ? data.reply : '') ||
        (typeof data?.output === 'string' ? data.output : '') ||
        (typeof data?.answer === 'string' ? data.answer : '') ||
        (typeof data?.result === 'string' ? data.result : '') ||
        (typeof data?.text === 'string' ? data.text : '') ||
        (typeof data?.data?.reply === 'string' ? data.data.reply : '') ||
        (typeof data?.data?.content === 'string' ? data.data.content : '') ||
        (Array.isArray(data?.content) ? data.content.map(c => c?.text || '').join('') : '') ||
        (typeof data?.content === 'string' ? data.content : '') ||
        (data?.candidates?.[0]?.content?.parts?.map(p => p?.text || '').join('') || '');

      return { replyText, parsedJson: data };
    } catch (e) {
      if (e instanceof AIConnectionError) throw e;
    }

    // 3. NDJSON línea por línea (ej. Ollama nativo con stream)
    const ndLines = trimmed.split(/\r?\n/).filter(Boolean);
    if (ndLines.length > 1 && ndLines[0].startsWith('{')) {
      let ndAcc = '';
      let parsedAny = false;
      for (const ln of ndLines) {
        try {
          const obj = JSON.parse(ln);
          parsedAny = true;
          ndAcc += obj?.message?.content || obj?.response || obj?.choices?.[0]?.delta?.content || '';
        } catch {}
      }
      if (parsedAny && ndAcc) {
        return { replyText: ndAcc, parsedJson: null };
      }
    }

    // 4. Respuesta en texto plano (webhooks simples) si no es una página HTML de error
    if (!/^<!DOCTYPE\s+html/i.test(trimmed) && !/^<html/i.test(trimmed)) {
      return { replyText: trimmed, parsedJson: null };
    }

    throw new AIConnectionError(
      'Respuesta inesperada del servidor (HTML en vez de JSON)',
      'La URL devolvió una página web HTML en lugar de una respuesta de API JSON. Verifica que la URL incluya la ruta de API correcta (ej. /v1/chat/completions).',
      'INVALID_RESPONSE_HTML'
    );
  }

  async function executeHttpRequestWithFallback({
    candidates,
    headers,
    buildBodyForUrl,
    signal,
    modeLabel,
    modelName
  }) {
    let lastHttpError = null;
    let lastNetworkErr = null;
    let lastAttemptedUrl = candidates[0];

    for (let i = 0; i < candidates.length; i++) {
      const candidateUrl = candidates[i];
      lastAttemptedUrl = candidateUrl;
      const bodyObj = buildBodyForUrl(candidateUrl);
      const bodyJson = JSON.stringify(bodyObj);

      let responseInfo = null;

      try {
        const res = await fetch(candidateUrl, {
          method: 'POST',
          headers,
          body: bodyJson,
          signal
        });
        const rawText = await res.text().catch(() => '');
        responseInfo = {
          status: res.status,
          ok: res.ok,
          contentType: res.headers.get('content-type') || '',
          rawText
        };
      } catch (fetchErr) {
        if (fetchErr && fetchErr.name === 'AbortError') throw fetchErr;

        // Intentar rescate automático vía proxy local (Vite / XAMPP) si hubo bloqueo CORS
        const proxied = await tryLocalSameOriginProxy(
          candidateUrl,
          'POST',
          headers,
          bodyObj,
          signal
        );
        if (proxied) {
          responseInfo = proxied;
        } else {
          lastNetworkErr = fetchErr;
          // Si falla la red/CORS en este origen, probar otro path en el mismo origen fallará igual
          break;
        }
      }

      if (responseInfo.ok) {
        const parsed = parseUniversalAIResponse(responseInfo.rawText, responseInfo.contentType);
        return {
          ...parsed,
          endpointUsed: candidateUrl
        };
      }

      // Si dio 404 o 405 y quedan rutas candidatas (ej. base URL -> /v1/chat/completions -> /api/chat), probar la siguiente
      if ((responseInfo.status === 404 || responseInfo.status === 405) && i < candidates.length - 1) {
        lastHttpError = buildHttpStatusError(
          responseInfo.status,
          candidateUrl,
          responseInfo.rawText,
          modelName
        );
        continue;
      }

      throw buildHttpStatusError(
        responseInfo.status,
        candidateUrl,
        responseInfo.rawText,
        modelName
      );
    }

    if (lastNetworkErr) {
      throw await diagnoseNetworkFailure(lastNetworkErr, lastAttemptedUrl, modeLabel);
    }
    if (lastHttpError) {
      throw lastHttpError;
    }
    throw new AIConnectionError('Error de conexión desconocido', `No se obtuvo respuesta de ${lastAttemptedUrl}.`);
  }

  // =========================================================================
  // CLIENTES HTTP: LOCAL (OLLAMA / LM STUDIO / OMNIROUTE) · CLOUD API · CUSTOM URL
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
      await new Promise(r => setTimeout(r, 240));
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
    const rawUrl = aiConfig.local.url || LOCAL_PRESETS.ollama.url;
    const normalizedUrl = normalizeGatewayUrl(rawUrl, 'IA Local');
    const candidates = buildCandidateEndpoints(normalizedUrl, 'openai');
    const model = (aiConfig.local.model || 'default').trim() || 'default';
    const headers = buildRequestHeaders({ apiKey: aiConfig.local.apiKey || '' });
    const presetName = LOCAL_PRESETS[aiConfig.local.preset]?.name || 'IA Local';

    const { replyText, endpointUsed } = await executeHttpRequestWithFallback({
      candidates,
      headers,
      signal,
      modeLabel: presetName,
      modelName: model,
      buildBodyForUrl: targetUrl => {
        if (targetUrl.endsWith('/api/chat')) {
          return { model, messages: chatMsgs, stream: false };
        }
        return {
          model,
          messages: chatMsgs,
          temperature: 0.35,
          stream: false
        };
      }
    });

    connectionHealth.resolvedEndpoint = endpointUsed;
    return extractActionsFromReply(replyText);
  }

  async function callCloudProvider(chatMsgs, signal) {
    const providerKey = aiConfig.api.provider || 'openai';
    const prov = CLOUD_PROVIDERS[providerKey] || CLOUD_PROVIDERS.openai;
    const cleanKey = sanitizeApiKey(aiConfig.api.apiKey);
    const model = (aiConfig.api.model || prov.defaultModel).trim();

    if (!cleanKey) {
      throw new AIConnectionError(
        `Falta API Key de ${prov.name}`,
        `Abre el panel "conectar", selecciona la pestaña API e introduce tu clave de ${prov.name}.`,
        'MISSING_KEY'
      );
    }

    // Google Gemini REST API directa
    if (providerKey === 'gemini') {
      const sysMsg = chatMsgs.find(m => m.role === 'system')?.content || '';
      const contents = chatMsgs
        .filter(m => m.role !== 'system')
        .map(m => ({
          role: m.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: m.content }]
        }));

      const url = `${prov.url}/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(cleanKey)}`;
      const { replyText } = await executeHttpRequestWithFallback({
        candidates: [url],
        headers: buildRequestHeaders(),
        signal,
        modeLabel: prov.name,
        modelName: model,
        buildBodyForUrl: () => ({
          systemInstruction: { parts: [{ text: sysMsg }] },
          contents,
          generationConfig: { temperature: 0.35 }
        })
      });
      return extractActionsFromReply(replyText);
    }

    // Anthropic Claude Messages API
    if (providerKey === 'anthropic') {
      const sysMsg = chatMsgs.find(m => m.role === 'system')?.content || '';
      const userAssistantMsgs = chatMsgs
        .filter(m => m.role !== 'system')
        .map(m => ({ role: m.role, content: m.content }));

      const { replyText } = await executeHttpRequestWithFallback({
        candidates: [prov.url],
        headers: buildRequestHeaders({
          extraHeaders: {
            'x-api-key': cleanKey,
            'anthropic-version': '2023-06-01',
            'anthropic-dangerous-direct-browser-access': 'true'
          }
        }),
        signal,
        modeLabel: prov.name,
        modelName: model,
        buildBodyForUrl: () => ({
          model,
          max_tokens: 2048,
          system: sysMsg,
          messages: userAssistantMsgs
        })
      });
      return extractActionsFromReply(replyText);
    }

    // Proveedores compatibles con OpenAI (OpenAI, OpenRouter, Groq, DeepSeek)
    const extraHeaders = {};
    if (providerKey === 'openrouter') {
      extraHeaders['HTTP-Referer'] = window.location.origin;
      extraHeaders['X-Title'] = 'FlowLab paginaRE';
    }

    const { replyText } = await executeHttpRequestWithFallback({
      candidates: [prov.url],
      headers: buildRequestHeaders({ apiKey: cleanKey, extraHeaders }),
      signal,
      modeLabel: prov.name,
      modelName: model,
      buildBodyForUrl: () => ({
        model,
        messages: chatMsgs,
        temperature: 0.35,
        stream: false
      })
    });

    return extractActionsFromReply(replyText);
  }

  async function callCustomUrlProvider(userText, chatMsgs, signal) {
    const normalizedUrl = normalizeGatewayUrl(aiConfig.url.endpoint, 'URL personalizada');
    const formatMode = aiConfig.url.format || 'openai';
    const candidates = buildCandidateEndpoints(normalizedUrl, formatMode);
    const modelName = (aiConfig.url.model || '').trim();
    const headers = buildRequestHeaders({ apiKey: aiConfig.url.apiKey || '' });

    const { replyText, parsedJson, endpointUsed } = await executeHttpRequestWithFallback({
      candidates,
      headers,
      signal,
      modeLabel: 'Pasarela URL / Gateway',
      modelName: modelName || 'default',
      buildBodyForUrl: targetUrl => {
        if (formatMode === 'webhook') {
          const payload = {
            message: userText,
            prompt: userText,
            messages: chatMsgs,
            systemPrompt: buildSystemPrompt(),
            context: aiConfig.includeContext ? buildWorkspaceContext() : null,
            history: chatMsgs.filter(m => m.role !== 'system')
          };
          if (modelName) payload.model = modelName;
          return payload;
        }

        if (targetUrl.endsWith('/api/chat')) {
          return {
            model: modelName || 'default',
            messages: chatMsgs,
            stream: false
          };
        }

        const openAiBody = {
          messages: chatMsgs,
          temperature: 0.35,
          stream: false
        };
        if (modelName) {
          openAiBody.model = modelName;
        } else {
          openAiBody.model = 'default';
        }
        return openAiBody;
      }
    });

    connectionHealth.resolvedEndpoint = endpointUsed;

    const extracted = extractActionsFromReply(replyText);
    if (
      !extracted.actions &&
      parsedJson &&
      (Array.isArray(parsedJson?.operations) || Array.isArray(parsedJson?.nodes))
    ) {
      extracted.actions = tryParseActionPayload(JSON.stringify(parsedJson));
    }
    return extracted;
  }

  // =========================================================================
  // DETECCIÓN DE MODELOS (LOCAL Y GATEWAYS URL) Y TEST DE CONEXIÓN
  // =========================================================================
  async function fetchGatewayModels(rawEndpoint, rawApiKey) {
    const normalized = normalizeGatewayUrl(rawEndpoint, 'consulta de modelos');
    const parsed = new URL(normalized);
    const cleanPath = parsed.pathname.replace(/\/+$/, '');
    const headers = buildRequestHeaders({ apiKey: rawApiKey || '' });
    delete headers['Content-Type']; // GET no requiere Content-Type (evita preflight innecesario en servidores simples)

    const modelUrls = [];
    const addUrl = u => {
      if (u && !modelUrls.includes(u)) modelUrls.push(u);
    };

    if (/\/v\d+\/chat\/completions$/i.test(cleanPath)) {
      addUrl(parsed.origin + cleanPath.replace(/\/chat\/completions$/i, '/models'));
    } else if (/\/v\d+$/i.test(cleanPath)) {
      addUrl(`${parsed.origin}${cleanPath}/models`);
    }
    addUrl(`${parsed.origin}/v1/models`);
    addUrl(`${parsed.origin}/api/v1/models`);
    addUrl(`${parsed.origin}/api/tags`);

    const foundModels = [];
    let lastErr = null;
    let anyResponded = false;

    for (const mUrl of modelUrls) {
      try {
        let rawText = '';
        let ok = false;

        let mTimer = null;
        try {
          const ctrl = new AbortController();
          mTimer = setTimeout(() => ctrl.abort(), 5000);
          const r = await fetch(mUrl, { method: 'GET', headers, signal: ctrl.signal });
          ok = r.ok;
          if (ok) rawText = await r.text();
        } catch (netErr) {
          const proxied = await tryLocalSameOriginProxy(mUrl, 'GET', headers, undefined);
          if (proxied) {
            ok = proxied.ok;
            rawText = proxied.rawText;
          } else {
            lastErr = netErr;
          }
        } finally {
          if (mTimer) clearTimeout(mTimer);
        }

        if (ok && rawText) {
          anyResponded = true;
          const j = JSON.parse(rawText);
          if (Array.isArray(j?.data)) {
            j.data.forEach(m => {
              const id = m?.id || m?.name;
              if (id && !foundModels.includes(id)) foundModels.push(id);
            });
          }
          if (Array.isArray(j?.models)) {
            j.models.forEach(m => {
              const id = typeof m === 'string' ? m : m?.name || m?.id || m?.model;
              if (id && !foundModels.includes(id)) foundModels.push(id);
            });
          }
        }
      } catch {}
    }

    if (foundModels.length === 0 && !anyResponded && lastErr) {
      throw await diagnoseNetworkFailure(lastErr, modelUrls[0], 'consulta de modelos');
    }

    return foundModels;
  }

  function renderModelChips(chipsWrap, modelInput, models) {
    if (!chipsWrap) return;
    if (!models.length) {
      chipsWrap.innerHTML = '';
      return;
    }
    if (modelInput && !modelInput.value.trim() && models[0]) {
      modelInput.value = models[0];
    }
    chipsWrap.innerHTML = models
      .slice(0, 14)
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

  async function detectLocalModels() {
    const statusEl = document.getElementById('aiTestStatus');
    const chipsWrap = document.getElementById('aiDetectedModels');
    const urlInput = document.getElementById('aiLocalUrl');
    const keyInput = document.getElementById('aiLocalKey');
    const modelInput = document.getElementById('aiLocalModel');
    const rawUrl = (urlInput?.value || aiConfig.local.url || LOCAL_PRESETS.ollama.url).trim();
    const rawKey = keyInput?.value || aiConfig.local.apiKey || '';

    setStatusIndicator(statusEl, 'pending', 'Consultando modelos disponibles en tu PC...');
    if (chipsWrap) chipsWrap.innerHTML = '';

    try {
      const models = await fetchGatewayModels(rawUrl, rawKey);
      if (models.length === 0) {
        setStatusIndicator(
          statusEl,
          'err',
          'El servidor respondió, pero no listó modelos en /v1/models ni /api/tags',
          'Escribe manualmente el nombre del modelo instalado y pulsa "probar".'
        );
        return;
      }
      if (modelInput && models[0]) modelInput.value = models[0];
      renderModelChips(chipsWrap, modelInput, models);
      setStatusIndicator(
        statusEl,
        'ok',
        `${models.length} modelo(s) detectado(s)`,
        'Haz clic en un modelo para seleccionarlo y pulsa "guardar conexión".'
      );
    } catch (err) {
      const title = err instanceof AIConnectionError ? err.title : 'Error al detectar modelos';
      const details = err instanceof AIConnectionError ? err.details : err.message || '';
      setStatusIndicator(statusEl, 'err', title, details);
    }
  }

  async function detectCustomUrlModels() {
    const statusEl = document.getElementById('aiTestStatus');
    const chipsWrap = document.getElementById('aiCustomDetectedModels');
    const urlInput = document.getElementById('aiCustomUrl');
    const keyInput = document.getElementById('aiCustomKey');
    const modelInput = document.getElementById('aiCustomModel');
    const rawUrl = (urlInput?.value || aiConfig.url.endpoint || '').trim();
    const rawKey = keyInput?.value || aiConfig.url.apiKey || '';

    setStatusIndicator(statusEl, 'pending', 'Consultando modelos en el endpoint URL...');
    if (chipsWrap) chipsWrap.innerHTML = '';

    try {
      const models = await fetchGatewayModels(rawUrl, rawKey);
      if (models.length === 0) {
        setStatusIndicator(
          statusEl,
          'err',
          'La pasarela no expone listado en /v1/models',
          'Ingresa el nombre del modelo manualmente y pulsa "probar" para verificar el chat.'
        );
        return;
      }
      if (modelInput && models[0]) modelInput.value = models[0];
      renderModelChips(chipsWrap, modelInput, models);
      setStatusIndicator(
        statusEl,
        'ok',
        `${models.length} modelo(s) disponibles en la pasarela`,
        'Selecciona un chip abajo o pulsa "probar".'
      );
    } catch (err) {
      const title = err instanceof AIConnectionError ? err.title : 'No se pudo consultar la pasarela';
      const details = err instanceof AIConnectionError ? err.details : err.message || '';
      setStatusIndicator(statusEl, 'err', title, details);
    }
  }

  async function testCurrentConnection() {
    readConfigFormIntoState(false);
    const statusEl = document.getElementById('aiTestStatus');
    if (!statusEl) return;

    if (editingModeTab === 'builtin') {
      connectionHealth = { state: 'ok', title: '', detail: '', resolvedEndpoint: '' };
      setStatusIndicator(
        statusEl,
        'ok',
        'Motor integrado listo',
        'No requiere servidor externo ni claves API.'
      );
      updateProviderHeaderUI();
      return;
    }

    setStatusIndicator(statusEl, 'pending', 'Verificando conexión y respuesta del modelo...');

    const prevMode = aiConfig.mode;
    aiConfig.mode = editingModeTab;
    const t0 = performance.now();
    let timedOut = false;
    let timer = null;

    try {
      const ctrl = new AbortController();
      timer = setTimeout(() => {
        timedOut = true;
        ctrl.abort();
      }, 15000);

      await callExternalAI('Responde únicamente con la palabra OK.', ctrl.signal);

      const ms = Math.round(performance.now() - t0);
      const resolvedNote = connectionHealth.resolvedEndpoint
        ? `Endpoint activo: ${connectionHealth.resolvedEndpoint}`
        : '';

      if (prevMode === editingModeTab) {
        connectionHealth = {
          state: 'ok',
          title: `Conexión verificada (${ms} ms)`,
          detail: resolvedNote,
          resolvedEndpoint: connectionHealth.resolvedEndpoint
        };
      }
      setStatusIndicator(statusEl, 'ok', `Conexión exitosa (${ms} ms)`, resolvedNote);
    } catch (err) {
      let title = 'Error al conectar con el proveedor';
      let details = '';

      if (timedOut || (err && err.name === 'AbortError')) {
        title = 'Tiempo de espera agotado (15 s)';
        details =
          'El servidor aceptó o retuvo la solicitud pero no respondió a tiempo.\n' +
          '• Si es un modelo local (Ollama / LM Studio / Omniroute), puede estar cargando el modelo en RAM/VRAM o el puerto está bloqueado.';
      } else if (err instanceof AIConnectionError) {
        title = err.title;
        details = err.details;
      } else if (err) {
        title = err.message || title;
      }

      if (prevMode === editingModeTab) {
        connectionHealth = {
          state: 'error',
          title,
          detail: details,
          resolvedEndpoint: ''
        };
      }
      setStatusIndicator(statusEl, 'err', title, details);
    } finally {
      if (timer) clearTimeout(timer);
      aiConfig.mode = prevMode;
      updateProviderHeaderUI();
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
      const hasUrl = Boolean(aiConfig.local.url && aiConfig.local.url.trim());
      return { configured: hasUrl, text: `${label}${mod}` };
    }
    if (aiConfig.mode === 'api') {
      const prov = CLOUD_PROVIDERS[aiConfig.api.provider] || CLOUD_PROVIDERS.openai;
      const hasKey = Boolean(aiConfig.api.apiKey && aiConfig.api.apiKey.trim());
      return {
        configured: hasKey,
        text: hasKey ? `${prov.name} · ${aiConfig.api.model}` : `${prov.name} (falta key)`
      };
    }
    if (aiConfig.mode === 'url') {
      const rawEndpoint = (aiConfig.url.endpoint || '').trim();
      const hasUrl = Boolean(rawEndpoint);
      let host = 'URL personalizada';
      if (hasUrl) {
        try {
          const norm = normalizeGatewayUrl(rawEndpoint);
          host = new URL(norm).host || host;
        } catch {
          host = rawEndpoint.slice(0, 24);
        }
      }
      return { configured: hasUrl, text: hasUrl ? `URL · ${host}` : 'URL (sin configurar)' };
    }
    return { configured: false, text: 'Asistente integrado' };
  }

  function updateProviderHeaderUI() {
    const info = getActiveProviderSummary();
    const lbl = document.getElementById('aiProviderLabel');
    const pill = document.getElementById('btnAiProviderPill');
    const dot = document.getElementById('aiProviderDot');
    const tabDot = document.getElementById('aiTabDot');
    const banner = document.getElementById('aiConnBanner');
    const bannerTitle = document.getElementById('aiConnBannerTitle');
    const bannerText = document.getElementById('aiConnBannerText');
    const drawer = document.getElementById('aiConfigDrawer');

    if (lbl) lbl.textContent = info.text;

    const isErr = aiConfig.mode !== 'builtin' && connectionHealth.state === 'error';
    const isLive = aiConfig.mode !== 'builtin' && connectionHealth.state === 'ok' && info.configured;
    const isConfigured = aiConfig.mode !== 'builtin' && info.configured && !isErr && !isLive;

    [dot, tabDot].forEach(el => {
      if (!el) return;
      el.classList.toggle('is-live', isLive);
      el.classList.toggle('is-error', isErr);
      el.classList.toggle('is-configured', isConfigured);
    });

    if (pill) {
      pill.classList.toggle('is-error', isErr);
      pill.title = isErr
        ? `${connectionHealth.title} — Haz clic para revisar la conexión`
        : 'Configurar conexión IA';
    }

    if (banner) {
      const drawerClosed = !drawer || drawer.hidden;
      if (isErr && drawerClosed) {
        if (bannerTitle) bannerTitle.textContent = connectionHealth.title || 'Fallo de conexión IA';
        if (bannerText) {
          const firstLine = (connectionHealth.detail || '').split('\n')[0];
          bannerText.textContent = firstLine || 'Revisa la URL, puerto o configuración CORS.';
        }
        banner.hidden = false;
      } else {
        banner.hidden = true;
      }
    }
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
          selBadge.innerHTML = `${AI_SVG.target}<span>${escapeHTML(shortTxt)}</span>`;
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
          <div class="ai-welcome-badge">${AI_SVG.spark}<span>copiloto del lienzo</span></div>
          <h4>Habla con tu flujo y crea nodos</h4>
          <p>Tengo contexto en vivo del proyecto abierto. Conecta <b>Ollama / LM Studio</b> en tu PC, una <b>API Key</b> o una <b>URL</b>, o usa las acciones rápidas:</p>
          <div class="ai-quick-grid">
            <button type="button" class="ai-quick-btn" data-prompt="Analiza el flujo actual, resume su arquitectura y dime si hay bloqueos o mejoras.">
              <span class="ai-quick-icon">${AI_SVG.search}</span>
              <span>Analizar este archivo</span>
            </button>
            <button type="button" class="ai-quick-btn" data-prompt="Crea un flujo de autenticación con recepción de credenciales, base de datos, decisión y emisión de token.">
              <span class="ai-quick-icon">${AI_SVG.plusSquare}</span>
              <span>Crear flujo de login</span>
            </button>
            <button type="button" class="ai-quick-btn" data-prompt="Expande el nodo seleccionado con una decisión Sí y No conectada.">
              <span class="ai-quick-icon">${AI_SVG.branch}</span>
              <span>Expandir con Sí / No</span>
            </button>
            <button type="button" class="ai-quick-btn" data-prompt="Agrega un nodo de métricas KPI conectado al flujo.">
              <span class="ai-quick-icon">${AI_SVG.chart}</span>
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
                  <span class="ai-action-title">${AI_SVG.check}<span>${escapeHTML(msg.appliedSummary || msg.actions.summary || 'Aplicado al lienzo')}</span></span>
                </div>
                ${previewOps ? `<div class="ai-op-list">${previewOps}</div>` : ''}
                <div class="ai-action-btns">
                  ${
                    msg.createdNodeIds && msg.createdNodeIds.length
                      ? `<button type="button" class="ai-card-btn" data-focus-idx="${idx}">${AI_SVG.target}<span>enfocar</span></button>`
                      : ''
                  }
                  <button type="button" class="ai-card-btn" data-undo-idx="${idx}">${AI_SVG.undo}<span>deshacer</span></button>
                </div>
              </div>
            `;
          } else {
            actionCardHtml = `
              <div class="ai-action-card">
                <div class="ai-action-head">
                  <span class="ai-action-title">${AI_SVG.spark}<span>${escapeHTML(msg.actions.summary || 'Propuesta de nodos')}</span></span>
                </div>
                ${previewOps ? `<div class="ai-op-list">${previewOps}</div>` : ''}
                <div class="ai-action-btns">
                  <button type="button" class="ai-card-btn is-primary" data-apply-idx="${idx}">${AI_SVG.plus}<span>crear en el lienzo</span></button>
                </div>
              </div>
            `;
          }
        }

        const errorActionsHtml = msg.isError && msg.canOpenConfig
          ? `<div class="ai-action-btns" style="margin-top:8px">
               <button type="button" class="ai-card-btn" data-open-cfg="1">${AI_SVG.settings}<span>revisar conexión</span></button>
             </div>`
          : '';

        return `
          <div class="ai-msg ai-msg--assistant ${msg.isError ? 'is-error' : ''}">
            <div class="ai-msg-meta">${escapeHTML(msg.providerTag || 'IA')}</div>
            <div class="ai-bubble ai-bubble--assistant">
              <div class="ai-bubble-text">${formatAssistantMarkdown(msg.content)}</div>
              ${actionCardHtml}
              ${errorActionsHtml}
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

    container.querySelectorAll('[data-open-cfg]').forEach(btn => {
      btn.addEventListener('click', () => toggleConfigDrawer(true));
    });

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
      if (aiConfig.mode !== 'builtin') {
        connectionHealth = {
          state: 'ok',
          title: 'Conectado',
          detail: '',
          resolvedEndpoint: connectionHealth.resolvedEndpoint
        };
        updateProviderHeaderUI();
      }

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
      if (err && err.name === 'AbortError') {
        messages.push({
          role: 'assistant',
          content: 'Generación detenida por el usuario.',
          isError: true,
          providerTag: provSummary.text,
          timestamp: Date.now()
        });
      } else {
        const errTitle =
          err instanceof AIConnectionError
            ? err.title
            : 'Error de conexión con el proveedor de IA';
        const errDetail =
          err instanceof AIConnectionError
            ? err.details
            : err?.message || 'No se pudo completar la solicitud.';

        connectionHealth = {
          state: 'error',
          title: errTitle,
          detail: errDetail,
          resolvedEndpoint: ''
        };
        updateProviderHeaderUI();

        const formattedErr = errDetail ? `**${errTitle}**\n\n${errDetail}` : `**${errTitle}**`;
        messages.push({
          role: 'assistant',
          content: formattedErr,
          isError: true,
          canOpenConfig: true,
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
    const localKey = document.getElementById('aiLocalKey');
    const localModel = document.getElementById('aiLocalModel');
    if (localPreset) localPreset.value = aiConfig.local.preset || 'ollama';
    if (localUrl) localUrl.value = aiConfig.local.url || LOCAL_PRESETS.ollama.url;
    if (localKey) localKey.value = aiConfig.local.apiKey || '';
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

    // Si había un error previo activo para este modo, mostrarlo de inmediato en la gaveta
    const statusEl = document.getElementById('aiTestStatus');
    if (statusEl && connectionHealth.state === 'error' && editingModeTab === aiConfig.mode) {
      setStatusIndicator(statusEl, 'err', connectionHealth.title, connectionHealth.detail);
    }
  }

  function readConfigFormIntoState(commitActiveMode = true) {
    if (commitActiveMode) {
      aiConfig.mode = editingModeTab;
    }

    const localPreset = document.getElementById('aiLocalPreset');
    const localUrl = document.getElementById('aiLocalUrl');
    const localKey = document.getElementById('aiLocalKey');
    const localModel = document.getElementById('aiLocalModel');
    if (localPreset) aiConfig.local.preset = localPreset.value;
    if (localUrl) aiConfig.local.url = localUrl.value.trim();
    if (localKey) aiConfig.local.apiKey = localKey.value.trim();
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
      setStatusIndicator(statusEl, null, '');
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
    updateProviderHeaderUI();
  }

  function bindPasswordToggle(btnId, inputId) {
    document.getElementById(btnId)?.addEventListener('click', e => {
      const keyEl = document.getElementById(inputId);
      const eyeBtn = e.currentTarget;
      if (!keyEl) return;
      const isHidden = keyEl.type === 'password';
      keyEl.type = isHidden ? 'text' : 'password';
      if (eyeBtn) eyeBtn.innerHTML = isHidden ? AI_SVG.eyeOff : AI_SVG.eye;
    });
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
    document.getElementById('btnAiFixConn')?.addEventListener('click', () => toggleConfigDrawer(true));

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

    // Botones vectoriales mostrar/ocultar clave en los tres modos
    bindPasswordToggle('btnToggleKeyVis', 'aiCloudKey');
    bindPasswordToggle('btnToggleLocalKeyVis', 'aiLocalKey');
    bindPasswordToggle('btnToggleCustomKeyVis', 'aiCustomKey');

    document.getElementById('btnDetectLocalModels')?.addEventListener('click', detectLocalModels);
    document.getElementById('btnDetectCustomModels')?.addEventListener('click', detectCustomUrlModels);
    document.getElementById('btnAiTest')?.addEventListener('click', testCurrentConnection);

    document.getElementById('btnAiSaveConfig')?.addEventListener('click', async () => {
      readConfigFormIntoState(true);
      connectionHealth = { state: 'idle', title: '', detail: '', resolvedEndpoint: '' };
      saveAIConfig();

      if (aiConfig.mode === 'builtin') {
        connectionHealth.state = 'ok';
        updateProviderHeaderUI();
        toggleConfigDrawer(false);
        showToast('Conexión IA actualizada: Asistente integrado', 'ok', 2000);
        return;
      }

      // Validar y probar al guardar para no cerrar en silencio si la conexión falla
      await testCurrentConnection();
      if (connectionHealth.state === 'ok') {
        toggleConfigDrawer(false);
        showToast('Conexión IA verificada: ' + getActiveProviderSummary().text, 'ok', 2200);
      }
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
