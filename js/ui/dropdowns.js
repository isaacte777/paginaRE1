// DROPDOWNS: Menús desplegables personalizados con diseño y animaciones fluidas

(function () {
  const nativeValueDescriptor = Object.getOwnPropertyDescriptor(
    HTMLSelectElement.prototype,
    'value'
  );

  const TEMPLATE_META = {
    comparacion_precios: { tag: 'comercial', icon: '◈' },
    orquestador: { tag: 'agentes ia', icon: '✦' },
    web: { tag: 'arquitectura', icon: '⬡' },
    contratacion: { tag: 'rrhh', icon: '◎' },
    personal: { tag: 'productividad', icon: '◇' },
    complex: { tag: 'pipeline', icon: '❖' },
    blank: { tag: 'desde cero', icon: '□' }
  };

  const SPEED_META = {
    '0.5': 'lento',
    '1': 'normal',
    '2': 'rápido',
    '4': 'turbo'
  };

  const STATUS_COLORS = {
    pending: '#60a5fa',
    progress: '#facc15',
    done: '#4ade80',
    error: '#f87171'
  };

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

    let dotColor = STATUS_COLORS[val] || null;
    if (selectEl.id === 'filterStatus' && val === '') {
      dotColor = '#8b9095';
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
    let glyph = '';
    if (selectEl.id === 'templateSelect' && TEMPLATE_META[val]) {
      tag = TEMPLATE_META[val].tag;
      glyph = TEMPLATE_META[val].icon;
    } else if (selectEl.id === 'speedSel' && SPEED_META[val]) {
      tag = SPEED_META[val];
    }

    return { rawText, cleanLabel, codeBadge, dotColor, tag, glyph };
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
    const dotEl = trigger.querySelector('.fl-trigger-dot');
    const labelEl = trigger.querySelector('.fl-select-label');

    if (dotEl) {
      if (parts.dotColor && !isActionLauncher(selectEl)) {
        dotEl.style.background = parts.dotColor;
        dotEl.style.boxShadow = `0 0 8px ${parts.dotColor}66`;
        dotEl.hidden = false;
      } else {
        dotEl.hidden = true;
      }
    }

    if (labelEl) {
      labelEl.textContent = parts.dotColor ? parts.cleanLabel : parts.rawText;
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

    const rect = anchor.getBoundingClientRect();
    let minWidth = rect.width;
    if (selectEl.id === 'templateSelect') {
      minWidth = Math.max(rect.width, 248);
    } else if (selectEl.id === 'speedSel') {
      minWidth = Math.max(rect.width, 136);
    } else {
      minWidth = Math.max(rect.width, 168);
    }

    menu.style.minWidth = Math.round(minWidth) + 'px';
    menu.style.maxWidth = Math.min(340, window.innerWidth - 16) + 'px';

    const menuRect = menu.getBoundingClientRect();
    const mW = menuRect.width || minWidth;
    const mH = menuRect.height || 180;

    const spaceBelow = window.innerHeight - rect.bottom - 10;
    const spaceAbove = rect.top - 10;
    const openUpward = spaceBelow < mH && spaceAbove > spaceBelow;

    menu.dataset.side = openUpward ? 'top' : 'bottom';

    const top = openUpward
      ? Math.max(8, rect.top - mH - 6)
      : Math.min(window.innerHeight - mH - 8, rect.bottom + 6);

    let left = rect.left;
    if (selectEl.id === 'speedSel') {
      // Alinear al borde derecho en controles inferiores derechos
      left = rect.right - mW;
    }
    left = Math.min(Math.max(8, left), Math.max(8, window.innerWidth - mW - 8));

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
      if (parts.dotColor) {
        leftVisual =
          `<span class="fl-item-dot" style="background:${parts.dotColor};box-shadow:0 0 8px ${parts.dotColor}66" aria-hidden="true"></span>`;
      } else if (parts.glyph) {
        leftVisual = `<span class="fl-item-glyph" aria-hidden="true">${parts.glyph}</span>`;
      }

      const labelHtml =
        `<span class="fl-item-label">${escapeDropdownHtml(parts.dotColor ? parts.cleanLabel : parts.rawText)}</span>`;

      let rightVisual = '';
      if (launcher) {
        rightVisual =
          (parts.tag ? `<span class="fl-item-tag">${escapeDropdownHtml(parts.tag)}</span>` : '') +
          '<span class="fl-item-enter" aria-hidden="true">↵</span>';
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
      '<span class="fl-trigger-dot" hidden aria-hidden="true"></span>' +
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
