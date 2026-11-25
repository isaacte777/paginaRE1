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
      '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>',
    chevronDown:
      '<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" aria-hidden="true"><polyline points="6 9 12 15 18 9"/></svg>',
    shield:
      '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>',
    layers:
      '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>',
    database:
      '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>',
    cpu:
      '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><line x1="9" y1="1" x2="9" y2="4"/><line x1="15" y1="1" x2="15" y2="4"/><line x1="9" y1="20" x2="9" y2="23"/><line x1="15" y1="20" x2="15" y2="23"/><line x1="20" y1="9" x2="23" y2="9"/><line x1="20" y1="14" x2="23" y2="14"/><line x1="1" y1="9" x2="4" y2="9"/><line x1="1" y1="14" x2="4" y2="14"/></svg>',
    book:
      '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>',
    chat:
      '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>',
    edit:
      '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>',
    trash:
      '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>'
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

  function activeAIConfigKey() {
    return typeof getUserStorageKey === 'function'
      ? getUserStorageKey('ai-config')
      : STORAGE_KEY;
  }

  function activeAIChatKey() {
    return typeof getUserStorageKey === 'function'
      ? getUserStorageKey('ai-chat')
      : 'flowlab-ai-chat-v1';
  }

  function activeAISessionsKey() {
    return typeof getUserStorageKey === 'function'
      ? getUserStorageKey('ai-sessions')
      : 'flowlab-ai-sessions-v1';
  }

  function activeAISessionIdKey() {
    return typeof getUserStorageKey === 'function'
      ? getUserStorageKey('ai-active-session')
      : 'flowlab-ai-active-session-v1';
  }

  function currentProjectNameSafe() {
    return (document.getElementById('projTitle')?.value || 'sin_titulo').trim() || 'sin_titulo';
  }

  function generateChatSessionId() {
    return 'chat_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 7);
  }

  function deriveSessionTitle(msgs, fallback = 'Nuevo chat FlowLab') {
    if (!Array.isArray(msgs) || msgs.length === 0) return fallback;
    const firstUser = msgs.find(m => m && m.role === 'user' && String(m.content || '').trim());
    if (!firstUser) return fallback;
    const clean = String(firstUser.content || '')
      .replace(/\s+/g, ' ')
      .trim();
    if (!clean) return fallback;
    return clean.length > 42 ? clean.slice(0, 41).trimEnd() + '…' : clean;
  }

  let aiConfig = loadAIConfig();
  let aiSessions = [];
  let activeSessionId = '';
  let messages = [];
  let sessionsSearchQuery = '';
  let renamingSessionId = null;
  let pendingDeleteSessionId = null;
  let isGenerating = false;
  let currentAbort = null;
  let liveTraceState = null; // Seguimiento en vivo de pasos/fuentes mientras genera
  let liveTraceTimer = null;
  let editingModeTab = aiConfig.mode === 'builtin' ? 'local' : aiConfig.mode;

  // Estado visual en vivo de la conexión actual ('idle' | 'ok' | 'error')
  let connectionHealth = {
    state: 'idle',
    title: '',
    detail: '',
    resolvedEndpoint: ''
  };

  // Inicializar en memoria sin sobreescribir localStorage hasta que initUserWorkspace termine
  hydrateAISessionsFromStorage(false);

  function loadAIConfig() {
    try {
      const raw = localStorage.getItem(activeAIConfigKey());
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

  function loadLegacyAIChatHistory() {
    try {
      const key = activeAIChatKey();
      let raw = localStorage.getItem(key);
      if (!raw && key === 'flowlab-user-local-ai-chat') {
        raw = localStorage.getItem('flowlab-ai-chat-v1');
      }
      if (!raw) return [];
      const arr = JSON.parse(raw);
      return Array.isArray(arr) ? arr.slice(-80) : [];
    } catch {
      return [];
    }
  }

  function hydrateAISessionsFromStorage(shouldPersist = true) {
    let loaded = [];
    try {
      const raw = localStorage.getItem(activeAISessionsKey());
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          loaded = parsed
            .filter(s => s && typeof s === 'object' && typeof s.id === 'string')
            .map(s => ({
              id: s.id,
              title: String(s.title || 'Nuevo chat FlowLab'),
              customTitle: Boolean(s.customTitle),
              projectTitle: String(s.projectTitle || currentProjectNameSafe()),
              createdAt: Number(s.createdAt) || Date.now(),
              updatedAt: Number(s.updatedAt) || Date.now(),
              messages: Array.isArray(s.messages) ? s.messages.slice(-80) : []
            }));
        }
      }
    } catch {}

    // Migración transparente del historial previo (ai-chat) si aún no había registro multi-chat
    if (loaded.length === 0) {
      const legacyMsgs = loadLegacyAIChatHistory();
      const now = Date.now();
      loaded = [
        {
          id: generateChatSessionId(),
          title: legacyMsgs.length ? deriveSessionTitle(legacyMsgs) : 'Nuevo chat FlowLab',
          customTitle: false,
          projectTitle: currentProjectNameSafe(),
          createdAt: now,
          updatedAt: now,
          messages: legacyMsgs
        }
      ];
    }

    aiSessions = loaded;

    let savedActiveId = '';
    try {
      savedActiveId = localStorage.getItem(activeAISessionIdKey()) || '';
    } catch {}

    const foundActive = aiSessions.find(s => s.id === savedActiveId) || aiSessions[0];
    activeSessionId = foundActive.id;
    messages = foundActive.messages;
    if (shouldPersist) {
      persistAISessionsRegistry(false);
    }
  }

  function getActiveAISession() {
    let session = aiSessions.find(s => s.id === activeSessionId);
    if (!session) {
      if (aiSessions.length === 0) {
        const now = Date.now();
        session = {
          id: generateChatSessionId(),
          title: 'Nuevo chat FlowLab',
          customTitle: false,
          projectTitle: currentProjectNameSafe(),
          createdAt: now,
          updatedAt: now,
          messages: []
        };
        aiSessions.unshift(session);
      } else {
        session = aiSessions[0];
      }
      activeSessionId = session.id;
    }
    return session;
  }

  function persistAISessionsRegistry(bumpTimestamp = true) {
    const active = getActiveAISession();
    active.messages = Array.isArray(messages) ? messages.slice(-80) : [];
    if (!active.customTitle) {
      active.title = active.messages.length
        ? deriveSessionTitle(active.messages, active.title || 'Nuevo chat FlowLab')
        : 'Nuevo chat FlowLab';
    }
    if (bumpTimestamp) {
      active.updatedAt = Date.now();
      active.projectTitle = currentProjectNameSafe();
    }

    // Conservar hasta 50 chats completos ordenados por actividad reciente
    aiSessions.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
    if (aiSessions.length > 50) {
      aiSessions = aiSessions.slice(0, 50);
      if (!aiSessions.some(s => s.id === activeSessionId)) {
        activeSessionId = aiSessions[0].id;
        messages = aiSessions[0].messages;
      }
    }

    try {
      localStorage.setItem(activeAISessionsKey(), JSON.stringify(aiSessions));
      localStorage.setItem(activeAISessionIdKey(), activeSessionId);
      // Espejo del chat activo por compatibilidad
      localStorage.setItem(activeAIChatKey(), JSON.stringify(active.messages.slice(-40)));
    } catch {}

    updateAISessionBarUI();
    const drawer = document.getElementById('aiSessionsDrawer');
    if (drawer && !drawer.hidden) {
      renderAISessionsList();
    }
  }

  function saveAIChatHistory(bumpTimestamp = true) {
    persistAISessionsRegistry(bumpTimestamp);
  }

  function structuredCloneFallback(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  function saveAIConfig() {
    try {
      localStorage.setItem(activeAIConfigKey(), JSON.stringify(aiConfig));
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

  // =========================================================================
  // GUARDIÁN DE DOMINIO EXCLUSIVO PARA FLOWLAB + TELEMETRÍA DE ANÁLISIS
  // =========================================================================
  function normalizePlainSpanish(str) {
    return String(str || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  const OFF_TOPIC_RULES = [
    {
      category: 'gastronomía / cocina',
      regex:
        /\b(cocinar|cocino|coinar|cocinando|receta|recetas|arroz|arros|pollo|carne|pescado|pasta|espagueti|tallarin|sopa|guiso|pastel|torta|bizcocho|galletas|hornear|freir|hervir|sazonar|ingrediente|ingredientes|almuerzo|cena|desayuno|postre|ensalada|pizza|hamburguesa|tacos|empanada|empanadas|asado|chipa|sopa paraguaya|calorias|dieta)\b/i
    },
    {
      category: 'entretenimiento / ocio general',
      regex:
        /\b(chiste|chistes|broma|poema|poesia|cancion|letra de|cuento infantil|novela|pelicula|peliculas|serie de tv|netflix|anime|horoscopo|zodiaco|tarot|astrologia|adivinanza|trabalenguas|celebridad|famosos)\b/i
    },
    {
      category: 'deportes / clima / cultura general',
      regex:
        /\b(futbol|partido de|champions|mundial de|messi|cristiano ronaldo|nba|tenis|clima en|va a llover|pronostico del tiempo|capital de|presidente de|rey de|guerra mundial|imperio romano|quien pinto|quien descubrio|sistema solar|planetas|dinosaurios|fotosintesis|tabla periodica|huesos del cuerpo|por que el cielo)\b/i
    },
    {
      category: 'salud / consejos personales',
      regex:
        /\b(dolor de cabeza|dolor de estomago|fiebre|gripe|medicamento|pastilla|antibiotico|receta medica|sintomas de|enfermedad|veterinario|mi novio|mi novia|consejo de amor)\b/i
    }
  ];

  const FLOWLAB_SCOPE_REGEX =
    /\b(flowlab|lienzo|canvas|nodo|nodos|conexion|conexiones|conectar|conectado|arista|aristas|puerto|puertos|flujo|flujos|diagrama|diagramas|workflow|pipeline|mapa|plantilla|plantillas|inspector|propiedades|props|stats|estadistica|estadisticas|metrica|metricas|kpi|roi|grafico|chart|donut|gauge|funnel|barra|barras|consola|terminal|powershell|cmd|comando|puente|bridge|exportar|importar|mermaid|markdown|json|svg|png|proyecto|proyectos|espacio|workspace|usuario|perfil|sesion|sesiones|guardar|guardado|autoguardado|abrir|localstorage|minimapa|minimap|zoom|rejilla|snap|deshacer|rehacer|simular|simulacion|ejecutar|velocidad|bloqueado|bloquear|circuito|atajo|atajos|panel|paleta|cabecera|header|boton|dropdown|selector|chat|chats|historial|inicio|start|fin|end|proceso|procesos|process|decision|condicion|bifurcacion|rama|ramas|entrada|salida|bucle|loop|iteracion|paralelo|subproceso|base de datos|bd|db|sql|postgres|mysql|mongo|variable|varset|api|rest|graphql|http|https|endpoint|url|webhook|hook|try|catch|error|errores|excepcion|espera|delay|timeout|agente|ia|ai|llm|modelo|modelos|ollama|lm studio|openai|gemini|claude|groq|openrouter|clave|token|cors|proxy|servidor|backend|frontend|arquitectura|automatizacion|automatizar|orquestador|etapa|etapas|paso|pasos|secuencia|cuello de botella|optimizar|validar|validacion|autenticacion|login|registro|checkout|pago|pagos|venta|ventas|pedido|pedidos|onboarding|inventario|logistica|soporte|ticket|despliegue|deploy|git|codigo|script|funcion|algoritmo|sistema|pagina|plataforma|herramienta|interfaz)\b/i;

  const FLOWLAB_GREETING_OR_META_REGEX =
    /^(hola|buenas|buenos dias|buenas tardes|buenas noches|hey|que tal|saludos|gracias|muchas gracias|ok|okay|vale|perfecto|entendido|genial|excelente)\b|\b(que puedes hacer|para que sirves|quien eres|que eres|como funcionas|ayuda|ayudame|como uso|como se usa|explicame)\b/i;

  const FLOWLAB_FOLLOWUP_REGEX =
    /^(si|claro|dale|exacto|asi mismo|hazlo|aplicalo|agregalo|anadelo|conectalo|borralo|deshazlo|mejoralo|amplialo|continua|mas detalle|explica mejor|y despues|luego que)\b/i;

  function evaluateFlowLabDomainGuard(rawPrompt, priorMessages = []) {
    const norm = normalizePlainSpanish(rawPrompt);
    if (!norm) {
      return { allowed: true, reason: 'Consulta vacía', category: 'flowlab' };
    }

    const explicitCanvasModeling =
      /\b(flowlab|nodo|nodos|lienzo|canvas|diagrama de flujo|flujo con nodos|plantilla)\b/i.test(norm);

    // 1. Detectar explícitamente consultas fuera de dominio (cocina, chistes, deportes, clima, medicina, etc.)
    for (const rule of OFF_TOPIC_RULES) {
      const m = norm.match(rule.regex);
      if (m && !explicitCanvasModeling) {
        return {
          allowed: false,
          category: rule.category,
          matchedTerm: m[0],
          reason: `Tema detectado fuera del ámbito de FlowLab (${rule.category}: "${m[0]}")`
        };
      }
    }

    // 2. Permitir consultas propias de FlowLab, diagramación, procesos, nodos, terminal, proyectos o arquitectura
    if (FLOWLAB_SCOPE_REGEX.test(norm)) {
      return {
        allowed: true,
        category: 'flowlab',
        reason: 'Consulta vinculada a diagramación, nodos o herramientas de FlowLab'
      };
    }

    // 3. Permitir saludos o preguntas sobre las capacidades del asistente en la página
    if (FLOWLAB_GREETING_OR_META_REGEX.test(norm)) {
      return {
        allowed: true,
        category: 'meta_flowlab',
        reason: 'Consulta sobre capacidades y uso del asistente de FlowLab'
      };
    }

    // 4. Permitir respuestas breves de seguimiento si ya existe una conversación activa de FlowLab
    const hasPriorFlowLabTurn =
      Array.isArray(priorMessages) &&
      priorMessages.some(m => m && m.role === 'assistant' && !m.isOffTopic);
    if (hasPriorFlowLabTurn && norm.length <= 48 && FLOWLAB_FOLLOWUP_REGEX.test(norm)) {
      return {
        allowed: true,
        category: 'followup_flowlab',
        reason: 'Seguimiento contextual de la conversación activa en FlowLab'
      };
    }

    // 5. Cualquier otra pregunta general no vinculada con FlowLab ni procesos/flujos se filtra
    return {
      allowed: false,
      category: 'consulta general ajena a FlowLab',
      matchedTerm: '',
      reason: 'La consulta no guarda relación con FlowLab, diagramas de flujo ni herramientas de la plataforma'
    };
  }

  function buildOffTopicRefusalMessage(domainCheck) {
    const topicHint = domainCheck?.category
      ? ` (*detectado: ${domainCheck.category}*)`
      : '';
    return (
      `Estoy preparado exclusivamente para trabajar en la plataforma **FlowLab**, por lo que no puedo responder consultas ajenas a esta herramienta${topicHint}.\n\n` +
      `En **FlowLab** puedo ayudarte con todo lo referente a tu entorno de trabajo:\n` +
      `- **Crear y conectar nodos** en el lienzo (\`Inicio\`, \`Proceso\`, \`Decisión\`, \`API\`, \`Base de datos\`, \`Agente IA\`, \`Métricas\`...).\n` +
      `- **Analizar tu diagrama activo** para detectar cuellos de botella, rutas incompletas o mejoras de arquitectura.\n` +
      `- **Guiarte en funciones de la página**: gestión de proyectos locales, perfiles de usuario, exportación (\`.json\`, \`.md\`, \`Mermaid\`, \`PNG\`, \`SVG\`) o uso de la consola integrada.`
    );
  }

  function countSavedProjectsSafe() {
    try {
      const key =
        typeof getUserStorageKey === 'function'
          ? getUserStorageKey('projects')
          : 'flowlab-projects-v1';
      const raw = localStorage.getItem(key);
      if (!raw) return 0;
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed.length : 0;
    } catch {
      return 0;
    }
  }

  function buildAnalysisTelemetry(rawPrompt, domainCheck) {
    const activeUser =
      typeof getActiveUser === 'function'
        ? getActiveUser()
        : { id: 'guest', name: 'Invitado', workspaceLabel: 'espacio_local' };
    const prov = getActiveProviderSummary();
    const activeSession = getActiveAISession();
    const priorTurns = Math.max(0, (messages || []).length - 1);

    if (!domainCheck.allowed) {
      return {
        domainStatus: 'blocked_offtopic',
        sources: [
          {
            kind: 'shield',
            label: 'guardia:: ámbito_exclusivo_flowlab',
            detail: domainCheck.reason
          },
          {
            kind: 'engine',
            label: `motor:: ${prov.text}`,
            detail: 'Filtro semántico aplicado antes de generar contenido externo'
          }
        ],
        steps: [
          {
            title: 'Inspección semántica de la consulta',
            detail: `Analizando intención de: "${String(rawPrompt || '').slice(0, 64)}${String(rawPrompt || '').length > 64 ? '…' : ''}"`,
            ms: 38
          },
          {
            title: 'Verificación de política exclusiva FlowLab',
            detail: `${domainCheck.reason}. Se omite respuesta fuera de propósito.`,
            ms: 54
          }
        ]
      };
    }

    const sources = [];
    const steps = [];

    steps.push({
      title: 'Validación de dominio FlowLab',
      detail: domainCheck.reason,
      ms: 34
    });

    sources.push({
      kind: 'shield',
      label: 'dominio:: verificado FlowLab',
      detail: 'Consulta autorizada dentro del ámbito de la plataforma'
    });

    if (aiConfig.includeContext) {
      const ctx = buildWorkspaceContext();
      const canvasKey =
        typeof getUserStorageKey === 'function'
          ? getUserStorageKey('canvas')
          : 'flowlab-coordination-state';

      sources.push({
        kind: 'canvas',
        label: `lienzo:: ${ctx.projectTitle}`,
        detail: `${ctx.summary.totalNodes} nodos · ${ctx.summary.totalEdges} conexiones (${canvasKey})`
      });

      steps.push({
        title: `Lectura del grafo activo "${ctx.projectTitle}"`,
        detail: `Extraídos ${ctx.summary.totalNodes} nodos (${ctx.summary.done} listos, ${ctx.summary.progress} en curso, ${ctx.summary.pending} pendientes, ${ctx.summary.blocked} bloqueados) y ${ctx.summary.totalEdges} aristas desde memoria activa.`,
        ms: 92
      });

      if (ctx.selected) {
        if (ctx.selected.kind === 'node') {
          const shortTxt = String(ctx.selected.text || '').split('\n')[0].slice(0, 28);
          sources.push({
            kind: 'target',
            label: `selección:: ${ctx.selected.type} "${shortTxt}"`,
            detail: `estado ${ctx.selected.status} · ${ctx.selected.incoming.length} entradas · ${ctx.selected.outgoing.length} salidas`
          });
          steps.push({
            title: 'Inspección de nodo enfocado en el inspector',
            detail: `Nodo "${shortTxt}" (${ctx.selected.type}, id ${ctx.selected.id}) con ${ctx.selected.incoming.length} conexiones entrantes y ${ctx.selected.outgoing.length} salientes.`,
            ms: 68
          });
        } else {
          sources.push({
            kind: 'target',
            label: `selección:: conexión #${String(ctx.selected.id).slice(0, 8)}`,
            detail: `${ctx.selected.from} -> ${ctx.selected.to}`
          });
          steps.push({
            title: 'Inspección de arista seleccionada',
            detail: `Conexión activa desde ${ctx.selected.from} hacia ${ctx.selected.to}${ctx.selected.label ? ` ("${ctx.selected.label}")` : ''}.`,
            ms: 56
          });
        }
      } else {
        const incomingSet = new Set((STATE.edges || []).map(e => e.to));
        const outgoingSet = new Set((STATE.edges || []).map(e => e.from));
        const roots = (STATE.nodes || []).filter(n => !incomingSet.has(n.id)).length;
        const leaves = (STATE.nodes || []).filter(n => !outgoingSet.has(n.id)).length;
        steps.push({
          title: 'Análisis topológico del diagrama',
          detail: `Recorrido global sin selección fija: ${roots} nodo(s) raíz y ${leaves} nodo(s) terminales evaluados.`,
          ms: 74
        });
      }
    } else {
      sources.push({
        kind: 'canvas',
        label: 'lienzo:: lectura desactivada',
        detail: 'Chip contexto desactivado manualmente por el usuario'
      });
      steps.push({
        title: 'Omisión de lectura del lienzo',
        detail: 'El usuario desactivó temporalmente el envío del archivo actual; se usa solo el esquema de FlowLab.',
        ms: 28
      });
    }

    const savedProjects = countSavedProjectsSafe();
    sources.push({
      kind: 'storage',
      label: `espacio:: ${activeUser.name}`,
      detail: `${savedProjects} proy. guardados · sesión "${activeSession.title.slice(0, 24)}" (${priorTurns} msjs previos)`
    });

    const nodeTypesCount = Object.keys((typeof CONFIG !== 'undefined' && CONFIG.NODE_TYPES) || {}).length || 23;
    const templatesCount = Object.keys((typeof TEMPLATES !== 'undefined' && TEMPLATES) || {}).length || 7;
    sources.push({
      kind: 'schema',
      label: 'catálogo:: esquema FlowLab',
      detail: `${nodeTypesCount} tipos de nodo · ${templatesCount} plantillas · guía interna`
    });

    steps.push({
      title: 'Consulta de catálogo FlowLab e historial de sesión',
      detail: `Espacio "${activeUser.workspaceLabel || activeUser.name}" (${savedProjects} proyecto(s) en biblioteca), ${nodeTypesCount} tipos de nodo disponibles y ${priorTurns} mensaje(s) previos en este chat.`,
      ms: 64
    });

    let engineDetail = 'Motor estructurado local sin latencia externa';
    if (aiConfig.mode === 'local') {
      engineDetail = `Endpoint local ${aiConfig.local.url || 'localhost'}`;
    } else if (aiConfig.mode === 'api') {
      const p = CLOUD_PROVIDERS[aiConfig.api.provider];
      engineDetail = `${p ? p.name : aiConfig.api.provider} · modelo ${aiConfig.api.model}`;
    } else if (aiConfig.mode === 'url') {
      engineDetail = `Gateway ${aiConfig.url.endpoint || 'URL personalizada'}`;
    }

    sources.push({
      kind: 'engine',
      label: `motor:: ${prov.text}`,
      detail: engineDetail
    });

    steps.push({
      title: `Síntesis de respuesta con ${prov.text}`,
      detail: `${engineDetail}${aiConfig.autoApply ? ' · auto-aplicación de nodos activa' : ' · modo vista previa de acciones'}.`,
      ms: 110
    });

    return {
      domainStatus: 'flowlab',
      sources,
      steps
    };
  }

  function buildSystemPrompt() {
    const ctxBlock = aiConfig.includeContext
      ? '\n\nCONTEXTO ACTUAL DEL ARCHIVO EN EL LIENZO (JSON):\n' +
        JSON.stringify(buildWorkspaceContext(), null, 2)
      : '\n\n(El usuario desactivó temporalmente el envío del contexto del lienzo).';

    return (
      'Eres el Asistente IA exclusivo de la plataforma web FlowLab (sistema visual de diagramas de flujo, nodos y arquitectura). ' +
      'Hablas en español de forma clara, técnica y directa.\n\n' +
      'REGLA ESTRICTA E INQUEBRANTABLE DE ÁMBITO (SOLO FLOWLAB):\n' +
      '- Estás preparado ÚNICA Y EXCLUSIVAMENTE para asistir en el uso de FlowLab, creación/edición/análisis de flujos de nodos, arquitectura de procesos o software en el lienzo, uso de plantillas, proyectos guardados, perfiles de espacio de trabajo, exportación (.json, .md, Mermaid, PNG, SVG) y terminal integrada.\n' +
      '- Si el usuario hace cualquier pregunta ajena a FlowLab (por ejemplo: recetas de cocina como cocinar arroz, deportes, clima, chistes, poemas, medicina, historia general, entretenimiento o tareas no vinculadas a diagramas en FlowLab), NO respondas la pregunta ajena bajo ninguna circunstancia. Indica amablemente que estás preparado exclusivamente para trabajar dentro de la página FlowLab.\n\n' +
      'CAPACIDAD DE CREAR Y EDITAR NODOS EN EL LIENZO:\n' +
      'Cuando el usuario te pida crear nodos, diseñar un flujo, expandir pasos, conectar bloques, cambiar estados o modificar el diagrama, ' +
      'debes explicar brevemente tu propuesta y añadir AL FINAL de tu mensaje un único bloque de código con la etiqueta ```flowlab-actions con JSON válido.\n\n' +
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
      '- Si el usuario SOLO hace una pregunta sobre FlowLab o pide analizar el diagrama sin pedir cambios, responde normalmente SIN incluir ```flowlab-actions.' +
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
    const domainCheck = evaluateFlowLabDomainGuard(userPrompt, messages);
    if (!domainCheck.allowed) {
      return {
        cleanReply: buildOffTopicRefusalMessage(domainCheck),
        actions: null,
        isOffTopic: true
      };
    }

    const q = userPrompt.toLowerCase().trim();
    const norm = normalizePlainSpanish(userPrompt);
    const ctx = buildWorkspaceContext();
    const selNode = ctx.selected && ctx.selected.kind === 'node' ? ctx.selected : null;

    const isHowToQuestion =
      /^(como|donde|para que|que es|cuales son|puedo)\b/i.test(norm) &&
      !/\b(crea|genera|agrega|anade|inserta|construye|arma|disena)\b/i.test(norm);

    const wantsCreation =
      !isHowToQuestion &&
      (/\b(crea|crear|genera|generar|agrega|agregar|anade|añade|añadir|inserta|insertar|construye|arma|diseña|disena|nuevo nodo|nuevos nodos|flujo de|proceso de|expande|expandir)\b/i.test(
        q
      ) ||
        /\b(haz|hacer)\s+(un|una|el|la|dos|tres|\d+)\s+(flujo|diagrama|nodo|nodos|rama|ramas|proceso|secuencia|validacion|validación)\b/i.test(
          q
        ));

    // 1. Solicitudes explícitas de creación de flujos o nodos
    if (wantsCreation) {
      return generateBuiltinFlowProposal(userPrompt, q, selNode);
    }

    // 2. Guía de funcionalidades propias de la página FlowLab
    if (/\b(guardar|guardo|proyecto|proyectos|abrir|biblioteca)\b/i.test(norm)) {
      return {
        cleanReply:
          `Gestión de proyectos en **FlowLab**:\n` +
          `• **Autoguardado continuo**: tu lienzo actual (**\`${ctx.projectTitle}\`**) se sincroniza automáticamente en \`localStorage\` dentro de tu espacio activo.\n` +
          `• **Biblioteca de proyectos**: pulsa el botón **\`proyectos\`** en la cabecera superior para guardar instantáneas con nombre, abrir proyectos previos, duplicarlos o crear un proyecto en blanco.\n` +
          `• Actualmente tienes **${countSavedProjectsSafe()} proyecto(s)** guardado(s) en tu biblioteca local.`,
        actions: null
      };
    }

    if (/\b(usuario|perfil|sesion|sesiones|cuenta|workspace|espacio de trabajo)\b/i.test(norm)) {
      const u = typeof getActiveUser === 'function' ? getActiveUser() : { name: 'Invitado' };
      return {
        cleanReply:
          `Espacios de usuario en **FlowLab** (sesión activa: **${u.name}**):\n` +
          `• Pulsa el indicador de **usuario** en la esquina superior derecha para cambiar de perfil, crear un nuevo espacio de trabajo aislado o protegerlo con PIN local.\n` +
          `• Cada usuario conserva por separado sus **proyectos**, su **lienzo activo**, su **configuración de IA** y su **registro de chats**.`,
        actions: null
      };
    }

    if (/\b(exportar|importar|mermaid|markdown|png|svg|json)\b/i.test(norm)) {
      return {
        cleanReply:
          `Opciones de exportación e importación en **FlowLab**:\n` +
          `• Usa la barra superior derecha junto a \`plantillas::\` para exportar tu diagrama en **\`.json\`**, **Markdown (\`.md\`)**, código **Mermaid**, imagen **PNG** o vector **SVG**.\n` +
          `• También puedes importar archivos \`.json\` de FlowLab para restaurar cualquier arquitectura en el lienzo.`,
        actions: null
      };
    }

    if (/\b(powershell|terminal|consola|puente|bridge)\b/i.test(norm)) {
      return {
        cleanReply:
          `Consola integrada **PowerShell** en **FlowLab**:\n` +
          `• Abre el panel inferior **\`consola\`** y cambia a la pestaña **PowerShell** para ejecutar comandos reales en tu PC mediante el puente local de Vite o el script puente standalone.\n` +
          `• Permite inspeccionar directorios, correr scripts y controlar procesos sin salir del diagrama.`,
        actions: null
      };
    }

    if (FLOWLAB_GREETING_OR_META_REGEX.test(norm) && !norm.includes('analiza') && !norm.includes('nodo')) {
      return {
        cleanReply:
          `Soy el asistente exclusivo de **FlowLab**. Estoy conectado en tiempo real al lienzo **\`${ctx.projectTitle}\`** (**${ctx.summary.totalNodes} nodos** y **${ctx.summary.totalEdges} conexiones**).\n\n` +
          `Puedo ayudarte únicamente con tareas de esta plataforma:\n` +
          `• **Diseñar y añadir nodos**: *"crea un flujo de autenticación"*, *"añade un nodo de decisión Sí/No"*.\n` +
          `• **Auditar tu arquitectura**: *"analiza los cuellos de botella o nodos bloqueados"*.\n` +
          `• **Resolver dudas de FlowLab**: proyectos, espacios de usuario, consola PowerShell o exportación.`,
        actions: null
      };
    }

    // 3. Consultas analíticas con contexto real del archivo actual
    if (q.includes('bloque') || q.includes('cuello') || q.includes('pendiente') || q.includes('analiza') || q.includes('revision') || q.includes('revisión')) {
      const blockedNodes = ctx.nodes.filter(n => n.blocked);
      const incomingSet = new Set(ctx.edges.map(e => e.to));
      const outgoingSet = new Set(ctx.edges.map(e => e.from));
      const isolated = ctx.nodes.filter(n => !incomingSet.has(n.id) && !outgoingSet.has(n.id));

      if (blockedNodes.length === 0) {
        return {
          cleanReply:
            `Análisis de **${ctx.projectTitle}** completado:\n` +
            `• **Estado general**: **${ctx.summary.done}/${ctx.summary.totalNodes}** completados · **${ctx.summary.progress}** en curso · **${ctx.summary.pending}** pendientes.\n` +
            `• **Bloqueos**: **0 nodos bloqueados** en la ruta actual.\n` +
            `• **Conectividad**: **${ctx.summary.totalEdges} conexiones** activas${isolated.length ? ` (${isolated.length} nodo(s) sin conectar)` : ' (todos los nodos están integrados)'}.\n\n` +
            `Si deseas ampliar el diagrama, pídeme por ejemplo: *"agrega validación de errores y métricas al final"*.`,
          actions: null
        };
      }
      const list = blockedNodes
        .slice(0, 6)
        .map(n => `• \`${n.text.split('\n')[0]}\` (${n.type})`)
        .join('\n');
      return {
        cleanReply:
          `Detecté **${blockedNodes.length} nodo(s) bloqueado(s)** en **${ctx.projectTitle}** esperando dependencias previas:\n\n` +
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
        `\nPuedes pedirme crear nodos directamente (ej. *"crea un flujo de autenticación con base de datos"*, *"añade un nodo de decisión con Sí y No"*) o pulsar el icono de configuración arriba para enlazar **Ollama / LM Studio en tu PC**, una **API Key** o una **URL propia**.`,
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
    const tabDotMob = document.getElementById('aiTabDotMobile');
    const banner = document.getElementById('aiConnBanner');
    const bannerTitle = document.getElementById('aiConnBannerTitle');
    const bannerText = document.getElementById('aiConnBannerText');
    const drawer = document.getElementById('aiConfigDrawer');

    if (lbl) lbl.textContent = info.text;

    const isErr = aiConfig.mode !== 'builtin' && connectionHealth.state === 'error';
    const isLive = aiConfig.mode !== 'builtin' && connectionHealth.state === 'ok' && info.configured;
    const isConfigured = aiConfig.mode !== 'builtin' && info.configured && !isErr && !isLive;

    [dot, tabDot, tabDotMob].forEach(el => {
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

  function formatRelativeChatTime(ts) {
    if (!ts) return 'ahora';
    const diffSec = Math.max(0, Math.floor((Date.now() - Number(ts)) / 1000));
    if (diffSec < 45) return 'ahora';
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `hace ${diffMin}m`;
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return `hace ${diffHr}h`;
    const d = new Date(Number(ts));
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    return `${dd}/${mm}`;
  }

  function formatDurationShort(ms) {
    const n = Math.max(40, Number(ms) || 0);
    if (n < 1000) return `${Math.round(n)}ms`;
    return `${(n / 1000).toFixed(1)}s`;
  }

  function getTraceSourceIcon(kind) {
    if (kind === 'shield') return AI_SVG.shield;
    if (kind === 'canvas') return AI_SVG.layers;
    if (kind === 'target') return AI_SVG.target;
    if (kind === 'storage') return AI_SVG.database;
    if (kind === 'schema') return AI_SVG.book;
    if (kind === 'engine') return AI_SVG.cpu;
    return AI_SVG.spark;
  }

  function updateAISessionBarUI() {
    const active = getActiveAISession();
    const countBadge = document.getElementById('aiSessionsCount');
    const titleEl = document.getElementById('aiActiveSessionTitle');
    const metaEl = document.getElementById('aiActiveSessionMeta');
    const subEl = document.getElementById('aiSessionsSubtitle');
    const searchWrap = document.getElementById('aiSessionsSearchWrap');

    if (countBadge) {
      countBadge.textContent = String(aiSessions.length);
    }
    if (titleEl) {
      titleEl.textContent = active.title || 'Nuevo chat FlowLab';
    }
    if (metaEl) {
      const msgCount = Array.isArray(active.messages) ? active.messages.length : 0;
      metaEl.textContent = msgCount > 0 ? `${msgCount} msj · guardado` : 'nuevo · guardado';
    }
    if (subEl) {
      subEl.textContent = `${aiSessions.length} chat${aiSessions.length === 1 ? '' : 's'} guardado${aiSessions.length === 1 ? '' : 's'} en este espacio`;
    }
    if (searchWrap) {
      searchWrap.hidden = aiSessions.length < 3 && !sessionsSearchQuery;
    }
  }

  function toggleSessionsDrawer(forceState) {
    const drawer = document.getElementById('aiSessionsDrawer');
    const btnHist = document.getElementById('btnAiHistory');
    const btnCur = document.getElementById('btnAiSessionCurrent');
    if (!drawer) return;

    const nextOpen = typeof forceState === 'boolean' ? forceState : drawer.hidden;
    if (nextOpen) {
      // Cerrar gaveta de conexión si estaba abierta para mantener limpio el panel
      const cfgDrawer = document.getElementById('aiConfigDrawer');
      if (cfgDrawer && !cfgDrawer.hidden) {
        toggleConfigDrawer(false);
      }
      renamingSessionId = null;
      pendingDeleteSessionId = null;
      renderAISessionsList();
    }

    drawer.hidden = !nextOpen;
    if (btnHist) {
      btnHist.classList.toggle('is-active', nextOpen);
      btnHist.setAttribute('aria-expanded', nextOpen ? 'true' : 'false');
    }
    if (btnCur) {
      btnCur.classList.toggle('is-open', nextOpen);
    }
  }

  function renderAISessionsList() {
    const listEl = document.getElementById('aiSessionsList');
    if (!listEl) return;

    updateAISessionBarUI();

    const q = normalizePlainSpanish(sessionsSearchQuery);
    const filtered = q
      ? aiSessions.filter(s => {
          const inTitle = normalizePlainSpanish(s.title).includes(q);
          const inProj = normalizePlainSpanish(s.projectTitle).includes(q);
          const inMsgs = Array.isArray(s.messages)
            ? s.messages.some(m => normalizePlainSpanish(m.content).includes(q))
            : false;
          return inTitle || inProj || inMsgs;
        })
      : aiSessions;

    if (filtered.length === 0) {
      listEl.innerHTML = `<div class="ai-sessions-empty">No hay conversaciones que coincidan con "${escapeHTML(sessionsSearchQuery)}".</div>`;
      return;
    }

    listEl.innerHTML = filtered
      .map(session => {
        const isCurrent = session.id === activeSessionId;
        const msgCount = Array.isArray(session.messages) ? session.messages.length : 0;
        const timeStr = formatRelativeChatTime(session.updatedAt);
        const projStr = session.projectTitle ? ` · ${session.projectTitle}` : '';

        if (renamingSessionId === session.id) {
          return `
            <div class="ai-session-item ${isCurrent ? 'is-active' : ''} is-editing">
              <div class="ai-session-rename-row">
                <input type="text" class="ai-session-rename-input" data-rename-input="${escapeHTML(session.id)}" value="${escapeHTML(session.title)}" maxlength="60" autocomplete="off">
                <button type="button" class="ai-mini-btn" data-rename-save="${escapeHTML(session.id)}" title="Guardar título">${AI_SVG.check}</button>
                <button type="button" class="ai-mini-btn" data-rename-cancel="1" title="Cancelar">${AI_SVG.cross}</button>
              </div>
            </div>
          `;
        }

        if (pendingDeleteSessionId === session.id) {
          return `
            <div class="ai-session-item ${isCurrent ? 'is-active' : ''} is-confirm-del">
              <span class="ai-session-del-label">¿Eliminar "${escapeHTML(session.title.slice(0, 24))}"?</span>
              <div class="ai-session-del-btns">
                <button type="button" class="ai-mini-btn is-danger" data-del-confirm="${escapeHTML(session.id)}">sí</button>
                <button type="button" class="ai-mini-btn" data-del-cancel="1">no</button>
              </div>
            </div>
          `;
        }

        return `
          <div class="ai-session-item ${isCurrent ? 'is-active' : ''}" role="option" aria-selected="${isCurrent ? 'true' : 'false'}">
            <button type="button" class="ai-session-select" data-select-session="${escapeHTML(session.id)}">
              <span class="ai-session-icon">${AI_SVG.chat}</span>
              <span class="ai-session-body">
                <span class="ai-session-title-row">
                  <span class="ai-session-title">${escapeHTML(session.title || 'Nuevo chat FlowLab')}</span>
                  ${isCurrent ? '<span class="ai-session-pill">activo</span>' : ''}
                </span>
                <span class="ai-session-sub">${msgCount} msj${msgCount === 1 ? '' : 's'}${escapeHTML(projStr)} · ${escapeHTML(timeStr)}</span>
              </span>
            </button>
            <div class="ai-session-actions">
              <button type="button" class="ai-session-act-btn" data-start-rename="${escapeHTML(session.id)}" title="Renombrar chat" aria-label="Renombrar chat">${AI_SVG.edit}</button>
              <button type="button" class="ai-session-act-btn is-del" data-start-del="${escapeHTML(session.id)}" title="Eliminar chat" aria-label="Eliminar chat">${AI_SVG.trash}</button>
            </div>
          </div>
        `;
      })
      .join('');

    listEl.querySelectorAll('[data-select-session]').forEach(btn => {
      btn.addEventListener('click', () => {
        switchAISession(btn.dataset.selectSession);
      });
    });

    listEl.querySelectorAll('[data-start-rename]').forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation();
        renamingSessionId = btn.dataset.startRename;
        pendingDeleteSessionId = null;
        renderAISessionsList();
        const inp = listEl.querySelector(`[data-rename-input="${renamingSessionId}"]`);
        if (inp) {
          inp.focus();
          inp.select();
        }
      });
    });

    listEl.querySelectorAll('[data-rename-save]').forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation();
        const sid = btn.dataset.renameSave;
        const inp = listEl.querySelector(`[data-rename-input="${sid}"]`);
        if (inp) renameAISession(sid, inp.value);
      });
    });

    listEl.querySelectorAll('[data-rename-input]').forEach(inp => {
      inp.addEventListener('keydown', e => {
        if (e.key === 'Enter') {
          e.preventDefault();
          renameAISession(inp.dataset.renameInput, inp.value);
        } else if (e.key === 'Escape') {
          e.preventDefault();
          renamingSessionId = null;
          renderAISessionsList();
        }
      });
    });

    listEl.querySelectorAll('[data-rename-cancel]').forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation();
        renamingSessionId = null;
        renderAISessionsList();
      });
    });

    listEl.querySelectorAll('[data-start-del]').forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation();
        pendingDeleteSessionId = btn.dataset.startDel;
        renamingSessionId = null;
        renderAISessionsList();
      });
    });

    listEl.querySelectorAll('[data-del-confirm]').forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation();
        deleteAISession(btn.dataset.delConfirm);
      });
    });

    listEl.querySelectorAll('[data-del-cancel]').forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation();
        pendingDeleteSessionId = null;
        renderAISessionsList();
      });
    });
  }

  function createNewAISession() {
    if (isGenerating && currentAbort) {
      try { currentAbort.abort(); } catch {}
    }

    // Guardar primero el estado íntegro del chat actual
    persistAISessionsRegistry(false);

    const active = getActiveAISession();
    if (Array.isArray(active.messages) && active.messages.length === 0) {
      toggleSessionsDrawer(false);
      renderAIMessages(true);
      if (!window.matchMedia('(max-width: 768px) and (pointer: coarse)').matches) {
        document.getElementById('aiChatInput')?.focus();
      }
      if (typeof showToast === 'function') {
        showToast('Ya estás en un nuevo chat limpio', 'info', 1600);
      }
      return active;
    }

    const now = Date.now();
    const newSession = {
      id: generateChatSessionId(),
      title: 'Nuevo chat FlowLab',
      customTitle: false,
      projectTitle: currentProjectNameSafe(),
      createdAt: now,
      updatedAt: now,
      messages: []
    };

    aiSessions.unshift(newSession);
    activeSessionId = newSession.id;
    messages = newSession.messages;
    persistAISessionsRegistry(false);
    toggleSessionsDrawer(false);
    renderAIMessages(true);

    if (!window.matchMedia('(max-width: 768px) and (pointer: coarse)').matches) {
      document.getElementById('aiChatInput')?.focus();
    }
    if (typeof showToast === 'function') {
      showToast('Nuevo chat creado · Tus chats anteriores siguen guardados', 'ok', 2000);
    }
    return newSession;
  }

  function switchAISession(targetSessionId) {
    if (!targetSessionId) return false;
    if (isGenerating && currentAbort) {
      try { currentAbort.abort(); } catch {}
    }

    // Guardar el chat saliente antes de cambiar
    persistAISessionsRegistry(false);

    const target = aiSessions.find(s => s.id === targetSessionId);
    if (!target) return false;

    activeSessionId = target.id;
    messages = target.messages;
    try {
      localStorage.setItem(activeAISessionIdKey(), activeSessionId);
      localStorage.setItem(activeAIChatKey(), JSON.stringify((messages || []).slice(-40)));
    } catch {}

    toggleSessionsDrawer(false);
    updateAISessionBarUI();
    renderAIMessages(true);
    return true;
  }

  function renameAISession(sessionId, rawTitle) {
    const target = aiSessions.find(s => s.id === sessionId);
    renamingSessionId = null;
    if (!target) {
      renderAISessionsList();
      return false;
    }
    const clean = String(rawTitle || '').trim();
    if (clean) {
      target.title = clean.slice(0, 60);
      target.customTitle = true;
      persistAISessionsRegistry(false);
    }
    renderAISessionsList();
    return true;
  }

  function deleteAISession(sessionId) {
    pendingDeleteSessionId = null;
    const idx = aiSessions.findIndex(s => s.id === sessionId);
    if (idx === -1) return false;

    const wasActive = aiSessions[idx].id === activeSessionId;
    aiSessions.splice(idx, 1);

    if (aiSessions.length === 0) {
      const now = Date.now();
      const fresh = {
        id: generateChatSessionId(),
        title: 'Nuevo chat FlowLab',
        customTitle: false,
        projectTitle: currentProjectNameSafe(),
        createdAt: now,
        updatedAt: now,
        messages: []
      };
      aiSessions.push(fresh);
      activeSessionId = fresh.id;
      messages = fresh.messages;
    } else if (wasActive) {
      activeSessionId = aiSessions[0].id;
      messages = aiSessions[0].messages;
    }

    persistAISessionsRegistry(false);
    renderAIMessages(true);
    renderAISessionsList();

    if (typeof showToast === 'function') {
      showToast('Conversación eliminada del registro', 'info', 1600);
    }
    return true;
  }

  function formatAssistantMarkdown(rawText) {
    const safe = escapeHTML(rawText || '');
    return safe
      .replace(/`([^`\n]+)`/g, '<code class="ai-inline-code">$1</code>')
      .replace(/\*\*([^*\n]+)\*\*/g, '<strong>$1</strong>')
      .replace(/\*([^*\n]+)\*/g, '<em>$1</em>')
      .replace(/\n/g, '<br>');
  }

  function renderTraceAccordionHtml(trace, msgIdx, isExpanded) {
    if (!trace || (!Array.isArray(trace.sources) && !Array.isArray(trace.steps))) {
      return '';
    }
    const sources = Array.isArray(trace.sources) ? trace.sources : [];
    const steps = Array.isArray(trace.steps) ? trace.steps : [];
    const isBlocked = trace.domainStatus === 'blocked_offtopic';
    const headIcon = isBlocked ? AI_SVG.shield : AI_SVG.spark;
    const summaryLabel = isBlocked
      ? `Ámbito FlowLab verificado · consulta filtrada (${formatDurationShort(trace.durationMs)})`
      : `Analizado · ${sources.length} fuente${sources.length === 1 ? '' : 's'} · ${formatDurationShort(trace.durationMs)}`;

    const sourcesHtml = sources.length
      ? `
        <div class="ai-trace-section">
          <div class="ai-trace-sec-title">:: de dónde obtiene la información</div>
          <div class="ai-trace-sources">
            ${sources
              .map(
                s => `
              <div class="ai-source-chip" title="${escapeHTML(s.detail || '')}">
                <span class="ai-source-chip__icon">${getTraceSourceIcon(s.kind)}</span>
                <span class="ai-source-chip__label">${escapeHTML(s.label || '')}</span>
                ${s.detail ? `<span class="ai-source-chip__detail">${escapeHTML(s.detail)}</span>` : ''}
              </div>
            `
              )
              .join('')}
          </div>
        </div>
      `
      : '';

    const stepsHtml = steps.length
      ? `
        <div class="ai-trace-section">
          <div class="ai-trace-sec-title">:: registros de análisis paso a paso</div>
          <div class="ai-trace-steps">
            ${steps
              .map(
                st => `
              <div class="ai-trace-step">
                <span class="ai-trace-step__icon">${isBlocked ? AI_SVG.shield : AI_SVG.check}</span>
                <div class="ai-trace-step__body">
                  <div class="ai-trace-step__head">
                    <strong>${escapeHTML(st.title || '')}</strong>
                    ${st.ms ? `<span class="ai-trace-step__ms">${escapeHTML(formatDurationShort(st.ms))}</span>` : ''}
                  </div>
                  ${st.detail ? `<div class="ai-trace-step__detail">${escapeHTML(st.detail)}</div>` : ''}
                </div>
              </div>
            `
              )
              .join('')}
          </div>
        </div>
      `
      : '';

    return `
      <div class="ai-trace-box ${isExpanded ? 'is-open' : ''} ${isBlocked ? 'is-guard' : ''}">
        <button type="button" class="ai-trace-toggle" data-trace-toggle="${msgIdx}" aria-expanded="${isExpanded ? 'true' : 'false'}">
          <span class="ai-trace-toggle__left">
            <span class="ai-trace-toggle__icon">${headIcon}</span>
            <span class="ai-trace-toggle__text">${escapeHTML(summaryLabel)}</span>
          </span>
          <span class="ai-trace-toggle__right">
            <span>registros</span>
            <span class="ai-trace-chev">${AI_SVG.chevronDown}</span>
          </span>
        </button>
        <div class="ai-trace-panel" ${isExpanded ? '' : 'hidden'}>
          ${sourcesHtml}
          ${stepsHtml}
        </div>
      </div>
    `;
  }

  function buildLiveTraceCardInnerHtml() {
    if (!liveTraceState) {
      return `
        <div class="ai-typing">
          <span class="ai-typing-dots"><i></i><i></i><i></i></span>
          <span>analizando contexto de FlowLab...</span>
        </div>
      `;
    }

    const elapsedMs = Math.max(0, Date.now() - liveTraceState.startedAt);
    const activeIdx = liveTraceState.activeStepIndex || 0;
    const steps = liveTraceState.steps || [];
    const sources = liveTraceState.sources || [];
    const visibleSources = sources.slice(0, Math.min(sources.length, activeIdx + 2));

    return `
      <div class="ai-live-trace">
        <div class="ai-live-trace__head">
          <span class="ai-live-trace__title">
            <span class="ai-typing-dots"><i></i><i></i><i></i></span>
            <span>Analizando registros de FlowLab…</span>
          </span>
          <span class="ai-live-trace__timer" id="aiLiveTraceElapsed">${escapeHTML(formatDurationShort(elapsedMs))}</span>
        </div>
        <div class="ai-live-trace__sources">
          ${visibleSources
            .map(
              s => `
            <span class="ai-live-source-pill">
              ${getTraceSourceIcon(s.kind)}
              <span>${escapeHTML(s.label)}</span>
            </span>
          `
            )
            .join('')}
        </div>
        <div class="ai-live-trace__steps">
          ${steps
            .slice(0, activeIdx + 1)
            .map((st, idx) => {
              const done = idx < activeIdx;
              return `
                <div class="ai-live-step ${done ? 'is-done' : 'is-running'}">
                  <span class="ai-live-step__mark">${done ? AI_SVG.check : AI_SVG.loader}</span>
                  <div class="ai-live-step__text">
                    <strong>${escapeHTML(st.title)}</strong>
                    <span>${escapeHTML(st.detail)}</span>
                  </div>
                </div>
              `;
            })
            .join('')}
        </div>
      </div>
    `;
  }

  function renderAIMessages(skipPersist = false) {
    if (!skipPersist) saveAIChatHistory(false);
    else updateAISessionBarUI();

    const container = document.getElementById('aiMessages');
    if (!container) return;

    if (messages.length === 0 && !isGenerating) {
      container.innerHTML = `
        <div class="ai-welcome">
          <div class="ai-welcome-badge">${AI_SVG.spark}<span>copiloto exclusivo de flowlab</span></div>
          <h4>Habla con tu flujo y crea nodos</h4>
          <p>Analizo en tiempo real el lienzo activo, tus proyectos y el esquema de FlowLab. Tus conversaciones quedan guardadas automáticamente incluso si recargas la página.</p>
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

        const traceHtml = renderTraceAccordionHtml(msg.trace, idx, Boolean(msg.traceExpanded));

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
          <div class="ai-msg ai-msg--assistant ${msg.isError ? 'is-error' : ''} ${msg.isOffTopic ? 'is-offtopic' : ''}">
            <div class="ai-msg-meta">${escapeHTML(msg.providerTag || 'IA')}</div>
            <div class="ai-bubble ai-bubble--assistant">
              ${traceHtml}
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
      thinkingEl.id = 'aiLiveThinkingWrap';
      thinkingEl.innerHTML = `
        <div class="ai-bubble ai-bubble--assistant ai-bubble--live">
          ${buildLiveTraceCardInnerHtml()}
        </div>
      `;
      container.appendChild(thinkingEl);
    }

    container.querySelectorAll('[data-trace-toggle]').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = Number(btn.dataset.traceToggle);
        const m = messages[idx];
        if (!m) return;
        m.traceExpanded = !m.traceExpanded;
        const box = btn.closest('.ai-trace-box');
        const panel = box ? box.querySelector('.ai-trace-panel') : null;
        if (box && panel) {
          box.classList.toggle('is-open', Boolean(m.traceExpanded));
          btn.setAttribute('aria-expanded', m.traceExpanded ? 'true' : 'false');
          panel.hidden = !m.traceExpanded;
        }
        saveAIChatHistory(false);
      });
    });

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
        saveAIChatHistory(true);
        renderAIMessages(true);
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
          saveAIChatHistory(true);
          renderAIMessages(true);
          showToast('Cambios de IA deshechos', 'info', 1600);
        }
      });
    });

    container.scrollTop = container.scrollHeight;
  }

  function updateLiveThinkingDOM() {
    const wrap = document.getElementById('aiLiveThinkingWrap');
    const container = document.getElementById('aiMessages');
    if (!wrap) return;
    const bubble = wrap.querySelector('.ai-bubble--live');
    if (bubble) {
      bubble.innerHTML = buildLiveTraceCardInnerHtml();
    }
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  }

  function waitAbortableStep(ms, signal) {
    if (!ms || ms <= 0) return Promise.resolve();
    return new Promise((resolve, reject) => {
      if (signal && signal.aborted) {
        const err = new Error('Aborted');
        err.name = 'AbortError';
        reject(err);
        return;
      }
      const timer = setTimeout(() => {
        if (signal) signal.removeEventListener('abort', onAbort);
        resolve();
      }, ms);
      function onAbort() {
        clearTimeout(timer);
        const err = new Error('Aborted');
        err.name = 'AbortError';
        reject(err);
      }
      if (signal) signal.addEventListener('abort', onAbort, { once: true });
    });
  }

  async function sendAIChatMessage(rawInput) {
    const text = String(rawInput || '').trim();
    if (!text || isGenerating) return;

    const inputEl = document.getElementById('aiChatInput');
    if (inputEl && inputEl.value.trim() === text) {
      inputEl.value = '';
    }

    // Cerrar lista de sesiones si estaba desplegada para ver el proceso en vivo
    toggleSessionsDrawer(false);

    const priorSnapshot = messages.slice();

    messages.push({
      role: 'user',
      content: text,
      timestamp: Date.now()
    });
    saveAIChatHistory(true);

    const startedAt = Date.now();
    const domainCheck = evaluateFlowLabDomainGuard(text, priorSnapshot);
    const telemetry = buildAnalysisTelemetry(text, domainCheck);

    liveTraceState = {
      startedAt,
      activeStepIndex: 0,
      domainStatus: telemetry.domainStatus,
      sources: telemetry.sources,
      steps: telemetry.steps
    };

    isGenerating = true;
    currentAbort = new AbortController();
    toggleGeneratingControls(true);
    renderAIMessages(true);

    if (liveTraceTimer) clearInterval(liveTraceTimer);
    liveTraceTimer = setInterval(() => {
      const timerEl = document.getElementById('aiLiveTraceElapsed');
      if (timerEl && liveTraceState) {
        timerEl.textContent = formatDurationShort(Date.now() - liveTraceState.startedAt);
      }
    }, 100);

    const provSummary = getActiveProviderSummary();
    const stepDelay = window.__FLOWLAB_FAST_TEST ? 0 : 95;

    try {
      // Recorrer en vivo las fases de inspección de fuentes antes de emitir la síntesis final
      const totalPreSteps = Math.max(0, telemetry.steps.length - 1);
      for (let i = 0; i < totalPreSteps; i++) {
        liveTraceState.activeStepIndex = i;
        updateLiveThinkingDOM();
        await waitAbortableStep(stepDelay, currentAbort.signal);
      }
      liveTraceState.activeStepIndex = Math.max(0, telemetry.steps.length - 1);
      updateLiveThinkingDOM();

      // Si la consulta es ajena a FlowLab, filtrarla sin consumir API externa ni salir del dominio
      if (!domainCheck.allowed) {
        await waitAbortableStep(stepDelay, currentAbort.signal);
        const totalDuration = Math.max(85, Date.now() - startedAt);
        messages.push({
          role: 'assistant',
          content: buildOffTopicRefusalMessage(domainCheck),
          actions: null,
          applied: false,
          createdNodeIds: [],
          isOffTopic: true,
          providerTag: `Guardia FlowLab · ${provSummary.text}`,
          traceExpanded: false,
          trace: {
            durationMs: totalDuration,
            domainStatus: 'blocked_offtopic',
            sources: telemetry.sources,
            steps: telemetry.steps
          },
          timestamp: Date.now()
        });
        saveAIChatHistory(true);
        return;
      }

      if (aiConfig.mode === 'builtin') {
        await waitAbortableStep(stepDelay, currentAbort.signal);
      }

      const llmStart = Date.now();
      const result = await callExternalAI(text, currentAbort.signal);
      const llmElapsed = Math.max(60, Date.now() - llmStart);

      if (aiConfig.mode !== 'builtin') {
        connectionHealth = {
          state: 'ok',
          title: 'Conectado',
          detail: '',
          resolvedEndpoint: connectionHealth.resolvedEndpoint
        };
        updateProviderHeaderUI();
      }

      const finalSteps = telemetry.steps.map((st, idx) =>
        idx === telemetry.steps.length - 1 ? { ...st, ms: llmElapsed } : st
      );

      if (result.actions && Array.isArray(result.actions.operations) && result.actions.operations.length > 0) {
        finalSteps.push({
          title: 'Estructuración de operaciones sobre el lienzo',
          detail: `Preparadas ${result.actions.operations.length} operación(es) (${result.actions.summary || 'cambios en nodos y conexiones'}).`,
          ms: 26
        });
      }

      const totalDuration = Math.max(110, Date.now() - startedAt);

      const assistantMsg = {
        role: 'assistant',
        content: result.cleanReply,
        rawModelText: result.cleanReply,
        actions: result.actions,
        applied: false,
        createdNodeIds: [],
        isOffTopic: Boolean(result.isOffTopic),
        providerTag: provSummary.text,
        traceExpanded: false,
        trace: {
          durationMs: totalDuration,
          domainStatus: result.isOffTopic ? 'blocked_offtopic' : 'flowlab',
          sources: telemetry.sources,
          steps: finalSteps
        },
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
      saveAIChatHistory(true);
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
          trace: {
            durationMs: Math.max(60, Date.now() - startedAt),
            domainStatus: 'error',
            sources: telemetry.sources,
            steps: [
              ...telemetry.steps.slice(0, -1),
              {
                title: 'Fallo al contactar proveedor externo',
                detail: errTitle,
                ms: Math.max(40, Date.now() - startedAt)
              }
            ]
          },
          timestamp: Date.now()
        });
      }
      saveAIChatHistory(true);
    } finally {
      if (liveTraceTimer) {
        clearInterval(liveTraceTimer);
        liveTraceTimer = null;
      }
      liveTraceState = null;
      isGenerating = false;
      currentAbort = null;
      toggleGeneratingControls(false);
      updateAIChatContextUI();
      renderAIMessages(true);
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
    if (nextOpen) {
      const sessDrawer = document.getElementById('aiSessionsDrawer');
      if (sessDrawer && !sessDrawer.hidden) {
        toggleSessionsDrawer(false);
      }
    }
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
    if (typeof openMobileRightPanel === 'function' && window.matchMedia('(max-width: 980px)').matches) {
      openMobileRightPanel('ai');
    } else {
      const panelEl = document.getElementById('rightPanel') || document.querySelector('aside.panel');
      if (panelEl && window.matchMedia('(max-width: 980px)').matches) {
        panelEl.classList.add('mobile-open');
      }
      if (typeof switchRightPanelTab === 'function') {
        switchRightPanelTab('ai');
      }
    }

    if (openConfig) {
      toggleConfigDrawer(true);
    } else if (!window.matchMedia('(max-width: 768px) and (pointer: coarse)').matches) {
      setTimeout(() => {
        document.getElementById('aiChatInput')?.focus();
      }, 40);
    }
  }

  function initAIAssistant() {
    hydrateAISessionsFromStorage();
    updateProviderHeaderUI();
    updateAIChatContextUI();
    updateAISessionBarUI();
    renderAIMessages(true);

    document.getElementById('btnAiConfig')?.addEventListener('click', () => toggleConfigDrawer());
    document.getElementById('btnAiProviderPill')?.addEventListener('click', () => toggleConfigDrawer());
    document.getElementById('btnAiFixConn')?.addEventListener('click', () => toggleConfigDrawer(true));

    document.getElementById('btnAiNewChat')?.addEventListener('click', () => createNewAISession());
    document.getElementById('btnAiDrawerNewChat')?.addEventListener('click', () => createNewAISession());
    document.getElementById('btnAiHistory')?.addEventListener('click', () => toggleSessionsDrawer());
    document.getElementById('btnAiSessionCurrent')?.addEventListener('click', () => toggleSessionsDrawer());

    const searchInput = document.getElementById('aiSessionSearchInput');
    if (searchInput) {
      searchInput.addEventListener('input', e => {
        sessionsSearchQuery = e.target.value || '';
        renderAISessionsList();
      });
    }

    document.getElementById('btnAiClear')?.addEventListener('click', () => {
      if (!messages || messages.length === 0) {
        if (typeof showToast === 'function') {
          showToast('El chat actual ya está vacío', 'info', 1400);
        }
        return;
      }
      const active = getActiveAISession();
      messages = [];
      active.messages = [];
      if (!active.customTitle) {
        active.title = 'Nuevo chat FlowLab';
      }
      persistAISessionsRegistry(true);
      renderAIMessages(true);
      if (typeof showToast === 'function') {
        showToast('Chat actual vaciado (los demás chats siguen guardados)', 'info', 1800);
      }
    });

    window.addEventListener('beforeunload', () => {
      try {
        persistAISessionsRegistry(false);
      } catch {}
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
      if (typeof closeMobileRightPanel === 'function') {
        closeMobileRightPanel();
      } else {
        document.getElementById('rightPanel')?.classList.remove('mobile-open');
      }
    });
  }

  function reloadAIAssistantForActiveUser() {
    if (currentAbort) {
      try { currentAbort.abort(); } catch {}
      currentAbort = null;
    }
    if (liveTraceTimer) {
      clearInterval(liveTraceTimer);
      liveTraceTimer = null;
    }
    liveTraceState = null;
    isGenerating = false;
    sessionsSearchQuery = '';
    renamingSessionId = null;
    pendingDeleteSessionId = null;
    const searchEl = document.getElementById('aiSessionSearchInput');
    if (searchEl) searchEl.value = '';

    aiConfig = loadAIConfig();
    hydrateAISessionsFromStorage();
    editingModeTab = aiConfig.mode === 'builtin' ? 'local' : aiConfig.mode;
    connectionHealth = { state: 'idle', title: '', detail: '', resolvedEndpoint: '' };
    toggleConfigDrawer(false);
    toggleSessionsDrawer(false);
    updateProviderHeaderUI();
    updateAIChatContextUI();
    updateAISessionBarUI();
    renderAIMessages(true);
  }

  window.initAIAssistant = initAIAssistant;
  window.openAISidebarTab = openAISidebarTab;
  window.updateAIChatContextUI = updateAIChatContextUI;
  window.sendAIChatMessage = sendAIChatMessage;
  window.reloadAIAssistantForActiveUser = reloadAIAssistantForActiveUser;
  window.createNewAISession = createNewAISession;
  window.switchAISession = switchAISession;
  window.getAISessionsSnapshot = () => aiSessions.map(s => ({ ...s }));
  window.evaluateFlowLabDomainGuard = evaluateFlowLabDomainGuard;
})();
