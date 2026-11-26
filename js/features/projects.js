// PROJECTS: Gestión de proyectos locales (localStorage), guardado con nombre y nuevo lienzo en blanco

(function () {
  let pendingDeleteId = null;
  let renamingProjectId = null;
  let modalState = {
    mode: null, // 'save' | 'new-blank' | 'switch-project'
    targetProjectId: null
  };

  function deepClone(obj) {
    try {
      return JSON.parse(JSON.stringify(obj));
    } catch {
      return obj;
    }
  }

  function escapeProjHtml(str) {
    return String(str ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function getProjectTitleInputValue() {
    const el = document.getElementById('projTitle');
    return (el ? el.value : '').trim();
  }

  function setProjectTitleInputs(value) {
    const clean = String(value ?? '');
    const pTitle = document.getElementById('projTitle');
    const pTitleMob = document.getElementById('projTitleMobile');
    if (pTitle) pTitle.value = clean;
    if (pTitleMob) pTitleMob.value = clean;
  }

  function computeProjectContentFingerprint() {
    return JSON.stringify({
      nodes: (STATE.nodes || []).map(n => ({
        id: n.id,
        type: n.type,
        text: n.text,
        x: n.x,
        y: n.y,
        status: n.status,
        progress: n.progress,
        note: n.note,
        params: n.params
      })),
      edges: (STATE.edges || []).map(e => ({
        id: e.id,
        from: e.from,
        to: e.to,
        label: e.label,
        kind: e.kind
      }))
    });
  }

  function markBaselineAsClean() {
    STATE.savedBaselineFingerprint = computeProjectContentFingerprint();
  }

  function hasUnsavedCanvasChanges() {
    if (!STATE.nodes.length && !STATE.edges.length) return false;
    if (!STATE.savedBaselineFingerprint) return true;
    return computeProjectContentFingerprint() !== STATE.savedBaselineFingerprint;
  }

  function activeProjectsStorageKey() {
    return typeof getUserStorageKey === 'function'
      ? getUserStorageKey('projects')
      : CONFIG.PROJECTS_KEY;
  }

  function getSavedProjects() {
    try {
      const raw = localStorage.getItem(activeProjectsStorageKey());
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];
      return parsed
        .filter(item => item && typeof item === 'object' && item.id && item.data)
        .sort((a, b) => (Number(b.updatedAt) || 0) - (Number(a.updatedAt) || 0));
    } catch {
      return [];
    }
  }

  function persistSavedProjects(list) {
    try {
      localStorage.setItem(activeProjectsStorageKey(), JSON.stringify(list));
      updateSavedProjectsBadge(list.length);
      return true;
    } catch (e) {
      showToast('Espacio insuficiente en almacenamiento local', 'err');
      if (typeof log === 'function') log('err', 'Error al guardar en localStorage');
      return false;
    }
  }

  function updateSavedProjectsBadge(countOverride) {
    const count = typeof countOverride === 'number' ? countOverride : getSavedProjects().length;
    const badge = document.getElementById('savedProjectsCount');
    const btn = document.getElementById('btnSavedProjects');
    if (badge) {
      badge.textContent = String(count);
      badge.hidden = count === 0;
    }
    if (btn) {
      btn.classList.toggle('has-saved-projects', count > 0);
    }
  }

  function formatRelativeDate(ts) {
    const num = Number(ts) || 0;
    if (!num) return 'reciente';
    const diffSec = Math.max(0, Math.floor((Date.now() - num) / 1000));
    if (diffSec < 45) return 'ahora mismo';
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `hace ${diffMin} min`;
    const diffHours = Math.floor(diffMin / 60);
    if (diffHours < 24) return `hace ${diffHours} h`;
    const d = new Date(num);
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const hh = String(d.getHours()).padStart(2, '0');
    const mi = String(d.getMinutes()).padStart(2, '0');
    return `${dd}/${mm} ${hh}:${mi}`;
  }

  function buildProjectSnapshot(cleanName) {
    return {
      version: 1,
      title: cleanName,
      nodes: deepClone(STATE.nodes || []),
      edges: deepClone(STATE.edges || []),
      pan: deepClone(STATE.pan || { x: 60, y: 80 }),
      zoom: Number(STATE.zoom) || 1,
      snapOn: STATE.snapOn !== false,
      speed: Number(STATE.speed) || 1,
      isBlankCanvas: STATE.nodes.length === 0 && STATE.edges.length === 0
    };
  }

  function saveCurrentProjectToLocal(rawName, options = {}) {
    const { forceNew = false, silentToast = false } = options;
    const cleanName = String(rawName || getProjectTitleInputValue() || 'mi_proyecto').trim() || 'mi_proyecto';

    const list = getSavedProjects();
    const now = Date.now();
    const snapshot = buildProjectSnapshot(cleanName);

    let existingIdx = -1;
    if (!forceNew) {
      if (STATE.activeProjectId) {
        existingIdx = list.findIndex(
          p => p.id === STATE.activeProjectId && p.name.toLowerCase() === cleanName.toLowerCase()
        );
      }
      if (existingIdx === -1) {
        existingIdx = list.findIndex(p => p.name.toLowerCase() === cleanName.toLowerCase());
      }
    }

    let savedRecord = null;
    const isUpdate = existingIdx !== -1;

    if (isUpdate) {
      savedRecord = {
        ...list[existingIdx],
        name: cleanName,
        updatedAt: now,
        nodeCount: snapshot.nodes.length,
        edgeCount: snapshot.edges.length,
        data: snapshot
      };
      list.splice(existingIdx, 1, savedRecord);
    } else {
      savedRecord = {
        id: 'proj_' + (typeof uid === 'function' ? uid() : Math.random().toString(36).slice(2, 10)),
        name: cleanName,
        createdAt: now,
        updatedAt: now,
        nodeCount: snapshot.nodes.length,
        edgeCount: snapshot.edges.length,
        data: snapshot
      };
      list.unshift(savedRecord);
    }

    if (!persistSavedProjects(list)) return null;

    setProjectTitleInputs(cleanName);
    STATE.activeProjectId = savedRecord.id;
    markBaselineAsClean();
    if (typeof saveState === 'function') saveState();

    const stSave = document.getElementById('stSave');
    if (stSave) stSave.textContent = `guardado: ${cleanName}`;

    renderProjectsPopoverList();

    if (!silentToast && typeof showToast === 'function') {
      showToast(
        isUpdate
          ? `Proyecto "${cleanName}" actualizado`
          : `Proyecto "${cleanName}" guardado localmente`,
        'ok',
        2200
      );
    }
    if (typeof log === 'function') {
      log('ok', `${isUpdate ? 'proyecto actualizado' : 'proyecto guardado'}: ${cleanName}`);
    }

    return savedRecord;
  }

  function applyLoadedProjectRecord(record) {
    if (!record || !record.data) return;
    const snap = deepClone(record.data);

    const rawNodes = Array.isArray(snap.nodes) ? snap.nodes : [];
    const rawEdges = Array.isArray(snap.edges) ? snap.edges : [];
    const cleaned =
      typeof sanitizeDeprecatedChartNodes === 'function'
        ? sanitizeDeprecatedChartNodes(rawNodes, rawEdges)
        : { nodes: rawNodes, edges: rawEdges };

    STATE.nodes = cleaned.nodes;
    STATE.edges = cleaned.edges;
    STATE.pan = snap.pan && typeof snap.pan.x === 'number' ? snap.pan : { x: 60, y: 80 };
    STATE.zoom = Number(snap.zoom) || 1;
    STATE.snapOn = snap.snapOn !== false;
    STATE.speed = Number(snap.speed) || 1;
    const inferredDomain =
      snap.canvasDomain === 'finance' ||
      (typeof isFinanceNodeType === 'function' && STATE.nodes.some(n => isFinanceNodeType(n.type)))
        ? 'finance'
        : 'workflow';
    STATE.canvasDomain = inferredDomain;
    STATE.financeCurrency = typeof snap.financeCurrency === 'string' ? snap.financeCurrency : 'USD';
    STATE.isBlankCanvas = STATE.nodes.length === 0 && STATE.edges.length === 0;
    STATE.sel = null;
    STATE.circuit = null;
    STATE.blocked = new Set();
    STATE.history = [];
    STATE.hPtr = -1;
    STATE.activeProjectId = record.id;

    setProjectTitleInputs(record.name || snap.title || 'proyecto');
    document.getElementById('btnSnap')?.classList.toggle('on', STATE.snapOn);
    const speedSel = document.getElementById('speedSel');
    if (speedSel) speedSel.value = String(STATE.speed);
    if (typeof setWorkspaceDomain === 'function') {
      setWorkspaceDomain(inferredDomain, { silent: true });
    }

    if (typeof commitHistory === 'function') commitHistory();
    markBaselineAsClean();
    if (typeof renderAll === 'function') renderAll();
    if (typeof updateMobileNodeBar === 'function') updateMobileNodeBar();

    requestAnimationFrame(() => {
      if (STATE.nodes.length > 0 && typeof fitView === 'function') {
        fitView();
      } else if (typeof applyTransform === 'function') {
        applyTransform();
        if (typeof saveState === 'function') saveState();
      }
    });

    const stSave = document.getElementById('stSave');
    if (stSave) stSave.textContent = `proyecto: ${record.name}`;

    toggleProjectsPopover(false);
    if (typeof showToast === 'function') {
      showToast(`Proyecto "${record.name}" abierto`, 'ok', 2000);
    }
    if (typeof log === 'function') {
      log('ok', `proyecto cargado: ${record.name} (${STATE.nodes.length} nodos)`);
    }
  }

  function loadSavedProjectById(projectId, options = {}) {
    const { skipUnsavedCheck = false } = options;
    const list = getSavedProjects();
    const record = list.find(p => p.id === projectId);
    if (!record) {
      if (typeof showToast === 'function') showToast('No se encontró el proyecto seleccionado', 'warn');
      renderProjectsPopoverList();
      return;
    }

    if (!skipUnsavedCheck && hasUnsavedCanvasChanges()) {
      toggleProjectsPopover(false);
      openSwitchProjectModal(record);
      return;
    }

    applyLoadedProjectRecord(record);
  }

  function deleteSavedProjectById(projectId) {
    const list = getSavedProjects();
    const target = list.find(p => p.id === projectId);
    if (!target) return;

    const filtered = list.filter(p => p.id !== projectId);
    persistSavedProjects(filtered);

    if (STATE.activeProjectId === projectId) {
      STATE.activeProjectId = null;
      if (typeof saveState === 'function') saveState();
    }

    pendingDeleteId = null;
    renderProjectsPopoverList();

    if (typeof showToast === 'function') {
      showToast(`Proyecto "${target.name}" eliminado`, 'info', 1800);
    }
    if (typeof log === 'function') {
      log('warn', `proyecto eliminado de almacenamiento local: ${target.name}`);
    }
  }

  function renameSavedProjectById(projectId, newRawName) {
    const clean = String(newRawName || '').trim();
    if (!clean) return;
    const list = getSavedProjects();
    const idx = list.findIndex(p => p.id === projectId);
    if (idx === -1) return;

    list[idx].name = clean;
    if (list[idx].data) list[idx].data.title = clean;
    list[idx].updatedAt = Date.now();
    persistSavedProjects(list);

    if (STATE.activeProjectId === projectId) {
      setProjectTitleInputs(clean);
      if (typeof saveState === 'function') saveState();
    }

    renamingProjectId = null;
    renderProjectsPopoverList();
    if (typeof showToast === 'function') showToast(`Renombrado a "${clean}"`, 'ok', 1600);
  }

  function exportSavedProjectJSON(projectId) {
    const record = getSavedProjects().find(p => p.id === projectId);
    if (!record || !record.data) return;
    const safeSlug =
      record.name
        .toLowerCase()
        .replace(/[^a-z0-9áéíóúñ_-]+/gi, '_')
        .replace(/^_+|_+$/g, '') || 'proyecto';
    const payload = {
      nodes: record.data.nodes || [],
      edges: record.data.edges || [],
      title: record.name,
      exported: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `flowlab-${safeSlug}.json`;
    a.click();
    URL.revokeObjectURL(url);
    if (typeof showToast === 'function') showToast(`Descargado flowlab-${safeSlug}.json`, 'ok', 1800);
  }

  function getModalSelectedDomain() {
    const activeCard = document.querySelector('#projModalDomainPicker .proj-domain-card.is-selected');
    return activeCard?.dataset.modalDomain === 'finance' ? 'finance' : 'workflow';
  }

  function setModalSelectedDomain(domain) {
    const clean = domain === 'finance' ? 'finance' : 'workflow';
    document.querySelectorAll('#projModalDomainPicker .proj-domain-card').forEach(card => {
      card.classList.toggle('is-selected', card.dataset.modalDomain === clean);
    });
    const starterWrap = document.getElementById('projModalFinStarterWrap');
    if (starterWrap) starterWrap.hidden = clean !== 'finance';
    const f2Label = document.getElementById('projModalField2Label');
    const f2Input = document.getElementById('projModalInput2');
    if (f2Label && f2Input && modalState.mode === 'new-blank') {
      f2Label.textContent =
        clean === 'finance' ? 'Título para la nueva planilla financiera' : 'Título para el nuevo lienzo';
      if (clean === 'finance' && (!f2Input.value || f2Input.value === 'nuevo_proyecto')) {
        f2Input.value = 'planilla_financiera';
      } else if (clean === 'workflow' && f2Input.value === 'planilla_financiera') {
        f2Input.value = 'nuevo_proyecto';
      }
    }
  }

  function executeNewBlankCanvas(options = {}) {
    const {
      saveCurrentFirst = false,
      currentSaveName = '',
      newCanvasTitle = 'nuevo_proyecto',
      targetDomain = 'workflow',
      financeStarter = 'fin_blanco'
    } = options;

    if (saveCurrentFirst) {
      const saved = saveCurrentProjectToLocal(
        currentSaveName || getProjectTitleInputValue() || 'proyecto_respaldado',
        { silentToast: true }
      );
      if (!saved) return;
    }

    resetState();
    const isFin = targetDomain === 'finance';
    STATE.canvasDomain = isFin ? 'finance' : 'workflow';

    if (isFin && financeStarter && financeStarter !== 'fin_blanco' && typeof getTemplate === 'function') {
      const tpl = getTemplate(financeStarter);
      STATE.nodes = tpl.nodes || [];
      STATE.edges = tpl.edges || [];
      STATE.isBlankCanvas = STATE.nodes.length === 0;
    }

    const fallbackTitle = isFin ? 'planilla_financiera' : 'nuevo_proyecto';
    const cleanNewTitle = String(newCanvasTitle || fallbackTitle).trim() || fallbackTitle;
    setProjectTitleInputs(cleanNewTitle);

    if (typeof setWorkspaceDomain === 'function') {
      setWorkspaceDomain(STATE.canvasDomain, { silent: true });
    }
    if (isFin && typeof switchRightPanelTab === 'function') {
      switchRightPanelTab('stats');
    }

    if (typeof commitHistory === 'function') commitHistory();
    markBaselineAsClean();
    if (typeof renderAll === 'function') renderAll();
    if (STATE.nodes.length > 0 && typeof fitView === 'function') {
      requestAnimationFrame(() => fitView());
    } else if (typeof applyTransform === 'function') {
      applyTransform();
    }
    if (typeof updateMobileNodeBar === 'function') updateMobileNodeBar();

    const stSave = document.getElementById('stSave');
    if (stSave) stSave.textContent = isFin ? 'planilla fx activa' : 'lienzo en blanco';

    closeProjectActionModal();
    toggleProjectsPopover(false);

    if (typeof showToast === 'function') {
      showToast(
        isFin
          ? `Planilla financiera "${cleanNewTitle}" lista`
          : saveCurrentFirst
            ? 'Proyecto guardado · Nuevo lienzo en blanco listo'
            : 'Nuevo lienzo en blanco listo',
        'ok',
        2300
      );
    }
    if (typeof log === 'function') {
      log('ok', isFin ? `nueva planilla financiera (${cleanNewTitle})` : `nuevo lienzo en blanco (${cleanNewTitle})`);
    }
  }

  function promptNewBlankCanvas() {
    if (typeof closeActiveDropdown === 'function') closeActiveDropdown(true);
    if (typeof toggleExportPopover === 'function') toggleExportPopover(false);
    toggleProjectsPopover(false);

    openNewBlankCanvasModal();
  }

  // =========================================================================
  // MODAL DE ACCIÓN DE PROYECTO (GUARDAR / NUEVO LIENZO / CAMBIAR PROYECTO)
  // =========================================================================
  function openSaveProjectModal() {
    if (typeof closeActiveDropdown === 'function') closeActiveDropdown(true);
    if (typeof toggleExportPopover === 'function') toggleExportPopover(false);
    toggleProjectsPopover(false);

    const modal = document.getElementById('projectActionModal');
    if (!modal) return;

    modalState = { mode: 'save', targetProjectId: null };
    const domainPicker = document.getElementById('projModalDomainPicker');
    if (domainPicker) domainPicker.hidden = true;

    const currentName = getProjectTitleInputValue() || 'mi_proyecto';
    const existingList = getSavedProjects();
    const activeRecord = STATE.activeProjectId
      ? existingList.find(p => p.id === STATE.activeProjectId)
      : null;
    const sameNameRecord = existingList.find(
      p => p.name.toLowerCase() === currentName.toLowerCase()
    );
    const hasMatch = Boolean(activeRecord || sameNameRecord);

    document.getElementById('projModalTitle').textContent = 'guardar_proyecto';
    document.getElementById('projModalDesc').textContent =
      `Guarda el flujo actual (${STATE.nodes.length} nodos · ${STATE.edges.length} conexiones) en el almacenamiento local del navegador para abrirlo en cualquier momento.`;

    const field1Wrap = document.getElementById('projModalField1Wrap');
    const field1Label = document.getElementById('projModalField1Label');
    const field1Input = document.getElementById('projModalInput1');
    const field2Wrap = document.getElementById('projModalField2Wrap');

    field1Wrap.hidden = false;
    field1Label.textContent = 'Nombre del proyecto';
    field1Input.value = currentName;
    field1Input.placeholder = 'ej. pipeline_ventas_v2';
    field2Wrap.hidden = true;

    const btnPrimary = document.getElementById('projModalPrimary');
    const btnSecondary = document.getElementById('projModalSecondary');

    btnPrimary.textContent = hasMatch ? 'Guardar y actualizar' : 'Guardar proyecto';
    btnPrimary.className = 'btn primary';

    if (hasMatch) {
      btnSecondary.hidden = false;
      btnSecondary.textContent = 'Guardar como copia nueva';
      btnSecondary.className = 'btn';
    } else {
      btnSecondary.hidden = true;
    }

    modal.hidden = false;
    setTimeout(() => {
      field1Input.focus();
      field1Input.select();
    }, 30);
  }

  function openNewBlankCanvasModal() {
    const modal = document.getElementById('projectActionModal');
    if (!modal) return;

    const canvasEmpty = !STATE.nodes.length && !STATE.edges.length;
    modalState = { mode: 'new-blank', targetProjectId: null, canvasEmpty };

    const currentName = getProjectTitleInputValue() || 'proyecto_actual';
    const domainPicker = document.getElementById('projModalDomainPicker');
    if (domainPicker) domainPicker.hidden = false;
    setModalSelectedDomain(STATE.canvasDomain || 'workflow');

    document.getElementById('projModalTitle').textContent = 'generar_lienzo_o_planilla';
    document.getElementById('projModalDesc').textContent = canvasEmpty
      ? 'Elige si deseas iniciar un Lienzo de Flujo o una Planilla Financiera (fx) con cálculos automáticos, gráficas de ganancia/pérdida y métricas.'
      : `El espacio actual tiene ${STATE.nodes.length} ${STATE.nodes.length === 1 ? 'nodo' : 'nodos'} y ${STATE.edges.length} ${STATE.edges.length === 1 ? 'conexión' : 'conexiones'}. Elige el tipo de nuevo entorno y opcionalmente respalda tu trabajo actual.`;

    const field1Wrap = document.getElementById('projModalField1Wrap');
    const field1Label = document.getElementById('projModalField1Label');
    const field1Input = document.getElementById('projModalInput1');

    const field2Wrap = document.getElementById('projModalField2Wrap');
    const field2Label = document.getElementById('projModalField2Label');
    const field2Input = document.getElementById('projModalInput2');

    if (canvasEmpty) {
      field1Wrap.hidden = true;
    } else {
      field1Wrap.hidden = false;
      field1Label.textContent = 'Guardar trabajo actual con el nombre';
      field1Input.value = currentName;
      field1Input.placeholder = 'nombre para respaldar el espacio actual';
    }

    field2Wrap.hidden = false;
    field2Label.textContent =
      (STATE.canvasDomain === 'finance') ? 'Título para la nueva planilla financiera' : 'Título para el nuevo lienzo';
    field2Input.value = (STATE.canvasDomain === 'finance') ? 'planilla_financiera' : 'nuevo_proyecto';
    field2Input.placeholder = 'nuevo_proyecto';

    const btnPrimary = document.getElementById('projModalPrimary');
    const btnSecondary = document.getElementById('projModalSecondary');

    if (canvasEmpty) {
      btnPrimary.textContent = 'Crear espacio';
      btnPrimary.className = 'btn primary';
      btnSecondary.hidden = true;
    } else {
      btnPrimary.textContent = 'Guardar actual y crear';
      btnPrimary.className = 'btn primary';
      btnSecondary.hidden = false;
      btnSecondary.textContent = 'Crear sin guardar';
      btnSecondary.className = 'btn proj-btn-danger';
    }

    modal.hidden = false;
    setTimeout(() => {
      const focusEl = canvasEmpty ? field2Input : field1Input;
      focusEl.focus();
      focusEl.select();
    }, 30);
  }

  function openSwitchProjectModal(targetRecord) {
    const modal = document.getElementById('projectActionModal');
    if (!modal || !targetRecord) return;

    modalState = { mode: 'switch-project', targetProjectId: targetRecord.id };
    const domainPicker = document.getElementById('projModalDomainPicker');
    if (domainPicker) domainPicker.hidden = true;

    const currentName = getProjectTitleInputValue() || 'proyecto_actual';

    document.getElementById('projModalTitle').textContent = 'abrir_proyecto_guardado';
    document.getElementById('projModalDesc').textContent =
      `Hay cambios en el lienzo actual (${STATE.nodes.length} nodos). ¿Deseas guardarlos antes de abrir "${targetRecord.name}"?`;

    const field1Wrap = document.getElementById('projModalField1Wrap');
    const field1Label = document.getElementById('projModalField1Label');
    const field1Input = document.getElementById('projModalInput1');
    const field2Wrap = document.getElementById('projModalField2Wrap');

    field1Wrap.hidden = false;
    field1Label.textContent = 'Guardar lienzo actual como';
    field1Input.value = currentName;
    field1Input.placeholder = 'nombre del proyecto actual';
    field2Wrap.hidden = true;

    const btnPrimary = document.getElementById('projModalPrimary');
    const btnSecondary = document.getElementById('projModalSecondary');

    btnPrimary.textContent = 'Guardar actual y abrir';
    btnPrimary.className = 'btn primary';

    btnSecondary.hidden = false;
    btnSecondary.textContent = 'Abrir sin guardar';
    btnSecondary.className = 'btn proj-btn-danger';

    modal.hidden = false;
    setTimeout(() => {
      field1Input.focus();
      field1Input.select();
    }, 30);
  }

  function closeProjectActionModal() {
    const modal = document.getElementById('projectActionModal');
    if (modal) modal.hidden = true;
    modalState = { mode: null, targetProjectId: null };
  }

  function handleModalPrimary() {
    const in1 = document.getElementById('projModalInput1')?.value || '';
    const in2 = document.getElementById('projModalInput2')?.value || '';

    if (modalState.mode === 'save') {
      const rec = saveCurrentProjectToLocal(in1, { forceNew: false });
      if (rec) closeProjectActionModal();
      return;
    }

    if (modalState.mode === 'new-blank') {
      const dom = getModalSelectedDomain();
      const starter = document.getElementById('projModalFinStarter')?.value || 'fin_blanco';
      executeNewBlankCanvas({
        saveCurrentFirst: !modalState.canvasEmpty,
        currentSaveName: in1,
        newCanvasTitle: in2 || (dom === 'finance' ? 'planilla_financiera' : 'nuevo_proyecto'),
        targetDomain: dom,
        financeStarter: starter
      });
      return;
    }

    if (modalState.mode === 'switch-project') {
      const targetId = modalState.targetProjectId;
      const saved = saveCurrentProjectToLocal(in1, { silentToast: true });
      if (!saved) return;
      closeProjectActionModal();
      loadSavedProjectById(targetId, { skipUnsavedCheck: true });
    }
  }

  function handleModalSecondary() {
    const in1 = document.getElementById('projModalInput1')?.value || '';
    const in2 = document.getElementById('projModalInput2')?.value || '';

    if (modalState.mode === 'save') {
      const baseName = (in1 || getProjectTitleInputValue() || 'mi_proyecto').trim();
      const list = getSavedProjects();
      const existsSame = list.some(p => p.name.toLowerCase() === baseName.toLowerCase());
      const copyName = existsSame ? `${baseName}_copia` : baseName;
      const rec = saveCurrentProjectToLocal(copyName, { forceNew: true });
      if (rec) closeProjectActionModal();
      return;
    }

    if (modalState.mode === 'new-blank') {
      const dom = getModalSelectedDomain();
      const starter = document.getElementById('projModalFinStarter')?.value || 'fin_blanco';
      executeNewBlankCanvas({
        saveCurrentFirst: false,
        newCanvasTitle: in2 || (dom === 'finance' ? 'planilla_financiera' : 'nuevo_proyecto'),
        targetDomain: dom,
        financeStarter: starter
      });
      return;
    }

    if (modalState.mode === 'switch-project') {
      const targetId = modalState.targetProjectId;
      closeProjectActionModal();
      loadSavedProjectById(targetId, { skipUnsavedCheck: true });
    }
  }

  // =========================================================================
  // MENÚ DESPLEGABLE / GESTOR DE PROYECTOS GUARDADOS (#projectsPopover)
  // =========================================================================
  function positionProjectsPopover() {
    const pop = document.getElementById('projectsPopover');
    const btn = document.getElementById('btnSavedProjects');
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

    const popW = Math.min(352, vpWidth - 16);
    pop.style.width = popW + 'px';

    let left = rect.right - popW;
    left = Math.min(Math.max(8, left), Math.max(8, vpWidth - popW - 8));

    const top = Math.min(vpHeight - 120, rect.bottom + 7);
    pop.style.left = Math.round(left) + 'px';
    pop.style.top = Math.round(top) + 'px';
  }

  function toggleProjectsPopover(force) {
    const pop = document.getElementById('projectsPopover');
    const btn = document.getElementById('btnSavedProjects');
    if (!pop) return;

    const nextOpen = typeof force === 'boolean' ? force : pop.hidden;
    if (!nextOpen) {
      pop.hidden = true;
      btn?.classList.remove('is-open');
      btn?.setAttribute('aria-expanded', 'false');
      pendingDeleteId = null;
      renamingProjectId = null;
      return;
    }

    if (typeof closeActiveDropdown === 'function') closeActiveDropdown(true);
    if (typeof toggleExportPopover === 'function') toggleExportPopover(false);
    if (typeof toggleUserWorkspacePopover === 'function') toggleUserWorkspacePopover(false);
    if (typeof hideNodeContextMenu === 'function') hideNodeContextMenu();

    const quickInput = document.getElementById('quickSaveProjInput');
    if (quickInput) {
      quickInput.value = getProjectTitleInputValue() || 'mi_proyecto';
    }

    pendingDeleteId = null;
    renamingProjectId = null;
    renderProjectsPopoverList();

    pop.hidden = false;
    btn?.classList.add('is-open');
    btn?.setAttribute('aria-expanded', 'true');
    positionProjectsPopover();
  }

  function renderProjectsPopoverList() {
    const listWrap = document.getElementById('savedProjectsList');
    const searchWrap = document.getElementById('savedProjectsSearchWrap');
    const searchInput = document.getElementById('savedProjectsSearch');
    const headCount = document.getElementById('projectsPopoverCount');
    const allProjects = getSavedProjects();

    updateSavedProjectsBadge(allProjects.length);
    if (headCount) {
      headCount.textContent = `${allProjects.length} ${allProjects.length === 1 ? 'archivo' : 'archivos'}`;
    }

    if (!listWrap) return;

    if (searchWrap) {
      searchWrap.hidden = allProjects.length < 4;
    }

    const q = (searchInput && !searchWrap?.hidden ? searchInput.value : '').trim().toLowerCase();
    const filtered = q
      ? allProjects.filter(p => p.name.toLowerCase().includes(q))
      : allProjects;

    // A partir de 5 proyectos guardados también se limita y desplaza limpiamente
    listWrap.classList.toggle('is-scrollable', filtered.length >= 5);

    if (!allProjects.length) {
      listWrap.innerHTML =
        '<div class="proj-empty-state">' +
        '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>' +
        '<span>Aún no tienes proyectos guardados en el navegador.</span>' +
        '<small>Escribe un nombre arriba y pulsa "Guardar" para conservar tu flujo actual.</small>' +
        '</div>';
      return;
    }

    if (!filtered.length) {
      listWrap.innerHTML =
        '<div class="proj-empty-state"><span>Sin coincidencias para tu búsqueda.</span></div>';
      return;
    }

    listWrap.innerHTML = filtered
      .map(p => {
        const isActive = p.id === STATE.activeProjectId;
        const nCount = typeof p.nodeCount === 'number' ? p.nodeCount : (p.data?.nodes?.length || 0);
        const eCount = typeof p.edgeCount === 'number' ? p.edgeCount : (p.data?.edges?.length || 0);
        const relDate = formatRelativeDate(p.updatedAt);

        if (renamingProjectId === p.id) {
          return (
            `<div class="proj-item is-renaming" data-proj-id="${escapeProjHtml(p.id)}">` +
            `<input class="proj-rename-input" data-rename-input="${escapeProjHtml(p.id)}" value="${escapeProjHtml(p.name)}" aria-label="Nuevo nombre del proyecto">` +
            `<div class="proj-item-actions is-visible">` +
            `<button type="button" class="proj-act-btn is-confirm" data-proj-action="confirm-rename" data-id="${escapeProjHtml(p.id)}" title="Confirmar nombre" aria-label="Confirmar nombre">` +
            `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3"><polyline points="20 6 9 17 4 12"/></svg>` +
            `</button>` +
            `<button type="button" class="proj-act-btn" data-proj-action="cancel-rename" data-id="${escapeProjHtml(p.id)}" title="Cancelar" aria-label="Cancelar">` +
            `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>` +
            `</button>` +
            `</div>` +
            `</div>`
          );
        }

        if (pendingDeleteId === p.id) {
          return (
            `<div class="proj-item is-deleting" data-proj-id="${escapeProjHtml(p.id)}">` +
            `<span class="proj-del-prompt">¿Eliminar "${escapeProjHtml(p.name)}"?</span>` +
            `<div class="proj-item-actions is-visible">` +
            `<button type="button" class="proj-act-btn is-danger" data-proj-action="confirm-delete" data-id="${escapeProjHtml(p.id)}">sí</button>` +
            `<button type="button" class="proj-act-btn" data-proj-action="cancel-delete" data-id="${escapeProjHtml(p.id)}">no</button>` +
            `</div>` +
            `</div>`
          );
        }

        return (
          `<div class="proj-item${isActive ? ' is-active' : ''}" data-proj-id="${escapeProjHtml(p.id)}">` +
          `<button type="button" class="proj-item-open" data-proj-action="open" data-id="${escapeProjHtml(p.id)}" title="Abrir proyecto ${escapeProjHtml(p.name)}">` +
          `<span class="proj-item-icon" aria-hidden="true">` +
          `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>` +
          `</span>` +
          `<span class="proj-item-info">` +
          `<span class="proj-item-title-row">` +
          `<span class="proj-item-name">${escapeProjHtml(p.name)}</span>` +
          (isActive ? '<span class="proj-active-pill">activo</span>' : '') +
          `</span>` +
          `<span class="proj-item-meta">${nCount} nodos · ${eCount} conex. · ${escapeProjHtml(relDate)}</span>` +
          `</span>` +
          `</button>` +
          `<div class="proj-item-actions">` +
          `<button type="button" class="proj-act-btn" data-proj-action="rename" data-id="${escapeProjHtml(p.id)}" title="Renombrar proyecto" aria-label="Renombrar">` +
          `<svg width="11.5" height="11.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>` +
          `</button>` +
          `<button type="button" class="proj-act-btn" data-proj-action="download" data-id="${escapeProjHtml(p.id)}" title="Descargar archivo .json" aria-label="Descargar JSON">` +
          `<svg width="11.5" height="11.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>` +
          `</button>` +
          `<button type="button" class="proj-act-btn is-danger-hover" data-proj-action="ask-delete" data-id="${escapeProjHtml(p.id)}" title="Eliminar proyecto guardado" aria-label="Eliminar">` +
          `<svg width="11.5" height="11.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>` +
          `</button>` +
          `</div>` +
          `</div>`
        );
      })
      .join('');

    if (renamingProjectId) {
      const renameInput = listWrap.querySelector(`[data-rename-input="${renamingProjectId}"]`);
      if (renameInput) {
        renameInput.focus();
        renameInput.select();
        renameInput.addEventListener('keydown', ev => {
          if (ev.key === 'Enter') {
            ev.preventDefault();
            renameSavedProjectById(renamingProjectId, renameInput.value);
          } else if (ev.key === 'Escape') {
            ev.preventDefault();
            renamingProjectId = null;
            renderProjectsPopoverList();
          }
        });
      }
    }
  }

  function initProjectManager() {
    markBaselineAsClean();
    updateSavedProjectsBadge();

    document.getElementById('btnSaveProj')?.addEventListener('click', e => {
      e.stopPropagation();
      openSaveProjectModal();
    });

    document.getElementById('btnSavedProjects')?.addEventListener('click', e => {
      e.stopPropagation();
      toggleProjectsPopover();
    });

    document.getElementById('btnCloseProjectsPopover')?.addEventListener('click', () => {
      toggleProjectsPopover(false);
    });

    document.getElementById('btnQuickSaveProj')?.addEventListener('click', () => {
      const input = document.getElementById('quickSaveProjInput');
      const val = input ? input.value : '';
      saveCurrentProjectToLocal(val, { forceNew: false });
    });

    document.getElementById('quickSaveProjInput')?.addEventListener('keydown', e => {
      if (e.key === 'Enter') {
        e.preventDefault();
        saveCurrentProjectToLocal(e.target.value, { forceNew: false });
      }
    });

    document.getElementById('savedProjectsSearch')?.addEventListener('input', () => {
      renderProjectsPopoverList();
    });

    document.getElementById('btnProjImportFile')?.addEventListener('click', () => {
      toggleProjectsPopover(false);
      document.getElementById('fileInput')?.click();
    });

    document.getElementById('btnProjNewBlank')?.addEventListener('click', () => {
      promptNewBlankCanvas();
    });

    document.getElementById('savedProjectsList')?.addEventListener('click', e => {
      const btn = e.target.closest('[data-proj-action]');
      if (!btn) return;
      e.stopPropagation();
      const action = btn.dataset.projAction;
      const id = btn.dataset.id;

      if (action === 'open') {
        loadSavedProjectById(id);
      } else if (action === 'rename') {
        pendingDeleteId = null;
        renamingProjectId = id;
        renderProjectsPopoverList();
      } else if (action === 'confirm-rename') {
        const inp = document.querySelector(`[data-rename-input="${id}"]`);
        renameSavedProjectById(id, inp ? inp.value : '');
      } else if (action === 'cancel-rename') {
        renamingProjectId = null;
        renderProjectsPopoverList();
      } else if (action === 'download') {
        exportSavedProjectJSON(id);
      } else if (action === 'ask-delete') {
        renamingProjectId = null;
        pendingDeleteId = id;
        renderProjectsPopoverList();
      } else if (action === 'confirm-delete') {
        deleteSavedProjectById(id);
      } else if (action === 'cancel-delete') {
        pendingDeleteId = null;
        renderProjectsPopoverList();
      }
    });

    // Modal listeners
    document.getElementById('projModalClose')?.addEventListener('click', closeProjectActionModal);
    document.getElementById('projModalCancel')?.addEventListener('click', closeProjectActionModal);
    document.getElementById('projModalPrimary')?.addEventListener('click', handleModalPrimary);
    document.getElementById('projModalSecondary')?.addEventListener('click', handleModalSecondary);

    document.querySelectorAll('#projModalDomainPicker .proj-domain-card').forEach(card => {
      card.addEventListener('click', () => {
        setModalSelectedDomain(card.dataset.modalDomain);
      });
    });

    document.getElementById('projectActionModal')?.addEventListener('pointerdown', e => {
      if (e.target.id === 'projectActionModal') {
        closeProjectActionModal();
      }
    });

    ['projModalInput1', 'projModalInput2'].forEach(inputId => {
      document.getElementById(inputId)?.addEventListener('keydown', e => {
        if (e.key === 'Enter') {
          e.preventDefault();
          handleModalPrimary();
        } else if (e.key === 'Escape') {
          e.preventDefault();
          closeProjectActionModal();
        }
      });
    });

    // Cerrar popover de proyectos al tocar fuera
    document.addEventListener('pointerdown', e => {
      const pop = document.getElementById('projectsPopover');
      if (pop && !pop.hidden) {
        const btn = document.getElementById('btnSavedProjects');
        if (!pop.contains(e.target) && (!btn || !btn.contains(e.target))) {
          toggleProjectsPopover(false);
        }
      }
    });

    window.addEventListener('resize', positionProjectsPopover);

    // Atajo universal Ctrl+S / Cmd+S para guardar el proyecto con nombre
    window.addEventListener('keydown', e => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        openSaveProjectModal();
      }
    });
  }

  window.initProjectManager = initProjectManager;
  window.saveCurrentProjectToLocal = saveCurrentProjectToLocal;
  window.loadSavedProjectById = loadSavedProjectById;
  window.promptNewBlankCanvas = promptNewBlankCanvas;
  window.openSaveProjectModal = openSaveProjectModal;
  window.toggleProjectsPopover = toggleProjectsPopover;
  window.refreshProjectsUI = renderProjectsPopoverList;
  window.markBaselineAsClean = markBaselineAsClean;
})();
