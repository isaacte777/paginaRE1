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
  operation: 'none' | 'sum' | 'subtract' | 'multiply' | 'divide' | 'percentage'
  format: 'number' | 'currency' | 'percentage' | 'text'
  category: string
  inputs: string[]
  calculatedValue: number
  color?: string
  shape: 'rectangle' | 'rounded' | 'diamond' | 'circle' | 'hexagon' | 'parallelogram'
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
  '#d4d4d4', '#a3a3a3', '#737373', '#525252', '#404040', '#262626',
  '#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899',
]

const CELL_TYPES = [
  { id: 'input', name: 'Entrada', icon: 'I', desc: 'Valor manual', shape: 'rectangle' as const },
  { id: 'sum', name: 'Suma', icon: '+', desc: 'A + B + C...', shape: 'rounded' as const },
  { id: 'subtract', name: 'Resta', icon: '-', desc: 'A - B', shape: 'diamond' as const },
  { id: 'multiply', name: 'Multiplicar', icon: '×', desc: 'A × B', shape: 'hexagon' as const },
  { id: 'divide', name: 'Dividir', icon: '÷', desc: 'A ÷ B', shape: 'parallelogram' as const },
  { id: 'percentage', name: 'Porcentaje', icon: '%', desc: '(A/B)×100', shape: 'circle' as const },
  { id: 'chart_pie', name: 'Gráfico Circular', icon: '◔', desc: 'Distribución %', shape: 'circle' as const },
  { id: 'chart_bar', name: 'Gráfico Barras', icon: '▮', desc: 'Comparación', shape: 'rectangle' as const },
  { id: 'chart_line', name: 'Gráfico Línea', icon: '∿', desc: 'Tendencia', shape: 'rectangle' as const },
]

let idCounter = 0
const genId = () => `c${++idCounter}`

const createCell = (
  x: number, y: number, width: number, height: number,
  label: string, value: number | string, operation: 'none' | 'sum' | 'subtract' | 'multiply' | 'divide' | 'percentage',
  format: 'number' | 'currency' | 'percentage' | 'text',
  category: string, shape: 'rectangle' | 'rounded' | 'diamond' | 'circle' | 'hexagon' | 'parallelogram',
  inputs: string[] = [], calculatedValue: number = 0, color?: string
): CellNode => ({
  id: genId(), x, y, width, height, label, value, formula: '',
  operation, format, category, shape, inputs, calculatedValue, color
})

export default function FamilyFinanceFlow() {
  const [cells, setCells] = useState<CellNode[]>([])
  const [connections, setConnections] = useState<Connection[]>([])
  const [selected, setSelected] = useState<string | null>(null)
  const [zoom, setZoom] = useState(100)
  const [pan, setPan] = useState({ x: 50, y: 50 })
  const [dragging, setDragging] = useState<string | null>(null)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [connecting, setConnecting] = useState<{ cellId: string; port: string } | null>(null)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const [isPanning, setIsPanning] = useState(false)
  const [panStart, setPanStart] = useState({ x: 0, y: 0 })
  const viewportRef = useRef<HTMLDivElement>(null)

  // Datos de ejemplo del Excel
  useEffect(() => {
    const newCells: CellNode[] = []
    const newConnections: Connection[] = []
    
    const NODE_W = 160
    const NODE_H = 80
    const GAP_X = 40
    const GAP_Y = 30
    const START_X = 50
    const START_Y = 50

    // Capital
    const capitalInicial = createCell(START_X, START_Y, NODE_W, NODE_H, 'Capital Inicial', 3863526, 'none', 'currency', 'Entrada', 'rectangle', [], 3863526)
    const capitalFinal = createCell(START_X + NODE_W + GAP_X, START_Y, NODE_W, NODE_H, 'Capital Final', 1237016, 'none', 'currency', 'Entrada', 'rectangle', [], 1237016)
    const variacion = createCell(START_X + (NODE_W + GAP_X) * 2, START_Y, NODE_W, NODE_H, 'Variación %', -68, 'none', 'percentage', 'Porcentaje', 'circle', [], -68)
    newCells.push(capitalInicial, capitalFinal, variacion)

    // Ingresos
    const ingresosY = START_Y + NODE_H + GAP_Y * 2
    const ingresosIds: string[] = []
    const ingresosData = [
      { label: 'Todo Oficina', value: 700000 },
      { label: 'Super Avenida', value: 450000 },
      { label: 'Bellosa', value: 600000 },
      { label: 'Relevamiento Guido', value: 1500000 },
      { label: 'Sergei', value: 500000 },
      { label: 'Relevamiento Guido 2', value: 600000 },
      { label: 'Proyecto Esmeralda', value: 1000000 },
      { label: 'Reforma Pinoza', value: 4250000 },
      { label: 'Relevamiento Ed. Inter', value: 1000000 },
      { label: 'Meli', value: 50000 },
      { label: 'Jose Chamorro', value: 150000 },
    ]
    
    ingresosData.forEach((ingreso, i) => {
      const col = i % 4
      const row = Math.floor(i / 4)
      const cell = createCell(
        START_X + col * (NODE_W + GAP_X),
        ingresosY + row * (NODE_H + GAP_Y),
        NODE_W, NODE_H,
        ingreso.label, ingreso.value, 'none', 'currency', 'Ingreso', 'rectangle'
      )
      newCells.push(cell)
      ingresosIds.push(cell.id)
    })

    const totalIngresos = createCell(
      START_X + 4 * (NODE_W + GAP_X),
      ingresosY,
      NODE_W, NODE_H * 2 + GAP_Y,
      'TOTAL INGRESOS', 10850000, 'sum', 'currency', 'Suma', 'rounded',
      ingresosIds, 10850000
    )
    newCells.push(totalIngresos)

    ingresosIds.forEach((id, i) => {
      newConnections.push({ id: genId(), from: id, to: totalIngresos.id, fromPort: 'output', toPort: `input${(i % 5) + 1}` })
    })

    // Gastos
    const gastosY = ingresosY + Math.ceil(ingresosData.length / 4) * (NODE_H + GAP_Y) + GAP_Y * 2
    const gastosIds: string[] = []
    const gastosData = [
      { label: 'Supermercado', value: 28210 },
      { label: 'Comidas Fuera', value: 28500 },
      { label: 'Combustible', value: 22000 },
      { label: 'Luz y Agua', value: 78000 },
      { label: 'iCloud', value: 122000 },
      { label: 'Milki', value: 150000 },
      { label: 'Biggie', value: 6000 },
      { label: 'Saldo y Pack', value: 10000 },
      { label: 'Belleza', value: 21800 },
      { label: 'Mas', value: 10000 },
    ]
    
    gastosData.forEach((gasto, i) => {
      const col = i % 4
      const row = Math.floor(i / 4)
      const cell = createCell(
        START_X + col * (NODE_W + GAP_X),
        gastosY + row * (NODE_H + GAP_Y),
        NODE_W, NODE_H,
        gasto.label, gasto.value, 'none', 'currency', 'Gasto', 'rectangle'
      )
      newCells.push(cell)
      gastosIds.push(cell.id)
    })

    const totalGastos = createCell(
      START_X + 4 * (NODE_W + GAP_X),
      gastosY,
      NODE_W, NODE_H * 2 + GAP_Y,
      'TOTAL GASTOS', 648510, 'sum', 'currency', 'Suma', 'rounded',
      gastosIds, 648510
    )
    newCells.push(totalGastos)

    gastosIds.forEach((id, i) => {
      newConnections.push({ id: genId(), from: id, to: totalGastos.id, fromPort: 'output', toPort: `input${(i % 5) + 1}` })
    })

    // Cálculos finales
    const calculosY = gastosY + Math.ceil(gastosData.length / 4) * (NODE_H + GAP_Y) + GAP_Y * 3
    
    const balanceMes = createCell(
      START_X, calculosY, NODE_W, NODE_H,
      'BALANCE DEL MES', 0, 'subtract', 'currency', 'Resta', 'diamond',
      [totalIngresos.id, totalGastos.id], 10201490
    )
    newCells.push(balanceMes)
    newConnections.push({ id: genId(), from: totalIngresos.id, to: balanceMes.id, fromPort: 'output', toPort: 'input1' })
    newConnections.push({ id: genId(), from: totalGastos.id, to: balanceMes.id, fromPort: 'output', toPort: 'input2' })

    const porcentajeAhorro = createCell(
      START_X + NODE_W + GAP_X, calculosY, NODE_W, NODE_H,
      '% AHORRO', 0, 'percentage', 'percentage', 'Porcentaje', 'circle',
      [balanceMes.id, totalIngresos.id], 94.02
    )
    newCells.push(porcentajeAhorro)
    newConnections.push({ id: genId(), from: balanceMes.id, to: porcentajeAhorro.id, fromPort: 'output', toPort: 'input1' })
    newConnections.push({ id: genId(), from: totalIngresos.id, to: porcentajeAhorro.id, fromPort: 'output', toPort: 'input2' })

    // Gráficos
    const graficosY = calculosY + NODE_H + GAP_Y * 3

    const graficoCircular = createCell(
      START_X, graficosY, NODE_W * 1.5, NODE_H * 2.5,
      'Distribución Gastos', 0, 'none', 'percentage', 'Gráfico Circular', 'circle',
      gastosIds.slice(0, 5)
    )
    newCells.push(graficoCircular)
    gastosIds.slice(0, 5).forEach((id, i) => {
      newConnections.push({ id: genId(), from: id, to: graficoCircular.id, fromPort: 'output', toPort: `input${i + 1}` })
    })

    const graficoBarras = createCell(
      START_X + NODE_W * 1.5 + GAP_X, graficosY, NODE_W * 1.5, NODE_H * 2.5,
      'Ingresos vs Gastos', 0, 'none', 'currency', 'Gráfico Barras', 'rectangle',
      [totalIngresos.id, totalGastos.id]
    )
    newCells.push(graficoBarras)
    newConnections.push({ id: genId(), from: totalIngresos.id, to: graficoBarras.id, fromPort: 'output', toPort: 'input1' })
    newConnections.push({ id: genId(), from: totalGastos.id, to: graficoBarras.id, fromPort: 'output', toPort: 'input2' })

    const graficoLinea = createCell(
      START_X + (NODE_W * 1.5 + GAP_X) * 2, graficosY, NODE_W * 1.5, NODE_H * 2.5,
      'Evolución Capital', 0, 'none', 'currency', 'Gráfico Línea', 'rectangle',
      [capitalInicial.id, capitalFinal.id]
    )
    newCells.push(graficoLinea)
    newConnections.push({ id: genId(), from: capitalInicial.id, to: graficoLinea.id, fromPort: 'output', toPort: 'input1' })
    newConnections.push({ id: genId(), from: capitalFinal.id, to: graficoLinea.id, fromPort: 'output', toPort: 'input2' })

    setCells(newCells)
    setConnections(newConnections)
  }, [])

  const formatValue = (value: number, format: string): string => {
    if (value === 0 && format !== 'text') return '0'
    switch (format) {
      case 'currency': return 'Gs. ' + value.toLocaleString('es-PY', { maximumFractionDigits: 0 })
      case 'percentage': return value.toFixed(2) + '%'
      case 'number': return value.toLocaleString('es-PY', { maximumFractionDigits: 2 })
      default: return value.toString()
    }
  }

  // Renderizado de gráficos SVG
  const renderPieChart = (cell: CellNode) => {
    const inputValues = cell.inputs.map(id => {
      const inputCell = cells.find(c => c.id === id)
      return { label: inputCell?.label || '', value: inputCell?.calculatedValue || 0 }
    }).filter(item => item.value > 0)

    if (inputValues.length === 0) return <div style={{ padding: 20, textAlign: 'center', color: '#666' }}>Sin datos</div>

    const total = inputValues.reduce((sum, item) => sum + item.value, 0)
    const centerX = cell.width / 2
    const centerY = cell.height / 2
    const radius = Math.min(cell.width, cell.height) * 0.35
    const colors = ['#d4d4d4', '#a3a3a3', '#737373', '#525252', '#404040']

    let currentAngle = -Math.PI / 2
    const slices = inputValues.map((item, index) => {
      const angle = (item.value / total) * Math.PI * 2
      const startAngle = currentAngle
      const endAngle = currentAngle + angle
      currentAngle = endAngle

      const x1 = centerX + radius * Math.cos(startAngle)
      const y1 = centerY + radius * Math.sin(startAngle)
      const x2 = centerX + radius * Math.cos(endAngle)
      const y2 = centerY + radius * Math.sin(endAngle)
      const largeArcFlag = angle > Math.PI ? 1 : 0

      const midAngle = startAngle + angle / 2
      const labelRadius = radius * 0.65
      const labelX = centerX + labelRadius * Math.cos(midAngle)
      const labelY = centerY + labelRadius * Math.sin(midAngle)

      return {
        path: `M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`,
        color: colors[index % colors.length],
        label: item.label,
        percentage: ((item.value / total) * 100).toFixed(1),
        labelX,
        labelY
      }
    })

    return (
      <svg width={cell.width} height={cell.height} style={{ display: 'block' }}>
        {slices.map((slice, index) => (
          <g key={index}>
            <path d={slice.path} fill={slice.color} stroke="#0b0c0d" strokeWidth="2" />
            {parseFloat(slice.percentage) > 8 && (
              <>
                <text x={slice.labelX} y={slice.labelY - 5} textAnchor="middle" fill="#fff" fontSize="10" fontWeight="bold">
                  {slice.percentage}%
                </text>
                <text x={slice.labelX} y={slice.labelY + 8} textAnchor="middle" fill="#ccc" fontSize="8">
                  {slice.label.substring(0, 12)}
                </text>
              </>
            )}
          </g>
        ))}
      </svg>
    )
  }

  const renderBarChart = (cell: CellNode) => {
    const inputValues = cell.inputs.map(id => {
      const inputCell = cells.find(c => c.id === id)
      return { label: inputCell?.label || '', value: inputCell?.calculatedValue || 0 }
    }).filter(item => item.value > 0)

    if (inputValues.length === 0) return <div style={{ padding: 20, textAlign: 'center', color: '#666' }}>Sin datos</div>

    const padding = { top: 20, right: 20, bottom: 40, left: 60 }
    const chartWidth = cell.width - padding.left - padding.right
    const chartHeight = cell.height - padding.top - padding.bottom
    const maxValue = Math.max(...inputValues.map(item => item.value))
    const barWidth = chartWidth / inputValues.length * 0.7
    const barSpacing = chartWidth / inputValues.length * 0.3
    const colors = ['#d4d4d4', '#a3a3a3', '#737373', '#525252', '#404040']

    return (
      <svg width={cell.width} height={cell.height} style={{ display: 'block' }}>
        <line x1={padding.left} y1={padding.top} x2={padding.left} y2={cell.height - padding.bottom} stroke="#555" strokeWidth="2" />
        <line x1={padding.left} y1={cell.height - padding.bottom} x2={cell.width - padding.right} y2={cell.height - padding.bottom} stroke="#555" strokeWidth="2" />

        {[0.25, 0.5, 0.75, 1].map((ratio, index) => {
          const y = cell.height - padding.bottom - (chartHeight * ratio)
          const value = (maxValue * ratio).toLocaleString('es-PY', { maximumFractionDigits: 0 })
          return (
            <g key={index}>
              <line x1={padding.left} y1={y} x2={cell.width - padding.right} y2={y} stroke="#333" strokeWidth="1" strokeDasharray="4,4" />
              <text x={padding.left - 5} y={y + 3} textAnchor="end" fill="#888" fontSize="9">{value}</text>
            </g>
          )
        })}

        {inputValues.map((item, index) => {
          const x = padding.left + (chartWidth / inputValues.length) * index + barSpacing / 2
          const barHeight = (item.value / maxValue) * chartHeight
          const y = cell.height - padding.bottom - barHeight

          return (
            <g key={index}>
              <rect x={x} y={y} width={barWidth} height={barHeight} fill={colors[index % colors.length]} stroke="#0b0c0d" strokeWidth="1" />
              <text x={x + barWidth / 2} y={y - 5} textAnchor="middle" fill="#ccc" fontSize="9" fontWeight="bold">
                {item.value.toLocaleString('es-PY', { maximumFractionDigits: 0 })}
              </text>
              <text x={x + barWidth / 2} y={cell.height - padding.bottom + 15} textAnchor="middle" fill="#888" fontSize="8">
                {item.label.substring(0, 10)}
              </text>
            </g>
          )
        })}
      </svg>
    )
  }

  const renderLineChart = (cell: CellNode) => {
    const inputValues = cell.inputs.map(id => {
      const inputCell = cells.find(c => c.id === id)
      return { label: inputCell?.label || '', value: inputCell?.calculatedValue || 0 }
    })

    if (inputValues.length === 0) return <div style={{ padding: 20, textAlign: 'center', color: '#666' }}>Sin datos</div>

    const padding = { top: 20, right: 20, bottom: 40, left: 60 }
    const chartWidth = cell.width - padding.left - padding.right
    const chartHeight = cell.height - padding.top - padding.bottom
    const maxValue = Math.max(...inputValues.map(item => item.value))
    const minValue = Math.min(...inputValues.map(item => item.value))
    const valueRange = maxValue - minValue || 1

    const points = inputValues.map((item, index) => {
      const x = padding.left + (chartWidth / (inputValues.length - 1)) * index
      const y = cell.height - padding.bottom - ((item.value - minValue) / valueRange) * chartHeight
      return { x, y, label: item.label, value: item.value }
    })

    const pathData = points.map((point, index) => {
      return `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`
    }).join(' ')

    return (
      <svg width={cell.width} height={cell.height} style={{ display: 'block' }}>
        <line x1={padding.left} y1={padding.top} x2={padding.left} y2={cell.height - padding.bottom} stroke="#555" strokeWidth="2" />
        <line x1={padding.left} y1={cell.height - padding.bottom} x2={cell.width - padding.right} y2={cell.height - padding.bottom} stroke="#555" strokeWidth="2" />

        {[0.25, 0.5, 0.75, 1].map((ratio, index) => {
          const y = cell.height - padding.bottom - (chartHeight * ratio)
          const value = (minValue + valueRange * ratio).toLocaleString('es-PY', { maximumFractionDigits: 0 })
          return (
            <g key={index}>
              <line x1={padding.left} y1={y} x2={cell.width - padding.right} y2={y} stroke="#333" strokeWidth="1" strokeDasharray="4,4" />
              <text x={padding.left - 5} y={y + 3} textAnchor="end" fill="#888" fontSize="9">{value}</text>
            </g>
          )
        })}

        <path d={pathData} fill="none" stroke="#a3a3a3" strokeWidth="2" />

        {points.map((point, index) => (
          <g key={index}>
            <circle cx={point.x} cy={point.y} r="4" fill="#d4d4d4" stroke="#0b0c0d" strokeWidth="2" />
            <text x={point.x} y={point.y - 10} textAnchor="middle" fill="#ccc" fontSize="9" fontWeight="bold">
              {point.value.toLocaleString('es-PY', { maximumFractionDigits: 0 })}
            </text>
            <text x={point.x} y={cell.height - padding.bottom + 15} textAnchor="middle" fill="#888" fontSize="8">
              {point.label.substring(0, 10)}
            </text>
          </g>
        ))}
      </svg>
    )
  }

  const addCell = (cellType: string) => {
    const type = CELL_TYPES.find(t => t.id === cellType)
    if (!type) return
    
    let operation: 'none' | 'sum' | 'subtract' | 'multiply' | 'divide' | 'percentage' = 'none'
    let format: 'number' | 'currency' | 'percentage' | 'text' = 'number'
    
    switch (cellType) {
      case 'sum':
        operation = 'sum'
        format = 'currency'
        break
      case 'subtract':
        operation = 'subtract'
        format = 'currency'
        break
      case 'multiply':
        operation = 'multiply'
        format = 'number'
        break
      case 'divide':
        operation = 'divide'
        format = 'number'
        break
      case 'percentage':
        operation = 'percentage'
        format = 'percentage'
        break
    }
    
    setCells(prev => [...prev, createCell(
      200 + Math.random() * 200,
      150 + Math.random() * 200,
      160, 80,
      type.name, 0, operation, format, type.name, type.shape
    )])
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
          setConnections(prev => [...prev, { id: `cn${Date.now()}`, from: connecting.cellId, to: targetCellId, fromPort: connecting.port, toPort: targetPort }])
          setCells(prev => prev.map(c => c.id === targetCellId ? { ...c, inputs: [...c.inputs, connecting.cellId] } : c))
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

  const renderCellContent = (cell: CellNode) => {
    const ct = CELL_TYPES.find(t => t.name === cell.category)
    const isChart = cell.category.includes('Gráfico')
    
    if (isChart) {
      if (cell.category === 'Gráfico Circular') return renderPieChart(cell)
      if (cell.category === 'Gráfico Barras') return renderBarChart(cell)
      if (cell.category === 'Gráfico Línea') return renderLineChart(cell)
    }
    
    return (
      <>
        <div style={{ padding: '4px 8px', background: '#222', borderBottom: '2px solid #333', display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: '#fff', fontFamily: 'monospace', width: 18, height: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#333', borderRadius: 3 }}>
            {ct?.icon || '?'}
          </span>
          <div style={{ flex: 1, fontSize: 9, fontWeight: 600, color: '#e5e5e5', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {cell.label}
          </div>
        </div>
        <div style={{ padding: '6px 8px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          {cell.operation !== 'none' && cell.inputs.length > 0 && (
            <div style={{ fontSize: 7, color: '#666', marginBottom: 3, fontFamily: 'monospace' }}>
              {cell.operation === 'sum' && `Σ(${cell.inputs.length})`}
              {cell.operation === 'subtract' && `A-B`}
              {cell.operation === 'multiply' && `A×B`}
              {cell.operation === 'divide' && `A÷B`}
              {cell.operation === 'percentage' && `(A/B)×100`}
            </div>
          )}
          <div style={{ fontSize: 12, fontWeight: 700, color: '#fff' }}>
            {formatValue(cell.calculatedValue, cell.format)}
          </div>
        </div>
      </>
    )
  }

  return (
    <div style={{ flex: 1, display: 'flex', overflow: 'hidden', background: '#0b0c0d', color: '#c9ccd0', fontFamily: "'JetBrains Mono', monospace", fontSize: '12px' }}>
      <aside style={{ width: 220, background: '#131416', borderRight: '1px solid #2e3134', overflowY: 'auto', padding: '12px', flexShrink: 0 }}>
        <h4 style={{ color: '#a3a3a3', fontSize: 11, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>Tipos de Nodos</h4>
        {CELL_TYPES.map(ct => (
          <button key={ct.id} onClick={() => addCell(ct.id)} style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '8px 10px', background: '#1a1a1a', border: '1px solid #333', borderRadius: 4, color: '#ccc', cursor: 'pointer', fontSize: 11, marginBottom: 4, textAlign: 'left' }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: '#fff', fontFamily: 'monospace', width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#2a2a2a', borderRadius: 3, border: '1px solid #444' }}>{ct.icon}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: '#e5e5e5' }}>{ct.name}</div>
              <div style={{ fontSize: 9, color: '#666' }}>{ct.desc}</div>
            </div>
          </button>
        ))}
        <button onClick={deleteSelected} style={{ width: '100%', padding: '8px', background: '#333', border: 'none', borderRadius: 4, color: '#ccc', cursor: 'pointer', fontSize: 11, marginTop: 12 }}>Eliminar Seleccionado</button>
      </aside>

      <div ref={viewportRef} onMouseDown={e => handleMouseDown(e)} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onClick={handleViewportClick} onWheel={e => {
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
      }} tabIndex={0} style={{ flex: 1, position: 'relative', overflow: 'hidden', background: '#0b0c0d', cursor: isPanning ? 'grabbing' : 'default' }}>
        <div id="world" style={{ position: 'absolute', width: 8000, height: 5000, transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom / 100})`, transformOrigin: '0 0', backgroundImage: 'radial-gradient(circle, #2e3134 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
          <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
            <defs>
              <marker id="arrow" markerUnits="userSpaceOnUse" markerWidth="10" markerHeight="10" refX="8.5" refY="4.5" orient="auto"><path d="M0,0 L9,4.5 L0,9 Z" fill="#666" /></marker>
            </defs>
            {connections.map(conn => {
              const fromCell = cells.find(c => c.id === conn.from)
              const toCell = cells.find(c => c.id === conn.to)
              if (!fromCell || !toCell) return null
              const x1 = fromCell.x + fromCell.width, y1 = fromCell.y + fromCell.height / 2
              const x2 = toCell.x, y2 = toCell.y + toCell.height / 2
              const dx = x2 - x1
              const curvature = Math.min(Math.abs(dx) * 0.3, 80)
              const cx1 = x1 + curvature
              const cx2 = x2 - curvature
              return (
                <path key={conn.id} d={`M${x1},${y1} C${cx1},${y1} ${cx2},${y2} ${x2},${y2}`} stroke={conn.color || '#555'} strokeWidth="2" fill="none" markerEnd="url(#arrow)" />
              )
            })}
            {connecting && <path d={`M${(cells.find(c => c.id === connecting.cellId)?.x || 0) + (cells.find(c => c.id === connecting.cellId)?.width || 0)},${(cells.find(c => c.id === connecting.cellId)?.y || 0) + (cells.find(c => c.id === connecting.cellId)?.height || 0) / 2} L${mousePos.x},${mousePos.y}`} stroke="#a3a3a3" strokeWidth="2" strokeDasharray="5,5" fill="none" />}
          </svg>

          {cells.map(cell => {
            const isSel = selected === cell.id
            let bc = '#404040'
            if (isSel) bc = '#fff'
            else if (cell.color) bc = cell.color

            return (
              <div key={cell.id} data-cell-id={cell.id} onMouseDown={e => { e.stopPropagation(); handleMouseDown(e, cell.id) }} style={{ position: 'absolute', left: cell.x, top: cell.y, width: cell.width, height: cell.height, cursor: 'grab', userSelect: 'none', opacity: 1, transition: dragging === cell.id ? 'none' : 'all 0.3s' }}>
                {cell.shape === 'rectangle' && (
                  <div style={{ width: '100%', height: '100%', background: '#1a1a1a', border: `3px solid ${bc}`, borderRadius: 8, boxShadow: isSel ? '0 0 25px rgba(255,255,255,0.25)' : '0 4px 12px rgba(0,0,0,0.5)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                    {renderCellContent(cell)}
                  </div>
                )}
                {cell.shape === 'rounded' && (
                  <div style={{ width: '100%', height: '100%', background: '#1a1a1a', border: `3px solid ${bc}`, borderRadius: 25, boxShadow: isSel ? '0 0 25px rgba(255,255,255,0.25)' : '0 4px 12px rgba(0,0,0,0.5)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                    {renderCellContent(cell)}
                  </div>
                )}
                {cell.shape === 'circle' && (
                  <div style={{ width: '100%', height: '100%', background: '#1a1a1a', border: `3px solid ${bc}`, borderRadius: '50%', boxShadow: isSel ? '0 0 25px rgba(255,255,255,0.25)' : '0 4px 12px rgba(0,0,0,0.5)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                    {renderCellContent(cell)}
                  </div>
                )}
                {cell.shape === 'diamond' && (
                  <div style={{ width: '100%', height: '100%', position: 'relative' }}>
                    <div style={{ width: '70%', height: '70%', position: 'absolute', top: '15%', left: '15%', background: '#1a1a1a', border: `3px solid ${bc}`, transform: 'rotate(45deg)', boxShadow: isSel ? '0 0 25px rgba(255,255,255,0.25)' : '0 4px 12px rgba(0,0,0,0.5)' }} />
                    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 15 }}>
                      {renderCellContent(cell)}
                    </div>
                  </div>
                )}
                {cell.shape === 'hexagon' && (
                  <svg width={cell.width} height={cell.height} style={{ overflow: 'visible' }}>
                    <polygon points={`${cell.width * 0.25},0 ${cell.width * 0.75},0 ${cell.width},${cell.height * 0.5} ${cell.width * 0.75},${cell.height} ${cell.width * 0.25},${cell.height} 0,${cell.height * 0.5}`} fill="#1a1a1a" stroke={bc} strokeWidth="3" filter={isSel ? 'drop-shadow(0 0 10px rgba(255,255,255,0.3))' : 'drop-shadow(0 4px 12px rgba(0,0,0,0.5))'} />
                    <foreignObject x="10%" y="10%" width="80%" height="80%">
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                        {renderCellContent(cell)}
                      </div>
                    </foreignObject>
                  </svg>
                )}
                {cell.shape === 'parallelogram' && (
                  <svg width={cell.width} height={cell.height} style={{ overflow: 'visible' }}>
                    <polygon points={`${cell.width * 0.15},0 ${cell.width},0 ${cell.width * 0.85},${cell.height} 0,${cell.height}`} fill="#1a1a1a" stroke={bc} strokeWidth="3" filter={isSel ? 'drop-shadow(0 0 10px rgba(255,255,255,0.3))' : 'drop-shadow(0 4px 12px rgba(0,0,0,0.5))'} />
                    <foreignObject x="15%" y="10%" width="70%" height="80%">
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                        {renderCellContent(cell)}
                      </div>
                    </foreignObject>
                  </svg>
                )}
                <div data-cell-id={cell.id} data-port="input1" onMouseDown={e => { e.stopPropagation(); handleMouseDown(e, cell.id, 'input1') }} style={{ position: 'absolute', left: -6, top: '50%', transform: 'translateY(-50%)', width: 12, height: 12, borderRadius: '50%', background: '#444', border: '2px solid #0b0c0d', cursor: 'crosshair', zIndex: 10 }} />
                <div data-cell-id={cell.id} data-port="output" onMouseDown={e => { e.stopPropagation(); handleMouseDown(e, cell.id, 'output') }} style={{ position: 'absolute', right: -6, top: '50%', transform: 'translateY(-50%)', width: 12, height: 12, borderRadius: '50%', background: '#666', border: '2px solid #0b0c0d', cursor: 'crosshair', zIndex: 10 }} />
              </div>
            )
          })}
        </div>

        <div style={{ position: 'absolute', bottom: 10, right: 10, display: 'flex', gap: 4, alignItems: 'center', background: '#131416', border: '1px solid #333', borderRadius: 6, padding: '6px 10px' }}>
          <button onClick={() => setZoom(z => Math.max(20, z - 10))} style={{ background: '#1a1a1a', border: '1px solid #333', color: '#ccc', width: 28, height: 28, borderRadius: 4, cursor: 'pointer', fontSize: 14 }}>-</button>
          <span style={{ fontSize: 12, minWidth: 50, textAlign: 'center', fontWeight: 600 }}>{Math.round(zoom)}%</span>
          <button onClick={() => setZoom(z => Math.min(300, z + 10))} style={{ background: '#1a1a1a', border: '1px solid #333', color: '#ccc', width: 28, height: 28, borderRadius: 4, cursor: 'pointer', fontSize: 14 }}>+</button>
          <button onClick={() => { setZoom(100); setPan({ x: 50, y: 50 }) }} style={{ background: '#1a1a1a', border: '1px solid #333', color: '#ccc', padding: '6px 12px', borderRadius: 4, cursor: 'pointer', fontSize: 11, fontWeight: 600 }}>RESET</button>
        </div>
      </div>
    </div>
  )
}
