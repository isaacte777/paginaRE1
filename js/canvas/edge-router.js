// EDGE ROUTER: Enrutador ortogonal inteligente sin solapamientos, con evasión de nodos,
// separación de carriles paralelos, puentes de cruce (line-jumps) y distinción Flujo ⇄ Finanzas.

(function () {
  const STUB_LEN = 18;
  const OBS_PAD = 12;
  const TRACK_SPACING = 10;
  const CORNER_RADIUS = 7;
  const BRIDGE_RADIUS = 4.8;

  function isFinNode(n) {
    return Boolean(n && typeof isFinanceNodeType === 'function' && isFinanceNodeType(n.type));
  }

  function classifyEdgeDomain(nf, nt, edge) {
    if (edge && edge.kind === 'error') return 'error';
    const fFin = isFinNode(nf);
    const tFin = isFinNode(nt);
    if (fFin && tFin) return 'finance';
    if (fFin !== tFin) return 'bridge';
    return 'workflow';
  }

  function isNegativeBranchLabel(label, nt) {
    const s = String(label || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
    if (/\b(no|error|fallo|rechaz|inval|false|excepc|cancel)\b/.test(s)) return true;
    if (nt && (nt.type === 'err' || nt.type === 'tryc')) return true;
    return false;
  }

  function getRect(n, pad = 0) {
    const w = Number(n.w) || 160;
    const h = Number(n.h) || 60;
    return {
      left: n.x - pad,
      right: n.x + w + pad,
      top: n.y - pad,
      bottom: n.y + h + pad,
      cx: n.x + w / 2,
      cy: n.y + h / 2,
      w,
      h
    };
  }

  // Decide qué lados (top/bottom/left/right) conectan de forma más limpia cada arista
  function chooseNaturalSides(e, nf, nt) {
    const rf = getRect(nf);
    const rt = getRect(nt);
    const dx = rt.cx - rf.cx;
    const dy = rt.cy - rf.cy;

    const vGapDown = rt.top - rf.bottom;
    const vGapUp = rf.top - rt.bottom;
    const hGapRight = rt.left - rf.right;
    const hGapLeft = rf.left - rt.right;

    const domainKind = classifyEdgeDomain(nf, nt, e);

    // Puentes entre flujo y finanzas separados horizontalmente: priorizar salida/entrada lateral limpia
    if (domainKind === 'bridge' && (hGapRight > 28 || hGapLeft > 28)) {
      return dx >= 0
        ? { sourceSide: 'right', targetSide: 'left', isBackEdge: false }
        : { sourceSide: 'left', targetSide: 'right', isBackEdge: false };
    }

    // Ramas laterales Sí/No desde rombos de decisión cuando el hijo está desplazado a un lado
    if (nf.type === 'decision' && vGapDown >= -10) {
      if (dx > rf.w * 0.55 && isNegativeBranchLabel(e.label, nt)) {
        return { sourceSide: 'right', targetSide: vGapDown > 16 ? 'top' : 'left', isBackEdge: false };
      }
      if (dx < -rf.w * 0.55 && isNegativeBranchLabel(e.label, nt)) {
        return { sourceSide: 'left', targetSide: vGapDown > 16 ? 'top' : 'right', isBackEdge: false };
      }
    }

    // Destino claramente debajo del origen -> flujo vertical limpio (bottom -> top)
    if (vGapDown >= 14 && Math.abs(dx) <= Math.max(360, vGapDown * 2.4)) {
      return { sourceSide: 'bottom', targetSide: 'top', isBackEdge: false };
    }

    // Destino claramente a la derecha o izquierda en la misma banda -> flujo horizontal (right -> left)
    if (hGapRight >= 16 && Math.abs(dy) <= Math.max(220, hGapRight * 1.65)) {
      return { sourceSide: 'right', targetSide: 'left', isBackEdge: false };
    }
    if (hGapLeft >= 16 && Math.abs(dy) <= Math.max(220, hGapLeft * 1.65)) {
      return { sourceSide: 'left', targetSide: 'right', isBackEdge: false };
    }

    // Arista de retorno / bucle hacia arriba: rodear por el costado exterior para no cruzar nodos intermedios
    if (vGapUp >= 16) {
      const side = dx >= 0 ? 'right' : 'left';
      if (Math.abs(dx) < 110) {
        return { sourceSide: side, targetSide: side, isBackEdge: true };
      }
      return {
        sourceSide: dx >= 0 ? 'right' : 'left',
        targetSide: dx >= 0 ? 'left' : 'right',
        isBackEdge: true
      };
    }

    // Caso general diagonal lejano
    if (Math.abs(dx) > Math.abs(dy) * 1.25) {
      return dx >= 0
        ? { sourceSide: 'right', targetSide: 'left', isBackEdge: false }
        : { sourceSide: 'left', targetSide: 'right', isBackEdge: false };
    }
    return dy >= 0
      ? { sourceSide: 'bottom', targetSide: 'top', isBackEdge: false }
      : { sourceSide: 'top', targetSide: 'bottom', isBackEdge: true };
  }

  function hSegHitsBox(y, x1, x2, box) {
    const minX = Math.min(x1, x2);
    const maxX = Math.max(x1, x2);
    if (maxX <= box.left || minX >= box.right) return false;
    return y > box.top && y < box.bottom;
  }

  function vSegHitsBox(x, y1, y2, box) {
    const minY = Math.min(y1, y2);
    const maxY = Math.max(y1, y2);
    if (maxY <= box.top || minY >= box.bottom) return false;
    return x > box.left && x < box.right;
  }

  function countHCollisions(y, x1, x2, obstacles) {
    let hits = 0;
    for (let i = 0; i < obstacles.length; i++) {
      if (hSegHitsBox(y, x1, x2, obstacles[i])) hits++;
    }
    return hits;
  }

  function countVCollisions(x, y1, y2, obstacles) {
    let hits = 0;
    for (let i = 0; i < obstacles.length; i++) {
      if (vSegHitsBox(x, y1, y2, obstacles[i])) hits++;
    }
    return hits;
  }

  function findBestHorizontalCorridor(idealY, minYBound, maxYBound, x1, x2, obstacles) {
    if (countHCollisions(idealY, x1, x2, obstacles) === 0) return idealY;

    const candidates = [idealY];
    const spanMinX = Math.min(x1, x2) - 8;
    const spanMaxX = Math.max(x1, x2) + 8;

    obstacles.forEach(ob => {
      if (ob.right >= spanMinX && ob.left <= spanMaxX) {
        candidates.push(ob.top - 14);
        candidates.push(ob.bottom + 14);
      }
    });

    for (let step = 22; step <= 180; step += 26) {
      candidates.push(idealY - step, idealY + step);
    }

    let bestY = idealY;
    let bestScore = Infinity;

    candidates.forEach(candY => {
      const hits = countHCollisions(candY, x1, x2, obstacles);
      const outPenalty =
        candY < minYBound ? (minYBound - candY) * 1.4 : candY > maxYBound ? (candY - maxYBound) * 1.4 : 0;
      const distPenalty = Math.abs(candY - idealY) * 0.35;
      const score = hits * 5000 + outPenalty + distPenalty;
      if (score < bestScore) {
        bestScore = score;
        bestY = candY;
      }
    });

    return Math.round(bestY);
  }

  function findBestVerticalCorridor(idealX, minXBound, maxXBound, y1, y2, obstacles) {
    if (countVCollisions(idealX, y1, y2, obstacles) === 0) return idealX;

    const candidates = [idealX];
    const spanMinY = Math.min(y1, y2) - 8;
    const spanMaxY = Math.max(y1, y2) + 8;

    obstacles.forEach(ob => {
      if (ob.bottom >= spanMinY && ob.top <= spanMaxY) {
        candidates.push(ob.left - 14);
        candidates.push(ob.right + 14);
      }
    });

    for (let step = 24; step <= 200; step += 28) {
      candidates.push(idealX - step, idealX + step);
    }

    let bestX = idealX;
    let bestScore = Infinity;

    candidates.forEach(candX => {
      const hits = countVCollisions(candX, y1, y2, obstacles);
      const outPenalty =
        candX < minXBound ? (minXBound - candX) * 1.4 : candX > maxXBound ? (candX - maxXBound) * 1.4 : 0;
      const distPenalty = Math.abs(candX - idealX) * 0.35;
      const score = hits * 5000 + outPenalty + distPenalty;
      if (score < bestScore) {
        bestScore = score;
        bestX = candX;
      }
    });

    return Math.round(bestX);
  }

  function stepOutFromAnchor(pt, dist = STUB_LEN) {
    if (pt.side === 'top') return { x: pt.x, y: pt.y - dist };
    if (pt.side === 'bottom') return { x: pt.x, y: pt.y + dist };
    if (pt.side === 'left') return { x: pt.x - dist, y: pt.y };
    return { x: pt.x + dist, y: pt.y };
  }

  function simplifyOrthogonalPoints(pts) {
    if (pts.length <= 2) return pts.slice();
    const cleaned = [pts[0]];
    for (let i = 1; i < pts.length; i++) {
      const prev = cleaned[cleaned.length - 1];
      const cur = pts[i];
      if (Math.hypot(cur.x - prev.x, cur.y - prev.y) < 0.8) continue;
      cleaned.push({ x: cur.x, y: cur.y });
    }
    if (cleaned.length <= 2) return cleaned;

    const result = [cleaned[0]];
    for (let i = 1; i < cleaned.length - 1; i++) {
      const a = result[result.length - 1];
      const b = cleaned[i];
      const c = cleaned[i + 1];
      const collinearX = Math.abs(a.x - b.x) < 0.8 && Math.abs(b.x - c.x) < 0.8;
      const collinearY = Math.abs(a.y - b.y) < 0.8 && Math.abs(b.y - c.y) < 0.8;
      if (collinearX || collinearY) continue;
      result.push(b);
    }
    result.push(cleaned[cleaned.length - 1]);
    return result;
  }

  // Construye la polilínea ortogonal base evitando atravesar nodos intermedios
  function buildObstacleAwareWaypoints(p1, p2, nf, nt, allObstacleMap) {
    const obstacles = [];
    allObstacleMap.forEach((box, id) => {
      if (id !== nf.id && id !== nt.id) obstacles.push(box);
    });

    const boxF = allObstacleMap.get(nf.id);
    const boxT = allObstacleMap.get(nt.id);

    const s1 = stepOutFromAnchor(p1, STUB_LEN);
    const s2 = stepOutFromAnchor(p2, STUB_LEN);

    const isVertStart = p1.side === 'top' || p1.side === 'bottom';
    const isVertEnd = p2.side === 'top' || p2.side === 'bottom';

    // Caso 1: Mismo lado lateral para bucles de retorno limpios (right->right o left->left)
    if (!isVertStart && p1.side === p2.side) {
      const dir = p1.side === 'right' ? 1 : -1;
      let outerX = dir > 0 ? Math.max(s1.x, s2.x) + 18 : Math.min(s1.x, s2.x) - 18;
      outerX = findBestVerticalCorridor(
        outerX,
        Math.min(s1.x, s2.x) - 220,
        Math.max(s1.x, s2.x) + 220,
        s1.y,
        s2.y,
        obstacles
      );
      return simplifyOrthogonalPoints([
        { x: p1.x, y: p1.y },
        { x: outerX, y: p1.y },
        { x: outerX, y: p2.y },
        { x: p2.x, y: p2.y }
      ]);
    }

    // Caso 2: L-bend perpendicular (ej. decisión sale por right y entra por top)
    if (isVertStart !== isVertEnd) {
      if (!isVertStart && isVertEnd) {
        // Horizontal primero -> Vertical después: esquina (p2.x, p1.y)
        const cornerClear =
          countHCollisions(p1.y, s1.x, p2.x, obstacles) === 0 &&
          countVCollisions(p2.x, p1.y, s2.y, obstacles) === 0;
        if (cornerClear) {
          return simplifyOrthogonalPoints([
            { x: p1.x, y: p1.y },
            { x: p2.x, y: p1.y },
            { x: p2.x, y: p2.y }
          ]);
        }
        const safeMidX = findBestVerticalCorridor(
          (s1.x + p2.x) / 2,
          Math.min(s1.x, p2.x) - 80,
          Math.max(s1.x, p2.x) + 80,
          p1.y,
          s2.y,
          obstacles
        );
        return simplifyOrthogonalPoints([
          { x: p1.x, y: p1.y },
          { x: safeMidX, y: p1.y },
          { x: safeMidX, y: s2.y },
          { x: p2.x, y: s2.y },
          { x: p2.x, y: p2.y }
        ]);
      } else {
        // Vertical primero -> Horizontal después: esquina (p1.x, p2.y)
        const cornerClear =
          countVCollisions(p1.x, s1.y, p2.y, obstacles) === 0 &&
          countHCollisions(p2.y, p1.x, s2.x, obstacles) === 0;
        if (cornerClear) {
          return simplifyOrthogonalPoints([
            { x: p1.x, y: p1.y },
            { x: p1.x, y: p2.y },
            { x: p2.x, y: p2.y }
          ]);
        }
      }
    }

    // Caso 3: Conexión vertical (bottom -> top o top -> bottom)
    if (isVertStart && isVertEnd) {
      // Casi perfectamente alineados en X y sin obstáculos en medio -> recta directa
      if (Math.abs(p1.x - p2.x) < 4 && countVCollisions(p1.x, s1.y, s2.y, obstacles) === 0 && s2.y >= s1.y - 4) {
        return simplifyOrthogonalPoints([
          { x: p1.x, y: p1.y },
          { x: p2.x, y: p2.y }
        ]);
      }

      // Si el destino está arriba del origen (retroceso bottom -> top), rodear por un canal vertical libre
      if (p1.side === 'bottom' && p2.side === 'top' && s2.y < s1.y) {
        const detourX = findBestVerticalCorridor(
          p2.x >= p1.x ? Math.max(boxF.right, boxT.right) + 22 : Math.min(boxF.left, boxT.left) - 22,
          Math.min(boxF.left, boxT.left) - 240,
          Math.max(boxF.right, boxT.right) + 240,
          s2.y,
          s1.y,
          obstacles
        );
        return simplifyOrthogonalPoints([
          { x: p1.x, y: p1.y },
          { x: p1.x, y: s1.y },
          { x: detourX, y: s1.y },
          { x: detourX, y: s2.y },
          { x: p2.x, y: s2.y },
          { x: p2.x, y: p2.y }
        ]);
      }

      const idealY = (s1.y + s2.y) / 2;
      const midY = findBestHorizontalCorridor(
        idealY,
        Math.min(s1.y, s2.y),
        Math.max(s1.y, s2.y),
        p1.x,
        p2.x,
        obstacles
      );

      // Si uno de los tramos verticales choca un nodo intermedio, abrir paso en 5 tramos
      const vHits1 = countVCollisions(p1.x, s1.y, midY, obstacles);
      const vHits2 = countVCollisions(p2.x, midY, s2.y, obstacles);
      if (vHits1 > 0 || vHits2 > 0) {
        const bypassX = findBestVerticalCorridor(
          (p1.x + p2.x) / 2,
          Math.min(p1.x, p2.x) - 140,
          Math.max(p1.x, p2.x) + 140,
          s1.y,
          s2.y,
          obstacles
        );
        return simplifyOrthogonalPoints([
          { x: p1.x, y: p1.y },
          { x: p1.x, y: s1.y },
          { x: bypassX, y: s1.y },
          { x: bypassX, y: s2.y },
          { x: p2.x, y: s2.y },
          { x: p2.x, y: p2.y }
        ]);
      }

      return simplifyOrthogonalPoints([
        { x: p1.x, y: p1.y },
        { x: p1.x, y: midY },
        { x: p2.x, y: midY },
        { x: p2.x, y: p2.y }
      ]);
    }

    // Caso 4: Conexión horizontal (right -> left o left -> right)
    if (Math.abs(p1.y - p2.y) < 4 && countHCollisions(p1.y, s1.x, s2.x, obstacles) === 0 && ((p1.side === 'right' && s2.x >= s1.x - 4) || (p1.side === 'left' && s2.x <= s1.x + 4))) {
      return simplifyOrthogonalPoints([
        { x: p1.x, y: p1.y },
        { x: p2.x, y: p2.y }
      ]);
    }

    // Si es un enlace largo horizontal que cruza muchas columnas (como en diagramas grandes),
    // verificar si hay obstáculos entre s1.x y s2.x y si conviene canal superior/inferior limpio
    const idealX = (s1.x + s2.x) / 2;
    const midX = findBestVerticalCorridor(
      idealX,
      Math.min(s1.x, s2.x),
      Math.max(s1.x, s2.x),
      p1.y,
      p2.y,
      obstacles
    );

    const hHits1 = countHCollisions(p1.y, s1.x, midX, obstacles);
    const hHits2 = countHCollisions(p2.y, midX, s2.x, obstacles);

    if (hHits1 > 0 || hHits2 > 0 || (p1.side === 'right' && p2.side === 'left' && s2.x < s1.x)) {
      const spanObs = obstacles.filter(
        ob => ob.right >= Math.min(s1.x, s2.x) - 10 && ob.left <= Math.max(s1.x, s2.x) + 10
      );
      const bandTop = spanObs.length ? Math.min(...spanObs.map(o => o.top)) - 18 : Math.min(p1.y, p2.y) - 44;
      const bandBot = spanObs.length ? Math.max(...spanObs.map(o => o.bottom)) + 18 : Math.max(p1.y, p2.y) + 44;
      const preferTop = Math.abs(p1.y - bandTop) + Math.abs(p2.y - bandTop) <= Math.abs(p1.y - bandBot) + Math.abs(p2.y - bandBot);
      const bypassY = findBestHorizontalCorridor(
        preferTop ? bandTop : bandBot,
        bandTop - 160,
        bandBot + 160,
        s1.x,
        s2.x,
        obstacles
      );
      return simplifyOrthogonalPoints([
        { x: p1.x, y: p1.y },
        { x: s1.x, y: p1.y },
        { x: s1.x, y: bypassY },
        { x: s2.x, y: bypassY },
        { x: s2.x, y: p2.y },
        { x: p2.x, y: p2.y }
      ]);
    }

    return simplifyOrthogonalPoints([
      { x: p1.x, y: p1.y },
      { x: midX, y: p1.y },
      { x: midX, y: p2.y },
      { x: p2.x, y: p2.y }
    ]);
  }

  // Separa segmentos interiores colineales en carriles paralelos para que NUNCA se superpongan dos líneas
  function separateCollinearCorridors(routedList) {
    const hSegs = [];
    const vSegs = [];

    routedList.forEach(item => {
      const pts = item.points;
      if (pts.length < 4) return; // Los segmentos primero y último están anclados al puerto del nodo
      for (let i = 1; i < pts.length - 2; i++) {
        const a = pts[i];
        const b = pts[i + 1];
        if (Math.abs(a.y - b.y) < 0.8 && Math.abs(a.x - b.x) > 8) {
          hSegs.push({
            item,
            idx: i,
            coord: a.y,
            start: Math.min(a.x, b.x),
            end: Math.max(a.x, b.x)
          });
        } else if (Math.abs(a.x - b.x) < 0.8 && Math.abs(a.y - b.y) > 8) {
          vSegs.push({
            item,
            idx: i,
            coord: a.x,
            start: Math.min(a.y, b.y),
            end: Math.max(a.y, b.y)
          });
        }
      }
    });

    const assignLanes = (segs, isHorizontal) => {
      if (segs.length < 2) return;
      segs.sort((a, b) => a.coord - b.coord || a.start - b.start);

      let i = 0;
      while (i < segs.length) {
        const group = [segs[i]];
        let j = i + 1;
        while (j < segs.length && Math.abs(segs[j].coord - group[group.length - 1].coord) <= 12) {
          group.push(segs[j]);
          j++;
        }

        if (group.length > 1) {
          // Coloreo voraz de intervalos para asignar pistas sólo cuando realmente se solapan
          group.sort((a, b) => a.start - b.start || (b.end - b.start) - (a.end - a.start));
          const laneEnds = [];
          const assignedLane = new Array(group.length).fill(0);

          group.forEach((seg, idx) => {
            let chosen = -1;
            for (let l = 0; l < laneEnds.length; l++) {
              if (laneEnds[l] < seg.start - 6) {
                chosen = l;
                laneEnds[l] = seg.end;
                break;
              }
            }
            if (chosen === -1) {
              chosen = laneEnds.length;
              laneEnds.push(seg.end);
            }
            assignedLane[idx] = chosen;
          });

          const totalLanes = laneEnds.length;
          if (totalLanes > 1) {
            const baseCoord = group.reduce((s, x) => s + x.coord, 0) / group.length;
            group.forEach((seg, idx) => {
              const offset = (assignedLane[idx] - (totalLanes - 1) / 2) * TRACK_SPACING;
              const nextCoord = Math.round(baseCoord + offset);
              const pts = seg.item.points;
              if (isHorizontal) {
                pts[seg.idx].y = nextCoord;
                pts[seg.idx + 1].y = nextCoord;
              } else {
                pts[seg.idx].x = nextCoord;
                pts[seg.idx + 1].x = nextCoord;
              }
            });
          }
        }
        i = j;
      }
    };

    assignLanes(hSegs, true);
    assignLanes(vSegs, false);
  }

  // Genera SVG path con esquinas redondeadas + pequeños arcos puente donde una línea horizontal cruza una vertical ajena
  function buildSvgPathWithRoundedCornersAndJumps(pts, allVertSegments, ownEdgeId) {
    if (!pts || pts.length < 2) return '';
    if (pts.length === 2) {
      return renderSegmentWithJumps(pts[0], pts[1], allVertSegments, ownEdgeId, true);
    }

    const cmds = [`M ${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)}`];

    for (let i = 1; i < pts.length - 1; i++) {
      const prev = pts[i - 1];
      const curr = pts[i];
      const next = pts[i + 1];

      const d1x = curr.x - prev.x;
      const d1y = curr.y - prev.y;
      const len1 = Math.hypot(d1x, d1y);

      const d2x = next.x - curr.x;
      const d2y = next.y - curr.y;
      const len2 = Math.hypot(d2x, d2y);

      const r = Math.min(CORNER_RADIUS, len1 * 0.42, len2 * 0.42);
      if (r < 1.5) {
        cmds.push(renderSegmentWithJumps(prev, curr, allVertSegments, ownEdgeId, false, r > 0 ? r : 0));
        continue;
      }

      const preCorner = {
        x: curr.x - (d1x / len1) * r,
        y: curr.y - (d1y / len1) * r
      };
      const postCorner = {
        x: curr.x + (d2x / len2) * r,
        y: curr.y + (d2y / len2) * r
      };

      const startTrimmed =
        i === 1
          ? prev
          : {
              x: prev.x + (d1x / len1) * Math.min(CORNER_RADIUS, len1 * 0.42),
              y: prev.y + (d1y / len1) * Math.min(CORNER_RADIUS, len1 * 0.42)
            };

      cmds.push(renderSegmentWithJumps(startTrimmed, preCorner, allVertSegments, ownEdgeId, false));
      cmds.push(`Q ${curr.x.toFixed(1)} ${curr.y.toFixed(1)} ${postCorner.x.toFixed(1)} ${postCorner.y.toFixed(1)}`);
    }

    const penult = pts[pts.length - 2];
    const last = pts[pts.length - 1];
    const dLastX = last.x - penult.x;
    const dLastY = last.y - penult.y;
    const lenLast = Math.hypot(dLastX, dLastY);
    const prevR =
      pts.length >= 3
        ? Math.min(
            CORNER_RADIUS,
            Math.hypot(penult.x - pts[pts.length - 3].x, penult.y - pts[pts.length - 3].y) * 0.42,
            lenLast * 0.42
          )
        : 0;
    const lastStart =
      lenLast > 0 && prevR >= 1.5
        ? { x: penult.x + (dLastX / lenLast) * prevR, y: penult.y + (dLastY / lenLast) * prevR }
        : penult;

    cmds.push(renderSegmentWithJumps(lastStart, last, allVertSegments, ownEdgeId, false));
    return cmds.join(' ');
  }

  function renderSegmentWithJumps(a, b, allVertSegments, ownEdgeId, includeMove) {
    const parts = [];
    if (includeMove) parts.push(`M ${a.x.toFixed(1)} ${a.y.toFixed(1)}`);

    const isHoriz = Math.abs(a.y - b.y) < 0.8 && Math.abs(b.x - a.x) > BRIDGE_RADIUS * 3.5;
    if (!isHoriz || !allVertSegments || !allVertSegments.length) {
      parts.push(`L ${b.x.toFixed(1)} ${b.y.toFixed(1)}`);
      return parts.join(' ');
    }

    const dir = b.x >= a.x ? 1 : -1;
    const minX = Math.min(a.x, b.x) + BRIDGE_RADIUS + 4;
    const maxX = Math.max(a.x, b.x) - BRIDGE_RADIUS - 4;
    const y = a.y;

    const crossings = [];
    for (let i = 0; i < allVertSegments.length; i++) {
      const vs = allVertSegments[i];
      if (vs.edgeId === ownEdgeId) continue;
      if (vs.x > minX && vs.x < maxX && y > vs.minY + 6 && y < vs.maxY - 6) {
        crossings.push(vs.x);
      }
    }

    if (!crossings.length) {
      parts.push(`L ${b.x.toFixed(1)} ${b.y.toFixed(1)}`);
      return parts.join(' ');
    }

    crossings.sort((x1, x2) => (dir > 0 ? x1 - x2 : x2 - x1));

    // Fusionar cruces muy cercanos en un único puente limpio
    const merged = [];
    crossings.forEach(cx => {
      if (!merged.length || Math.abs(cx - merged[merged.length - 1].end) > BRIDGE_RADIUS * 2.4) {
        merged.push({ start: cx, end: cx });
      } else {
        merged[merged.length - 1].end = cx;
      }
    });

    merged.forEach(jump => {
      const jStart = jump.start - dir * BRIDGE_RADIUS;
      const jEnd = jump.end + dir * BRIDGE_RADIUS;
      const spanR = Math.max(BRIDGE_RADIUS, Math.abs(jEnd - jStart) / 2);
      const sweep = dir > 0 ? 1 : 0;
      parts.push(`L ${jStart.toFixed(1)} ${y.toFixed(1)}`);
      parts.push(`A ${spanR.toFixed(1)} ${BRIDGE_RADIUS.toFixed(1)} 0 0 ${sweep} ${jEnd.toFixed(1)} ${y.toFixed(1)}`);
    });

    parts.push(`L ${b.x.toFixed(1)} ${b.y.toFixed(1)}`);
    return parts.join(' ');
  }

  function pickLabelPosition(pts) {
    if (!pts || pts.length < 2) return { lx: 0, ly: 0 };
    let bestIdx = 0;
    let bestLen = -1;
    for (let i = 0; i < pts.length - 1; i++) {
      const len = Math.hypot(pts[i + 1].x - pts[i].x, pts[i + 1].y - pts[i].y);
      // Preferir segmentos centrales frente a pequeños stubs
      const weight = i > 0 && i < pts.length - 2 ? len * 1.25 : len;
      if (weight > bestLen) {
        bestLen = weight;
        bestIdx = i;
      }
    }
    const a = pts[bestIdx];
    const b = pts[bestIdx + 1];
    return {
      lx: (a.x + b.x) / 2,
      ly: (a.y + b.y) / 2
    };
  }

  function resolveEdgeLabelCollisions(routedList) {
    const labeled = routedList.filter(r => r.edge && String(r.edge.label || '').trim().length > 0);
    if (labeled.length < 2) return;

    for (let pass = 0; pass < 4; pass++) {
      for (let i = 0; i < labeled.length; i++) {
        for (let j = i + 1; j < labeled.length; j++) {
          const A = labeled[i];
          const B = labeled[j];
          const wA = Math.max(28, String(A.edge.label).length * 6.4 + 12);
          const wB = Math.max(28, String(B.edge.label).length * 6.4 + 12);
          const minDx = (wA + wB) / 2 + 4;
          const minDy = 17;
          const dx = B.lx - A.lx;
          const dy = B.ly - A.ly;
          if (Math.abs(dx) < minDx && Math.abs(dy) < minDy) {
            const pushY = dy >= 0 ? (minDy - dy) / 2 + 1 : -(minDy + dy) / 2 - 1;
            A.ly -= pushY;
            B.ly += pushY;
          }
        }
      }
    }
  }

  /**
   * Calcula de una sola pasada todas las rutas de STATE.edges coordinadas entre sí.
   * Devuelve Map<edgeId, { d, lx, ly, x2, y2, domainKind, points, sourceSide, targetSide }>
   */
  function computeAllEdgesSmartLayout() {
    const result = new Map();
    if (typeof STATE === 'undefined' || !Array.isArray(STATE.edges) || !STATE.edges.length) {
      return result;
    }

    const obstacleMap = new Map();
    (STATE.nodes || []).forEach(n => {
      if (n && n.type !== 'note') {
        obstacleMap.set(n.id, getRect(n, OBS_PAD));
      }
    });

    // 1. Determinar lados óptimos para cada arista
    const metaByEdge = [];
    const sideBuckets = new Map(); // key `${nodeId}:${side}` -> array of { edge, isFrom, otherCenter }

    const pushBucket = (nodeId, side, entry) => {
      const k = `${nodeId}:${side}`;
      if (!sideBuckets.has(k)) sideBuckets.set(k, []);
      sideBuckets.get(k).push(entry);
    };

    STATE.edges.forEach(e => {
      const nf = byId(e.from);
      const nt = byId(e.to);
      if (!nf || !nt) return;
      const sides = chooseNaturalSides(e, nf, nt);
      const domainKind = classifyEdgeDomain(nf, nt, e);
      const item = { edge: e, nf, nt, ...sides, domainKind };
      metaByEdge.push(item);

      pushBucket(nf.id, sides.sourceSide, {
        edgeId: e.id,
        isFrom: true,
        otherX: nt.x + (nt.w || 150) / 2,
        otherY: nt.y + (nt.h || 60) / 2
      });
      pushBucket(nt.id, sides.targetSide, {
        edgeId: e.id,
        isFrom: false,
        otherX: nf.x + (nf.w || 150) / 2,
        otherY: nf.y + (nf.h || 60) / 2
      });
    });

    // 2. Distribuir puertos limpiamente a lo largo de cada cara para que no salgan pegados
    const anchorLookup = new Map(); // `${edgeId}:from` | `${edgeId}:to` -> { x, y, side }
    sideBuckets.forEach((entries, key) => {
      const [nodeId, side] = key.split(':');
      const node = byId(nodeId);
      if (!node) return;
      const nw = Number(node.w) || 150;
      const nh = Number(node.h) || 60;

      entries.sort((a, b) => {
        if (side === 'left' || side === 'right') return a.otherY - b.otherY || a.otherX - b.otherX;
        return a.otherX - b.otherX || a.otherY - b.otherY;
      });

      const total = entries.length;
      entries.forEach((ent, idx) => {
        // Mantener puertos dentro del 20%..80% central del borde para estética limpia incluso en diamantes
        const pct = total <= 1 ? 0.5 : 0.2 + (0.6 * idx) / (total - 1);
        let x = node.x + nw / 2;
        let y = node.y + nh / 2;
        if (side === 'top') {
          x = node.x + nw * pct;
          y = node.y;
        } else if (side === 'bottom') {
          x = node.x + nw * pct;
          y = node.y + nh;
        } else if (side === 'left') {
          x = node.x;
          y = node.y + nh * pct;
        } else if (side === 'right') {
          x = node.x + nw;
          y = node.y + nh * pct;
        }
        anchorLookup.set(`${ent.edgeId}:${ent.isFrom ? 'from' : 'to'}`, { x, y, side });
      });
    });

    // 3. Construir polilíneas ortogonales con evasión de nodos
    const routedList = metaByEdge.map(item => {
      const p1 = anchorLookup.get(`${item.edge.id}:from`);
      const p2 = anchorLookup.get(`${item.edge.id}:to`);
      const points = buildObstacleAwareWaypoints(p1, p2, item.nf, item.nt, obstacleMap);
      return {
        ...item,
        p1,
        p2,
        points
      };
    });

    // 4. Separar carriles paralelos para eliminar cualquier línea superpuesta
    separateCollinearCorridors(routedList);

    // 5. Recolectar todos los segmentos verticales para dibujar puentes de salto (arc hops) en los cruces
    const allVertSegments = [];
    routedList.forEach(item => {
      item.points = simplifyOrthogonalPoints(item.points);
      const pts = item.points;
      for (let i = 0; i < pts.length - 1; i++) {
        const a = pts[i];
        const b = pts[i + 1];
        if (Math.abs(a.x - b.x) < 0.8 && Math.abs(b.y - a.y) > 10) {
          allVertSegments.push({
            edgeId: item.edge.id,
            x: a.x,
            minY: Math.min(a.y, b.y),
            maxY: Math.max(a.y, b.y)
          });
        }
      }
      const lblPos = pickLabelPosition(pts);
      item.lx = lblPos.lx;
      item.ly = lblPos.ly;
    });

    // 6. Evitar colisión entre etiquetas de texto
    resolveEdgeLabelCollisions(routedList);

    // 7. Generar cadenas SVG finales con esquinas redondeadas y arcos de salto
    routedList.forEach(item => {
      const d = buildSvgPathWithRoundedCornersAndJumps(item.points, allVertSegments, item.edge.id);
      result.set(item.edge.id, {
        d,
        lx: item.lx,
        ly: item.ly,
        x2: item.p2.x,
        y2: item.p2.y,
        domainKind: item.domainKind,
        sourceSide: item.sourceSide,
        targetSide: item.targetSide,
        points: item.points
      });
    });

    return result;
  }

  window.computeAllEdgesSmartLayout = computeAllEdgesSmartLayout;
  window.chooseSmartEdgeSides = chooseNaturalSides;
  window.classifyEdgeDomain = classifyEdgeDomain;
})();
