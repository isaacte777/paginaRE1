import { useState, useRef, useEffect } from 'react'

interface CellNode {
  id: string
  x: number
  y: number
  width: number
  height: number
  label: string
  value: number | string
  formula: string
  format: 'number' | 'currency' | 'percentage' | 'text'
  category: string
  inputs: string[]
  calculatedValue: number
  color?: string
}

interface Connection {
  id: string
  from: string
  to: string
  fromPort: string
  toPort: string
  color?: string
}

const NODE_COLORS = [
  '#d4d4d4', // Gris claro
  '#a3a3a3', // Gris medio
  '#737373', // Gris oscuro
  '#525252', // Gris más oscuro
  '#404040', // Gris muy oscuro
  '#262626', // Casi negro
  '#ef4444', // Rojo
  '#f59e0b', // Amarillo
  '#10b981', // Verde
  '#3b82f6', // Azul
  '#8b5cf6', // Púrpura
  '#ec4899', // Rosa
]

const CELL_TYPES = [
  { id: 'input', name: 'Entrada', icon: 'I', desc: 'Valor manual', color: '#d4d4d4' },
  { id: 'income', name: 'Ingreso', icon: '+', desc: 'Fuente de ingreso', color: '#a3a3a3' },
  { id: 'expense', name: 'Gasto', icon: '-', desc: 'Gasto fijo o variable', color: '#737373' },
  { id: 'debt', name: 'Deuda', icon: 'D', desc: 'Cuota de deuda', color: '#525252' },
  { id: 'calc', name: 'Cálculo', icon: 'C', desc: 'Fórmula matemática', color: '#404040' },
  { id: 'sum', name: 'Suma', icon: 'S', desc: 'SUM(inputs)', color: '#262626' },
  { id: 'total', name: 'Total', icon: 'T', desc: 'Total general', color: '#171717' },
  { id: 'currency', name: 'Moneda', icon: '$', desc: 'Formato Gs.', color: '#d4d4d4' },
  { id: 'line_chart', name: 'Gráfico Línea', icon: 'L', desc: 'Tendencia escalera', color: '#e5e5e5' },
  { id: 'pie_chart', name: 'Gráfico Circular', icon: 'O', desc: 'Distribución %', color: '#d4d4d4' },
  { id: 'bar_chart', name: 'Gráfico Barras', icon: 'B', desc: 'Comparación', color: '#a3a3a3' },
  { id: 'percentage_chart', name: 'Porcentaje', icon: '%', desc: 'Visualización %', color: '#737373' },
]

let idCounter = 0
const genId = () => `cell_${++idCounter}`

export default function FamilyFinanceFlow() {
  const [cells, setCells] = useState<CellNode[]>([
    // INGRESOS DEL MES (Octubre 2026)
    { id: 'cell_1', x: 50, y: 50, width: 180, height: 100, label: 'Sueldo Gere', value: 3500000, formula: '', format: 'currency', category: 'Ingreso', inputs: [], calculatedValue: 3500000 },
    { id: 'cell_2', x: 50, y: 180, width: 180, height: 100, label: 'Sueldo Milki', value: 2800000, formula: '', format: 'currency', category: 'Ingreso', inputs: [], calculatedValue: 2800000 },
    { id: 'cell_3', x: 50, y: 310, width: 180, height: 100, label: 'Proyecto Web', value: 1500000, formula: '', format: 'currency', category: 'Ingreso', inputs: [], calculatedValue: 1500000 },
    { id: 'cell_4', x: 50, y: 440, width: 180, height: 100, label: 'Freelance', value: 800000, formula: '', format: 'currency', category: 'Ingreso', inputs: [], calculatedValue: 800000 },

    // TOTAL INGRESOS
    { id: 'cell_5', x: 300, y: 200, width: 200, height: 120, label: 'TOTAL INGRESOS', value: 0, formula: 'SUM(cell_1, cell_2, cell_3, cell_4)', format: 'currency', category: 'Total', inputs: ['cell_1', 'cell_2', 'cell_3', 'cell_4'], calculatedValue: 8600000 },

    // GASTOS FIJOS
    { id: 'cell_6', x: 600, y: 50, width: 180, height: 100, label: 'Alquiler', value: 1500000, formula: '', format: 'currency', category: 'Gasto Fijo', inputs: [], calculatedValue: 1500000 },
    { id: 'cell_7', x: 600, y: 180, width: 180, height: 100, label: 'Supermercado', value: 850000, formula: '', format: 'currency', category: 'Gasto Fijo', inputs: [], calculatedValue: 850000 },
    { id: 'cell_8', x: 600, y: 310, width: 180, height: 100, label: 'Servicios (Luz/Agua)', value: 250000, formula: '', format: 'currency', category: 'Gasto Fijo', inputs: [], calculatedValue: 250000 },
    { id: 'cell_9', x: 600, y: 440, width: 180, height: 100, label: 'Internet', value: 180000, formula: '', format: 'currency', category: 'Gasto Fijo', inputs: [], calculatedValue: 180000 },
    { id: 'cell_10', x: 600, y: 570, width: 180, height: 100, label: 'Diezmo', value: 245000, formula: '', format: 'currency', category: 'Gasto Fijo', inputs: [], calculatedValue: 245000 },

    // GASTOS VARIABLES
    { id: 'cell_11', x: 850, y: 50, width: 180, height: 100, label: 'Combustible', value: 300000, formula: '', format: 'currency', category: 'Gasto Variable', inputs: [], calculatedValue: 300000 },
    { id: 'cell_12', x: 850, y: 180, width: 180, height: 100, label: 'Comidas Fuera', value: 200000, formula: '', format: 'currency', category: 'Gasto Variable', inputs: [], calculatedValue: 200000 },
    { id: 'cell_13', x: 850, y: 310, width: 180, height: 100, label: 'Entretenimiento', value: 150000, formula: '', format: 'currency', category: 'Gasto Variable', inputs: [], calculatedValue: 150000 },
    { id: 'cell_14', x: 850, y: 440, width: 180, height: 100, label: 'Salud', value: 100000, formula: '', format: 'currency', category: 'Gasto Variable', inputs: [], calculatedValue: 100000 },

    // DEUDAS
    { id: 'cell_15', x: 1100, y: 50, width: 180, height: 100, label: 'Cuota UENO Gere', value: 539718, formula: '', format: 'currency', category: 'Deuda', inputs: [], calculatedValue: 539718 },
    { id: 'cell_16', x: 1100, y: 180, width: 180, height: 100, label: 'Cuota UENO Milki', value: 342000, formula: '', format: 'currency', category: 'Deuda', inputs: [], calculatedValue: 342000 },
    { id: 'cell_17', x: 1100, y: 310, width: 180, height: 100, label: 'Cuota Tablet', value: 347000, formula: '', format: 'currency', category: 'Deuda', inputs: [], calculatedValue: 347000 },
    { id: 'cell_18', x: 1100, y: 440, width: 180, height: 100, label: 'Cuota iPhone', value: 300000, formula: '', format: 'currency', category: 'Deuda', inputs: [], calculatedValue: 300000 },

    // TOTAL GASTOS FIJOS
    { id: 'cell_19', x: 1350, y: 150, width: 220, height: 140, label: 'TOTAL GASTOS FIJOS', value: 0, formula: 'SUM(cell_6, cell_7, cell_8, cell_9, cell_10)', format: 'currency', category: 'Total', inputs: ['cell_6', 'cell_7', 'cell_8', 'cell_9', 'cell_10'], calculatedValue: 3025000 },

    // TOTAL GASTOS VARIABLES
    { id: 'cell_20', x: 1350, y: 350, width: 220, height: 140, label: 'TOTAL GASTOS VARIABLES', value: 0, formula: 'SUM(cell_11, cell_12, cell_13, cell_14)', format: 'currency', category: 'Total', inputs: ['cell_11', 'cell_12', 'cell_13', 'cell_14'], calculatedValue: 750000 },

    // TOTAL DEUDAS
    { id: 'cell_21', x: 1350, y: 550, width: 220, height: 140, label: 'TOTAL DEUDAS', value: 0, formula: 'SUM(cell_15, cell_16, cell_17, cell_18)', format: 'currency', category: 'Total', inputs: ['cell_15', 'cell_16', 'cell_17', 'cell_18'], calculatedValue: 1528718 },

    // TOTAL EGRESOS
    { id: 'cell_22', x: 1650, y: 300, width: 240, height: 160, label: 'TOTAL EGRESOS', value: 0, formula: 'SUM(cell_19, cell_20, cell_21)', format: 'currency', category: 'Total', inputs: ['cell_19', 'cell_20', 'cell_21'], calculatedValue: 5303718 },

    // BALANCE
    { id: 'cell_23', x: 1950, y: 200, width: 240, height: 160, label: 'BALANCE DEL MES', value: 0, formula: 'cell_5 - cell_22', format: 'currency', category: 'Total', inputs: ['cell_5', 'cell_22'], calculatedValue: 3296282 },

    // PORCENTAJE DE AHORRO
    { id: 'cell_24', x: 1950, y: 420, width: 240, height: 140, label: '% AHORRO', value: 0, formula: '(cell_23 / cell_5) * 100', format: 'percentage', category: 'Métrica', inputs: ['cell_23', 'cell_5'], calculatedValue: 38.33 },

    // GRÁFICOS
    { id: 'cell_25', x: 2250, y: 50, width: 300, height: 220, label: 'Distribución de Gastos', value: 0, formula: '', format: 'percentage', category: 'Gráfico Circular', inputs: ['cell_19', 'cell_20', 'cell_21'], calculatedValue: 0 },
    { id: 'cell_26', x: 2250, y: 300, width: 300, height: 220, label: 'Ingresos vs Egresos', value: 0, formula: '', format: 'currency', category: 'Gráfico Barras', inputs: ['cell_5', 'cell_22'], calculatedValue: 0 },
    { id: 'cell_27', x: 2250, y: 550, width: 300, height: 200, label: 'Evolución Mensual', value: 0, formula: '', format: 'currency', category: 'Gráfico Línea', inputs: ['cell_1', 'cell_2', 'cell_3', 'cell_4', 'cell_5'], calculatedValue: 0 },
    { id: 'cell_28', x: 2600, y: 200, width: 280, height: 250, label: 'Porcentaje por Categoría', value: 0, formula: '', format: 'percentage', category: 'Porcentaje', inputs: ['cell_6', 'cell_7', 'cell_11', 'cell_15'], calculatedValue: 0 },
  ])

  const [connections, setConnections] = useState<Connection[]>([
    // Ingresos -> Total Ingresos
    { id: 'conn_1', from: 'cell_1', to: 'cell_5', fromPort: 'output', toPort: 'input1' },
    { id: 'conn_2', from: 'cell_2', to: 'cell_5', fromPort: 'output', toPort: 'input2' },
    { id: 'conn_3', from: 'cell_3', to: 'cell_5', fromPort: 'output', toPort: 'input3' },
    { id: 'conn_4', from: 'cell_4', to: 'cell_5', fromPort: 'output', toPort: 'input4' },

    // Gastos Fijos -> Total Gastos Fijos
    { id: 'conn_5', from: 'cell_6', to: 'cell_19', fromPort: 'output', toPort: 'input1' },
    { id: 'conn_6', from: 'cell_7', to: 'cell_19', fromPort: 'output', toPort: 'input2' },
    { id: 'conn_7', from: 'cell_8', to: 'cell_19', fromPort: 'output', toPort: 'input3' },
    { id: 'conn_8', from: 'cell_9', to: 'cell_19', fromPort: 'output', toPort: 'input4' },
    { id: 'conn_9', from: 'cell_10', to: 'cell_19', fromPort: 'output', toPort: 'input5' },

    // Gastos Variables -> Total Gastos Variables
    { id: 'conn_10', from: 'cell_11', to: 'cell_20', fromPort: 'output', toPort: 'input1' },
    { id: 'conn_11', from: 'cell_12', to: 'cell_20', fromPort: 'output', toPort: 'input2' },
    { id: 'conn_12', from: 'cell_13', to: 'cell_20', fromPort: 'output', toPort: 'input3' },
    { id: 'conn_13', from: 'cell_14', to: 'cell_20', fromPort: 'output', toPort: 'input4' },

    // Deudas -> Total Deudas
    { id: 'conn_14', from: 'cell_15', to: 'cell_21', fromPort: 'output', toPort: 'input1' },
    { id: 'conn_15', from: 'cell_16', to: 'cell_21', fromPort: 'output', toPort: 'input2' },
    { id: 'conn_16', from: 'cell_17', to: 'cell_21', fromPort: 'output', toPort: 'input3' },
    { id: 'conn_17', from: 'cell_18', to: 'cell_21', fromPort: 'output', toPort: 'input4' },

    // Totales -> Total Egresos
    { id: 'conn_18', from: 'cell_19', to: 'cell_22', fromPort: 'output', toPort: 'input1' },
    { id: 'conn_19', from: 'cell_20', to: 'cell_22', fromPort: 'output', toPort: 'input2' },
    { id: 'conn_20', from: 'cell_21', to: 'cell_22', fromPort: 'output', toPort: 'input3' },

    // Balance
    { id: 'conn_21', from: 'cell_5', to: 'cell_23', fromPort: 'output', toPort: 'input1' },
    { id: 'conn_22', from: 'cell_22', to: 'cell_23', fromPort: 'output', toPort: 'input2' },

    // Porcentaje de Ahorro
    { id: 'conn_23', from: 'cell_23', to: 'cell_24', fromPort: 'output', toPort: 'input1' },
    { id: 'conn_24', from: 'cell_5', to: 'cell_24', fromPort: 'output', toPort: 'input2' },

    // Gráficos
    { id: 'conn_25', from: 'cell_19', to: 'cell_25', fromPort: 'output', toPort: 'input1' },
    { id: 'conn_26', from: 'cell_20', to: 'cell_25', fromPort: 'output', toPort: 'input2' },
    { id: 'conn_27', from: 'cell_21', to: 'cell_25', fromPort: 'output', toPort: 'input3' },

    { id: 'conn_28', from: 'cell_5', to: 'cell_26', fromPort: 'output', toPort: 'input1' },
    { id: 'conn_29', from: 'cell_22', to: 'cell_26', fromPort: 'output', toPort: 'input2' },

    { id: 'conn_30', from: 'cell_1', to: 'cell_27', fromPort: 'output', toPort: 'input1' },
    { id: 'conn_31', from: 'cell_2', to: 'cell_27', fromPort: 'output', toPort: 'input2' },
    { id: 'conn_32', from: 'cell_3', to: 'cell_27', fromPort: 'output', toPort: 'input3' },
    { id: 'conn_33', from: 'cell_4', to: 'cell_27', fromPort: 'output', toPort: 'input4' },
    { id: 'conn_34', from: 'cell_5', to: 'cell_27', fromPort: 'output', toPort: 'input5' },

    { id: 'conn_35', from: 'cell_6', to: 'cell_28', fromPort: 'output', toPort: 'input1' },
    { id: 'conn_36', from: 'cell_7', to: 'cell_28', fromPort: 'output', toPort: 'input2' },
    { id: 'conn_37', from: 'cell_11', to: 'cell_28', fromPort: 'output', toPort: 'input3' },
    { id: 'conn_38', from: 'cell_15', to: 'cell_28', fromPort: 'output', toPort: 'input4' },
  ])

  const [selected, setSelected] = useState<string | null>(null)
  const [selectedConnection, setSelectedConnection] = useState<string | null>(null)
  const [highlightConnections, setHighlightConnections] = useState(false)
  const [zoom, setZoom] = useState(100)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [dragging, setDragging] = useState<string | null>(null)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [connecting, setConnecting] = useState<{ cellId: string; port: string } | null>(null)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const [isPanning, setIsPanning] = useState(false)
  const [panStart, setPanStart] = useState({ x: 0, y: 0 })
  const [editingCell, setEditingCell] = useState<CellNode | null>(null)
  const [resizing, setResizing] = useState<{ cellId: string; corner: string; startX: number; startY: number; startWidth: number; startHeight: number; startCellX: number; startCellY: number } | null>(null)
  const [tooltip, setTooltip] = useState<{ visible: boolean; x: number; y: number; content: string; type: 'warning' | 'info' }>({ visible: false, x: 0, y: 0, content: '', type: 'warning' })
  const viewportRef = useRef<HTMLDivElement>(null)

  const calculateCell = (cell: CellNode, allCells: CellNode[]): number => {
    if (!cell.formula) {
      return typeof cell.value === 'number' ? cell.value : 0
    }

    try {
      let formula = cell.formula
      
      const funcMatch = formula.match(/(SUM|AVG|MIN|MAX|COUNT)\(([^)]+)\)/)
      if (funcMatch) {
        const [, func, args] = funcMatch
        const cellIds = args.split(',').map(s => s.trim())
        const values = cellIds
          .map(id => allCells.find(c => c.id === id)?.calculatedValue || 0)
        
        switch (func) {
          case 'SUM': return values.reduce((a, b) => a + b, 0)
          case 'AVG': return values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0
          case 'MIN': return Math.min(...values)
          case 'MAX': return Math.max(...values)
          case 'COUNT': return values.length
        }
      }

      allCells.forEach(c => {
        const regex = new RegExp(`\\b${c.id}\\b`, 'g')
        formula = formula.replace(regex, c.calculatedValue.toString())
      })

      const result = Function(`"use strict"; return (${formula})`)()
      return typeof result === 'number' && !isNaN(result) ? result : 0
    } catch (error) {
      console.error('Error calculando fórmula:', error)
      return 0
    }
  }

  useEffect(() => {
    const recalculate = () => {
      let changed = true
      let iterations = 0
      const maxIterations = 10

      while (changed && iterations < maxIterations) {
        changed = false
        iterations++

        setCells(prevCells => {
          const newCells = prevCells.map(cell => {
            const newValue = calculateCell(cell, prevCells)
            if (newValue !== cell.calculatedValue) {
              changed = true
              return { ...cell, calculatedValue: newValue }
            }
            return cell
          })
          return newCells
        })
      }
    }

    recalculate()
  }, [cells, connections])

  const formatValue = (value: number, format: string): string => {
    switch (format) {
      case 'currency':
        return 'Gs. ' + value.toLocaleString('es-PY', { maximumFractionDigits: 0 })
      case 'percentage':
        return value.toFixed(2) + '%'
      case 'number':
        return value.toLocaleString('es-PY', { maximumFractionDigits: 2 })
      default:
        return value.toString()
    }
  }

  const addCell = (cellType: string) => {
    const type = CELL_TYPES.find(t => t.id === cellType)
    if (!type) return

    const newCell: CellNode = {
      id: genId(),
      x: 200 + Math.random() * 200,
      y: 150 + Math.random() * 200,
      width: 180,
      height: 100,
      label: type.name,
      value: 0,
      formula: '',
      format: cellType === 'currency' || cellType === 'total' ? 'currency' : 'number',
      category: type.name,
      inputs: [],
      calculatedValue: 0
    }

    setCells(prev => [...prev, newCell])
  }

  const deleteSelected = () => {
    if (!selected) return
    setCells(prev => prev.filter(c => c.id !== selected))
    setConnections(prev => prev.filter(c => c.from !== selected && c.to !== selected))
    setSelected(null)
  }

  const handleMouseDown = (e: React.MouseEvent, cellId?: string, port?: string) => {
    if (e.button === 1 || (e.button === 0 && e.altKey)) {
      setIsPanning(true)
      setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y })
      e.preventDefault()
      return
    }

    if (port && cellId) {
      setConnecting({ cellId, port })
      return
    }

    if (cellId && e.button === 0) {
      const cell = cells.find(c => c.id === cellId)
      if (cell) {
        setSelected(cellId)
        setSelectedConnection(null)
        setDragging(cellId)
        const rect = viewportRef.current?.getBoundingClientRect()
        if (rect) {
          setDragOffset({
            x: (e.clientX - rect.left - pan.x) / (zoom / 100) - cell.x,
            y: (e.clientY - rect.top - pan.y) / (zoom / 100) - cell.y
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
        newX = Math.round(newX / 10) * 10
        newY = Math.round(newY / 10) * 10
        setCells(prev => prev.map(c => c.id === dragging ? { ...c, x: newX, y: newY } : c))
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
      const target = (e.target as HTMLElement).closest('[data-cell-id][data-port]')
      if (target) {
        const targetCellId = target.getAttribute('data-cell-id')
        const targetPort = target.getAttribute('data-port')
        if (targetCellId && targetPort && targetCellId !== connecting.cellId) {
          const newConn: Connection = {
            id: `conn_${Date.now()}`,
            from: connecting.cellId,
            to: targetCellId,
            fromPort: connecting.port,
            toPort: targetPort
          }
          setConnections(prev => [...prev, newConn])
          
          setCells(prev => prev.map(c => 
            c.id === targetCellId 
              ? { ...c, inputs: [...c.inputs, connecting.cellId] }
              : c
          ))
        }
      }
      setConnecting(null)
    }

    setDragging(null)
  }

  // Función para encontrar todas las conexiones en cadena (recorrido completo)
  // Calcular el path completo solo cuando cambie la selección o highlightConnections
  const connectedPath = selected && highlightConnections ? (() => {
    const connectedConnections = new Set<string>()
    const connectedNodes = new Set<string>([selected])
    
    // Recorrido hacia adelante (outputs)
    const traverseForward = (currentNodeId: string, visited: Set<string>) => {
      if (visited.has(currentNodeId)) return
      visited.add(currentNodeId)
      
      connections.forEach(conn => {
        if (conn.from === currentNodeId) {
          connectedConnections.add(conn.id)
          connectedNodes.add(conn.to)
          traverseForward(conn.to, visited)
        }
      })
    }
    
    // Recorrido hacia atrás (inputs)
    const traverseBackward = (currentNodeId: string, visited: Set<string>) => {
      if (visited.has(currentNodeId)) return
      visited.add(currentNodeId)
      
      connections.forEach(conn => {
        if (conn.to === currentNodeId) {
          connectedConnections.add(conn.id)
          connectedNodes.add(conn.from)
          traverseBackward(conn.from, visited)
        }
      })
    }
    
    traverseForward(selected, new Set())
    traverseBackward(selected, new Set())
    
    return {
      connections: Array.from(connectedConnections),
      nodes: Array.from(connectedNodes)
    }
  })() : null

  const handleViewportClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget || (e.target as HTMLElement).id === 'world') {
      setSelected(null)
      setSelectedConnection(null)
    }
  }

  const updateCell = (cellId: string, updates: Partial<CellNode>) => {
    setCells(prev => prev.map(c => c.id === cellId ? { ...c, ...updates } : c))
  }

  const selectedCell = cells.find(c => c.id === selected)

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
        width: 240,
        background: '#131416',
        borderRight: '1px solid #2e3134',
        overflowY: 'auto',
        padding: '16px',
        flexShrink: 0
      }}>
        <h4 style={{ color: '#a3a3a3', fontSize: 11, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 16 }}>
          Tipos de Celdas
        </h4>

        {CELL_TYPES.map(cellType => (
          <button
            key={cellType.id}
            onClick={() => addCell(cellType.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              width: '100%',
              padding: '10px 12px',
              background: '#1a1a1a',
              border: '1px solid #333',
              borderRadius: 6,
              color: '#ccc',
              cursor: 'pointer',
              fontSize: 11,
              marginBottom: 6,
              textAlign: 'left'
            }}
          >
            <span style={{
              fontSize: 16,
              fontWeight: 700,
              color: '#fff',
              fontFamily: 'monospace',
              width: 28,
              height: 28,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: '#2a2a2a',
              borderRadius: 4,
              border: '2px solid #404040'
            }}>{cellType.icon}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#e5e5e5' }}>{cellType.name}</div>
              <div style={{ fontSize: 9, color: '#666' }}>{cellType.desc}</div>
            </div>
          </button>
        ))}

        <div style={{ marginTop: 20, padding: 12, background: '#1a1a1a', borderRadius: 6, fontSize: 10, color: '#666', lineHeight: 1.8 }}>
          <b style={{ color: '#a3a3a3' }}>Controles:</b><br />
          - <b>clic</b> = seleccionar celda<br />
          - <b>drag</b> = mover celda<br />
          - <b>drag puerto</b> = conectar<br />
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
          {/* SVG Connections */}
          <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
            <defs>
              <marker id="arrow" markerUnits="userSpaceOnUse" markerWidth="10" markerHeight="10" refX="8.5" refY="4.5" orient="auto">
                <path d="M0,0 L9,4.5 L0,9 Z" fill="#666"></path>
              </marker>
              <marker id="arrow-highlight" markerUnits="userSpaceOnUse" markerWidth="12" markerHeight="12" refX="9.5" refY="5.5" orient="auto">
                <path d="M0,0 L11,5.5 L0,11 Z" fill="#fff"></path>
              </marker>
            </defs>
            {connections.map(conn => {
              const fromCell = cells.find(c => c.id === conn.from)
              const toCell = cells.find(c => c.id === conn.to)
              if (!fromCell || !toCell) return null

              const x1 = fromCell.x + fromCell.width
              const y1 = fromCell.y + fromCell.height / 2
              const x2 = toCell.x
              const y2 = toCell.y + toCell.height / 2

              // Determinar si esta conexión debe resaltarse (recorrido completo)
              const isHighlighted = connectedPath?.connections.includes(conn.id) || false
              const strokeColor = isHighlighted ? '#fff' : (conn.color || '#555')
              const strokeWidth = isHighlighted ? 3 : 2
              const opacity = selected && highlightConnections && !isHighlighted ? 0.15 : 1

              return (
                <g key={conn.id}>
                  {/* Invisible path for easier clicking */}
                  <path
                    d={`M${x1},${y1} C${x1 + 50},${y1} ${x2 - 50},${y2} ${x2},${y2}`}
                    stroke="transparent"
                    strokeWidth="20"
                    fill="none"
                    style={{ cursor: 'pointer', pointerEvents: 'stroke' }}
                    onClick={(e) => {
                      e.stopPropagation()
                      setSelectedConnection(conn.id)
                      setSelected(null)
                    }}
                  />
                  {/* Visible path */}
                  <path
                    d={`M${x1},${y1} C${x1 + 50},${y1} ${x2 - 50},${y2} ${x2},${y2}`}
                    stroke={strokeColor}
                    strokeWidth={strokeWidth}
                    fill="none"
                    opacity={opacity}
                    markerEnd={isHighlighted ? "url(#arrow-highlight)" : "url(#arrow)"}
                    style={{ transition: 'all 0.3s ease', pointerEvents: 'none' }}
                  />
                </g>
              )
            })}
            {connecting && (
              <path
                d={`M${(cells.find(c => c.id === connecting.cellId)?.x || 0) + (cells.find(c => c.id === connecting.cellId)?.width || 0)},${(cells.find(c => c.id === connecting.cellId)?.y || 0) + (cells.find(c => c.id === connecting.cellId)?.height || 0) / 2} L${mousePos.x},${mousePos.y}`}
                stroke="#a3a3a3"
                strokeWidth="2"
                strokeDasharray="5,5"
                fill="none"
              />
            )}
          </svg>

          {/* Cells */}
          {cells.map(cell => {
            const isSelected = selected === cell.id
            const cellTypeInfo = CELL_TYPES.find(t => t.name === cell.category)
            
            // Determinar si esta celda está en el recorrido completo
            const isInPath = connectedPath?.nodes.includes(cell.id) || false
            
            // Determinar el color del borde
            let borderColor = '#404040'
            if (isSelected) {
              borderColor = '#fff'
            } else if (isInPath) {
              borderColor = '#fff'
            } else if (cell.color) {
              borderColor = cell.color
            }
            
            // Determinar la opacidad de la celda
            let opacity = 1
            if (selected && highlightConnections && !isInPath) {
              opacity = 0.2
            }

            return (
              <div
                key={cell.id}
                data-cell-id={cell.id}
                onMouseDown={e => { e.stopPropagation(); handleMouseDown(e, cell.id) }}
                onDoubleClick={() => setEditingCell(cell)}
                style={{
                  position: 'absolute',
                  left: cell.x,
                  top: cell.y,
                  width: cell.width,
                  height: cell.height,
                  background: '#1a1a1a',
                  border: `3px solid ${borderColor}`,
                  borderRadius: 8,
                  cursor: 'grab',
                  userSelect: 'none',
                  boxShadow: isSelected ? '0 0 25px rgba(255,255,255,0.25)' : '0 6px 16px rgba(0,0,0,0.6)',
                  transition: dragging === cell.id ? 'none' : 'all 0.3s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  opacity
                }}
              >
                {/* Header */}
                <div style={{
                  padding: '8px 12px',
                  background: '#222',
                  borderBottom: '2px solid #333',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  borderRadius: '5px 5px 0 0'
                }}>
                  <span style={{
                    fontSize: 14,
                    fontWeight: 700,
                    color: '#fff',
                    fontFamily: 'monospace',
                    width: 24,
                    height: 24,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: '#333',
                    borderRadius: 4,
                    border: '2px solid #555'
                  }}>{cellTypeInfo?.icon || '?'}</span>
                  <div style={{ flex: 1, fontSize: 11, fontWeight: 600, color: '#e5e5e5' }}>{cell.label}</div>
                </div>

                {/* Content */}
                <div style={{ padding: '10px 12px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  {cell.formula && (
                    <div style={{ fontSize: 9, color: '#666', marginBottom: 4, fontFamily: 'monospace' }}>
                      = {cell.formula}
                    </div>
                  )}
                  <div style={{ fontSize: 16, fontWeight: 700, color: '#fff' }}>
                    {formatValue(cell.calculatedValue, cell.format)}
                  </div>
                  {cell.inputs.length > 0 && (
                    <div style={{ fontSize: 9, color: '#888', marginTop: 4 }}>
                      {cell.inputs.length} input{cell.inputs.length > 1 ? 's' : ''}
                    </div>
                  )}
                </div>

                {/* Input Ports */}
                <div
                  data-cell-id={cell.id}
                  data-port="input1"
                  onMouseDown={e => { e.stopPropagation(); handleMouseDown(e, cell.id, 'input1') }}
                  style={{
                    position: 'absolute',
                    left: -8,
                    top: '30%',
                    width: 16,
                    height: 16,
                    borderRadius: '50%',
                    background: '#444',
                    border: '3px solid #0b0c0d',
                    cursor: 'crosshair'
                  }}
                />
                <div
                  data-cell-id={cell.id}
                  data-port="input2"
                  onMouseDown={e => { e.stopPropagation(); handleMouseDown(e, cell.id, 'input2') }}
                  style={{
                    position: 'absolute',
                    left: -8,
                    top: '70%',
                    width: 16,
                    height: 16,
                    borderRadius: '50%',
                    background: '#444',
                    border: '3px solid #0b0c0d',
                    cursor: 'crosshair'
                  }}
                />

                {/* Output Port */}
                <div
                  data-cell-id={cell.id}
                  data-port="output"
                  onMouseDown={e => { e.stopPropagation(); handleMouseDown(e, cell.id, 'output') }}
                  style={{
                    position: 'absolute',
                    right: -8,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: 16,
                    height: 16,
                    borderRadius: '50%',
                    background: '#666',
                    border: '3px solid #0b0c0d',
                    cursor: 'crosshair'
                  }}
                />
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
          borderRadius: 6,
          padding: '6px 10px'
        }}>
          <button 
            onClick={() => setHighlightConnections(!highlightConnections)}
            style={{
              background: highlightConnections ? '#404040' : '#1a1a1a',
              border: '1px solid #333', 
              color: highlightConnections ? '#fff' : '#ccc',
              padding: '6px 12px', 
              borderRadius: 4, 
              cursor: 'pointer', 
              fontSize: 11, 
              fontWeight: 600,
              marginRight: 8
            }}
            title="Resaltar conexiones del nodo seleccionado"
          >
            🔗 {highlightConnections ? 'ON' : 'OFF'}
          </button>
          <button onClick={() => setZoom(z => Math.max(20, z - 10))} style={{
            background: '#1a1a1a', border: '1px solid #333', color: '#ccc',
            width: 28, height: 28, borderRadius: 4, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14
          }}>-</button>
          <span style={{ fontSize: 12, minWidth: 50, textAlign: 'center', fontWeight: 600 }}>{Math.round(zoom)}%</span>
          <button onClick={() => setZoom(z => Math.min(300, z + 10))} style={{
            background: '#1a1a1a', border: '1px solid #333', color: '#ccc',
            width: 28, height: 28, borderRadius: 4, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14
          }}>+</button>
          <button onClick={() => { setZoom(100); setPan({ x: 0, y: 0 }) }} style={{
            background: '#1a1a1a', border: '1px solid #333', color: '#ccc',
            padding: '6px 12px', borderRadius: 4, cursor: 'pointer', fontSize: 11, fontWeight: 600
          }}>1:1</button>
        </div>
      </div>

      {/* RIGHT PANEL - Connection Properties */}
      {selectedConnection && !selectedCell && (() => {
        const conn = connections.find(c => c.id === selectedConnection)
        if (!conn) return null
        const fromCell = cells.find(c => c.id === conn.from)
        const toCell = cells.find(c => c.id === conn.to)
        
        return (
          <aside style={{
            width: 300,
            background: '#131416',
            borderLeft: '1px solid #2e3134',
            padding: 20,
            overflowY: 'auto',
            flexShrink: 0
          }}>
            <h3 style={{ color: '#a3a3a3', fontSize: 12, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 20 }}>
              Propiedades de Conexión
            </h3>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 10, color: '#666', marginBottom: 6, textTransform: 'uppercase' }}>ID</label>
              <div style={{ background: '#1a1a1a', padding: '8px 12px', borderRadius: 4, fontSize: 11, fontFamily: 'monospace' }}>{conn.id}</div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 10, color: '#666', marginBottom: 6, textTransform: 'uppercase' }}>Desde</label>
              <div style={{ background: '#1a1a1a', padding: '8px 12px', borderRadius: 4, fontSize: 11 }}>{fromCell?.label || conn.from}</div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 10, color: '#666', marginBottom: 6, textTransform: 'uppercase' }}>Hacia</label>
              <div style={{ background: '#1a1a1a', padding: '8px 12px', borderRadius: 4, fontSize: 11 }}>{toCell?.label || conn.to}</div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 10, color: '#666', marginBottom: 6, textTransform: 'uppercase' }}>Color de Conexión</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 6 }}>
                {NODE_COLORS.map((color, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setConnections(prev => prev.map(c => 
                        c.id === conn.id ? { ...c, color } : c
                      ))
                    }}
                    style={{
                      width: '100%',
                      aspectRatio: '1',
                      background: color,
                      border: conn.color === color ? '2px solid #fff' : '1px solid #333',
                      borderRadius: 4,
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                    title={color}
                  />
                ))}
              </div>
              {conn.color && (
                <button
                  onClick={() => {
                    setConnections(prev => prev.map(c => 
                      c.id === conn.id ? { ...c, color: undefined } : c
                    ))
                  }}
                  style={{
                    width: '100%',
                    marginTop: 8,
                    padding: '6px',
                    background: '#2a2a2a',
                    border: '1px solid #333',
                    borderRadius: 4,
                    color: '#888',
                    cursor: 'pointer',
                    fontSize: 10
                  }}
                >
                  Quitar Color
                </button>
              )}
            </div>

            <button 
              onClick={() => {
                setConnections(prev => prev.filter(c => c.id !== conn.id))
                setSelectedConnection(null)
              }}
              style={{
                width: '100%',
                padding: '10px',
                background: '#333',
                border: 'none',
                borderRadius: 6,
                color: '#ccc',
                cursor: 'pointer',
                fontFamily: 'inherit',
                fontSize: 12,
                fontWeight: 600
              }}
            >
              Eliminar Conexión
            </button>
          </aside>
        )
      })()}

      {/* RIGHT PANEL - Cell Properties */}
      {selectedCell && (
        <aside style={{
          width: 300,
          background: '#131416',
          borderLeft: '1px solid #2e3134',
          padding: 20,
          overflowY: 'auto',
          flexShrink: 0
        }}>
          <h3 style={{ color: '#a3a3a3', fontSize: 12, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 20 }}>
            Propiedades de Celda
          </h3>

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 10, color: '#666', marginBottom: 6, textTransform: 'uppercase' }}>ID</label>
            <div style={{ background: '#1a1a1a', padding: '8px 12px', borderRadius: 4, fontSize: 11, fontFamily: 'monospace' }}>{selectedCell.id}</div>
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 10, color: '#666', marginBottom: 6, textTransform: 'uppercase' }}>Etiqueta</label>
            <input
              value={selectedCell.label}
              onChange={e => updateCell(selectedCell.id, { label: e.target.value })}
              style={{ width: '100%', background: '#0b0c0d', border: '1px solid #333', color: '#ccc', padding: '8px 12px', borderRadius: 4, fontFamily: 'inherit', fontSize: 12 }}
            />
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 10, color: '#666', marginBottom: 6, textTransform: 'uppercase' }}>Color del Nodo</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 6 }}>
              {NODE_COLORS.map((color, index) => (
                <button
                  key={index}
                  onClick={() => updateCell(selectedCell.id, { color })}
                  style={{
                    width: '100%',
                    aspectRatio: '1',
                    background: color,
                    border: selectedCell.color === color ? '2px solid #fff' : '1px solid #333',
                    borderRadius: 4,
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  title={color}
                />
              ))}
            </div>
            {selectedCell.color && (
              <button
                onClick={() => updateCell(selectedCell.id, { color: undefined })}
                style={{
                  width: '100%',
                  marginTop: 8,
                  padding: '6px',
                  background: '#2a2a2a',
                  border: '1px solid #333',
                  borderRadius: 4,
                  color: '#888',
                  cursor: 'pointer',
                  fontSize: 10
                }}
              >
                Quitar Color
              </button>
            )}
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 10, color: '#666', marginBottom: 6, textTransform: 'uppercase' }}>Valor</label>
            <input
              type="number"
              value={selectedCell.value}
              onChange={e => updateCell(selectedCell.id, { value: parseFloat(e.target.value) || 0 })}
              style={{ width: '100%', background: '#0b0c0d', border: '1px solid #333', color: '#ccc', padding: '8px 12px', borderRadius: 4, fontFamily: 'inherit', fontSize: 12 }}
            />
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 10, color: '#666', marginBottom: 6, textTransform: 'uppercase' }}>Fórmula</label>
            <input
              value={selectedCell.formula}
              onChange={e => updateCell(selectedCell.id, { formula: e.target.value })}
              placeholder="ej: cell_1 * cell_2"
              style={{ width: '100%', background: '#0b0c0d', border: '1px solid #333', color: '#ccc', padding: '8px 12px', borderRadius: 4, fontFamily: 'monospace', fontSize: 11 }}
            />
          </div>

          <div style={{ marginBottom: 20, padding: 12, background: '#1a1a1a', borderRadius: 6 }}>
            <div style={{ fontSize: 10, color: '#666', marginBottom: 4, textTransform: 'uppercase' }}>Valor Calculado</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#fff' }}>
              {formatValue(selectedCell.calculatedValue, selectedCell.format)}
            </div>
          </div>

          {highlightConnections && connectedPath && (
            <div style={{ marginBottom: 20, padding: 12, background: '#1a1a1a', borderRadius: 6, border: '1px solid #333' }}>
              <div style={{ fontSize: 10, color: '#666', marginBottom: 8, textTransform: 'uppercase' }}>Recorrido Completo</div>
              <div style={{ fontSize: 11, color: '#ccc', marginBottom: 4 }}>
                🔗 <strong>{connectedPath.connections.length}</strong> conexiones
              </div>
              <div style={{ fontSize: 11, color: '#ccc', marginBottom: 8 }}>
                📦 <strong>{connectedPath.nodes.length}</strong> nodos en el camino
              </div>
              <div style={{ fontSize: 9, color: '#888', lineHeight: 1.6 }}>
                {connectedPath.nodes.map((nodeId: string, index: number) => {
                  const node = cells.find(c => c.id === nodeId)
                  return (
                    <div key={index} style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 2 }}>
                      <span style={{ color: nodeId === selectedCell.id ? '#fff' : '#666' }}>
                        {index === 0 ? '→' : '↳'}
                      </span>
                      <span style={{ color: nodeId === selectedCell.id ? '#fff' : '#aaa' }}>
                        {node?.label || nodeId}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          <button onClick={() => setEditingCell(selectedCell)} style={{
            width: '100%', padding: '10px', background: '#404040', border: 'none',
            borderRadius: 6, color: '#fff', cursor: 'pointer', fontFamily: 'inherit',
            fontSize: 12, fontWeight: 600, marginBottom: 10
          }}>
            Editar Avanzado
          </button>

          <button onClick={deleteSelected} style={{
            width: '100%', padding: '10px', background: '#333', border: 'none',
            borderRadius: 6, color: '#ccc', cursor: 'pointer', fontFamily: 'inherit',
            fontSize: 12, fontWeight: 600
          }}>
            Eliminar Celda
          </button>
        </aside>
      )}

      {/* Edit Modal */}
      {editingCell && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.85)', display: 'flex',
          alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }} onClick={() => setEditingCell(null)}>
          <div style={{
            background: '#131416', border: '2px solid #333',
            borderRadius: 10, padding: 28, width: 500, maxWidth: '90vw'
          }} onClick={e => e.stopPropagation()}>
            <h3 style={{ margin: '0 0 24px', color: '#a3a3a3', fontSize: 16 }}>Editar Celda Avanzado</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: 11, color: '#666', marginBottom: 6 }}>Etiqueta</label>
                <input
                  value={editingCell.label}
                  onChange={e => setEditingCell({ ...editingCell, label: e.target.value })}
                  style={{ width: '100%', background: '#0b0c0d', border: '1px solid #333', color: '#ccc', padding: '10px 12px', borderRadius: 6, fontFamily: 'inherit', fontSize: 13 }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 11, color: '#666', marginBottom: 6 }}>Valor Manual</label>
                  <input
                    type="number"
                    value={editingCell.value}
                    onChange={e => setEditingCell({ ...editingCell, value: parseFloat(e.target.value) || 0 })}
                    style={{ width: '100%', background: '#0b0c0d', border: '1px solid #333', color: '#ccc', padding: '10px 12px', borderRadius: 6, fontFamily: 'inherit', fontSize: 13 }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 11, color: '#666', marginBottom: 6 }}>Formato</label>
                  <select
                    value={editingCell.format}
                    onChange={e => setEditingCell({ ...editingCell, format: e.target.value as any })}
                    style={{ width: '100%', background: '#0b0c0d', border: '1px solid #333', color: '#ccc', padding: '10px 12px', borderRadius: 6, fontFamily: 'inherit', fontSize: 13 }}
                  >
                    <option value="number">Número</option>
                    <option value="currency">Moneda</option>
                    <option value="percentage">Porcentaje</option>
                    <option value="text">Texto</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 11, color: '#666', marginBottom: 6 }}>Fórmula (tipo Excel)</label>
                <input
                  value={editingCell.formula}
                  onChange={e => setEditingCell({ ...editingCell, formula: e.target.value })}
                  placeholder="ej: cell_1 * cell_2 + cell_3"
                  style={{ width: '100%', background: '#0b0c0d', border: '1px solid #333', color: '#ccc', padding: '10px 12px', borderRadius: 6, fontFamily: 'monospace', fontSize: 12 }}
                />
              </div>

              <div style={{ padding: 16, background: '#1a1a1a', borderRadius: 6 }}>
                <div style={{ fontSize: 11, color: '#666', marginBottom: 8 }}>Vista Previa del Cálculo</div>
                <div style={{ fontSize: 24, fontWeight: 700, color: '#fff' }}>
                  {formatValue(editingCell.calculatedValue, editingCell.format)}
                </div>
              </div>

              <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                <button
                  onClick={() => {
                    updateCell(editingCell.id, editingCell)
                    setEditingCell(null)
                  }}
                  style={{
                    flex: 1, padding: '12px', background: '#404040', border: 'none',
                    borderRadius: 6, color: '#fff', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, fontWeight: 600
                  }}
                >
                  Guardar Cambios
                </button>
                <button
                  onClick={() => setEditingCell(null)}
                  style={{
                    flex: 1, padding: '12px', background: '#333', border: 'none',
                    borderRadius: 6, color: '#ccc', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13
                  }}
                >
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
