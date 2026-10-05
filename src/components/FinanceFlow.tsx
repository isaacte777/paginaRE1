import { useState, useRef } from 'react'

interface FinanceNode {
  id: string
  type: string
  x: number
  y: number
  label: string
  amount: number
  category: string
  date: string
  status: 'pending' | 'completed'
  notes?: string
}

interface FinanceEdge {
  id: string
  from: string
  to: string
}

const FINANCE_NODE_TYPES: Record<string, { icon: string; color: string; category: string; description: string }> = {
  // INGRESOS
  income: { icon: '💰', color: '#e5e5e5', category: 'ingresos', description: 'Ingreso general' },
  salary: { icon: '💼', color: '#e5e5e5', category: 'ingresos', description: 'Salario mensual' },
  freelance: { icon: '💻', color: '#e5e5e5', category: 'ingresos', description: 'Trabajo freelance' },
  sales: { icon: '🛒', color: '#e5e5e5', category: 'ingresos', description: 'Ventas de productos' },
  services: { icon: '🔧', color: '#e5e5e5', category: 'ingresos', description: 'Servicios técnicos' },
  investment: { icon: '📈', color: '#e5e5e5', category: 'ingresos', description: 'Retorno de inversión' },
  
  // EGRESOS
  expense: { icon: '💸', color: '#a3a3a3', category: 'egresos', description: 'Gasto general' },
  rent: { icon: '🏢', color: '#a3a3a3', category: 'egresos', description: 'Alquiler local' },
  utilities: { icon: '💡', color: '#a3a3a3', category: 'egresos', description: 'Servicios básicos' },
  supplies: { icon: '📦', color: '#a3a3a3', category: 'egresos', description: 'Insumos y materiales' },
  equipment: { icon: '🖥️', color: '#a3a3a3', category: 'egresos', description: 'Equipos y hardware' },
  software: { icon: '💿', color: '#a3a3a3', category: 'egresos', description: 'Licencias de software' },
  marketing: { icon: '📢', color: '#a3a3a3', category: 'egresos', description: 'Publicidad y marketing' },
  
  // INVENTARIO
  inventory: { icon: '📊', color: '#737373', category: 'inventario', description: 'Stock de productos' },
  purchase: { icon: '🛍️', color: '#737373', category: 'inventario', description: 'Compra de mercadería' },
  stock_in: { icon: '📥', color: '#737373', category: 'inventario', description: 'Entrada de stock' },
  stock_out: { icon: '📤', color: '#737373', category: 'inventario', description: 'Salida de stock' },
  
  // PAGOS
  payment: { icon: '💳', color: '#525252', category: 'pagos', description: 'Pago a proveedores' },
  loan: { icon: '🏦', color: '#525252', category: 'pagos', description: 'Préstamos' },
  taxes: { icon: '📋', color: '#525252', category: 'pagos', description: 'Impuestos' },
  insurance: { icon: '🛡️', color: '#525252', category: 'pagos', description: 'Seguros' },
  
  // AHORRO E INVERSIÓN
  savings: { icon: '🏦', color: '#404040', category: 'ahorro', description: 'Ahorro mensual' },
  emergency: { icon: '🚨', color: '#404040', category: 'ahorro', description: 'Fondo de emergencia' },
  
  // MÉTRICAS
  total_income: { icon: '💎', color: '#262626', category: 'metricas', description: 'Total de ingresos' },
  total_expense: { icon: '💔', color: '#262626', category: 'metricas', description: 'Total de egresos' },
  balance: { icon: '⚖️', color: '#262626', category: 'metricas', description: 'Balance final' },
  profit: { icon: '📊', color: '#262626', category: 'metricas', description: 'Ganancia neta' },
  
  // GRÁFICOS
  chart_pie: { icon: '🥧', color: '#171717', category: 'graficos', description: 'Gráfico circular' },
  chart_line: { icon: '📈', color: '#171717', category: 'graficos', description: 'Gráfico de líneas' },
  chart_bar: { icon: '📊', color: '#171717', category: 'graficos', description: 'Gráfico de barras' },
}

let idCounter = 0
const genId = () => `fn${++idCounter}`

export default function FinanceFlow() {
  const [nodes, setNodes] = useState<FinanceNode[]>([
    // INGRESOS DEL MES
    { id: 'fn1', type: 'salary', x: 80, y: 80, label: 'Salario Febrero', amount: 2500, category: 'Salario', date: '2026-02-01', status: 'completed' },
    { id: 'fn2', type: 'freelance', x: 80, y: 220, label: 'Proyecto Web Cliente', amount: 1200, category: 'Freelance', date: '2026-02-05', status: 'completed' },
    { id: 'fn3', type: 'sales', x: 80, y: 360, label: 'Ventas Tienda', amount: 3500, category: 'Ventas', date: '2026-02-28', status: 'completed' },
    { id: 'fn4', type: 'services', x: 80, y: 500, label: 'Servicios Técnicos', amount: 800, category: 'Servicios', date: '2026-02-20', status: 'completed' },
    
    // TOTAL INGRESOS
    { id: 'fn5', type: 'total_income', x: 400, y: 280, label: 'Total Ingresos', amount: 8000, category: 'Total', date: '2026-02-28', status: 'completed' },
    
    // EGRESOS OPERATIVOS
    { id: 'fn6', type: 'rent', x: 700, y: 80, label: 'Alquiler Local', amount: 1200, category: 'Vivienda', date: '2026-02-01', status: 'completed' },
    { id: 'fn7', type: 'utilities', x: 700, y: 200, label: 'Luz + Internet', amount: 180, category: 'Servicios', date: '2026-02-15', status: 'completed' },
    { id: 'fn8', type: 'supplies', x: 700, y: 320, label: 'Insumos Oficina', amount: 250, category: 'Materiales', date: '2026-02-10', status: 'completed' },
    { id: 'fn9', type: 'software', x: 700, y: 440, label: 'Licencias Software', amount: 150, category: 'Software', date: '2026-02-01', status: 'completed' },
    { id: 'fn10', type: 'marketing', x: 700, y: 560, label: 'Publicidad Facebook', amount: 300, category: 'Marketing', date: '2026-02-12', status: 'completed' },
    
    // INVENTARIO
    { id: 'fn11', type: 'purchase', x: 1000, y: 150, label: 'Compra Mercadería', amount: 2000, category: 'Inventario', date: '2026-02-08', status: 'completed' },
    { id: 'fn12', type: 'equipment', x: 1000, y: 350, label: 'Nuevo Monitor', amount: 450, category: 'Equipos', date: '2026-02-18', status: 'completed' },
    
    // PAGOS
    { id: 'fn13', type: 'loan', x: 1300, y: 200, label: 'Cuota Préstamo', amount: 350, category: 'Préstamos', date: '2026-02-15', status: 'completed' },
    { id: 'fn14', type: 'taxes', x: 1300, y: 400, label: 'Impuestos Mensuales', amount: 280, category: 'Impuestos', date: '2026-02-25', status: 'completed' },
    
    // TOTAL EGRESOS
    { id: 'fn15', type: 'total_expense', x: 1600, y: 300, label: 'Total Egresos', amount: 5310, category: 'Total', date: '2026-02-28', status: 'completed' },
    
    // BALANCE Y AHORRO
    { id: 'fn16', type: 'balance', x: 1900, y: 200, label: 'Balance Final', amount: 2690, category: 'Balance', date: '2026-02-28', status: 'completed' },
    { id: 'fn17', type: 'profit', x: 1900, y: 400, label: 'Ganancia Neta', amount: 2690, category: 'Ganancia', date: '2026-02-28', status: 'completed' },
    { id: 'fn18', type: 'savings', x: 2200, y: 300, label: 'Ahorro Mensual', amount: 2000, category: 'Ahorro', date: '2026-02-28', status: 'completed' },
    
    // GRÁFICOS
    { id: 'fn19', type: 'chart_pie', x: 2500, y: 150, label: 'Distribución Gastos', amount: 0, category: 'Gráfico', date: '2026-02-28', status: 'completed' },
    { id: 'fn20', type: 'chart_line', x: 2500, y: 350, label: 'Tendencia Mensual', amount: 0, category: 'Gráfico', date: '2026-02-28', status: 'completed' },
    { id: 'fn21', type: 'chart_bar', x: 2500, y: 550, label: 'Ingresos vs Egresos', amount: 0, category: 'Gráfico', date: '2026-02-28', status: 'completed' },
  ])
  
  const [edges, setEdges] = useState<FinanceEdge[]>([
    // Ingresos -> Total Ingresos
    { id: 'fe1', from: 'fn1', to: 'fn5' },
    { id: 'fe2', from: 'fn2', to: 'fn5' },
    { id: 'fe3', from: 'fn3', to: 'fn5' },
    { id: 'fe4', from: 'fn4', to: 'fn5' },
    
    // Total Ingresos -> Egresos
    { id: 'fe5', from: 'fn5', to: 'fn6' },
    { id: 'fe6', from: 'fn5', to: 'fn7' },
    { id: 'fe7', from: 'fn5', to: 'fn8' },
    { id: 'fe8', from: 'fn5', to: 'fn9' },
    { id: 'fe9', from: 'fn5', to: 'fn10' },
    
    // Egresos -> Inventario
    { id: 'fe10', from: 'fn6', to: 'fn11' },
    { id: 'fe11', from: 'fn7', to: 'fn12' },
    
    // Inventario -> Pagos
    { id: 'fe12', from: 'fn11', to: 'fn13' },
    { id: 'fe13', from: 'fn12', to: 'fn14' },
    
    // Pagos -> Total Egresos
    { id: 'fe14', from: 'fn13', to: 'fn15' },
    { id: 'fe15', from: 'fn14', to: 'fn15' },
    
    // Total Ingresos y Egresos -> Balance
    { id: 'fe16', from: 'fn5', to: 'fn16' },
    { id: 'fe17', from: 'fn15', to: 'fn16' },
    { id: 'fe18', from: 'fn16', to: 'fn17' },
    
    // Balance -> Ahorro
    { id: 'fe19', from: 'fn17', to: 'fn18' },
    
    // Ahorro -> Gráficos
    { id: 'fe20', from: 'fn18', to: 'fn19' },
    { id: 'fe21', from: 'fn18', to: 'fn20' },
    { id: 'fe22', from: 'fn15', to: 'fn21' },
  ])

  const [selected, setSelected] = useState<string | null>(null)
  const [zoom, setZoom] = useState(100)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [dragging, setDragging] = useState<string | null>(null)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [connecting, setConnecting] = useState<string | null>(null)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const [isPanning, setIsPanning] = useState(false)
  const [panStart, setPanStart] = useState({ x: 0, y: 0 })
  const [showEditModal, setShowEditModal] = useState(false)
  const [editData, setEditData] = useState<Partial<FinanceNode>>({})
  const [activeCategory, setActiveCategory] = useState<string>('all')
  const viewportRef = useRef<HTMLDivElement>(null)

  const addNode = (type: string) => {
    const info = FINANCE_NODE_TYPES[type]
    const newNode: FinanceNode = {
      id: genId(),
      type,
      x: 200 + Math.random() * 300,
      y: 150 + Math.random() * 200,
      label: info.description,
      amount: 0,
      category: '',
      date: new Date().toISOString().split('T')[0],
      status: 'completed'
    }
    setNodes(prev => [...prev, newNode])
  }

  const deleteSelected = () => {
    if (!selected) return
    setNodes(prev => prev.filter(n => n.id !== selected))
    setEdges(prev => prev.filter(e => e.from !== selected && e.to !== selected))
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
          setEdges(prev => [...prev, { id: `fe${Date.now()}`, from: connecting!, to: targetId }])
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

  const openEditModal = (node: FinanceNode) => {
    setEditData(node)
    setShowEditModal(true)
  }

  const saveEdit = () => {
    if (editData.id) {
      setNodes(prev => prev.map(n => n.id === editData.id ? { ...n, ...editData } as FinanceNode : n))
    }
    setShowEditModal(false)
  }

  const getNodeColor = (type: string) => FINANCE_NODE_TYPES[type]?.color || '#666'
  const getNodeIcon = (type: string) => FINANCE_NODE_TYPES[type]?.icon || '?'
  const getNodeCategory = (type: string) => FINANCE_NODE_TYPES[type]?.category || ''

  const selectedNode = nodes.find(n => n.id === selected)

  const categories = ['all', ...Array.from(new Set(Object.values(FINANCE_NODE_TYPES).map(t => t.category)))]

  const filteredNodeTypes = activeCategory === 'all' 
    ? FINANCE_NODE_TYPES 
    : Object.fromEntries(Object.entries(FINANCE_NODE_TYPES).filter(([, v]) => v.category === activeCategory))

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
        width: 220,
        background: '#131416',
        borderRight: '1px solid #2e3134',
        overflowY: 'auto',
        padding: '12px',
        flexShrink: 0
      }}>
        <h4 style={{ color: '#a3a3a3', fontSize: 10, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>
          Categorías
        </h4>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 16 }}>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              style={{
                padding: '4px 8px',
                background: activeCategory === cat ? '#404040' : '#1a1c1e',
                border: '1px solid #2e3134',
                borderRadius: 3,
                color: activeCategory === cat ? '#fff' : '#c9ccd0',
                cursor: 'pointer',
                fontSize: 9,
                textTransform: 'capitalize'
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {Object.entries(filteredNodeTypes).map(([type, info]) => (
          <button 
            key={type} 
            onClick={() => addNode(type)} 
            title={info.description}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              width: '100%',
              padding: '8px 10px',
              background: '#1a1c1e',
              border: '1px solid #2e3134',
              borderRadius: 4,
              color: '#c9ccd0',
              cursor: 'pointer',
              fontSize: 11,
              marginBottom: 4,
              textAlign: 'left'
            }}
          >
            <span style={{ fontSize: 16 }}>{info.icon}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, fontWeight: 600 }}>{type.replace('_', ' ')}</div>
              <div style={{ fontSize: 9, color: '#5c6166' }}>{info.description}</div>
            </div>
          </button>
        ))}

        <div style={{ marginTop: 16, padding: 10, background: '#1a1c1e', borderRadius: 4, fontSize: 10, color: '#5c6166', lineHeight: 1.8 }}>
          <b style={{ color: '#8b9095' }}>Controles:</b><br />
          • <b>clic</b> en nodo = agregar<br />
          • <b>drag</b> = mover nodo<br />
          • <b>shift+drag</b> = conectar<br />
          • <b>2x clic</b> = editar<br />
          • <b>del</b> = eliminar seleccionado<br />
          • <b>rueda</b> = zoom<br />
          • <b>alt+drag</b> = pan
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
          setZoom(z => Math.max(20, Math.min(300, z - e.deltaY * 0.1)))
        }}
        onKeyDown={e => {
          if (e.key === 'Delete' || e.key === 'Backspace') {
            deleteSelected()
          }
        }}
        tabIndex={0}
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
              const x1 = from.x + 180
              const y1 = from.y + 40
              const x2 = to.x
              const y2 = to.y + 40
              const cx1 = x1 + 60
              const cx2 = x2 - 60
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
                d={`M${(nodes.find(n => n.id === connecting)?.x || 0) + 180},${(nodes.find(n => n.id === connecting)?.y || 0) + 40} L${mousePos.x},${mousePos.y}`}
                stroke="#a3a3a3"
                strokeWidth="2"
                strokeDasharray="5,5"
                fill="none"
              />
            )}
          </svg>

          {/* Nodes */}
          {nodes.map(node => {
            const isSelected = selected === node.id
            const nodeColor = getNodeColor(node.type)
            
            return (
              <div
                key={node.id}
                data-node-id={node.id}
                onMouseDown={e => { e.stopPropagation(); handleMouseDown(e, node.id) }}
                onDoubleClick={() => openEditModal(node)}
                style={{
                  position: 'absolute',
                  left: node.x,
                  top: node.y,
                  width: 180,
                  background: '#1a1c1e',
                  border: `2px solid ${isSelected ? '#ffffff' : nodeColor}`,
                  borderRadius: 8,
                  cursor: 'grab',
                  userSelect: 'none',
                  boxShadow: isSelected ? '0 0 15px rgba(255,255,255,0.3)' : '0 4px 12px rgba(0,0,0,0.5)',
                  transition: dragging === node.id ? 'none' : 'box-shadow 0.2s'
                }}
              >
                <div style={{
                  padding: '10px 12px',
                  background: nodeColor + '22',
                  borderBottom: `1px solid ${nodeColor}44`,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  borderRadius: '6px 6px 0 0'
                }}>
                  <span style={{ fontSize: 20 }}>{getNodeIcon(node.type)}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: '#f2f2f2' }}>{node.label}</div>
                    <div style={{ fontSize: 10, color: '#5c6166' }}>{node.category || getNodeCategory(node.type)}</div>
                  </div>
                </div>
                <div style={{ padding: '8px 12px', fontSize: 11 }}>
                  {node.amount > 0 && (
                    <div style={{ color: nodeColor, fontWeight: 700, fontSize: 14, marginBottom: 4 }}>
                      ${node.amount.toFixed(2)}
                    </div>
                  )}
                  <div style={{ color: '#5c6166', fontSize: 10 }}>{node.date}</div>
                </div>
                {/* Output port */}
                <div
                  onMouseDown={e => { e.stopPropagation(); setConnecting(node.id) }}
                  style={{
                    position: 'absolute',
                    right: -8,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: 16,
                    height: 16,
                    borderRadius: '50%',
                    background: nodeColor,
                    border: '3px solid #0b0c0d',
                    cursor: 'crosshair'
                  }}
                />
                {/* Input port */}
                <div style={{
                  position: 'absolute',
                  left: -8,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: 16,
                  height: 16,
                  borderRadius: '50%',
                  background: '#2e3134',
                  border: '3px solid #0b0c0d'
                }} />
              </div>
            )
          })}
        </div>

        {/* Zoom controls */}
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

      {/* RIGHT PANEL - Properties */}
      {selectedNode && (
        <aside style={{
          width: 260,
          background: '#131416',
          borderLeft: '1px solid #2e3134',
          padding: 16,
          overflowY: 'auto',
          flexShrink: 0
        }}>
          <h3 style={{ color: '#a3a3a3', fontSize: 11, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 16 }}>
            Propiedades
          </h3>
          <div style={{ marginBottom: 12 }}>
            <label style={{ display: 'block', fontSize: 10, color: '#5c6166', marginBottom: 4 }}>ID</label>
            <div style={{ background: '#1a1c1e', padding: '6px 10px', borderRadius: 4, fontSize: 11 }}>{selectedNode.id}</div>
          </div>
          <div style={{ marginBottom: 12 }}>
            <label style={{ display: 'block', fontSize: 10, color: '#5c6166', marginBottom: 4 }}>Tipo</label>
            <div style={{ background: '#1a1c1e', padding: '6px 10px', borderRadius: 4, fontSize: 11, color: getNodeColor(selectedNode.type) }}>
              {getNodeIcon(selectedNode.type)} {selectedNode.type.replace('_', ' ')}
            </div>
          </div>
          <div style={{ marginBottom: 12 }}>
            <label style={{ display: 'block', fontSize: 10, color: '#5c6166', marginBottom: 4 }}>Monto</label>
            <div style={{ background: '#1a1c1e', padding: '6px 10px', borderRadius: 4, fontSize: 14, fontWeight: 700, color: getNodeColor(selectedNode.type) }}>
              ${selectedNode.amount.toFixed(2)}
            </div>
          </div>
          <div style={{ marginBottom: 12 }}>
            <label style={{ display: 'block', fontSize: 10, color: '#5c6166', marginBottom: 4 }}>Categoría</label>
            <div style={{ background: '#1a1c1e', padding: '6px 10px', borderRadius: 4, fontSize: 11 }}>{selectedNode.category || '-'}</div>
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 10, color: '#5c6166', marginBottom: 4 }}>Fecha</label>
            <div style={{ background: '#1a1c1e', padding: '6px 10px', borderRadius: 4, fontSize: 11 }}>{selectedNode.date}</div>
          </div>
          <button onClick={() => openEditModal(selectedNode)} style={{
            width: '100%',
            padding: '8px',
            background: '#404040',
            border: 'none',
            borderRadius: 4,
            color: '#fff',
            cursor: 'pointer',
            fontFamily: 'inherit',
            fontSize: 11,
            fontWeight: 600,
            marginBottom: 8
          }}>
            ✏️ Editar
          </button>
          <button onClick={deleteSelected} style={{
            width: '100%',
            padding: '8px',
            background: '#ef4444',
            border: 'none',
            borderRadius: 4,
            color: '#fff',
            cursor: 'pointer',
            fontFamily: 'inherit',
            fontSize: 11,
            fontWeight: 600
          }}>
            🗑️ Eliminar
          </button>
        </aside>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }} onClick={() => setShowEditModal(false)}>
          <div style={{
            background: '#131416',
            border: '1px solid #2e3134',
            borderRadius: 8,
            padding: 24,
            width: 400
          }} onClick={e => e.stopPropagation()}>
            <h3 style={{ margin: '0 0 20px', color: '#a3a3a3', fontSize: 14 }}>Editar Nodo</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label style={{ display: 'block', fontSize: 10, color: '#5c6166', marginBottom: 4 }}>Label</label>
                <input
                  value={editData.label || ''}
                  onChange={e => setEditData({ ...editData, label: e.target.value })}
                  style={{
                    width: '100%',
                    background: '#0b0c0d',
                    border: '1px solid #2e3134',
                    color: '#c9ccd0',
                    padding: '8px 10px',
                    borderRadius: 4,
                    fontFamily: 'inherit',
                    fontSize: 11
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 10, color: '#5c6166', marginBottom: 4 }}>Monto</label>
                <input
                  type="number"
                  step="0.01"
                  value={editData.amount || 0}
                  onChange={e => setEditData({ ...editData, amount: parseFloat(e.target.value) || 0 })}
                  style={{
                    width: '100%',
                    background: '#0b0c0d',
                    border: '1px solid #2e3134',
                    color: '#c9ccd0',
                    padding: '8px 10px',
                    borderRadius: 4,
                    fontFamily: 'inherit',
                    fontSize: 11
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 10, color: '#5c6166', marginBottom: 4 }}>Categoría</label>
                <input
                  value={editData.category || ''}
                  onChange={e => setEditData({ ...editData, category: e.target.value })}
                  style={{
                    width: '100%',
                    background: '#0b0c0d',
                    border: '1px solid #2e3134',
                    color: '#c9ccd0',
                    padding: '8px 10px',
                    borderRadius: 4,
                    fontFamily: 'inherit',
                    fontSize: 11
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 10, color: '#5c6166', marginBottom: 4 }}>Fecha</label>
                <input
                  type="date"
                  value={editData.date || ''}
                  onChange={e => setEditData({ ...editData, date: e.target.value })}
                  style={{
                    width: '100%',
                    background: '#0b0c0d',
                    border: '1px solid #2e3134',
                    color: '#c9ccd0',
                    padding: '8px 10px',
                    borderRadius: 4,
                    fontFamily: 'inherit',
                    fontSize: 11
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 10, color: '#5c6166', marginBottom: 4 }}>Notas</label>
                <textarea
                  value={editData.notes || ''}
                  onChange={e => setEditData({ ...editData, notes: e.target.value })}
                  rows={3}
                  style={{
                    width: '100%',
                    background: '#0b0c0d',
                    border: '1px solid #2e3134',
                    color: '#c9ccd0',
                    padding: '8px 10px',
                    borderRadius: 4,
                    fontFamily: 'inherit',
                    fontSize: 11,
                    resize: 'vertical'
                  }}
                />
              </div>
              <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                <button onClick={saveEdit} style={{
                  flex: 1,
                  padding: '10px',
                  background: '#404040',
                  border: 'none',
                  borderRadius: 4,
                  color: '#fff',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  fontSize: 11,
                  fontWeight: 600
                }}>
                  Guardar
                </button>
                <button onClick={() => setShowEditModal(false)} style={{
                  flex: 1,
                  padding: '10px',
                  background: '#2e3134',
                  border: 'none',
                  borderRadius: 4,
                  color: '#c9ccd0',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  fontSize: 11
                }}>
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
