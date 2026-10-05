interface PieChartProps {
  data: { label: string; value: number; color: string }[]
  size?: number
}

export function PieChart({ data, size = 200 }: PieChartProps) {
  const total = data.reduce((sum, item) => sum + item.value, 0)
  if (total === 0) return null

  let currentAngle = 0
  const paths = data.map((item, index) => {
    const percentage = (item.value / total) * 100
    const angle = (item.value / total) * 360
    const startAngle = currentAngle
    const endAngle = currentAngle + angle
    currentAngle = endAngle

    const startRad = ((startAngle - 90) * Math.PI) / 180
    const endRad = ((endAngle - 90) * Math.PI) / 180

    const x1 = size / 2 + (size / 2 - 10) * Math.cos(startRad)
    const y1 = size / 2 + (size / 2 - 10) * Math.sin(startRad)
    const x2 = size / 2 + (size / 2 - 10) * Math.cos(endRad)
    const y2 = size / 2 + (size / 2 - 10) * Math.sin(endRad)

    const largeArcFlag = angle > 180 ? 1 : 0

    const d = `M ${size / 2} ${size / 2} L ${x1} ${y1} A ${size / 2 - 10} ${size / 2 - 10} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`

    return (
      <path
        key={index}
        d={d}
        fill={item.color}
        stroke="#0b0c0d"
        strokeWidth="2"
        style={{ transition: 'all 0.3s ease' }}
      />
    )
  })

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
      <svg width={size} height={size} style={{ transform: 'rotate(0deg)' }}>
        {paths}
        <circle cx={size / 2} cy={size / 2} r={size / 4} fill="#0b0c0d" />
        <text
          x={size / 2}
          y={size / 2 - 5}
          textAnchor="middle"
          fill="#c9ccd0"
          fontSize="14"
          fontWeight="700"
        >
          ${total.toFixed(0)}
        </text>
        <text
          x={size / 2}
          y={size / 2 + 12}
          textAnchor="middle"
          fill="#5c6166"
          fontSize="10"
        >
          Total
        </text>
      </svg>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 11 }}>
        {data.slice(0, 6).map((item, index) => (
          <div key={index} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 12, height: 12, borderRadius: 2, background: item.color }}></div>
            <span style={{ color: '#8b9095', flex: 1 }}>{item.label}</span>
            <span style={{ color: '#c9ccd0', fontWeight: 600 }}>
              {((item.value / total) * 100).toFixed(1)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

interface LineChartProps {
  data: { label: string; income: number; expense: number; payment: number }[]
  height?: number
}

export function LineChart({ data, height = 250 }: LineChartProps) {
  if (data.length === 0) return null

  const maxValue = Math.max(
    ...data.flatMap(d => [d.income, d.expense, d.payment]),
    1
  )

  const width = 600
  const padding = 40
  const chartWidth = width - padding * 2
  const chartHeight = height - padding * 2

  const getX = (index: number) => padding + (index / (data.length - 1)) * chartWidth
  const getY = (value: number) => padding + chartHeight - (value / maxValue) * chartHeight

  const createPath = (values: number[]) => {
    return values
      .map((value, index) => {
        const x = getX(index)
        const y = getY(value)
        return `${index === 0 ? 'M' : 'L'} ${x} ${y}`
      })
      .join(' ')
  }

  const incomePath = createPath(data.map(d => d.income))
  const expensePath = createPath(data.map(d => d.expense))
  const paymentPath = createPath(data.map(d => d.payment))

  return (
    <div>
      <svg width={width} height={height} style={{ overflow: 'visible' }}>
        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => (
          <g key={i}>
            <line
              x1={padding}
              y1={padding + chartHeight * (1 - ratio)}
              x2={width - padding}
              y2={padding + chartHeight * (1 - ratio)}
              stroke="#2e3134"
              strokeWidth="1"
              strokeDasharray="4,4"
            />
            <text
              x={padding - 8}
              y={padding + chartHeight * (1 - ratio) + 4}
              textAnchor="end"
              fill="#5c6166"
              fontSize="10"
            >
              ${(maxValue * ratio).toFixed(0)}
            </text>
          </g>
        ))}

        {/* Lines */}
        <path d={incomePath} fill="none" stroke="#10b981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        <path d={expensePath} fill="none" stroke="#ef4444" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        <path d={paymentPath} fill="none" stroke="#f59e0b" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />

        {/* Points */}
        {data.map((d, i) => (
          <g key={i}>
            <circle cx={getX(i)} cy={getY(d.income)} r="4" fill="#10b981" stroke="#0b0c0d" strokeWidth="2" />
            <circle cx={getX(i)} cy={getY(d.expense)} r="4" fill="#ef4444" stroke="#0b0c0d" strokeWidth="2" />
            <circle cx={getX(i)} cy={getY(d.payment)} r="4" fill="#f59e0b" stroke="#0b0c0d" strokeWidth="2" />
          </g>
        ))}

        {/* X-axis labels */}
        {data.map((d, i) => (
          <text
            key={i}
            x={getX(i)}
            y={height - 10}
            textAnchor="middle"
            fill="#5c6166"
            fontSize="10"
          >
            {d.label}
          </text>
        ))}
      </svg>
      <div style={{ display: 'flex', gap: 20, justifyContent: 'center', marginTop: 12, fontSize: 11 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 20, height: 3, background: '#10b981', borderRadius: 2 }}></div>
          <span style={{ color: '#8b9095' }}>Ingresos</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 20, height: 3, background: '#ef4444', borderRadius: 2 }}></div>
          <span style={{ color: '#8b9095' }}>Gastos</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 20, height: 3, background: '#f59e0b', borderRadius: 2 }}></div>
          <span style={{ color: '#8b9095' }}>Pagos</span>
        </div>
      </div>
    </div>
  )
}

interface MetricCardProps {
  title: string
  value: number
  previousValue?: number
  color: string
  icon: string
}

export function MetricCard({ title, value, previousValue, color, icon }: MetricCardProps) {
  const change = previousValue !== undefined ? value - previousValue : 0
  const changePercent = previousValue && previousValue > 0 ? (change / previousValue) * 100 : 0
  const isPositive = change >= 0

  return (
    <div style={{
      background: '#1a1c1e',
      padding: 20,
      borderRadius: 6,
      border: '1px solid #2e3134',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <div style={{ fontSize: 10, color: '#5c6166', textTransform: 'uppercase', letterSpacing: 1 }}>
          {title}
        </div>
        <div style={{ fontSize: 24 }}>{icon}</div>
      </div>
      <div style={{ fontSize: 32, fontWeight: 700, color, marginBottom: 8 }}>
        ${value.toFixed(2)}
      </div>
      {previousValue !== undefined && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          fontSize: 11,
          color: isPositive ? '#10b981' : '#ef4444'
        }}>
          <span style={{ fontSize: 14 }}>{isPositive ? '↑' : '↓'}</span>
          <span style={{ fontWeight: 600 }}>
            {isPositive ? '+' : ''}{changePercent.toFixed(1)}%
          </span>
          <span style={{ color: '#5c6166' }}>vs mes anterior</span>
        </div>
      )}
    </div>
  )
}

interface SparklineProps {
  data: number[]
  color: string
  width?: number
  height?: number
}

export function Sparkline({ data, color, width = 100, height = 30 }: SparklineProps) {
  if (data.length < 2) return null

  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min || 1

  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * width
    const y = height - ((value - min) / range) * height
    return `${x},${y}`
  }).join(' ')

  return (
    <svg width={width} height={height} style={{ overflow: 'visible' }}>
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
