import { useState, useRef, useCallback, useEffect } from 'react'
import FinanceFlow from './components/FinanceFlow'

interface Node {
  id: string
  type: string
  x: number
  y: number
  label: string
  status: 'pending' | 'progress' | 'done'
  config: Record<string, string>
}

interface Edge {
  id: string
  from: string
  to: string
}

const NODE_TYPES: Record<string, { icon: string; color: string; category: string }> = {
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

const TEMPLATES = [
  { value: '', label: 'plantillas::' },
  { value: 'comparacion_precios', label: 'comparacion_precios' },
  { value: 'orquestador', label: 'orquestador_ia' },
  { value: 'web', label: 'proyecto_web' },
  { value: 'contratacion', label: 'contratacion_personal' },
  { value: 'personal', label: 'plan_personal' },
  { value: 'complex', label: 'pipeline_complejo' },
  { value: 'blank', label: 'lienzo_blanco' },
]

let idCounter = 0
const genId = () => `n${++idCounter}`

export default function App() {
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
  const [showChat, setShowChat] = useState(false)
  const [chatTab, setChatTab] = useState<'ia' | 'agente' | 'sync' | 'diag'>('ia')
  const [chatMessages, setChatMessages] = useState<{ role: string; text: string }[]>([])
  const [chatInput, setChatInput] = useState('')
  const [showExport, setShowExport] = useState(false)
  const [snap, setSnap] = useState(true)
  const [filterStatus, setFilterStatus] = useState('')
  const [undoStack, setUndoStack] = useState<{ nodes: Node[]; edges: Edge[] }[]>([])
  const [showConsole, setShowConsole] = useState(true)
  const [projectTitle, setProjectTitle] = useState('orquestador_paginaRE')
  const [searchText, setSearchText] = useState('')
  const [rightTab, setRightTab] = useState<'props' | 'stats'>('props')
  const [currentView, setCurrentView] = useState<'flow' | 'finance_flow'>('flow')
  const [financeTemplate, setFinanceTemplate] = useState<'computo' | 'family'>('computo')
  const viewportRef = useRef<HTMLDivElement>(null)
  const [viewSize, setViewSize] = useState({ w: 800, h: 600 })

  useEffect(() => {
    const updateSize = () => {
      if (viewportRef.current) {
        setViewSize({ w: viewportRef.current.clientWidth, h: viewportRef.current.clientHeight })
      }
    }
    updateSize()
    window.addEventListener('resize', updateSize)
    return () => window.removeEventListener('resize', updateSize)
  }, [])

  const addLog = useCallback((msg: string) => {
    setConsoleLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`])
  }, [])

  const saveState = () => {
    setUndoStack(prev => [...prev.slice(-20), { nodes: [...nodes], edges: [...edges] }])
  }

  const addNode = (type: string) => {
    saveState()
    const info = NODE_TYPES[type]
    const newNode: Node = {
      id: genId(),
      type,
      x: 200 + Math.random() * 300,
      y: 150 + Math.random() * 200,
      label: `${type}()`,
      status: 'pending',
      config: {}
    }
    setNodes(prev => [...prev, newNode])
    addLog(`[+] nodo creado: ${newNode.label}`)
  }

  const deleteSelected = () => {
    if (!selected) return
    saveState()
    setNodes(prev => prev.filter(n => n.id !== selected))
    setEdges(prev => prev.filter(e => e.from !== selected && e.to !== selected))
    addLog(`[x] nodo eliminado: ${selected}`)
    setSelected(null)
  }

  const undo = () => {
    if (undoStack.length === 0) return
    const last = undoStack[undoStack.length - 1]
    setUndoStack(prev => prev.slice(0, -1))
    setNodes(last.nodes)
    setEdges(last.edges)
    addLog('[<] deshacer')
  }

  const redo = () => {
    addLog('[>] rehacer (no disponible)')
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
        if (snap) {
          newX = Math.round(newX / 20) * 20
          newY = Math.round(newY / 20) * 20
        }
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
          saveState()
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

  const runFlow = () => {
    addLog('[▶] ejecutando flujo...')
    setNodes(prev => prev.map(n => ({ ...n, status: 'pending' as const })))
    
    const startNodes = nodes.filter(n => n.type === 'start')
    if (startNodes.length === 0) {
      addLog('[!] error: no hay nodo de inicio')
      return
    }

    let step = 0
    const processNode = (nodeId: string) => {
      setTimeout(() => {
        setNodes(prev => prev.map(n => n.id === nodeId ? { ...n, status: 'progress' as const } : n))
        addLog(`[~] ejecutando: ${nodes.find(n => n.id === nodeId)?.label}`)
        
        setTimeout(() => {
          setNodes(prev => prev.map(n => n.id === nodeId ? { ...n, status: 'done' as const } : n))
          const nextEdges = edges.filter(e => e.from === nodeId)
          nextEdges.forEach(edge => processNode(edge.to))
          if (nextEdges.length === 0) {
            addLog('[✓] flujo completado')
          }
        }, 500)
      }, step * 600)
      step++
    }

    startNodes.forEach(n => processNode(n.id))
  }

  const fitView = () => {
    if (nodes.length === 0) return
    const xs = nodes.map(n => n.x)
    const ys = nodes.map(n => n.y)
    const minX = Math.min(...xs) - 50
    const minY = Math.min(...ys) - 50
    const maxX = Math.max(...xs) + 200
    const maxY = Math.max(...ys) + 100
    const scaleX = viewSize.w / (maxX - minX)
    const scaleY = viewSize.h / (maxY - minY)
    const newZoom = Math.min(scaleX, scaleY, 1.5) * 100
    setZoom(Math.round(newZoom))
    setPan({ x: -minX * (newZoom / 100) + 50, y: -minY * (newZoom / 100) + 50 })
  }

  const sendChatMessage = () => {
    if (!chatInput.trim()) return
    setChatMessages(prev => [...prev, { role: 'user', text: chatInput }])
    addLog(`[chat] ${chatInput}`)
    setTimeout(() => {
      setChatMessages(prev => [...prev, { role: 'ai', text: 'Entendido. Procesando tu solicitud con Qwen...' }])
    }, 800)
    setChatInput('')
  }

  const exportMermaid = () => {
    let md = 'graph TD\n'
    nodes.forEach(n => {
      md += `  ${n.id}["${n.label}"]\n`
    })
    edges.forEach(e => {
      md += `  ${e.from} --> ${e.to}\n`
    })
    navigator.clipboard.writeText(md)
    addLog('[export] mermaid copiado al portapapeles')
  }

  const newNode = () => {
    saveState()
    setNodes([])
    setEdges([])
    setSelected(null)
    addLog('[new] diagrama reseteado')
  }

  const selectedNode = nodes.find(n => n.id === selected)
  const filteredNodes = filterStatus ? nodes.filter(n => n.status === filterStatus) : nodes

  const getNodeColor = (type: string) => NODE_TYPES[type]?.color || '#666'
  const getNodeIcon = (type: string) => NODE_TYPES[type]?.icon || '?'

  const statusColor = (s: string) => {
    if (s === 'done') return '#d4d4d4'
    if (s === 'progress') return '#a3a3a3'
    return '#525252'
  }

  // Si la vista actual es finance_flow, renderizar FamilyFinanceFlow
  if (currentView === 'finance_flow') {
    return (
      <div style={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        background: '#0b0c0d',
        color: '#c9ccd0',
        fontFamily: "'JetBrains Mono', ui-monospace, monospace",
        fontSize: '12px',
        overflow: 'hidden'
      }}>
        {/* Navigation Bar */}
        <div style={{
          background: '#131416',
          borderBottom: '1px solid #2e3134',
          padding: '8px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <button
            onClick={() => setCurrentView('flow')}
            style={{
              background: '#1a1c1e',
              border: '1px solid #2e3134',
              color: '#c9ccd0',
              padding: '8px 20px',
              borderRadius: 4,
              cursor: 'pointer',
              fontFamily: 'inherit',
              fontSize: 12,
              fontWeight: 600
            }}
          >
            ⚡ Flujo
          </button>
          <button
            style={{
              background: '#404040',
              border: 'none',
              color: '#fff',
              padding: '8px 20px',
              borderRadius: 4,
              cursor: 'pointer',
              fontFamily: 'inherit',
              fontSize: 12,
              fontWeight: 600
            }}
          >
            💰 Finanzas
          </button>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px' }}>
            <button
              onClick={() => setFinanceTemplate('computo')}
              style={{
                background: financeTemplate === 'computo' ? '#404040' : '#1a1c1e',
                border: '1px solid #2e3134',
                color: financeTemplate === 'computo' ? '#fff' : '#c9ccd0',
                padding: '6px 16px',
                borderRadius: 4,
                cursor: 'pointer',
                fontFamily: 'inherit',
                fontSize: 11,
                fontWeight: financeTemplate === 'computo' ? 600 : 400
              }}
            >
              🏗️ Cómputo Gere
            </button>
            <button
              onClick={() => setFinanceTemplate('family')}
              style={{
                background: financeTemplate === 'family' ? '#404040' : '#1a1c1e',
                border: '1px solid #2e3134',
                color: financeTemplate === 'family' ? '#fff' : '#c9ccd0',
                padding: '6px 16px',
                borderRadius: 4,
                cursor: 'pointer',
                fontFamily: 'inherit',
                fontSize: 11,
                fontWeight: financeTemplate === 'family' ? 600 : 400
              }}
            >
              👨‍👩‍👧 Sistema Familiar
            </button>
          </div>
        </div>
        <FinanceFlow />
      </div>
    )
  }

  return (
    <div style={{
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      background: '#0b0c0d',
      color: '#c9ccd0',
      fontFamily: "'JetBrains Mono', ui-monospace, monospace",
      fontSize: '12px',
      overflow: 'hidden'
    }}>
      {/* Navigation Bar */}
      <div style={{
        background: '#131416',
        borderBottom: '1px solid #2e3134',
        padding: '8px 20px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
      }}>
        <button
          style={{
            background: '#ec4899',
            border: 'none',
            color: '#fff',
            padding: '8px 20px',
            borderRadius: 4,
            cursor: 'pointer',
            fontFamily: 'inherit',
            fontSize: 12,
            fontWeight: 600
          }}
        >
          ⚡ Flujo
        </button>
        <button
          onClick={() => setCurrentView('finance_flow')}
          style={{
            background: '#1a1c1e',
            border: '1px solid #2e3134',
            color: '#c9ccd0',
            padding: '8px 20px',
            borderRadius: 4,
            cursor: 'pointer',
            fontFamily: 'inherit',
            fontSize: 12,
            fontWeight: 600
          }}
        >
          💰 Finanzas
        </button>
      </div>

      {/* HEADER */}
      <header style={{
        background: '#131416',
        borderBottom: '1px solid #2e3134',
        padding: '8px 12px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        flexWrap: 'wrap',
        zIndex: 100
      }}>
        <div style={{ display: 'flex', gap: '3px' }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#ef4444' }}></span>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#f59e0b' }}></span>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981' }}></span>
        </div>
        <div style={{ fontWeight: 700, color: '#e5e5e5' }}>
          flowlab <span style={{ color: '#666' }}>--paginaRE</span>
        </div>
        <input
          value={projectTitle}
          onChange={e => setProjectTitle(e.target.value)}
          style={{
            background: '#1a1c1e',
            border: '1px solid #2e3134',
            color: '#c9ccd0',
            padding: '4px 8px',
            borderRadius: 3,
            fontFamily: 'inherit',
            fontSize: 11,
            width: 160
          }}
          placeholder="título_proyecto"
        />
        <input
          value={searchText}
          onChange={e => setSearchText(e.target.value)}
          style={{
            background: '#1a1c1e',
            border: '1px solid #2e3134',
            color: '#c9ccd0',
            padding: '4px 8px',
            borderRadius: 3,
            fontFamily: 'inherit',
            fontSize: 11,
            width: 120
          }}
          placeholder="/buscar"
        />
        <span style={{ fontSize: 10, color: '#666' }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#666', display: 'inline-block', marginRight: 4 }}></span>
          Claude+Qwen activo
        </span>
        <div style={{ flex: 1 }}></div>
        <select style={{ background: '#1a1c1e', border: '1px solid #2e3134', color: '#c9ccd0', padding: '4px 8px', borderRadius: 3, fontFamily: 'inherit', fontSize: 11 }}>
          {TEMPLATES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
        </select>
        <button style={btnStyle} title="exportar json">.json</button>
        <button style={btnStyle} title="importar json">abrir</button>
        <button onClick={exportMermaid} style={btnStyle} title="exportar mermaid">.md</button>
        <button style={btnStyle} title="exportar png">.png</button>
        <button onClick={() => setShowChat(true)} style={btnStyle} title="panel de chat">💬</button>
        <button style={btnStyle} title="inspector">🔍</button>
        <button onClick={() => setShowExport(!showExport)} style={btnStyle} title="exportar">📦</button>
        <button onClick={newNode} style={{ ...btnStyle, background: '#404040', color: '#fff', border: 'none' }} title="nuevo diagrama">nuevo</button>
      </header>

      {/* MAIN */}
      <main style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
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
            <button key={type} onClick={() => addNode(type)} style={toolStyle(info.color)}>
              <span style={{ width: 18, textAlign: 'center' }}>{info.icon}</span>
              {type}()
            </button>
          ))}
          <h4 style={{ color: '#a3a3a3', fontSize: 10, textTransform: 'uppercase', letterSpacing: 1, margin: '12px 0 8px' }}>datos</h4>
          {Object.entries(NODE_TYPES).filter(([, v]) => v.category === 'datos').map(([type, info]) => (
            <button key={type} onClick={() => addNode(type)} style={toolStyle(info.color)}>
              <span style={{ width: 18, textAlign: 'center' }}>{info.icon}</span>
              {type}()
            </button>
          ))}
          <h4 style={{ color: '#a3a3a3', fontSize: 10, textTransform: 'uppercase', letterSpacing: 1, margin: '12px 0 8px' }}>sistema</h4>
          {Object.entries(NODE_TYPES).filter(([, v]) => v.category === 'sistema').map(([type, info]) => (
            <button key={type} onClick={() => addNode(type)} style={toolStyle(info.color)}>
              <span style={{ width: 18, textAlign: 'center' }}>{info.icon}</span>
              {type}()
            </button>
          ))}
          <h4 style={{ color: '#a3a3a3', fontSize: 10, textTransform: 'uppercase', letterSpacing: 1, margin: '12px 0 8px' }}>inteligencia</h4>
          {Object.entries(NODE_TYPES).filter(([, v]) => v.category === 'inteligencia').map(([type, info]) => (
            <button key={type} onClick={() => addNode(type)} style={toolStyle(info.color)}>
              <span style={{ width: 18, textAlign: 'center' }}>{info.icon}</span>
              {type}()
            </button>
          ))}
          <h4 style={{ color: '#a3a3a3', fontSize: 10, textTransform: 'uppercase', letterSpacing: 1, margin: '12px 0 8px' }}>edición</h4>
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            style={{ width: '100%', background: '#1a1c1e', border: '1px solid #2e3134', color: '#c9ccd0', padding: '4px', borderRadius: 3, fontFamily: 'inherit', fontSize: 11, marginBottom: 4 }}
          >
            <option value="">filtro: todos</option>
            <option value="pending">[ ] pendiente</option>
            <option value="progress">[~] en curso</option>
            <option value="done">[✓] hecho</option>
          </select>
          <button onClick={undo} style={toolStyle('#6366f1')}>[&lt;] deshacer</button>
          <button onClick={redo} style={toolStyle('#6366f1')}>[&gt;] rehacer</button>
          <button onClick={deleteSelected} style={toolStyle('#ef4444')}>[x] eliminar</button>
          <button onClick={fitView} style={toolStyle('#10b981')}>[ ] ajustar_vista</button>
          <div style={{ marginTop: 12, padding: 8, background: '#1a1c1e', borderRadius: 4, fontSize: 10, color: '#666', lineHeight: 1.6 }}>
            <b style={{ color: '#8b9095' }}>clic der</b> desplazar · <b style={{ color: '#8b9095' }}>rueda</b> zoom<br />
            <b style={{ color: '#8b9095' }}>2x clic</b> editar · <b style={{ color: '#8b9095' }}>puerto ●</b> conectar<br />
            <b style={{ color: '#8b9095' }}>supr</b> eliminar · <b style={{ color: '#8b9095' }}>drag</b> mover
          </div>
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
                <marker id="arrowSel" markerUnits="userSpaceOnUse" markerWidth="11" markerHeight="11" refX="9" refY="4.5" orient="auto">
                  <path d="M0,0 L9,4.5 L0,9 Z" fill="#ffffff"></path>
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
            {filteredNodes.map(node => {
              const isSelected = selected === node.id
              return (
                <div
                  key={node.id}
                  data-node-id={node.id}
                  onMouseDown={e => { e.stopPropagation(); handleMouseDown(e, node.id) }}
                  onDoubleClick={() => {
                    const newLabel = prompt('editar nodo:', node.label)
                    if (newLabel) {
                      saveState()
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

          {/* Minimap */}
          <div style={{
            position: 'absolute',
            bottom: 10,
            left: 10,
            width: 170,
            height: 120,
            background: '#131416',
            border: '1px solid #2e3134',
            borderRadius: 4,
            overflow: 'hidden'
          }}>
            <svg width="170" height="120" style={{ opacity: 0.7 }}>
              {nodes.map(n => (
                <rect key={n.id} x={n.x / 30} y={n.y / 30} width={4} height={3} fill={getNodeColor(n.type)} rx={1} />
              ))}
            </svg>
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
            <button onClick={() => setZoom(z => Math.max(20, z - 10))} style={{ ...miniBtn }}>−</button>
            <span style={{ fontSize: 11, minWidth: 40, textAlign: 'center' }}>{Math.round(zoom)}%</span>
            <button onClick={() => setZoom(z => Math.min(300, z + 10))} style={{ ...miniBtn }}>+</button>
            <button onClick={() => { setZoom(100); setPan({ x: 0, y: 0 }) }} style={{ ...miniBtn }}>1:1</button>
            <button onClick={fitView} style={{ ...miniBtn }}>fit</button>
            <button onClick={() => setSnap(!snap)} style={{ ...miniBtn, background: snap ? '#10b981' : '#2e3134', color: snap ? '#fff' : '#8b9095' }}>⌗</button>
            <select value="1" style={{ fontSize: 11, background: '#1a1c1e', border: '1px solid #2e3134', color: '#c9ccd0', padding: '2px 4px', borderRadius: 3 }}>
              <option value="0.5">0.5x</option>
              <option value="1">1x</option>
              <option value="2">2x</option>
              <option value="4">4x</option>
            </select>
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
          <div style={{ display: 'flex', borderBottom: '1px solid #2e3134' }}>
            <button onClick={() => setRightTab('props')} style={{ ...tabBtn, background: rightTab === 'props' ? '#1a1c1e' : 'transparent', color: rightTab === 'props' ? '#e5e5e5' : '#666' }}>props</button>
            <button onClick={() => setRightTab('stats')} style={{ ...tabBtn, background: rightTab === 'stats' ? '#1a1c1e' : 'transparent', color: rightTab === 'stats' ? '#e5e5e5' : '#666' }}>stats</button>
          </div>
          <div style={{ flex: 1, overflow: 'auto', padding: 12 }}>
            {rightTab === 'props' && selectedNode ? (
              <div>
                <div style={{ marginBottom: 12 }}>
                  <label style={{ fontSize: 10, color: '#666', display: 'block', marginBottom: 4 }}>id</label>
                  <div style={{ background: '#1a1c1e', padding: '4px 8px', borderRadius: 3, fontSize: 11 }}>{selectedNode.id}</div>
                </div>
                <div style={{ marginBottom: 12 }}>
                  <label style={{ fontSize: 10, color: '#666', display: 'block', marginBottom: 4 }}>label</label>
                  <input
                    value={selectedNode.label}
                    onChange={e => {
                      saveState()
                      setNodes(prev => prev.map(n => n.id === selectedNode.id ? { ...n, label: e.target.value } : n))
                    }}
                    style={{ width: '100%', background: '#1a1c1e', border: '1px solid #2e3134', color: '#c9ccd0', padding: '4px 8px', borderRadius: 3, fontFamily: 'inherit', fontSize: 11 }}
                  />
                </div>
                <div style={{ marginBottom: 12 }}>
                  <label style={{ fontSize: 10, color: '#666', display: 'block', marginBottom: 4 }}>tipo</label>
                  <div style={{ background: '#1a1c1e', padding: '4px 8px', borderRadius: 3, fontSize: 11, color: getNodeColor(selectedNode.type) }}>{selectedNode.type}</div>
                </div>
                <div style={{ marginBottom: 12 }}>
                  <label style={{ fontSize: 10, color: '#666', display: 'block', marginBottom: 4 }}>estado</label>
                  <select
                    value={selectedNode.status}
                    onChange={e => {
                      saveState()
                      setNodes(prev => prev.map(n => n.id === selectedNode.id ? { ...n, status: e.target.value as Node['status'] } : n))
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
                    x:{Math.round(selectedNode.x)} y:{Math.round(selectedNode.y)}
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: 10, color: '#666', display: 'block', marginBottom: 4 }}>conexiones</label>
                  <div style={{ background: '#1a1c1e', padding: '4px 8px', borderRadius: 3, fontSize: 11 }}>
                    entrada: {edges.filter(e => e.to === selectedNode.id).length}<br />
                    salida: {edges.filter(e => e.from === selectedNode.id).length}
                  </div>
                </div>
              </div>
            ) : rightTab === 'props' ? (
              <div style={{ color: '#666', fontSize: 11, textAlign: 'center', marginTop: 40 }}>
                selecciona un nodo para ver sus propiedades
              </div>
            ) : (
              <div>
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 10, color: '#666', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>diagrama</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    <div style={{ background: '#1a1c1e', padding: 8, borderRadius: 4 }}>
                      <div style={{ fontSize: 18, fontWeight: 700, color: '#e5e5e5' }}>{nodes.length}</div>
                      <div style={{ fontSize: 10, color: '#666' }}>nodos</div>
                    </div>
                    <div style={{ background: '#1a1c1e', padding: 8, borderRadius: 4 }}>
                      <div style={{ fontSize: 18, fontWeight: 700, color: '#e5e5e5' }}>{edges.length}</div>
                      <div style={{ fontSize: 10, color: '#666' }}>conexiones</div>
                    </div>
                    <div style={{ background: '#1a1c1e', padding: 8, borderRadius: 4 }}>
                      <div style={{ fontSize: 18, fontWeight: 700, color: '#d4d4d4' }}>{nodes.filter(n => n.status === 'done').length}</div>
                      <div style={{ fontSize: 10, color: '#666' }}>completados</div>
                    </div>
                    <div style={{ background: '#1a1c1e', padding: 8, borderRadius: 4 }}>
                      <div style={{ fontSize: 18, fontWeight: 700, color: '#a3a3a3' }}>{nodes.filter(n => n.status === 'progress').length}</div>
                      <div style={{ fontSize: 10, color: '#666' }}>en curso</div>
                    </div>
                  </div>
                </div>
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 10, color: '#666', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>tipos</div>
                  {Object.entries(NODE_TYPES).map(([type, info]) => {
                    const count = nodes.filter(n => n.type === type).length
                    if (count === 0) return null
                    return (
                      <div key={type} style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0', fontSize: 11 }}>
                        <span style={{ color: info.color }}>{info.icon} {type}</span>
                        <span style={{ color: '#666' }}>{count}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        </aside>
      </main>

      {/* CONSOLE */}
      {showConsole && (
        <div style={{ height: 150, background: '#0b0c0d', borderTop: '1px solid #2e3134', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 12px', background: '#131416', borderBottom: '1px solid #2e3134' }}>
            <button onClick={runFlow} style={{ ...btnStyle, background: '#404040', color: '#fff', border: 'none', padding: '3px 12px' }}>▶ ejecutar</button>
            <button onClick={() => setConsoleLogs([])} style={{ ...btnStyle, padding: '3px 12px' }}>limpiar</button>
            <button onClick={() => setShowConsole(false)} style={{ ...btnStyle, padding: '3px 12px' }}>▲</button>
            <span style={{ fontSize: 10, color: '#666' }}>sync: Claude Code + Qwen Coder</span>
          </div>
          <div style={{ flex: 1, overflow: 'auto', padding: '8px 12px', fontFamily: "'JetBrains Mono', monospace", fontSize: 11 }}>
            {consoleLogs.map((log, i) => (
              <div key={i} style={{ color: log.includes('[!]') || log.includes('[x]') ? '#ef4444' : log.includes('[✓]') ? '#10b981' : log.includes('[~]') ? '#f59e0b' : '#8b9095', lineHeight: 1.8 }}>
                {log}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* FOOTER */}
      <footer style={{
        background: '#131416',
        borderTop: '1px solid #2e3134',
        padding: '4px 12px',
        display: 'flex',
        gap: 16,
        fontSize: 10,
        color: '#666',
        alignItems: 'center'
      }}>
        <span>nodos: {nodes.length}</span>
        <span>conexiones: {edges.length}</span>
        <span>zoom: {Math.round(zoom)}%</span>
        <span style={{ color: '#666' }}>idle</span>
        <span style={{ flex: 1 }}></span>
        <span>auto-guardado</span>
        <span>FlowLab v3 · Centro de Control paginaRE</span>
      </footer>

      {/* CHAT MODAL */}
      {showChat && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }} onClick={() => setShowChat(false)}>
          <div style={{
            width: 500,
            height: 500,
            background: '#131416',
            border: '1px solid #2e3134',
            borderRadius: 8,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', borderBottom: '1px solid #2e3134' }}>
              {(['ia', 'agente', 'sync', 'diag'] as const).map(tab => (
                <button key={tab} onClick={() => setChatTab(tab)} style={{ ...tabBtn, background: chatTab === tab ? '#1a1c1e' : 'transparent', color: chatTab === tab ? '#e5e5e5' : '#666', textTransform: 'capitalize' }}>
                  {tab}
                </button>
              ))}
              <button onClick={() => setShowChat(false)} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#666', cursor: 'pointer', padding: '8px 12px', fontSize: 14 }}>✕</button>
            </div>
            {chatTab === 'ia' && (
              <>
                <div style={{ flex: 1, overflow: 'auto', padding: 12 }}>
                  {chatMessages.length === 0 && (
                    <div style={{ color: '#666', textAlign: 'center', marginTop: 40, fontSize: 11 }}>
                      pregunta a la IA sobre tu flujo...
                    </div>
                  )}
                  {chatMessages.map((msg, i) => (
                    <div key={i} style={{ marginBottom: 12, padding: 8, background: msg.role === 'user' ? '#1a1c1e' : '#0b0c0d', borderRadius: 4, borderLeft: `2px solid ${msg.role === 'user' ? '#ec4899' : '#10b981'}` }}>
                      <div style={{ fontSize: 10, color: '#666', marginBottom: 4 }}>{msg.role === 'user' ? 'tú' : 'Qwen IA'}</div>
                      <div style={{ fontSize: 12, color: '#ccc' }}>{msg.text}</div>
                    </div>
                  ))}
                </div>
                <div style={{ padding: 12, borderTop: '1px solid #2e3134', display: 'flex', gap: 8 }}>
                  <input
                    value={chatInput}
                    onChange={e => setChatInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && sendChatMessage()}
                    placeholder="Pregunta a la IA..."
                    style={{ flex: 1, background: '#1a1c1e', border: '1px solid #2e3134', color: '#c9ccd0', padding: '6px 10px', borderRadius: 4, fontFamily: 'inherit', fontSize: 12 }}
                  />
                  <button onClick={sendChatMessage} style={{ ...btnStyle, background: '#404040', color: '#fff', border: 'none' }}>enviar</button>
                </div>
              </>
            )}
            {chatTab === 'agente' && (
              <div style={{ flex: 1, padding: 12, color: '#666', fontSize: 11 }}>
                <div style={{ marginBottom: 12, color: '#e5e5e5', fontWeight: 600 }}>Agente Autónomo</div>
                <div style={{ background: '#1a1c1e', padding: 8, borderRadius: 4, marginBottom: 8 }}>
                  Estado: <span style={{ color: '#10b981' }}>activo</span>
                </div>
                <div style={{ background: '#1a1c1e', padding: 8, borderRadius: 4, marginBottom: 8 }}>
                  Tareas completadas: {nodes.filter(n => n.status === 'done').length}/{nodes.length}
                </div>
                <div style={{ background: '#1a1c1e', padding: 8, borderRadius: 4 }}>
                  Próxima acción: {nodes.find(n => n.status === 'pending')?.label || 'sin tareas pendientes'}
                </div>
              </div>
            )}
            {chatTab === 'sync' && (
              <div style={{ flex: 1, padding: 12, color: '#666', fontSize: 11 }}>
                <div style={{ marginBottom: 12, color: '#e5e5e5', fontWeight: 600 }}>Sync · Claude+Qwen</div>
                <div style={{ background: '#1a1c1e', padding: 8, borderRadius: 4, marginBottom: 8 }}>
                  Claude Code: <span style={{ color: '#10b981' }}>conectado</span>
                </div>
                <div style={{ background: '#1a1c1e', padding: 8, borderRadius: 4, marginBottom: 8 }}>
                  Qwen Coder: <span style={{ color: '#10b981' }}>conectado</span>
                </div>
                <div style={{ background: '#1a1c1e', padding: 8, borderRadius: 4 }}>
                  Última sync: hace 2 min
                </div>
              </div>
            )}
            {chatTab === 'diag' && (
              <div style={{ flex: 1, padding: 12, color: '#666', fontSize: 11 }}>
                <div style={{ marginBottom: 12, color: '#e5e5e5', fontWeight: 600 }}>Diagnóstico</div>
                <pre style={{ background: '#0b0c0d', padding: 8, borderRadius: 4, overflow: 'auto', fontSize: 10, lineHeight: 1.6 }}>
{`{
  "version": "3.0",
  "nodes": ${nodes.length},
  "edges": ${edges.length},
  "zoom": ${zoom},
  "status": "operational",
  "modules_loaded": 19,
  "claude_sync": true,
  "qwen_active": true
}`}
                </pre>
              </div>
            )}
          </div>
        </div>
      )}

      {/* EXPORT POPOVER */}
      {showExport && (
        <div style={{
          position: 'fixed',
          top: 60,
          right: 20,
          width: 320,
          background: '#131416',
          border: '1px solid #2e3134',
          borderRadius: 8,
          zIndex: 500,
          boxShadow: '0 10px 40px rgba(0,0,0,0.5)'
        }}>
          <div style={{ padding: '10px 14px', borderBottom: '1px solid #2e3134', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: '#e5e5e5', fontWeight: 600, fontSize: 11 }}>exportar_diagrama</span>
            <button onClick={() => setShowExport(false)} style={{ background: 'none', border: 'none', color: '#666', cursor: 'pointer' }}>✕</button>
          </div>
          <div style={{ padding: 12, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <button onClick={() => { exportMermaid(); setShowExport(false) }} style={exportCardStyle}>
              <span style={{ fontSize: 20 }}>📋</span>
              <div style={{ fontSize: 11, fontWeight: 600, color: '#c9ccd0' }}>Copiar Mermaid</div>
              <div style={{ fontSize: 10, color: '#666' }}>Copia la sintaxis</div>
            </button>
            <button onClick={() => { exportMermaid(); setShowExport(false) }} style={exportCardStyle}>
              <span style={{ fontSize: 20 }}>💾</span>
              <div style={{ fontSize: 11, fontWeight: 600, color: '#c9ccd0' }}>Descargar MD</div>
              <div style={{ fontSize: 10, color: '#666' }}>Archivo .md</div>
            </button>
            <button onClick={() => setShowExport(false)} style={exportCardStyle}>
              <span style={{ fontSize: 20 }}>🖼️</span>
              <div style={{ fontSize: 11, fontWeight: 600, color: '#c9ccd0' }}>Imagen PNG</div>
              <div style={{ fontSize: 10, color: '#666' }}>Alta resolución</div>
            </button>
            <button onClick={() => setShowExport(false)} style={exportCardStyle}>
              <span style={{ fontSize: 20 }}>📐</span>
              <div style={{ fontSize: 11, fontWeight: 600, color: '#c9ccd0' }}>Vector SVG</div>
              <div style={{ fontSize: 10, color: '#666' }}>Escalable</div>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

const btnStyle: React.CSSProperties = {
  background: '#1a1c1e',
  border: '1px solid #2e3134',
  color: '#c9ccd0',
  padding: '4px 10px',
  borderRadius: 3,
  cursor: 'pointer',
  fontFamily: "'JetBrains Mono', monospace",
  fontSize: 11,
  transition: 'all 0.2s'
}

const miniBtn: React.CSSProperties = {
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
  fontSize: 12,
  fontFamily: "'JetBrains Mono', monospace"
}

const toolStyle = (color: string): React.CSSProperties => ({
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
  fontFamily: "'JetBrains Mono', monospace",
  marginBottom: 4,
  transition: 'all 0.2s',
  textAlign: 'left' as const
})

const tabBtn: React.CSSProperties = {
  flex: 1,
  padding: '8px 12px',
  border: 'none',
  cursor: 'pointer',
  fontFamily: "'JetBrains Mono', monospace",
  fontSize: 11,
  fontWeight: 600,
  textTransform: 'lowercase' as const
}

const exportCardStyle: React.CSSProperties = {
  background: '#1a1c1e',
  border: '1px solid #2e3134',
  borderRadius: 6,
  padding: 12,
  cursor: 'pointer',
  display: 'flex',
  flexDirection: 'column',
  gap: 4,
  alignItems: 'flex-start',
  transition: 'all 0.2s',
  textAlign: 'left' as const
}
