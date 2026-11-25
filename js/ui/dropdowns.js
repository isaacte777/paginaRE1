// DROPDOWNS: Menús desplegables personalizados con diseño y animaciones fluidas

(function () {
  const nativeValueDescriptor = Object.getOwnPropertyDescriptor(
    HTMLSelectElement.prototype,
    'value'
  );

  const TEMPLATE_META = {
    comparacion_precios: {
      tag: 'comercial',
      svg: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>'
    },
    orquestador: {
      tag: 'agentes ia',
      svg: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9L12 3z"/></svg>'
    },
    web: {
      tag: 'arquitectura',
      svg: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>'
    },
    contratacion: {
      tag: 'rrhh',
      svg: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>'
    },
    personal: {
      tag: 'productividad',
      svg: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>'
    },
    complex: {
      tag: 'pipeline',
      svg: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="6" y1="3" x2="6" y2="15"/><circle cx="18" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M18 9a9 9 0 0 1-9 9"/></svg>'
    },
    blank: {
      tag: 'desde cero',
      svg: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="4" width="16" height="16" rx="2" stroke-dasharray="4 3"/></svg>'
    }
  };

  const SPEED_META = {
    '0.5': 'lento',
    '1': 'normal',
    '2': 'rápido',
    '4': 'turbo'
  };

  const STATUS_SVGS = {
    all: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>',
    pending: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="8"/></svg>',
    progress: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="8"/><polyline points="12 7 12 12 15 14"/></svg>',
    done: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',
    error: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>'
  };

  const ENTER_SVG =
    '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><polyline points="9 10 4 15 9 20"/><path d="M20 4v7a4 4 0 0 1-4 4H4"/></svg>';

  let activeDropdown = null;
  let observer = null;

  function isActionLauncher(selectEl) {
    return selectEl.id === 'templateSelect';
  }

  function getMenuTitle(selectEl) {
    if (selectEl.id === 'templateSelect') return 'cargar plantilla';
    if (selectEl.id === 'filterStatus') return 'filtrar por estado';
    if (selectEl.id === 'speedSel') return 'velocidad de simulación';
    if (selectEl.id === 'nodeStatus' || selectEl.id === 'inspStatus') return 'estado del nodo';

    const prev = selectEl.previousElementSibling;
    if (prev && prev.tagName === 'LABEL' && prev.textContent.trim()) {
      return prev.textContent.trim().toLowerCase();
    }
    return '';
  }

  function parseOptionParts(selectEl, optionEl) {
    const rawText = (optionEl.textContent || '').trim();
    const val = optionEl.value;

    let statusSvg = STATUS_SVGS[val] || null;
    if (selectEl.id === 'filterStatus' && val === '') {
      statusSvg = STATUS_SVGS.all;
    }

    // Separar prefijo tipo [✓], [~], [ ], [!] si existe
    let codeBadge = '';
    let cleanLabel = rawText;
    const bracketMatch = rawText.match(/^(\[[^\]]*\])\s*(.+)$/);
    if (bracketMatch) {
      codeBadge = bracketMatch[1];
      cleanLabel = bracketMatch[2];
    }

    let tag = '';
    let iconSvg = statusSvg || '';
    if (selectEl.id === 'templateSelect' && TEMPLATE_META[val]) {
      tag = TEMPLATE_META[val].tag;
      iconSvg = TEMPLATE_META[val].svg;
    } else if (selectEl.id === 'speedSel' && SPEED_META[val]) {
      tag = SPEED_META[val];
    }

    return { rawText, cleanLabel, codeBadge, hasStatusIcon: Boolean(statusSvg), tag, iconSvg };
  }

  function createChevronSvg() {
    return (
      '<span class="fl-select-chevron" aria-hidden="true">' +
      '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">' +
      '<polyline points="6 9 12 15 18 9"></polyline>' +
      '</svg>' +
      '</span>'
    );
  }

  function createCheckSvg() {
    return (
      '<svg class="fl-item-check" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      '<polyline points="20 6 9 17 4 12"></polyline>' +
      '</svg>'
    );
  }

  function syncTriggerFromSelect(selectEl) {
    const trigger = selectEl._flTrigger;
    if (!trigger) return;

    const selectedOpt =
      Array.from(selectEl.options).find(o => o.value === selectEl.value) ||
      selectEl.options[selectEl.selectedIndex] ||
      selectEl.options[0];

    if (!selectedOpt) return;

    const parts = parseOptionParts(selectEl, selectedOpt);
    const iconEl = trigger.querySelector('.fl-trigger-icon');
    const labelEl = trigger.querySelector('.fl-select-label');

    if (iconEl) {
      if (parts.hasStatusIcon && parts.iconSvg && !isActionLauncher(selectEl)) {
        iconEl.innerHTML = parts.iconSvg;
        iconEl.hidden = false;
      } else {
        iconEl.innerHTML = '';
        iconEl.hidden = true;
      }
    }

    if (labelEl) {
      labelEl.textContent = parts.hasStatusIcon ? parts.cleanLabel : parts.rawText;
    }
  }

  function closeActiveDropdown(immediate = false) {
    if (!activeDropdown) return;
    const state = activeDropdown;
    activeDropdown = null;

    state.trigger.classList.remove('is-open');
    state.trigger.setAttribute('aria-expanded', 'false');
    if (state.wrapperModule) {
      state.wrapperModule.classList.remove('is-open');
    }

    const menu = state.menu;
    if (immediate || !menu.isConnected) {
      menu.remove();
      return;
    }

    menu.classList.add('is-closing');
    const removeMenu = () => {
      if (menu.isConnected) menu.remove();
    };
    menu.addEventListener('animationend', removeMenu, { once: true });
    window.setTimeout(removeMenu, 180);
  }

  function positionDropdownMenu(state) {
    const { anchor, menu, selectEl } = state;
    if (!anchor.isConnected) {
      closeActiveDropdown(true);
      return;
    }

    const vv = window.visualViewport;
    const vpWidth = vv ? vv.width : window.innerWidth;
    const vpHeight = vv ? vv.height : window.innerHeight;
    const vpTop = vv ? vv.offsetTop : 0;
    const vpLeft = vv ? vv.offsetLeft : 0;

    const rect = anchor.getBoundingClientRect();
    let minWidth = rect.width;
    if (selectEl.id === 'templateSelect') {
      minWidth = Math.max(rect.width, 236);
    } else if (selectEl.id === 'speedSel') {
      minWidth = Math.max(rect.width, 132);
    } else {
      minWidth = Math.max(rect.width, 164);
    }

    const maxAllowedW = Math.max(140, vpWidth - 16);
    minWidth = Math.min(minWidth, maxAllowedW);

    menu.style.minWidth = Math.round(minWidth) + 'px';
    menu.style.maxWidth = Math.round(Math.min(340, maxAllowedW)) + 'px';

    const listEl = menu.querySelector('.fl-dropdown-list');
    if (listEl) {
      listEl.style.maxHeight = Math.round(Math.min(280, Math.max(140, vpHeight - 80))) + 'px';
    }

    const menuRect = menu.getBoundingClientRect();
    const mW = menuRect.width || minWidth;
    const mH = menuRect.height || 180;

    const spaceBelow = vpTop + vpHeight - rect.bottom - 10;
    const spaceAbove = rect.top - vpTop - 10;
    const openUpward = spaceBelow < mH && spaceAbove > spaceBelow;

    menu.dataset.side = openUpward ? 'top' : 'bottom';

    const top = openUpward
      ? Math.max(vpTop + 8, rect.top - mH - 6)
      : Math.min(vpTop + vpHeight - mH - 8, rect.bottom + 6);

    let left = rect.left;
    if (selectEl.id === 'speedSel') {
      // Alinear al borde derecho en controles inferiores derechos
      left = rect.right - mW;
    }
    left = Math.min(Math.max(vpLeft + 8, left), Math.max(vpLeft + 8, vpLeft + vpWidth - mW - 8));

    menu.style.top = Math.round(top) + 'px';
    menu.style.left = Math.round(left) + 'px';
  }

  function setHighlightedIndex(state, nextIdx, scrollIntoView = true) {
    const { items } = state;
    if (!items.length) return;
    const clamped = ((nextIdx % items.length) + items.length) % items.length;
    state.highlightIdx = clamped;

    items.forEach((btn, idx) => {
      const active = idx === clamped;
      btn.classList.toggle('is-highlighted', active);
      if (active && scrollIntoView) {
        btn.scrollIntoView({ block: 'nearest' });
      }
    });
  }

  function chooseDropdownValue(state, value) {
    const { selectEl, trigger } = state;
    if (nativeValueDescriptor && nativeValueDescriptor.set) {
      nativeValueDescriptor.set.call(selectEl, value);
    } else {
      selectEl.value = value;
    }
    syncTriggerFromSelect(selectEl);
    closeActiveDropdown(false);
    selectEl.dispatchEvent(new Event('change', { bubbles: true }));
    try {
      trigger.focus({ preventScroll: true });
    } catch {}
  }

  function openDropdown(selectEl) {
    if (activeDropdown && activeDropdown.selectEl === selectEl) {
      closeActiveDropdown(false);
      return;
    }

    closeActiveDropdown(true);

    // Ocultar otros menús flotantes o tooltips activos para evitar superposición
    const tooltipEl = document.getElementById('hoverTooltip');
    if (tooltipEl) tooltipEl.hidden = true;
    if (typeof toggleExportPopover === 'function') toggleExportPopover(false);
    if (typeof hideNodeContextMenu === 'function') hideNodeContextMenu();

    const trigger = selectEl._flTrigger;
    if (!trigger) return;

    const wrapperModule = selectEl.closest('.template-module');
    const anchor = wrapperModule || trigger;

    const menu = document.createElement('div');
    menu.className = 'fl-dropdown-menu';
    menu.setAttribute('role', 'listbox');

    const title = getMenuTitle(selectEl);
    if (title) {
      const head = document.createElement('div');
      head.className = 'fl-dropdown-header';
      head.textContent = title;
      menu.appendChild(head);
    }

    const listWrap = document.createElement('div');
    listWrap.className = 'fl-dropdown-list';

    const launcher = isActionLauncher(selectEl);
    const items = [];
    let initialIdx = 0;

    Array.from(selectEl.options).forEach(opt => {
      if (launcher && opt.value === '') return;

      const idx = items.length;
      const isSelected = !launcher && opt.value === selectEl.value;
      if (isSelected) initialIdx = idx;

      const parts = parseOptionParts(selectEl, opt);

      const itemBtn = document.createElement('button');
      itemBtn.type = 'button';
      itemBtn.className = 'fl-dropdown-item' + (isSelected ? ' is-selected' : '');
      itemBtn.setAttribute('role', 'option');
      itemBtn.setAttribute('aria-selected', String(isSelected));
      itemBtn.dataset.value = opt.value;
      itemBtn.style.setProperty('--item-idx', String(Math.min(idx, 8)));

      let leftVisual = '';
      if (parts.iconSvg) {
        leftVisual = `<span class="fl-item-glyph" aria-hidden="true">${parts.iconSvg}</span>`;
      }

      const labelHtml =
        `<span class="fl-item-label">${escapeDropdownHtml(parts.hasStatusIcon ? parts.cleanLabel : parts.rawText)}</span>`;

      let rightVisual = '';
      if (launcher) {
        rightVisual =
          (parts.tag ? `<span class="fl-item-tag">${escapeDropdownHtml(parts.tag)}</span>` : '') +
          `<span class="fl-item-enter" aria-hidden="true">${ENTER_SVG}</span>`;
      } else {
        rightVisual =
          (parts.tag ? `<span class="fl-item-tag">${escapeDropdownHtml(parts.tag)}</span>` : '') +
          (isSelected ? createCheckSvg() : '<span class="fl-item-check-spacer" aria-hidden="true"></span>');
      }

      itemBtn.innerHTML =
        `<span class="fl-item-main">${leftVisual}${labelHtml}</span>` +
        `<span class="fl-item-meta">${rightVisual}</span>`;

      itemBtn.addEventListener('pointerenter', () => {
        if (activeDropdown) setHighlightedIndex(activeDropdown, idx, false);
      });

      itemBtn.addEventListener('click', e => {
        e.preventDefault();
        e.stopPropagation();
        if (activeDropdown) chooseDropdownValue(activeDropdown, opt.value);
      });

      listWrap.appendChild(itemBtn);
      items.push(itemBtn);
    });

    menu.appendChild(listWrap);
    document.body.appendChild(menu);

    const state = {
      selectEl,
      trigger,
      wrapperModule,
      anchor,
      menu,
      items,
      highlightIdx: initialIdx
    };

    activeDropdown = state;
    trigger.classList.add('is-open');
    trigger.setAttribute('aria-expanded', 'true');
    if (wrapperModule) wrapperModule.classList.add('is-open');

    setHighlightedIndex(state, initialIdx, false);
    positionDropdownMenu(state);
  }

  function escapeDropdownHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function enhanceSelect(selectEl) {
    if (!selectEl || selectEl.dataset.flEnhanced === '1') return;
    selectEl.dataset.flEnhanced = '1';
    selectEl.classList.add('fl-select-native');
    selectEl.tabIndex = -1;
    selectEl.setAttribute('aria-hidden', 'true');

    const wrapperModule = selectEl.closest('.template-module');
    const inZoombar = Boolean(selectEl.closest('.zoombar'));

    const trigger = document.createElement('button');
    trigger.type = 'button';
    trigger.className =
      'fl-select-trigger ' +
      (wrapperModule
        ? 'fl-select-trigger--bare'
        : inZoombar
          ? 'fl-select-trigger--compact'
          : 'fl-select-trigger--field');

    const ariaLabel = selectEl.getAttribute('aria-label');
    if (ariaLabel) trigger.setAttribute('aria-label', ariaLabel);
    trigger.setAttribute('aria-haspopup', 'listbox');
    trigger.setAttribute('aria-expanded', 'false');

    trigger.innerHTML =
      '<span class="fl-trigger-main">' +
      '<span class="fl-trigger-icon" hidden aria-hidden="true"></span>' +
      '<span class="fl-select-label"></span>' +
      '</span>' +
      createChevronSvg();

    selectEl._flTrigger = trigger;
    selectEl.insertAdjacentElement('afterend', trigger);

    // Interceptar cambios programáticos a select.value
    if (nativeValueDescriptor && nativeValueDescriptor.get && nativeValueDescriptor.set) {
      try {
        Object.defineProperty(selectEl, 'value', {
          configurable: true,
          enumerable: true,
          get() {
            return nativeValueDescriptor.get.call(this);
          },
          set(v) {
            nativeValueDescriptor.set.call(this, v);
            syncTriggerFromSelect(selectEl);
          }
        });
      } catch {}
    }

    syncTriggerFromSelect(selectEl);

    trigger.addEventListener('click', e => {
      e.preventDefault();
      e.stopPropagation();
      openDropdown(selectEl);
    });

    trigger.addEventListener('keydown', e => {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Enter' || e.key === ' ') {
        if (!activeDropdown || activeDropdown.selectEl !== selectEl) {
          e.preventDefault();
          e.stopPropagation();
          openDropdown(selectEl);
        }
      }
    });

    // Si está dentro de .template-module, permitir clic en todo el módulo y reenviar tooltip
    if (wrapperModule && !wrapperModule.dataset.flBound) {
      wrapperModule.dataset.flBound = '1';
      wrapperModule.addEventListener('click', e => {
        if (e.target.closest('.fl-select-trigger')) return;
        e.preventDefault();
        openDropdown(selectEl);
      });

      wrapperModule.addEventListener('mouseenter', e => {
        if (wrapperModule.classList.contains('is-open')) return;
        selectEl.dispatchEvent(
          new MouseEvent('mouseenter', { clientX: e.clientX, clientY: e.clientY })
        );
      });
      wrapperModule.addEventListener('mousemove', e => {
        if (wrapperModule.classList.contains('is-open')) return;
        selectEl.dispatchEvent(
          new MouseEvent('mousemove', { clientX: e.clientX, clientY: e.clientY })
        );
      });
      wrapperModule.addEventListener('mouseleave', () => {
        selectEl.dispatchEvent(new MouseEvent('mouseleave'));
      });
    }
  }

  function enhanceAllSelects(root = document) {
    root.querySelectorAll('select').forEach(enhanceSelect);
  }

  function initCustomDropdowns() {
    enhanceAllSelects(document);

    // Cerrar al hacer clic fuera
    document.addEventListener(
      'pointerdown',
      e => {
        if (!activeDropdown) return;
        const { menu, anchor } = activeDropdown;
        if (menu.contains(e.target) || anchor.contains(e.target)) return;
        closeActiveDropdown(false);
      },
      true
    );

    // Navegación por teclado cuando hay un menú abierto
    window.addEventListener(
      'keydown',
      e => {
        if (!activeDropdown) return;

        if (e.key === 'Escape') {
          e.preventDefault();
          e.stopPropagation();
          const trigger = activeDropdown.trigger;
          closeActiveDropdown(false);
          try {
            trigger.focus({ preventScroll: true });
          } catch {}
          return;
        }

        if (e.key === 'Tab') {
          closeActiveDropdown(false);
          return;
        }

        if (e.key === 'ArrowDown') {
          e.preventDefault();
          e.stopPropagation();
          setHighlightedIndex(activeDropdown, activeDropdown.highlightIdx + 1);
          return;
        }

        if (e.key === 'ArrowUp') {
          e.preventDefault();
          e.stopPropagation();
          setHighlightedIndex(activeDropdown, activeDropdown.highlightIdx - 1);
          return;
        }

        if (e.key === 'Home') {
          e.preventDefault();
          e.stopPropagation();
          setHighlightedIndex(activeDropdown, 0);
          return;
        }

        if (e.key === 'End') {
          e.preventDefault();
          e.stopPropagation();
          setHighlightedIndex(activeDropdown, activeDropdown.items.length - 1);
          return;
        }

        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          e.stopPropagation();
          const item = activeDropdown.items[activeDropdown.highlightIdx];
          if (item) chooseDropdownValue(activeDropdown, item.dataset.value);
        }
      },
      true
    );

    window.addEventListener('resize', () => {
      if (activeDropdown) positionDropdownMenu(activeDropdown);
    });

    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', () => {
        if (activeDropdown) positionDropdownMenu(activeDropdown);
      });
    }

    window.addEventListener(
      'scroll',
      e => {
        if (!activeDropdown) return;
        if (activeDropdown.menu.contains(e.target)) return;
        positionDropdownMenu(activeDropdown);
      },
      true
    );

    // Detectar selects creados dinámicamente (panel lateral de propiedades, inspector, etc.)
    if (!observer) {
      observer = new MutationObserver(mutations => {
        let shouldScan = false;
        for (const m of mutations) {
          if (m.addedNodes && m.addedNodes.length > 0) {
            shouldScan = true;
            break;
          }
        }
        if (shouldScan) enhanceAllSelects(document);
        if (activeDropdown && !activeDropdown.anchor.isConnected) {
          closeActiveDropdown(true);
        }
      });
      observer.observe(document.body, { childList: true, subtree: true });
    }
  }

  window.initCustomDropdowns = initCustomDropdowns;
})();
