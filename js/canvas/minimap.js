// MINIMAP: Renderización del minimapa
function drawMinimap() {
  if (!DOM.mmx) return;
  const b = bbox();
  const W = DOM.minimap.width;
  const H = DOM.minimap.height;
  DOM.mmx.clearRect(0, 0, W, H);
  DOM.mmx.fillStyle = '#131416';
  DOM.mmx.fillRect(0, 0, W, H);
  const sc = Math.min(W / (b.maxX - b.minX), H / (b.maxY - b.minY));
  const ox = (W - (b.maxX - b.minX) * sc) / 2;
  const oy = (H - (b.maxY - b.minY) * sc) / 2;
  STATE.nodes.forEach(n => {
    DOM.mmx.fillStyle = n.status === 'done' ? '#9aa0a6' : n.current ? '#e9e9e9' : '#3a3e42';
    DOM.mmx.fillRect(ox + (n.x - b.minX) * sc, oy + (n.y - b.minY) * sc, Math.max(2, (n.w || 150) * sc), Math.max(2, (n.h || 60) * sc));
  });
  const r = DOM.vp.getBoundingClientRect();
  DOM.mmx.strokeStyle = '#8b9095';
  DOM.mmx.lineWidth = 1;
  DOM.mmx.strokeRect(ox + ((0 - STATE.pan.x) / STATE.zoom - b.minX) * sc, oy + ((0 - STATE.pan.y) / STATE.zoom - b.minY) * sc, (r.width / STATE.zoom) * sc, (r.height / STATE.zoom) * sc);
  DOM.minimap._map = { sc: sc, ox: ox, oy: oy, b: b };
}
