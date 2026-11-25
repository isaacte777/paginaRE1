// USER WORKSPACE: Gestión de sesión/perfiles locales y espacios de trabajo independientes por usuario

(function () {
  const USERS_REGISTRY_KEY = 'flowlab-users-v1';
  const ACTIVE_USER_KEY = 'flowlab-active-user-v1';
  const LEGACY_CANVAS_KEY = 'flowlab-paginaRE-v3';
  const LEGACY_PROJECTS_KEY = 'flowlab-saved-projects-v1';
  const LEGACY_AI_CFG_KEY = 'flowlab-ai-config-v1';
  const DEFAULT_GUEST_ID = 'local';

  let pendingDeleteUserId = null;
  let authModalMode = 'login'; // 'login' | 'register' | 'edit'
  let selectedLoginUserId = null;
  let regSelectedAccent = 'green';
  let regInitCanvasMode = 'blank'; // 'blank' | 'copy'

  function escapeUwHtml(str) {
    return String(str ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function hashLocalPin(rawPin) {
    const clean = String(rawPin || '').trim();
    if (!clean) return '';
    let h = 2166136261;
    for (let i = 0; i < clean.length; i++) {
      h ^= clean.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return 'fnv1a_' + (h >>> 0).toString(16);
  }

  function computeInitials(name) {
    const parts = String(name || '')
      .trim()
      .replace(/^@+/, '')
      .split(/[\s._-]+/)
      .filter(Boolean);
    if (!parts.length) return 'FL';
    if (parts.length === 1) {
      return parts[0].slice(0, 2).toUpperCase();
    }
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }

  function slugifyUserId(rawName, existingIds) {
    const base =
      String(rawName || '')
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '_')
        .replace(/^_+|_+$/g, '')
        .slice(0, 24) || 'usuario';

    const reserved = new Set(existingIds || []);
    if (!reserved.has(base) && base !== DEFAULT_GUEST_ID) return base;
    let counter = 2;
    while (reserved.has(`${base}_${counter}`) || `${base}_${counter}` === DEFAULT_GUEST_ID) {
      counter++;
    }
    return `${base}_${counter}`;
  }

  function buildGuestProfile() {
    const now = Date.now();
    return {
      id: DEFAULT_GUEST_ID,
      name: 'Invitado',
      workspaceLabel: 'espacio_local',
      accent: 'green',
      pinHash: '',
      isGuest: true,
      createdAt: now,
      lastActiveAt: now
    };
  }

  function getUsersList() {
    try {
      const raw = localStorage.getItem(USERS_REGISTRY_KEY);
      if (!raw) return [buildGuestProfile()];
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed) || !parsed.length) return [buildGuestProfile()];
      const valid = parsed.filter(u => u && typeof u === 'object' && u.id && u.name);
      if (!valid.some(u => u.id === DEFAULT_GUEST_ID)) {
        valid.push(buildGuestProfile());
      }
      return valid;
    } catch {
      return [buildGuestProfile()];
    }
  }

  function saveUsersList(users) {
    try {
      localStorage.setItem(USERS_REGISTRY_KEY, JSON.stringify(users));
      return true;
    } catch {
      return false;
    }
  }

  function getActiveUserId() {
    try {
      const savedId = localStorage.getItem(ACTIVE_USER_KEY);
      const users = getUsersList();
      if (savedId && users.some(u => u.id === savedId)) {
        return savedId;
      }
      return DEFAULT_GUEST_ID;
    } catch {
      return DEFAULT_GUEST_ID;
    }
  }

  function getActiveUser() {
    const id = getActiveUserId();
    const users = getUsersList();
    return users.find(u => u.id === id) || users[0] || buildGuestProfile();
  }

  function buildScopedKey(userId, resource) {
    const safeUid = String(userId || DEFAULT_GUEST_ID).trim() || DEFAULT_GUEST_ID;
    return `flowlab-user-${safeUid}-${resource}`;
  }

  function getUserStorageKey(resource) {
    return buildScopedKey(getActiveUserId(), resource);
  }

  function bootstrapUserWorkspaces() {
    try {
      const existingRaw = localStorage.getItem(USERS_REGISTRY_KEY);
      if (!existingRaw) {
        const guest = buildGuestProfile();
        saveUsersList([guest]);
        localStorage.setItem(ACTIVE_USER_KEY, guest.id);

        // Migrar datos previos existentes al espacio local inicial sin pérdida
        const legacyCanvas = localStorage.getItem(LEGACY_CANVAS_KEY);
        if (legacyCanvas && !localStorage.getItem(buildScopedKey(DEFAULT_GUEST_ID, 'canvas'))) {
          localStorage.setItem(buildScopedKey(DEFAULT_GUEST_ID, 'canvas'), legacyCanvas);
        }
        const legacyProjects = localStorage.getItem(LEGACY_PROJECTS_KEY);
        if (legacyProjects && !localStorage.getItem(buildScopedKey(DEFAULT_GUEST_ID, 'projects'))) {
          localStorage.setItem(buildScopedKey(DEFAULT_GUEST_ID, 'projects'), legacyProjects);
        }
        const legacyAi = localStorage.getItem(LEGACY_AI_CFG_KEY);
        if (legacyAi && !localStorage.getItem(buildScopedKey(DEFAULT_GUEST_ID, 'ai-config'))) {
          localStorage.setItem(buildScopedKey(DEFAULT_GUEST_ID, 'ai-config'), legacyAi);
        }
      } else {
        const users = getUsersList();
        saveUsersList(users);
        const currentId = getActiveUserId();
        localStorage.setItem(ACTIVE_USER_KEY, currentId);
      }
    } catch {}
  }

  function countUserSavedProjects(userId) {
    try {
      const raw = localStorage.getItem(buildScopedKey(userId, 'projects'));
      if (!raw) return 0;
      const arr = JSON.parse(raw);
      return Array.isArray(arr) ? arr.length : 0;
    } catch {
      return 0;
    }
  }

  function getUserAISummaryShort(userId) {
    try {
      const raw = localStorage.getItem(buildScopedKey(userId, 'ai-config'));
      if (!raw) return 'Integrada';
      const cfg = JSON.parse(raw);
      if (!cfg || cfg.mode === 'builtin') return 'Integrada';
      if (cfg.mode === 'local') return 'Local PC';
      if (cfg.mode === 'api') return (cfg.api?.provider || 'Cloud API').toUpperCase();
      if (cfg.mode === 'url') return 'URL remota';
      return 'Integrada';
    } catch {
      return 'Integrada';
    }
  }

  // =========================================================================
  // CAMBIO EN CALIENTE DE ESPACIO DE TRABAJO (AISLAMIENTO TOTAL)
  // =========================================================================
  function activateUserSession(targetUserId) {
    const users = getUsersList();
    const targetIdx = users.findIndex(u => u.id === targetUserId);
    if (targetIdx === -1) return false;

    const currentId = getActiveUserId();
    if (currentId !== targetUserId) {
      // Guardar el estado actual del usuario saliente en su propio espacio antes de cambiar
      if (typeof saveState === 'function') {
        try { saveState(); } catch {}
      }
    }

    users[targetIdx].lastActiveAt = Date.now();
    saveUsersList(users);
    try {
      localStorage.setItem(ACTIVE_USER_KEY, targetUserId);
    } catch {}

    const targetUser = users[targetIdx];

    // Reiniciar estado transitorio en memoria y cargar el lienzo exclusivo de este usuario
    STATE.nodes = [];
    STATE.edges = [];
    STATE.pan = { x: 60, y: 80 };
    STATE.zoom = 1;
    STATE.sel = null;
    STATE.circuit = null;
    STATE.blocked = new Set();
    STATE.history = [];
    STATE.hPtr = -1;
    STATE.activeProjectId = null;
    STATE.isBlankCanvas = false;
    STATE.localSavedAt = 0;
    STATE.persistenceFingerprint = '';

    const hasCanvasSaved = Boolean(localStorage.getItem(buildScopedKey(targetUserId, 'canvas')));
    if (hasCanvasSaved && typeof loadState === 'function') {
      loadState();
    } else {
      // Espacio de trabajo recién estrenado: lienzo limpio dedicado al usuario
      STATE.isBlankCanvas = true;
      const defaultTitle = `${targetUser.workspaceLabel || targetUser.id}_flujo`
        .toLowerCase()
        .replace(/[^a-z0-9áéíóúñ_-]+/gi, '_');
      const pTitle = document.getElementById('projTitle');
      const pTitleMob = document.getElementById('projTitleMobile');
      if (pTitle) pTitle.value = defaultTitle;
      if (pTitleMob) pTitleMob.value = defaultTitle;
      if (typeof saveState === 'function') saveState();
    }

    document.getElementById('btnSnap')?.classList.toggle('on', STATE.snapOn !== false);
    const speedSel = document.getElementById('speedSel');
    if (speedSel) speedSel.value = String(STATE.speed || 1);

    if (typeof commitHistory === 'function') commitHistory();
    if (typeof markBaselineAsClean === 'function') markBaselineAsClean();
    if (typeof renderAll === 'function') renderAll();
    if (typeof updateMobileNodeBar === 'function') updateMobileNodeBar();

    requestAnimationFrame(() => {
      if (STATE.nodes.length > 0 && typeof fitView === 'function') {
        fitView();
      } else if (typeof applyTransform === 'function') {
        applyTransform();
      }
    });

    // Recargar biblioteca de proyectos y configuración IA de este usuario
    if (typeof refreshProjectsUI === 'function') refreshProjectsUI();
    if (typeof reloadAIAssistantForActiveUser === 'function') {
      reloadAIAssistantForActiveUser();
    }

    updateHeaderUserUI();
    renderUserWorkspacePopover();

    const stSave = document.getElementById('stSave');
    if (stSave) {
      stSave.textContent = targetUser.isGuest
        ? 'espacio: local'
        : `espacio: ${targetUser.name}`;
    }

    if (typeof log === 'function') {
      log('ok', `espacio de trabajo activo: ${targetUser.name} (${targetUser.workspaceLabel || targetUser.id})`);
    }

    return true;
  }

  function requestSwitchToUser(targetUserId, enteredPin = null) {
    const users = getUsersList();
    const target = users.find(u => u.id === targetUserId);
    if (!target) return false;

    if (target.id === getActiveUserId() && enteredPin === null) {
      toggleUserWorkspacePopover(false);
      return true;
    }

    if (target.pinHash) {
      if (enteredPin === null) {
        toggleUserWorkspacePopover(false);
        openUserAuthModal('login', target.id);
        return false;
      }
      if (hashLocalPin(enteredPin) !== target.pinHash) {
        showAuthModalError('Clave local incorrecta para este espacio de trabajo.');
        return false;
      }
    }

    activateUserSession(target.id);
    toggleUserWorkspacePopover(false);
    closeUserAuthModal();

    if (typeof showToast === 'function') {
      showToast(
        target.isGuest
          ? 'Sesión cambiada a Espacio Local (Invitado)'
          : `Sesión iniciada · Espacio de ${target.name}`,
        'ok',
        2200
      );
    }
    return true;
  }

  function createUserWorkspace(params = {}) {
    const cleanName = String(params.name || '').trim();
    if (!cleanName) {
      showAuthModalError('Escribe un nombre o alias para identificar tu perfil.');
      return null;
    }

    const users = getUsersList();
    const duplicate = users.find(
      u => !u.isGuest && u.name.toLowerCase() === cleanName.toLowerCase()
    );
    if (duplicate) {
      showAuthModalError(`Ya existe el perfil "${duplicate.name}". Puedes acceder desde "iniciar_sesión".`);
      return null;
    }

    // Persistir primero el estado del usuario actual antes de crear el nuevo espacio
    if (typeof saveState === 'function') {
      try { saveState(); } catch {}
    }

    const currentCanvasRaw = localStorage.getItem(getUserStorageKey('canvas'));
    const newId = slugifyUserId(cleanName, users.map(u => u.id));
    const cleanWsLabel =
      String(params.workspaceLabel || '').trim() ||
      `espacio_${newId}`;
    const accent = params.accent === 'rose' ? 'rose' : 'green';
    const pinHash = hashLocalPin(params.pin || '');
    const now = Date.now();

    const newProfile = {
      id: newId,
      name: cleanName,
      workspaceLabel: cleanWsLabel,
      accent,
      pinHash,
      isGuest: false,
      createdAt: now,
      lastActiveAt: now
    };

    users.unshift(newProfile);
    if (!saveUsersList(users)) {
      showAuthModalError('No se pudo guardar el perfil en localStorage.');
      return null;
    }

    // Inicializar almacenamiento independiente del nuevo espacio de trabajo
    try {
      localStorage.setItem(buildScopedKey(newId, 'projects'), JSON.stringify([]));
      if (params.copyCurrentCanvas && currentCanvasRaw) {
        const parsed = JSON.parse(currentCanvasRaw);
        parsed.activeProjectId = null;
        if (!parsed.title) parsed.title = cleanWsLabel;
        localStorage.setItem(buildScopedKey(newId, 'canvas'), JSON.stringify(parsed));
      } else {
        const blankCanvas = {
          version: 1,
          nodes: [],
          edges: [],
          pan: { x: 60, y: 80 },
          zoom: 1,
          snapOn: true,
          speed: 1,
          title: cleanWsLabel,
          isBlankCanvas: true,
          activeProjectId: null,
          savedAt: now
        };
        localStorage.setItem(buildScopedKey(newId, 'canvas'), JSON.stringify(blankCanvas));
      }
    } catch {}

    activateUserSession(newId);
    closeUserAuthModal();
    toggleUserWorkspacePopover(false);

    if (typeof showToast === 'function') {
      showToast(`Espacio "${cleanWsLabel}" creado · Bienvenido, ${cleanName}`, 'ok', 2500);
    }
    return newProfile;
  }

  function updateActiveUserProfile(params = {}) {
    const active = getActiveUser();
    const cleanName = String(params.name || '').trim();
    if (!cleanName) {
      showAuthModalError('El nombre del perfil no puede estar vacío.');
      return false;
    }

    const users = getUsersList();
    const conflict = users.find(
      u => u.id !== active.id && !u.isGuest && u.name.toLowerCase() === cleanName.toLowerCase()
    );
    if (conflict) {
      showAuthModalError(`Otro perfil ya usa el nombre "${conflict.name}".`);
      return false;
    }

    const idx = users.findIndex(u => u.id === active.id);
    if (idx === -1) return false;

    users[idx].name = cleanName;
    users[idx].workspaceLabel =
      String(params.workspaceLabel || '').trim() || users[idx].workspaceLabel || 'espacio_personal';
    users[idx].accent = params.accent === 'rose' ? 'rose' : 'green';

    if (!users[idx].isGuest && typeof params.pin === 'string') {
      if (params.clearPin) {
        users[idx].pinHash = '';
      } else if (params.pin.trim() !== '') {
        users[idx].pinHash = hashLocalPin(params.pin);
      }
    }

    saveUsersList(users);
    updateHeaderUserUI();
    renderUserWorkspacePopover();
    closeUserAuthModal();

    if (typeof showToast === 'function') {
      showToast('Perfil y espacio actualizados', 'ok', 1800);
    }
    return true;
  }

  function deleteUserWorkspace(targetId) {
    if (!targetId || targetId === DEFAULT_GUEST_ID) return;
    const users = getUsersList();
    const target = users.find(u => u.id === targetId);
    if (!target || target.isGuest) return;

    const wasActive = getActiveUserId() === targetId;
    if (wasActive) {
      activateUserSession(DEFAULT_GUEST_ID);
    }

    const remaining = getUsersList().filter(u => u.id !== targetId);
    saveUsersList(remaining);

    // Limpiar claves asociadas al espacio eliminado
    ['projects', 'canvas', 'ai-config', 'ai-chat', 'ai-sessions', 'ai-active-session'].forEach(res => {
      try { localStorage.removeItem(buildScopedKey(targetId, res)); } catch {}
    });

    pendingDeleteUserId = null;
    renderUserWorkspacePopover();

    if (typeof showToast === 'function') {
      showToast(`Espacio "${target.name}" eliminado`, 'info', 2000);
    }
  }

  function signOutCurrentUser() {
    const active = getActiveUser();
    if (active.isGuest) {
      toggleUserWorkspacePopover(false);
      openUserAuthModal('login');
      return;
    }
    activateUserSession(DEFAULT_GUEST_ID);
    toggleUserWorkspacePopover(false);
    if (typeof showToast === 'function') {
      showToast(`Sesión de ${active.name} cerrada (proyectos conservados)`, 'info', 2300);
    }
  }

  // =========================================================================
  // INTERFAZ DE CABECERA Y MENÚ DESPLEGABLE DE PERFIL (#userWorkspacePopover)
  // =========================================================================
  function updateHeaderUserUI() {
    const active = getActiveUser();
    const btn = document.getElementById('btnUserWorkspace');
    const avatarEl = document.getElementById('uwHeaderAvatar');
    const nameEl = document.getElementById('uwHeaderName');
    if (!btn) return;

    const accent = active.accent === 'rose' ? 'rose' : 'green';
    btn.dataset.accent = accent;
    btn.dataset.guest = active.isGuest ? '1' : '0';

    if (avatarEl) {
      avatarEl.textContent = active.isGuest ? 'FL' : computeInitials(active.name);
    }
    if (nameEl) {
      nameEl.textContent = active.isGuest ? 'iniciar sesión' : active.name;
    }
  }

  function positionUserWorkspacePopover() {
    const pop = document.getElementById('userWorkspacePopover');
    const btn = document.getElementById('btnUserWorkspace');
    if (!pop || pop.hidden || !btn) return;

    if (window.matchMedia('(max-width: 768px)').matches) {
      pop.style.top = '';
      pop.style.left = '';
      return;
    }

    const vv = window.visualViewport;
    const vpWidth = vv ? vv.width : window.innerWidth;
    const vpHeight = vv ? vv.height : window.innerHeight;
    const rect = btn.getBoundingClientRect();

    const popW = Math.min(340, vpWidth - 16);
    pop.style.width = popW + 'px';

    let left = rect.right - popW;
    left = Math.min(Math.max(8, left), Math.max(8, vpWidth - popW - 8));
    const top = Math.min(vpHeight - 120, rect.bottom + 8);

    pop.style.left = Math.round(left) + 'px';
    pop.style.top = Math.round(top) + 'px';
  }

  function toggleUserWorkspacePopover(force) {
    const pop = document.getElementById('userWorkspacePopover');
    const btn = document.getElementById('btnUserWorkspace');
    if (!pop) return;

    const nextOpen = typeof force === 'boolean' ? force : pop.hidden;
    if (!nextOpen) {
      pop.hidden = true;
      btn?.classList.remove('is-open');
      btn?.setAttribute('aria-expanded', 'false');
      pendingDeleteUserId = null;
      return;
    }

    if (typeof closeActiveDropdown === 'function') closeActiveDropdown(true);
    if (typeof toggleProjectsPopover === 'function') toggleProjectsPopover(false);
    if (typeof toggleExportPopover === 'function') toggleExportPopover(false);
    if (typeof hideNodeContextMenu === 'function') hideNodeContextMenu();

    pendingDeleteUserId = null;
    renderUserWorkspacePopover();

    pop.hidden = false;
    btn?.classList.add('is-open');
    btn?.setAttribute('aria-expanded', 'true');
    positionUserWorkspacePopover();
  }

  function renderUserWorkspacePopover() {
    const activeCard = document.getElementById('uwActiveProfileCard');
    const listWrap = document.getElementById('uwAccountsList');
    const countBadge = document.getElementById('uwAccountsCount');
    if (!activeCard || !listWrap) return;

    const active = getActiveUser();
    const users = getUsersList();
    const projCount = countUserSavedProjects(active.id);
    const nodeCount = Array.isArray(STATE.nodes) ? STATE.nodes.length : 0;
    const aiShort = getUserAISummaryShort(active.id);
    const activeAccent = active.accent === 'rose' ? 'rose' : 'green';

    if (countBadge) {
      countBadge.textContent = `${users.length} ${users.length === 1 ? 'espacio' : 'espacios'}`;
    }

    activeCard.dataset.accent = activeAccent;
    activeCard.innerHTML =
      `<div class="uw-hero-top">` +
      `<div class="uw-hero-avatar" data-accent="${activeAccent}">${escapeUwHtml(active.isGuest ? 'FL' : computeInitials(active.name))}</div>` +
      `<div class="uw-hero-info">` +
      `<div class="uw-hero-name-row">` +
      `<strong class="uw-hero-name">${escapeUwHtml(active.name)}</strong>` +
      `<span class="uw-role-tag" data-accent="${activeAccent}">${active.isGuest ? 'local' : 'autenticado'}</span>` +
      `</div>` +
      `<span class="uw-hero-ws">:: ${escapeUwHtml(active.workspaceLabel || active.id)}</span>` +
      `</div>` +
      `</div>` +
      `<div class="uw-hero-stats">` +
      `<span><b>${projCount}</b> proy.</span>` +
      `<span class="uw-dot-sep">·</span>` +
      `<span><b>${nodeCount}</b> nodos</span>` +
      `<span class="uw-dot-sep">·</span>` +
      `<span>IA: <b>${escapeUwHtml(aiShort)}</b></span>` +
      `</div>` +
      `<div class="uw-hero-actions">` +
      (active.isGuest
        ? `<button type="button" class="btn primary uw-hero-btn" data-uw-action="open-login">` +
          `<svg width="11.5" height="11.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>` +
          `<span>Iniciar sesión / Crear perfil</span>` +
          `</button>`
        : `<button type="button" class="btn uw-hero-btn" data-uw-action="open-edit">` +
          `<svg width="11.5" height="11.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>` +
          `<span>Editar perfil</span>` +
          `</button>` +
          `<button type="button" class="btn uw-hero-btn" data-uw-action="sign-out">` +
          `<svg width="11.5" height="11.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>` +
          `<span>Salir</span>` +
          `</button>`) +
      `</div>`;

    // Ordenar mostrando primero el activo y luego por última actividad
    const sortedUsers = [...users].sort((a, b) => {
      if (a.id === active.id) return -1;
      if (b.id === active.id) return 1;
      return (Number(b.lastActiveAt) || 0) - (Number(a.lastActiveAt) || 0);
    });

    listWrap.innerHTML = sortedUsers
      .map(u => {
        const isCurrent = u.id === active.id;
        const uAccent = u.accent === 'rose' ? 'rose' : 'green';
        const uProjs = countUserSavedProjects(u.id);
        const initials = u.isGuest ? 'FL' : computeInitials(u.name);

        if (pendingDeleteUserId === u.id && !u.isGuest) {
          return (
            `<div class="uw-acc-item is-deleting">` +
            `<span class="uw-del-msg">¿Borrar espacio "${escapeUwHtml(u.name)}"?</span>` +
            `<div class="uw-acc-actions">` +
            `<button type="button" class="proj-act-btn is-danger" data-uw-action="confirm-delete" data-id="${escapeUwHtml(u.id)}">sí</button>` +
            `<button type="button" class="proj-act-btn" data-uw-action="cancel-delete" data-id="${escapeUwHtml(u.id)}">no</button>` +
            `</div>` +
            `</div>`
          );
        }

        return (
          `<div class="uw-acc-item${isCurrent ? ' is-active' : ''}" data-accent="${uAccent}">` +
          `<button type="button" class="uw-acc-switch" data-uw-action="switch-user" data-id="${escapeUwHtml(u.id)}">` +
          `<span class="uw-acc-avatar" data-accent="${uAccent}">${escapeUwHtml(initials)}</span>` +
          `<span class="uw-acc-meta">` +
          `<span class="uw-acc-name-row">` +
          `<span class="uw-acc-name">${escapeUwHtml(u.name)}</span>` +
          (u.pinHash
            ? '<svg class="uw-lock-svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" aria-label="Protegido con clave"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>'
            : '') +
          (isCurrent ? `<span class="uw-active-chip" data-accent="${uAccent}">activo</span>` : '') +
          `</span>` +
          `<span class="uw-acc-sub">${escapeUwHtml(u.workspaceLabel || u.id)} · ${uProjs} proy.</span>` +
          `</span>` +
          `</button>` +
          (!u.isGuest
            ? `<div class="uw-acc-actions">` +
              `<button type="button" class="proj-act-btn is-danger-hover" data-uw-action="ask-delete" data-id="${escapeUwHtml(u.id)}" title="Eliminar espacio de usuario" aria-label="Eliminar espacio">` +
              `<svg width="11.5" height="11.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>` +
              `</button>` +
              `</div>`
            : '') +
          `</div>`
        );
      })
      .join('');
  }

  // =========================================================================
  // MODAL DE INICIO DE SESIÓN / NUEVO ESPACIO / EDICIÓN (#userAuthModal)
  // =========================================================================
  function showAuthModalError(msg) {
    const errEl = document.getElementById('uwAuthError');
    if (!errEl) return;
    if (!msg) {
      errEl.hidden = true;
      errEl.textContent = '';
      return;
    }
    errEl.textContent = msg;
    errEl.hidden = false;
  }

  function updateRegisterPreviewCard() {
    const nameVal = (document.getElementById('uwRegName')?.value || '').trim();
    const wsVal = (document.getElementById('uwRegWorkspace')?.value || '').trim();
    const avatarEl = document.getElementById('uwPreviewAvatar');
    const titleEl = document.getElementById('uwPreviewName');
    const subEl = document.getElementById('uwPreviewSub');
    const cardEl = document.getElementById('uwPreviewCard');

    if (cardEl) cardEl.dataset.accent = regSelectedAccent;
    if (avatarEl) {
      avatarEl.dataset.accent = regSelectedAccent;
      avatarEl.textContent = computeInitials(nameVal || 'Usuario');
    }
    if (titleEl) {
      titleEl.textContent = nameVal || 'Tu Nombre';
    }
    if (subEl) {
      const slug = nameVal
        ? nameVal.toLowerCase().replace(/[^a-z0-9]+/gi, '_').replace(/^_+|_+$/g, '')
        : 'mi_espacio';
      subEl.textContent = `flowlab-user-${slug || 'id'}-projects · ${wsVal || 'espacio_' + (slug || 'personal')}`;
    }
  }

  function renderLoginAccountsPicker() {
    const picker = document.getElementById('uwLoginProfilesGrid');
    const pinWrap = document.getElementById('uwLoginPinWrap');
    const nameInput = document.getElementById('uwLoginName');
    if (!picker) return;

    const users = getUsersList().filter(u => !u.isGuest);
    if (!users.length) {
      picker.innerHTML =
        '<div class="uw-login-empty">Aún no hay cuentas registradas en este navegador. Escribe tu nombre abajo para iniciar tu propio espacio al instante o usa la pestaña "nuevo_espacio".</div>';
      if (pinWrap) pinWrap.hidden = true;
      return;
    }

    if (!selectedLoginUserId || !users.some(u => u.id === selectedLoginUserId)) {
      selectedLoginUserId = users[0].id;
    }

    const chosen = users.find(u => u.id === selectedLoginUserId) || users[0];
    if (nameInput && document.activeElement !== nameInput) {
      nameInput.value = chosen.name;
    }
    if (pinWrap) {
      pinWrap.hidden = !chosen.pinHash;
    }

    picker.innerHTML = users
      .map(u => {
        const isSel = u.id === chosen.id;
        const acc = u.accent === 'rose' ? 'rose' : 'green';
        const pCount = countUserSavedProjects(u.id);
        return (
          `<button type="button" class="uw-pick-card${isSel ? ' is-selected' : ''}" data-pick-user="${escapeUwHtml(u.id)}" data-accent="${acc}">` +
          `<span class="uw-acc-avatar" data-accent="${acc}">${escapeUwHtml(computeInitials(u.name))}</span>` +
          `<span class="uw-pick-info">` +
          `<span class="uw-pick-name">${escapeUwHtml(u.name)}</span>` +
          `<span class="uw-pick-sub">${escapeUwHtml(u.workspaceLabel || u.id)} · ${pCount} proy.</span>` +
          `</span>` +
          (u.pinHash
            ? '<svg class="uw-lock-svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" aria-hidden="true"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>'
            : '') +
          `</button>`
        );
      })
      .join('');
  }

  function openUserAuthModal(mode = 'login', preselectUserId = null) {
    if (typeof closeActiveDropdown === 'function') closeActiveDropdown(true);
    if (typeof toggleProjectsPopover === 'function') toggleProjectsPopover(false);
    if (typeof toggleExportPopover === 'function') toggleExportPopover(false);
    toggleUserWorkspacePopover(false);

    const modal = document.getElementById('userAuthModal');
    if (!modal) return;

    const registeredUsers = getUsersList().filter(u => !u.isGuest);
    if (mode === 'login' && !registeredUsers.length && !preselectUserId) {
      authModalMode = 'register';
    } else {
      authModalMode = mode;
    }

    selectedLoginUserId = preselectUserId;
    showAuthModalError('');

    const tabsBar = document.getElementById('uwAuthTabs');
    const loginPane = document.getElementById('uwAuthLoginPane');
    const regPane = document.getElementById('uwAuthRegisterPane');
    const titleEl = document.getElementById('uwAuthModalTitle');
    const initCanvasRow = document.getElementById('uwInitCanvasField');
    const clearPinWrap = document.getElementById('uwClearPinWrap');
    const submitRegBtn = document.getElementById('btnUwSubmitRegister');

    document.querySelectorAll('[data-uw-tab]').forEach(btn => {
      btn.classList.toggle('is-active', btn.dataset.uwTab === authModalMode);
    });

    if (authModalMode === 'edit') {
      const active = getActiveUser();
      if (tabsBar) tabsBar.hidden = true;
      if (loginPane) loginPane.hidden = true;
      if (regPane) regPane.hidden = false;
      if (titleEl) titleEl.textContent = 'editar_espacio_usuario';
      if (initCanvasRow) initCanvasRow.hidden = true;

      regSelectedAccent = active.accent === 'rose' ? 'rose' : 'green';
      const rName = document.getElementById('uwRegName');
      const rWs = document.getElementById('uwRegWorkspace');
      const rPin = document.getElementById('uwRegPin');
      const clearPinChk = document.getElementById('uwClearPinCheck');

      if (rName) rName.value = active.name;
      if (rWs) rWs.value = active.workspaceLabel || '';
      if (rPin) {
        rPin.value = '';
        rPin.placeholder = active.pinHash
          ? 'Dejar vacío para mantener clave actual'
          : 'Sin clave (1 clic para cambiar)';
      }
      if (clearPinWrap) clearPinWrap.hidden = !active.pinHash;
      if (clearPinChk) clearPinChk.checked = false;
      if (submitRegBtn) submitRegBtn.textContent = 'Guardar cambios';

      syncAccentButtonsUI();
      updateRegisterPreviewCard();
      modal.hidden = false;
      setTimeout(() => rName?.focus(), 30);
      return;
    }

    if (tabsBar) tabsBar.hidden = false;
    if (titleEl) titleEl.textContent = 'user_workspace';

    if (authModalMode === 'login') {
      if (loginPane) loginPane.hidden = false;
      if (regPane) regPane.hidden = true;
      const loginPin = document.getElementById('uwLoginPin');
      if (loginPin) loginPin.value = '';
      renderLoginAccountsPicker();
      modal.hidden = false;
      setTimeout(() => {
        const chosen = getUsersList().find(u => u.id === selectedLoginUserId);
        if (chosen && chosen.pinHash) {
          loginPin?.focus();
        } else {
          document.getElementById('uwLoginName')?.focus();
        }
      }, 30);
    } else {
      if (loginPane) loginPane.hidden = true;
      if (regPane) regPane.hidden = false;
      if (initCanvasRow) initCanvasRow.hidden = false;
      if (clearPinWrap) clearPinWrap.hidden = true;
      if (submitRegBtn) submitRegBtn.textContent = 'Crear y activar espacio';

      regSelectedAccent = 'green';
      regInitCanvasMode = 'blank';
      const rName = document.getElementById('uwRegName');
      const rWs = document.getElementById('uwRegWorkspace');
      const rPin = document.getElementById('uwRegPin');
      if (rName) rName.value = '';
      if (rWs) rWs.value = '';
      if (rPin) {
        rPin.value = '';
        rPin.placeholder = 'Opcional · dejar vacío para acceso directo';
      }

      syncAccentButtonsUI();
      syncInitCanvasButtonsUI();
      updateRegisterPreviewCard();
      modal.hidden = false;
      setTimeout(() => rName?.focus(), 30);
    }
  }

  function closeUserAuthModal() {
    const modal = document.getElementById('userAuthModal');
    if (modal) modal.hidden = true;
    showAuthModalError('');
  }

  function syncAccentButtonsUI() {
    document.querySelectorAll('[data-uw-accent-opt]').forEach(btn => {
      btn.classList.toggle('is-active', btn.dataset.uwAccentOpt === regSelectedAccent);
    });
  }

  function syncInitCanvasButtonsUI() {
    document.querySelectorAll('[data-uw-init-mode]').forEach(btn => {
      btn.classList.toggle('is-active', btn.dataset.uwInitMode === regInitCanvasMode);
    });
  }

  function handleLoginSubmit() {
    showAuthModalError('');
    const typedName = (document.getElementById('uwLoginName')?.value || '').trim();
    const typedPin = document.getElementById('uwLoginPin')?.value || '';

    const users = getUsersList();
    let match = null;
    if (typedName) {
      match = users.find(
        u =>
          u.name.toLowerCase() === typedName.toLowerCase() ||
          u.id.toLowerCase() === typedName.toLowerCase()
      );
    } else if (selectedLoginUserId) {
      match = users.find(u => u.id === selectedLoginUserId);
    }

    if (match) {
      requestSwitchToUser(match.id, match.pinHash ? typedPin : '');
      return;
    }

    if (!typedName) {
      showAuthModalError('Selecciona un perfil existente o escribe tu nombre de usuario.');
      return;
    }

    // Si el usuario escribió un nombre nuevo en Iniciar sesión, registra y abre su espacio directamente
    createUserWorkspace({
      name: typedName,
      workspaceLabel: `espacio_${typedName.toLowerCase().replace(/[^a-z0-9]+/gi, '_')}`,
      accent: 'green',
      pin: typedPin,
      copyCurrentCanvas: false
    });
  }

  function handleRegisterOrEditSubmit() {
    showAuthModalError('');
    const name = document.getElementById('uwRegName')?.value || '';
    const workspaceLabel = document.getElementById('uwRegWorkspace')?.value || '';
    const pin = document.getElementById('uwRegPin')?.value || '';
    const clearPin = Boolean(document.getElementById('uwClearPinCheck')?.checked);

    if (authModalMode === 'edit') {
      updateActiveUserProfile({
        name,
        workspaceLabel,
        accent: regSelectedAccent,
        pin,
        clearPin
      });
      return;
    }

    createUserWorkspace({
      name,
      workspaceLabel,
      accent: regSelectedAccent,
      pin,
      copyCurrentCanvas: regInitCanvasMode === 'copy'
    });
  }

  function bindAuthPasswordToggle(btnId, inputId) {
    const btn = document.getElementById(btnId);
    const inp = document.getElementById(inputId);
    if (!btn || !inp) return;
    btn.addEventListener('click', () => {
      const show = inp.type === 'password';
      inp.type = show ? 'text' : 'password';
      btn.classList.toggle('is-active', show);
    });
  }

  function initUserWorkspaceUI() {
    updateHeaderUserUI();

    document.getElementById('btnUserWorkspace')?.addEventListener('click', e => {
      e.stopPropagation();
      toggleUserWorkspacePopover();
    });

    document.getElementById('btnCloseUwPopover')?.addEventListener('click', () => {
      toggleUserWorkspacePopover(false);
    });

    document.getElementById('btnUwNewSpace')?.addEventListener('click', () => {
      openUserAuthModal('register');
    });

    document.getElementById('btnUwSwitchModal')?.addEventListener('click', () => {
      openUserAuthModal('login');
    });

    // Delegación de clics dentro de #userWorkspacePopover
    document.getElementById('userWorkspacePopover')?.addEventListener('click', e => {
      const actionBtn = e.target.closest('[data-uw-action]');
      if (!actionBtn) return;
      e.stopPropagation();

      const action = actionBtn.dataset.uwAction;
      const id = actionBtn.dataset.id;

      if (action === 'open-login') {
        openUserAuthModal('login');
      } else if (action === 'open-edit') {
        openUserAuthModal('edit');
      } else if (action === 'sign-out') {
        signOutCurrentUser();
      } else if (action === 'switch-user' && id) {
        requestSwitchToUser(id, null);
      } else if (action === 'ask-delete' && id) {
        pendingDeleteUserId = id;
        renderUserWorkspacePopover();
      } else if (action === 'confirm-delete' && id) {
        deleteUserWorkspace(id);
      } else if (action === 'cancel-delete') {
        pendingDeleteUserId = null;
        renderUserWorkspacePopover();
      }
    });

    // Pestañas del modal de autenticación
    document.querySelectorAll('[data-uw-tab]').forEach(tabBtn => {
      tabBtn.addEventListener('click', () => {
        openUserAuthModal(tabBtn.dataset.uwTab);
      });
    });

    document.getElementById('uwLoginProfilesGrid')?.addEventListener('click', e => {
      const card = e.target.closest('[data-pick-user]');
      if (!card) return;
      selectedLoginUserId = card.dataset.pickUser;
      const chosen = getUsersList().find(u => u.id === selectedLoginUserId);
      const loginName = document.getElementById('uwLoginName');
      if (chosen && loginName) loginName.value = chosen.name;
      renderLoginAccountsPicker();

      // Si no tiene clave local, cambiar con 1 solo clic
      if (chosen && !chosen.pinHash) {
        requestSwitchToUser(chosen.id, '');
      } else {
        document.getElementById('uwLoginPin')?.focus();
      }
    });

    document.getElementById('uwLoginName')?.addEventListener('input', e => {
      const val = e.target.value.trim().toLowerCase();
      const match = getUsersList().find(
        u => !u.isGuest && (u.name.toLowerCase() === val || u.id.toLowerCase() === val)
      );
      const pinWrap = document.getElementById('uwLoginPinWrap');
      if (match) {
        selectedLoginUserId = match.id;
        if (pinWrap) pinWrap.hidden = !match.pinHash;
      } else if (pinWrap) {
        pinWrap.hidden = true;
      }
    });

    document.querySelectorAll('[data-uw-accent-opt]').forEach(btn => {
      btn.addEventListener('click', () => {
        regSelectedAccent = btn.dataset.uwAccentOpt === 'rose' ? 'rose' : 'green';
        syncAccentButtonsUI();
        updateRegisterPreviewCard();
      });
    });

    document.querySelectorAll('[data-uw-init-mode]').forEach(btn => {
      btn.addEventListener('click', () => {
        regInitCanvasMode = btn.dataset.uwInitMode === 'copy' ? 'copy' : 'blank';
        syncInitCanvasButtonsUI();
      });
    });

    ['uwRegName', 'uwRegWorkspace'].forEach(id => {
      document.getElementById(id)?.addEventListener('input', updateRegisterPreviewCard);
    });

    bindAuthPasswordToggle('btnToggleUwLoginPin', 'uwLoginPin');
    bindAuthPasswordToggle('btnToggleUwRegPin', 'uwRegPin');

    document.getElementById('btnUwSubmitLogin')?.addEventListener('click', handleLoginSubmit);
    document.getElementById('btnUwSubmitRegister')?.addEventListener('click', handleRegisterOrEditSubmit);
    document.getElementById('btnCloseUwAuthModal')?.addEventListener('click', closeUserAuthModal);
    document.getElementById('btnUwCancelLogin')?.addEventListener('click', closeUserAuthModal);
    document.getElementById('btnUwCancelRegister')?.addEventListener('click', closeUserAuthModal);

    ['uwLoginName', 'uwLoginPin'].forEach(id => {
      document.getElementById(id)?.addEventListener('keydown', e => {
        if (e.key === 'Enter') {
          e.preventDefault();
          handleLoginSubmit();
        } else if (e.key === 'Escape') {
          e.preventDefault();
          closeUserAuthModal();
        }
      });
    });

    ['uwRegName', 'uwRegWorkspace', 'uwRegPin'].forEach(id => {
      document.getElementById(id)?.addEventListener('keydown', e => {
        if (e.key === 'Enter') {
          e.preventDefault();
          handleRegisterOrEditSubmit();
        } else if (e.key === 'Escape') {
          e.preventDefault();
          closeUserAuthModal();
        }
      });
    });

    document.getElementById('userAuthModal')?.addEventListener('pointerdown', e => {
      if (e.target.id === 'userAuthModal') closeUserAuthModal();
    });

    document.addEventListener('pointerdown', e => {
      const pop = document.getElementById('userWorkspacePopover');
      if (pop && !pop.hidden) {
        const btn = document.getElementById('btnUserWorkspace');
        if (!pop.contains(e.target) && (!btn || !btn.contains(e.target))) {
          toggleUserWorkspacePopover(false);
        }
      }
    });

    window.addEventListener('resize', positionUserWorkspacePopover);
  }

  // Inicializar el registro de usuarios inmediatamente para que storage.js, projects.js y ai-assistant.js lean el espacio activo desde el inicio
  bootstrapUserWorkspaces();

  window.getActiveUserId = getActiveUserId;
  window.getActiveUser = getActiveUser;
  window.getUsersList = getUsersList;
  window.getUserStorageKey = getUserStorageKey;
  window.initUserWorkspaceUI = initUserWorkspaceUI;
  window.toggleUserWorkspacePopover = toggleUserWorkspacePopover;
  window.openUserAuthModal = openUserAuthModal;
  window.closeUserAuthModal = closeUserAuthModal;
  window.createUserWorkspace = createUserWorkspace;
  window.requestSwitchToUser = requestSwitchToUser;
  window.signOutCurrentUser = signOutCurrentUser;
  window.updateHeaderUserUI = updateHeaderUserUI;
})();
