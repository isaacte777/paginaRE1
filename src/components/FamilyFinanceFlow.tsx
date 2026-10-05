import { useState, useRef, useEffect } from 'react'
import { OCTUBRE_2026, SEPTIEMBRE_2026, DEUDAS, TARJETAS_CREDITO, PAGOS_FIJOS, POR_COBRAR, HERRAMIENTAS_PENDIENTES } from '../data/familyFinanceData'

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
  '#d4d4d4', '#a3a3a3', '#737373', '#525252', '#404040', '#262626',
  '#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899',
]

const CELL_TYPES = [
  { id: 'input', name: 'Entrada', icon: 'I', desc: 'Valor manual' },
  { id: 'income', name: 'Ingreso', icon: '+', desc: 'Fuente de ingreso' },
  { id: 'expense', name: 'Gasto', icon: '-', desc: 'Gasto fijo/variable' },
  { id: 'debt', name: 'Deuda', icon: 'D', desc: 'Cuota de deuda' },
  { id: 'card', name: 'Tarjeta', icon: 'C', desc: 'Tarjeta de crédito' },
  { id: 'calc', name: 'Cálculo', icon: '=', desc: 'Fórmula' },
  { id: 'sum', name: 'Suma', icon: 'S', desc: 'SUM(inputs)' },
  { id: 'total', name: 'Total', icon: 'T', desc: 'Total general' },
  { id: 'balance', name: 'Balance', icon: 'B', desc: 'Balance final' },
  { id: 'percent', name: 'Porcentaje', icon: '%', desc: 'Porcentaje' },
  { id: 'line_chart', name: 'Gráfico Línea', icon: 'L', desc: 'Tendencia' },
  { id: 'pie_chart', name: 'Gráfico Circular', icon: 'O', desc: 'Distribución' },
  { id: 'bar_chart', name: 'Gráfico Barras', icon: 'B', desc: 'Comparación' },
]

let idCounter = 0
const genId = () => `c${++idCounter}`

export default function FamilyFinanceFlow() {
  const [cells, setCells] = useState<CellNode[]>([])
  const [connections, setConnections] = useState<Connection[]>([])
  const [selected, setSelected] = useState<string | null>(null)
  const [selectedConnection, setSelectedConnection] = useState<string | null>(null)
  const [highlightConnections, setHighlightConnections] = useState(false)
  const [zoom, setZoom] = useState(70)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [dragging, setDragging] = useState<string | null>(null)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [connecting, setConnecting] = useState<{ cellId: string; port: string } | null>(null)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const [isPanning, setIsPanning] = useState(false)
  const [panStart, setPanStart] = useState({ x: 0, y: 0 })
  const [editingCell, setEditingCell] = useState<CellNode | null>(null)
  const [tooltip, setTooltip] = useState<{ visible: boolean; x: number; y: number; content: string; type: 'warning' | 'info' }>({ visible: false, x: 0, y: 0, content: '', type: 'warning' })
  const viewportRef = useRef<HTMLDivElement>(null)

  // Generar nodos y conexiones automáticamente
  useEffect(() => {
    const newCells: CellNode[] = []
    const newConnections: Connection[] = []
    let y = 0

    // SECCIÓN 1: CAPITAL
    const capitalInicial = createCell(50, y, 200, 90, 'Capital Inicial Oct', OCTUBRE_2026.capitalInicial, '', 'currency', 'Entrada', [], OCTUBRE_2026.capitalInicial)
    const capitalFinal = createCell(50, y + 110, 200, 90, 'Capital Final Oct', OCTUBRE_2026.capitalFinal, '', 'currency', 'Entrada', [], OCTUBRE_2026.capitalFinal)
    const variacion = createCell(50, y + 220, 200, 90, 'Variación %', OCTUBRE_2026.variacion, '', 'percentage', 'Porcentaje', [], OCTUBRE_2026.variacion)
    newCells.push(capitalInicial, capitalFinal, variacion)

    // SECCIÓN 2: GASTOS OCTUBRE
    y = 0
    let x = 350
    const gastosOctIds: string[] = []
    
    // Título
    const tituloGastos = { id: genId(), x: x, y: y, width: 200, height: 60, label: 'GASTOS OCTUBRE 2026', value: '', formula: '', format: 'text', category: 'Entrada', inputs: [], calculatedValue: 0 }
    newCells.push(tituloGastos)
    y += 80

    OCTUBRE_2026.gastos.items.forEach((gasto, i) => {
      if (gasto.real > 0) {
        const id = genId()
        const cell = { id, x: x + (i % 3) * 220, y: y + Math.floor(i / 3) * 110, width: 200, height: 90, label: gasto.categoria, value: gasto.real, formula: '', format: 'currency', category: 'Gasto', inputs: [], calculatedValue: gasto.real }
        newCells.push(cell)
        gastosOctIds.push(id)
      }
    })

    // Total Gastos Octubre
    const totalGastosOct = { id: genId(), x: x + 700, y: y + 200, width: 220, height: 120, label: 'TOTAL GASTOS OCT', value: OCTUBRE_2026.gastos.real, formula: `SUM(${gastosOctIds.join(',')})`, format: 'currency', category: 'Total', inputs: gastosOctIds, calculatedValue: OCTUBRE_2026.gastos.real }
    newCells.push(totalGastosOct)

    // Conexiones a total
    gastosOctIds.forEach((id, i) => {
      newConnections.push({ id: genId(), from: id, to: totalGastosOct.id, fromPort: 'output', toPort: `input${(i % 5) + 1}` })
    })

    // SECCIÓN 3: INGRESOS OCTUBRE
    y = 600
    x = 350
    const ingresosOctIds: string[] = []
    
    const tituloIngresos = { id: genId(), x: x, y: y, width: 200, height: 60, label: 'INGRESOS OCTUBRE 2026', value: '', formula: '', format: 'text', category: 'Entrada', inputs: [], calculatedValue: 0 }
    newCells.push(tituloIngresos)
    y += 80

    OCTUBRE_2026.ingresos.items.forEach((ingreso, i) => {
      if (ingreso.real > 0) {
        const id = genId()
        const cell = { id, x: x + (i % 3) * 220, y: y + Math.floor(i / 3) * 110, width: 200, height: 90, label: ingreso.fuente, value: ingreso.real, formula: '', format: 'currency', category: 'Ingreso', inputs: [], calculatedValue: ingreso.real }
        newCells.push(cell)
        ingresosOctIds.push(id)
      }
    })

    // Total Ingresos Octubre
    const totalIngresosOct = { id: genId(), x: x + 700, y: y + 200, width: 220, height: 120, label: 'TOTAL INGRESOS OCT', value: OCTUBRE_2026.ingresos.real, formula: `SUM(${ingresosOctIds.join(',')})`, format: 'currency', category: 'Total', inputs: ingresosOctIds, calculatedValue: OCTUBRE_2026.ingresos.real }
    newCells.push(totalIngresosOct)

    // Conexiones a total
    ingresosOctIds.forEach((id, i) => {
      newConnections.push({ id: genId(), from: id, to: totalIngresosOct.id, fromPort: 'output', toPort: `input${(i % 5) + 1}` })
    })

    // SECCIÓN 4: DEUDAS
    y = 1200
    x = 50
    const deudasIds: string[] = []
    
    const tituloDeudas = { id: genId(), x: x, y: y, width: 200, height: 60, label: 'DEUDAS', value: '', formula: '', format: 'text', category: 'Entrada', inputs: [], calculatedValue: 0 }
    newCells.push(tituloDeudas)
    y += 80

    DEUDAS.forEach((deuda, i) => {
      const id = genId()
      const cell = { id, x: x + (i % 4) * 220, y: y + Math.floor(i / 4) * 110, width: 200, height: 90, label: `${deuda.nombre} (${deuda.estado})`, value: deuda.restante, formula: '', format: 'currency', category: 'Deuda', inputs: [], calculatedValue: deuda.restante, color: deuda.estado === 'CANCELADA' ? '#10b981' : deuda.estado === 'PENDIENTE' ? '#f59e0b' : '#ef4444' }
      newCells.push(cell)
      deudasIds.push(id)
    })

    // Total Deudas
    const totalDeudas = { id: genId(), x: x + 900, y: y + 100, width: 220, height: 120, label: 'TOTAL DEUDAS', value: DEUDAS.reduce((sum, d) => sum + Math.max(0, d.restante), 0), formula: `SUM(${deudasIds.join(',')})`, format: 'currency', category: 'Total', inputs: deudasIds, calculatedValue: DEUDAS.reduce((sum, d) => sum + Math.max(0, d.restante), 0) }
    newCells.push(totalDeudas)

    deudasIds.forEach((id, i) => {
      newConnections.push({ id: genId(), from: id, to: totalDeudas.id, fromPort: 'output', toPort: `input${(i % 5) + 1}` })
    })

    // SECCIÓN 5: TARJETAS DE CRÉDITO
    y = 1600
    x = 50
    const tarjetasIds: string[] = []
    
    const tituloTarjetas = { id: genId(), x: x, y: y, width: 200, height: 60, label: 'TARJETAS DE CRÉDITO', value: '', formula: '', format: 'text', category: 'Entrada', inputs: [], calculatedValue: 0 }
    newCells.push(tituloTarjetas)
    y += 80

    TARJETAS_CREDITO.forEach((tarjeta, i) => {
      const id = genId()
      const cell = { id, x: x + (i % 4) * 220, y: y, width: 200, height: 90, label: `${tarjeta.banco} - ${tarjeta.titular}`, value: tarjeta.consumido, formula: '', format: 'currency', category: 'Tarjeta', inputs: [], calculatedValue: tarjeta.consumido }
      newCells.push(cell)
      tarjetasIds.push(id)
    })

    // Total Tarjetas
    const totalTarjetas = { id: genId(), x: x + 900, y: y, width: 220, height: 120, label: 'TOTAL TARJETAS', value: TARJETAS_CREDITO.reduce((sum, t) => sum + t.consumido, 0), formula: `SUM(${tarjetasIds.join(',')})`, format: 'currency', category: 'Total', inputs: tarjetasIds, calculatedValue: TARJETAS_CREDITO.reduce((sum, t) => sum + t.consumido, 0) }
    newCells.push(totalTarjetas)

    tarjetasIds.forEach((id, i) => {
      newConnections.push({ id: genId(), from: id, to: totalTarjetas.id, fromPort: 'output', toPort: `input${(i % 5) + 1}` })
    })

    // SECCIÓN 6: POR COBRAR
    y = 1900
    x = 50
    const porCobrarIds: string[] = []
    
    const tituloPorCobrar = { id: genId(), x: x, y: y, width: 200, height: 60, label: 'POR COBRAR', value: '', formula: '', format: 'text', category: 'Entrada', inputs: [], calculatedValue: 0 }
    newCells.push(tituloPorCobrar)
    y += 80

    POR_COBRAR.forEach((cobro, i) => {
      const id = genId()
      const cell = { id, x: x + (i % 4) * 220, y: y, width: 200, height: 90, label: cobro.cliente, value: cobro.monto, formula: '', format: 'currency', category: 'Ingreso', inputs: [], calculatedValue: cobro.monto }
      newCells.push(cell)
      porCobrarIds.push(id)
    })

    // Total Por Cobrar
    const totalPorCobrar = { id: genId(), x: x + 900, y: y, width: 220, height: 120, label: 'TOTAL POR COBRAR', value: POR_COBRAR.reduce((sum, c) => sum + c.monto, 0), formula: `SUM(${porCobrarIds.join(',')})`, format: 'currency', category: 'Total', inputs: porCobrarIds, calculatedValue: POR_COBRAR.reduce((sum, c) => sum + c.monto, 0) }
    newCells.push(totalPorCobrar)

    porCobrarIds.forEach((id, i) => {
      newConnections.push({ id: genId(), from: id, to: totalPorCobrar.id, fromPort: 'output', toPort: `input${(i % 5) + 1}` })
    })

    // SECCIÓN 7: HERRAMIENTAS PENDIENTES
    y = 2200
    x = 50
    const herramientasIds: string[] = []
    
    const tituloHerramientas = { id: genId(), x: x, y: y, width: 200, height: 60, label: 'HERRAMIENTAS PENDIENTES', value: '', formula: '', format: 'text', category: 'Entrada', inputs: [], calculatedValue: 0 }
    newCells.push(tituloHerramientas)
    y += 80

    HERRAMIENTAS_PENDIENTES.forEach((herr, i) => {
      const id = genId()
      const cell = { id, x: x + (i % 3) * 220, y: y + Math.floor(i / 3) * 110, width: 200, height: 90, label: herr.nombre, value: herr.pendiente, formula: '', format: 'currency', category: 'Deuda', inputs: [], calculatedValue: herr.pendiente }
      newCells.push(cell)
      herramientasIds.push(id)
    })

    // Total Herramientas
    const totalHerramientas = { id: genId(), x: x + 700, y: y + 100, width: 220, height: 120, label: 'TOTAL HERRAMIENTAS', value: HERRAMIENTAS_PENDIENTES.reduce((sum, h) => sum + h.pendiente, 0), formula: `SUM(${herramientasIds.join(',')})`, format: 'currency', category: 'Total', inputs: herramientasIds, calculatedValue: HERRAMIENTAS_PENDIENTES.reduce((sum, h) => sum + h.pendiente, 0) }
    newCells.push(totalHerramientas)

    herramientasIds.forEach((id, i) => {
      newConnections.push({ id: genId(), from: id, to: totalHerramientas.id, fromPort: 'output', toPort: `input${(i % 5) + 1}` })
    })

    // SECCIÓN 8: CÁLCULOS FINALES
    y = 2700
    x = 50
    
    // Balance del mes
    const balanceMes = { id: genId(), x: x, y: y, width: 240, height: 130, label: 'BALANCE DEL MES', value: 0, formula: `${totalIngresosOct.id} - ${totalGastosOct.id}`, format: 'currency', category: 'Balance', inputs: [totalIngresosOct.id, totalGastosOct.id], calculatedValue: OCTUBRE_2026.ingresos.real - OCTUBRE_2026.gastos.real }
    newCells.push(balanceMes)
    newConnections.push({ id: genId(), from: totalIngresosOct.id, to: balanceMes.id, fromPort: 'output', toPort: 'input1' })
    newConnections.push({ id: genId(), from: totalGastosOct.id, to: balanceMes.id, fromPort: 'output', toPort: 'input2' })

    // Deuda Total
    const deudaTotal = { id: genId(), x: x + 300, y: y, width: 240, height: 130, label: 'DEUDA TOTAL', value: 0, formula: `${totalDeudas.id} + ${totalTarjetas.id} + ${totalHerramientas.id}`, format: 'currency', category: 'Total', inputs: [totalDeudas.id, totalTarjetas.id, totalHerramientas.id], calculatedValue: totalDeudas.calculatedValue + totalTarjetas.calculatedValue + totalHerramientas.calculatedValue }
    newCells.push(deudaTotal)
    newConnections.push({ id: genId(), from: totalDeudas.id, to: deudaTotal.id, fromPort: 'output', toPort: 'input1' })
    newConnections.push({ id: genId(), from: totalTarjetas.id, to: deudaTotal.id, fromPort: 'output', toPort: 'input2' })
    newConnections.push({ id: genId(), from: totalHerramientas.id, to: deudaTotal.id, fromPort: 'output', toPort: 'input3' })

    // Porcentaje de Ahorro
    const porcentajeAhorro = { id: genId(), x: x + 600, y: y, width: 240, height: 130, label: '% AHORRO', value: 0, formula: `(${balanceMes.id} / ${totalIngresosOct.id}) * 100`, format: 'percentage', category: 'Porcentaje', inputs: [balanceMes.id, totalIngresosOct.id], calculatedValue: ((OCTUBRE_2026.ingresos.real - OCTUBRE_2026.gastos.real) / OCTUBRE_2026.ingresos.real) * 100 }
    newCells.push(porcentajeAhorro)
    newConnections.push({ id: genId(), from: balanceMes.id, to: porcentajeAhorro.id, fromPort: 'output', toPort: 'input1' })
    newConnections.push({ id: genId(), from: totalIngresosOct.id, to: porcentajeAhorro.id, fromPort: 'output', toPort: 'input2' })

    // SECCIÓN 9: GRÁFICOS
    y = 3000
    x = 50

    // Gráfico Circular - Distribución de Gastos
    const graficoCircular = { id: genId(), x: x, y: y, width: 300, height: 220, label: 'Distribución de Gastos', value: 0, formula: '', format: 'percentage', category: 'Gráfico Circular', inputs: gastosOctIds.slice(0, 6), calculatedValue: 0 }
    newCells.push(graficoCircular)
    gastosOctIds.slice(0, 6).forEach((id, i) => {
      newConnections.push({ id: genId(), from: id, to: graficoCircular.id, fromPort: 'output', toPort: `input${i + 1}` })
    })

    // Gráfico de Barras - Ingresos vs Gastos
    const graficoBarras = { id: genId(), x: x + 350, y: y, width: 300, height: 220, label: 'Ingresos vs Gastos', value: 0, formula: '', format: 'currency', category: 'Gráfico Barras', inputs: [totalIngresosOct.id, totalGastosOct.id], calculatedValue: 0 }
    newCells.push(graficoBarras)
    newConnections.push({ id: genId(), from: totalIngresosOct.id, to: graficoBarras.id, fromPort: 'output', toPort: 'input1' })
    newConnections.push({ id: genId(), from: totalGastosOct.id, to: graficoBarras.id, fromPort: 'output', toPort: 'input2' })

    // Gráfico de Línea - Evolución Mensual
    const graficoLinea = { id: genId(), x: x + 700, y: y, width: 300, height: 220, label: 'Evolución Capital', value: 0, formula: '', format: 'currency', category: 'Gráfico Línea', inputs: [capitalInicial.id, capitalFinal.id], calculatedValue: 0 }
    newCells.push(graficoLinea)
    newConnections.push({ id: genId(), from: capitalInicial.id, to: graficoLinea.id, fromPort: 'output', toPort: 'input1' })
    newConnections.push({ id: genId(), from: capitalFinal.id, to: graficoLinea.id, fromPort: 'output', toPort: 'input2' })

    setCells(newCells)
    setConnections(newConnections)
  }, [])

  // Calcular path completo
  const connectedPath = selected && highlightConnections ? (() => {
    const connectedConnections = new Set<string>()
    const connectedNodes = new Set<string>([selected])
    
    const traverseForward = (nodeId: string, visited: Set<string>) => {
      if (visited.has(nodeId)) return
      visited.add(nodeId)
      connections.forEach(conn => {
        if (conn.from === nodeId) {
          connectedConnections.add(conn.id)
          connectedNodes.add(conn.to)
          traverseForward(conn.to, visited)
        }
      })
    }
    
    const traverseBackward = (nodeId: string, visited: Set<string>) => {
      if (visited.has(nodeId)) return
      visited.add(nodeId)
      connections.forEach(conn => {
        if (conn.to === nodeId) {
          connectedConnections.add(conn.id)
          connectedNodes.add(conn.from)
          traverseBackward(conn.from, visited)
        }
      })
    }
    
    traverseForward(selected, new Set())
    traverseBackward(selected, new Set())
    return { connections: Array.from(connectedConnections), nodes: Array.from(connectedNodes) }
  })() : null

  const calculateCell = (cell: CellNode, allCells: CellNode[]): number => {
    if (!cell.formula) return typeof cell.value === 'number' ? cell.value : 0
    try {
      let formula = cell.formula
      const funcMatch = formula.match(/(SUM|AVG|MIN|MAX|COUNT)\(([^)]+)\)/)
      if (funcMatch) {
        const [, func, args] = funcMatch
        const values = args.split(',').map(s => s.trim()).map(id => allCells.find(c => c.id === id)?.calculatedValue || 0)
        switch (func) {
          case 'SUM': return values.reduce((a, b) => a + b, 0)
          case 'AVG': return values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0
          case 'MIN': return Math.min(...values)
          case 'MAX': return Math.max(...values)
          case 'COUNT': return values.length
        }
      }
      allCells.forEach(c => {
        formula = formula.replace(new RegExp(`\\b${c.id}\\b`, 'g'), c.calculatedValue.toString())
      })
      const result = Function(`"use strict"; return (${formula})`)()
      return typeof result === 'number' && !isNaN(result) ? result : 0
    } catch { return 0 }
  }

  useEffect(() => {
    let changed = true, iterations = 0
    while (changed && iterations < 10) {
      changed = false; iterations++
      setCells(prev => prev.map(cell => {
        const newVal = calculateCell(cell, prev)
        if (newVal !== cell.calculatedValue) { changed = true; return { ...cell, calculatedValue: newVal } }
        return cell
      }))
    }
  }, [cells, connections])

  const formatValue = (value: number, format: string): string => {
    switch (format) {
      case 'currency': return 'Gs. ' + value.toLocaleString('es-PY', { maximumFractionDigits: 0 })
      case 'percentage': return value.toFixed(2) + '%'
      case 'number': return value.toLocaleString('es-PY', { maximumFractionDigits: 2 })
      default: return value.toString()
    }
  }

  const addCell = (cellType: string) => {
    const type = CELL_TYPES.find(t => t.id === cellType)
    if (!type) return
    setCells(prev => [...prev, {
      id: genId(), x: 200 + Math.random() * 200, y: 150 + Math.random() * 200,
      width: 180, height: 100, label: type.name, value: 0, formula: '',
      format: 'number', category: type.name, inputs: [], calculatedValue: 0
    }])
  }

  const deleteSelected = () => {
    if (!selected) return
    setCells(prev => prev.filter(c => c.id !== selected))
    setConnections(prev => prev.filter(c => c.from !== selected && c.to !== selected))
    setSelected(null)
  }

  const handleMouseDown = (e: React.MouseEvent, cellId?: string, port?: string) => {
    if (e.button === 1 || (e.button === 0 && e.altKey)) {
      setIsPanning(true); setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y }); e.preventDefault(); return
    }
    if (port && cellId) { setConnecting({ cellId, port }); return }
    if (cellId && e.button === 0) {
      const cell = cells.find(c => c.id === cellId)
      if (cell) {
        setSelected(cellId); setSelectedConnection(null); setDragging(cellId)
        const rect = viewportRef.current?.getBoundingClientRect()
        if (rect) setDragOffset({ x: (e.clientX - rect.left - pan.x) / (zoom / 100) - cell.x, y: (e.clientY - rect.top - pan.y) / (zoom / 100) - cell.y })
      }
    }
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning) { setPan({ x: e.clientX - panStart.x, y: e.clientY - panStart.y }); return }
    if (dragging) {
      const rect = viewportRef.current?.getBoundingClientRect()
      if (rect) {
        let newX = Math.round(((e.clientX - rect.left - pan.x) / (zoom / 100) - dragOffset.x) / 10) * 10
        let newY = Math.round(((e.clientY - rect.top - pan.y) / (zoom / 100) - dragOffset.y) / 10) * 10
        setCells(prev => prev.map(c => c.id === dragging ? { ...c, x: newX, y: newY } : c))
      }
    }
    if (connecting) {
      const rect = viewportRef.current?.getBoundingClientRect()
      if (rect) setMousePos({ x: (e.clientX - rect.left - pan.x) / (zoom / 100), y: (e.clientY - rect.top - pan.y) / (zoom / 100) })
    }
  }

  const handleMouseUp = (e: React.MouseEvent) => {
    if (isPanning) { setIsPanning(false); return }
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
    if (e.target === e.currentTarget || (e.target as HTMLElement).id === 'world') { setSelected(null); setSelectedConnection(null) }
  }

  const updateCell = (cellId: string, updates: Partial<CellNode>) => {
    setCells(prev => prev.map(c => c.id === cellId ? { ...c, ...updates } : c))
  }

  const selectedCell = cells.find(c => c.id === selected)

  return (
    <div style={{ flex: 1, display: 'flex', overflow: 'hidden', background: '#0b0c0d', color: '#c9ccd0', fontFamily: "'JetBrains Mono', monospace", fontSize: '12px' }}>
      {/* LEFT TOOLBOX */}
      <aside style={{ width: 220, background: '#131416', borderRight: '1px solid #2e3134', overflowY: 'auto', padding: '12px', flexShrink: 0 }}>
        <h4 style={{ color: '#a3a3a3', fontSize: 11, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>Tipos de Celdas</h4>
        {CELL_TYPES.map(ct => (
          <button key={ct.id} onClick={() => addCell(ct.id)} style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '8px 10px', background: '#1a1a1a', border: '1px solid #333', borderRadius: 4, color: '#ccc', cursor: 'pointer', fontSize: 11, marginBottom: 4, textAlign: 'left' }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: '#fff', fontFamily: 'monospace', width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#2a2a2a', borderRadius: 3, border: '1px solid #444' }}>{ct.icon}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: '#e5e5e5' }}>{ct.name}</div>
              <div style={{ fontSize: 9, color: '#666' }}>{ct.desc}</div>
            </div>
          </button>
        ))}
        <div style={{ marginTop: 16, padding: 10, background: '#1a1a1a', borderRadius: 4, fontSize: 9, color: '#666', lineHeight: 1.8 }}>
          <b style={{ color: '#a3a3a3' }}>Controles:</b><br />
          • <b>clic</b> = seleccionar<br />
          • <b>drag</b> = mover<br />
          • <b>drag puerto</b> = conectar<br />
          • <b>2x clic</b> = editar<br />
          • <b>del</b> = eliminar<br />
          • <b>rueda</b> = zoom<br />
          • <b>alt+drag</b> = pan
        </div>
      </aside>

      {/* VIEWPORT */}
      <div ref={viewportRef} onMouseDown={e => handleMouseDown(e)} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onClick={handleViewportClick} onWheel={e => { e.preventDefault(); setZoom(z => Math.max(20, Math.min(300, z - e.deltaY * 0.1))) }} onKeyDown={e => { if (e.key === 'Delete' || e.key === 'Backspace') deleteSelected() }} tabIndex={0} style={{ flex: 1, position: 'relative', overflow: 'hidden', background: '#0b0c0d', cursor: isPanning ? 'grabbing' : 'default' }}>
        <div id="world" style={{ position: 'absolute', width: 8000, height: 5000, transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom / 100})`, transformOrigin: '0 0', backgroundImage: 'radial-gradient(circle, #2e3134 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
          {/* SVG */}
          <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
            <defs>
              <marker id="arrow" markerUnits="userSpaceOnUse" markerWidth="10" markerHeight="10" refX="8.5" refY="4.5" orient="auto"><path d="M0,0 L9,4.5 L0,9 Z" fill="#666" /></marker>
              <marker id="arrow-hl" markerUnits="userSpaceOnUse" markerWidth="12" markerHeight="12" refX="9.5" refY="5.5" orient="auto"><path d="M0,0 L11,5.5 L0,11 Z" fill="#fff" /></marker>
            </defs>
            {connections.map(conn => {
              const fromCell = cells.find(c => c.id === conn.from)
              const toCell = cells.find(c => c.id === conn.to)
              if (!fromCell || !toCell) return null
              const x1 = fromCell.x + fromCell.width, y1 = fromCell.y + fromCell.height / 2
              const x2 = toCell.x, y2 = toCell.y + toCell.height / 2
              const isHL = connectedPath?.connections.includes(conn.id) || false
              const sc = isHL ? '#fff' : (conn.color || '#555')
              const sw = isHL ? 3 : 2
              const op = selected && highlightConnections && !isHL ? 0.15 : 1
              return (
                <g key={conn.id}>
                  <path d={`M${x1},${y1} C${x1+50},${y1} ${x2-50},${y2} ${x2},${y2}`} stroke="transparent" strokeWidth="20" fill="none" style={{ cursor: 'pointer', pointerEvents: 'stroke' }} onClick={e => { e.stopPropagation(); setSelectedConnection(conn.id); setSelected(null) }} />
                  <path d={`M${x1},${y1} C${x1+50},${y1} ${x2-50},${y2} ${x2},${y2}`} stroke={sc} strokeWidth={sw} fill="none" opacity={op} markerEnd={isHL ? "url(#arrow-hl)" : "url(#arrow)"} style={{ transition: 'all 0.3s', pointerEvents: 'none' }} />
                </g>
              )
            })}
            {connecting && <path d={`M${(cells.find(c => c.id === connecting.cellId)?.x || 0) + (cells.find(c => c.id === connecting.cellId)?.width || 0)},${(cells.find(c => c.id === connecting.cellId)?.y || 0) + (cells.find(c => c.id === connecting.cellId)?.height || 0) / 2} L${mousePos.x},${mousePos.y}`} stroke="#a3a3a3" strokeWidth="2" strokeDasharray="5,5" fill="none" />}
          </svg>

          {/* Cells */}
          {cells.map(cell => {
            const isSel = selected === cell.id
            const ct = CELL_TYPES.find(t => t.name === cell.category)
            const inPath = connectedPath?.nodes.includes(cell.id) || false
            let bc = '#404040'
            if (isSel) bc = '#fff'
            else if (inPath) bc = '#fff'
            else if (cell.color) bc = cell.color
            let op = 1
            if (selected && highlightConnections && !inPath) op = 0.2

            return (
              <div key={cell.id} data-cell-id={cell.id} onMouseDown={e => { e.stopPropagation(); handleMouseDown(e, cell.id) }} onDoubleClick={() => setEditingCell(cell)} style={{ position: 'absolute', left: cell.x, top: cell.y, width: cell.width, height: cell.height, background: '#1a1a1a', border: `3px solid ${bc}`, borderRadius: 8, cursor: 'grab', userSelect: 'none', boxShadow: isSel ? '0 0 25px rgba(255,255,255,0.25)' : '0 4px 12px rgba(0,0,0,0.5)', transition: dragging === cell.id ? 'none' : 'all 0.3s', display: 'flex', flexDirection: 'column', opacity: op }}>
                <div style={{ padding: '6px 10px', background: '#222', borderBottom: '2px solid #333', display: 'flex', alignItems: 'center', gap: 6, borderRadius: '5px 5px 0 0' }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#fff', fontFamily: 'monospace', width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#333', borderRadius: 3 }}>{ct?.icon || '?'}</span>
                  <div style={{ flex: 1, fontSize: 10, fontWeight: 600, color: '#e5e5e5', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{cell.label}</div>
                </div>
                <div style={{ padding: '6px 10px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  {cell.formula && <div style={{ fontSize: 8, color: '#666', marginBottom: 2, fontFamily: 'monospace' }}>= {cell.formula.substring(0, 30)}</div>}
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>{formatValue(cell.calculatedValue, cell.format)}</div>
                </div>
                <div data-cell-id={cell.id} data-port="input1" onMouseDown={e => { e.stopPropagation(); handleMouseDown(e, cell.id, 'input1') }} style={{ position: 'absolute', left: -7, top: '50%', transform: 'translateY(-50%)', width: 14, height: 14, borderRadius: '50%', background: '#444', border: '2px solid #0b0c0d', cursor: 'crosshair' }} />
                <div data-cell-id={cell.id} data-port="output" onMouseDown={e => { e.stopPropagation(); handleMouseDown(e, cell.id, 'output') }} style={{ position: 'absolute', right: -7, top: '50%', transform: 'translateY(-50%)', width: 14, height: 14, borderRadius: '50%', background: '#666', border: '2px solid #0b0c0d', cursor: 'crosshair' }} />
              </div>
            )
          })}
        </div>

        {/* Controles */}
        <div style={{ position: 'absolute', bottom: 10, right: 10, display: 'flex', gap: 4, alignItems: 'center', background: '#131416', border: '1px solid #333', borderRadius: 6, padding: '6px 10px' }}>
          <button onClick={() => setHighlightConnections(!highlightConnections)} style={{ background: highlightConnections ? '#404040' : '#1a1a1a', border: '1px solid #333', color: highlightConnections ? '#fff' : '#ccc', padding: '6px 12px', borderRadius: 4, cursor: 'pointer', fontSize: 11, fontWeight: 600, marginRight: 8 }} title="Resaltar recorrido">
            🔗 {highlightConnections ? 'ON' : 'OFF'}
          </button>
          <button onClick={() => setZoom(z => Math.max(20, z - 10))} style={{ background: '#1a1a1a', border: '1px solid #333', color: '#ccc', width: 28, height: 28, borderRadius: 4, cursor: 'pointer', fontSize: 14 }}>-</button>
          <span style={{ fontSize: 12, minWidth: 50, textAlign: 'center', fontWeight: 600 }}>{Math.round(zoom)}%</span>
          <button onClick={() => setZoom(z => Math.min(300, z + 10))} style={{ background: '#1a1a1a', border: '1px solid #333', color: '#ccc', width: 28, height: 28, borderRadius: 4, cursor: 'pointer', fontSize: 14 }}>+</button>
          <button onClick={() => { setZoom(70); setPan({ x: 0, y: 0 }) }} style={{ background: '#1a1a1a', border: '1px solid #333', color: '#ccc', padding: '6px 12px', borderRadius: 4, cursor: 'pointer', fontSize: 11, fontWeight: 600 }}>RESET</button>
        </div>
      </div>

      {/* RIGHT PANEL */}
      {selectedConnection && !selectedCell && (() => {
        const conn = connections.find(c => c.id === selectedConnection)
        if (!conn) return null
        const fromCell = cells.find(c => c.id === conn.from)
        const toCell = cells.find(c => c.id === conn.to)
        return (
          <aside style={{ width: 280, background: '#131416', borderLeft: '1px solid #2e3134', padding: 16, overflowY: 'auto', flexShrink: 0 }}>
            <h3 style={{ color: '#a3a3a3', fontSize: 11, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 16 }}>Conexión</h3>
            <div style={{ marginBottom: 12 }}><label style={{ fontSize: 10, color: '#666' }}>Desde</label><div style={{ background: '#1a1a1a', padding: '6px 10px', borderRadius: 4, fontSize: 11 }}>{fromCell?.label}</div></div>
            <div style={{ marginBottom: 12 }}><label style={{ fontSize: 10, color: '#666' }}>Hacia</label><div style={{ background: '#1a1a1a', padding: '6px 10px', borderRadius: 4, fontSize: 11 }}>{toCell?.label}</div></div>
            <div style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 10, color: '#666', marginBottom: 4, display: 'block' }}>Color</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 4 }}>
                {NODE_COLORS.map((color, i) => (
                  <button key={i} onClick={() => setConnections(prev => prev.map(c => c.id === conn.id ? { ...c, color } : c))} style={{ width: '100%', aspectRatio: '1', background: color, border: conn.color === color ? '2px solid #fff' : '1px solid #333', borderRadius: 3, cursor: 'pointer' }} />
                ))}
              </div>
            </div>
            <button onClick={() => { setConnections(prev => prev.filter(c => c.id !== conn.id)); setSelectedConnection(null) }} style={{ width: '100%', padding: '8px', background: '#333', border: 'none', borderRadius: 4, color: '#ccc', cursor: 'pointer', fontSize: 11 }}>Eliminar</button>
          </aside>
        )
      })()}

      {selectedCell && (
        <aside style={{ width: 280, background: '#131416', borderLeft: '1px solid #2e3134', padding: 16, overflowY: 'auto', flexShrink: 0 }}>
          <h3 style={{ color: '#a3a3a3', fontSize: 11, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 16 }}>Propiedades</h3>
          <div style={{ marginBottom: 12 }}><label style={{ fontSize: 10, color: '#666' }}>Etiqueta</label><input value={selectedCell.label} onChange={e => updateCell(selectedCell.id, { label: e.target.value })} style={{ width: '100%', background: '#0b0c0d', border: '1px solid #333', color: '#ccc', padding: '6px 10px', borderRadius: 4, fontSize: 11 }} /></div>
          <div style={{ marginBottom: 12 }}><label style={{ fontSize: 10, color: '#666' }}>Valor</label><input type="number" value={selectedCell.value as number} onChange={e => updateCell(selectedCell.id, { value: parseFloat(e.target.value) || 0 })} style={{ width: '100%', background: '#0b0c0d', border: '1px solid #333', color: '#ccc', padding: '6px 10px', borderRadius: 4, fontSize: 11 }} /></div>
          <div style={{ marginBottom: 12 }}><label style={{ fontSize: 10, color: '#666' }}>Fórmula</label><input value={selectedCell.formula} onChange={e => updateCell(selectedCell.id, { formula: e.target.value })} placeholder="cell_1 + cell_2" style={{ width: '100%', background: '#0b0c0d', border: '1px solid #333', color: '#ccc', padding: '6px 10px', borderRadius: 4, fontSize: 11, fontFamily: 'monospace' }} /></div>
          <div style={{ marginBottom: 12, padding: 10, background: '#1a1a1a', borderRadius: 4 }}>
            <div style={{ fontSize: 9, color: '#666' }}>Calculado</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#fff' }}>{formatValue(selectedCell.calculatedValue, selectedCell.format)}</div>
          </div>
          <div style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 10, color: '#666', marginBottom: 4, display: 'block' }}>Color</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 4 }}>
              {NODE_COLORS.map((color, i) => (
                <button key={i} onClick={() => updateCell(selectedCell.id, { color })} style={{ width: '100%', aspectRatio: '1', background: color, border: selectedCell.color === color ? '2px solid #fff' : '1px solid #333', borderRadius: 3, cursor: 'pointer' }} />
              ))}
            </div>
          </div>
          {highlightConnections && connectedPath && (
            <div style={{ marginBottom: 12, padding: 10, background: '#1a1a1a', borderRadius: 4, border: '1px solid #333' }}>
              <div style={{ fontSize: 9, color: '#666', marginBottom: 6 }}>RECORRIDO</div>
              <div style={{ fontSize: 10, color: '#ccc', marginBottom: 4 }}>🔗 {connectedPath.connections.length} conexiones</div>
              <div style={{ fontSize: 10, color: '#ccc', marginBottom: 6 }}>📦 {connectedPath.nodes.length} nodos</div>
              <div style={{ fontSize: 8, color: '#888', lineHeight: 1.6, maxHeight: 150, overflow: 'auto' }}>
                {connectedPath.nodes.map((nid: string, i: number) => {
                  const n = cells.find(c => c.id === nid)
                  return <div key={i} style={{ display: 'flex', gap: 4, alignItems: 'center' }}><span style={{ color: nid === selectedCell.id ? '#fff' : '#666' }}>{i === 0 ? '→' : '↳'}</span><span style={{ color: nid === selectedCell.id ? '#fff' : '#aaa' }}>{n?.label || nid}</span></div>
                })}
              </div>
            </div>
          )}
          <button onClick={() => setEditingCell(selectedCell)} style={{ width: '100%', padding: '8px', background: '#404040', border: 'none', borderRadius: 4, color: '#fff', cursor: 'pointer', fontSize: 11, fontWeight: 600, marginBottom: 6 }}>Editar</button>
          <button onClick={deleteSelected} style={{ width: '100%', padding: '8px', background: '#333', border: 'none', borderRadius: 4, color: '#ccc', cursor: 'pointer', fontSize: 11 }}>Eliminar</button>
        </aside>
      )}

      {/* Tooltip */}
      {tooltip.visible && (
        <div style={{ position: 'fixed', left: tooltip.x, top: tooltip.y, background: '#1a1a1a', border: `2px solid ${tooltip.type === 'warning' ? '#f59e0b' : '#666'}`, borderRadius: 6, padding: '10px 14px', maxWidth: 280, zIndex: 10000, pointerEvents: 'none', boxShadow: '0 8px 24px rgba(0,0,0,0.8)', fontSize: 11, lineHeight: 1.6 }}>
          {tooltip.type === 'warning' && <div style={{ color: '#f59e0b', fontWeight: 700, marginBottom: 4 }}>⚠ ADVERTENCIA</div>}
          <div style={{ color: '#e5e5e5', whiteSpace: 'pre-line' }}>{tooltip.content}</div>
        </div>
      )}

      {/* Edit Modal */}
      {editingCell && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={() => setEditingCell(null)}>
          <div style={{ background: '#131416', border: '2px solid #333', borderRadius: 8, padding: 24, width: 450 }} onClick={e => e.stopPropagation()}>
            <h3 style={{ margin: '0 0 20px', color: '#a3a3a3', fontSize: 14 }}>Editar Celda</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div><label style={{ fontSize: 10, color: '#666' }}>Etiqueta</label><input value={editingCell.label} onChange={e => setEditingCell({ ...editingCell, label: e.target.value })} style={{ width: '100%', background: '#0b0c0d', border: '1px solid #333', color: '#ccc', padding: '8px 10px', borderRadius: 4, fontSize: 12 }} /></div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <div><label style={{ fontSize: 10, color: '#666' }}>Valor</label><input type="number" value={editingCell.value as number} onChange={e => setEditingCell({ ...editingCell, value: parseFloat(e.target.value) || 0 })} style={{ width: '100%', background: '#0b0c0d', border: '1px solid #333', color: '#ccc', padding: '8px 10px', borderRadius: 4, fontSize: 12 }} /></div>
                <div><label style={{ fontSize: 10, color: '#666' }}>Formato</label><select value={editingCell.format} onChange={e => setEditingCell({ ...editingCell, format: e.target.value as any })} style={{ width: '100%', background: '#0b0c0d', border: '1px solid #333', color: '#ccc', padding: '8px 10px', borderRadius: 4, fontSize: 12 }}><option value="number">Número</option><option value="currency">Moneda</option><option value="percentage">%</option><option value="text">Texto</option></select></div>
              </div>
              <div><label style={{ fontSize: 10, color: '#666' }}>Fórmula</label><input value={editingCell.formula} onChange={e => setEditingCell({ ...editingCell, formula: e.target.value })} style={{ width: '100%', background: '#0b0c0d', border: '1px solid #333', color: '#ccc', padding: '8px 10px', borderRadius: 4, fontSize: 11, fontFamily: 'monospace' }} /></div>
              <div style={{ padding: 12, background: '#1a1a1a', borderRadius: 4 }}><div style={{ fontSize: 10, color: '#666' }}>Calculado</div><div style={{ fontSize: 20, fontWeight: 700, color: '#fff' }}>{formatValue(editingCell.calculatedValue, editingCell.format)}</div></div>
              <div style={{ display: 'flex', gap: 8 }}><button onClick={() => { updateCell(editingCell.id, editingCell); setEditingCell(null) }} style={{ flex: 1, padding: '10px', background: '#404040', border: 'none', borderRadius: 4, color: '#fff', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>Guardar</button><button onClick={() => setEditingCell(null)} style={{ flex: 1, padding: '10px', background: '#333', border: 'none', borderRadius: 4, color: '#ccc', cursor: 'pointer', fontSize: 12 }}>Cancelar</button></div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
