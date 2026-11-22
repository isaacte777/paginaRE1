// VIEWPORT: Gestión de pan, zoom y transformaciones
function applyTransform() {
  DOM.world.style.transform = 'translate(' + STATE.pan.x + 'px,' + STATE.pan.y + 'px) scale(' + STATE.zoom + ')';
  DOM.vp.style.backgroundSize = (24 * STATE.zoom) + 'px ' + (24 * STATE.zoom) + 'px';
  DOM.vp.style.backgroundPosition = STATE.pan.x + 'px ' + STATE.pan.y + 'px';
  document.getElementById('zoomLbl').textContent = Math.round(STATE.zoom * 100) + '%';
  updateStatus();
  drawMinimap();
}

function zoomAt(cx, cy, nz) {
  nz = clamp(nz, CONFIG.ZOOM_MIN, CONFIG.ZOOM_MAX);
  const r = DOM.vp.getBoundingClientRect();
  const px = cx - r.left;
  const py = cy - r.top;
  STATE.pan.x = px - (px - STATE.pan.x) * (nz / STATE.zoom);
  STATE.pan.y = py - (py - STATE.pan.y) * (nz / STATE.zoom);
  STATE.zoom = nz;
  applyTransform();
  saveState();
}

function fitView() {
  if (!STATE.nodes.length) return;
  const r = DOM.vp.getBoundingClientRect();
  const b = bbox();
  STATE.zoom = clamp(Math.min(r.width / (b.maxX - b.minX), r.height / (b.maxY - b.minY)), 0.2, 1.4);
  STATE.pan.x = (r.width - (b.maxX - b.minX) * STATE.zoom) / 2 - b.minX * STATE.zoom;
  STATE.pan.y = (r.height - (b.maxY - b.minY) * STATE.zoom) / 2 - b.minY * STATE.zoom;
  applyTransform();
}
