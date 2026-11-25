// EDITING: Edicion del texto de un nodo desde el lienzo.
function startEdit(nodeElement) {
  const textElement = nodeElement.querySelector('.txt');
  if (!textElement) return;

  STATE.editing = true;
  textElement.contentEditable = 'true';
  textElement.focus();
  const range = document.createRange();
  range.selectNodeContents(textElement);
  const selection = window.getSelection();
  selection.removeAllRanges();
  selection.addRange(range);

  const commit = () => {
    textElement.removeEventListener('blur', commit);
    STATE.editing = false;
    textElement.contentEditable = 'false';
    const node = byId(nodeElement.dataset.id);
    if (node) {
      node.text = textElement.innerText.trim() || node.text;
      commitHistory();
    }
    renderAll();
  };

  textElement.addEventListener('blur', commit);
  textElement.addEventListener('keydown', event => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      textElement.blur();
    }
  });
}
