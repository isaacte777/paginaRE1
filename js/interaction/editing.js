// EDITING: Edición de texto en nodos
function startEdit(nEl) {
  STATE.editing = true;
  const txt = nEl.querySelector('.txt');
  txt.contentEditable = 'true';
  txt.focus();
  const rg = document.createRange();
  rg.selectNodeContents(txt);
  const s = window.getSelection();
  s.removeAllRanges();
  s.addRange(rg);

  const commit = () => {
    txt.removeEventListener('blur', commit);
    STATE.editing = false;
    txt.contentEditable = 'false';
    const n = byId(nEl.dataset.id);
    if (n) {
      n.text = txt.innerText.trim() || n.text;
      commitHistory();
    }
    renderAll();
  };

  txt.addEventListener('blur', commit);
  txt.addEventListener('keydown', ev => {
    if (ev.key === 'Enter' && !ev.shiftKey) {
      ev.preventDefault();
      txt.blur();
    }
  });
}
