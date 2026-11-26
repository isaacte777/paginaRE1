// CHARTS: Renderizadores dinámicos funcionales para los 5 Stat-Nodes

function getUpstreamNodes(nodeId) {
  const upstreamIds = new Set();
  function traverse(id) {
    if (typeof STATE === 'undefined' || !STATE.edges) return;
    STATE.edges.forEach(e => {
      if (e.to === id && !upstreamIds.has(e.from)) {
        upstreamIds.add(e.from);
        traverse(e.from);
      }
    });
  }
  traverse(nodeId);
  return Array.from(upstreamIds).map(id => byId(id)).filter(Boolean);
}

function renderChartNodeHtml(n) {
  const type = n.type;
  const upstream = getUpstreamNodes(n.id);
  const title = n.params?.title || (type === 'chart_bar' ? 'Leads por canal' : type === 'chart_donut' ? 'Tráfico por dispositivo' : type === 'chart_gauge' ? 'Meta mensual' : 'Conversión');
  const accent = type === 'chart_bar' ? '#f59e0b' : type === 'chart_donut' ? '#22c55e' : type === 'chart_gauge' ? '#eab308' : '#a855f7';

  // Si no está conectado a nada, mostrar estado vacío / pendiente
  if (upstream.length === 0) {
    const plugSvg =
      '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M12 22v-5"/><path d="M9 8V2"/><path d="M15 8V2"/><path d="M18 8v5a4 4 0 0 1-4 4h-4a4 4 0 0 1-4-4V8Z"/></svg>';
    return `
      <div style="position:relative; width:280px; background:var(--bg2); border:1px solid var(--line2); border-radius:10px; padding:12px; font-family:'JetBrains Mono',monospace; box-shadow:0 10px 30px rgba(0,0,0,0.5); overflow:hidden">
        <div style="position:absolute; top:0; left:0; bottom:0; width:4px; background:${accent}"></div>
        <div style="font-size:11px; font-weight:700; color:var(--tx0); margin-bottom:6px; padding-left:6px">${title}</div>
        <div style="display:flex; align-items:center; justify-content:center; gap:6px; padding:16px 6px; text-align:center; font-size:10px; color:var(--tx3); border:1px dashed var(--line); border-radius:6px; margin-left:6px">
          ${plugSvg}<span>Sin datos (Conecta nodos upstream)</span>
        </div>
      </div>
    `;
  }

  // Calcular métricas dinámicas a partir de los nodos upstream conectados
  const doneCount = upstream.filter(x => x.status === 'done').length;
  const progressCount = upstream.filter(x => x.status === 'progress').length;
  const pendingCount = upstream.filter(x => x.status === 'pending').length;
  const errorCount = upstream.filter(x => x.status === 'error').length;
  const total = upstream.length;
  const successRate = total > 0 ? Math.round((doneCount / total) * 100) : 0;

  const subtitle = n.params?.subtitle || `Basado en ${total} nodos upstream`;
  const badge = type === 'chart_bar' ? 'COMPARE' : type === 'chart_donut' ? 'SHARE' : type === 'chart_gauge' ? 'EN CAMINO' : 'FUNNEL';

  let bodyHtml = '';

  if (type === 'chart_bar') {
    const bars = [
      { l: 'Hechos', v: doneCount, max: total },
      { l: 'Progreso', v: progressCount, max: total },
      { l: 'Pendiente', v: pendingCount, max: total },
      { l: 'Error', v: errorCount, max: total }
    ];
    bodyHtml = `
      <div style="font-size:10px; color:var(--tx3); margin-bottom:6px">Distribución de estados upstream</div>
      <div style="display:flex; align-items:flex-end; gap:8px; height:65px">
        ${bars.map(b => `
          <div style="flex:1; display:flex; flex-direction:column; align-items:center; gap:2px; height:100%; justify-content:flex-end">
            <div style="width:100%; display:flex; gap:1px; align-items:flex-end; height:50px">
              <div style="flex:1; background:${accent}; height:${total ? (b.v / total) * 100 : 0}%; border-radius:2px 2px 0 0"></div>
            </div>
            <span style="font-size:8.5px; color:var(--tx3)">${b.l}</span>
          </div>
        `).join('')}
      </div>
      <div style="display:flex; justify-content:space-between; font-size:9px; color:var(--tx3); margin-top:6px">
        <span>total nodos</span><span>${total}</span>
      </div>
    `;
  } else if (type === 'chart_donut') {
    const donePct = total ? (doneCount / total) * 100 : 0;
    const progPct = total ? (progressCount / total) * 100 : 0;
    bodyHtml = `
      <div style="display:flex; align-items:center; gap:12px">
        <div style="position:relative; width:80px; height:80px; display:flex; align-items:center; justify-content:center">
          <svg viewBox="0 0 100 100" style="width:80px; height:80px; transform:rotate(-90deg)">
            <circle cx="50" cy="50" r="38" fill="none" stroke="var(--line)" stroke-width="12" />
            <circle cx="50" cy="50" r="38" fill="none" stroke="#22c55e" stroke-width="12" stroke-dasharray="${(donePct / 100) * 238} 238" stroke-dashoffset="0" />
            <circle cx="50" cy="50" r="38" fill="none" stroke="#38bdf8" stroke-width="12" stroke-dasharray="${(progPct / 100) * 238} 238" stroke-dashoffset="${- (donePct / 100) * 238}" />
          </svg>
          <div style="position:absolute; text-align:center">
            <div style="font-size:11px; font-weight:700; color:var(--tx0)">${total}</div>
            <div style="font-size:8px; color:var(--tx3)">nodos</div>
          </div>
        </div>
        <div style="font-size:9.5px; color:var(--tx2); display:flex; flex-direction:column; gap:3px; flex:1">
          <div style="display:flex; justify-content:space-between"><span style="display:flex; align-items:center; gap:4px"><i style="width:6px; height:6px; border-radius:50%; background:#22c55e"></i>Hechos</span><span>${doneCount}</span></div>
          <div style="display:flex; justify-content:space-between"><span style="display:flex; align-items:center; gap:4px"><i style="width:6px; height:6px; border-radius:50%; background:#38bdf8"></i>En curso</span><span>${progressCount}</span></div>
          <div style="display:flex; justify-content:space-between"><span style="display:flex; align-items:center; gap:4px"><i style="width:6px; height:6px; border-radius:50%; background:var(--line2)"></i>Pendientes</span><span>${pendingCount}</span></div>
        </div>
      </div>
    `;
  } else if (type === 'chart_gauge') {
    bodyHtml = `
      <div style="text-align:center; padding:4px 0">
        <svg viewBox="0 0 160 90" style="width:165px; height:90px; margin:0 auto; overflow:visible">
          <path d="M15,80 A65,65 0 0 1 145,80" fill="none" stroke="var(--line)" stroke-width="10" stroke-linecap="round" />
          <path d="M15,80 A65,65 0 0 1 145,80" fill="none" stroke="${accent}" stroke-width="10" stroke-linecap="round" stroke-dasharray="${(successRate / 100) * 210} 210" />
          <circle cx="80" cy="80" r="3.5" fill="var(--tx0)" />
        </svg>
        <div style="font-size:18px; font-weight:700; color:var(--tx0); margin-top:-6px">${successRate}%</div>
      </div>
      <div style="display:flex; justify-content:space-between; font-size:9px; color:var(--tx3); margin-top:4px">
        <span>completado</span><span>${doneCount}/${total} nodos</span>
      </div>
    `;
  } else if (type === 'chart_funnel') {
    const stages = [
      { l: 'Total Upstream', v: total, w: 100 },
      { l: 'En Curso', v: progressCount, w: total ? (progressCount / total) * 100 : 0 },
      { l: 'Completados', v: doneCount, w: total ? (doneCount / total) * 100 : 0 }
    ];
    bodyHtml = `
      <div style="display:flex; flex-direction:column; gap:5px">
        ${stages.map(s => `
          <div>
            <div style="display:flex; justify-content:space-between; font-size:9px; color:var(--tx3); margin-bottom:1px">
              <span>${s.l}</span><span>${s.v}</span>
            </div>
            <div style="height:10px; background:var(--bg0); border-radius:2px; display:flex; justify-content:center">
              <div style="width: ${Math.max(s.w, 5)}%; height:100%; background:${accent}; border-radius:2px; opacity:0.85"></div>
            </div>
          </div>
        `).join('')}
      </div>
      <div style="display:flex; justify-content:space-between; font-size:9.5px; color:var(--tx2); margin-top:6px; border-top:1px solid var(--line); padding-top:4px">
        <span>tasa éxito</span><strong style="color:var(--tx0)">${successRate}%</strong>
      </div>
    `;
  }

  return `
    <div style="position:relative; width:280px; background:var(--bg2); border:1px solid var(--line2); border-radius:10px; padding:12px; font-family:'JetBrains Mono',monospace; box-shadow:0 10px 30px rgba(0,0,0,0.5); overflow:hidden">
      <div style="position:absolute; top:0; left:0; bottom:0; width:4px; background:${accent}"></div>
      <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:8px; padding-left:6px">
        <div>
          <div style="font-size:11px; font-weight:700; color:var(--tx0)">${title}</div>
          <div style="font-size:9px; color:var(--tx3)">${subtitle}</div>
        </div>
        <span style="font-size:8.5px; font-weight:700; color:${accent}; border:1px solid ${accent}; padding:1px 5px; border-radius:3px">${badge}</span>
      </div>
      <div style="padding-left:6px">${bodyHtml}</div>
    </div>
  `;
}
