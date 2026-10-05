import { useState, useRef, useEffect, useCallback } from 'react'

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
  inputs: string[] // IDs de nodos que son inputs
  calculatedValue: number
}

interface Connection {
  id: string
  from: string
  to: string
  fromPort: string
  toPort: string
}

type Operator = '+' | '-' | '*' | '/' | 'SUM' | 'AVG' | 'MIN' | 'MAX' | 'COUNT'

const CELL_TYPES = [
  { id: 'input', name: 'Entrada', icon: 'I', desc: 'Valor manual', color: '#d4d4d4' },
  { id: 'calc', name: 'Cálculo', icon: 'C', desc: 'Fórmula matemática', color: '#a3a3a3' },
  { id: 'sum', name: 'Suma', icon: 'S', desc: 'SUM(inputs)', color: '#737373' },
  { id: 'avg', name: 'Promedio', icon: 'A', desc: 'AVG(inputs)', color: '#737373' },
  { id: 'multiply', name: 'Multiplicar', icon: 'M', desc: 'A × B', color: '#525252' },
  { id: 'divide', name: 'Dividir', icon: 'D', desc: 'A ÷ B', color: '#525252' },
  { id: 'percent', name: 'Porcentaje', icon: '%', desc: 'X% de Y', color: '#404040' },
  { id: 'iva', name: 'IVA', icon: 'V', desc: 'IVA 10%', color: '#404040' },
  { id: 'subtotal', name: 'Subtotal', icon: 'T', desc: 'Total parcial', color: '#262626' },
  { id: 'total', name: 'Total', icon: 'G', desc: 'Total general', color: '#171717' },
  { id: 'currency', name: 'Moneda', icon: '$', desc: 'Formato Gs.', color: '#d4d4d4' },
  { id: 'reference', name: 'Referencia', icon: 'R', desc: 'Referencia a celda', color: '#a3a3a3' },
  { id: 'line_chart', name: 'Gráfico Línea', icon: 'L', desc: 'Tendencia escalera', color: '#e5e5e5' },
  { id: 'pie_chart', name: 'Gráfico Circular', icon: 'O', desc: 'Distribución %', color: '#d4d4d4' },
  { id: 'bar_chart', name: 'Gráfico Barras', icon: 'B', desc: 'Comparación', color: '#a3a3a3' },
  { id: 'percentage_chart', name: 'Porcentaje', icon: '%', desc: 'Visualización %', color: '#737373' },
]

let idCounter = 0
const genId = () => `cell_${++idCounter}`

export default function FinanceFlow() {
  const [cells, setCells] = useState<CellNode[]>([
    // DATOS DEL PROYECTO (Entradas)
    { id: 'cell_1', x: 50, y: 50, width: 180, height: 100, label: 'Excavación Zapata', value: 14, formula: '', format: 'number', category: 'Entrada', inputs: [], calculatedValue: 14 },
    { id: 'cell_2', x: 50, y: 180, width: 180, height: 100, label: 'Precio Unitario', value: 90000, formula: '', format: 'currency', category: 'Entrada', inputs: [], calculatedValue: 90000 },
    { id: 'cell_3', x: 50, y: 310, width: 180, height: 100, label: 'Unidad', value: 'm3', formula: '', format: 'text', category: 'Entrada', inputs: [], calculatedValue: 0 },
    
    // CÁLCULO: Cantidad × Precio
    { id: 'cell_4', x: 300, y: 120, width: 200, height: 120, label: 'Subtotal Excavación', value: 0, formula: 'cell_1 * cell_2', format: 'currency', category: 'Cálculo', inputs: ['cell_1', 'cell_2'], calculatedValue: 1260000 },
    
    // MÁS ÍTEMS
    { id: 'cell_5', x: 50, y: 450, width: 180, height: 100, label: 'Zapata HºAº', value: 14, formula: '', format: 'number', category: 'Entrada', inputs: [], calculatedValue: 14 },
    { id: 'cell_6', x: 50, y: 580, width: 180, height: 100, label: 'Precio Unitario', value: 900000, formula: '', format: 'currency', category: 'Entrada', inputs: [], calculatedValue: 900000 },
    { id: 'cell_7', x: 300, y: 520, width: 200, height: 120, label: 'Subtotal Zapata', value: 0, formula: 'cell_5 * cell_6', format: 'currency', category: 'Cálculo', inputs: ['cell_5', 'cell_6'], calculatedValue: 12600000 },
    
    // OTROS ÍTEMS
    { id: 'cell_8', x: 50, y: 720, width: 180, height: 100, label: 'Vigas Fund.', value: 18, formula: '', format: 'number', category: 'Entrada', inputs: [], calculatedValue: 18 },
    { id: 'cell_9', x: 50, y: 850, width: 180, height: 100, label: 'Precio Unitario', value: 120000, formula: '', format: 'currency', category: 'Entrada', inputs: [], calculatedValue: 120000 },
    { id: 'cell_10', x: 300, y: 790, width: 200, height: 120, label: 'Subtotal Vigas', value: 0, formula: 'cell_8 * cell_9', format: 'currency', category: 'Cálculo', inputs: ['cell_8', 'cell_9'], calculatedValue: 2160000 },
    
    // SUMA TOTAL
    { id: 'cell_11', x: 600, y: 400, width: 220, height: 140, label: 'SUBTOTAL', value: 0, formula: 'SUM(cell_4, cell_7, cell_10)', format: 'currency', category: 'Total', inputs: ['cell_4', 'cell_7', 'cell_10'], calculatedValue: 16020000 },
    
    // IVA
    { id: 'cell_12', x: 600, y: 600, width: 220, height: 120, label: 'IVA 10%', value: 0, formula: 'cell_11 * 0.10', format: 'currency', category: 'Impuesto', inputs: ['cell_11'], calculatedValue: 1602000 },
    
    // TOTAL FINAL
    { id: 'cell_13', x: 600, y: 780, width: 220, height: 140, label: 'TOTAL + IVA', value: 0, formula: 'cell_11 + cell_12', format: 'currency', category: 'Total', inputs: ['cell_11', 'cell_12'], calculatedValue: 17622000 },

    // GRÁFICOS
    { id: 'cell_14', x: 900, y: 100, width: 300, height: 200, label: 'Tendencia de Costos', value: 0, formula: '', format: 'number', category: 'Gráfico Línea', inputs: ['cell_4', 'cell_7', 'cell_10', 'cell_11', 'cell_12', 'cell_13'], calculatedValue: 0 },
    { id: 'cell_15', x: 900, y: 350, width: 300, height: 250, label: 'Distribución de Costos', value: 0, formula: '', format: 'percentage', category: 'Gráfico Circular', inputs: ['cell_4', 'cell_7', 'cell_10', 'cell_12'], calculatedValue: 0 },
    { id: 'cell_16', x: 900, y: 650, width: 300, height: 200, label: 'Comparación de Ítems', value: 0, formula: '', format: 'number', category: 'Gráfico Barras', inputs: ['cell_4', 'cell_7', 'cell_10'], calculatedValue: 0 },
    { id: 'cell_17', x: 1250, y: 200, width: 280, height: 180, label: 'Porcentaje del Total', value: 0, formula: '', format: 'percentage', category: 'Porcentaje', inputs: ['cell_4', 'cell_7', 'cell_10', 'cell_12'], calculatedValue: 0 },
  ])

  const [connections, setConnections] = useState<Connection[]>([
    { id: 'conn_1', from: 'cell_1', to: 'cell_4', fromPort: 'output', toPort: 'input1' },
    { id: 'conn_2', from: 'cell_2', to: 'cell_4', fromPort: 'output', toPort: 'input2' },
    { id: 'conn_3', from: 'cell_5', to: 'cell_7', fromPort: 'output', toPort: 'input1' },
    { id: 'conn_4', from: 'cell_6', to: 'cell_7', fromPort: 'output', toPort: 'input2' },
    { id: 'conn_5', from: 'cell_8', to: 'cell_10', fromPort: 'output', toPort: 'input1' },
    { id: 'conn_6', from: 'cell_9', to: 'cell_10', fromPort: 'output', toPort: 'input2' },
    { id: 'conn_7', from: 'cell_4', to: 'cell_11', fromPort: 'output', toPort: 'input1' },
    { id: 'conn_8', from: 'cell_7', to: 'cell_11', fromPort: 'output', toPort: 'input2' },
    { id: 'conn_9', from: 'cell_10', to: 'cell_11', fromPort: 'output', toPort: 'input3' },
    { id: 'conn_10', from: 'cell_11', to: 'cell_12', fromPort: 'output', toPort: 'input1' },
    { id: 'conn_11', from: 'cell_11', to: 'cell_13', fromPort: 'output', toPort: 'input1' },
    { id: 'conn_12', from: 'cell_12', to: 'cell_13', fromPort: 'output', toPort: 'input2' },
    // Conexiones de gráficos
    { id: 'conn_13', from: 'cell_4', to: 'cell_14', fromPort: 'output', toPort: 'input1' },
    { id: 'conn_14', from: 'cell_7', to: 'cell_14', fromPort: 'output', toPort: 'input2' },
    { id: 'conn_15', from: 'cell_10', to: 'cell_14', fromPort: 'output', toPort: 'input3' },
    { id: 'conn_16', from: 'cell_11', to: 'cell_14', fromPort: 'output', toPort: 'input4' },
    { id: 'conn_17', from: 'cell_12', to: 'cell_14', fromPort: 'output', toPort: 'input5' },
    { id: 'conn_18', from: 'cell_13', to: 'cell_14', fromPort: 'output', toPort: 'input6' },
    { id: 'conn_19', from: 'cell_4', to: 'cell_15', fromPort: 'output', toPort: 'input1' },
    { id: 'conn_20', from: 'cell_7', to: 'cell_15', fromPort: 'output', toPort: 'input2' },
    { id: 'conn_21', from: 'cell_10', to: 'cell_15', fromPort: 'output', toPort: 'input3' },
    { id: 'conn_22', from: 'cell_12', to: 'cell_15', fromPort: 'output', toPort: 'input4' },
    { id: 'conn_23', from: 'cell_4', to: 'cell_16', fromPort: 'output', toPort: 'input1' },
    { id: 'conn_24', from: 'cell_7', to: 'cell_16', fromPort: 'output', toPort: 'input2' },
    { id: 'conn_25', from: 'cell_10', to: 'cell_16', fromPort: 'output', toPort: 'input3' },
    { id: 'conn_26', from: 'cell_4', to: 'cell_17', fromPort: 'output', toPort: 'input1' },
    { id: 'conn_27', from: 'cell_7', to: 'cell_17', fromPort: 'output', toPort: 'input2' },
    { id: 'conn_28', from: 'cell_10', to: 'cell_17', fromPort: 'output', toPort: 'input3' },
    { id: 'conn_29', from: 'cell_12', to: 'cell_17', fromPort: 'output', toPort: 'input4' },
  ])

  const [selected, setSelected] = useState<string | null>(null)
  const [zoom, setZoom] = useState(100)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [dragging, setDragging] = useState<string | null>(null)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [connecting, setConnecting] = useState<{ cellId: string; port: string } | null>(null)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const [isPanning, setIsPanning] = useState(false)
  const [panStart, setPanStart] = useState({ x: 0, y: 0 })
  const [editingCell, setEditingCell] = useState<CellNode | null>(null)
  const viewportRef = useRef<HTMLDivElement>(null)

  // MOTOR DE CÁLCULO - Propaga cambios
  const calculateCell = useCallback((cell: CellNode, allCells: CellNode[]): number => {
    if (!cell.formula) {
      return typeof cell.value === 'number' ? cell.value : 0
    }

    try {
      // Reemplazar referencias de celdas con sus valores
      let formula = cell.formula
      
      // Funciones agregadas
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

      // Reemplazar IDs de celdas con sus valores
      allCells.forEach(c => {
        const regex = new RegExp(`\\b${c.id}\\b`, 'g')
        formula = formula.replace(regex, c.calculatedValue.toString())
      })

      // Evaluar la fórmula
      const result = Function(`"use strict"; return (${formula})`)()
      return typeof result === 'number' && !isNaN(result) ? result : 0
    } catch (error) {
      console.error('Error calculando fórmula:', error)
      return 0
    }
  }, [])

  // Recalcular todos los valores
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
  }, [cells, connections, calculateCell])

  const formatValue = (value: number, format: string): string => {
    switch (format) {
      case 'currency':
        return 'Gs. ' + value.toLocaleString('es-PY', { maximumFractionDigits: 0 })
      case 'percentage':
        return (value * 100).toFixed(2) + '%'
      case 'number':
        return value.toLocaleString('es-PY', { maximumFractionDigits: 2 })
      default:
        return value.toString()
    }
  }

  // Funciones de detección de anomalías
  const detectAnomalies = (values: number[], labels: string[]) => {
    const total = values.reduce((sum, val) => sum + val, 0)
    const avg = total / values.length
    const anomalies: { index: number; type: string; severity: 'low' | 'medium' | 'high' }[] = []
    
    values.forEach((val, i) => {
      const percentage = (val / total) * 100
      
      // Detectar valores muy bajos (< 5% del total)
      if (percentage < 5 && val > 0) {
        anomalies.push({ index: i, type: 'Valor muy bajo', severity: 'medium' })
      }
      
      // Detectar valores cero
      if (val === 0) {
        anomalies.push({ index: i, type: 'Sin valor', severity: 'high' })
      }
      
      // Detectar desviación significativa de la media
      if (val < avg * 0.3 && val > 0) {
        anomalies.push({ index: i, type: 'Muy por debajo del promedio', severity: 'low' })
      }
    })
    
    return anomalies
  }

  // Funciones de renderizado de gráficos
  const renderLineChart = (cell: CellNode) => {
    const values = cell.inputs.map(id => cells.find(c => c.id === id)?.calculatedValue || 0)
    const labels = cell.inputs.map(id => cells.find(c => c.id === id)?.label || '')
    if (values.length === 0) return null

    const anomalies = detectAnomalies(values, labels)
    const width = cell.width - 40
    const height = cell.height - 100
    const maxValue = Math.max(...values)
    const minValue = Math.min(...values)
    const range = maxValue - minValue || 1

    const points = values.map((val, i) => {
      const x = (i / (values.length - 1)) * width + 20
      const y = height - ((val - minValue) / range) * (height - 20) + 20
      return `${x},${y}`
    }).join(' ')

    // Calcular cambios (subidas/bajadas)
    const changes = values.map((val, i) => {
      if (i === 0) return 0
      return val - values[i - 1]
    })

    return (
      <div style={{ marginTop: 10 }}>
        <svg width={cell.width - 20} height={height + 40}>
          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => (
            <line
              key={i}
              x1={20}
              y1={20 + ratio * (height - 20)}
              x2={width + 20}
              y2={20 + ratio * (height - 20)}
              stroke="#333"
              strokeWidth="1"
              strokeDasharray="2,2"
            />
          ))}
          
          {/* Line */}
          <polyline
            points={points}
            fill="none"
            stroke="#a3a3a3"
            strokeWidth="2"
          />
          
          {/* Points with labels and warnings */}
          {values.map((val, i) => {
            const x = (i / (values.length - 1)) * width + 20
            const y = height - ((val - minValue) / range) * (height - 20) + 20
            const change = changes[i]
            const anomaly = anomalies.find(a => a.index === i)
            const color = anomaly ? (anomaly.severity === 'high' ? '#ef4444' : anomaly.severity === 'medium' ? '#f59e0b' : '#a3a3a3') : (change > 0 ? '#d4d4d4' : change < 0 ? '#737373' : '#a3a3a3')
            
            return (
              <g key={i}>
                {/* Warning indicator */}
                {anomaly && (
                  <circle cx={x} cy={y} r="12" fill="none" stroke={color} strokeWidth="2" strokeDasharray="3,3">
                    <animate attributeName="stroke-dashoffset" from="0" to="6" dur="1s" repeatCount="indefinite" />
                  </circle>
                )}
                
                {/* Point */}
                <circle cx={x} cy={y} r="5" fill={color} />
                
                {/* Value label */}
                <text x={x} y={y - 12} textAnchor="middle" fill="#ccc" fontSize="9" fontWeight="600">
                  {formatValue(val, 'currency').replace('Gs. ', '')}
                </text>
                
                {/* Item name */}
                <text x={x} y={height + 15} textAnchor="middle" fill="#888" fontSize="8">
                  {labels[i].substring(0, 12)}
                </text>
                
                {/* Warning icon */}
                {anomaly && (
                  <text x={x + 8} y={y - 8} fill={color} fontSize="12" fontWeight="bold">
                    ⚠
                  </text>
                )}
              </g>
            )
          })}
        </svg>
        
        {/* Legend with warnings */}
        {anomalies.length > 0 && (
          <div style={{ padding: '8px 10px', marginTop: 4, background: '#1a1a1a', borderRadius: 4, border: '1px solid #333' }}>
            <div style={{ fontSize: 9, color: '#f59e0b', marginBottom: 4, fontWeight: 600 }}>
              ⚠ Advertencias ({anomalies.length})
            </div>
            {anomalies.slice(0, 3).map((a, i) => (
              <div key={i} style={{ fontSize: 8, color: '#888', marginBottom: 2 }}>
                • {labels[a.index].substring(0, 20)}: {a.type}
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  const renderPieChart = (cell: CellNode) => {
    const values = cell.inputs.map(id => cells.find(c => c.id === id)?.calculatedValue || 0)
    const labels = cell.inputs.map(id => cells.find(c => c.id === id)?.label || '')
    const total = values.reduce((sum, val) => sum + val, 0)
    
    if (total === 0) return null

    const anomalies = detectAnomalies(values, labels)
    const centerX = (cell.width - 20) / 2
    const centerY = (cell.height - 120) / 2
    const radius = Math.min(centerX, centerY) - 10

    let currentAngle = -90
    const colors = ['#d4d4d4', '#a3a3a3', '#737373', '#525252', '#404040', '#262626']

    return (
      <div style={{ marginTop: 10 }}>
        <svg width={cell.width - 20} height={cell.height - 100}>
          {values.map((val, i) => {
            const percentage = val / total
            const angle = percentage * 360
            const startAngle = currentAngle
            const endAngle = currentAngle + angle
            const midAngle = startAngle + angle / 2
            currentAngle = endAngle

            const startRad = (startAngle * Math.PI) / 180
            const endRad = (endAngle * Math.PI) / 180
            const midRad = (midAngle * Math.PI) / 180

            const x1 = centerX + radius * Math.cos(startRad)
            const y1 = centerY + radius * Math.sin(startRad)
            const x2 = centerX + radius * Math.cos(endRad)
            const y2 = centerY + radius * Math.sin(endRad)

            const largeArcFlag = angle > 180 ? 1 : 0

            const path = `M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`

            const anomaly = anomalies.find(a => a.index === i)
            const isAnomaly = !!anomaly

            return (
              <g key={i}>
                {/* Warning ring for anomalies */}
                {isAnomaly && (
                  <path
                    d={path}
                    fill="none"
                    stroke={anomaly?.severity === 'high' ? '#ef4444' : '#f59e0b'}
                    strokeWidth="4"
                    strokeDasharray="5,5"
                    opacity="0.6"
                  >
                    <animate attributeName="stroke-dashoffset" from="0" to="10" dur="1s" repeatCount="indefinite" />
                  </path>
                )}
                
                {/* Main slice */}
                <path d={path} fill={colors[i % colors.length]} stroke="#0b0c0d" strokeWidth="2" />
                
                {/* Percentage inside */}
                {percentage > 0.05 && (
                  <text
                    x={centerX + (radius * 0.6) * Math.cos(midRad)}
                    y={centerY + (radius * 0.6) * Math.sin(midRad)}
                    textAnchor="middle"
                    fill="#fff"
                    fontSize="11"
                    fontWeight="bold"
                  >
                    {(percentage * 100).toFixed(1)}%
                  </text>
                )}
                
                {/* Label outside */}
                {percentage > 0.03 && (
                  <text
                    x={centerX + (radius + 15) * Math.cos(midRad)}
                    y={centerY + (radius + 15) * Math.sin(midRad)}
                    textAnchor="middle"
                    fill="#ccc"
                    fontSize="8"
                    fontWeight="600"
                  >
                    {labels[i].substring(0, 15)}
                  </text>
                )}
                
                {/* Warning icon */}
                {isAnomaly && percentage > 0.05 && (
                  <text
                    x={centerX + (radius * 0.85) * Math.cos(midRad)}
                    y={centerY + (radius * 0.85) * Math.sin(midRad)}
                    textAnchor="middle"
                    fill={anomaly?.severity === 'high' ? '#ef4444' : '#f59e0b'}
                    fontSize="14"
                    fontWeight="bold"
                  >
                    ⚠
                  </text>
                )}
              </g>
            )
          })}
        </svg>
        
        {/* Legend with warnings */}
        <div style={{ padding: '8px 10px', marginTop: 4, background: '#1a1a1a', borderRadius: 4, border: '1px solid #333' }}>
          {labels.slice(0, 5).map((label, i) => {
            const percentage = (values[i] / total) * 100
            const anomaly = anomalies.find(a => a.index === i)
            return (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3, fontSize: 9 }}>
                <div style={{ width: 8, height: 8, background: colors[i % colors.length], borderRadius: 2 }} />
                <span style={{ color: '#ccc', flex: 1 }}>{label.substring(0, 18)}</span>
                <span style={{ color: '#888' }}>{percentage.toFixed(1)}%</span>
                {anomaly && <span style={{ color: anomaly.severity === 'high' ? '#ef4444' : '#f59e0b' }}>⚠</span>}
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  const renderBarChart = (cell: CellNode) => {
    const values = cell.inputs.map(id => cells.find(c => c.id === id)?.calculatedValue || 0)
    const labels = cell.inputs.map(id => cells.find(c => c.id === id)?.label || '')
    
    if (values.length === 0) return null

    const anomalies = detectAnomalies(values, labels)
    const width = cell.width - 40
    const height = cell.height - 100
    const maxValue = Math.max(...values)
    const barWidth = (width - 20) / values.length - 10
    const colors = ['#d4d4d4', '#a3a3a3', '#737373', '#525252']

    return (
      <div style={{ marginTop: 10 }}>
        <svg width={cell.width - 20} height={height + 40}>
          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => (
            <line
              key={i}
              x1={20}
              y1={height - ratio * height + 10}
              x2={width + 20}
              y2={height - ratio * height + 10}
              stroke="#333"
              strokeWidth="1"
              strokeDasharray="2,2"
            />
          ))}
          
          {/* Bars */}
          {values.map((val, i) => {
            const barHeight = (val / maxValue) * (height - 20)
            const x = 25 + i * (barWidth + 10)
            const y = height - barHeight + 10
            const anomaly = anomalies.find(a => a.index === i)
            const isAnomaly = !!anomaly

            return (
              <g key={i}>
                {/* Warning border for anomalies */}
                {isAnomaly && (
                  <rect
                    x={x - 2}
                    y={y - 2}
                    width={barWidth + 4}
                    height={barHeight + 4}
                    fill="none"
                    stroke={anomaly?.severity === 'high' ? '#ef4444' : '#f59e0b'}
                    strokeWidth="2"
                    strokeDasharray="4,4"
                    rx="2"
                  >
                    <animate attributeName="stroke-dashoffset" from="0" to="8" dur="1s" repeatCount="indefinite" />
                  </rect>
                )}
                
                {/* Main bar */}
                <rect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={barHeight}
                  fill={colors[i % colors.length]}
                  stroke="#0b0c0d"
                  strokeWidth="1"
                  rx="2"
                />
                
                {/* Value label */}
                <text
                  x={x + barWidth / 2}
                  y={y - 8}
                  textAnchor="middle"
                  fill="#ccc"
                  fontSize="9"
                  fontWeight="600"
                >
                  {formatValue(val, 'currency').replace('Gs. ', '').substring(0, 10)}
                </text>
                
                {/* Item name */}
                <text
                  x={x + barWidth / 2}
                  y={height + 15}
                  textAnchor="middle"
                  fill="#888"
                  fontSize="8"
                  fontWeight="500"
                >
                  {labels[i].substring(0, 10)}
                </text>
                
                {/* Warning icon */}
                {isAnomaly && (
                  <text
                    x={x + barWidth / 2}
                    y={y + barHeight / 2}
                    textAnchor="middle"
                    fill={anomaly?.severity === 'high' ? '#ef4444' : '#f59e0b'}
                    fontSize="16"
                    fontWeight="bold"
                  >
                    ⚠
                  </text>
                )}
              </g>
            )
          })}
        </svg>
        
        {/* Warnings panel */}
        {anomalies.length > 0 && (
          <div style={{ padding: '8px 10px', marginTop: 4, background: '#1a1a1a', borderRadius: 4, border: '1px solid #333' }}>
            <div style={{ fontSize: 9, color: '#f59e0b', marginBottom: 4, fontWeight: 600 }}>
              ⚠ Atención requerida ({anomalies.length})
            </div>
            {anomalies.slice(0, 3).map((a, i) => (
              <div key={i} style={{ fontSize: 8, color: '#888', marginBottom: 2 }}>
                • {labels[a.index].substring(0, 20)}: {a.type}
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  const renderPercentageChart = (cell: CellNode) => {
    const values = cell.inputs.map(id => cells.find(c => c.id === id)?.calculatedValue || 0)
    const labels = cell.inputs.map(id => cells.find(c => c.id === id)?.label || '')
    const total = values.reduce((sum, val) => sum + val, 0)
    
    if (total === 0) return null

    const anomalies = detectAnomalies(values, labels)
    const colors = ['#d4d4d4', '#a3a3a3', '#737373', '#525252', '#404040']
    const barHeight = 24

    return (
      <div style={{ padding: 10, marginTop: 10 }}>
        {values.map((val, i) => {
          const percentage = (val / total) * 100
          const anomaly = anomalies.find(a => a.index === i)
          const isAnomaly = !!anomaly
          const warningColor = anomaly?.severity === 'high' ? '#ef4444' : anomaly?.severity === 'medium' ? '#f59e0b' : '#a3a3a3'

          return (
            <div key={i} style={{ marginBottom: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, flex: 1 }}>
                  {isAnomaly && (
                    <span style={{ color: warningColor, fontSize: 12, fontWeight: 'bold' }}>⚠</span>
                  )}
                  <span style={{ color: '#ccc', fontSize: 10, fontWeight: isAnomaly ? '600' : '400' }}>
                    {labels[i].substring(0, 25)}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ color: '#888', fontSize: 9 }}>
                    {formatValue(val, 'currency').replace('Gs. ', '').substring(0, 12)}
                  </span>
                  <span style={{ color: '#fff', fontWeight: 700, fontSize: 11, minWidth: 45, textAlign: 'right' }}>
                    {percentage.toFixed(1)}%
                  </span>
                </div>
              </div>
              
              {/* Progress bar */}
              <div style={{ 
                height: barHeight, 
                background: '#1a1a1a', 
                borderRadius: 4, 
                overflow: 'hidden', 
                border: isAnomaly ? `2px solid ${warningColor}` : '1px solid #333',
                position: 'relative'
              }}>
                <div
                  style={{
                    height: '100%',
                    width: `${percentage}%`,
                    background: isAnomaly ? warningColor : colors[i % colors.length],
                    transition: 'width 0.3s ease',
                    position: 'relative'
                  }}
                />
                
                {/* Warning overlay for low percentages */}
                {isAnomaly && percentage < 10 && (
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: `repeating-linear-gradient(
                      45deg,
                      transparent,
                      transparent 5px,
                      ${warningColor}22 5px,
                      ${warningColor}22 10px
                    )`,
                    animation: 'moveStripes 1s linear infinite'
                  }} />
                )}
              </div>
              
              {/* Warning message */}
              {isAnomaly && (
                <div style={{ 
                  marginTop: 4, 
                  padding: '4px 8px', 
                  background: `${warningColor}11`, 
                  borderRadius: 3,
                  border: `1px solid ${warningColor}33`,
                  fontSize: 8,
                  color: warningColor,
                  fontWeight: '500'
                }}>
                  ⚠ {anomaly?.type} - Revisar con detalle
                </div>
              )}
            </div>
          )
        })}
        
        {/* Summary warnings */}
        {anomalies.length > 0 && (
          <div style={{ 
            marginTop: 12, 
            padding: '10px', 
            background: '#1a1a1a', 
            borderRadius: 4, 
            border: '1px solid #333' 
          }}>
            <div style={{ fontSize: 10, color: '#f59e0b', marginBottom: 6, fontWeight: 700 }}>
              ⚠ Resumen de Advertencias ({anomalies.length})
            </div>
            {anomalies.map((a, i) => (
              <div key={i} style={{ fontSize: 9, color: '#888', marginBottom: 3, paddingLeft: 12 }}>
                • <span style={{ color: '#ccc' }}>{labels[a.index].substring(0, 20)}</span>: {a.type}
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  const addCell = (type: string) => {
    const cellType = CELL_TYPES.find(t => t.id === type)
    if (!cellType) return

    const newCell: CellNode = {
      id: genId(),
      x: 200 + Math.random() * 200,
      y: 150 + Math.random() * 200,
      width: 180,
      height: 100,
      label: cellType.name,
      value: 0,
      formula: '',
      format: type === 'currency' || type === 'iva' || type === 'subtotal' || type === 'total' ? 'currency' : 'number',
      category: cellType.name,
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
          
          // Actualizar inputs de la celda destino
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

  const handleViewportClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget || (e.target as HTMLElement).id === 'world') {
      setSelected(null)
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
            </defs>
            {connections.map(conn => {
              const fromCell = cells.find(c => c.id === conn.from)
              const toCell = cells.find(c => c.id === conn.to)
              if (!fromCell || !toCell) return null

              const x1 = fromCell.x + fromCell.width
              const y1 = fromCell.y + fromCell.height / 2
              const x2 = toCell.x
              const y2 = toCell.y + toCell.height / 2

              return (
                <path
                  key={conn.id}
                  d={`M${x1},${y1} C${x1 + 50},${y1} ${x2 - 50},${y2} ${x2},${y2}`}
                  stroke="#555"
                  strokeWidth="2"
                  fill="none"
                  markerEnd="url(#arrow)"
                />
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
            const cellType = CELL_TYPES.find(t => t.name === cell.category)
            const borderColor = isSelected ? '#fff' : '#404040'

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
                  transition: dragging === cell.id ? 'none' : 'box-shadow 0.2s',
                  display: 'flex',
                  flexDirection: 'column'
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
                  }}>{cellType?.icon || '?'}</span>
                  <div style={{ flex: 1, fontSize: 11, fontWeight: 600, color: '#e5e5e5' }}>{cell.label}</div>
                </div>

                {/* Content */}
                <div style={{ padding: '10px 12px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', overflow: 'hidden' }}>
                  {cell.category === 'Gráfico Línea' ? (
                    renderLineChart(cell)
                  ) : cell.category === 'Gráfico Circular' ? (
                    renderPieChart(cell)
                  ) : cell.category === 'Gráfico Barras' ? (
                    renderBarChart(cell)
                  ) : cell.category === 'Porcentaje' ? (
                    renderPercentageChart(cell)
                  ) : (
                    <>
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
                    </>
                  )}
                </div>

                {/* Input Ports */}
                {cell.category.startsWith('Gráfico') || cell.category === 'Porcentaje' ? (
                  // Múltiples puertos para gráficos
                  <>
                    {[0, 1, 2, 3, 4, 5].map((i) => (
                      <div
                        key={`input${i + 1}`}
                        data-cell-id={cell.id}
                        data-port={`input${i + 1}`}
                        onMouseDown={e => { e.stopPropagation(); handleMouseDown(e, cell.id, `input${i + 1}`) }}
                        style={{
                          position: 'absolute',
                          left: -8,
                          top: `${20 + i * 13}%`,
                          width: 14,
                          height: 14,
                          borderRadius: '50%',
                          background: '#444',
                          border: '3px solid #0b0c0d',
                          cursor: 'crosshair'
                        }}
                      />
                    ))}
                  </>
                ) : (
                  // Puertos estándar para celdas normales
                  <>
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
                  </>
                )}

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

      {/* RIGHT PANEL - Properties */}
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
            <div style={{ fontSize: 9, color: '#666', marginTop: 4 }}>
              Usa IDs de celdas: cell_1, cell_2, etc.
            </div>
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 10, color: '#666', marginBottom: 6, textTransform: 'uppercase' }}>Formato</label>
            <select
              value={selectedCell.format}
              onChange={e => updateCell(selectedCell.id, { format: e.target.value as any })}
              style={{ width: '100%', background: '#0b0c0d', border: '1px solid #333', color: '#ccc', padding: '8px 12px', borderRadius: 4, fontFamily: 'inherit', fontSize: 12 }}
            >
              <option value="number">Número</option>
              <option value="currency">Moneda (Gs.)</option>
              <option value="percentage">Porcentaje</option>
              <option value="text">Texto</option>
            </select>
          </div>

          <div style={{ marginBottom: 20, padding: 12, background: '#1a1a1a', borderRadius: 6 }}>
            <div style={{ fontSize: 10, color: '#666', marginBottom: 4, textTransform: 'uppercase' }}>Valor Calculado</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#fff' }}>
              {formatValue(selectedCell.calculatedValue, selectedCell.format)}
            </div>
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 10, color: '#666', marginBottom: 6, textTransform: 'uppercase' }}>Inputs ({selectedCell.inputs.length})</label>
            <div style={{ background: '#1a1a1a', padding: '8px 12px', borderRadius: 4, fontSize: 10, fontFamily: 'monospace' }}>
              {selectedCell.inputs.length > 0 ? selectedCell.inputs.join(', ') : 'Ninguno'}
            </div>
          </div>

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
                <div style={{ fontSize: 10, color: '#666', marginTop: 6, lineHeight: 1.6 }}>
                  <b>Funciones:</b> SUM(), AVG(), MIN(), MAX(), COUNT()<br />
                  <b>Operadores:</b> +, -, *, /<br />
                  <b>Referencias:</b> cell_1, cell_2, etc.
                </div>
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
