import { useState, useRef, useEffect } from 'react'

interface Node {
  id: string
  type: string
  x: number
  y: number
  label: string
  status: 'pending' | 'progress' | 'done'
}

interface Edge {
  id: string
  from: string
  to: string
}

const NODE_TYPES = {
  start: { icon: '▶', color: '#d4d4d4', category: 'flujo' },
  end: { icon: '■', color: '#a3a3a3', category: 'flujo' },
  process: { icon: '⚙', color: '#737373', category: 'flujo' },
  decision: { icon: '◇', color: '#525252', category: 'flujo' },
  loop: { icon: '↻', color: '#404040', category: 'flujo' },
  parallel: { icon: '≡', color: '#262626', category: 'flujo' },
  io: { icon: '⇄', color: '#d4d4d4', category: 'datos' },
  db: { icon: '⛁', color: '#a3a3a3', category: 'datos' },
  varset: { icon: '≔', color: '#737373', category: 'datos' },
  api: { icon: '⚡', color: '#525252', category: 'sistema' },
  hook: { icon: '⥈', color: '#404040', category: 'sistema' },
  tryc: { icon: '⛨', color: '#262626', category: 'sistema' },
  err: { icon: '✕', color: '#171717', category: 'sistema' },
  delay: { icon: '⏱', color: '#d4d4d4', category: 'sistema' },
  ai: { icon: '◉', color: '#a3a3a3', category: 'inteligencia' },
  human: { icon: '◈', color: '#737373', category: 'inteligencia' },
}

let idCounter = 0
const genId = () => `n${++idCounter}`

export default function FlowLab() {
  const [nodes, setNodes] = useState<Node[]>([])
  const [edges, setEdges] = useState<Edge[]>([])
  const [selected, setSelected] = useState<string | null>(null)
  const [zoom, setZoom] = useState(100)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [dragging, setDragging] = useState<string | null>(null)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [connecting, setConnecting] = useState<string | null>(null)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const [isPanning, setIsPanning] = useState(false)
  const [panStart, setPanStart] = useState({ x: 0, y: 0 })
  const [consoleLogs, setConsoleLogs] = useState<string[]>(['[system] FlowLab v3 iniciado', '[system] Claude+Qwen activo', '[ready] viewport listo'])
  const viewportRef = useRef<HTMLDivElement>(null)

  const addLog = (msg: string) => {
    setConsoleLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`])
  }

  const addNode = (type: string) => {
    const info = NODE_TYPES[type as keyof typeof NODE_TYPES]
    const newNode: Node = {
      id: genId(),
      type,
      x: 200 + Math.random() * 300,
      y: 150 + Math.random() * 200,
      label: `${type}()`,
      status: 'pending'
    }
    setNodes(prev => [...prev, newNode])
    addLog(`[+] nodo creado: ${newNode.label}`)
  }

  const deleteSelected = () => {
    if (!selected) return
    setNodes(prev => prev.filter(n => n.id !== selected))
    setEdges(prev => prev.filter(e => e.from !== selected && e.to !== selected))
    addLog(`[x] nodo eliminado: ${selected}`)
    setSelected(null)
  }

  const handleMouseDown = (e: React.MouseEvent, nodeId?: string) => {
    if (e.button === 1 || (e.button === 0 && e.altKey)) {
      setIsPanning(true)
      setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y })
      e.preventDefault()
      return
    }
    if (nodeId && e.button === 0) {
      if (e.shiftKey) {
        setConnecting(nodeId)
        return
      }
      const node = nodes.find(n => n.id === nodeId)
      if (node) {
        setSelected(nodeId)
        setDragging(nodeId)
        const rect = viewportRef.current?.getBoundingClientRect()
        if (rect) {
          setDragOffset({
            x: (e.clientX - rect.left - pan.x) / (zoom / 100) - node.x,
            y: (e.clientY - rect.top - pan.y) / (zoom / 100) - node.y
          })
        }
      }
    }
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      setPan({ x: e.clientX - panStart.x, y: e.clientY - panStart.y })
      return
    }
    if (dragging) {
      const rect = viewportRef.current?.getBoundingClientRect()
      if (rect) {
        let newX = (e.clientX - rect.left - pan.x) / (zoom / 100) - dragOffset.x
        let newY = (e.clientY - rect.top - pan.y) / (zoom / 100) - dragOffset.y
        newX = Math.round(newX / 20) * 20
        newY = Math.round(newY / 20) * 20
        setNodes(prev => prev.map(n => n.id === dragging ? { ...n, x: newX, y: newY } : n))
      }
    }
    if (connecting) {
      const rect = viewportRef.current?.getBoundingClientRect()
      if (rect) {
        setMousePos({
          x: (e.clientX - rect.left - pan.x) / (zoom / 100),
          y: (e.clientY - rect.top - pan.y) / (zoom / 100)
        })
      }
    }
  }

  const handleMouseUp = (e: React.MouseEvent) => {
    if (isPanning) {
      setIsPanning(false)
      return
    }
    if (connecting) {
      const target = (e.target as HTMLElement).closest('[data-node-id]')
      if (target) {
        const targetId = target.getAttribute('data-node-id')
        if (targetId && targetId !== connecting) {
          setEdges(prev => [...prev, { id: `e${Date.now()}`, from: connecting!, to: targetId }])
          addLog(`[→] conexión: ${connecting} → ${targetId}`)
        }
      }
      setConnecting(null)
    }
    setDragging(null)
  }

  const handleViewportClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget || (e.target as HTMLElement).id === 'world') {
      setSelected(null)
    }
  }

  const fitView = () => {
    if (nodes.length === 0) return
    const xs = nodes.map(n => n.x)
    const ys = nodes.map(n => n.y)
    const minX = Math.min(...xs) - 50
    const minY = Math.min(...ys) - 50
    const maxX = Math.max(...xs) + 200
    const maxY = Math.max(...ys) + 100
    const rect = viewportRef.current?.getBoundingClientRect()
    if (!rect) return
    const scaleX = rect.width / (maxX - minX)
    const scaleY = rect.height / (maxY - minY)
    const newZoom = Math.min(scaleX, scaleY, 1.5) * 100
    setZoom(Math.round(newZoom))
    setPan({ x: -minX * (newZoom / 100) + 50, y: -minY * (newZoom / 100) + 50 })
  }

  const getNodeColor = (type: string) => NODE_TYPES[type as keyof typeof NODE_TYPES]?.color || '#666'
  const getNodeIcon = (type: string) => NODE_TYPES[type as keyof typeof NODE_TYPES]?.icon || '?'

  const statusColor = (s: string) => {
    if (s === 'done') return '#d4d4d4'
    if (s === 'progress') return '#a3a3a3'
    return '#525252'
  }

  return (
    <div style={{
      flex: 1,
      display: 'flex',
      overflow: 'hidden',
      background: '#0b0c0d',
      color: '#c9ccd0',
      fontFamily: "'JetBrains Mono', ui-monospace, monospace",
      fontSize: '12px'
    }}>
      {/* LEFT TOOLBOX */}
      <aside style={{
        width: 180,
        background: '#131416',
        borderRight: '1px solid #2e3134',
        overflowY: 'auto',
        padding: '8px',
        flexShrink: 0
      }}>
        <h4 style={{ color: '#a3a3a3', fontSize: 10, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>flujo</h4>
        {Object.entries(NODE_TYPES).filter(([, v]) => v.category === 'flujo').map(([type, info]) => (
          <button key={type} onClick={() => addNode(type)} style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            width: '100%',
            padding: '6px 8px',
            background: '#1a1c1e',
            border: '1px solid #2e3134',
            borderRadius: 4,
            color: '#c9ccd0',
            cursor: 'pointer',
            fontSize: 11,
            marginBottom: 4,
            textAlign: 'left'
          }}>
            <span style={{ width: 18, textAlign: 'center' }}>{info.icon}</span>
            {type}()
          </button>
        ))}
        <h4 style={{ color: '#a3a3a3', fontSize: 10, textTransform: 'uppercase', letterSpacing: 1, margin: '12px 0 8px' }}>datos</h4>
        {Object.entries(NODE_TYPES).filter(([, v]) => v.category === 'datos').map(([type, info]) => (
          <button key={type} onClick={() => addNode(type)} style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            width: '100%',
            padding: '6px 8px',
            background: '#1a1c1e',
            border: '1px solid #2e3134',
            borderRadius: 4,
            color: '#c9ccd0',
            cursor: 'pointer',
            fontSize: 11,
            marginBottom: 4,
            textAlign: 'left'
          }}>
            <span style={{ width: 18, textAlign: 'center' }}>{info.icon}</span>
            {type}()
          </button>
        ))}
        <h4 style={{ color: '#a3a3a3', fontSize: 10, textTransform: 'uppercase', letterSpacing: 1, margin: '12px 0 8px' }}>sistema</h4>
        {Object.entries(NODE_TYPES).filter(([, v]) => v.category === 'sistema').map(([type, info]) => (
          <button key={type} onClick={() => addNode(type)} style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            width: '100%',
            padding: '6px 8px',
            background: '#1a1c1e',
            border: '1px solid #2e3134',
            borderRadius: 4,
            color: '#c9ccd0',
            cursor: 'pointer',
            fontSize: 11,
            marginBottom: 4,
            textAlign: 'left'
          }}>
            <span style={{ width: 18, textAlign: 'center' }}>{info.icon}</span>
            {type}()
          </button>
        ))}
        <h4 style={{ color: '#a3a3a3', fontSize: 10, textTransform: 'uppercase', letterSpacing: 1, margin: '12px 0 8px' }}>edición</h4>
        <button onClick={deleteSelected} style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          width: '100%',
          padding: '6px 8px',
          background: '#1a1c1e',
          border: '1px solid #2e3134',
          borderRadius: 4,
          color: '#c9ccd0',
          cursor: 'pointer',
          fontSize: 11,
          marginBottom: 4,
          textAlign: 'left'
        }}>
          <span style={{ width: 18, textAlign: 'center' }}>✕</span>
          eliminar
        </button>
        <button onClick={fitView} style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          width: '100%',
          padding: '6px 8px',
          background: '#1a1c1e',
          border: '1px solid #2e3134',
          borderRadius: 4,
          color: '#c9ccd0',
          cursor: 'pointer',
          fontSize: 11,
          marginBottom: 4,
          textAlign: 'left'
        }}>
          <span style={{ width: 18, textAlign: 'center' }}>⊞</span>
          ajustar
        </button>
      </aside>

      {/* VIEWPORT */}
      <div
        ref={viewportRef}
        onMouseDown={e => handleMouseDown(e)}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onClick={handleViewportClick}
        onWheel={e => {
          e.preventDefault()
          const rect = viewportRef.current?.getBoundingClientRect()
          if (!rect) return
          const mouseX = e.clientX - rect.left
          const mouseY = e.clientY - rect.top
          const oldZoom = zoom
          const newZoom = Math.max(20, Math.min(300, oldZoom - e.deltaY * 0.1))
          const scale = newZoom / oldZoom
          const newPanX = mouseX - (mouseX - pan.x) * scale
          const newPanY = mouseY - (mouseY - pan.y) * scale
          setZoom(newZoom)
          setPan({ x: newPanX, y: newPanY })
        }}
        style={{
          flex: 1,
          position: 'relative',
          overflow: 'hidden',
          background: '#0b0c0d',
          cursor: isPanning ? 'grabbing' : 'default'
        }}
      >
        <div id="world" style={{
          position: 'absolute',
          width: 5000,
          height: 5000,
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom / 100})`,
          transformOrigin: '0 0',
          backgroundImage: 'radial-gradient(circle, #2e3134 1px, transparent 1px)',
          backgroundSize: '20px 20px'
        }}>
          {/* SVG Edges */}
          <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
            <defs>
              <marker id="arrow" markerUnits="userSpaceOnUse" markerWidth="10" markerHeight="10" refX="8.5" refY="4.5" orient="auto">
                <path d="M0,0 L9,4.5 L0,9 Z" fill="#85898d"></path>
              </marker>
            </defs>
            {edges.map(edge => {
              const from = nodes.find(n => n.id === edge.from)
              const to = nodes.find(n => n.id === edge.to)
              if (!from || !to) return null
              const x1 = from.x + 150
              const y1 = from.y + 25
              const x2 = to.x
              const y2 = to.y + 25
              const cx1 = x1 + 50
              const cx2 = x2 - 50
              return (
                <path
                  key={edge.id}
                  d={`M${x1},${y1} C${cx1},${y1} ${cx2},${y2} ${x2},${y2}`}
                  stroke="#85898d"
                  strokeWidth="2"
                  fill="none"
                  markerEnd="url(#arrow)"
                />
              )
            })}
            {connecting && (
              <path
                d={`M${(nodes.find(n => n.id === connecting)?.x || 0) + 150},${(nodes.find(n => n.id === connecting)?.y || 0) + 25} L${mousePos.x},${mousePos.y}`}
                stroke="#ec4899"
                strokeWidth="2"
                strokeDasharray="5,5"
                fill="none"
              />
            )}
          </svg>

          {/* Nodes */}
          {nodes.map(node => {
            const isSelected = selected === node.id
            return (
              <div
                key={node.id}
                data-node-id={node.id}
                onMouseDown={e => { e.stopPropagation(); handleMouseDown(e, node.id) }}
                onDoubleClick={() => {
                  const newLabel = prompt('editar nodo:', node.label)
                  if (newLabel) {
                    setNodes(prev => prev.map(n => n.id === node.id ? { ...n, label: newLabel } : n))
                  }
                }}
                style={{
                  position: 'absolute',
                  left: node.x,
                  top: node.y,
                  width: 150,
                  background: '#1a1c1e',
                  border: `2px solid ${isSelected ? '#ffffff' : getNodeColor(node.type)}`,
                  borderRadius: 6,
                  cursor: 'grab',
                  userSelect: 'none',
                  boxShadow: isSelected ? '0 0 12px rgba(255,255,255,0.2)' : '0 2px 8px rgba(0,0,0,0.4)',
                  transition: dragging === node.id ? 'none' : 'box-shadow 0.2s'
                }}
              >
                <div style={{
                  padding: '6px 10px',
                  background: getNodeColor(node.type) + '22',
                  borderBottom: `1px solid ${getNodeColor(node.type)}44`,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  borderRadius: '4px 4px 0 0'
                }}>
                  <span style={{ color: getNodeColor(node.type), fontWeight: 700 }}>{getNodeIcon(node.type)}</span>
                  <span style={{ fontSize: 11, fontWeight: 600, color: '#f2f2f2', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{node.label}</span>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: statusColor(node.status) }}></span>
                </div>
                <div style={{ padding: '4px 10px', fontSize: 10, color: '#5c6166' }}>
                  {node.type} · {node.status}
                </div>
                {/* Output port */}
                <div
                  onMouseDown={e => { e.stopPropagation(); setConnecting(node.id) }}
                  style={{
                    position: 'absolute',
                    right: -6,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: 12,
                    height: 12,
                    borderRadius: '50%',
                    background: getNodeColor(node.type),
                    border: '2px solid #0b0c0d',
                    cursor: 'crosshair'
                  }}
                />
                {/* Input port */}
                <div style={{
                  position: 'absolute',
                  left: -6,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  background: '#2e3134',
                  border: '2px solid #0b0c0d'
                }} />
              </div>
            )
          })}
        </div>

        {/* Zoom bar */}
        <div style={{
          position: 'absolute',
          bottom: 10,
          right: 10,
          display: 'flex',
          gap: 4,
          alignItems: 'center',
          background: '#131416',
          border: '1px solid #2e3134',
          borderRadius: 4,
          padding: '4px 8px'
        }}>
          <button onClick={() => setZoom(z => Math.max(20, z - 10))} style={{
            background: '#1a1c1e',
            border: '1px solid #2e3134',
            color: '#c9ccd0',
            width: 24,
            height: 24,
            borderRadius: 3,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 12
          }}>−</button>
          <span style={{ fontSize: 11, minWidth: 40, textAlign: 'center' }}>{Math.round(zoom)}%</span>
          <button onClick={() => setZoom(z => Math.min(300, z + 10))} style={{
            background: '#1a1c1e',
            border: '1px solid #2e3134',
            color: '#c9ccd0',
            width: 24,
            height: 24,
            borderRadius: 3,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 12
          }}>+</button>
          <button onClick={() => { setZoom(100); setPan({ x: 0, y: 0 }) }} style={{
            background: '#1a1c1e',
            border: '1px solid #2e3134',
            color: '#c9ccd0',
            padding: '4px 8px',
            borderRadius: 3,
            cursor: 'pointer',
            fontSize: 11
          }}>1:1</button>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <aside style={{
        width: 240,
        background: '#131416',
        borderLeft: '1px solid #2e3134',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0
      }}>
        <div style={{ flex: 1, overflow: 'auto', padding: 12 }}>
          {selected ? (
            <div>
              <div style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 10, color: '#666', display: 'block', marginBottom: 4 }}>id</label>
                <div style={{ background: '#1a1c1e', padding: '4px 8px', borderRadius: 3, fontSize: 11 }}>{selected}</div>
              </div>
              <div style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 10, color: '#666', display: 'block', marginBottom: 4 }}>tipo</label>
                <div style={{ background: '#1a1c1e', padding: '4px 8px', borderRadius: 3, fontSize: 11, color: getNodeColor(nodes.find(n => n.id === selected)?.type || '') }}>
                  {nodes.find(n => n.id === selected)?.type}
                </div>
              </div>
              <div style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 10, color: '#666', display: 'block', marginBottom: 4 }}>label</label>
                <input
                  value={nodes.find(n => n.id === selected)?.label || ''}
                  onChange={e => {
                    setNodes(prev => prev.map(n => n.id === selected ? { ...n, label: e.target.value } : n))
                  }}
                  style={{ width: '100%', background: '#1a1c1e', border: '1px solid #2e3134', color: '#c9ccd0', padding: '4px 8px', borderRadius: 3, fontFamily: 'inherit', fontSize: 11 }}
                />
              </div>
              <div style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 10, color: '#666', display: 'block', marginBottom: 4 }}>estado</label>
                <select
                  value={nodes.find(n => n.id === selected)?.status || 'pending'}
                  onChange={e => {
                    setNodes(prev => prev.map(n => n.id === selected ? { ...n, status: e.target.value as any } : n))
                  }}
                  style={{ width: '100%', background: '#1a1c1e', border: '1px solid #2e3134', color: '#c9ccd0', padding: '4px 8px', borderRadius: 3, fontFamily: 'inherit', fontSize: 11 }}
                >
                  <option value="pending">pendiente</option>
                  <option value="progress">en curso</option>
                  <option value="done">hecho</option>
                </select>
              </div>
              <div style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 10, color: '#666', display: 'block', marginBottom: 4 }}>posición</label>
                <div style={{ background: '#1a1c1e', padding: '4px 8px', borderRadius: 3, fontSize: 11 }}>
                  x:{Math.round(nodes.find(n => n.id === selected)?.x || 0)} y:{Math.round(nodes.find(n => n.id === selected)?.y || 0)}
                </div>
              </div>
              <div>
                <label style={{ fontSize: 10, color: '#666', display: 'block', marginBottom: 4 }}>conexiones</label>
                <div style={{ background: '#1a1c1e', padding: '4px 8px', borderRadius: 3, fontSize: 11 }}>
                  entrada: {edges.filter(e => e.to === selected).length}<br />
                  salida: {edges.filter(e => e.from === selected).length}
                </div>
              </div>
            </div>
          ) : (
            <div style={{ color: '#666', fontSize: 11, textAlign: 'center', marginTop: 40 }}>
              selecciona un nodo para ver sus propiedades
            </div>
          )}
        </div>
      </aside>
    </div>
  )
}
