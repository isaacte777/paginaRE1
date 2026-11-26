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
      '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>',
    fileDoc:
      '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="14" y2="17"/></svg>',
    imageIcon:
      '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>',
    paperclip:
      '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>'
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
    chart_bar: 'chart_bar',
    chart_donut: 'chart_donut',
    chart_gauge: 'chart_gauge',
    chart_funnel: 'chart_funnel',
    celda: 'fin_input',
    formula: 'fin_formula',
    suma: 'fin_sum',
    ingresos: 'fin_revenue',
    ebitda: 'fin_ebitda',
    van: 'fin_npv',
    npv: 'fin_npv',
    tir: 'fin_irr',
    irr: 'fin_irr',
    cuota: 'fin_pmt',
    pmt: 'fin_pmt'
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
  let pendingAttachments = []; // Archivos e imágenes adjuntados listos para enviar
  let lastLayoutOptions = { mode: 'domain_bridge', density: 'normal' };

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
    /\b(flowlab|lienzo|canvas|planilla|planillas|finanza\w*|financie\w*|excel|celda\w*|formula\w*|van|vna|npv|tir|irr|ebitda|ebit|opex|capex|margen|utilidad|amortiz\w*|prestamo\w*|credito\w*|cuota\w*|interes\w*|tasa\w*|impuesto\w*|iva|flujo de caja|cashflow|balance|presupuest\w*|nomina|runway|roe|roa|cagr|nodo\w*|conexion\w*|conect\w*|arista\w*|puerto\w*|flecha\w*|conector\w*|linea\w*|cruce\w*|solap\w*|encima\w*|flujo\w*|diagrama\w*|workflow\w*|pipeline\w*|mapa\w*|plantilla\w*|ordena\w*|organiza\w*|reordena\w*|acomoda\w*|alinea\w*|compacta\w*|distribuy\w*|separa\w*|agrupa\w*|junta\w*|ubica\w*|coloca\w*|ponlo\w*|ponlos|cambialo\w*|muevelo\w*|arregla\w*|corrig\w*|limpia\w*|mejora\w*|vertical\w*|horizontal\w*|arbol\w*|cascada\w*|matriz|cuadricula|grilla|radial\w*|circul\w*|serpentina|zig\s*zag|kanban|carril\w*|swimlane\w*|estrella|diagonal\w*|escalera|organico|columna\w*|fila\w*|arriba hacia abajo|abajo hacia arriba|izquierda a derecha|derecha a izquierda|distancia\w*|espaciado\w*|amplio\w*|inspector|propiedades|props|stats|estadistic\w*|metrica\w*|kpi\w*|roi|grafico\w*|chart\w*|donut|gauge|funnel|barra\w*|consola|terminal|powershell|cmd|comando\w*|puente|bridge|exporta\w*|importa\w*|mermaid|markdown|json|svg|png|jpg|jpeg|webp|csv|tsv|pdf|word|docx|xlsx|pptx|odt|ods|documento\w*|archivo\w*|adjunto\w*|adjunta\w*|imagen\w*|foto\w*|captura\w*|lee\w*|analiza\w*|extrae\w*|extraig\w*|resum\w*|conviert\w*|transforma\w*|tarea\w*|trabajo\w*|actividad\w*|pendiente\w*|cronograma|entregable\w*|requisito\w*|crea\w*|genera\w*|arma\w*|construy\w*|disena\w*|agrega\w*|anad\w*|inserta\w*|proyecto\w*|espacio\w*|workspace|usuario\w*|perfil\w*|sesion\w*|guarda\w*|autoguardado|abrir|localstorage|minimapa|minimap|zoom|rejilla|snap|deshacer|rehacer|simula\w*|ejecuta\w*|velocidad|bloquead\w*|bloquear|circuito\w*|atajo\w*|panel|paleta|cabecera|header|boton|dropdown|selector|chat\w*|historial|inicio|start|fin|end|proceso\w*|process|decision\w*|condicion\w*|bifurcacion|rama\w*|entrada\w*|salida\w*|bucle\w*|loop|iteracion|paralelo\w*|subproceso\w*|base de datos|bd|db|sql|postgres|mysql|mongo|variable\w*|varset|api|rest|graphql|http|https|endpoint|url|webhook|hook|try|catch|error\w*|excepcion|espera|delay|timeout|agente\w*|ia|ai|llm|modelo\w*|ollama|lm studio|openai|gemini|claude|groq|openrouter|clave|token|cors|proxy|servidor|backend|frontend|arquitectura|automatiz\w*|orquestador|etapa\w*|paso\w*|secuencia\w*|cuello de botella|optimiz\w*|valida\w*|autenticacion|login|registro|checkout|pago\w*|venta\w*|pedido\w*|onboarding|inventario|logistica|soporte|ticket\w*|despliegue|deploy|git|codigo|script|funcion|algoritmo|sistema|pagina|plataforma|herramienta|interfaz)\b/i;

  const FLOWLAB_GREETING_OR_META_REGEX =
    /^(hola|buenas|buenos dias|buenas tardes|buenas noches|hey|que tal|saludos|gracias|muchas gracias|ok|okay|vale|perfecto|entendido|genial|excelente)\b|\b(que puedes hacer|para que sirves|quien eres|que eres|como funcionas|ayuda|ayudame|como uso|como se usa|explicame|de cuantas formas|cuantas maneras)\b/i;

  const FLOWLAB_FOLLOWUP_REGEX =
    /^(si|claro|dale|exacto|asi mismo|hazlo|aplicalo|agregalo|anadelo|conectalo|borralo|deshazlo|mejoralo|amplialo|continua|mas detalle|explica mejor|y despues|luego que|mas amplio|mas compacto|mas junto|mas separado|al reves|en vertical|en horizontal|de otra forma|otra distribucion|sin cruces)\b/i;

  function evaluateFlowLabDomainGuard(rawPrompt, priorMessages = [], hasAttachments = false) {
    if (hasAttachments || (pendingAttachments && pendingAttachments.length > 0)) {
      return {
        allowed: true,
        category: 'attachments_flowlab',
        reason: 'Lectura de documentos o imágenes adjuntas para trabajar en FlowLab'
      };
    }

    const norm = normalizePlainSpanish(rawPrompt);
    if (!norm) {
      return { allowed: true, reason: 'Consulta vacía', category: 'flowlab' };
    }

    // Detectar cualquier solicitud natural de orden/disposición espacial (ej. "ordenalo de forma vertical")
    if (typeof window.parseNaturalLayoutIntent === 'function') {
      const layoutIntent = window.parseNaturalLayoutIntent(rawPrompt);
      if (layoutIntent && layoutIntent.matched) {
        return {
          allowed: true,
          category: 'layout_flowlab',
          reason: `Solicitud de organización espacial (${layoutIntent.label})`
        };
      }
    }

    const explicitCanvasModeling =
      /\b(flowlab|nodo\w*|lienzo|canvas|diagrama|flujo\w*|planilla|plantilla|tarea\w*|documento\w*|archivo\w*)\b/i.test(norm);

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

    // 2. Permitir consultas propias de FlowLab, organización, documentos, tareas, nodos, finanzas o arquitectura
    if (FLOWLAB_SCOPE_REGEX.test(norm)) {
      return {
        allowed: true,
        category: 'flowlab',
        reason: 'Consulta vinculada a diagramación, nodos, documentos o herramientas de FlowLab'
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
    if (hasPriorFlowLabTurn && norm.length <= 90 && FLOWLAB_FOLLOWUP_REGEX.test(norm)) {
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
      `- **Leer imágenes y documentos** (\`PNG\`, \`JPG\`, \`PDF\`, \`Word\`, \`Excel\`, \`CSV\`, \`TXT\`, \`JSON\`...) para extraer requisitos y **armar tareas o modelos financieros** en el lienzo.\n` +
      `- **Organizar nodos de decenas de formas**: pídeme *«ordénalo de forma vertical»*, *«en horizontal»*, *«en árbol»*, *«en carriles por tipo»*, *«modo kanban»*, *«planilla por celdas»*, *«en cuadrícula de 4 columnas»*, *«en anillos radiales»* o *«separa flujo y finanzas»*.\n` +
      `- **Crear, conectar y auditar flujos o planillas \`fx\`** (\`Inicio\`, \`Proceso\`, \`Decisión\`, \`API\`, \`Base de datos\`, \`VAN/TIR\`, \`EBITDA\`, \`Gráficos\`...).`
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

  function buildSystemPrompt(attachmentsPromptBlock = '') {
    const ctxBlock = aiConfig.includeContext
      ? '\n\nCONTEXTO ACTUAL DEL ARCHIVO EN EL LIENZO (JSON):\n' +
        JSON.stringify(buildWorkspaceContext(), null, 2)
      : '\n\n(El usuario desactivó temporalmente el envío del contexto del lienzo).';

    const docBlock = attachmentsPromptBlock
      ? '\n\nARCHIVOS E IMÁGENES ADJUNTOS EN ESTE TURNO (ANALÍZALOS A FONDO):\n' + attachmentsPromptBlock
      : '';

    return (
      'Eres el Arquitecto, Analista Documental y Asistente IA exclusivo de la plataforma web FlowLab (sistema visual de diagramas de flujo, tareas operativas, arquitectura y planillas financieras fx). ' +
      'Hablas en español de forma clara, natural, estructurada, útil y empática.\n\n' +
      'REGLA DE ÁMBITO:\n' +
      '- Asistes en TODO lo relacionado con FlowLab: lectura de documentos e imágenes adjuntas para extraer y armar tareas/flujos/planillas en el lienzo, organización espacial avanzada de nodos ("ordénalo vertical", "horizontal", "en árbol", "kanban", "carriles", "cuadrícula", "radial", "separa flujo y finanzas", etc.), creación/edición/auditoría de nodos, fórmulas y gráficas financieras de ganancia/pérdida, plantillas, proyectos, perfiles, exportación y consola PowerShell.\n' +
      '- NUNCA rechaces instrucciones breves o con pronombres enclíticos sobre el lienzo o el trabajo del usuario (ej. "ordenalo de forma vertical", "acomódalo mejor", "separa las flechas", "arma las tareas de este PDF/imagen"). Solo rechaza temas claramente ajenos como recetas de cocina, chistes, deportes, clima o horóscopos.\n\n' +
      'LECTURA DE IMÁGENES Y DOCUMENTOS:\n' +
      '- Cuando el usuario adjunte imágenes o documentos (PDF, Word, Excel, CSV, TXT, JSON, código, etc.), lee cuidadosamente su contenido extraído/visual, entrega primero un resumen ejecutivo claro de lo detectado y, si pide crear tareas, flujo o modelo financiero (o adjunta el archivo para llevarlo al lienzo), incluye al final el bloque `flowlab-actions` bien conectado.\n\n' +
      'MOTOR PARAMÉTRICO DE ORGANIZACIÓN DE NODOS (16 ARQUITECTURAS + VARIANTES):\n' +
      '- Cuando el usuario pida ordenar, organizar, alinear o redistribuir los nodos, emite `{ "op": "organize_canvas", "mode": "<modo>", "density": "<compact|normal|airy|ultra_wide>", "columns": <opcional>, "reverse": <bool>, "sortBy": "<topology|type|status|alpha>" }`.\n' +
      '- Modos disponibles en `"mode"`: `domain_bridge` (separa limpiamente Flujo Operativo a la izquierda y Planilla Financiera fx a la derecha), `vertical` (arriba hacia abajo puro sin doblar columnas), `horizontal` (izquierda a derecha tipo cronograma), `compact` (columnas balanceadas), `tree_down` (árbol jerárquico), `tree_right` (árbol lateral), `swimlanes_type` (carriles por tipo de nodo), `kanban_status` (tablero Kanban por estado Pendiente/En curso/Completado/Error), `excel_sheet` (hoja financiera por columnas A, B, C...), `snake_serpentine` (serpentina continua), `grid_matrix` (cuadrícula uniforme de N columnas), `radial_rings` (anillos concéntricos), `circular` (anillo perimetral), `hub_spoke` (estrella central), `cascade_diagonal` (escalera diagonal), `organic_force` (distribución orgánica por fuerzas).\n\n' +
      'REGLAS DE CALIDAD ARQUITECTÓNICA AL CREAR O EDITAR NODOS (`flowlab-actions`):\n' +
      '1. NUNCA incluyas coordenadas `x` ni `y` en los nodos.\n' +
      '2. TEXTOS CONCISOS Y LEGIBLES: `"text"` de 2 a 6 palabras (máximo 44 caracteres). Detalles extensos van en `"params": { "notes": "..." }`.\n' +
      '3. TIPADO SEMÁNTICO PRECISO:\n' +
      '   - Flujo / Tareas: `start`, `io`, `process`, `decision` (`¿...?` con salidas `"Sí"` y `"No"`), `db`, `api`, `hook`, `ai`, `human`, `tryc`, `err`, `parallel`, `loop`, `delay`, `end`.\n' +
      '   - Gráficos conectados: `chart_bar`, `chart_donut`, `chart_gauge`, `chart_funnel`.\n' +
      '   - Planilla Financiera (`fx`): `fin_input`, `fin_rate`, `fin_periods`, `fin_qty`, `fin_unit_price`, `fin_formula`, `fin_sum`, `fin_subtract`, `fin_multiply`, `fin_divide`, `fin_revenue`, `fin_cogs`, `fin_gross_profit`, `fin_opex`, `fin_ebitda`, `fin_tax`, `fin_net_income`, `fin_ocf`, `fin_capex`, `fin_fcf`, `fin_npv`, `fin_irr`, `fin_roi`, `fin_pmt`, `fin_gross_margin`, `fin_net_margin`, `fin_breakeven`.\n' +
      '   - Gráficas y Veredicto Financiero (ganancia / pérdida / rentabilidad): `fin_verdict_kpi`, `fin_chart_pnl`, `fin_chart_waterfall`, `fin_chart_cashflow`, `fin_chart_margin`, `fin_chart_breakdown`.\n' +
      '   - Conexión entre Flujo y Finanzas: puedes enlazar un nodo de flujo (`process`, `db`, `api`) con una celda financiera (`fin_revenue`, `fin_cogs`, `fin_opex`, etc.) usando `add_edge`; el enrutador ortogonal inteligente trazará un puente limpio `flujo→fx` sin cruzar nodos.\n' +
      '4. GRAFO BIEN CONECTADO: Conecta todos los nodos creados con `add_edge`. Estados válidos (`status`): `pending`, `progress`, `done`, `error`.\n\n' +
      'Formato exacto del bloque AL FINAL de tu respuesta cuando debas crear/editar/ordenar en el lienzo:\n' +
      '```flowlab-actions\n' +
      '{\n' +
      '  "summary": "Descripción corta de los cambios",\n' +
      '  "operations": [\n' +
      '    { "op": "add_node", "ref": "p1", "type": "start", "text": "Inicio solicitud", "status": "pending" },\n' +
      '    { "op": "add_node", "ref": "p2", "type": "process", "text": "Validar requisitos" },\n' +
      '    { "op": "add_node", "ref": "p3", "type": "end", "text": "Entrega validada" },\n' +
      '    { "op": "add_edge", "from": "p1", "to": "p2", "label": "" },\n' +
      '    { "op": "add_edge", "from": "p2", "to": "p3", "label": "OK" }\n' +
      '  ]\n' +
      '}\n' +
      '```\n' +
      'Operaciones adicionales disponibles:\n' +
      '- `{ "op": "organize_canvas", "mode": "vertical", "density": "normal" }` (con cualquiera de los 16 modos y modificadores si el usuario pide ordenar/organizar).\n' +
      '- `{ "op": "update_node", "id": "<id_existente>", "text": "Nuevo texto", "status": "done" }`\n' +
      '- `{ "op": "delete_node", "id": "<id_existente>" }`\n' +
      '- `{ "op": "clear_canvas" }` (SOLO si el usuario pide borrar/reemplazar todo el lienzo).' +
      ctxBlock +
      docBlock
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
  // MOTOR JERÁRQUICO COMPACTO ANTI-CICLOS Y AUTO-LAYOUT (SUGIYAMA COMPACTO)
  // =========================================================================
  function snapToGridVal(v) {
    const g = (typeof CONFIG !== 'undefined' && CONFIG.SNAP_GRID) || 12;
    return Math.round(v / g) * g;
  }

  function sanitizeAINodeText(rawText, type) {
    let clean = String(rawText || CONFIG.NODE_TYPES[type] || 'Paso')
      .replace(/[*`#]+/g, '')
      .replace(/\r/g, '')
      .trim();

    if (!clean) clean = CONFIG.NODE_TYPES[type] || 'Paso';

    const fullOriginal = clean;
    const lines = clean
      .split('\n')
      .map(l => l.trim())
      .filter(Boolean);

    // Si es una sola línea demasiado larga, partirla en 2 líneas cortas y legibles
    if (lines.length === 1 && lines[0].length > 34) {
      const words = lines[0].split(/\s+/);
      const line1 = [];
      const line2 = [];
      let len1 = 0;
      for (const w of words) {
        if (len1 + w.length + 1 <= 28 || line1.length === 0) {
          line1.push(w);
          len1 += w.length + 1;
        } else {
          line2.push(w);
        }
      }
      let second = line2.join(' ');
      if (second.length > 34) second = second.slice(0, 33).trimEnd() + '…';
      clean = second ? `${line1.join(' ')}\n${second}` : line1.join(' ');
    } else if (lines.length > 3) {
      clean = lines
        .slice(0, 3)
        .map(l => (l.length > 36 ? l.slice(0, 35).trimEnd() + '…' : l))
        .join('\n');
    }

    return {
      displayText: clean,
      overflowNotes: fullOriginal.length > clean.length ? fullOriginal : ''
    };
  }

  function estimateNodeBoxSize(node) {
    const type = node.type || 'process';
    const textLen = String(node.text || '').length;
    if (typeof isFinanceNodeType === 'function' && isFinanceNodeType(type)) {
      return { w: 228, h: 152 + (textLen > 26 ? 16 : 0) };
    }
    if (type.startsWith('chart_')) return { w: 294, h: 222 };

    const lines = String(node.text || '')
      .split('\n')
      .filter(Boolean);
    const maxChars = Math.max(8, ...lines.map(l => l.length));
    const lineCount = Math.max(1, lines.length);

    if (type === 'decision') {
      return {
        w: clamp(Math.round(138 + maxChars * 5.2), 180, 232),
        h: clamp(Math.round(116 + (lineCount - 1) * 14), 118, 142)
      };
    }
    if (type === 'loop') {
      return {
        w: clamp(Math.round(134 + maxChars * 5.2), 180, 228),
        h: clamp(Math.round(78 + (lineCount - 1) * 14), 82, 114)
      };
    }

    return {
      w: clamp(Math.round(118 + maxChars * 5.6), 176, 242),
      h: clamp(Math.round(58 + (lineCount - 1) * 16), 66, 118)
    };
  }

  function getReliableNodeSize(node) {
    const est = estimateNodeBoxSize(node);
    const domW = Number(node.w) || 0;
    const domH = Number(node.h) || 0;
    const w = Math.max(est.w, domW);
    const h = Math.max(est.h, domH);
    node.w = w;
    node.h = h;
    return { w, h };
  }

  function classifyBranchSideWeight(edgeLabel, childNode) {
    const lbl = normalizePlainSpanish(edgeLabel || '');
    if (/\b(si|ok|valido|aprobado|exito|true|activo|correcto)\b/.test(lbl)) return -1;
    if (/\b(no|error|fallo|rechazado|invalido|false|excepcion|cancelado)\b/.test(lbl)) return 1;
    if (childNode && (childNode.type === 'err' || childNode.type === 'tryc')) return 1;
    return 0;
  }

  /**
   * Posiciona cualquier conjunto de nodos en una jerarquía compacta, simétrica y libre de ciclos.
   * Nunca permite distancias enormes aunque existan bucles/reintentos o muchos pasos seguidos.
   */
  function layoutNodesHierarchically(targetNodes, edgesPool, options = {}) {
    if (!Array.isArray(targetNodes) || targetNodes.length === 0) {
      return { minX: 0, minY: 0, maxX: 0, maxY: 0 };
    }

    const ROW_GAP = 48; // Espacio limpio vertical entre filas (borde inferior -> borde superior)
    const NODE_H_GAP = 44; // Espacio limpio horizontal entre hermanos de la misma fila
    const COMP_H_GAP = 92; // Espacio entre componentes o columnas plegadas
    const MAX_ROWS_PER_COL = 7; // Plegado automático en columnas si el flujo supera 7 niveles

    targetNodes.forEach(n => getReliableNodeSize(n));

    const targetIds = new Set(targetNodes.map(n => n.id));
    const nodeByIdMap = new Map(targetNodes.map(n => [n.id, n]));
    const orderIndexMap = new Map(targetNodes.map((n, idx) => [n.id, idx]));

    const internalEdges = (edgesPool || []).filter(
      e => e && targetIds.has(e.from) && targetIds.has(e.to) && e.from !== e.to
    );

    // 1. Dividir en componentes débilmente conexas para no apilar flujos independientes en vertical
    const undirectedAdj = new Map(targetNodes.map(n => [n.id, new Set()]));
    internalEdges.forEach(e => {
      undirectedAdj.get(e.from).add(e.to);
      undirectedAdj.get(e.to).add(e.from);
    });

    const visitedComp = new Set();
    const components = [];

    targetNodes.forEach(n => {
      if (visitedComp.has(n.id)) return;
      const compIds = [];
      const q = [n.id];
      visitedComp.add(n.id);
      while (q.length > 0) {
        const cur = q.shift();
        compIds.push(cur);
        undirectedAdj.get(cur).forEach(nb => {
          if (!visitedComp.has(nb)) {
            visitedComp.add(nb);
            q.push(nb);
          }
        });
      }
      compIds.sort((a, b) => (orderIndexMap.get(a) || 0) - (orderIndexMap.get(b) || 0));
      components.push(compIds);
    });

    // Ordenar: primero componentes grandes con flujos reales, al final notas sueltas
    components.sort((a, b) => b.length - a.length);

    let compCursorX = typeof options.originX === 'number' ? options.originX : 120;
    const baseOriginY = typeof options.originY === 'number' ? options.originY : 60;

    components.forEach(compIds => {
      const compSet = new Set(compIds);
      const compEdges = internalEdges.filter(e => compSet.has(e.from) && compSet.has(e.to));

      // 2. Detectar y aislar aristas de retroceso (ciclos / reintentos) mediante DFS de 3 colores
      const outAdj = new Map(compIds.map(id => [id, []]));
      const rawInDeg = new Map(compIds.map(id => [id, 0]));
      compEdges.forEach(e => {
        outAdj.get(e.from).push(e);
        rawInDeg.set(e.to, (rawInDeg.get(e.to) || 0) + 1);
      });

      const candidateRoots = compIds.filter(id => {
        const n = nodeByIdMap.get(id);
        return n && n.type === 'start';
      });
      compIds.forEach(id => {
        if ((rawInDeg.get(id) || 0) === 0 && !candidateRoots.includes(id)) {
          candidateRoots.push(id);
        }
      });
      if (candidateRoots.length === 0 && compIds.length > 0) {
        candidateRoots.push(compIds[0]);
      }

      const dfsColor = new Map(); // 0=no visitado, 1=en pila activa, 2=cerrado
      const backEdgeIds = new Set();

      function dfsBreakCycles(u) {
        dfsColor.set(u, 1);
        const edgesOut = outAdj.get(u) || [];
        edgesOut.forEach(edge => {
          const v = edge.to;
          const vNode = nodeByIdMap.get(v);
          if (dfsColor.get(v) === 1 || (vNode && vNode.type === 'start' && v !== u)) {
            backEdgeIds.add(edge);
          } else if (!dfsColor.get(v)) {
            dfsBreakCycles(v);
          }
        });
        dfsColor.set(u, 2);
      }

      candidateRoots.forEach(r => {
        if (!dfsColor.get(r)) dfsBreakCycles(r);
      });
      compIds.forEach(id => {
        if (!dfsColor.get(id)) dfsBreakCycles(id);
      });

      // 3. Asignación de niveles sobre el DAG acíclico (algoritmo de Kahn, visita única garantizada)
      const dagParents = new Map(compIds.map(id => [id, []]));
      const dagChildren = new Map(compIds.map(id => [id, []]));
      const dagInDeg = new Map(compIds.map(id => [id, 0]));
      const edgeLabelLookup = new Map();

      compEdges.forEach(edge => {
        if (backEdgeIds.has(edge)) return;
        dagChildren.get(edge.from).push(edge.to);
        dagParents.get(edge.to).push(edge.from);
        dagInDeg.set(edge.to, (dagInDeg.get(edge.to) || 0) + 1);
        edgeLabelLookup.set(`${edge.from}->${edge.to}`, edge.label || '');
      });

      const rankMap = new Map();
      const kahnQueue = [];
      compIds.forEach(id => {
        if ((dagInDeg.get(id) || 0) === 0) {
          rankMap.set(id, 0);
          kahnQueue.push(id);
        }
      });

      if (kahnQueue.length === 0 && compIds.length > 0) {
        rankMap.set(compIds[0], 0);
        kahnQueue.push(compIds[0]);
      }

      const processed = new Set();
      while (kahnQueue.length > 0) {
        const u = kahnQueue.shift();
        processed.add(u);
        const uRank = rankMap.get(u) || 0;
        (dagChildren.get(u) || []).forEach(v => {
          const nextR = uRank + 1;
          if (!rankMap.has(v) || nextR > rankMap.get(v)) {
            rankMap.set(v, nextR);
          }
          const left = (dagInDeg.get(v) || 1) - 1;
          dagInDeg.set(v, left);
          if (left <= 0 && !processed.has(v) && !kahnQueue.includes(v)) {
            kahnQueue.push(v);
          }
        });
      }

      compIds.forEach(id => {
        if (!rankMap.has(id)) rankMap.set(id, 0);
      });

      // Empujar nodos tipo 'end' sin hijos al último nivel de su componente
      const maxAssignedRank = Math.max(0, ...Array.from(rankMap.values()));
      compIds.forEach(id => {
        const n = nodeByIdMap.get(id);
        if (n && n.type === 'end' && (dagChildren.get(id) || []).length === 0 && maxAssignedRank > 0) {
          rankMap.set(id, Math.max(rankMap.get(id) || 0, maxAssignedRank));
        }
      });

      // Comprimir niveles vacíos consecutivos (0, 1, 2, ..., K-1)
      const distinctRanks = Array.from(new Set(rankMap.values())).sort((a, b) => a - b);
      const denseRankIndex = new Map(distinctRanks.map((r, i) => [r, i]));
      const rows = distinctRanks.map(() => []);

      compIds.forEach(id => {
        const rIdx = denseRankIndex.get(rankMap.get(id)) || 0;
        rows[rIdx].push(nodeByIdMap.get(id));
      });

      // 4. Ordenamiento baricéntrico por fila para evitar cruces de aristas (Sí a la izq, No/Error a la der)
      const horizOrderScore = new Map();
      rows.forEach((rowNodes, rIdx) => {
        if (rIdx === 0) {
          rowNodes.sort((a, b) => (orderIndexMap.get(a.id) || 0) - (orderIndexMap.get(b.id) || 0));
        } else {
          rowNodes.sort((a, b) => {
            const pA = dagParents.get(a.id) || [];
            const pB = dagParents.get(b.id) || [];
            const baryA = pA.length
              ? pA.reduce((acc, pid) => acc + (horizOrderScore.get(pid) ?? 0), 0) / pA.length
              : orderIndexMap.get(a.id) || 0;
            const baryB = pB.length
              ? pB.reduce((acc, pid) => acc + (horizOrderScore.get(pid) ?? 0), 0) / pB.length
              : orderIndexMap.get(b.id) || 0;

            if (Math.abs(baryA - baryB) > 0.01) return baryA - baryB;

            const sideA = pA.length ? classifyBranchSideWeight(edgeLabelLookup.get(`${pA[0]}->${a.id}`), a) : 0;
            const sideB = pB.length ? classifyBranchSideWeight(edgeLabelLookup.get(`${pB[0]}->${b.id}`), b) : 0;
            if (sideA !== sideB) return sideA - sideB;

            return (orderIndexMap.get(a.id) || 0) - (orderIndexMap.get(b.id) || 0);
          });
        }
        rowNodes.forEach((n, idx) => horizOrderScore.set(n.id, idx));
      });

      // 5. Plegado en columnas equilibradas si hay más de MAX_ROWS_PER_COL niveles
      const columnChunks = [];
      if (rows.length <= MAX_ROWS_PER_COL) {
        columnChunks.push(rows);
      } else {
        const numCols = Math.ceil(rows.length / MAX_ROWS_PER_COL);
        const rowsPerCol = Math.ceil(rows.length / numCols);
        for (let i = 0; i < rows.length; i += rowsPerCol) {
          columnChunks.push(rows.slice(i, i + rowsPerCol));
        }
      }

      columnChunks.forEach(chunkRows => {
        const rowWidths = chunkRows.map(
          rNodes =>
            rNodes.reduce((sum, n) => sum + n.w, 0) + Math.max(0, rNodes.length - 1) * NODE_H_GAP
        );
        const colWidth = Math.max(160, ...rowWidths);
        const colCenterX =
          options.centerFirstColumnX !== undefined && columnChunks.length === 1 && components.length === 1
            ? options.centerFirstColumnX
            : compCursorX + colWidth / 2;

        let curY = baseOriginY;
        chunkRows.forEach((rNodes, idxInChunk) => {
          const rW = rowWidths[idxInChunk];
          const rMaxH = Math.max(54, ...rNodes.map(n => n.h));
          let curX = colCenterX - rW / 2;

          rNodes.forEach(n => {
            n.x = snapToGridVal(curX);
            n.y = snapToGridVal(curY + (rMaxH - n.h) / 2);
            curX += n.w + NODE_H_GAP;
          });

          curY += rMaxH + ROW_GAP;
        });

        compCursorX = Math.max(compCursorX, colCenterX + colWidth / 2) + COMP_H_GAP;
      });
    });

    const minX = Math.min(...targetNodes.map(n => n.x));
    const minY = Math.min(...targetNodes.map(n => n.y));
    const maxX = Math.max(...targetNodes.map(n => n.x + n.w));
    const maxY = Math.max(...targetNodes.map(n => n.y + n.h));
    return { minX, minY, maxX, maxY };
  }

  function shiftNodeGroup(nodesGroup, dx, dy) {
    nodesGroup.forEach(n => {
      n.x = snapToGridVal(n.x + dx);
      n.y = snapToGridVal(n.y + dy);
    });
  }

  function groupOverlapsExisting(newNodes, staticNodes, pad = 28) {
    for (const a of newNodes) {
      for (const b of staticNodes) {
        const noOverlap =
          a.x + a.w + pad <= b.x ||
          b.x + b.w + pad <= a.x ||
          a.y + a.h + pad <= b.y ||
          b.y + b.h + pad <= a.y;
        if (!noOverlap) return true;
      }
    }
    return false;
  }

  function isCanvasAbnormallyScattered(nodesList) {
    if (!Array.isArray(nodesList) || nodesList.length < 2) return false;
    const minX = Math.min(...nodesList.map(n => n.x));
    const maxX = Math.max(...nodesList.map(n => n.x + (n.w || 150)));
    const minY = Math.min(...nodesList.map(n => n.y));
    const maxY = Math.max(...nodesList.map(n => n.y + (n.h || 60)));
    const spanX = maxX - minX;
    const spanY = maxY - minY;
    const maxReasonableSpan = Math.max(1750, nodesList.length * 195);
    return spanX > maxReasonableSpan || spanY > maxReasonableSpan;
  }

  /**
   * Reorganiza todos los nodos actuales del lienzo en una estructura limpia y compacta.
   */
  function runSmartGraphLayoutEngine(targetNodes, edgesPool, layoutOptions = {}) {
    if (typeof window.applyParametricGraphLayout === 'function') {
      const mergedOpts = {
        originX: 120,
        originY: 64,
        mode: layoutOptions.mode || 'domain_bridge',
        density: layoutOptions.density || 'normal',
        ...layoutOptions
      };
      const meta = window.applyParametricGraphLayout(targetNodes, edgesPool, mergedOpts);
      lastLayoutOptions = {
        mode: meta.mode || mergedOpts.mode,
        density: meta.density || mergedOpts.density,
        columns: mergedOpts.columns,
        reverse: Boolean(mergedOpts.reverse),
        sortBy: mergedOpts.sortBy || 'topology',
        align: mergedOpts.align || 'center'
      };
      return meta;
    }
    const bbox = layoutNodesHierarchically(targetNodes, edgesPool, {
      originX: layoutOptions.originX ?? 120,
      originY: layoutOptions.originY ?? 60
    });
    return {
      ...bbox,
      mode: 'compact',
      label: 'Jerárquico Compacto',
      description: 'Jerárquico Compacto'
    };
  }

  function autoOrganizeCanvas(silent = false, layoutOptions = {}) {
    if (!STATE.nodes || STATE.nodes.length === 0) {
      if (!silent && typeof showToast === 'function') {
        showToast('No hay nodos en el lienzo para organizar', 'info', 1600);
      }
      return false;
    }

    if (typeof renderNodes === 'function') {
      try { renderNodes(); } catch {}
    }

    const meta = runSmartGraphLayoutEngine(STATE.nodes, STATE.edges, layoutOptions);

    if (typeof commitHistory === 'function') commitHistory();
    if (typeof renderAll === 'function') renderAll();
    focusNodesOnCanvas(STATE.nodes.map(n => n.id));

    if (!silent && typeof showToast === 'function') {
      showToast(`Ordenado: ${meta.description || meta.label} (${STATE.nodes.length} nodos)`, 'ok', 2200);
    }
    if (typeof log === 'function') {
      log('agent', `Layout "${meta.description || meta.label}" aplicado a ${STATE.nodes.length} nodo(s).`);
    }
    return meta;
  }

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

  function normalizeNodeStatus(rawStatus) {
    if (!rawStatus) return null;
    const s = String(rawStatus).trim().toLowerCase();
    if (CONFIG.BADGE && CONFIG.BADGE[s]) return s;
    if (s === 'ok' || s === 'completed' || s === 'completado' || s === 'listo' || s === 'success') return 'done';
    if (s === 'running' || s === 'in_progress' || s === 'en_progreso' || s === 'active' || s === 'activo') return 'progress';
    if (s === 'err' || s === 'failed' || s === 'fallo' || s === 'blocked') return 'error';
    if (s === 'todo' || s === 'pendiente' || s === 'idle') return 'pending';
    return null;
  }

  function applyAIGraphActions(actionPayload) {
    if (!actionPayload || !Array.isArray(actionPayload.operations)) {
      return { addedNodes: [], addedEdges: [], updatedCount: 0, organized: false };
    }

    const ops = actionPayload.operations;
    const refMap = new Map();
    const pendingNewNodes = [];
    const pendingEdges = [];
    let updatedCount = 0;
    let requestedOrganize = false;
    let requestedLayoutOpts = null;

    // Si el lienzo previo tenía nodos a miles de píxeles por un layout roto anterior, repararlo antes
    if (STATE.nodes && STATE.nodes.length >= 2 && isCanvasAbnormallyScattered(STATE.nodes)) {
      runSmartGraphLayoutEngine(STATE.nodes, STATE.edges, { originX: 120, originY: 64 });
    }

    // 1. Procesar limpieza, borrados, actualizaciones y recolectar nuevos nodos
    ops.forEach((op, index) => {
      if (!op || typeof op !== 'object') return;
      const kind = String(op.op || op.action || '').toLowerCase();

      if (kind === 'organize_canvas' || kind === 'auto_layout') {
        requestedOrganize = true;
        requestedLayoutOpts = {
          mode: op.mode || op.style || op.layout || 'domain_bridge',
          density: op.density || 'normal',
          columns: op.columns,
          reverse: Boolean(op.reverse),
          sortBy: op.sortBy || 'topology',
          align: op.align || 'center'
        };
      } else if (kind === 'clear_canvas') {
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
          if (typeof op.text === 'string' && op.text.trim()) {
            const cleanTxt = sanitizeAINodeText(op.text, op.type ? normalizeNodeType(op.type) : target.type);
            target.text = cleanTxt.displayText;
            if (cleanTxt.overflowNotes) {
              target.params = { ...(target.params || {}), notes: cleanTxt.overflowNotes };
            }
          }
          if (op.type) target.type = normalizeNodeType(op.type);
          const normStatus = normalizeNodeStatus(op.status);
          if (normStatus) target.status = normStatus;
          if (typeof op.progress === 'number') target.progress = clamp(op.progress, 0, 100);
          if (op.params && typeof op.params === 'object') {
            target.params = { ...(target.params || {}), ...op.params };
          }
          updatedCount++;
        }
      } else if (kind === 'add_node') {
        const type = normalizeNodeType(op.type);
        const rawLabel = op.text || op.label || CONFIG.NODE_TYPES[type] || 'Paso';
        const cleanTxt = sanitizeAINodeText(rawLabel, type);
        const nodeObj = createNode(type, cleanTxt.displayText, 0, 0);
        const normStatus = normalizeNodeStatus(op.status);
        if (normStatus) nodeObj.status = normStatus;
        if (typeof op.progress === 'number') nodeObj.progress = clamp(op.progress, 0, 100);
        if (op.params && typeof op.params === 'object') nodeObj.params = { ...op.params };
        if (typeof isFinanceNodeType === 'function' && isFinanceNodeType(type) && typeof ensureFinanceNodeDefaults === 'function') {
          ensureFinanceNodeDefaults(nodeObj);
          if (STATE.canvasDomain !== 'finance' && typeof setWorkspaceDomain === 'function') {
            setWorkspaceDomain('finance', { silent: true });
          }
        }
        if (cleanTxt.overflowNotes) {
          nodeObj.params = { ...(nodeObj.params || {}), notes: cleanTxt.overflowNotes };
        }

        const refKey = String(op.ref || op.id || 'ref_' + index);
        refMap.set(refKey, nodeObj.id);

        pendingNewNodes.push({
          refKey,
          node: nodeObj,
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

    const preExistingNodes = (STATE.nodes || []).slice();
    const addedNodes = pendingNewNodes.map(i => i.node);

    // Añadir nuevos nodos al estado primero para medir dimensiones reales y resolver aristas
    if (addedNodes.length > 0) {
      addedNodes.forEach(n => STATE.nodes.push(n));
      STATE.isBlankCanvas = false;
    }

    // 2. Resolver todas las aristas declaradas y enlaces "after"
    const createdEdges = [];
    let externalAnchorNode = null;
    const addedIdsSet = new Set(addedNodes.map(n => n.id));

    pendingEdges.forEach(pe => {
      const fromId = resolveRefOrNodeId(pe.fromRaw, refMap);
      const toId = resolveRefOrNodeId(pe.toRaw, refMap);
      if (!fromId || !toId || fromId === toId) return;

      if (!addedIdsSet.has(fromId) && addedIdsSet.has(toId)) {
        const ext = byId(fromId);
        if (ext && !externalAnchorNode) externalAnchorNode = ext;
      }

      if (!STATE.edges.some(e => e.from === fromId && e.to === toId)) {
        const edge = createEdge(fromId, toId, pe.label || '', 'normal');
        STATE.edges.push(edge);
        createdEdges.push(edge);
      }
    });

    pendingNewNodes.forEach(item => {
      if (!item.afterRaw) return;
      const fromId = resolveRefOrNodeId(item.afterRaw, refMap);
      const toId = item.node.id;
      if (!fromId || fromId === toId) return;

      if (!addedIdsSet.has(fromId)) {
        const ext = byId(fromId);
        if (ext && !externalAnchorNode) externalAnchorNode = ext;
      }

      const alreadyHasIncoming = STATE.edges.some(e => e.to === toId);
      if (!alreadyHasIncoming) {
        const edge = createEdge(fromId, toId, '', 'normal');
        STATE.edges.push(edge);
        createdEdges.push(edge);
      }
    });

    // Si un modelo externo creó varios nodos de flujo pero olvidó conectar alguno, enlazarlos en secuencia limpia
    if (addedNodes.length >= 2) {
      for (let i = 0; i < addedNodes.length; i++) {
        const cur = addedNodes[i];
        if (cur.type === 'note') continue;
        const hasIn = STATE.edges.some(e => e.to === cur.id);
        const hasOut = STATE.edges.some(e => e.from === cur.id);
        if (!hasIn && !hasOut) {
          if (i > 0 && addedNodes[i - 1].type !== 'note') {
            const fallbackEdge = createEdge(addedNodes[i - 1].id, cur.id, '', 'normal');
            STATE.edges.push(fallbackEdge);
            createdEdges.push(fallbackEdge);
          } else if (i + 1 < addedNodes.length && addedNodes[i + 1].type !== 'note') {
            const fallbackEdge = createEdge(cur.id, addedNodes[i + 1].id, '', 'normal');
            STATE.edges.push(fallbackEdge);
            createdEdges.push(fallbackEdge);
          }
        }
      }
    }

    // 3. Medir tamaños reales en el DOM y aplicar motor jerárquico compacto
    if (addedNodes.length > 0) {
      if (typeof renderNodes === 'function') {
        try { renderNodes(); } catch {}
      }

      let originX = 240;
      let originY = 64;
      let centerFirstColumnX = undefined;

      if (externalAnchorNode) {
        centerFirstColumnX = externalAnchorNode.x + (externalAnchorNode.w || 150) / 2;
        originX = Math.max(48, centerFirstColumnX - 90);
        originY = externalAnchorNode.y + (externalAnchorNode.h || 60) + 52;
      } else if (preExistingNodes.length > 0) {
        const exMinY = Math.min(...preExistingNodes.map(n => n.y));
        const exMaxX = Math.max(...preExistingNodes.map(n => n.x + (n.w || 150)));
        originX = exMaxX + 96;
        originY = Math.max(48, exMinY);
      }

      layoutNodesHierarchically(addedNodes, STATE.edges, {
        originX,
        originY,
        centerFirstColumnX
      });

      // Si el bloque nuevo roza algún nodo previo (p. ej. al expandir una rama intermedia), desplazar el bloque entero sin deformarlo
      let safetySteps = 0;
      while (
        preExistingNodes.length > 0 &&
        safetySteps < 14 &&
        groupOverlapsExisting(addedNodes, preExistingNodes, 24)
      ) {
        if (externalAnchorNode) {
          shiftNodeGroup(addedNodes, 0, 48);
        } else {
          shiftNodeGroup(addedNodes, 72, 0);
        }
        safetySteps++;
      }
    }

    if (requestedOrganize && STATE.nodes.length > 0) {
      if (typeof renderNodes === 'function') {
        try { renderNodes(); } catch {}
      }
      runSmartGraphLayoutEngine(STATE.nodes, STATE.edges, requestedLayoutOpts || {});
      updatedCount += STATE.nodes.length;
    }

    if (addedNodes.length > 0 || createdEdges.length > 0 || updatedCount > 0 || requestedOrganize) {
      commitHistory();
      renderAll();

      addedNodes.forEach(n => {
        if (typeof animateNodePlacement === 'function') animateNodePlacement(n.id);
      });

      if (requestedOrganize && STATE.nodes.length > 0) {
        focusNodesOnCanvas(STATE.nodes.map(n => n.id));
      } else if (addedNodes.length > 0) {
        STATE.sel = { kind: 'node', id: addedNodes[0].id };
        renderAll();
        focusNodesOnCanvas(addedNodes.map(n => n.id));
      }

      if (typeof log === 'function') {
        log(
          'agent',
          `IA aplicó: +${addedNodes.length} nodo(s), +${createdEdges.length} conexión(es)` +
            (updatedCount ? `, ${updatedCount} ajustado(s)` : '')
        );
      }
    }

    return { addedNodes, addedEdges: createdEdges, updatedCount, organized: requestedOrganize };
  }

  function focusNodesOnCanvas(nodeIds) {
    if (!nodeIds || !nodeIds.length || !DOM.vp) return;
    const targets = nodeIds.map(id => byId(id)).filter(Boolean);
    if (!targets.length) return;

    const minX = Math.min(...targets.map(n => n.x)) - 56;
    const minY = Math.min(...targets.map(n => n.y)) - 56;
    const maxX = Math.max(...targets.map(n => n.x + (n.w || 150))) + 56;
    const maxY = Math.max(...targets.map(n => n.y + (n.h || 60))) + 56;

    const r = DOM.vp.getBoundingClientRect();
    const w = r.width || 900;
    const h = r.height || 640;
    const bw = Math.max(1, maxX - minX);
    const bh = Math.max(1, maxY - minY);

    const targetZoom = clamp(Math.min((w - 56) / bw, (h - 56) / bh, 1.08), 0.55, 1.15);
    STATE.zoom = targetZoom;
    STATE.pan.x = w / 2 - ((minX + bw / 2) * targetZoom);
    STATE.pan.y = h / 2 - ((minY + bh / 2) * targetZoom);
    if (typeof applyTransform === 'function') applyTransform();
    if (typeof updateStatus === 'function') updateStatus();
    if (typeof drawMinimap === 'function') drawMinimap();
    if (typeof saveState === 'function') saveState();
  }

  // =========================================================================
  // MOTOR DE COREOGRAFÍA VISUAL PASO A PASO EN VIVO SOBRE EL LIENZO
  // =========================================================================
  const liveBuildState = {
    isAnimating: false,
    skipRequested: false,
    skipResolvers: new Set(),
    scanTimer: null,
    hudHideTimer: null,
    lastStepLog: []
  };

  function getLiveAnimSpeedFactor() {
    if (window.__FLOWLAB_FAST_TEST || liveBuildState.skipRequested) return 0;
    try {
      if (
        typeof window !== 'undefined' &&
        window.matchMedia &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches
      ) {
        return 0;
      }
    } catch {}
    const spd = clamp(Number(STATE && STATE.speed) || 1, 0.5, 4);
    return 1 / spd;
  }

  function requestSkipLiveAnimation() {
    liveBuildState.skipRequested = true;
    const resolvers = Array.from(liveBuildState.skipResolvers);
    liveBuildState.skipResolvers.clear();
    resolvers.forEach(fn => {
      try { fn(); } catch {}
    });
  }

  function waitLiveVisualBeat(baseMs, signal) {
    if (signal && signal.aborted) {
      const err = new Error('Aborted');
      err.name = 'AbortError';
      return Promise.reject(err);
    }
    const scaled = Math.round(baseMs * getLiveAnimSpeedFactor());
    if (scaled <= 0 || liveBuildState.skipRequested) {
      return Promise.resolve();
    }
    return new Promise((resolve, reject) => {
      let settled = false;
      const cleanup = () => {
        liveBuildState.skipResolvers.delete(onSkip);
        if (signal) signal.removeEventListener('abort', onAbort);
      };
      const timer = setTimeout(() => {
        if (settled) return;
        settled = true;
        cleanup();
        resolve();
      }, scaled);
      function onSkip() {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        cleanup();
        resolve();
      }
      function onAbort() {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        cleanup();
        const err = new Error('Aborted');
        err.name = 'AbortError';
        reject(err);
      }
      liveBuildState.skipResolvers.add(onSkip);
      if (signal) signal.addEventListener('abort', onAbort, { once: true });
    });
  }

  function computeTargetCameraForRects(targetRects) {
    if (!DOM.vp || !Array.isArray(targetRects) || targetRects.length === 0) return null;
    const minX = Math.min(...targetRects.map(n => n.x)) - 58;
    const minY = Math.min(...targetRects.map(n => n.y)) - 64;
    const maxX = Math.max(...targetRects.map(n => n.x + (n.w || 150))) + 58;
    const maxY = Math.max(...targetRects.map(n => n.y + (n.h || 60))) + 58;

    const r = DOM.vp.getBoundingClientRect();
    const w = r.width || 900;
    const h = r.height || 640;
    const bw = Math.max(1, maxX - minX);
    const bh = Math.max(1, maxY - minY);

    const targetZoom = clamp(Math.min((w - 56) / bw, (h - 68) / bh, 1.08), 0.55, 1.15);
    return {
      zoom: targetZoom,
      panX: w / 2 - ((minX + bw / 2) * targetZoom),
      panY: h / 2 - ((minY + bh / 2) * targetZoom)
    };
  }

  async function animateCameraToRects(targetRects, baseDurationMs, signal) {
    const cam = computeTargetCameraForRects(targetRects);
    if (!cam) return;

    const duration = Math.round(baseDurationMs * getLiveAnimSpeedFactor());
    if (duration <= 0 || typeof requestAnimationFrame !== 'function') {
      STATE.zoom = cam.zoom;
      STATE.pan.x = cam.panX;
      STATE.pan.y = cam.panY;
      if (typeof applyTransform === 'function') applyTransform();
      if (typeof updateStatus === 'function') updateStatus();
      if (typeof drawMinimap === 'function') drawMinimap();
      return;
    }

    const startZoom = STATE.zoom;
    const startPanX = STATE.pan.x;
    const startPanY = STATE.pan.y;
    const startTs = performance.now();

    await new Promise((resolve, reject) => {
      function tick(now) {
        if (signal && signal.aborted) {
          const err = new Error('Aborted');
          err.name = 'AbortError';
          reject(err);
          return;
        }
        if (liveBuildState.skipRequested) {
          STATE.zoom = cam.zoom;
          STATE.pan.x = cam.panX;
          STATE.pan.y = cam.panY;
          if (typeof applyTransform === 'function') applyTransform();
          if (typeof updateStatus === 'function') updateStatus();
          if (typeof drawMinimap === 'function') drawMinimap();
          resolve();
          return;
        }
        const rawT = clamp((now - startTs) / duration, 0, 1);
        const ease = 1 - Math.pow(1 - rawT, 3);
        STATE.zoom = startZoom + (cam.zoom - startZoom) * ease;
        STATE.pan.x = startPanX + (cam.panX - startPanX) * ease;
        STATE.pan.y = startPanY + (cam.panY - startPanY) * ease;
        if (typeof applyTransform === 'function') applyTransform();
        if (typeof drawMinimap === 'function') drawMinimap();

        if (rawT < 1) {
          requestAnimationFrame(tick);
        } else {
          if (typeof updateStatus === 'function') updateStatus();
          resolve();
        }
      }
      requestAnimationFrame(tick);
    });
  }

  function setBuildHudState({ mode = 'building', phase = '', step = '', current = 0, total = 0, showSkip = false }) {
    if (liveBuildState.hudHideTimer) {
      clearTimeout(liveBuildState.hudHideTimer);
      liveBuildState.hudHideTimer = null;
    }
    const hud = document.getElementById('aiBuildHud');
    if (!hud) return;
    hud.hidden = false;
    hud.classList.toggle('is-analyzing', mode === 'analyzing');
    hud.classList.toggle('is-done', mode === 'done');

    const phaseEl = document.getElementById('aiBuildHudPhase');
    const stepEl = document.getElementById('aiBuildHudStep');
    const countEl = document.getElementById('aiBuildHudCount');
    const fillEl = document.getElementById('aiBuildHudFill');
    const skipBtn = document.getElementById('btnAiSkipAnim');

    if (phaseEl && phase) phaseEl.textContent = phase;
    if (stepEl && step !== undefined) stepEl.textContent = step;
    if (countEl) {
      countEl.textContent = total > 0 ? `${Math.min(current, total)}/${total}` : mode === 'done' ? '✓' : '···';
    }
    if (fillEl) {
      const pct = total > 0 ? clamp(Math.round((current / total) * 100), 4, 100) : mode === 'done' ? 100 : 28;
      fillEl.style.width = `${pct}%`;
    }
    if (skipBtn) {
      skipBtn.hidden = !showSkip || liveBuildState.skipRequested || Boolean(window.__FLOWLAB_FAST_TEST);
    }
  }

  function hideBuildHud(delayMs = 0) {
    if (liveBuildState.hudHideTimer) {
      clearTimeout(liveBuildState.hudHideTimer);
      liveBuildState.hudHideTimer = null;
    }
    const hud = document.getElementById('aiBuildHud');
    if (!hud) return;
    if (!delayMs || delayMs <= 0 || window.__FLOWLAB_FAST_TEST) {
      hud.hidden = true;
      hud.classList.remove('is-analyzing', 'is-done');
      return;
    }
    liveBuildState.hudHideTimer = setTimeout(() => {
      hud.hidden = true;
      hud.classList.remove('is-analyzing', 'is-done');
      liveBuildState.hudHideTimer = null;
    }, delayMs);
  }

  function moveAiWorldCursor(x, y, tagText, variant = 'building') {
    const cursor = document.getElementById('aiWorldCursor');
    if (!cursor) return;
    cursor.hidden = false;
    cursor.classList.toggle('is-editing', variant === 'editing');
    cursor.classList.toggle('is-deleting', variant === 'deleting');
    cursor.style.transform = `translate3d(${Math.round(x)}px, ${Math.round(y)}px, 0)`;
    const tag = document.getElementById('aiWorldCursorTag');
    if (tag && tagText) tag.textContent = tagText;
  }

  function hideAiWorldCursor() {
    const cursor = document.getElementById('aiWorldCursor');
    if (!cursor) return;
    cursor.hidden = true;
    cursor.classList.remove('is-editing', 'is-deleting');
  }

  function clearBlueprintSlots() {
    const layer = document.getElementById('aiBlueprintLayer');
    if (layer) layer.innerHTML = '';
  }

  function renderBlueprintSlots(plannedNodes) {
    const layer = document.getElementById('aiBlueprintLayer');
    if (!layer) return;
    layer.innerHTML = '';
    plannedNodes.forEach(n => {
      const slot = document.createElement('div');
      slot.className = 'ai-blueprint-slot';
      slot.dataset.slotNodeId = n.id;
      slot.style.left = `${Math.round(n.x)}px`;
      slot.style.top = `${Math.round(n.y)}px`;
      slot.style.width = `${Math.round(n.w || 150)}px`;
      slot.style.height = `${Math.round(n.h || 60)}px`;

      const lbl = document.createElement('span');
      lbl.className = 'ai-blueprint-slot-label';
      const typeTitle = (CONFIG.NODE_TYPES && CONFIG.NODE_TYPES[n.type]) || n.type || 'paso';
      lbl.textContent = `+ ${String(typeTitle).toLowerCase()}`;
      slot.appendChild(lbl);
      layer.appendChild(slot);
    });
  }

  function highlightBlueprintSlot(nodeId) {
    const layer = document.getElementById('aiBlueprintLayer');
    if (!layer) return;
    layer.querySelectorAll('.ai-blueprint-slot').forEach(el => {
      el.classList.toggle('is-active-slot', el.dataset.slotNodeId === nodeId);
    });
  }

  function removeBlueprintSlot(nodeId) {
    const layer = document.getElementById('aiBlueprintLayer');
    if (!layer) return;
    const slot = layer.querySelector(`.ai-blueprint-slot[data-slot-node-id="${nodeId}"]`);
    if (slot) slot.remove();
  }

  function clearCanvasScanHighlights() {
    if (DOM.world) {
      DOM.world.querySelectorAll('.node.ai-scanning-node').forEach(el => {
        el.classList.remove('ai-scanning-node');
      });
    }
  }

  function startCanvasThinkingScan(stepSubtitle = 'Analizando estructura del lienzo...') {
    stopCanvasThinkingScan(false);
    const nodes = Array.isArray(STATE.nodes) ? STATE.nodes : [];
    setBuildHudState({
      mode: 'analyzing',
      phase: 'ia :: analizando contexto',
      step: stepSubtitle,
      current: 1,
      total: Math.max(3, nodes.length > 0 ? Math.min(nodes.length, 6) : 3),
      showSkip: false
    });

    if (window.__FLOWLAB_FAST_TEST || !aiConfig.includeContext || nodes.length === 0) return;

    // Priorizar el nodo seleccionado primero para que el usuario vea qué inspecciona la IA
    const ordered = nodes.slice();
    if (STATE.sel && STATE.sel.kind === 'node') {
      const selIdx = ordered.findIndex(n => n.id === STATE.sel.id);
      if (selIdx > 0) {
        const [picked] = ordered.splice(selIdx, 1);
        ordered.unshift(picked);
      }
    }

    let idx = 0;
    const pulseNext = () => {
      clearCanvasScanHighlights();
      if (!ordered.length) return;
      const target = ordered[idx % ordered.length];
      const domNode = typeof nodeEl === 'function' ? nodeEl(target.id) : null;
      if (domNode) domNode.classList.add('ai-scanning-node');
      const shortName = String(target.text || target.type || 'nodo').replace(/\s+/g, ' ').slice(0, 30);
      moveAiWorldCursor(
        target.x + (target.w || 150) * 0.68,
        target.y + (target.h || 60) * 0.72,
        `ia :: leyendo "${shortName}"`,
        'editing'
      );
      idx++;
    };

    pulseNext();
    liveBuildState.scanTimer = setInterval(pulseNext, 210);
  }

  function stopCanvasThinkingScan(hideOverlays = true) {
    if (liveBuildState.scanTimer) {
      clearInterval(liveBuildState.scanTimer);
      liveBuildState.scanTimer = null;
    }
    clearCanvasScanHighlights();
    if (hideOverlays) {
      hideAiWorldCursor();
      hideBuildHud(0);
    }
  }

  async function animateNodeTypewriter(nodeId, finalText, baseDurationMs, signal) {
    const domNode = typeof nodeEl === 'function' ? nodeEl(nodeId) : null;
    const textDiv = domNode ? domNode.querySelector('.text') : null;
    const fullStr = String(finalText || '');
    const duration = Math.round(baseDurationMs * getLiveAnimSpeedFactor());

    if (!domNode || !textDiv || duration <= 0 || fullStr.length <= 1) {
      if (textDiv) textDiv.textContent = fullStr;
      return;
    }

    domNode.classList.add('ai-typing-active');
    const slices = clamp(Math.min(fullStr.length, 9), 3, 9);
    const intervalMs = Math.max(14, Math.round(duration / slices));

    try {
      for (let s = 1; s <= slices; s++) {
        if (liveBuildState.skipRequested) break;
        const cut = Math.ceil((fullStr.length * s) / slices);
        textDiv.textContent = fullStr.slice(0, cut);
        await waitLiveVisualBeat(intervalMs, signal);
      }
    } finally {
      textDiv.textContent = fullStr;
      domNode.classList.remove('ai-typing-active');
    }
  }

  async function animateEdgeStrokeDraw(edgeId, baseDurationMs, signal) {
    if (!DOM.edgesG) return;
    const pathEl = DOM.edgesG.querySelector(`path.edge[data-edge-id="${edgeId}"]`);
    const labelEl = DOM.edgesG.querySelector(`text.edge-label[data-edge-label-id="${edgeId}"]`);
    const duration = Math.round(baseDurationMs * getLiveAnimSpeedFactor());

    if (!pathEl || duration <= 0) return;

    let totalLen = 140;
    try {
      if (typeof pathEl.getTotalLength === 'function') {
        totalLen = Math.max(24, pathEl.getTotalLength());
      }
    } catch {}

    pathEl.classList.add('ai-edge-drawing');
    pathEl.style.strokeDasharray = `${totalLen}`;
    pathEl.style.strokeDashoffset = `${totalLen}`;
    if (labelEl) labelEl.style.opacity = '0';

    if (typeof requestAnimationFrame === 'function') {
      const startTs = performance.now();
      await new Promise((resolve, reject) => {
        function frame(now) {
          if (signal && signal.aborted) {
            const err = new Error('Aborted');
            err.name = 'AbortError';
            reject(err);
            return;
          }
          if (liveBuildState.skipRequested) {
            pathEl.style.strokeDashoffset = '0';
            resolve();
            return;
          }
          const t = clamp((now - startTs) / duration, 0, 1);
          const ease = 1 - Math.pow(1 - t, 2.4);
          pathEl.style.strokeDashoffset = `${Math.round(totalLen * (1 - ease))}`;
          if (t < 1) {
            requestAnimationFrame(frame);
          } else {
            resolve();
          }
        }
        requestAnimationFrame(frame);
      });
    } else {
      await waitLiveVisualBeat(duration, signal);
    }

    pathEl.style.strokeDasharray = '';
    pathEl.style.strokeDashoffset = '';
    if (labelEl) {
      labelEl.style.opacity = '';
      labelEl.classList.add('ai-edge-label-reveal');
    }
    setTimeout(() => {
      try {
        pathEl.classList.remove('ai-edge-drawing');
        if (labelEl) labelEl.classList.remove('ai-edge-label-reveal');
      } catch {}
    }, 360);
  }

  function measureNodesOffscreenExact(nodesToMeasure) {
    nodesToMeasure.forEach(n => {
      const est = estimateNodeBoxSize(n);
      n.w = est.w;
      n.h = est.h;
    });
    if (typeof document === 'undefined' || !document.body) return;
    let probeWrap = null;
    try {
      probeWrap = document.createElement('div');
      probeWrap.style.cssText =
        'position:fixed;left:-9999px;top:-9999px;visibility:hidden;pointer-events:none;';
      document.body.appendChild(probeWrap);
      nodesToMeasure.forEach(n => {
        const est = estimateNodeBoxSize(n);
        const card = document.createElement('div');
        const isFin = typeof isFinanceNodeType === 'function' && isFinanceNodeType(n.type);
        let cls = `node ${n.type}`;
        if (isFin && typeof getFinanceNodeToneClass === 'function') {
          cls += ` ${getFinanceNodeToneClass(n.type)}`;
        }
        card.className = cls;
        if (isFin && typeof renderFinanceNodeHtml === 'function') {
          card.innerHTML = renderFinanceNodeHtml(n);
        } else if (String(n.type).startsWith('chart_') && typeof renderChartNodeHtml === 'function') {
          card.innerHTML = renderChartNodeHtml(n);
        } else {
          const txt = document.createElement('span');
          txt.className = 'txt';
          txt.textContent = n.text || '';
          card.appendChild(txt);
        }
        probeWrap.appendChild(card);
        n.w = Math.max(est.w, card.offsetWidth || 0);
        n.h = Math.max(est.h, card.offsetHeight || 0);
      });
    } catch {} finally {
      if (probeWrap && probeWrap.parentNode) probeWrap.parentNode.removeChild(probeWrap);
    }
  }

  async function autoOrganizeCanvasLive(silent = false, signal = null, layoutOptions = {}) {
    if (!STATE.nodes || STATE.nodes.length === 0) {
      if (!silent && typeof showToast === 'function') {
        showToast('No hay nodos en el lienzo para organizar', 'info', 1600);
      }
      return false;
    }

    if (typeof renderNodes === 'function') {
      try { renderNodes(); } catch {}
    }

    const startCoords = new Map(STATE.nodes.map(n => [n.id, { x: n.x, y: n.y }]));
    const targetClone = STATE.nodes.map(n => ({ ...n, params: n.params ? { ...n.params } : {} }));
    const layoutMeta = runSmartGraphLayoutEngine(targetClone, STATE.edges, {
      originX: 120,
      originY: 64,
      ...layoutOptions
    });
    const endCoords = new Map(targetClone.map(n => [n.id, { x: n.x, y: n.y, w: n.w, h: n.h }]));
    const targetCam = computeTargetCameraForRects(targetClone);

    const duration = Math.round(370 * getLiveAnimSpeedFactor());
    if (duration <= 0 || typeof requestAnimationFrame !== 'function') {
      STATE.nodes.forEach(n => {
        const dst = endCoords.get(n.id);
        if (dst) {
          n.x = dst.x;
          n.y = dst.y;
        }
      });
      if (typeof commitHistory === 'function') commitHistory();
      if (typeof renderAll === 'function') renderAll();
      focusNodesOnCanvas(STATE.nodes.map(n => n.id));
      if (!silent && typeof showToast === 'function') {
        showToast(`Ordenado: ${layoutMeta.description || layoutMeta.label} (${STATE.nodes.length} nodos)`, 'ok', 2200);
      }
      return layoutMeta;
    }

    setBuildHudState({
      mode: 'building',
      phase: 'ia :: reorganizando flujo',
      step: `${layoutMeta.description || layoutMeta.label} (${STATE.nodes.length} nodos)...`,
      current: 1,
      total: 2,
      showSkip: true
    });

    const startZoom = STATE.zoom;
    const startPanX = STATE.pan.x;
    const startPanY = STATE.pan.y;
    const startTs = performance.now();

    if (targetClone.length > 0) {
      moveAiWorldCursor(
        targetClone[0].x + (targetClone[0].w || 150) * 0.6,
        targetClone[0].y + (targetClone[0].h || 60) * 0.6,
        `ia :: ${(layoutMeta.label || 'ordenando').toLowerCase()}`,
        'building'
      );
    }

    await new Promise((resolve, reject) => {
      function stepFrame(now) {
        if (signal && signal.aborted) {
          const err = new Error('Aborted');
          err.name = 'AbortError';
          reject(err);
          return;
        }
        const rawT = liveBuildState.skipRequested ? 1 : clamp((now - startTs) / duration, 0, 1);
        const ease = 1 - Math.pow(1 - rawT, 3);

        STATE.nodes.forEach(n => {
          const s = startCoords.get(n.id) || { x: n.x, y: n.y };
          const e = endCoords.get(n.id) || s;
          n.x = Math.round(s.x + (e.x - s.x) * ease);
          n.y = Math.round(s.y + (e.y - s.y) * ease);
          const el = typeof nodeEl === 'function' ? nodeEl(n.id) : null;
          if (el) {
            el.style.left = `${n.x}px`;
            el.style.top = `${n.y}px`;
          }
        });

        if (targetCam) {
          STATE.zoom = startZoom + (targetCam.zoom - startZoom) * ease;
          STATE.pan.x = startPanX + (targetCam.panX - startPanX) * ease;
          STATE.pan.y = startPanY + (targetCam.panY - startPanY) * ease;
          if (typeof applyTransform === 'function') applyTransform();
        }
        if (typeof drawEdges === 'function') drawEdges();
        if (typeof drawMinimap === 'function') drawMinimap();

        if (rawT < 1) {
          requestAnimationFrame(stepFrame);
        } else {
          resolve();
        }
      }
      requestAnimationFrame(stepFrame);
    });

    STATE.nodes.forEach(n => {
      const dst = endCoords.get(n.id);
      if (dst) {
        n.x = dst.x;
        n.y = dst.y;
      }
    });

    if (typeof commitHistory === 'function') commitHistory();
    if (typeof renderAll === 'function') renderAll();
    focusNodesOnCanvas(STATE.nodes.map(n => n.id));

    setBuildHudState({
      mode: 'done',
      phase: 'ia :: nodos organizados',
      step: `${layoutMeta.description || layoutMeta.label} (${STATE.nodes.length} nodos)`,
      current: 2,
      total: 2,
      showSkip: false
    });
    hideAiWorldCursor();
    hideBuildHud(680);

    if (!silent && typeof showToast === 'function') {
      showToast(`Ordenado: ${layoutMeta.description || layoutMeta.label} (${STATE.nodes.length} nodos)`, 'ok', 2200);
    }
    if (typeof log === 'function') {
      log('agent', `Layout animado "${layoutMeta.description || layoutMeta.label}" aplicado a ${STATE.nodes.length} nodo(s).`);
    }
    return layoutMeta;
  }

  /**
   * Ejecuta las operaciones de la IA paso a paso frente a los ojos del usuario:
   * 1) Precalcula coordenadas jerárquicas exactas (cero saltos ni superposiciones).
   * 2) Encuadra suavemente la cámara y dibuja el boceto fantasma (wireframe).
   * 3) Materializa/edita/elimina cada nodo con puntero autónomo y escritura en vivo.
   * 4) Traza progresivamente cada conexión SVG conforme sus nodos quedan listos.
   */
  async function applyAIGraphActionsLive(actionPayload, options = {}) {
    if (!actionPayload || !Array.isArray(actionPayload.operations)) {
      return { addedNodes: [], addedEdges: [], updatedCount: 0, organized: false, visualSteps: [] };
    }

    const signal = options.signal || null;
    const onProgressStep = typeof options.onProgressStep === 'function' ? options.onProgressStep : null;

    stopCanvasThinkingScan(false);
    liveBuildState.isAnimating = true;
    liveBuildState.skipRequested = Boolean(window.__FLOWLAB_FAST_TEST);
    liveBuildState.lastStepLog = [];

    const visualSteps = [];
    const recordStep = (kind, label, current, total) => {
      const entry = { kind, label, index: current, total, at: Date.now() };
      visualSteps.push(entry);
      liveBuildState.lastStepLog.push(entry);
      setBuildHudState({
        mode: 'building',
        phase: 'ia :: construyendo en vivo',
        step: label,
        current,
        total,
        showSkip: true
      });
      if (onProgressStep) {
        try { onProgressStep(entry); } catch {}
      }
    };

    try {
      // Asegurar punto de restauración limpio previo a los cambios de la IA
      if (typeof commitHistory === 'function') commitHistory();

      // Si el lienzo previo tenía nodos a miles de píxeles, compactarlos suavemente primero
      if (STATE.nodes && STATE.nodes.length >= 2 && isCanvasAbnormallyScattered(STATE.nodes)) {
        await autoOrganizeCanvasLive(true, signal);
      }

      const ops = actionPayload.operations;
      const refMap = new Map();
      let hasClearCanvas = false;
      const deleteIdsOrdered = [];
      const deletedSet = new Set();
      const updateOps = [];
      const pendingNewNodes = [];
      const pendingEdges = [];
      let requestedOrganize = false;
      let requestedLayoutOpts = null;

      const selectedIdSnapshot =
        STATE.sel && STATE.sel.kind === 'node' ? STATE.sel.id : null;

      const resolveTokenPlanned = token => {
        if (!token) return null;
        if (token === 'SELECTED' && selectedIdSnapshot && !hasClearCanvas && !deletedSet.has(selectedIdSnapshot)) {
          return selectedIdSnapshot;
        }
        if (refMap.has(token)) return refMap.get(token);
        if (!hasClearCanvas && !deletedSet.has(token)) {
          const ex = byId(token);
          if (ex) return ex.id;
        }
        return null;
      };

      // 1. Planificar operaciones en orden lógico sin mutar todavía el lienzo visible
      ops.forEach((op, index) => {
        if (!op || typeof op !== 'object') return;
        const kind = String(op.op || op.action || '').toLowerCase();

        if (kind === 'organize_canvas' || kind === 'auto_layout') {
          requestedOrganize = true;
          requestedLayoutOpts = {
            mode: op.mode || op.style || op.layout || 'domain_bridge',
            density: op.density || 'normal',
            columns: op.columns,
            reverse: Boolean(op.reverse),
            sortBy: op.sortBy || 'topology',
            align: op.align || 'center'
          };
        } else if (kind === 'clear_canvas') {
          hasClearCanvas = true;
          deleteIdsOrdered.length = 0;
          deletedSet.clear();
          updateOps.length = 0;
        } else if (kind === 'delete_node' && op.id) {
          const targetId = resolveTokenPlanned(op.id);
          if (targetId && !deletedSet.has(targetId)) {
            deletedSet.add(targetId);
            deleteIdsOrdered.push(targetId);
          }
        } else if (kind === 'update_node' && op.id) {
          const targetId = resolveTokenPlanned(op.id);
          if (targetId && !deletedSet.has(targetId)) {
            updateOps.push({ targetId, op });
          }
        } else if (kind === 'add_node') {
          const type = normalizeNodeType(op.type);
          const rawLabel = op.text || op.label || CONFIG.NODE_TYPES[type] || 'Paso';
          const cleanTxt = sanitizeAINodeText(rawLabel, type);
          const nodeObj = createNode(type, cleanTxt.displayText, 0, 0);
          const normStatus = normalizeNodeStatus(op.status);
          if (normStatus) nodeObj.status = normStatus;
          if (typeof op.progress === 'number') nodeObj.progress = clamp(op.progress, 0, 100);
          if (op.params && typeof op.params === 'object') nodeObj.params = { ...op.params };
          if (typeof isFinanceNodeType === 'function' && isFinanceNodeType(type) && typeof ensureFinanceNodeDefaults === 'function') {
            ensureFinanceNodeDefaults(nodeObj);
            if (STATE.canvasDomain !== 'finance' && typeof setWorkspaceDomain === 'function') {
              setWorkspaceDomain('finance', { silent: true });
            }
          }
          if (cleanTxt.overflowNotes) {
            nodeObj.params = { ...(nodeObj.params || {}), notes: cleanTxt.overflowNotes };
          }

          const refKey = String(op.ref || op.id || 'ref_' + index);
          refMap.set(refKey, nodeObj.id);
          pendingNewNodes.push({
            refKey,
            node: nodeObj,
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

      const survivingPreNodes = hasClearCanvas
        ? []
        : (STATE.nodes || []).filter(n => !deletedSet.has(n.id));
      const survivingPreEdges = hasClearCanvas
        ? []
        : (STATE.edges || []).filter(e => !deletedSet.has(e.from) && !deletedSet.has(e.to));

      const addedNodes = pendingNewNodes.map(item => item.node);
      const addedIdsSet = new Set(addedNodes.map(n => n.id));
      const plannedEdges = [];
      let externalAnchorNode = null;

      const hasEdgePlannedOrExisting = (fromId, toId) =>
        survivingPreEdges.some(e => e.from === fromId && e.to === toId) ||
        plannedEdges.some(pe => pe.fromId === fromId && pe.toId === toId);

      pendingEdges.forEach(pe => {
        const fromId = resolveTokenPlanned(pe.fromRaw);
        const toId = resolveTokenPlanned(pe.toRaw);
        if (!fromId || !toId || fromId === toId) return;
        if (!addedIdsSet.has(fromId) && addedIdsSet.has(toId)) {
          const ext = survivingPreNodes.find(n => n.id === fromId);
          if (ext && !externalAnchorNode) externalAnchorNode = ext;
        }
        if (!hasEdgePlannedOrExisting(fromId, toId)) {
          plannedEdges.push({ fromId, toId, label: pe.label || '' });
        }
      });

      pendingNewNodes.forEach(item => {
        if (!item.afterRaw) return;
        const fromId = resolveTokenPlanned(item.afterRaw);
        const toId = item.node.id;
        if (!fromId || fromId === toId) return;
        if (!addedIdsSet.has(fromId)) {
          const ext = survivingPreNodes.find(n => n.id === fromId);
          if (ext && !externalAnchorNode) externalAnchorNode = ext;
        }
        const alreadyHasIn =
          survivingPreEdges.some(e => e.to === toId) ||
          plannedEdges.some(pe => pe.toId === toId);
        if (!alreadyHasIn) {
          plannedEdges.push({ fromId, toId, label: '' });
        }
      });

      if (addedNodes.length >= 2) {
        for (let i = 0; i < addedNodes.length; i++) {
          const cur = addedNodes[i];
          if (cur.type === 'note') continue;
          const hasIn =
            survivingPreEdges.some(e => e.to === cur.id) ||
            plannedEdges.some(pe => pe.toId === cur.id);
          const hasOut =
            survivingPreEdges.some(e => e.from === cur.id) ||
            plannedEdges.some(pe => pe.fromId === cur.id);
          if (!hasIn && !hasOut) {
            if (i > 0 && addedNodes[i - 1].type !== 'note') {
              plannedEdges.push({ fromId: addedNodes[i - 1].id, toId: cur.id, label: '' });
            } else if (i + 1 < addedNodes.length && addedNodes[i + 1].type !== 'note') {
              plannedEdges.push({ fromId: cur.id, toId: addedNodes[i + 1].id, label: '' });
            }
          }
        }
      }

      // 2. Precalcular dimensiones exactas y layout jerárquico compacto ANTES de mostrar nodos
      let orderedNewNodes = [];
      if (addedNodes.length > 0) {
        measureNodesOffscreenExact(addedNodes);

        let originX = 240;
        let originY = 64;
        let centerFirstColumnX = undefined;

        if (externalAnchorNode) {
          centerFirstColumnX = externalAnchorNode.x + (externalAnchorNode.w || 150) / 2;
          originX = Math.max(48, centerFirstColumnX - 90);
          originY = externalAnchorNode.y + (externalAnchorNode.h || 60) + 52;
        } else if (survivingPreNodes.length > 0) {
          const exMinY = Math.min(...survivingPreNodes.map(n => n.y));
          const exMaxX = Math.max(...survivingPreNodes.map(n => n.x + (n.w || 150)));
          originX = exMaxX + 96;
          originY = Math.max(48, exMinY);
        }

        const combinedEdgesForLayout = [
          ...survivingPreEdges.map(e => ({ from: e.from, to: e.to })),
          ...plannedEdges.map(pe => ({ from: pe.fromId, to: pe.toId }))
        ];

        runSmartGraphLayoutEngine(addedNodes, combinedEdgesForLayout, {
          originX,
          originY,
          mode: 'domain_bridge'
        });

        let safetySteps = 0;
        while (
          survivingPreNodes.length > 0 &&
          safetySteps < 14 &&
          groupOverlapsExisting(addedNodes, survivingPreNodes, 24)
        ) {
          if (externalAnchorNode) {
            shiftNodeGroup(addedNodes, 0, 48);
          } else {
            shiftNodeGroup(addedNodes, 72, 0);
          }
          safetySteps++;
        }

        // Ordenar de arriba abajo y de izquierda a derecha para construir como un arquitecto humano
        orderedNewNodes = addedNodes.slice().sort((a, b) => {
          const rowDiff = Math.round(a.y / 24) - Math.round(b.y / 24);
          if (rowDiff !== 0) return rowDiff;
          return a.x - b.x;
        });
      }

      const totalSteps =
        (hasClearCanvas ? 1 : 0) +
        deleteIdsOrdered.length +
        updateOps.length +
        orderedNewNodes.length +
        plannedEdges.length +
        (requestedOrganize ? 1 : 0);

      if (totalSteps === 0) {
        hideAiWorldCursor();
        hideBuildHud(0);
        return { addedNodes: [], addedEdges: [], updatedCount: 0, organized: false, visualSteps: [] };
      }

      let stepCounter = 0;
      let updatedCount = 0;
      const createdEdges = [];

      // 3. Encuadrar suavemente la cámara hacia el área donde trabajará la IA y mostrar boceto fantasma
      const cameraTargets = [
        ...orderedNewNodes,
        ...updateOps.map(u => byId(u.targetId)).filter(Boolean),
        ...(externalAnchorNode ? [externalAnchorNode] : [])
      ];
      if (cameraTargets.length > 0) {
        setBuildHudState({
          mode: 'building',
          phase: 'ia :: preparando área de trabajo',
          step: orderedNewNodes.length > 0
            ? `Trazando boceto para ${orderedNewNodes.length} nodo(s) y ${plannedEdges.length} conexión(es)...`
            : `Enfocando nodos a editar...`,
          current: 0,
          total: totalSteps,
          showSkip: true
        });
        await animateCameraToRects(cameraTargets, 220, signal);
      }

      if (orderedNewNodes.length > 0) {
        renderBlueprintSlots(orderedNewNodes);
        await waitLiveVisualBeat(110, signal);
      }

      // 4A. Limpieza progresiva del lienzo si se solicitó clear_canvas
      if (hasClearCanvas) {
        stepCounter++;
        recordStep('clear_canvas', 'Limpiando lienzo anterior...', stepCounter, totalSteps);
        if (DOM.world) {
          DOM.world.querySelectorAll('.node').forEach(el => el.classList.add('ai-node-deleting'));
        }
        await waitLiveVisualBeat(150, signal);
        STATE.nodes = [];
        STATE.edges = [];
        STATE.sel = null;
        STATE.isBlankCanvas = false;
        if (typeof renderNodes === 'function') renderNodes();
        if (typeof drawEdges === 'function') drawEdges();
        if (typeof updateStatus === 'function') updateStatus();
        if (typeof drawMinimap === 'function') drawMinimap();
      }

      // 4B. Eliminación visual nodo por nodo
      for (const delId of deleteIdsOrdered) {
        const target = byId(delId);
        stepCounter++;
        const shortDel = target
          ? String(target.text || target.type).replace(/\s+/g, ' ').slice(0, 32)
          : delId;
        recordStep('delete_node', `Eliminando nodo "${shortDel}"`, stepCounter, totalSteps);

        if (target) {
          moveAiWorldCursor(
            target.x + (target.w || 150) * 0.55,
            target.y + (target.h || 60) * 0.55,
            'ia :: eliminando',
            'deleting'
          );
          const el = typeof nodeEl === 'function' ? nodeEl(target.id) : null;
          if (el) el.classList.add('ai-node-deleting');
          await waitLiveVisualBeat(185, signal);

          STATE.nodes = STATE.nodes.filter(n => n.id !== delId);
          STATE.edges = STATE.edges.filter(e => e.from !== delId && e.to !== delId);
          if (STATE.sel && STATE.sel.id === delId) STATE.sel = null;
          updatedCount++;
          if (typeof renderNodes === 'function') renderNodes();
          if (typeof drawEdges === 'function') drawEdges();
          if (typeof updateStatus === 'function') updateStatus();
          if (typeof drawMinimap === 'function') drawMinimap();
        }
      }

      // 4C. Edición en vivo de nodos existentes (texto con máquina de escribir, estado y tipo)
      for (const item of updateOps) {
        const target = byId(item.targetId);
        const op = item.op;
        stepCounter++;
        if (!target) continue;

        const prevName = String(target.text || target.type).replace(/\s+/g, ' ').slice(0, 26);
        let nextDisplayText = null;
        if (typeof op.text === 'string' && op.text.trim()) {
          const cleanTxt = sanitizeAINodeText(op.text, op.type ? normalizeNodeType(op.type) : target.type);
          nextDisplayText = cleanTxt.displayText;
          if (cleanTxt.overflowNotes) {
            target.params = { ...(target.params || {}), notes: cleanTxt.overflowNotes };
          }
        }
        if (op.type) target.type = normalizeNodeType(op.type);
        const normUpdStatus = normalizeNodeStatus(op.status);
        if (normUpdStatus) target.status = normUpdStatus;
        if (typeof op.progress === 'number') target.progress = clamp(op.progress, 0, 100);
        if (op.params && typeof op.params === 'object') {
          target.params = { ...(target.params || {}), ...op.params };
        }
        if (nextDisplayText !== null) {
          target.text = nextDisplayText;
        }

        const afterName = String(target.text || target.type).replace(/\s+/g, ' ').slice(0, 28);
        recordStep(
          'update_node',
          nextDisplayText && nextDisplayText !== prevName
            ? `Editando nodo: "${prevName}" → "${afterName}"`
            : `Actualizando propiedades de "${afterName}"`,
          stepCounter,
          totalSteps
        );

        moveAiWorldCursor(
          target.x + (target.w || 150) * 0.62,
          target.y + (target.h || 60) * 0.68,
          'ia :: editando nodo',
          'editing'
        );
        STATE.sel = { kind: 'node', id: target.id };
        if (typeof renderAll === 'function') renderAll();

        const domTarget = typeof nodeEl === 'function' ? nodeEl(target.id) : null;
        if (domTarget) domTarget.classList.add('ai-node-editing');

        if (nextDisplayText !== null) {
          await animateNodeTypewriter(target.id, nextDisplayText, 175, signal);
        } else {
          await waitLiveVisualBeat(160, signal);
        }

        if (domTarget) {
          domTarget.classList.remove('ai-node-editing');
          domTarget.classList.add('ai-node-just-updated');
          setTimeout(() => {
            try { domTarget.classList.remove('ai-node-just-updated'); } catch {}
          }, 900);
        }
        updatedCount++;
      }

      // 4D. Creación progresiva nodo por nodo + tendido de conexiones listas tras cada nodo
      const remainingEdges = plannedEdges.slice();

      const drawReadyEdgesNow = async () => {
        for (let idx = 0; idx < remainingEdges.length; ) {
          const pe = remainingEdges[idx];
          const fromNode = byId(pe.fromId);
          const toNode = byId(pe.toId);
          if (!fromNode || !toNode) {
            idx++;
            continue;
          }
          remainingEdges.splice(idx, 1);
          stepCounter++;

          if (STATE.edges.some(e => e.from === pe.fromId && e.to === pe.toId)) {
            continue;
          }

          const fromShort = String(fromNode.text || fromNode.type).replace(/\s+/g, ' ').slice(0, 18);
          const toShort = String(toNode.text || toNode.type).replace(/\s+/g, ' ').slice(0, 18);
          recordStep(
            'add_edge',
            `Conectando "${fromShort}" → "${toShort}"${pe.label ? ` [${pe.label}]` : ''}`,
            stepCounter,
            totalSteps
          );

          moveAiWorldCursor(
            toNode.x + (toNode.w || 150) * 0.52,
            toNode.y + 8,
            pe.label ? `ia :: enlace [${pe.label}]` : 'ia :: conectando',
            'building'
          );

          const edge = createEdge(pe.fromId, pe.toId, pe.label || '', 'normal');
          STATE.edges.push(edge);
          createdEdges.push(edge);

          if (typeof renderNodes === 'function') renderNodes();
          if (typeof drawEdges === 'function') drawEdges();
          if (typeof updateStatus === 'function') updateStatus();
          if (typeof drawMinimap === 'function') drawMinimap();

          await animateEdgeStrokeDraw(edge.id, 175, signal);
        }
      };

      // Conectar primero aristas entre nodos ya existentes
      await drawReadyEdgesNow();

      for (let i = 0; i < orderedNewNodes.length; i++) {
        const node = orderedNewNodes[i];
        stepCounter++;
        const typeLabel = (CONFIG.NODE_TYPES && CONFIG.NODE_TYPES[node.type]) || node.type;
        const shortNodeTxt = String(node.text || typeLabel).replace(/\s+/g, ' ').slice(0, 34);

        recordStep(
          'add_node',
          `Creando ${typeLabel}: "${shortNodeTxt}"`,
          stepCounter,
          totalSteps
        );

        highlightBlueprintSlot(node.id);
        moveAiWorldCursor(
          node.x + (node.w || 150) * 0.62,
          node.y + (node.h || 60) * 0.68,
          `ia :: +${String(typeLabel).toLowerCase()}`,
          'building'
        );
        await waitLiveVisualBeat(95, signal);

        removeBlueprintSlot(node.id);
        STATE.nodes.push(node);
        STATE.isBlankCanvas = false;
        STATE.sel = { kind: 'node', id: node.id };

        if (typeof renderNodes === 'function') renderNodes();
        if (typeof drawEdges === 'function') drawEdges();
        if (typeof updateStatus === 'function') updateStatus();
        if (typeof drawMinimap === 'function') drawMinimap();

        const domCreated = typeof nodeEl === 'function' ? nodeEl(node.id) : null;
        if (domCreated) domCreated.classList.add('ai-node-constructing');

        await animateNodeTypewriter(node.id, node.text, 160, signal);

        if (domCreated) {
          setTimeout(() => {
            try { domCreated.classList.remove('ai-node-constructing'); } catch {}
          }, 500);
        }

        // En cuanto este nodo aterriza, trazar en vivo cualquier flecha lista hacia/desde él
        await drawReadyEdgesNow();
      }

      // 4E. Reorganización animada suave si se solicitó organize_canvas o si algún nodo creció al conectarse (ej. gráficos y celdas fx)
      if (typeof renderNodes === 'function') {
        try { renderNodes(); } catch {}
      }
      const hasPostBuildCrowding = (() => {
        const list = STATE.nodes || [];
        for (let i = 0; i < list.length; i++) {
          for (let j = i + 1; j < list.length; j++) {
            const a = list[i];
            const b = list[j];
            const aw = a.w || 180;
            const ah = a.h || 68;
            const bw = b.w || 180;
            const bh = b.h || 68;
            if (a.x < b.x + bw + 34 && a.x + aw + 34 > b.x && a.y < b.y + bh + 34 && a.y + ah + 34 > b.y) {
              return true;
            }
          }
        }
        return false;
      })();

      if ((requestedOrganize || (orderedNewNodes.length > 0 && hasPostBuildCrowding)) && STATE.nodes.length > 0) {
        if (requestedOrganize) {
          stepCounter++;
          recordStep(
            'organize_canvas',
            `Aplicando disposición ${requestedLayoutOpts?.mode || 'inteligente'} a ${STATE.nodes.length} nodos...`,
            stepCounter,
            totalSteps
          );
        }
        await autoOrganizeCanvasLive(true, signal, requestedLayoutOpts || { mode: 'domain_bridge' });
        if (requestedOrganize) updatedCount += STATE.nodes.length;
      }

      // 5. Consolidar un único punto de historial (Undo limpio) y sincronizar UI final
      clearBlueprintSlots();
      hideAiWorldCursor();

      if (orderedNewNodes.length > 0) {
        STATE.sel = { kind: 'node', id: orderedNewNodes[0].id };
      }

      if (typeof commitHistory === 'function') commitHistory();
      if (typeof renderAll === 'function') renderAll();

      if (requestedOrganize && STATE.nodes.length > 0) {
        focusNodesOnCanvas(STATE.nodes.map(n => n.id));
      } else if (orderedNewNodes.length > 0) {
        focusNodesOnCanvas(orderedNewNodes.map(n => n.id));
      }

      const summaryParts = [];
      if (orderedNewNodes.length) summaryParts.push(`+${orderedNewNodes.length} nodo(s)`);
      if (createdEdges.length) summaryParts.push(`+${createdEdges.length} conexión(es)`);
      if (updatedCount) summaryParts.push(`${updatedCount} ajustado(s)`);

      setBuildHudState({
        mode: 'done',
        phase: 'ia :: construcción completada',
        step: summaryParts.join(' · ') || 'Cambios aplicados en el lienzo',
        current: totalSteps,
        total: totalSteps,
        showSkip: false
      });
      hideBuildHud(780);

      if (typeof log === 'function') {
        log('agent', `IA construyó en vivo: ${summaryParts.join(', ') || 'sin cambios'}`);
      }

      return {
        addedNodes: orderedNewNodes,
        addedEdges: createdEdges,
        updatedCount,
        organized: requestedOrganize,
        visualSteps
      };
    } catch (err) {
      clearBlueprintSlots();
      hideAiWorldCursor();
      hideBuildHud(0);
      if (typeof commitHistory === 'function') commitHistory();
      if (typeof renderAll === 'function') renderAll();
      throw err;
    } finally {
      liveBuildState.isAnimating = false;
      liveBuildState.skipResolvers.clear();
      clearBlueprintSlots();
      clearCanvasScanHighlights();
    }
  }

  function isOrganizeCanvasIntent(rawOrNormPrompt) {
    if (typeof window.parseNaturalLayoutIntent === 'function') {
      const parsed = window.parseNaturalLayoutIntent(rawOrNormPrompt);
      if (parsed && parsed.matched) return true;
    }
    const normPrompt = normalizePlainSpanish(rawOrNormPrompt);
    return (
      /\b(ordena\w*|organiza\w*|acomoda\w*|alinea\w*|compacta\w*|junta\w*|reordena\w*|distribuy\w*|separa\w*|ponlo\w*|ponlos)\b/i.test(
        normPrompt
      ) &&
      /\b(nodo\w*|flujo\w*|diagrama\w*|lienzo|canvas|distancia\w*|todo|mapa|vertical\w*|horizontal\w*|arbol\w*|columna\w*|fila\w*|circul\w*|radial\w*|kanban|carril\w*)\b/i.test(
        normPrompt
      )
    );
  }

  // =========================================================================
  // MOTOR INTEGRADO OFFLINE (SIN SERVIDOR EXTERNO NI API KEY)
  // =========================================================================
  function runBuiltinAssistant(userPrompt, attachmentsSnapshot = []) {
    const hasAtts = Array.isArray(attachmentsSnapshot) && attachmentsSnapshot.length > 0;
    const domainCheck = evaluateFlowLabDomainGuard(userPrompt, messages, hasAtts);
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

    // 0A. Si el usuario adjuntó imágenes o cualquier documento, analizarlos y armar tareas / nodos
    if (hasAtts && typeof window.synthesizeActionsFromDocuments === 'function') {
      const onlyQuestionNoBuild =
        /\b(solo resume|solo explica|no crees|sin crear nodos)\b/i.test(norm);
      const docSynth = window.synthesizeActionsFromDocuments(attachmentsSnapshot, userPrompt);

      const attLines = attachmentsSnapshot.map(att => {
        const snippet = (att.extractedText || '')
          .split(/\r?\n/)
          .map(s => s.trim())
          .filter(s => s.length > 3)
          .slice(0, 4)
          .map(s => `  - ${s.length > 96 ? s.slice(0, 93) + '…' : s}`)
          .join('\n');
        return (
          `• **\`${att.name}\`** (${att.kind.toUpperCase()} · ${att.sizeLabel}${att.isImage && att.dimensions ? ` · ${att.dimensions.width}×${att.dimensions.height}px` : ''})\n` +
          (snippet || `  - ${att.summarySnippet || 'Archivo procesado correctamente.'}`)
        );
      });

      if (onlyQuestionNoBuild || !docSynth) {
        return {
          cleanReply:
            `He leído y procesado **${attachmentsSnapshot.length} archivo(s) adjunto(s)**:\n\n` +
            `${attLines.join('\n')}\n\n` +
            `Si deseas llevar este contenido al lienzo, indícame por ejemplo: *«arma las tareas de este documento»* o *«construye la planilla financiera de este archivo»*.`,
          actions: null
        };
      }

      const modeLabel =
        docSynth.domain === 'hybrid'
          ? 'flujo operativo conectado con planilla financiera `fx`'
          : docSynth.domain === 'finance'
            ? 'modelo financiero estructurado (`fx`)'
            : 'flujo de tareas operativas y validaciones';

      return {
        cleanReply:
          `He analizado **${attachmentsSnapshot.length} archivo(s) adjunto(s)** y estructurado en el lienzo un **${modeLabel}** basado en su contenido:\n\n` +
          `${attLines.join('\n')}\n\n` +
          `También puedes pedirme reorganizar estos nodos en cualquier arquitectura (*«ordénalo de forma vertical»*, *«en horizontal»*, *«modo kanban»*, *«en carriles por tipo»* o *«separa flujo y finanzas»*).`,
        actions: docSynth.actions
      };
    }

    // 0B. Consulta sobre cuántas formas de ordenar nodos existen
    if (/\b(cuantas formas|cuantas maneras|modos de orden\w*|estilos de orden\w*|como puedes ordenar|formas de organizar)\b/i.test(norm)) {
      const presets = Array.isArray(window.FLOWLAB_LAYOUT_PRESETS) ? window.FLOWLAB_LAYOUT_PRESETS : [];
      const listTxt = presets
        .map(p => `• **${p.label}**: ${p.desc}`)
        .join('\n');
      return {
        cleanReply:
          `Cuento con un **motor paramétrico combinable** (**16 arquitecturas base × densidades × columnas × criterios de orden × inversión**, sumando cientos de disposiciones exactas sin cruces):\n\n` +
          `${listTxt}\n\n` +
          `Pídeme por ejemplo: *«ordénalo de forma vertical»*, *«ponlo horizontal amplio»*, *«organízalo en cuadrícula de 4 columnas»*, *«modo kanban por estado»*, *«en anillos radiales»* o usa el botón **\`ordenar\`** arriba.`,
        actions: null
      };
    }

    // 0C. Solicitudes para organizar / cambiar disposición espacial de los nodos en el lienzo
    if (isOrganizeCanvasIntent(userPrompt) && !/\b(crea|genera|agrega|anade|inserta)\b/i.test(norm)) {
      const parsedLayout =
        typeof window.parseNaturalLayoutIntent === 'function'
          ? window.parseNaturalLayoutIntent(userPrompt)
          : { mode: 'domain_bridge', density: 'normal', label: 'Puente Flujo ⇄ Finanzas', description: 'Puente Flujo ⇄ Finanzas' };

      return {
        cleanReply:
          `Listo: he reorganizado los **${ctx.summary.totalNodes} nodos** de **\`${ctx.projectTitle}\`** aplicando la arquitectura **${parsedLayout.description || parsedLayout.label}**, con enrutamiento ortogonal limpio para evitar cruces sobre nodos.\n\n` +
          `Si quieres probar otra vista, puedes decirme: *«en horizontal»*, *«vertical compacto»*, *«en árbol»*, *«en carriles por tipo»*, *«modo kanban»*, *«cuadrícula de 4 columnas»* o *«separa flujo y finanzas»*.`,
        actions: {
          summary: `${parsedLayout.description || parsedLayout.label} (${ctx.summary.totalNodes} nodos)`,
          operations: [
            {
              op: 'organize_canvas',
              mode: parsedLayout.mode || 'domain_bridge',
              density: parsedLayout.density || 'normal',
              columns: parsedLayout.columns,
              reverse: Boolean(parsedLayout.reverse),
              sortBy: parsedLayout.sortBy || 'topology',
              align: parsedLayout.align || 'center'
            }
          ]
        }
      };
    }

    const isHowToQuestion =
      /^(como|donde|para que|que es|cuales son|puedo)\b/i.test(norm) &&
      !/\b(crea|genera|agrega|anade|inserta|construye|arma|disena)\b/i.test(norm);

    const wantsCreation =
      !isHowToQuestion &&
      (/\b(crea|crear|genera|generar|agrega|agregar|anade|añade|añadir|inserta|insertar|construye|arma|diseña|disena|modela|modelar|estructura|estructurar|nuevo nodo|nuevos nodos|flujo de|flujo para|diagrama de|proceso de|expande|expandir)\b/i.test(
        q
      ) ||
        /\b(haz|hacer)\s+(un|una|el|la|dos|tres|\d+)\s+(flujo|diagrama|nodo|nodos|rama|ramas|proceso|secuencia|validacion|validación|arquitectura|pipeline)\b/i.test(
          q
        ));

    // 1. Solicitudes explícitas de creación de flujos o nodos
    if (wantsCreation) {
      return generateBuiltinFlowProposal(userPrompt, q, norm, selNode);
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
          `• **Diseñar y añadir nodos bien organizados**: *"crea un flujo de autenticación"*, *"crea un pipeline de pagos"*.\n` +
          `• **Compactar el lienzo**: *"ordena los nodos"* o pulsa el botón **\`ordenar\`**.\n` +
          `• **Auditar tu arquitectura**: *"analiza los cuellos de botella o nodos bloqueados"*.`,
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
        `\nPuedes pedirme crear flujos estructurados (ej. *"crea un flujo de autenticación"*, *"crea un flujo de soporte con IA"*), ordenar el lienzo (*"ordena los nodos"*) o conectar **Ollama / LM Studio / API Key** arriba.`,
      actions: null
    };
  }

  function inferStepNodeType(stepLabel, idx, total, hasAnchor) {
    const s = normalizePlainSpanish(stepLabel);
    if (idx === 0 && !hasAnchor && /\b(inicio|iniciar|comenzar|start|entrada inicial)\b/.test(s)) return 'start';
    if (idx === total - 1 && /\b(fin|final|completado|cierre|terminado|end)\b/.test(s)) return 'end';
    if (stepLabel.includes('?') || /\b(validar si|es valido|aprobado|existe|cumple|decision|condicion)\b/.test(s)) return 'decision';
    if (/\b(bd|base de datos|sql|guardar|consulta|registrar|cache|inventario|stock)\b/.test(s)) return 'db';
    if (/\b(api|http|endpoint|pasarela|servicio|token|jwt|externo)\b/.test(s)) return 'api';
    if (/\b(webhook|correo|email|notificar|alerta|mensaje|confirmacion)\b/.test(s)) return 'hook';
    if (/\b(ia|llm|agente|clasificar|resumir|modelo|inteligencia)\b/.test(s)) return 'ai';
    if (/\b(error|rechazar|excepcion|fallo|rollback)\b/.test(s)) return 'err';
    if (/\b(manual|humano|supervisor|revision|revisar)\b/.test(s)) return 'human';
    if (/\b(recibir|formulario|solicitud|input|datos|credenciales)\b/.test(s)) return 'io';
    if (/\b(grafico|barra|panel|dashboard)\b/.test(s)) return 'chart_bar';
    if (idx === 0 && !hasAnchor) return 'start';
    if (idx === total - 1 && total >= 3) return 'end';
    return 'process';
  }

  function generateBuiltinFlowProposal(rawPrompt, q, norm, selNode) {
    // Solo encadenar al nodo seleccionado si el usuario lo pide explícitamente (evita estirar flujos nuevos debajo de otros)
    const explicitAttach =
      Boolean(selNode) &&
      /\b(este nodo|seleccionado|expande|expandir|rama|ramas|bifurca|despues|a partir|conectado a|continua)\b/i.test(norm);
    const anchorId = explicitAttach ? selNode.id : null;

    const wantsFreshCanvas =
      /\b(desde cero|limpia el lienzo|borra todo|reemplaza todo|nuevo lienzo)\b/i.test(norm);
    const prefixOps = wantsFreshCanvas ? [{ op: 'clear_canvas' }] : [];

    // Caso A: Expandir nodo seleccionado o crear bifurcación Sí/No
    if (
      (norm.includes('rama') || norm.includes('decision') || norm.includes('bifurca') || norm.includes('expande')) &&
      selNode
    ) {
      const targetAnchor = selNode.id;
      const ops = [
        { op: 'add_node', ref: 'd1', type: 'decision', text: '¿Validación correcta?', after: targetAnchor },
        { op: 'add_node', ref: 'ok1', type: 'process', text: 'Continuar proceso', after: 'd1' },
        { op: 'add_node', ref: 'err1', type: 'err', text: 'Gestionar excepción', after: 'd1' },
        { op: 'add_edge', from: targetAnchor, to: 'd1', label: '' },
        { op: 'add_edge', from: 'd1', to: 'ok1', label: 'Sí' },
        { op: 'add_edge', from: 'd1', to: 'err1', label: 'No' }
      ];
      return {
        cleanReply: `He diseñado una bifurcación **Sí / No** compacta y alineada directamente debajo de **\`${selNode.text.split('\n')[0]}\`**.`,
        actions: { summary: 'Rama de decisión Sí/No conectada', operations: ops }
      };
    }

    // Caso B: Flujo de login / autenticación / registro / seguridad
    if (/\b(login|autentic|sesion|registro|contrase|2fa|permiso|acceso)\b/i.test(norm)) {
      const ops = [
        ...prefixOps,
        { op: 'add_node', ref: 'a1', type: 'start', text: 'Inicio acceso', ...(anchorId ? { after: anchorId } : {}) },
        { op: 'add_node', ref: 'a2', type: 'io', text: 'Recibir credenciales', after: 'a1' },
        { op: 'add_node', ref: 'a3', type: 'db', text: 'Consultar usuario BD', after: 'a2' },
        { op: 'add_node', ref: 'a4', type: 'decision', text: '¿Credenciales válidas?', after: 'a3' },
        { op: 'add_node', ref: 'a5', type: 'api', text: 'Emitir sesión JWT', after: 'a4' },
        { op: 'add_node', ref: 'a6', type: 'err', text: 'Denegar acceso (401)', after: 'a4' },
        { op: 'add_node', ref: 'a7', type: 'end', text: 'Acceso completado', after: 'a5' },
        ...(anchorId ? [{ op: 'add_edge', from: anchorId, to: 'a1', label: '' }] : []),
        { op: 'add_edge', from: 'a1', to: 'a2', label: '' },
        { op: 'add_edge', from: 'a2', to: 'a3', label: '' },
        { op: 'add_edge', from: 'a3', to: 'a4', label: '' },
        { op: 'add_edge', from: 'a4', to: 'a5', label: 'Sí' },
        { op: 'add_edge', from: 'a4', to: 'a6', label: 'No' },
        { op: 'add_edge', from: 'a5', to: 'a7', label: 'OK' }
      ];
      return {
        cleanReply:
          'He creado un flujo compacto de **autenticación** con recepción de credenciales, verificación en base de datos, bifurcación **Sí / No**, emisión de JWT y cierre.',
        actions: { summary: 'Flujo de autenticación (7 nodos)', operations: ops }
      };
    }

    // Caso C: Flujo de pagos / ventas / ecommerce / pedidos / facturación
    if (/\b(venta|ventas|pago|pagos|compra|pedido|pedidos|checkout|tienda|carrito|factura)\b/i.test(norm)) {
      const ops = [
        ...prefixOps,
        { op: 'add_node', ref: 'v1', type: 'start', text: 'Nuevo pedido', ...(anchorId ? { after: anchorId } : {}) },
        { op: 'add_node', ref: 'v2', type: 'db', text: 'Verificar inventario', after: 'v1' },
        { op: 'add_node', ref: 'v3', type: 'api', text: 'Cobrar en pasarela', after: 'v2' },
        { op: 'add_node', ref: 'v4', type: 'decision', text: '¿Pago aprobado?', after: 'v3' },
        { op: 'add_node', ref: 'v5', type: 'hook', text: 'Emitir confirmación', after: 'v4' },
        { op: 'add_node', ref: 'v6', type: 'err', text: 'Notificar rechazo', after: 'v4' },
        { op: 'add_node', ref: 'v7', type: 'end', text: 'Pedido despachado', after: 'v5' },
        ...(anchorId ? [{ op: 'add_edge', from: anchorId, to: 'v1', label: '' }] : []),
        { op: 'add_edge', from: 'v1', to: 'v2', label: '' },
        { op: 'add_edge', from: 'v2', to: 'v3', label: '' },
        { op: 'add_edge', from: 'v3', to: 'v4', label: '' },
        { op: 'add_edge', from: 'v4', to: 'v5', label: 'Sí' },
        { op: 'add_edge', from: 'v4', to: 'v6', label: 'No' },
        { op: 'add_edge', from: 'v5', to: 'v7', label: 'OK' }
      ];
      return {
        cleanReply:
          'He estructurado un flujo compacto de **pedidos y pagos** con validación de stock, pasarela API, rama de aprobación/rechazo y confirmación final.',
        actions: { summary: 'Flujo de ventas y pagos (7 nodos)', operations: ops }
      };
    }

    // Caso D: Flujo de Agente IA / Soporte / Tickets / Atención al cliente
    if (/\b(soporte|ticket|atencion|cliente|chatbot|agente ia|clasificacion)\b/i.test(norm)) {
      const ops = [
        ...prefixOps,
        { op: 'add_node', ref: 's1', type: 'start', text: 'Nueva consulta', ...(anchorId ? { after: anchorId } : {}) },
        { op: 'add_node', ref: 's2', type: 'io', text: 'Capturar mensaje', after: 's1' },
        { op: 'add_node', ref: 's3', type: 'ai', text: 'Clasificar con IA', after: 's2' },
        { op: 'add_node', ref: 's4', type: 'decision', text: '¿Resolución directa?', after: 's3' },
        { op: 'add_node', ref: 's5', type: 'hook', text: 'Enviar respuesta IA', after: 's4' },
        { op: 'add_node', ref: 's6', type: 'human', text: 'Escalar a especialista', after: 's4' },
        { op: 'add_node', ref: 's7', type: 'db', text: 'Guardar historial', after: 's5' },
        { op: 'add_node', ref: 's8', type: 'end', text: 'Caso cerrado', after: 's7' },
        ...(anchorId ? [{ op: 'add_edge', from: anchorId, to: 's1', label: '' }] : []),
        { op: 'add_edge', from: 's1', to: 's2', label: '' },
        { op: 'add_edge', from: 's2', to: 's3', label: '' },
        { op: 'add_edge', from: 's3', to: 's4', label: '' },
        { op: 'add_edge', from: 's4', to: 's5', label: 'Sí' },
        { op: 'add_edge', from: 's4', to: 's6', label: 'No' },
        { op: 'add_edge', from: 's5', to: 's7', label: '' },
        { op: 'add_edge', from: 's6', to: 's7', label: 'Resuelto' },
        { op: 'add_edge', from: 's7', to: 's8', label: '' }
      ];
      return {
        cleanReply:
          'He creado una arquitectura de **atención inteligente con IA y escalado humano**, convergiendo en registro en base de datos y cierre.',
        actions: { summary: 'Flujo de soporte e IA (8 nodos)', operations: ops }
      };
    }

    // Caso E: Pipeline de Datos / API / ETL / Automatización / Integración
    if (/\b(pipeline|etl|integracion|sincroniz|datos|automatiz|scraping|ingesta)\b/i.test(norm)) {
      const ops = [
        ...prefixOps,
        { op: 'add_node', ref: 'd1', type: 'start', text: 'Disparar pipeline', ...(anchorId ? { after: anchorId } : {}) },
        { op: 'add_node', ref: 'd2', type: 'api', text: 'Extraer desde API', after: 'd1' },
        { op: 'add_node', ref: 'd3', type: 'tryc', text: 'Validar esquema', after: 'd2' },
        { op: 'add_node', ref: 'd4', type: 'decision', text: '¿Payload íntegro?', after: 'd3' },
        { op: 'add_node', ref: 'd5', type: 'process', text: 'Transformar datos', after: 'd4' },
        { op: 'add_node', ref: 'd6', type: 'err', text: 'Registrar fallo', after: 'd4' },
        { op: 'add_node', ref: 'd7', type: 'db', text: 'Persistir en BD', after: 'd5' },
        { op: 'add_node', ref: 'd8', type: 'end', text: 'Sincronización lista', after: 'd7' },
        ...(anchorId ? [{ op: 'add_edge', from: anchorId, to: 'd1', label: '' }] : []),
        { op: 'add_edge', from: 'd1', to: 'd2', label: '' },
        { op: 'add_edge', from: 'd2', to: 'd3', label: '' },
        { op: 'add_edge', from: 'd3', to: 'd4', label: '' },
        { op: 'add_edge', from: 'd4', to: 'd5', label: 'Sí' },
        { op: 'add_edge', from: 'd4', to: 'd6', label: 'No' },
        { op: 'add_edge', from: 'd5', to: 'd7', label: '' },
        { op: 'add_edge', from: 'd7', to: 'd8', label: 'OK' }
      ];
      return {
        cleanReply:
          'He diseñado un **pipeline de extracción, validación y persistencia de datos** con manejo de errores y espaciado jerárquico compacto.',
        actions: { summary: 'Pipeline de datos e integración (8 nodos)', operations: ops }
      };
    }

    // Caso F: Despliegue / CI/CD / QA / Testing
    if (/\b(deploy|despliegue|ci\/cd|testing|pruebas|calidad|qa|servidor|produccion)\b/i.test(norm)) {
      const ops = [
        ...prefixOps,
        { op: 'add_node', ref: 'c1', type: 'start', text: 'Push a repositorio', ...(anchorId ? { after: anchorId } : {}) },
        { op: 'add_node', ref: 'c2', type: 'process', text: 'Build y pruebas', after: 'c1' },
        { op: 'add_node', ref: 'c3', type: 'decision', text: '¿Tests aprobados?', after: 'c2' },
        { op: 'add_node', ref: 'c4', type: 'api', text: 'Desplegar versión', after: 'c3' },
        { op: 'add_node', ref: 'c5', type: 'err', text: 'Cancelar y alertar', after: 'c3' },
        { op: 'add_node', ref: 'c6', type: 'hook', text: 'Verificar healthcheck', after: 'c4' },
        { op: 'add_node', ref: 'c7', type: 'end', text: 'Release activo', after: 'c6' },
        ...(anchorId ? [{ op: 'add_edge', from: anchorId, to: 'c1', label: '' }] : []),
        { op: 'add_edge', from: 'c1', to: 'c2', label: '' },
        { op: 'add_edge', from: 'c2', to: 'c3', label: '' },
        { op: 'add_edge', from: 'c3', to: 'c4', label: 'Sí' },
        { op: 'add_edge', from: 'c3', to: 'c5', label: 'No' },
        { op: 'add_edge', from: 'c4', to: 'c6', label: '' },
        { op: 'add_edge', from: 'c6', to: 'c7', label: 'OK' }
      ];
      return {
        cleanReply:
          'He generado un flujo de **integración y despliegue continuo (CI/CD)** con verificación automática de pruebas y healthcheck.',
        actions: { summary: 'Flujo CI/CD y despliegue (7 nodos)', operations: ops }
      };
    }

    // Caso F2: Planillas Financieras tipo Excel (Estado de Resultados, VAN/TIR o Crédito)
    if (/\b(planilla|estado de resultados|ebitda|van|tir|flujo de caja|amortizacion|prestamo|credito|financiera|financiero)\b/i.test(norm)) {
      if (/\b(van|tir|inversion|capex|cashflow|flujo de caja)\b/i.test(norm)) {
        const ops = [
          ...prefixOps,
          { op: 'add_node', ref: 'f1', type: 'fin_capex', text: 'Inversión Inicial', params: { cellRef: 'A1', value: 45000 } },
          { op: 'add_node', ref: 'f2', type: 'fin_rate', text: 'Tasa Descuento', params: { cellRef: 'A2', value: 12 } },
          { op: 'add_node', ref: 'f3', type: 'fin_fcf', text: 'Flujo Año 1', params: { cellRef: 'B1', value: 18500 } },
          { op: 'add_node', ref: 'f4', type: 'fin_fcf', text: 'Flujo Año 2', params: { cellRef: 'B2', value: 24000 } },
          { op: 'add_node', ref: 'f5', type: 'fin_fcf', text: 'Flujo Año 3', params: { cellRef: 'B3', value: 29500 } },
          { op: 'add_node', ref: 'f6', type: 'fin_npv', text: 'VAN Proyecto', params: { cellRef: 'C1', rate: 12 } },
          { op: 'add_node', ref: 'f7', type: 'fin_irr', text: 'TIR Estimada', params: { cellRef: 'C2' } },
          { op: 'add_edge', from: 'f1', to: 'f6', label: '-I0' },
          { op: 'add_edge', from: 'f3', to: 'f6', label: 't1' },
          { op: 'add_edge', from: 'f4', to: 'f6', label: 't2' },
          { op: 'add_edge', from: 'f5', to: 'f6', label: 't3' },
          { op: 'add_edge', from: 'f1', to: 'f7', label: '-I0' },
          { op: 'add_edge', from: 'f3', to: 'f7', label: 't1' },
          { op: 'add_edge', from: 'f4', to: 'f7', label: 't2' },
          { op: 'add_edge', from: 'f5', to: 'f7', label: 't3' }
        ];
        return {
          cleanReply:
            'He generado una **Planilla Financiera de Evaluación de Inversión (VAN y TIR)** con nodos conectados reactivamente y cálculo automático.',
          actions: { summary: 'Planilla VAN / TIR (7 celdas financieras)', operations: ops }
        };
      }

      const ops = [
        ...prefixOps,
        { op: 'add_node', ref: 'r1', type: 'fin_qty', text: 'Unidades Vendidas', params: { cellRef: 'A1', value: 1200 } },
        { op: 'add_node', ref: 'r2', type: 'fin_unit_price', text: 'Precio Unitario', params: { cellRef: 'A2', value: 85 } },
        { op: 'add_node', ref: 'r3', type: 'fin_revenue', text: 'Ingresos Brutos', params: { cellRef: 'B1', formula: '=A1*A2' } },
        { op: 'add_node', ref: 'r4', type: 'fin_cogs', text: 'Costo Directo', params: { cellRef: 'B2', value: 38000 } },
        { op: 'add_node', ref: 'r5', type: 'fin_gross_profit', text: 'Utilidad Bruta', params: { cellRef: 'C1' } },
        { op: 'add_node', ref: 'r6', type: 'fin_opex', text: 'Gastos Operativos', params: { cellRef: 'C2', value: 22500 } },
        { op: 'add_node', ref: 'r7', type: 'fin_ebitda', text: 'EBITDA Operativo', params: { cellRef: 'D1' } },
        { op: 'add_node', ref: 'r8', type: 'fin_net_margin', text: 'Margen EBITDA %', params: { cellRef: 'E1', formula: '=(D1/B1)*100' } },
        { op: 'add_node', ref: 'r9', type: 'fin_chart_pnl', text: 'Balance Ganancia vs Costos', params: { cellRef: 'F1' } },
        { op: 'add_edge', from: 'r1', to: 'r3', label: 'Q' },
        { op: 'add_edge', from: 'r2', to: 'r3', label: 'P' },
        { op: 'add_edge', from: 'r3', to: 'r5', label: '+' },
        { op: 'add_edge', from: 'r4', to: 'r5', label: '-' },
        { op: 'add_edge', from: 'r5', to: 'r7', label: '+' },
        { op: 'add_edge', from: 'r6', to: 'r7', label: '-' },
        { op: 'add_edge', from: 'r7', to: 'r8', label: 'fx' },
        { op: 'add_edge', from: 'r3', to: 'r8', label: 'base' },
        { op: 'add_edge', from: 'r3', to: 'r9', label: 'ingresos' },
        { op: 'add_edge', from: 'r4', to: 'r9', label: 'costo' },
        { op: 'add_edge', from: 'r6', to: 'r9', label: 'opex' },
        { op: 'add_edge', from: 'r7', to: 'r9', label: 'neto' }
      ];
      return {
        cleanReply:
          'He generado una **Planilla Financiera de Estado de Resultados (P&L)** con fórmulas encadenadas (`=A1*A2`, Utilidad Bruta, EBITDA, Margen y Gráfica de Ganancia vs Costos).',
        actions: { summary: 'Planilla Estado de Resultados P&L + Gráfica (9 nodos)', operations: ops }
      };
    }

    // Caso G: Nodo único de gráfico conectado al final del flujo actual
    if (/\b(grafico|donut|gauge|funnel|embudo|barras)\b/i.test(norm)) {
      let mType = 'chart_bar';
      if (norm.includes('donut')) mType = 'chart_donut';
      else if (norm.includes('gauge')) mType = 'chart_gauge';
      else if (norm.includes('funnel') || norm.includes('embudo')) mType = 'chart_funnel';

      const outgoingIds = new Set((STATE.edges || []).map(e => e.from));
      const leafNode = (STATE.nodes || []).find(n => !outgoingIds.has(n.id) && n.type !== 'note');
      const lastNode = (selNode && selNode.id) || (leafNode && leafNode.id) || null;
      const ops = [
        { op: 'add_node', ref: 'm1', type: mType, text: 'Panel visual del flujo', ...(lastNode ? { after: lastNode } : {}) },
        ...(lastNode ? [{ op: 'add_edge', from: lastNode, to: 'm1', label: 'datos' }] : [])
      ];
      return {
        cleanReply: `He añadido un nodo visual **\`${CONFIG.NODE_TYPES[mType] || mType}\`** alineado justo debajo del nodo objetivo.`,
        actions: { summary: `Añadir ${CONFIG.NODE_TYPES[mType] || mType}`, operations: ops }
      };
    }

    // Caso H: Extraer pasos explícitos indicados por el usuario (con ":", flechas "->" o comas)
    let rawStepsList = [];
    if (rawPrompt.includes(':') || rawPrompt.includes('：')) {
      const afterColon = rawPrompt.split(/[:：]/).slice(1).join(':');
      rawStepsList = afterColon.split(/[,;→\n]+|\s*->\s*/).map(s => s.trim()).filter(Boolean);
    } else if (/->|→/.test(rawPrompt)) {
      rawStepsList = rawPrompt
        .replace(/^(por favor\s+)?(crea|crear|genera|haz|diseña|arma)\s+(un\s+)?(flujo|diagrama|proceso|secuencia)\s*(de|con)?\s*/i, '')
        .split(/→|->/)
        .map(s => s.trim())
        .filter(Boolean);
    }

    if (rawStepsList.length >= 2) {
      const ops = [...prefixOps];
      rawStepsList.forEach((stepText, idx) => {
        const ref = 's' + (idx + 1);
        const inferredType = inferStepNodeType(stepText, idx, rawStepsList.length, Boolean(anchorId));
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
          const prevWasDecision = inferStepNodeType(rawStepsList[idx - 1], idx - 1, rawStepsList.length, Boolean(anchorId)) === 'decision';
          ops.push({ op: 'add_edge', from: 's' + idx, to: ref, label: prevWasDecision ? 'Sí' : '' });
        }
      });
      return {
        cleanReply: `He estructurado y conectado tus **${rawStepsList.length} pasos** con tipos semánticos automáticos y espaciado compacto.`,
        actions: { summary: `Secuencia de ${rawStepsList.length} pasos`, operations: ops }
      };
    }

    // Caso I: Creación de un único nodo puntual ("agrega un nodo de base de datos...")
    const cleanedTopic =
      rawPrompt
        .replace(
          /^(por favor\s+)?(crea|crear|genera|generar|agrega|agregar|añade|añadir|anade|inserta|insertar|diseña|disena|construye|arma|haz|hacer)\s+(un|una|el|la)?\s*(nuevo\s+)?(flujo\s+de|flujo\s+para|diagrama\s+de|nodo\s+de|nodo|proceso\s+de)?\s*/i,
          ''
        )
        .trim() || 'Proceso principal';

    const inferredMainType = inferStepNodeType(cleanedTopic, 1, 3, true);

    if (/\b(un nodo|nuevo nodo|agrega nodo|añade nodo|anade nodo|inserta nodo)\b/i.test(norm)) {
      const outgoingIds = new Set((STATE.edges || []).map(e => e.from));
      const leafNode = (STATE.nodes || []).find(n => !outgoingIds.has(n.id) && n.type !== 'note');
      const parentId = (selNode && selNode.id) || (leafNode && leafNode.id) || null;
      const ops = [
        {
          op: 'add_node',
          ref: 'u1',
          type: inferredMainType,
          text: cleanedTopic.slice(0, 40),
          ...(parentId ? { after: parentId } : {})
        },
        ...(parentId ? [{ op: 'add_edge', from: parentId, to: 'u1', label: '' }] : [])
      ];
      return {
        cleanReply: `He creado el nodo **\`${cleanedTopic.slice(0, 40)}\`** (${CONFIG.NODE_TYPES[inferredMainType]}) conectado de forma compacta.`,
        actions: { summary: `Nodo "${cleanedTopic.slice(0, 28)}"`, operations: ops }
      };
    }

    // Caso J: Arquitectura estructurada completa de 6 nodos (con validación Sí / No) para cualquier proceso de FlowLab
    const titleShort = cleanedTopic.slice(0, 28);
    const ops = [
      ...prefixOps,
      { op: 'add_node', ref: 'g1', type: 'start', text: `Inicio: ${titleShort}`, ...(anchorId ? { after: anchorId } : {}) },
      { op: 'add_node', ref: 'g2', type: 'io', text: 'Recibir parámetros', after: 'g1' },
      { op: 'add_node', ref: 'g3', type: inferredMainType === 'start' || inferredMainType === 'end' ? 'process' : inferredMainType, text: `Procesar ${titleShort}`, after: 'g2' },
      { op: 'add_node', ref: 'g4', type: 'decision', text: '¿Validación correcta?', after: 'g3' },
      { op: 'add_node', ref: 'g5', type: 'err', text: 'Controlar incidencia', after: 'g4' },
      { op: 'add_node', ref: 'g6', type: 'end', text: 'Flujo completado', after: 'g4' },
      ...(anchorId ? [{ op: 'add_edge', from: anchorId, to: 'g1', label: '' }] : []),
      { op: 'add_edge', from: 'g1', to: 'g2', label: '' },
      { op: 'add_edge', from: 'g2', to: 'g3', label: '' },
      { op: 'add_edge', from: 'g3', to: 'g4', label: '' },
      { op: 'add_edge', from: 'g4', to: 'g6', label: 'Sí' },
      { op: 'add_edge', from: 'g4', to: 'g5', label: 'No' }
    ];

    return {
      cleanReply:
        `He diseñado una arquitectura compacta para **${cleanedTopic}** con inicio, entrada de datos, procesamiento, validación **Sí / No** y control de incidencias.`,
      actions: { summary: `Flujo: ${titleShort} (6 nodos)`, operations: ops }
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
  function extractBase64Parts(dataUrl) {
    const m = String(dataUrl || '').match(/^data:([^;]+);base64,([\s\S]+)$/);
    if (!m) return null;
    return { mimeType: m[1], base64: m[2] };
  }

  function buildConversationMessages(userText, attachmentsSnapshot = [], includeVisionBlocks = true) {
    const hasAtts = Array.isArray(attachmentsSnapshot) && attachmentsSnapshot.length > 0;
    const docsPromptText =
      hasAtts && typeof window.formatAttachmentsForPrompt === 'function'
        ? window.formatAttachmentsForPrompt(attachmentsSnapshot)
        : '';

    const sysPrompt = buildSystemPrompt(docsPromptText);
    const recentHistory = messages
      .filter(m => (m.role === 'user' || m.role === 'assistant') && !m.isError)
      .slice(-10)
      .map(m => ({
        role: m.role,
        content: m.rawModelText || m.content
      }));

    const imageAtts = includeVisionBlocks
      ? (attachmentsSnapshot || []).filter(a => a && a.isImage && a.visionDataUrl)
      : [];

    const enrichedUserText = docsPromptText
      ? `${userText}\n\n[Contenido extraído de ${attachmentsSnapshot.length} archivo(s) adjunto(s) disponible en el contexto del sistema para construir tareas/nodos si corresponde]`
      : userText;

    let finalUserContent = enrichedUserText;
    if (imageAtts.length > 0) {
      finalUserContent = [
        { type: 'text', text: enrichedUserText },
        ...imageAtts.map(img => ({
          type: 'image_url',
          image_url: { url: img.visionDataUrl }
        }))
      ];
    }

    return [
      { role: 'system', content: sysPrompt },
      ...recentHistory,
      { role: 'user', content: finalUserContent }
    ];
  }

  function enrichExternalReplyActions(extracted, userText, attachmentsSnapshot = []) {
    if (!extracted) return extracted;
    const hasOps =
      extracted.actions &&
      Array.isArray(extracted.actions.operations) &&
      extracted.actions.operations.length > 0;
    if (hasOps) return extracted;

    const norm = normalizePlainSpanish(userText);

    // 1. Si el usuario pidió organizar nodos (ej. "ordenalo de forma vertical") y el modelo externo respondió en texto sin emitir JSON, inyectar la operación exacta
    if (
      typeof window.parseNaturalLayoutIntent === 'function' &&
      !/\b(crea|genera|agrega|anade|inserta)\b/i.test(norm)
    ) {
      const layoutIntent = window.parseNaturalLayoutIntent(userText);
      if (layoutIntent && layoutIntent.matched && (STATE.nodes || []).length > 0) {
        extracted.actions = {
          summary: `${layoutIntent.description || layoutIntent.label} (${STATE.nodes.length} nodos)`,
          operations: [
            {
              op: 'organize_canvas',
              mode: layoutIntent.mode || 'domain_bridge',
              density: layoutIntent.density || 'normal',
              columns: layoutIntent.columns,
              reverse: Boolean(layoutIntent.reverse),
              sortBy: layoutIntent.sortBy || 'topology',
              align: layoutIntent.align || 'center'
            }
          ]
        };
        return extracted;
      }
    }

    // 2. Si el usuario adjuntó documentos/imágenes pidiendo armar tareas/flujo/planilla y un modelo pequeño no emitió JSON, sintetizar las operaciones
    if (
      Array.isArray(attachmentsSnapshot) &&
      attachmentsSnapshot.length > 0 &&
      typeof window.synthesizeActionsFromDocuments === 'function' &&
      !/\b(solo resume|solo explica|no crees|sin crear nodos)\b/i.test(norm) &&
      /\b(tarea\w*|flujo\w*|nodo\w*|planilla\w*|finanz\w*|arma\w*|crea\w*|genera\w*|construy\w*|diagrama\w*|lienzo|canvas)\b/i.test(norm)
    ) {
      const synth = window.synthesizeActionsFromDocuments(attachmentsSnapshot, userText);
      if (synth && synth.actions) {
        extracted.actions = synth.actions;
      }
    }

    return extracted;
  }

  async function callExternalAI(userText, signal, attachmentsSnapshot = []) {
    const mode = aiConfig.mode;
    if (mode === 'builtin') {
      await new Promise(r => setTimeout(r, 240));
      return runBuiltinAssistant(userText, attachmentsSnapshot);
    }

    const hasVisionImages =
      Array.isArray(attachmentsSnapshot) &&
      attachmentsSnapshot.some(a => a && a.isImage && a.visionDataUrl);

    const runWithVisionFlag = async useVision => {
      const chatMsgs = buildConversationMessages(userText, attachmentsSnapshot, useVision);
      if (mode === 'local') {
        return await callLocalProvider(chatMsgs, signal);
      }
      if (mode === 'api') {
        return await callCloudProvider(chatMsgs, signal, attachmentsSnapshot);
      }
      if (mode === 'url') {
        return await callCustomUrlProvider(userText, chatMsgs, signal);
      }
      return runBuiltinAssistant(userText, attachmentsSnapshot);
    };

    try {
      const res = await runWithVisionFlag(hasVisionImages);
      return enrichExternalReplyActions(res, userText, attachmentsSnapshot);
    } catch (err) {
      // Si un modelo local/URL solo soporta texto y rechaza bloques image_url (HTTP 400/415/422), reintentar automáticamente con el texto/OCR extraído
      if (
        hasVisionImages &&
        err &&
        err.name !== 'AbortError' &&
        /400|415|422|image_url|multimodal|content.*string|vision/i.test(
          `${err.title || ''} ${err.details || ''} ${err.message || ''}`
        )
      ) {
        const fallbackRes = await runWithVisionFlag(false);
        return enrichExternalReplyActions(fallbackRes, userText, attachmentsSnapshot);
      }
      throw err;
    }
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
          const ollamaMsgs = chatMsgs.map(m => {
            if (!Array.isArray(m.content)) return m;
            const txtPart = m.content.find(c => c.type === 'text')?.text || '';
            const imgs = m.content
              .filter(c => c.type === 'image_url' && c.image_url?.url)
              .map(c => extractBase64Parts(c.image_url.url)?.base64)
              .filter(Boolean);
            return imgs.length ? { role: m.role, content: txtPart, images: imgs } : { role: m.role, content: txtPart };
          });
          return { model, messages: ollamaMsgs, stream: false };
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

  async function callCloudProvider(chatMsgs, signal, attachmentsSnapshot = []) {
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

    // Google Gemini REST API directa (con soporte multimodal inlineData)
    if (providerKey === 'gemini') {
      const sysMsg = chatMsgs.find(m => m.role === 'system')?.content || '';
      const contents = chatMsgs
        .filter(m => m.role !== 'system')
        .map(m => {
          if (Array.isArray(m.content)) {
            const parts = [];
            m.content.forEach(item => {
              if (item.type === 'text' && item.text) parts.push({ text: item.text });
              if (item.type === 'image_url' && item.image_url?.url) {
                const b64 = extractBase64Parts(item.image_url.url);
                if (b64) parts.push({ inlineData: { mimeType: b64.mimeType, data: b64.base64 } });
              }
            });
            return { role: m.role === 'assistant' ? 'model' : 'user', parts };
          }
          return {
            role: m.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: String(m.content || '') }]
          };
        });

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

    // Anthropic Claude Messages API (con soporte multimodal base64 image)
    if (providerKey === 'anthropic') {
      const sysMsg = chatMsgs.find(m => m.role === 'system')?.content || '';
      const userAssistantMsgs = chatMsgs
        .filter(m => m.role !== 'system')
        .map(m => {
          if (Array.isArray(m.content)) {
            const blocks = [];
            m.content.forEach(item => {
              if (item.type === 'image_url' && item.image_url?.url) {
                const b64 = extractBase64Parts(item.image_url.url);
                if (b64) {
                  blocks.push({
                    type: 'image',
                    source: { type: 'base64', media_type: b64.mimeType, data: b64.base64 }
                  });
                }
              } else if (item.type === 'text' && item.text) {
                blocks.push({ type: 'text', text: item.text });
              }
            });
            return { role: m.role, content: blocks };
          }
          return { role: m.role, content: m.content };
        });

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
          <div class="ai-welcome-badge">${AI_SVG.spark}<span>copiloto multimodal de flowlab</span></div>
          <h4>Lee documentos/imágenes, arma tareas y organiza nodos</h4>
          <p>Adjunta PDFs, Word, Excel, CSV o capturas para armar flujos o planillas <code>fx</code>, o pídeme ordenar tus nodos en vertical, horizontal, árbol, kanban, carriles, cuadrícula o anillos.</p>
          <div class="ai-quick-grid">
            <button type="button" class="ai-quick-btn" data-prompt="Ordénalo de forma vertical limpia sin cruces de flechas.">
              <span class="ai-quick-icon">${AI_SVG.layers}</span>
              <span>Ordenar en vertical</span>
            </button>
            <button type="button" class="ai-quick-btn" data-prompt="Organízalo separando flujo operativo y finanzas fx con conectores limpios.">
              <span class="ai-quick-icon">${AI_SVG.branch}</span>
              <span>Separar flujo ⇄ finanzas</span>
            </button>
            <button type="button" class="ai-quick-btn" data-prompt="Crea un flujo de gestión de tareas con recepción de documento, validación, ejecución y cierre.">
              <span class="ai-quick-icon">${AI_SVG.plusSquare}</span>
              <span>Crear flujo de tareas</span>
            </button>
            <button type="button" class="ai-quick-btn" data-prompt="¿De cuántas maneras puedes ordenar y distribuir los nodos en el lienzo?">
              <span class="ai-quick-icon">${AI_SVG.search}</span>
              <span>Ver modos de orden</span>
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
          const attPillsHtml =
            Array.isArray(msg.attachments) && msg.attachments.length > 0
              ? `<div class="ai-msg-attachments">${msg.attachments
                  .map(
                    a =>
                      `<span class="ai-msg-att-pill">${
                        a.previewThumb
                          ? `<img src="${escapeHTML(a.previewThumb)}" alt="">`
                          : AI_SVG.fileDoc
                      }<span>${escapeHTML(a.name)}</span></span>`
                  )
                  .join('')}</div>`
              : '';
          return `
            <div class="ai-msg ai-msg--user">
              <div class="ai-bubble ai-bubble--user">${attPillsHtml}${escapeHTML(msg.content).replace(/\n/g, '<br>')}</div>
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
      btn.addEventListener('click', async () => {
        if (liveBuildState.isAnimating) return;
        const m = messages[Number(btn.dataset.applyIdx)];
        if (!m || !m.actions) return;
        btn.disabled = true;
        try {
          const res = await applyAIGraphActionsLive(m.actions);
          m.applied = true;
          m.createdNodeIds =
            res.addedNodes.length > 0
              ? res.addedNodes.map(n => n.id)
              : (STATE.nodes || []).map(n => n.id);
          m.appliedSummary =
            res.organized && res.addedNodes.length === 0
              ? `${(STATE.nodes || []).length} nodo(s) compactados y alineados`
              : `${res.addedNodes.length} nodo(s) · ${res.addedEdges.length} conexión(es)` +
                (res.updatedCount ? ` · ${res.updatedCount} ajustado(s)` : '');
          updateAIChatContextUI();
          saveAIChatHistory(true);
          renderAIMessages(true);
        } finally {
          btn.disabled = false;
        }
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

  function renderPendingAttachmentsBar() {
    const bar = document.getElementById('aiAttachmentsBar');
    if (!bar) return;
    if (!pendingAttachments || pendingAttachments.length === 0) {
      bar.hidden = true;
      bar.innerHTML = '';
      return;
    }
    bar.hidden = false;
    bar.innerHTML = pendingAttachments
      .map(
        (att, idx) => `
          <div class="ai-att-chip" title="${escapeHTML(att.summarySnippet || att.name)}">
            ${
              att.isImage && att.previewUrl
                ? `<img class="ai-att-chip__thumb" src="${escapeHTML(att.previewUrl)}" alt="">`
                : `<span class="ai-att-chip__icon">${att.isImage ? AI_SVG.imageIcon : AI_SVG.fileDoc}</span>`
            }
            <div class="ai-att-chip__meta">
              <span class="ai-att-chip__name">${escapeHTML(att.name)}</span>
              <span class="ai-att-chip__sub">${escapeHTML(att.kind.toUpperCase())} · ${escapeHTML(att.sizeLabel)}</span>
            </div>
            <button type="button" class="ai-att-chip__rm" data-rm-att="${idx}" aria-label="Quitar archivo">×</button>
          </div>
        `
      )
      .join('');

    bar.querySelectorAll('[data-rm-att]').forEach(btn => {
      btn.addEventListener('click', () => {
        const i = Number(btn.dataset.rmAtt);
        if (!Number.isNaN(i)) {
          pendingAttachments.splice(i, 1);
          renderPendingAttachmentsBar();
        }
      });
    });
  }

  async function addFilesToPendingAttachments(fileList) {
    if (!fileList || fileList.length === 0) return [];
    if (typeof window.readAnyUserAttachment !== 'function') return [];

    const filesArr = Array.from(fileList).slice(0, 8);
    const added = [];
    for (const file of filesArr) {
      try {
        const parsed = await window.readAnyUserAttachment(file);
        pendingAttachments.push(parsed);
        added.push(parsed);
      } catch (err) {
        if (typeof showToast === 'function') {
          showToast(`No se pudo leer ${file.name}`, 'err', 2200);
        }
      }
    }
    renderPendingAttachmentsBar();
    if (added.length > 0 && typeof showToast === 'function') {
      showToast(
        `${added.length} archivo(s) leído(s): ${added.map(a => a.name).join(', ')}`,
        'ok',
        2200
      );
    }
    return added;
  }

  function renderLayoutPresetsDrawer() {
    const mount = document.getElementById('aiLayoutPresetsMount');
    if (!mount) return;
    const presets = Array.isArray(window.FLOWLAB_LAYOUT_PRESETS) ? window.FLOWLAB_LAYOUT_PRESETS : [];
    mount.innerHTML = presets
      .map(
        p => `
          <button type="button" class="ai-layout-item" data-layout-mode="${escapeHTML(p.id)}">
            <strong>${escapeHTML(p.label)}</strong>
            <small>${escapeHTML(p.desc)}</small>
          </button>
        `
      )
      .join('');

    mount.querySelectorAll('[data-layout-mode]').forEach(btn => {
      btn.addEventListener('click', async () => {
        const mode = btn.dataset.layoutMode;
        const drawer = document.getElementById('aiLayoutDrawer');
        if (drawer) drawer.hidden = true;
        if (!liveBuildState.isAnimating) {
          await autoOrganizeCanvasLive(false, null, { mode });
        }
      });
    });
  }

  function toggleLayoutPresetsDrawer(forceState) {
    const drawer = document.getElementById('aiLayoutDrawer');
    if (!drawer) return;
    const next = typeof forceState === 'boolean' ? forceState : drawer.hidden;
    if (next) {
      renderLayoutPresetsDrawer();
      drawer.hidden = false;
    } else {
      drawer.hidden = true;
    }
  }

  async function sendAIChatMessage(rawInput) {
    let text = String(rawInput || '').trim();
    const attachmentsSnapshot = pendingAttachments.slice();

    if ((!text && attachmentsSnapshot.length === 0) || isGenerating) return;
    if (!text && attachmentsSnapshot.length > 0) {
      text =
        'Lee los archivos adjuntos, resume sus puntos clave y construye en el lienzo las tareas o modelo correspondiente.';
    }

    const inputEl = document.getElementById('aiChatInput');
    if (inputEl) {
      inputEl.value = '';
    }
    pendingAttachments = [];
    renderPendingAttachmentsBar();

    // Cerrar selectores si estaban desplegados para ver el proceso en vivo
    toggleSessionsDrawer(false);
    toggleLayoutPresetsDrawer(false);

    const priorSnapshot = messages.slice();
    const compactAttMeta = attachmentsSnapshot.map(a => ({
      name: a.name,
      kind: a.kind,
      sizeLabel: a.sizeLabel,
      previewThumb: a.isImage && a.previewUrl && a.previewUrl.length < 48000 ? a.previewUrl : ''
    }));

    messages.push({
      role: 'user',
      content: text,
      attachments: compactAttMeta.length > 0 ? compactAttMeta : undefined,
      timestamp: Date.now()
    });
    saveAIChatHistory(true);

    const startedAt = Date.now();
    const domainCheck = evaluateFlowLabDomainGuard(text, priorSnapshot, attachmentsSnapshot.length > 0);
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
    let completedVisualBuild = false;

    try {
      // Iniciar escaneo visual en vivo sobre el lienzo mientras la IA inspecciona el contexto
      startCanvasThinkingScan(
        (telemetry.steps[0] && telemetry.steps[0].title) || 'Inspeccionando contexto del flujo...'
      );

      // Recorrer en vivo las fases de inspección de fuentes antes de emitir la síntesis final
      const totalPreSteps = Math.max(0, telemetry.steps.length - 1);
      for (let i = 0; i < totalPreSteps; i++) {
        liveTraceState.activeStepIndex = i;
        if (telemetry.steps[i]) {
          setBuildHudState({
            mode: 'analyzing',
            phase: 'ia :: analizando contexto',
            step: telemetry.steps[i].title,
            current: i + 1,
            total: Math.max(2, telemetry.steps.length),
            showSkip: false
          });
        }
        updateLiveThinkingDOM();
        await waitAbortableStep(stepDelay, currentAbort.signal);
      }
      liveTraceState.activeStepIndex = Math.max(0, telemetry.steps.length - 1);
      const lastThinkStep = telemetry.steps[liveTraceState.activeStepIndex];
      if (lastThinkStep) {
        setBuildHudState({
          mode: 'analyzing',
          phase: 'ia :: razonando solución',
          step: lastThinkStep.title,
          current: telemetry.steps.length,
          total: Math.max(2, telemetry.steps.length + 1),
          showSkip: false
        });
      }
      updateLiveThinkingDOM();

      // Si la consulta es ajena a FlowLab, filtrarla sin consumir API externa ni salir del dominio
      if (!domainCheck.allowed) {
        stopCanvasThinkingScan(true);
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

      if (
        attachmentsSnapshot.length === 0 &&
        isOrganizeCanvasIntent(text) &&
        !/\b(crea|genera|agrega|anade|inserta)\b/i.test(normalizePlainSpanish(text))
      ) {
        stopCanvasThinkingScan(false);
        await waitAbortableStep(stepDelay, currentAbort.signal);
        const orgCount = (STATE.nodes || []).length;
        const parsedLayout =
          typeof window.parseNaturalLayoutIntent === 'function'
            ? window.parseNaturalLayoutIntent(text)
            : { mode: 'domain_bridge', density: 'normal', label: 'Puente Flujo ⇄ Finanzas', description: 'Puente Flujo ⇄ Finanzas' };
        const orgStart = Date.now();
        const appliedMeta = await autoOrganizeCanvasLive(true, currentAbort.signal, parsedLayout);
        completedVisualBuild = true;
        const orgElapsed = Math.max(32, Date.now() - orgStart);
        const totalDuration = Math.max(95, Date.now() - startedAt);
        const descLabel = (appliedMeta && appliedMeta.description) || parsedLayout.description || parsedLayout.label || 'Jerárquico';
        messages.push({
          role: 'assistant',
          content:
            `Listo: he organizado en vivo los **${orgCount} nodos** aplicando la disposición **${descLabel}**, con enrutamiento ortogonal inteligente y separación limpia de flechas.\n\n` +
            `También puedes pedirme: *«en horizontal»*, *«en árbol»*, *«carriles por tipo»*, *«modo kanban»*, *«cuadrícula de 4 columnas»*, *«en anillos radiales»* o *«separa flujo y finanzas»*.`,
          actions: {
            summary: `${descLabel} (${orgCount} nodos)`,
            operations: [
              {
                op: 'organize_canvas',
                mode: parsedLayout.mode || 'domain_bridge',
                density: parsedLayout.density || 'normal',
                columns: parsedLayout.columns,
                reverse: Boolean(parsedLayout.reverse),
                sortBy: parsedLayout.sortBy || 'topology',
                align: parsedLayout.align || 'center'
              }
            ]
          },
          applied: true,
          appliedSummary: `${orgCount} nodo(s) · ${descLabel}`,
          createdNodeIds: (STATE.nodes || []).map(n => n.id),
          isOffTopic: false,
          providerTag: provSummary.text,
          traceExpanded: false,
          trace: {
            durationMs: totalDuration,
            domainStatus: 'flowlab',
            sources: telemetry.sources,
            steps: [
              ...telemetry.steps,
              {
                title: `Disposición "${descLabel}" ejecutada en vivo`,
                detail: `${orgCount} nodos alineados sin superposiciones y conectores ortogonales optimizados.`,
                ms: orgElapsed
              }
            ]
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
      const result = await callExternalAI(text, currentAbort.signal, attachmentsSnapshot);
      const llmElapsed = Math.max(60, Date.now() - llmStart);
      stopCanvasThinkingScan(false);

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

      let appliedResult = null;
      if (
        result.actions &&
        Array.isArray(result.actions.operations) &&
        result.actions.operations.length > 0 &&
        aiConfig.autoApply
      ) {
        const liveStepIdx = liveTraceState.steps.length;
        liveTraceState.steps.push({
          title: 'Construyendo y conectando en vivo sobre el lienzo',
          detail: 'Preparando boceto jerárquico...',
          ms: 0
        });
        liveTraceState.activeStepIndex = liveStepIdx;
        updateLiveThinkingDOM();

        const buildStart = Date.now();
        appliedResult = await applyAIGraphActionsLive(result.actions, {
          signal: currentAbort.signal,
          onProgressStep: ev => {
            if (liveTraceState && liveTraceState.steps[liveStepIdx]) {
              liveTraceState.steps[liveStepIdx].detail = `Paso ${ev.index}/${ev.total} · ${ev.label}`;
              updateLiveThinkingDOM();
            }
          }
        });
        completedVisualBuild = true;
        const buildElapsed = Math.max(35, Date.now() - buildStart);

        finalSteps.push({
          title: 'Construcción progresiva completada sobre el lienzo',
          detail: `Ejecutados ${appliedResult.visualSteps.length} paso(s) visuales (${result.actions.summary || 'nodos, textos y conexiones trazados paso a paso'}).`,
          ms: buildElapsed
        });
      } else {
        hideAiWorldCursor();
        hideBuildHud(0);
        if (result.actions && Array.isArray(result.actions.operations) && result.actions.operations.length > 0) {
          finalSteps.push({
            title: 'Plan de construcción listo para aplicar en vivo',
            detail: `${result.actions.operations.length} operación(es) preparadas (${result.actions.summary || 'pulsa Aplicar al lienzo para ver cada paso'}).`,
            ms: 24
          });
        }
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

      if (appliedResult) {
        assistantMsg.applied = true;
        assistantMsg.createdNodeIds =
          appliedResult.addedNodes.length > 0
            ? appliedResult.addedNodes.map(n => n.id)
            : (STATE.nodes || []).map(n => n.id);
        assistantMsg.appliedSummary = appliedResult.organized && appliedResult.addedNodes.length === 0
          ? `${(STATE.nodes || []).length} nodo(s) compactados y alineados`
          : `${appliedResult.addedNodes.length} nodo(s) · ${appliedResult.addedEdges.length} conexión(es)` +
            (appliedResult.updatedCount ? ` · ${appliedResult.updatedCount} ajustado(s)` : '');
      }

      messages.push(assistantMsg);
      saveAIChatHistory(true);
    } catch (err) {
      stopCanvasThinkingScan(true);
      clearBlueprintSlots();
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
      stopCanvasThinkingScan(false);
      if (!completedVisualBuild) {
        hideAiWorldCursor();
        hideBuildHud(0);
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

    document.getElementById('btnAiOrganize')?.addEventListener('click', () => {
      toggleLayoutPresetsDrawer();
    });

    document.getElementById('btnCloseAiLayoutDrawer')?.addEventListener('click', () => {
      toggleLayoutPresetsDrawer(false);
    });

    document.getElementById('zAutoLayout')?.addEventListener('click', () => {
      if (!liveBuildState.isAnimating) autoOrganizeCanvasLive(false);
    });

    // Adjuntar imágenes y documentos (selector, arrastrar y soltar, Ctrl+V)
    const attachInputEl = document.getElementById('aiAttachInput');
    document.getElementById('btnAiAttach')?.addEventListener('click', () => {
      attachInputEl?.click();
    });
    attachInputEl?.addEventListener('change', async e => {
      if (e.target.files && e.target.files.length > 0) {
        await addFilesToPendingAttachments(e.target.files);
        e.target.value = '';
      }
    });

    const composerDropEl = document.getElementById('aiComposerDropzone');
    if (composerDropEl) {
      composerDropEl.addEventListener('dragover', e => {
        e.preventDefault();
        composerDropEl.classList.add('is-dragover');
      });
      composerDropEl.addEventListener('dragleave', () => {
        composerDropEl.classList.remove('is-dragover');
      });
      composerDropEl.addEventListener('drop', async e => {
        e.preventDefault();
        composerDropEl.classList.remove('is-dragover');
        if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
          await addFilesToPendingAttachments(e.dataTransfer.files);
        }
      });
    }

    document.getElementById('btnAiSkipAnim')?.addEventListener('click', () => {
      requestSkipLiveAnimation();
    });

    // Si había un diagrama guardado previamente con nodos dispersos a miles de píxeles, repararlo automáticamente al arrancar
    if (STATE.nodes && STATE.nodes.length >= 2 && isCanvasAbnormallyScattered(STATE.nodes)) {
      if (typeof requestAnimationFrame === 'function') {
        requestAnimationFrame(() => autoOrganizeCanvas(true));
      } else {
        autoOrganizeCanvas(true);
      }
    }

    document.getElementById('btnAiAutoApply')?.addEventListener('click', () => {
      aiConfig.autoApply = !aiConfig.autoApply;
      saveAIConfig();
      updateAIChatContextUI();
    });

    document.getElementById('btnAiSend')?.addEventListener('click', () => {
      const inputEl = document.getElementById('aiChatInput');
      sendAIChatMessage(inputEl ? inputEl.value : '');
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
      inputEl.addEventListener('paste', async e => {
        const items = e.clipboardData && e.clipboardData.items;
        if (!items) return;
        const pastedFiles = [];
        for (let i = 0; i < items.length; i++) {
          if (items[i].kind === 'file') {
            const f = items[i].getAsFile();
            if (f) pastedFiles.push(f);
          }
        }
        if (pastedFiles.length > 0) {
          e.preventDefault();
          await addFilesToPendingAttachments(pastedFiles);
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
    stopCanvasThinkingScan(true);
    clearBlueprintSlots();
    liveBuildState.skipRequested = false;
    liveBuildState.isAnimating = false;
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
  window.autoOrganizeCanvas = autoOrganizeCanvas;
  window.autoOrganizeCanvasLive = autoOrganizeCanvasLive;
  window.applyAIGraphActions = applyAIGraphActions;
  window.applyAIGraphActionsLive = applyAIGraphActionsLive;
  window.requestSkipLiveAnimation = requestSkipLiveAnimation;
  window.addFilesToPendingAttachments = addFilesToPendingAttachments;
  window.getLastAIVisualSteps = () => liveBuildState.lastStepLog.slice();
})();
