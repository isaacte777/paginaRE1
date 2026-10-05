import { useState, useRef } from 'react'

interface BudgetNode {
  id: string
  type: string
  x: number
  y: number
  label: string
  amount: number
  unit: string
  quantity: number
  unitPrice: number
  category: string
  notes?: string
}

interface BudgetEdge {
  id: string
  from: string
  to: string
}

const NODE_TYPES: Record<string, { icon: string; color: string; category: string; description: string }> = {
  // DATOS DEL PROYECTO
  project: { icon: 'P', color: '#d4d4d4', category: 'proyecto', description: 'Datos del proyecto' },
  owner: { icon: 'O', color: '#d4d4d4', category: 'proyecto', description: 'Propietario' },
  location: { icon: 'L', color: '#d4d4d4', category: 'proyecto', description: 'Ubicación' },
  area: { icon: 'A', color: '#d4d4d4', category: 'proyecto', description: 'Superficie' },
  professional: { icon: 'R', color: '#d4d4d4', category: 'proyecto', description: 'Profesional' },
  patent: { icon: '#', color: '#d4d4d4', category: 'proyecto', description: 'Patente' },

  // RUBROS
  structure: { icon: 'S', color: '#a3a3a3', category: 'rubro', description: 'Estructura portante' },
  excavation: { icon: 'E', color: '#a3a3a3', category: 'rubro', description: 'Excavación' },
  foundation: { icon: 'F', color: '#a3a3a3', category: 'rubro', description: 'Fundación' },
  column: { icon: 'C', color: '#a3a3a3', category: 'rubro', description: 'Pilares' },
  beam: { icon: 'B', color: '#a3a3a3', category: 'rubro', description: 'Vigas' },
  slab: { icon: 'L', color: '#a3a3a3', category: 'rubro', description: 'Losa' },
  wall: { icon: 'W', color: '#a3a3a3', category: 'rubro', description: 'Muros' },
  roof: { icon: 'T', color: '#a3a3a3', category: 'rubro', description: 'Cubierta' },
  finish: { icon: 'H', color: '#a3a3a3', category: 'rubro', description: 'Terminaciones' },
  install: { icon: 'I', color: '#a3a3a3', category: 'rubro', description: 'Instalaciones' },

  // MEDICIONES
  m3: { icon: '3', color: '#737373', category: 'medicion', description: 'Metros cúbicos (m3)' },
  m2: { icon: '2', color: '#737373', category: 'medicion', description: 'Metros cuadrados (m2)' },
  ml: { icon: '1', color: '#737373', category: 'medicion', description: 'Metro lineal (ml)' },
  unit: { icon: 'U', color: '#737373', category: 'medicion', description: 'Unidad' },
  kg: { icon: 'K', color: '#737373', category: 'medicion', description: 'Kilogramos' },

  // CÁLCULOS
  calc_lah: { icon: 'x', color: '#525252', category: 'calculo', description: 'Largo x Ancho x Alto' },
  calc_partial: { icon: '=', color: '#525252', category: 'calculo', description: 'Precio parcial' },
  calc_qty: { icon: 'Q', color: '#525252', category: 'calculo', description: 'Cantidad' },
  calc_pu: { icon: '$', color: '#525252', category: 'calculo', description: 'Precio unitario' },

  // TOTALES
  subtotal: { icon: 's', color: '#404040', category: 'total', description: 'Subtotal rubro' },
  iva: { icon: '%', color: '#404040', category: 'total', description: 'IVA (10%)' },
  total: { icon: 'T', color: '#404040', category: 'total', description: 'Total general' },
  budget: { icon: 'B', color: '#404040', category: 'total', description: 'Presupuesto total' },

  // MANO DE OBRA
  labor: { icon: 'M', color: '#262626', category: 'mano_obra', description: 'Mano de obra' },
  material: { icon: 'm', color: '#262626', category: 'mano_obra', description: 'Materiales' },
  equipment: { icon: 'q', color: '#262626', category: 'mano_obra', description: 'Equipos' },
  transport: { icon: 'r', color: '#262626', category: 'mano_obra', description: 'Transporte' },
}

let idCounter = 0
const genId = () => `bn${++idCounter}`

export default function FinanceFlow() {
  const [nodes, setNodes] = useState<BudgetNode[]>([
    // DATOS DEL PROYECTO
    { id: 'bn1', type: 'project', x: 80, y: 80, label: 'Casa Unifamiliar', amount: 0, unit: '', quantity: 0, unitPrice: 0, category: 'Proyecto' },
    { id: 'bn2', type: 'owner', x: 80, y: 200, label: 'Propietario', amount: 0, unit: '', quantity: 0, unitPrice: 0, category: 'Cliente' },
    { id: 'bn3', type: 'location', x: 80, y: 320, label: 'Ubicación: Asunción', amount: 0, unit: '', quantity: 0, unitPrice: 0, category: 'Dirección' },
    { id: 'bn4', type: 'area', x: 80, y: 440, label: 'Sup. Terreno: 360m2', amount: 0, unit: 'm2', quantity: 360, unitPrice: 0, category: 'Superficie' },
    { id: 'bn5', type: 'professional', x: 80, y: 560, label: 'Ing. Civil', amount: 0, unit: '', quantity: 0, unitPrice: 0, category: 'Profesional' },

    // ESTRUCTURA PORTANTE
    { id: 'bn6', type: 'structure', x: 400, y: 80, label: 'Estructura Portante', amount: 56304246, unit: 'Gs', quantity: 0, unitPrice: 0, category: 'Rubro' },
    
    // ÍTEMS DE OBRA
    { id: 'bn7', type: 'excavation', x: 700, y: 80, label: 'Excavación zapata', amount: 1276740, unit: 'm3', quantity: 14, unitPrice: 90000, category: 'Item 1.1.1' },
    { id: 'bn8', type: 'foundation', x: 700, y: 200, label: 'Zapata HºAº', amount: 12767400, unit: 'm3', quantity: 14, unitPrice: 900000, category: 'Item 1.1.4' },
    { id: 'bn9', type: 'beam', x: 700, y: 320, label: 'Vigas fundación', amount: 2214486, unit: 'm3', quantity: 18, unitPrice: 120000, category: 'Item 1.1.5' },
    { id: 'bn10', type: 'column', x: 700, y: 440, label: 'Pilares HºAº', amount: 14760000, unit: 'ml', quantity: 123, unitPrice: 120000, category: 'Item 1.1.6' },
    { id: 'bn11', type: 'beam', x: 700, y: 560, label: 'Vigas HºAº', amount: 2399026, unit: 'ml', quantity: 18, unitPrice: 130000, category: 'Item 1.1.7' },
    { id: 'bn12', type: 'slab', x: 700, y: 680, label: 'Losa RAP', amount: 21318000, unit: 'm2', quantity: 97, unitPrice: 220000, category: 'Item 1.1.8' },
    { id: 'bn13', type: 'excavation', x: 700, y: 800, label: 'Excav. vigas fund.', amount: 1568594, unit: 'm3', quantity: 18, unitPrice: 85000, category: 'Item 1.1.10' },

    // SUBTOTAL
    { id: 'bn14', type: 'subtotal', x: 1050, y: 400, label: 'Subtotal Estructura', amount: 56304246, unit: 'Gs', quantity: 0, unitPrice: 0, category: 'Subtotal' },

    // IVA Y TOTAL
    { id: 'bn15', type: 'iva', x: 1350, y: 300, label: 'IVA 10%', amount: 5118567, unit: 'Gs', quantity: 0, unitPrice: 0, category: 'Impuesto' },
    { id: 'bn16', type: 'total', x: 1350, y: 500, label: 'Total + IVA', amount: 61422814, unit: 'Gs', quantity: 0, unitPrice: 0, category: 'Total' },

    // COMPUTO METRICO
    { id: 'bn17', type: 'calc_lah', x: 1050, y: 80, label: 'Zapatas Z1-Z8', amount: 14.19, unit: 'm3', quantity: 0, unitPrice: 0, category: 'Cómputo' },
    { id: 'bn18', type: 'calc_lah', x: 1050, y: 200, label: 'Pilares P1-P8', amount: 123, unit: 'ml', quantity: 0, unitPrice: 0, category: 'Cómputo' },
    { id: 'bn19', type: 'calc_lah', x: 1050, y: 680, label: 'Vigas V1-V3', amount: 18.45, unit: 'm3', quantity: 0, unitPrice: 0, category: 'Cómputo' },
  ])

  const [edges, setEdges] = useState<BudgetEdge[]>([
    // Proyecto -> Estructura
    { id: 'be1', from: 'bn1', to: 'bn6' },
    { id: 'be2', from: 'bn2', to: 'bn6' },
    { id: 'be3', from: 'bn3', to: 'bn6' },
    { id: 'be4', from: 'bn4', to: 'bn6' },
    { id: 'be5', from: 'bn5', to: 'bn6' },

    // Estructura -> Items
    { id: 'be6', from: 'bn6', to: 'bn7' },
    { id: 'be7', from: 'bn6', to: 'bn8' },
    { id: 'be8', from: 'bn6', to: 'bn9' },
    { id: 'be9', from: 'bn6', to: 'bn10' },
    { id: 'be10', from: 'bn6', to: 'bn11' },
    { id: 'be11', from: 'bn6', to: 'bn12' },
    { id: 'be12', from: 'bn6', to: 'bn13' },

    // Items -> Subtotal
    { id: 'be13', from: 'bn7', to: 'bn14' },
    { id: 'be14', from: 'bn8', to: 'bn14' },
    { id: 'be15', from: 'bn9', to: 'bn14' },
    { id: 'be16', from: 'bn10', to: 'bn14' },
    { id: 'be17', from: 'bn11', to: 'bn14' },
    { id: 'be18', from: 'bn12', to: 'bn14' },
    { id: 'be19', from: 'bn13', to: 'bn14' },

    // Cómputo métrico
    { id: 'be20', from: 'bn7', to: 'bn17' },
    { id: 'be21', from: 'bn10', to: 'bn18' },
    { id: 'be22', from: 'bn9', to: 'bn19' },

    // Subtotal -> IVA -> Total
    { id: 'be23', from: 'bn14', to: 'bn15' },
    { id: 'be24', from: 'bn14', to: 'bn16' },
    { id: 'be25', from: 'bn15', to: 'bn16' },
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
  const [editData, setEditData] = useState<Partial<BudgetNode>>({})
  const [activeCategory, setActiveCategory] = useState<string>('all')
  const viewportRef = useRef<HTMLDivElement>(null)

  const addNode = (type: string) => {
    const info = NODE_TYPES[type]
    const newNode: BudgetNode = {
      id: genId(),
      type,
      x: 200 + Math.random() * 300,
      y: 150 + Math.random() * 200,
      label: info.description,
      amount: 0,
      unit: '',
      quantity: 0,
      unitPrice: 0,
      category: '',
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
    if (isPanning) { setIsPanning(false); return }
    if (connecting) {
      const target = (e.target as HTMLElement).closest('[data-node-id]')
      if (target) {
        const targetId = target.getAttribute('data-node-id')
        if (targetId && targetId !== connecting) {
          setEdges(prev => [...prev, { id: `be${Date.now()}`, from: connecting!, to: targetId }])
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

  const openEditModal = (node: BudgetNode) => {
    setEditData(node)
    setShowEditModal(true)
  }

  const saveEdit = () => {
    if (editData.id) {
      setNodes(prev => prev.map(n => n.id === editData.id ? { ...n, ...editData } as BudgetNode : n))
    }
    setShowEditModal(false)
  }

  const getNodeIcon = (type: string) => NODE_TYPES[type]?.icon || '?'
  const getNodeCategory = (type: string) => NODE_TYPES[type]?.category || ''

  const selectedNode = nodes.find(n => n.id === selected)
  const categories = ['all', ...Array.from(new Set(Object.values(NODE_TYPES).map(t => t.category)))]
  const filteredNodeTypes = activeCategory === 'all' 
    ? NODE_TYPES 
    : Object.fromEntries(Object.entries(NODE_TYPES).filter(([, v]) => v.category === activeCategory))

  const formatGs = (amount: number) => {
    if (amount === 0) return ''
    return 'Gs. ' + amount.toLocaleString('es-PY')
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
                background: activeCategory === cat ? '#404040' : '#1a1a1a',
                border: '1px solid #333',
                borderRadius: 3,
                color: activeCategory === cat ? '#fff' : '#ccc',
                cursor: 'pointer',
                fontSize: 9,
                textTransform: 'capitalize'
              }}
            >
              {cat.replace('_', ' ')}
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
              background: '#1a1a1a',
              border: '1px solid #333',
              borderRadius: 4,
              color: '#ccc',
              cursor: 'pointer',
              fontSize: 11,
              marginBottom: 4,
              textAlign: 'left'
            }}
          >
            <span style={{ 
              fontSize: 14, 
              fontWeight: 700,
              color: '#fff',
              fontFamily: 'monospace',
              width: 20,
              height: 20,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: '#2a2a2a',
              borderRadius: 3
            }}>{info.icon}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: '#e5e5e5' }}>{type.replace('_', ' ')}</div>
              <div style={{ fontSize: 9, color: '#666' }}>{info.description}</div>
            </div>
          </button>
        ))}

        <div style={{ marginTop: 16, padding: 10, background: '#1a1a1a', borderRadius: 4, fontSize: 10, color: '#666', lineHeight: 1.8 }}>
          <b style={{ color: '#a3a3a3' }}>Controles:</b><br />
          - <b>clic</b> en nodo = agregar<br />
          - <b>drag</b> = mover nodo<br />
          - <b>shift+drag</b> = conectar<br />
          - <b>2x clic</b> = editar<br />
          - <b>del</b> = eliminar<br />
          - <b>rueda</b> = zoom<br />
          - <b>alt+drag</b> = pan
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
          if (e.key === 'Delete' || e.key === 'Backspace') deleteSelected()
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
          <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
            <defs>
              <marker id="arrow" markerUnits="userSpaceOnUse" markerWidth="10" markerHeight="10" refX="8.5" refY="4.5" orient="auto">
                <path d="M0,0 L9,4.5 L0,9 Z" fill="#666"></path>
              </marker>
            </defs>
            {edges.map(edge => {
              const from = nodes.find(n => n.id === edge.from)
              const to = nodes.find(n => n.id === edge.to)
              if (!from || !to) return null
              const x1 = from.x + 200
              const y1 = from.y + 45
              const x2 = to.x
              const y2 = to.y + 45
              const cx1 = x1 + 60
              const cx2 = x2 - 60
              return (
                <path
                  key={edge.id}
                  d={`M${x1},${y1} C${cx1},${y1} ${cx2},${y2} ${x2},${y2}`}
                  stroke="#555"
                  strokeWidth="2"
                  fill="none"
                  markerEnd="url(#arrow)"
                />
              )
            })}
            {connecting && (
              <path
                d={`M${(nodes.find(n => n.id === connecting)?.x || 0) + 200},${(nodes.find(n => n.id === connecting)?.y || 0) + 45} L${mousePos.x},${mousePos.y}`}
                stroke="#a3a3a3"
                strokeWidth="2"
                strokeDasharray="5,5"
                fill="none"
              />
            )}
          </svg>

          {nodes.map(node => {
            const isSelected = selected === node.id
            const nodeInfo = NODE_TYPES[node.type]
            const nodeColor = nodeInfo?.color || '#666'
            
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
                  width: 200,
                  background: '#1a1a1a',
                  border: `2px solid ${isSelected ? '#fff' : '#404040'}`,
                  borderRadius: 8,
                  cursor: 'grab',
                  userSelect: 'none',
                  boxShadow: isSelected ? '0 0 20px rgba(255,255,255,0.2)' : '0 4px 12px rgba(0,0,0,0.5)',
                  transition: dragging === node.id ? 'none' : 'box-shadow 0.2s'
                }}
              >
                <div style={{
                  padding: '10px 12px',
                  background: '#222',
                  borderBottom: '1px solid #333',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  borderRadius: '6px 6px 0 0'
                }}>
                  <span style={{ 
                    fontSize: 16, 
                    fontWeight: 700,
                    color: '#fff',
                    fontFamily: 'monospace',
                    width: 24,
                    height: 24,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: '#333',
                    borderRadius: 4
                  }}>{getNodeIcon(node.type)}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 11, fontWeight: 600, color: '#e5e5e5' }}>{node.label}</div>
                    <div style={{ fontSize: 9, color: '#666' }}>{node.category || getNodeCategory(node.type)}</div>
                  </div>
                </div>
                <div style={{ padding: '8px 12px', fontSize: 10 }}>
                  {node.amount > 0 && (
                    <div style={{ color: '#e5e5e5', fontWeight: 700, fontSize: 12, marginBottom: 2 }}>
                      {formatGs(node.amount)}
                    </div>
                  )}
                  {node.quantity > 0 && (
                    <div style={{ color: '#a3a3a3', fontSize: 10 }}>
                      Cant: {node.quantity} {node.unit} x {formatGs(node.unitPrice)}
                    </div>
                  )}
                </div>
                {/* Output port */}
                <div
                  onMouseDown={e => { e.stopPropagation(); setConnecting(node.id) }}
                  style={{
                    position: 'absolute',
                    right: -8,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: 14,
                    height: 14,
                    borderRadius: '50%',
                    background: '#666',
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
                  width: 14,
                  height: 14,
                  borderRadius: '50%',
                  background: '#444',
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
          border: '1px solid #333',
          borderRadius: 4,
          padding: '4px 8px'
        }}>
          <button onClick={() => setZoom(z => Math.max(20, z - 10))} style={{
            background: '#1a1a1a', border: '1px solid #333', color: '#ccc',
            width: 24, height: 24, borderRadius: 3, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12
          }}>-</button>
          <span style={{ fontSize: 11, minWidth: 40, textAlign: 'center' }}>{Math.round(zoom)}%</span>
          <button onClick={() => setZoom(z => Math.min(300, z + 10))} style={{
            background: '#1a1a1a', border: '1px solid #333', color: '#ccc',
            width: 24, height: 24, borderRadius: 3, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12
          }}>+</button>
          <button onClick={() => { setZoom(100); setPan({ x: 0, y: 0 }) }} style={{
            background: '#1a1a1a', border: '1px solid #333', color: '#ccc',
            padding: '4px 8px', borderRadius: 3, cursor: 'pointer', fontSize: 11
          }}>1:1</button>
        </div>
      </div>

      {/* RIGHT PANEL */}
      {selectedNode && (
        <aside style={{
          width: 280,
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
            <label style={{ display: 'block', fontSize: 10, color: '#666', marginBottom: 4 }}>ID</label>
            <div style={{ background: '#1a1a1a', padding: '6px 10px', borderRadius: 4, fontSize: 11 }}>{selectedNode.id}</div>
          </div>
          <div style={{ marginBottom: 12 }}>
            <label style={{ display: 'block', fontSize: 10, color: '#666', marginBottom: 4 }}>Tipo</label>
            <div style={{ background: '#1a1a1a', padding: '6px 10px', borderRadius: 4, fontSize: 11, color: '#e5e5e5' }}>
              <span style={{ fontWeight: 700, fontFamily: 'monospace', marginRight: 6 }}>{getNodeIcon(selectedNode.type)}</span>
              {selectedNode.type.replace('_', ' ')}
            </div>
          </div>
          <div style={{ marginBottom: 12 }}>
            <label style={{ display: 'block', fontSize: 10, color: '#666', marginBottom: 4 }}>Label</label>
            <div style={{ background: '#1a1a1a', padding: '6px 10px', borderRadius: 4, fontSize: 11, color: '#e5e5e5' }}>{selectedNode.label}</div>
          </div>
          <div style={{ marginBottom: 12 }}>
            <label style={{ display: 'block', fontSize: 10, color: '#666', marginBottom: 4 }}>Monto</label>
            <div style={{ background: '#1a1a1a', padding: '6px 10px', borderRadius: 4, fontSize: 14, fontWeight: 700, color: '#fff' }}>
              {formatGs(selectedNode.amount)}
            </div>
          </div>
          {selectedNode.quantity > 0 && (
            <>
              <div style={{ marginBottom: 12 }}>
                <label style={{ display: 'block', fontSize: 10, color: '#666', marginBottom: 4 }}>Cantidad</label>
                <div style={{ background: '#1a1a1a', padding: '6px 10px', borderRadius: 4, fontSize: 11 }}>{selectedNode.quantity} {selectedNode.unit}</div>
              </div>
              <div style={{ marginBottom: 12 }}>
                <label style={{ display: 'block', fontSize: 10, color: '#666', marginBottom: 4 }}>Precio Unitario</label>
                <div style={{ background: '#1a1a1a', padding: '6px 10px', borderRadius: 4, fontSize: 11 }}>{formatGs(selectedNode.unitPrice)}</div>
              </div>
            </>
          )}
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 10, color: '#666', marginBottom: 4 }}>Categoría</label>
            <div style={{ background: '#1a1a1a', padding: '6px 10px', borderRadius: 4, fontSize: 11 }}>{selectedNode.category || '-'}</div>
          </div>
          <button onClick={() => openEditModal(selectedNode)} style={{
            width: '100%', padding: '8px', background: '#404040', border: 'none',
            borderRadius: 4, color: '#fff', cursor: 'pointer', fontFamily: 'inherit',
            fontSize: 11, fontWeight: 600, marginBottom: 8
          }}>
            Editar
          </button>
          <button onClick={deleteSelected} style={{
            width: '100%', padding: '8px', background: '#333', border: 'none',
            borderRadius: 4, color: '#ccc', cursor: 'pointer', fontFamily: 'inherit',
            fontSize: 11, fontWeight: 600
          }}>
            Eliminar
          </button>
        </aside>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.8)', display: 'flex',
          alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }} onClick={() => setShowEditModal(false)}>
          <div style={{
            background: '#131416', border: '1px solid #333',
            borderRadius: 8, padding: 24, width: 420
          }} onClick={e => e.stopPropagation()}>
            <h3 style={{ margin: '0 0 20px', color: '#a3a3a3', fontSize: 14 }}>Editar Item</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label style={{ display: 'block', fontSize: 10, color: '#666', marginBottom: 4 }}>Label</label>
                <input value={editData.label || ''} onChange={e => setEditData({ ...editData, label: e.target.value })}
                  style={{ width: '100%', background: '#0b0c0d', border: '1px solid #333', color: '#ccc', padding: '8px 10px', borderRadius: 4, fontFamily: 'inherit', fontSize: 11 }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 10, color: '#666', marginBottom: 4 }}>Cantidad</label>
                  <input type="number" step="0.01" value={editData.quantity || 0}
                    onChange={e => setEditData({ ...editData, quantity: parseFloat(e.target.value) || 0 })}
                    style={{ width: '100%', background: '#0b0c0d', border: '1px solid #333', color: '#ccc', padding: '8px 10px', borderRadius: 4, fontFamily: 'inherit', fontSize: 11 }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 10, color: '#666', marginBottom: 4 }}>Unidad</label>
                  <select value={editData.unit || ''} onChange={e => setEditData({ ...editData, unit: e.target.value })}
                    style={{ width: '100%', background: '#0b0c0d', border: '1px solid #333', color: '#ccc', padding: '8px 10px', borderRadius: 4, fontFamily: 'inherit', fontSize: 11 }}>
                    <option value="">--</option>
                    <option value="m3">m3</option>
                    <option value="m2">m2</option>
                    <option value="ml">ml</option>
                    <option value="kg">kg</option>
                    <option value="unit">unidad</option>
                    <option value="Gs">Gs</option>
                  </select>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 10, color: '#666', marginBottom: 4 }}>Precio Unitario (Gs)</label>
                  <input type="number" step="1" value={editData.unitPrice || 0}
                    onChange={e => setEditData({ ...editData, unitPrice: parseFloat(e.target.value) || 0 })}
                    style={{ width: '100%', background: '#0b0c0d', border: '1px solid #333', color: '#ccc', padding: '8px 10px', borderRadius: 4, fontFamily: 'inherit', fontSize: 11 }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 10, color: '#666', marginBottom: 4 }}>Monto Total (Gs)</label>
                  <input type="number" step="1" value={editData.amount || 0}
                    onChange={e => setEditData({ ...editData, amount: parseFloat(e.target.value) || 0 })}
                    style={{ width: '100%', background: '#0b0c0d', border: '1px solid #333', color: '#ccc', padding: '8px 10px', borderRadius: 4, fontFamily: 'inherit', fontSize: 11 }} />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 10, color: '#666', marginBottom: 4 }}>Categoría</label>
                <input value={editData.category || ''} onChange={e => setEditData({ ...editData, category: e.target.value })}
                  style={{ width: '100%', background: '#0b0c0d', border: '1px solid #333', color: '#ccc', padding: '8px 10px', borderRadius: 4, fontFamily: 'inherit', fontSize: 11 }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 10, color: '#666', marginBottom: 4 }}>Notas</label>
                <textarea value={editData.notes || ''} onChange={e => setEditData({ ...editData, notes: e.target.value })} rows={3}
                  style={{ width: '100%', background: '#0b0c0d', border: '1px solid #333', color: '#ccc', padding: '8px 10px', borderRadius: 4, fontFamily: 'inherit', fontSize: 11, resize: 'vertical' }} />
              </div>
              <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                <button onClick={saveEdit} style={{
                  flex: 1, padding: '10px', background: '#404040', border: 'none',
                  borderRadius: 4, color: '#fff', cursor: 'pointer', fontFamily: 'inherit', fontSize: 11, fontWeight: 600
                }}>Guardar</button>
                <button onClick={() => setShowEditModal(false)} style={{
                  flex: 1, padding: '10px', background: '#333', border: 'none',
                  borderRadius: 4, color: '#ccc', cursor: 'pointer', fontFamily: 'inherit', fontSize: 11
                }}>Cancelar</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
