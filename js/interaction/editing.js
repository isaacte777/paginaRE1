// EDITING: Edición rápida en línea del título o valor de cualquier nodo desde el lienzo
function startEdit(nodeElement, clickEvent) {
  if (!nodeElement) return;
  const node = byId(nodeElement.dataset.id);
  if (!node) return;

  // Si el usuario hizo doble clic sobre el monto de una celda financiera, editar valor/fórmula en línea
  const clickedValEl =
    clickEvent && clickEvent.target && clickEvent.target.closest
      ? clickEvent.target.closest('.fin-card-val')
      : null;

  if (
    clickedValEl &&
    typeof isFinanceNodeType === 'function' &&
    isFinanceNodeType(node.type) &&
    !(typeof getFinanceNodeDef === 'function' && getFinanceNodeDef(node.type)?.isChart)
  ) {
    STATE.editing = true;
    const initialRaw = node.params?.formula
      ? String(node.params.formula)
      : String(node.params?.value ?? 0);

    const inp = document.createElement('input');
    inp.type = 'text';
    inp.className = 'fin-inline-val-editor';
    inp.value = initialRaw;
    clickedValEl.textContent = '';
    clickedValEl.appendChild(inp);
    inp.focus();
    inp.select();

    let done = false;
    const finishVal = save => {
      if (done) return;
      done = true;
      STATE.editing = false;
      if (save) {
        const raw = inp.value.trim();
        if (!node.params) node.params = {};
        if (raw.startsWith('=')) {
          node.params.formula = raw;
        } else if (raw === '') {
          node.params.formula = '';
          node.params.value = 0;
        } else {
          const parsed = Number(raw.replace(/,/g, ''));
          if (!Number.isNaN(parsed)) {
            node.params.formula = '';
            node.params.value = parsed;
          } else {
            node.params.formula = '=' + raw;
          }
        }
        commitHistory();
        if (typeof evaluateFinanceSheet === 'function') evaluateFinanceSheet();
      }
      renderAll();
    };

    inp.addEventListener('blur', () => finishVal(true));
    inp.addEventListener('keydown', ev => {
      ev.stopPropagation();
      if (ev.key === 'Enter') {
        ev.preventDefault();
        finishVal(true);
      } else if (ev.key === 'Escape') {
        ev.preventDefault();
        finishVal(false);
      }
    });
    return;
  }

  const textElement =
    nodeElement.querySelector('.txt') ||
    nodeElement.querySelector('.fin-card-title') ||
    nodeElement.querySelector('.chart-card-title');
  if (!textElement) return;

  STATE.editing = true;
  textElement.contentEditable = 'true';
  textElement.focus();
  const range = document.createRange();
  range.selectNodeContents(textElement);
  const selection = window.getSelection();
  selection.removeAllRanges();
  selection.addRange(range);

  let committed = false;
  const commit = () => {
    if (committed) return;
    committed = true;
    textElement.removeEventListener('blur', commit);
    STATE.editing = false;
    textElement.contentEditable = 'false';
    const current = byId(nodeElement.dataset.id);
    if (current) {
      const nextText = textElement.innerText.trim();
      if (nextText) {
        current.text = nextText;
        if (current.params && current.params.title) current.params.title = nextText;
        commitHistory();
      }
    }
    renderAll();
  };

  textElement.addEventListener('blur', commit);
  textElement.addEventListener('keydown', event => {
    event.stopPropagation();
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      textElement.blur();
    } else if (event.key === 'Escape') {
      event.preventDefault();
      committed = true;
      STATE.editing = false;
      textElement.contentEditable = 'false';
      renderAll();
    }
  });
}
