// LAYOUT ENGINES: Motor paramétrico multi-topología para organizar nodos de miles de maneras
// (16 arquitecturas base × densidad × columnas × dirección × criterio de orden × separación Flujo/Finanzas)

(function () {
  const LAYOUT_PRESETS = [
    { id: 'domain_bridge', label: 'Flujo ⇄ Finanzas (Zonas)', desc: 'Separa procesos, gráficos y celdas fx con canal limpio' },
    { id: 'vertical', label: 'Vertical Puro (↓)', desc: 'Jerarquía continua de arriba hacia abajo sin cortes' },
    { id: 'horizontal', label: 'Horizontal Pipeline (→)', desc: 'Secuencia de izquierda a derecha por etapas' },
    { id: 'compact', label: 'Compacto Plegado', desc: 'Equilibrio compacto ideal para ver todo de un vistazo' },
    { id: 'tree_down', label: 'Árbol Jerárquico', desc: 'Ramas simétricas centradas bajo cada nodo padre' },
    { id: 'tree_right', label: 'Árbol Lateral (├)', desc: 'Dendrograma expandido hacia la derecha' },
    { id: 'swimlanes_type', label: 'Carriles por Rol/Tipo', desc: 'Agrupa Inicio, Procesos, Decisiones, Datos, IA y Finanzas' },
    { id: 'kanban_status', label: 'Kanban por Estado', desc: 'Columnas: Pendiente · En curso · Hecho · Error' },
    { id: 'excel_sheet', label: 'Hoja Excel (A1..Zn)', desc: 'Alinea celdas financieras según su columna y fila' },
    { id: 'snake_serpentine', label: 'Serpentina (Zig-Zag)', desc: 'Flujo continuo en S para cadenas largas' },
    { id: 'grid_matrix', label: 'Cuadrícula / Matriz', desc: ' Filas y columnas uniformes perfectamente alineadas' },
    { id: 'radial_rings', label: 'Anillos Radiales', desc: 'Núcleo central con anillos concéntricos por nivel' },
    { id: 'circular', label: 'Anillo Circular', desc: 'Perímetro circular ordenado para minimizar cruces' },
    { id: 'hub_spoke', label: 'Estrella (Hubs)', desc: 'Nodos principales rodeados de sus nodos satélite' },
    { id: 'cascade_diagonal', label: 'Cascada Diagonal (->)', desc: 'Escalera progresiva por etapas de ejecución' },
    { id: 'organic_force', label: 'Orgánico Equilibrado', desc: 'Distribución elástica por afinidad de conexiones' }
  ];

  function plainText(s) {
    return String(s || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function snapVal(v) {
    const g = (typeof CONFIG !== 'undefined' && Number(CONFIG.SNAP_GRID)) || 12;
    return Math.round(v / g) * g;
  }

  function isFin(n) {
    return Boolean(n && typeof isFinanceNodeType === 'function' && isFinanceNodeType(n.type));
  }

  function isChart(n) {
    return Boolean(n && typeof n.type === 'string' && n.type.startsWith('chart_'));
  }

  function measureNodeSafe(n) {
    const domW = Number(n.w) || 0;
    const domH = Number(n.h) || 0;
    let estW = 176;
    let estH = 62;
    if (isFin(n)) {
      estW = 228;
      estH = 96;
    } else if (isChart(n)) {
      estW = 284;
      estH = 168;
    } else if (n.type === 'decision' || n.type === 'loop') {
      estW = 190;
      estH = 92;
    }
    n.w = domW > 85 ? Math.max(domW, Math.round(estW * 0.88)) : estW;
    n.h = domH > 36 ? Math.max(domH, Math.round(estH * 0.88)) : estH;
    return { w: n.w, h: n.h };
  }

  function densityScale(density) {
    if (density === 'tight') return 0.72;
    if (density === 'compact') return 0.86;
    if (density === 'airy') return 1.42;
    if (density === 'wide') return 1.85;
    return 1.0;
  }

  // =========================================================================
  // ANÁLISIS TOPOLÓGICO LIBRE DE CICLOS (SUGIYAMA / KAHN + BARYCENTER)
  // =========================================================================
  function computeDagLayers(nodes, edges, sortBy = 'topological') {
    const ids = nodes.map(n => n.id);
    const idSet = new Set(ids);
    const nodeMap = new Map(nodes.map(n => [n.id, n]));
    const origIdx = new Map(nodes.map((n, i) => [n.id, i]));

    const validEdges = (edges || []).filter(
      e => e && idSet.has(e.from) && idSet.has(e.to) && e.from !== e.to
    );

    const outAdj = new Map(ids.map(id => [id, []]));
    const rawIn = new Map(ids.map(id => [id, 0]));
    validEdges.forEach(e => {
      outAdj.get(e.from).push(e);
      rawIn.set(e.to, (rawIn.get(e.to) || 0) + 1);
    });

    const roots = ids.filter(id => nodeMap.get(id)?.type === 'start');
    ids.forEach(id => {
      if ((rawIn.get(id) || 0) === 0 && !roots.includes(id)) roots.push(id);
    });
    if (!roots.length && ids.length) roots.push(ids[0]);

    const color = new Map();
    const backEdges = new Set();
    const dfs = u => {
      color.set(u, 1);
      (outAdj.get(u) || []).forEach(e => {
        const v = e.to;
        if (color.get(v) === 1 || (nodeMap.get(v)?.type === 'start' && v !== u)) {
          backEdges.add(e);
        } else if (!color.get(v)) {
          dfs(v);
        }
      });
      color.set(u, 2);
    };
    roots.forEach(r => { if (!color.get(r)) dfs(r); });
    ids.forEach(id => { if (!color.get(id)) dfs(id); });

    const children = new Map(ids.map(id => [id, []]));
    const parents = new Map(ids.map(id => [id, []]));
    const inDeg = new Map(ids.map(id => [id, 0]));

    validEdges.forEach(e => {
      if (backEdges.has(e)) return;
      children.get(e.from).push(e.to);
      parents.get(e.to).push(e.from);
      inDeg.set(e.to, (inDeg.get(e.to) || 0) + 1);
    });

    const rank = new Map();
    const queue = [];
    ids.forEach(id => {
      if ((inDeg.get(id) || 0) === 0) {
        rank.set(id, 0);
        queue.push(id);
      }
    });
    if (!queue.length && ids.length) {
      rank.set(ids[0], 0);
      queue.push(ids[0]);
    }

    const seen = new Set();
    while (queue.length) {
      const u = queue.shift();
      seen.add(u);
      const rU = rank.get(u) || 0;
      (children.get(u) || []).forEach(v => {
        if (!rank.has(v) || rU + 1 > rank.get(v)) {
          rank.set(v, rU + 1);
        }
        const rem = (inDeg.get(v) || 1) - 1;
        inDeg.set(v, rem);
        if (rem <= 0 && !seen.has(v) && !queue.includes(v)) queue.push(v);
      });
    }
    ids.forEach(id => { if (!rank.has(id)) rank.set(id, 0); });

    const maxRank = Math.max(0, ...Array.from(rank.values()));
    ids.forEach(id => {
      const n = nodeMap.get(id);
      if (n?.type === 'end' && (children.get(id) || []).length === 0 && maxRank > 0) {
        rank.set(id, maxRank);
      }
    });

    const uniqueRanks = Array.from(new Set(rank.values())).sort((a, b) => a - b);
    const rankToIdx = new Map(uniqueRanks.map((r, i) => [r, i]));
    const layers = uniqueRanks.map(() => []);
    ids.forEach(id => {
      layers[rankToIdx.get(rank.get(id)) || 0].push(nodeMap.get(id));
    });

    // Minimización baricéntrica de cruces en ambos sentidos (barrido hacia abajo + barrido hacia arriba)
    const posScore = new Map();
    layers.forEach((layer, lIdx) => {
      if (lIdx === 0) {
        layer.sort((a, b) => compareNodesSecondary(a, b, sortBy, origIdx));
      } else {
        layer.sort((a, b) => {
          const pA = parents.get(a.id) || [];
          const pB = parents.get(b.id) || [];
          const bA = pA.length ? pA.reduce((s, p) => s + (posScore.get(p) ?? 0), 0) / pA.length : origIdx.get(a.id) || 0;
          const bB = pB.length ? pB.reduce((s, p) => s + (posScore.get(p) ?? 0), 0) / pB.length : origIdx.get(b.id) || 0;
          if (Math.abs(bA - bB) > 0.01) return bA - bB;
          return compareNodesSecondary(a, b, sortBy, origIdx);
        });
      }
      layer.forEach((n, idx) => posScore.set(n.id, idx));
    });

    for (let lIdx = layers.length - 2; lIdx >= 0; lIdx--) {
      const layer = layers[lIdx];
      layer.sort((a, b) => {
        const cA = children.get(a.id) || [];
        const cB = children.get(b.id) || [];
        const bA = cA.length ? cA.reduce((s, c) => s + (posScore.get(c) ?? posScore.get(a.id) ?? 0), 0) / cA.length : posScore.get(a.id) ?? 0;
        const bB = cB.length ? cB.reduce((s, c) => s + (posScore.get(c) ?? posScore.get(b.id) ?? 0), 0) / cB.length : posScore.get(b.id) ?? 0;
        if (Math.abs(bA - bB) > 0.05) return bA - bB;
        return (posScore.get(a.id) ?? 0) - (posScore.get(b.id) ?? 0);
      });
      layer.forEach((n, idx) => posScore.set(n.id, idx));
    }

    return { layers, children, parents, rank, validEdges };
  }

  function compareNodesSecondary(a, b, sortBy, origIdx) {
    if (sortBy === 'alpha') return String(a.text || '').localeCompare(String(b.text || ''));
    if (sortBy === 'type') return String(a.type || '').localeCompare(String(b.type || ''));
    if (sortBy === 'status') return String(a.status || '').localeCompare(String(b.status || ''));
    if (sortBy === 'cell') {
      return String(a.params?.cellRef || 'Z99').localeCompare(String(b.params?.cellRef || 'Z99'), undefined, { numeric: true });
    }
    return (origIdx.get(a.id) || 0) - (origIdx.get(b.id) || 0);
  }

  function splitWeakComponents(nodes, edges) {
    const idSet = new Set(nodes.map(n => n.id));
    const adj = new Map(nodes.map(n => [n.id, new Set()]));
    (edges || []).forEach(e => {
      if (e && idSet.has(e.from) && idSet.has(e.to) && e.from !== e.to) {
        adj.get(e.from).add(e.to);
        adj.get(e.to).add(e.from);
      }
    });

    const nodeMap = new Map(nodes.map(n => [n.id, n]));
    const visited = new Set();
    const comps = [];

    nodes.forEach(n => {
      if (visited.has(n.id)) return;
      const group = [];
      const q = [n.id];
      visited.add(n.id);
      while (q.length) {
        const cur = q.shift();
        group.push(nodeMap.get(cur));
        adj.get(cur).forEach(nb => {
          if (!visited.has(nb)) {
            visited.add(nb);
            q.push(nb);
          }
        });
      }
      comps.push(group);
    });

    comps.sort((a, b) => b.length - a.length);
    return comps;
  }

  // Garantía matemática post-layout: ningún par de nodos se solapa jamás
  function resolveAllOverlaps(nodes, minGap = 24) {
    if (nodes.length < 2) return;
    for (let iter = 0; iter < 12; iter++) {
      let moved = false;
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const A = nodes[i];
          const B = nodes[j];
          const ox = Math.min(A.x + A.w + minGap, B.x + B.w + minGap) - Math.max(A.x, B.x);
          const oy = Math.min(A.y + A.h + minGap, B.y + B.h + minGap) - Math.max(A.y, B.y);
          if (ox > 0 && oy > 0) {
            moved = true;
            if (ox < oy) {
              const push = Math.ceil(ox / 2);
              if (A.x <= B.x) { A.x -= push; B.x += push; } else { A.x += push; B.x -= push; }
            } else {
              const push = Math.ceil(oy / 2);
              if (A.y <= B.y) { A.y -= push; B.y += push; } else { A.y += push; B.y -= push; }
            }
          }
        }
      }
      if (!moved) break;
    }
    nodes.forEach(n => {
      n.x = snapVal(n.x);
      n.y = snapVal(n.y);
    });
  }

  // =========================================================================
  // IMPLEMENTACIONES DE LAS 16 TOPOLOGÍAS PARAMÉTRICAS
  // =========================================================================

  // 1. VERTICAL PURO (Arriba -> Abajo, sin corte artificial cada 7 niveles)
  function layoutVerticalDag(nodes, edges, opts) {
    const scale = densityScale(opts.density);
    const vGap = Math.round(58 * scale);
    const hGap = Math.round(52 * scale);
    const compGap = Math.round(115 * scale);

    if (opts.columns === 1) {
      // Una sola columna estricta de arriba a abajo
      const { layers } = computeDagLayers(nodes, edges, opts.sortBy);
      const ordered = layers.flat();
      if (opts.reverse) ordered.reverse();
      const centerX = (opts.originX || 180) + 140;
      let curY = opts.originY || 60;
      ordered.forEach(n => {
        n.x = snapVal(centerX - n.w / 2);
        n.y = snapVal(curY);
        curY += n.h + vGap;
      });
      return;
    }

    const comps = splitWeakComponents(nodes, edges);
    let cursorX = opts.originX || 120;
    const startY = opts.originY || 60;

    comps.forEach(compNodes => {
      const { layers } = computeDagLayers(compNodes, edges, opts.sortBy);
      const rows = opts.reverse ? layers.slice().reverse() : layers;
      const rowWidths = rows.map(
        r => r.reduce((s, n) => s + n.w, 0) + Math.max(0, r.length - 1) * hGap
      );
      const compW = Math.max(180, ...rowWidths);
      const centerX = cursorX + compW / 2;

      let curY = startY;
      rows.forEach((rNodes, idx) => {
        const rw = rowWidths[idx];
        const rMaxH = Math.max(54, ...rNodes.map(n => n.h));
        let curX =
          opts.align === 'start'
            ? cursorX
            : opts.align === 'end'
              ? cursorX + compW - rw
              : centerX - rw / 2;

        rNodes.forEach(n => {
          n.x = snapVal(curX);
          n.y = snapVal(curY + (rMaxH - n.h) / 2);
          curX += n.w + hGap;
        });
        curY += rMaxH + vGap;
      });

      cursorX += compW + compGap;
    });
  }

  // 2. HORIZONTAL PIPELINE (Izquierda -> Derecha por columnas topológicas)
  function layoutHorizontalDag(nodes, edges, opts) {
    const scale = densityScale(opts.density);
    const colGap = Math.round(84 * scale);
    const rowGap = Math.round(44 * scale);
    const compVGap = Math.round(96 * scale);

    const comps = splitWeakComponents(nodes, edges);
    const startX = opts.originX || 96;
    let cursorY = opts.originY || 64;

    comps.forEach(compNodes => {
      const { layers } = computeDagLayers(compNodes, edges, opts.sortBy);
      const cols = opts.reverse ? layers.slice().reverse() : layers;
      const colHeights = cols.map(
        c => c.reduce((s, n) => s + n.h, 0) + Math.max(0, c.length - 1) * rowGap
      );
      const compH = Math.max(80, ...colHeights);
      const centerY = cursorY + compH / 2;

      let curX = startX;
      cols.forEach((cNodes, idx) => {
        const ch = colHeights[idx];
        const colMaxW = Math.max(156, ...cNodes.map(n => n.w));
        let curY = centerY - ch / 2;
        cNodes.forEach(n => {
          n.x = snapVal(curX + (colMaxW - n.w) / 2);
          n.y = snapVal(curY);
          curY += n.h + rowGap;
        });
        curX += colMaxW + colGap;
      });

      cursorY += compH + compVGap;
    });
  }

  // 3. COMPACTO PLEGADO EQUILIBRADO
  function layoutCompactFolded(nodes, edges, opts) {
    const scale = densityScale(opts.density);
    const vGap = Math.round(52 * scale);
    const hGap = Math.round(48 * scale);
    const colChunkGap = Math.round(108 * scale);
    const maxRows = opts.maxRowsPerCol || 7;

    const comps = splitWeakComponents(nodes, edges);
    let cursorX = opts.originX || 108;
    const baseOriginY = opts.originY || 60;

    comps.forEach(compNodes => {
      const { layers } = computeDagLayers(compNodes, edges, opts.sortBy);
      const chunks = [];
      if (layers.length <= maxRows) {
        chunks.push(layers);
      } else {
        const nCols = Math.ceil(layers.length / maxRows);
        const perCol = Math.ceil(layers.length / nCols);
        for (let i = 0; i < layers.length; i += perCol) {
          chunks.push(layers.slice(i, i + perCol));
        }
      }

      chunks.forEach(chunk => {
        const widths = chunk.map(
          r => r.reduce((s, n) => s + n.w, 0) + Math.max(0, r.length - 1) * hGap
        );
        const colW = Math.max(170, ...widths);
        const cx = cursorX + colW / 2;
        let cy = baseOriginY;
        chunk.forEach((rNodes, i) => {
          const rw = widths[i];
          const rh = Math.max(54, ...rNodes.map(n => n.h));
          let x = cx - rw / 2;
          rNodes.forEach(n => {
            n.x = snapVal(x);
            n.y = snapVal(cy + (rh - n.h) / 2);
            x += n.w + hGap;
          });
          cy += rh + vGap;
        });
        cursorX += colW + colChunkGap;
      });
    });
  }

  // 4. SEPARACIÓN INTELIGENTE FLUJO ⇄ GRÁFICOS ⇄ PLANILLA FINANCIERA (con corredor limpio de flechas)
  function layoutDomainBridge(nodes, edges, opts) {
    const scale = densityScale(opts.density);
    const wfNodes = nodes.filter(n => !isFin(n) && !isChart(n));
    const chartNodes = nodes.filter(n => isChart(n));
    const finNodes = nodes.filter(n => isFin(n));

    // Si solo hay un tipo, usar vertical limpio o hoja excel
    if (finNodes.length > 0 && wfNodes.length === 0 && chartNodes.length === 0) {
      layoutExcelSheet(finNodes, edges, opts);
      return;
    }
    if (finNodes.length === 0 && chartNodes.length === 0) {
      layoutVerticalDag(wfNodes, edges, opts);
      return;
    }

    let cursorX = opts.originX || 96;
    const startY = opts.originY || 64;
    const zoneCorridor = Math.round(148 * scale); // Corredor amplio para cables puente sin cruces

    if (wfNodes.length > 0) {
      layoutVerticalDag(wfNodes, edges, { ...opts, originX: cursorX, originY: startY });
      const wfMaxX = Math.max(...wfNodes.map(n => n.x + n.w));
      cursorX = wfMaxX + zoneCorridor;
    }

    if (finNodes.length > 0) {
      layoutExcelSheet(finNodes, edges, { ...opts, originX: cursorX, originY: startY });
      const finMaxX = Math.max(...finNodes.map(n => n.x + n.w));
      cursorX = finMaxX + zoneCorridor;
    }

    if (chartNodes.length > 0) {
      // Colocar gráficos alineados en su propia columna limpia a la derecha sin invadir el flujo central
      let cy = startY;
      chartNodes.forEach(cn => {
        cn.x = snapVal(cursorX);
        cn.y = snapVal(cy);
        cy += cn.h + Math.round(52 * scale);
      });
    }
  }

  // 5 & 6. ÁRBOL JERÁRQUICO BALANCEADO (Abajo o Derecha)
  function layoutBalancedTree(nodes, edges, opts, horizontal = false) {
    const scale = densityScale(opts.density);
    const sibGap = Math.round((horizontal ? 38 : 46) * scale);
    const lvlGap = Math.round((horizontal ? 92 : 70) * scale);

    const { layers, children } = computeDagLayers(nodes, edges, opts.sortBy);
    const visited = new Set();
    const spanCache = new Map();

    const calcSubtreeSpan = id => {
      if (spanCache.has(id)) return spanCache.get(id);
      const n = nodes.find(x => x.id === id);
      const base = horizontal ? (n?.h || 64) : (n?.w || 176);
      const kids = (children.get(id) || []).filter(k => !visited.has(k));
      kids.forEach(k => visited.add(k));
      if (!kids.length) {
        spanCache.set(id, base);
        return base;
      }
      const sumKids = kids.reduce((s, k) => s + calcSubtreeSpan(k), 0) + (kids.length - 1) * sibGap;
      const res = Math.max(base, sumKids);
      spanCache.set(id, res);
      return res;
    };

    const roots = layers[0] || nodes.slice(0, 1);
    roots.forEach(r => visited.add(r.id));
    roots.forEach(r => calcSubtreeSpan(r.id));

    const placed = new Set();
    const placeSubtree = (id, breadthStart, depthCoord) => {
      if (placed.has(id)) return;
      placed.add(id);
      const n = nodes.find(x => x.id === id);
      if (!n) return;
      const span = spanCache.get(id) || (horizontal ? n.h : n.w);
      const center = breadthStart + span / 2;

      if (horizontal) {
        n.x = snapVal(depthCoord);
        n.y = snapVal(center - n.h / 2);
      } else {
        n.x = snapVal(center - n.w / 2);
        n.y = snapVal(depthCoord);
      }

      const kids = (children.get(id) || []).filter(k => !placed.has(k));
      if (!kids.length) return;
      const kidsTotal = kids.reduce((s, k) => s + (spanCache.get(k) || 160), 0) + (kids.length - 1) * sibGap;
      let kCursor = center - kidsTotal / 2;
      const nextDepth = depthCoord + (horizontal ? n.w : n.h) + lvlGap;
      kids.forEach(k => {
        placeSubtree(k, kCursor, nextDepth);
        kCursor += (spanCache.get(k) || 160) + sibGap;
      });
    };

    let bCursor = horizontal ? (opts.originY || 64) : (opts.originX || 96);
    const dStart = horizontal ? (opts.originX || 96) : (opts.originY || 64);
    roots.forEach(r => {
      placeSubtree(r.id, bCursor, dStart);
      bCursor += (spanCache.get(r.id) || 200) + sibGap * 1.6;
    });

    // Colocar cualquier nodo desconectado restante
    nodes.forEach(n => {
      if (!placed.has(n.id)) {
        if (horizontal) {
          n.x = snapVal(dStart);
          n.y = snapVal(bCursor);
          bCursor += n.h + sibGap;
        } else {
          n.x = snapVal(bCursor);
          n.y = snapVal(dStart);
          bCursor += n.w + sibGap;
        }
      }
    });
  }

  // 7. CARRILES / SWIMLANES POR ROL O TIPO DE NODO
  function layoutSwimlanesByType(nodes, edges, opts) {
    const scale = densityScale(opts.density);
    const laneGap = Math.round(76 * scale);
    const itemGap = Math.round(46 * scale);

    const buckets = [
      { key: 'entry', match: n => n.type === 'start' || n.type === 'io' || n.type === 'hook' },
      { key: 'logic', match: n => n.type === 'process' || n.type === 'parallel' || n.type === 'loop' || n.type === 'sub' || n.type === 'delay' || n.type === 'varset' },
      { key: 'decision', match: n => n.type === 'decision' || n.type === 'tryc' || n.type === 'err' },
      { key: 'data_ai', match: n => n.type === 'db' || n.type === 'api' || n.type === 'ai' || n.type === 'human' },
      { key: 'finance', match: n => isFin(n) },
      { key: 'closing', match: n => isChart(n) || n.type === 'end' || n.type === 'note' }
    ];

    const { rank } = computeDagLayers(nodes, edges, opts.sortBy);
    let curX = opts.originX || 96;
    const startY = opts.originY || 64;

    const assigned = new Set();
    buckets.forEach(b => {
      const group = nodes
        .filter(n => !assigned.has(n.id) && b.match(n))
        .sort((a, c) => (rank.get(a.id) || 0) - (rank.get(c.id) || 0));
      if (!group.length) return;
      group.forEach(n => assigned.add(n.id));

      const laneW = Math.max(176, ...group.map(n => n.w));
      let curY = startY;
      group.forEach(n => {
        n.x = snapVal(curX + (laneW - n.w) / 2);
        n.y = snapVal(curY);
        curY += n.h + itemGap;
      });
      curX += laneW + laneGap;
    });

    const leftovers = nodes.filter(n => !assigned.has(n.id));
    if (leftovers.length) {
      let curY = startY;
      leftovers.forEach(n => {
        n.x = snapVal(curX);
        n.y = snapVal(curY);
        curY += n.h + itemGap;
      });
    }
  }

  // 8. TABLERO KANBAN POR ESTADO
  function layoutKanbanByStatus(nodes, edges, opts) {
    const scale = densityScale(opts.density);
    const colGap = Math.round(84 * scale);
    const cardGap = Math.round(38 * scale);

    const statusOrder = ['pending', 'progress', 'done', 'error'];
    const { rank } = computeDagLayers(nodes, edges, opts.sortBy);

    let curX = opts.originX || 96;
    const startY = opts.originY || 64;

    statusOrder.forEach(st => {
      const colNodes = nodes
        .filter(n => (n.status || 'pending') === st)
        .sort((a, b) => (rank.get(a.id) || 0) - (rank.get(b.id) || 0));
      if (!colNodes.length) return;
      const colW = Math.max(184, ...colNodes.map(n => n.w));
      let curY = startY;
      colNodes.forEach(n => {
        n.x = snapVal(curX + (colW - n.w) / 2);
        n.y = snapVal(curY);
        curY += n.h + cardGap;
      });
      curX += colW + colGap;
    });
  }

  // 9. HOJA DE CÁLCULO EXCEL (Alinea por coordenadas A1, B1, C2... o niveles DAG)
  function layoutExcelSheet(nodes, edges, opts) {
    const scale = densityScale(opts.density);
    const colW = Math.round(268 * scale);
    const rowH = Math.round(136 * scale);
    const startX = opts.originX || 96;
    const startY = opts.originY || 68;

    const hasCellRefs = nodes.some(n => /^[A-Z]{1,2}\d{1,2}$/i.test(n.params?.cellRef || ''));
    if (!hasCellRefs) {
      layoutHorizontalDag(nodes, edges, opts);
      return;
    }

    const parsed = nodes.map((n, idx) => {
      const m = String(n.params?.cellRef || '').toUpperCase().match(/^([A-Z])(\d{1,2})$/);
      const colIdx = m ? m[1].charCodeAt(0) - 65 : idx % 4;
      const rowIdx = m ? Math.max(0, parseInt(m[2], 10) - 1) : Math.floor(idx / 4);
      return { n, colIdx, rowIdx };
    });

    // Comprimir columnas y filas vacías para que no queden huecos enormes si usan A1 y F1
    const uniqCols = Array.from(new Set(parsed.map(p => p.colIdx))).sort((a, b) => a - b);
    const uniqRows = Array.from(new Set(parsed.map(p => p.rowIdx))).sort((a, b) => a - b);
    const colMap = new Map(uniqCols.map((c, i) => [c, i]));
    const rowMap = new Map(uniqRows.map((r, i) => [r, i]));

    parsed.forEach(p => {
      const c = colMap.get(p.colIdx) || 0;
      const r = rowMap.get(p.rowIdx) || 0;
      p.n.x = snapVal(startX + c * colW);
      p.n.y = snapVal(startY + r * rowH);
    });
  }

  // 10. CUADRÍCULA / MATRIZ UNIFORME N×M
  function layoutGridMatrix(nodes, edges, opts) {
    const scale = densityScale(opts.density);
    const { layers } = computeDagLayers(nodes, edges, opts.sortBy);
    const ordered = opts.reverse ? layers.flat().reverse() : layers.flat();
    const cols = opts.columns && opts.columns >= 1 ? opts.columns : Math.max(2, Math.ceil(Math.sqrt(ordered.length)));

    const cellW = Math.max(190, ...ordered.map(n => n.w)) + Math.round(54 * scale);
    const cellH = Math.max(76, ...ordered.map(n => n.h)) + Math.round(48 * scale);
    const startX = opts.originX || 96;
    const startY = opts.originY || 64;

    ordered.forEach((n, idx) => {
      const c = idx % cols;
      const r = Math.floor(idx / cols);
      n.x = snapVal(startX + c * cellW);
      n.y = snapVal(startY + r * cellH);
    });
  }

  // 11. SERPENTINA / ZIG-ZAG CONTINUO EN "S"
  function layoutSerpentine(nodes, edges, opts) {
    const scale = densityScale(opts.density);
    const { layers } = computeDagLayers(nodes, edges, opts.sortBy);
    const ordered = layers.flat();
    const cols = opts.columns && opts.columns >= 2 ? opts.columns : Math.min(5, Math.max(3, Math.ceil(Math.sqrt(ordered.length))));

    const cellW = Math.max(196, ...ordered.map(n => n.w)) + Math.round(58 * scale);
    const cellH = Math.max(82, ...ordered.map(n => n.h)) + Math.round(58 * scale);
    const startX = opts.originX || 96;
    const startY = opts.originY || 64;

    ordered.forEach((n, idx) => {
      const r = Math.floor(idx / cols);
      const rawC = idx % cols;
      const c = r % 2 === 0 ? rawC : cols - 1 - rawC;
      n.x = snapVal(startX + c * cellW);
      n.y = snapVal(startY + r * cellH);
    });
  }

  // 12. ANILLOS CONCÉNTRICOS RADIALES
  function layoutRadialRings(nodes, edges, opts) {
    const scale = densityScale(opts.density);
    const { layers } = computeDagLayers(nodes, edges, opts.sortBy);
    const ringStep = Math.round(215 * scale);
    const totalR = Math.max(1, layers.length - 1) * ringStep;
    const cx = (opts.originX || 120) + totalR + 140;
    const cy = (opts.originY || 80) + totalR + 110;

    layers.forEach((layer, rIdx) => {
      if (rIdx === 0 && layer.length === 1) {
        layer[0].x = snapVal(cx - layer[0].w / 2);
        layer[0].y = snapVal(cy - layer[0].h / 2);
        return;
      }
      const radius = Math.max(rIdx === 0 ? 120 : rIdx * ringStep, (layer.length * 210) / (2 * Math.PI));
      layer.forEach((n, idx) => {
        const angle = -Math.PI / 2 + (2 * Math.PI * idx) / layer.length;
        n.x = snapVal(cx + Math.cos(angle) * radius - n.w / 2);
        n.y = snapVal(cy + Math.sin(angle) * radius - n.h / 2);
      });
    });
  }

  // 13. CÍRCULO TOPOLÓGICO
  function layoutCircular(nodes, edges, opts) {
    const scale = densityScale(opts.density);
    const { layers } = computeDagLayers(nodes, edges, opts.sortBy);
    const ordered = layers.flat();
    const count = ordered.length;
    const radius = Math.max(180, Math.round(((count * 215) / (2 * Math.PI)) * scale));
    const cx = (opts.originX || 120) + radius + 120;
    const cy = (opts.originY || 80) + radius + 90;

    ordered.forEach((n, idx) => {
      const angle = -Math.PI / 2 + (2 * Math.PI * idx) / Math.max(1, count);
      n.x = snapVal(cx + Math.cos(angle) * radius - n.w / 2);
      n.y = snapVal(cy + Math.sin(angle) * radius - n.h / 2);
    });
  }

  // 14. ESTRELLA / HUBS Y SATÉLITES
  function layoutHubSpoke(nodes, edges, opts) {
    const scale = densityScale(opts.density);
    const idSet = new Set(nodes.map(n => n.id));
    const adj = new Map(nodes.map(n => [n.id, []]));
    (edges || []).forEach(e => {
      if (e && idSet.has(e.from) && idSet.has(e.to) && e.from !== e.to) {
        adj.get(e.from).push(e.to);
        adj.get(e.to).push(e.from);
      }
    });

    const sortedByDeg = nodes.slice().sort((a, b) => (adj.get(b.id)?.length || 0) - (adj.get(a.id)?.length || 0));
    const placed = new Set();
    let clusterX = (opts.originX || 120) + 260;
    const clusterY = (opts.originY || 80) + 250;

    sortedByDeg.forEach(hub => {
      if (placed.has(hub.id)) return;
      placed.add(hub.id);
      const sats = (adj.get(hub.id) || [])
        .map(id => nodes.find(x => x.id === id))
        .filter(x => x && !placed.has(x.id));
      sats.forEach(s => placed.add(s.id));

      hub.x = snapVal(clusterX - hub.w / 2);
      hub.y = snapVal(clusterY - hub.h / 2);

      const satR = Math.max(195, sats.length * 42) * scale;
      sats.forEach((s, idx) => {
        const ang = -Math.PI / 2 + (2 * Math.PI * idx) / Math.max(1, sats.length);
        s.x = snapVal(clusterX + Math.cos(ang) * satR - s.w / 2);
        s.y = snapVal(clusterY + Math.sin(ang) * satR - s.h / 2);
      });

      clusterX += (sats.length ? satR * 2.25 : 260) + 90;
    });
  }

  // 15. CASCADA DIAGONAL / ESCALERA PROGRESIVA
  function layoutCascadeDiagonal(nodes, edges, opts) {
    const scale = densityScale(opts.density);
    const { layers } = computeDagLayers(nodes, edges, opts.sortBy);
    const stepX = Math.round(135 * scale);
    const stepY = Math.round(92 * scale);
    let curX = opts.originX || 96;
    let curY = opts.originY || 60;

    layers.forEach(layer => {
      let branchOffsetY = 0;
      layer.forEach(n => {
        n.x = snapVal(curX);
        n.y = snapVal(curY + branchOffsetY);
        branchOffsetY += n.h + Math.round(32 * scale);
      });
      curX += stepX;
      curY += stepY;
    });
  }

  // 16. ORGÁNICO EQUILIBRADO (Simulación determinista resorte-repulsión)
  function layoutOrganicForce(nodes, edges, opts) {
    const scale = densityScale(opts.density);
    // Semilla inicial circular limpia para convergencia determinista y estética
    layoutCircular(nodes, edges, opts);
    if (nodes.length < 3) return;

    const idSet = new Set(nodes.map(n => n.id));
    const validEdges = (edges || []).filter(e => e && idSet.has(e.from) && idSet.has(e.to) && e.from !== e.to);
    const nodeMap = new Map(nodes.map(n => [n.id, n]));
    const idealLen = 235 * scale;

    for (let iter = 0; iter < 48; iter++) {
      const disp = new Map(nodes.map(n => [n.id, { dx: 0, dy: 0 }]));
      // Repulsión entre pares
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i];
          const b = nodes[j];
          const vx = (a.x + a.w / 2) - (b.x + b.w / 2) || 1;
          const vy = (a.y + a.h / 2) - (b.y + b.h / 2) || 1;
          const dist = Math.max(40, Math.hypot(vx, vy));
          const rep = (idealLen * idealLen * 1.15) / dist;
          const fx = (vx / dist) * rep;
          const fy = (vy / dist) * rep;
          disp.get(a.id).dx += fx;
          disp.get(a.id).dy += fy;
          disp.get(b.id).dx -= fx;
          disp.get(b.id).dy -= fy;
        }
      }
      // Atracción por aristas
      validEdges.forEach(e => {
        const a = nodeMap.get(e.from);
        const b = nodeMap.get(e.to);
        const vx = (b.x + b.w / 2) - (a.x + a.w / 2);
        const vy = (b.y + b.h / 2) - (a.y + a.h / 2);
        const dist = Math.max(20, Math.hypot(vx, vy));
        const att = (dist * dist) / idealLen;
        const fx = (vx / dist) * att * 0.45;
        const fy = (vy / dist) * att * 0.45;
        disp.get(a.id).dx += fx;
        disp.get(a.id).dy += fy;
        disp.get(b.id).dx -= fx;
        disp.get(b.id).dy -= fy;
      });

      const temp = Math.max(8, 65 * (1 - iter / 50));
      nodes.forEach(n => {
        const d = disp.get(n.id);
        const mag = Math.max(1, Math.hypot(d.dx, d.dy));
        n.x += (d.dx / mag) * Math.min(mag, temp);
        n.y += (d.dy / mag) * Math.min(mag, temp);
      });
    }

    const minX = Math.min(...nodes.map(n => n.x));
    const minY = Math.min(...nodes.map(n => n.y));
    const shiftX = (opts.originX || 96) - minX;
    const shiftY = (opts.originY || 64) - minY;
    nodes.forEach(n => {
      n.x = snapVal(n.x + shiftX);
      n.y = snapVal(n.y + shiftY);
    });
  }

  /**
   * Ejecuta cualquiera de las 16 arquitecturas + modificadores paramétricos sobre targetNodes.
   */
  function applyParametricGraphLayout(targetNodes, edgesPool, rawOptions = {}) {
    if (!Array.isArray(targetNodes) || targetNodes.length === 0) {
      return { mode: 'vertical', label: 'Vertical', bounds: { minX: 0, minY: 0, maxX: 0, maxY: 0 } };
    }

    targetNodes.forEach(measureNodeSafe);

    // Selección automática inteligente si mode === 'auto':
    // Si conviven nodos de flujo y finanzas o gráficos, usar separación limpia Flujo ⇄ Finanzas
    let mode = rawOptions.mode || 'auto';
    if (mode === 'auto') {
      const hasFin = targetNodes.some(isFin);
      const hasWf = targetNodes.some(n => !isFin(n) && !isChart(n));
      const hasCharts = targetNodes.some(isChart);
      if ((hasFin && hasWf) || (hasCharts && targetNodes.length > 10)) {
        mode = 'domain_bridge';
      } else if (hasFin && !hasWf) {
        mode = 'excel_sheet';
      } else {
        mode = 'compact';
      }
    }

    const opts = {
      density: rawOptions.density || 'normal',
      columns: rawOptions.columns || null,
      reverse: Boolean(rawOptions.reverse),
      sortBy: rawOptions.sortBy || 'topological',
      align: rawOptions.align || 'center',
      originX: typeof rawOptions.originX === 'number' ? rawOptions.originX : 96,
      originY: typeof rawOptions.originY === 'number' ? rawOptions.originY : 64,
      maxRowsPerCol: rawOptions.maxRowsPerCol || 7
    };

    switch (mode) {
      case 'vertical':
        layoutVerticalDag(targetNodes, edgesPool, opts);
        break;
      case 'horizontal':
      case 'timeline':
        layoutHorizontalDag(targetNodes, edgesPool, opts);
        break;
      case 'domain_bridge':
        layoutDomainBridge(targetNodes, edgesPool, opts);
        break;
      case 'tree_down':
      case 'tree':
        layoutBalancedTree(targetNodes, edgesPool, opts, false);
        break;
      case 'tree_right':
        layoutBalancedTree(targetNodes, edgesPool, opts, true);
        break;
      case 'swimlanes_type':
      case 'swimlanes':
        layoutSwimlanesByType(targetNodes, edgesPool, opts);
        break;
      case 'kanban_status':
      case 'kanban':
        layoutKanbanByStatus(targetNodes, edgesPool, opts);
        break;
      case 'excel_sheet':
        layoutExcelSheet(targetNodes, edgesPool, opts);
        break;
      case 'grid_matrix':
      case 'grid':
        layoutGridMatrix(targetNodes, edgesPool, opts);
        break;
      case 'snake_serpentine':
      case 'serpentine':
        layoutSerpentine(targetNodes, edgesPool, opts);
        break;
      case 'radial_rings':
      case 'radial':
        layoutRadialRings(targetNodes, edgesPool, opts);
        break;
      case 'circular':
        layoutCircular(targetNodes, edgesPool, opts);
        break;
      case 'hub_spoke':
      case 'star':
        layoutHubSpoke(targetNodes, edgesPool, opts);
        break;
      case 'cascade_diagonal':
      case 'cascade':
        layoutCascadeDiagonal(targetNodes, edgesPool, opts);
        break;
      case 'organic_force':
      case 'organic':
        layoutOrganicForce(targetNodes, edgesPool, opts);
        break;
      case 'compact':
      default:
        layoutCompactFolded(targetNodes, edgesPool, opts);
        break;
    }

    const minGap = Math.round(24 * densityScale(opts.density));
    resolveAllOverlaps(targetNodes, Math.max(16, minGap));

    const presetMeta = LAYOUT_PRESETS.find(p => p.id === mode);
    const baseLabel = presetMeta ? presetMeta.label : mode;
    const modTags = [];
    if (opts.columns) modTags.push(`${opts.columns} col`);
    if (opts.density && opts.density !== 'normal') modTags.push(opts.density);
    if (opts.reverse) modTags.push('invertido');
    const description = modTags.length ? `${baseLabel} (${modTags.join(', ')})` : baseLabel;

    const minX = Math.min(...targetNodes.map(n => n.x));
    const minY = Math.min(...targetNodes.map(n => n.y));
    const maxX = Math.max(...targetNodes.map(n => n.x + n.w));
    const maxY = Math.max(...targetNodes.map(n => n.y + n.h));

    return {
      mode,
      density: opts.density,
      label: baseLabel,
      description,
      options: opts,
      minX,
      minY,
      maxX,
      maxY,
      bounds: { minX, minY, maxX, maxY }
    };
  }

  // =========================================================================
  // INTÉRPRETE DE LENGUAJE NATURAL PARA CUALQUIER FORMA DE ORDENAR EL LIENZO
  // =========================================================================
  function parseNaturalLayoutIntent(rawText) {
    const s = plainText(rawText);
    if (!s) return { matched: false };

    // No secuestrar si el usuario pide explícitamente CREAR un flujo nuevo desde cero
    if (/\b(crea un|genera un|arma un|construye un|haz un flujo de|haz una planilla de|lee este|analiza este documento|a partir de la imagen)\b/i.test(s) && !/\b(y ordena\w*|y organiza\w*)\b/i.test(s)) {
      return { matched: false };
    }

    const hasLayoutVerb =
      /\b(ordena\w*|organiza\w*|reordena\w*|reorganiza\w*|acomoda\w*|alinea\w*|distribuy\w*|compacta\w*|junta\w*|separa\w*|espacia\w*|agrupa\w*|endereza\w*|desenreda\w*|limpia las flechas|arregla las flechas|arregla el orden|ponlo\w*|ponlos|colocalo\w*|colocalos|cambialo a|pasalo a|en forma|de forma|modo vertical|modo horizontal)\b/i.test(
        s
      );

    const hasExplicitGeometry =
      /\b(vertical\w*|horizontal\w*|arriba hacia abajo|arriba a abajo|izquierda a derecha|derecha a izquierda|abajo hacia arriba|en cascada|en arbol|dendrograma|swimlane\w*|carril\w*|kanban|por estado\w*|por tipo\w*|cuadricula|grilla|matriz|serpentina|zig\s*zag|radial\w*|concentric\w*|circul\w*|anillo|estrella|hub\w*|escalera|diagonal|organico|en \d+\s*columnas?|una sola columna|hoja excel)\b/i.test(
        s
      );

    if (!hasLayoutVerb && !(hasExplicitGeometry && s.split(' ').length <= 8)) {
      return { matched: false };
    }

    let mode = 'auto';
    let columns = null;
    let density = 'normal';
    let reverse = false;
    let sortBy = 'topological';
    let align = 'center';

    // Detectar número explícito de columnas ("en 1 columna", "en 4 columnas", "una sola columna")
    if (/\b(una sola columna|una columna|1 columna|fila unica vertical)\b/.test(s)) {
      mode = 'vertical';
      columns = 1;
    } else {
      const colMatch = s.match(/\ben\s+(\d{1,2})\s+columnas?\b/);
      if (colMatch) {
        columns = Math.max(1, Math.min(12, parseInt(colMatch[1], 10)));
        mode = columns === 1 ? 'vertical' : 'grid_matrix';
      }
    }

    // Detectar topología principal
    if (/\b(flujo y finanza\w*|finanza\w* y flujo|separ\w* finanza\w*|por dominio\w*|puente\w*)\b/.test(s)) {
      mode = 'domain_bridge';
    } else if (/\b(arbol lateral|dendrograma|arbol horizontal|arbol a la derecha)\b/.test(s)) {
      mode = 'tree_right';
    } else if (/\b(arbol|jerarquic\w*)\b/.test(s)) {
      mode = 'tree_down';
    } else if (/\b(kanban|por estado\w*|pendientes y hechos)\b/.test(s)) {
      mode = 'kanban_status';
    } else if (/\b(carril\w*|swimlane\w*|por tipo\w*|por rol\w*|por categoria\w*)\b/.test(s)) {
      mode = 'swimlanes_type';
    } else if (/\b(excel|coordenada\w*|celda\w* a1|planilla)\b/.test(s) && hasLayoutVerb) {
      mode = 'excel_sheet';
    } else if (/\b(serpentina|zig\s*zag|culebra|en ese)\b/.test(s)) {
      mode = 'snake_serpentine';
    } else if (/\b(radial\w*|concentric\w*|desde el centro)\b/.test(s)) {
      mode = 'radial_rings';
    } else if (/\b(circul\w*|redondo|anillo|rueda)\b/.test(s)) {
      mode = 'circular';
    } else if (/\b(estrella|satelite\w*|hub\w*|nodos centrales)\b/.test(s)) {
      mode = 'hub_spoke';
    } else if (/\b(diagonal\w*|escalera)\b/.test(s)) {
      mode = 'cascade_diagonal';
    } else if (/\b(organic\w*|fuerza\w*|elastico|natural)\b/.test(s)) {
      mode = 'organic_force';
    } else if (/\b(cuadricula|grilla|matriz|mosaico|tabla)\b/.test(s)) {
      mode = 'grid_matrix';
    } else if (/\b(horizontal\w*|izquierda a derecha|derecha a izquierda|linea de tiempo|timeline|lateral|en fila)\b/.test(s)) {
      mode = 'horizontal';
    } else if (/\b(vertical\w*|arriba hacia abajo|arriba a abajo|abajo hacia arriba|hacia abajo|cascada)\b/.test(s)) {
      mode = 'vertical';
    } else if (/\b(compact\w*|plegad\w*)\b/.test(s)) {
      mode = 'compact';
    }

    // Modificadores de densidad / aire
    if (/\b(muy junto\w*|pegad\w*|super compact\w*|minimo espacio)\b/.test(s)) {
      density = 'tight';
    } else if (/\b(junto\w*|compact\w*|cerca)\b/.test(s)) {
      density = 'compact';
    } else if (/\b(muy separad\w*|mucho aire|doble espacio|muy amplio)\b/.test(s)) {
      density = 'wide';
    } else if (/\b(separad\w*|amplio\w*|mas espacio|con aire|espaciad\w*|despejad\w*)\b/.test(s)) {
      density = 'airy';
    }

    // Modificadores de inversión y alineación
    if (/\b(abajo hacia arriba|derecha a izquierda|invertid\w*|al reves)\b/.test(s)) {
      reverse = true;
    }
    if (/\b(alfabetic\w*|por nombre)\b/.test(s)) sortBy = 'alpha';
    else if (/\b(por estado)\b/.test(s) && mode !== 'kanban_status') sortBy = 'status';
    else if (/\b(por tipo)\b/.test(s) && mode !== 'swimlanes_type') sortBy = 'type';

    if (/\b(alinead\w* a la izquierda)\b/.test(s)) align = 'start';
    else if (/\b(alinead\w* a la derecha)\b/.test(s)) align = 'end';

    const preset = LAYOUT_PRESETS.find(p => p.id === mode);
    const label = preset ? preset.label : 'Organización inteligente';
    const extraMods = [];
    if (columns) extraMods.push(`${columns} col`);
    if (density && density !== 'normal') extraMods.push(density);
    if (reverse) extraMods.push('invertido');
    const description = extraMods.length ? `${label} (${extraMods.join(', ')})` : label;

    return {
      matched: true,
      mode,
      columns,
      density,
      reverse,
      sortBy,
      align,
      label,
      description,
      humanLabel: label,
      options: { mode, columns, density, reverse, sortBy, align }
    };
  }

  window.FLOWLAB_LAYOUT_PRESETS = LAYOUT_PRESETS;
  window.applyParametricGraphLayout = applyParametricGraphLayout;
  window.parseNaturalLayoutIntent = parseNaturalLayoutIntent;
})();
