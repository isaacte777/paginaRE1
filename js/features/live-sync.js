// LIVE SYNC: Sincronización ligera del diagrama entre dispositivos.
// El servidor conserva un único estado compartido; las vistas y la consola
// siguen siendo personales para que cada persona pueda navegar cómodamente.
const LIVE_SYNC = {
  endpoint: new URL('api/flow-state.php', window.location.href).toString(),
  // El equipo que ejecuta XAMPP publica el primer estado. Los visitantes no
  // pueden reemplazar accidentalmente un proyecto a\u00fan sin inicializar.
  isHost: ['localhost', '127.0.0.1', '::1'].includes(window.location.hostname)
    || window.location.hostname.endsWith('.e2b.app')
    || new URLSearchParams(window.location.search).has('host'),
  revision: 0,
  ready: false,
  applying: false,
  publishing: false,
  timer: null,
  pollTimer: null,
  lastFingerprint: '',
  status: null
};

function sharedProjectState() {
  return {
    nodes: STATE.nodes,
    edges: STATE.edges,
    title: document.getElementById('projTitle')?.value || '',
    isBlankCanvas: STATE.isBlankCanvas === true
  };
}

function sharedFingerprint(state = sharedProjectState()) {
  return JSON.stringify(state);
}

function setLiveSyncStatus(kind, text) {
  const status = LIVE_SYNC.status || document.getElementById('liveSyncStatus');
  LIVE_SYNC.status = status;
  if (!status) return;
  status.dataset.state = kind;
  status.textContent = text;
}

function applySharedProject(project) {
  const shared = project?.state;
  if (!shared || !Array.isArray(shared.nodes) || !Array.isArray(shared.edges)) return;

  const fingerprint = sharedFingerprint(shared);
  LIVE_SYNC.revision = Math.max(LIVE_SYNC.revision, Number(project.revision) || 0);
  if (fingerprint === LIVE_SYNC.lastFingerprint) return;

  LIVE_SYNC.applying = true;
  STATE.nodes = shared.nodes;
  STATE.edges = shared.edges;
  STATE.isBlankCanvas = shared.isBlankCanvas === true;

  const title = document.getElementById('projTitle');
  const mobileTitle = document.getElementById('projTitleMobile');
  if (title && typeof shared.title === 'string') title.value = shared.title;
  if (mobileTitle && typeof shared.title === 'string') mobileTitle.value = shared.title;

  STATE.history = [];
  STATE.hPtr = -1;
  commitHistory();
  renderAll();
  LIVE_SYNC.applying = false;
  LIVE_SYNC.lastFingerprint = fingerprint;
  setLiveSyncStatus('live', '● sincronizado');
}

async function fetchSharedProject() {
  try {
    const response = await fetch(LIVE_SYNC.endpoint, { cache: 'no-store' });
    if (!response.ok) throw new Error('Respuesta ' + response.status);
    const project = await response.json();

    if (LIVE_SYNC.ready && project.state && Number(project.revision) > LIVE_SYNC.revision) {
      clearTimeout(LIVE_SYNC.timer);
      LIVE_SYNC.timer = null;
      applySharedProject(project);
    }
    if (LIVE_SYNC.ready && project.state) setLiveSyncStatus('live', '● sincronizado');
    return project;
  } catch {
    setLiveSyncStatus('offline', '○ sin conexión compartida');
    return null;
  }
}

async function publishSharedProject() {
  LIVE_SYNC.timer = null;
  if (!LIVE_SYNC.ready || LIVE_SYNC.applying || LIVE_SYNC.publishing) return;

  const state = sharedProjectState();
  const fingerprint = sharedFingerprint(state);
  if (fingerprint === LIVE_SYNC.lastFingerprint) return;

  LIVE_SYNC.publishing = true;
  setLiveSyncStatus('syncing', '◌ sincronizando');
  try {
    const response = await fetch(LIVE_SYNC.endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ state })
    });
    if (!response.ok) throw new Error('Respuesta ' + response.status);
    const project = await response.json();
    LIVE_SYNC.revision = Number(project.revision) || LIVE_SYNC.revision;
    LIVE_SYNC.lastFingerprint = fingerprint;
    setLiveSyncStatus('live', '● sincronizado');
  } catch {
    setLiveSyncStatus('offline', '○ sin conexión compartida');
  } finally {
    LIVE_SYNC.publishing = false;
  }
}

function queueLiveSync() {
  if (!LIVE_SYNC.ready || LIVE_SYNC.applying) return;
  clearTimeout(LIVE_SYNC.timer);
  LIVE_SYNC.timer = setTimeout(publishSharedProject, 350);
}

function flushLiveSync() {
  clearTimeout(LIVE_SYNC.timer);
  LIVE_SYNC.timer = null;
  if (!LIVE_SYNC.ready || LIVE_SYNC.applying) return;

  const state = sharedProjectState();
  const fingerprint = sharedFingerprint(state);
  if (fingerprint === LIVE_SYNC.lastFingerprint) return;

  const body = JSON.stringify({ state });
  try {
    if (navigator.sendBeacon) {
      const sent = navigator.sendBeacon(
        LIVE_SYNC.endpoint,
        new Blob([body], { type: 'application/json' })
      );
      if (sent) {
        LIVE_SYNC.lastFingerprint = fingerprint;
        return;
      }
    }
    fetch(LIVE_SYNC.endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
      keepalive: true
    }).catch(() => {});
    LIVE_SYNC.lastFingerprint = fingerprint;
  } catch {
    // localStorage already contains the change; the next session retries it.
  }
}

function localProjectIsNewerThan(project) {
  if (!LIVE_SYNC.isHost || !project?.state) return false;
  const remoteTime = Date.parse(project.updatedAt || '') || 0;
  return Number(STATE.localSavedAt) > remoteTime
    && sharedFingerprint() !== sharedFingerprint(project.state);
}

async function initLiveSync() {
  LIVE_SYNC.status = document.getElementById('liveSyncStatus');
  if (window.location.hostname.endsWith('.github.io')) {
    setLiveSyncStatus('live', '● guardado local');
    return;
  }
  setLiveSyncStatus('syncing', '◌ conectando');

  const remoteProject = await fetchSharedProject();
  LIVE_SYNC.ready = true;

  if (remoteProject?.state) {
    if (localProjectIsNewerThan(remoteProject)) {
      LIVE_SYNC.revision = Number(remoteProject.revision) || 0;
      LIVE_SYNC.lastFingerprint = '';
      queueLiveSync();
    } else {
      applySharedProject(remoteProject);
    }
  } else if (LIVE_SYNC.isHost) {
    LIVE_SYNC.lastFingerprint = '';
    queueLiveSync();
  } else {
    setLiveSyncStatus('waiting', '◌ esperando al anfitrión');
  }

  LIVE_SYNC.pollTimer = window.setInterval(fetchSharedProject, 1200);
  window.addEventListener('pagehide', () => {
    if (typeof saveState === 'function') saveState();
    flushLiveSync();
    clearInterval(LIVE_SYNC.pollTimer);
  }, { once: true });
}
