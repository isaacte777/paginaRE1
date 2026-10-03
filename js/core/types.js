// Tipos de nodos y definiciones
const NODE_TYPES = {
  start: { label: 'Inicio', icon: '●', color: '#white' },
  end: { label: 'Fin', icon: '◯', color: '#white' },
  process: { label: 'Proceso', icon: '▯', color: '#bg2' },
  decision: { label: 'Decisión', icon: '◇', color: '#6a6e72' },
  loop: { label: 'Bucle', icon: '⥁', color: '#6a6e72' },
  parallel: { label: 'Paralelo', icon: '‖', color: '#bg3' },
  io: { label: 'E/S', icon: '⊳', color: '#6a6e72' },
  db: { label: 'BD', icon: '◊', color: '#bg2' },
  varset: { label: 'Variable', icon: 'let', color: '#bg2' },
  api: { label: 'API', icon: '</>', color: '#bg2' },
  hook: { label: 'Webhook', icon: '⚡', color: 'transparent' },
  tryc: { label: 'Try/Catch', icon: '🔄', color: '#bg2' },
  err: { label: 'Error', icon: '✕', color: '#white' },
  delay: { label: 'Espera', icon: '⏱', color: '#bg2' },
  ai: { label: 'IA/LLM', icon: '⚙', color: '#202224' },
  human: { label: 'Humano', icon: '@', color: '#26282a' },
  note: { label: 'Nota', icon: '//', color: '#3a3d40' }
};

function createNode(type, text, x, y) {
  return {
    id: generateUID('n'),
    type: type,
    text: text || type,
    x: Math.round(x),
    y: Math.round(y),
    w: 150,
    h: 60,
    status: 'pending',
    progress: 0,
    current: false,
    state: 'idle',
    params: {}
  };
}

function createEdge(fromId, toId, label = '', kind = 'normal') {
  return {
    id: generateUID('e'),
    from: fromId,
    to: toId,
    label: label,
    kind: kind
  };
}
