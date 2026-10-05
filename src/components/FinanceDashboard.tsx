import { useState, useEffect } from 'react'

interface Transaction {
  id: string
  type: 'income' | 'expense' | 'payment'
  amount: number
  category: string
  description: string
  date: string
  status: 'pending' | 'completed'
}

const DEFAULT_CATEGORIES = {
  income: ['Salario', 'Freelance', 'Inversiones', 'Ventas', 'Bonos', 'Otros ingresos'],
  expense: ['Alimentación', 'Transporte', 'Vivienda', 'Servicios', 'Entretenimiento', 'Salud', 'Educación', 'Ropa', 'Tecnología', 'Suscripciones', 'Otros gastos'],
  payment: ['Préstamos', 'Tarjetas', 'Seguros', 'Impuestos', 'Otros pagos']
}

export default function FinanceDashboard() {
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('flowlab_finance_v2')
    return saved ? JSON.parse(saved) : []
  })
  
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [filterMonth, setFilterMonth] = useState(() => {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  })
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense' | 'payment'>('all')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  
  const [formData, setFormData] = useState({
    type: 'expense' as 'income' | 'expense' | 'payment',
    amount: '',
    category: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    status: 'completed' as 'pending' | 'completed'
  })

  useEffect(() => {
    localStorage.setItem('flowlab_finance_v2', JSON.stringify(transactions))
  }, [transactions])

  const filteredTransactions = transactions.filter(t => {
    const matchesMonth = t.date.startsWith(filterMonth)
    const matchesType = filterType === 'all' || t.type === filterType
    const matchesCategory = selectedCategory === 'all' || t.category === selectedCategory
    return matchesMonth && matchesType && matchesCategory
  }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  const totalIncome = filteredTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0)
  const totalExpense = filteredTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0)
  const totalPayment = filteredTransactions.filter(t => t.type === 'payment').reduce((sum, t) => sum + t.amount, 0)
  const balance = totalIncome - totalExpense - totalPayment

  const categoryTotals = filteredTransactions.reduce((acc, t) => {
    if (t.type === 'expense' || t.type === 'payment') {
      acc[t.category] = (acc[t.category] || 0) + t.amount
    }
    return acc
  }, {} as Record<string, number>)

  const topCategories = Object.entries(categoryTotals)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 8)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.amount || !formData.category) return

    if (editingId) {
      setTransactions(prev => prev.map(t => 
        t.id === editingId ? { ...t, ...formData, amount: parseFloat(formData.amount) } : t
      ))
      setEditingId(null)
    } else {
      const newTransaction: Transaction = {
        id: Date.now().toString(),
        type: formData.type,
        amount: parseFloat(formData.amount),
        category: formData.category,
        description: formData.description,
        date: formData.date,
        status: formData.status
      }
      setTransactions(prev => [...prev, newTransaction])
    }

    setFormData({
      type: 'expense',
      amount: '',
      category: '',
      description: '',
      date: new Date().toISOString().split('T')[0],
      status: 'completed'
    })
    setShowForm(false)
  }

  const handleEdit = (transaction: Transaction) => {
    setFormData({
      type: transaction.type,
      amount: transaction.amount.toString(),
      category: transaction.category,
      description: transaction.description,
      date: transaction.date,
      status: transaction.status
    })
    setEditingId(transaction.id)
    setShowForm(true)
  }

  const handleDelete = (id: string) => {
    if (confirm('¿Eliminar esta transacción?')) {
      setTransactions(prev => prev.filter(t => t.id !== id))
    }
  }

  const exportCSV = () => {
    const headers = ['Fecha', 'Tipo', 'Categoría', 'Descripción', 'Monto', 'Estado']
    const rows = filteredTransactions.map(t => [
      t.date,
      t.type === 'income' ? 'Ingreso' : t.type === 'expense' ? 'Gasto' : 'Pago',
      t.category,
      t.description,
      t.amount.toFixed(2),
      t.status === 'completed' ? 'Completado' : 'Pendiente'
    ])
    const csv = [headers, ...rows].map(row => row.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `finanzas_${filterMonth}.csv`
    a.click()
  }

  const maxCategoryAmount = Math.max(...Object.values(categoryTotals), 1)

  // Datos para gráfico de barras mensual
  const monthlyData = transactions.reduce((acc, t) => {
    const month = t.date.substring(0, 7)
    if (!acc[month]) {
      acc[month] = { income: 0, expense: 0, payment: 0 }
    }
    acc[month][t.type] += t.amount
    return acc
  }, {} as Record<string, { income: number; expense: number; payment: number }>)

  const last6Months = Object.entries(monthlyData)
    .sort(([a], [b]) => b.localeCompare(a))
    .slice(0, 6)
    .reverse()

  const maxMonthlyAmount = Math.max(
    ...Object.values(monthlyData).flatMap(m => [m.income, m.expense, m.payment]),
    1
  )

  return (
    <div style={{
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      background: '#0b0c0d',
      color: '#c9ccd0',
      fontFamily: "'JetBrains Mono', ui-monospace, monospace",
      fontSize: '12px',
      minHeight: 0
    }}>
      {/* HEADER */}
      <header style={{
        background: '#131416',
        borderBottom: '1px solid #2e3134',
        padding: '12px 20px',
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        zIndex: 100,
        flexShrink: 0
      }}>
        <div style={{ display: 'flex', gap: '3px' }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#ef4444' }}></span>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#f59e0b' }}></span>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981' }}></span>
        </div>
        <div style={{ fontWeight: 700, color: '#10b981', fontSize: 16 }}>
          💰 Finanzas <span style={{ color: '#5c6166', fontSize: 12 }}>--control_gastos</span>
        </div>
        <div style={{ flex: 1 }}></div>
        <button onClick={exportCSV} style={{
          background: '#1a1c1e',
          border: '1px solid #2e3134',
          color: '#c9ccd0',
          padding: '6px 12px',
          borderRadius: 4,
          cursor: 'pointer',
          fontFamily: 'inherit',
          fontSize: 11
        }}>
          📥 Exportar CSV
        </button>
      </header>

      {/* MAIN CONTENT */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden', minHeight: 0 }}>
        {/* LEFT SIDEBAR - Categories */}
        <aside style={{
          width: 220,
          background: '#131416',
          borderRight: '1px solid #2e3134',
          overflowY: 'auto',
          padding: '16px',
          flexShrink: 0,
          minHeight: 0
        }}>
          <h3 style={{ color: '#10b981', fontSize: 11, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>
            Categorías
          </h3>
          
          <button
            onClick={() => setSelectedCategory('all')}
            style={{
              width: '100%',
              padding: '8px 12px',
              background: selectedCategory === 'all' ? '#10b981' : '#1a1c1e',
              border: '1px solid #2e3134',
              borderRadius: 4,
              color: selectedCategory === 'all' ? '#fff' : '#c9ccd0',
              cursor: 'pointer',
              fontFamily: 'inherit',
              fontSize: 11,
              marginBottom: 4,
              textAlign: 'left'
            }}
          >
            Todas
          </button>

          {Object.entries(DEFAULT_CATEGORIES).map(([type, categories]) => (
            <div key={type} style={{ marginTop: 16 }}>
              <h4 style={{ color: '#5c6166', fontSize: 10, textTransform: 'uppercase', marginBottom: 8 }}>
                {type === 'income' ? 'Ingresos' : type === 'expense' ? 'Gastos' : 'Pagos'}
              </h4>
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  style={{
                    width: '100%',
                    padding: '6px 12px',
                    background: selectedCategory === cat ? '#10b981' : 'transparent',
                    border: 'none',
                    borderRadius: 3,
                    color: selectedCategory === cat ? '#fff' : '#8b9095',
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    fontSize: 10,
                    marginBottom: 2,
                    textAlign: 'left'
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>
          ))}
        </aside>

        {/* MAIN AREA */}
        <div style={{ flex: 1, overflow: 'auto', padding: 20 }}>
          {/* Summary Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
            <div style={{ background: '#1a1c1e', padding: 20, borderRadius: 6, border: '1px solid #2e3134' }}>
              <div style={{ fontSize: 10, color: '#5c6166', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>Ingresos</div>
              <div style={{ fontSize: 28, fontWeight: 700, color: '#10b981' }}>${totalIncome.toFixed(2)}</div>
              <div style={{ fontSize: 10, color: '#5c6166', marginTop: 4 }}>
                {filteredTransactions.filter(t => t.type === 'income').length} transacciones
              </div>
            </div>
            <div style={{ background: '#1a1c1e', padding: 20, borderRadius: 6, border: '1px solid #2e3134' }}>
              <div style={{ fontSize: 10, color: '#5c6166', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>Gastos</div>
              <div style={{ fontSize: 28, fontWeight: 700, color: '#ef4444' }}>${totalExpense.toFixed(2)}</div>
              <div style={{ fontSize: 10, color: '#5c6166', marginTop: 4 }}>
                {filteredTransactions.filter(t => t.type === 'expense').length} transacciones
              </div>
            </div>
            <div style={{ background: '#1a1c1e', padding: 20, borderRadius: 6, border: '1px solid #2e3134' }}>
              <div style={{ fontSize: 10, color: '#5c6166', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>Pagos</div>
              <div style={{ fontSize: 28, fontWeight: 700, color: '#f59e0b' }}>${totalPayment.toFixed(2)}</div>
              <div style={{ fontSize: 10, color: '#5c6166', marginTop: 4 }}>
                {filteredTransactions.filter(t => t.type === 'payment').length} transacciones
              </div>
            </div>
            <div style={{ background: '#1a1c1e', padding: 20, borderRadius: 6, border: '1px solid #2e3134' }}>
              <div style={{ fontSize: 10, color: '#5c6166', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>Balance</div>
              <div style={{ fontSize: 28, fontWeight: 700, color: balance >= 0 ? '#10b981' : '#ef4444' }}>
                ${balance.toFixed(2)}
              </div>
              <div style={{ fontSize: 10, color: '#5c6166', marginTop: 4 }}>
                {balance >= 0 ? 'Positivo' : 'Negativo'}
              </div>
            </div>
          </div>

          {/* Charts Section */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
            {/* Monthly Bar Chart */}
            <div style={{ background: '#1a1c1e', padding: 20, borderRadius: 6, border: '1px solid #2e3134' }}>
              <h3 style={{ margin: '0 0 16px', fontSize: 13, color: '#10b981' }}>Últimos 6 Meses</h3>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12, height: 180 }}>
                {last6Months.map(([month, data]) => (
                  <div key={month} style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <div style={{ display: 'flex', gap: 2, alignItems: 'flex-end', height: 150 }}>
                      <div style={{
                        flex: 1,
                        height: `${(data.income / maxMonthlyAmount) * 100}%`,
                        background: '#10b981',
                        borderRadius: '3px 3px 0 0',
                        minHeight: data.income > 0 ? 4 : 0
                      }} />
                      <div style={{
                        flex: 1,
                        height: `${(data.expense / maxMonthlyAmount) * 100}%`,
                        background: '#ef4444',
                        borderRadius: '3px 3px 0 0',
                        minHeight: data.expense > 0 ? 4 : 0
                      }} />
                      <div style={{
                        flex: 1,
                        height: `${(data.payment / maxMonthlyAmount) * 100}%`,
                        background: '#f59e0b',
                        borderRadius: '3px 3px 0 0',
                        minHeight: data.payment > 0 ? 4 : 0
                      }} />
                    </div>
                    <div style={{ fontSize: 9, color: '#5c6166', textAlign: 'center' }}>
                      {month.substring(5)}
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 16, marginTop: 12, fontSize: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <div style={{ width: 12, height: 12, background: '#10b981', borderRadius: 2 }}></div>
                  <span style={{ color: '#8b9095' }}>Ingresos</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <div style={{ width: 12, height: 12, background: '#ef4444', borderRadius: 2 }}></div>
                  <span style={{ color: '#8b9095' }}>Gastos</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <div style={{ width: 12, height: 12, background: '#f59e0b', borderRadius: 2 }}></div>
                  <span style={{ color: '#8b9095' }}>Pagos</span>
                </div>
              </div>
            </div>

            {/* Top Categories */}
            <div style={{ background: '#1a1c1e', padding: 20, borderRadius: 6, border: '1px solid #2e3134' }}>
              <h3 style={{ margin: '0 0 16px', fontSize: 13, color: '#10b981' }}>Top Categorías de Gasto</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {topCategories.map(([category, amount]) => (
                  <div key={category}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: 11 }}>
                      <span style={{ color: '#c9ccd0' }}>{category}</span>
                      <span style={{ color: '#ef4444', fontWeight: 600 }}>${amount.toFixed(2)}</span>
                    </div>
                    <div style={{ height: 8, background: '#0b0c0d', borderRadius: 4, overflow: 'hidden' }}>
                      <div style={{
                        height: '100%',
                        width: `${(amount / maxCategoryAmount) * 100}%`,
                        background: 'linear-gradient(90deg, #ef4444, #f59e0b)',
                        borderRadius: 4,
                        transition: 'width 0.3s'
                      }} />
                    </div>
                  </div>
                ))}
                {topCategories.length === 0 && (
                  <div style={{ color: '#5c6166', fontSize: 11, textAlign: 'center', padding: 20 }}>
                    Sin datos
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Filters and Actions */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
            <input
              type="month"
              value={filterMonth}
              onChange={e => setFilterMonth(e.target.value)}
              style={{
                background: '#1a1c1e',
                border: '1px solid #2e3134',
                color: '#c9ccd0',
                padding: '6px 10px',
                borderRadius: 4,
                fontFamily: 'inherit',
                fontSize: 11
              }}
            />
            <select
              value={filterType}
              onChange={e => setFilterType(e.target.value as any)}
              style={{
                background: '#1a1c1e',
                border: '1px solid #2e3134',
                color: '#c9ccd0',
                padding: '6px 10px',
                borderRadius: 4,
                fontFamily: 'inherit',
                fontSize: 11
              }}
            >
              <option value="all">Todos los tipos</option>
              <option value="income">Solo Ingresos</option>
              <option value="expense">Solo Gastos</option>
              <option value="payment">Solo Pagos</option>
            </select>
            <div style={{ flex: 1 }}></div>
            <button onClick={() => { setShowForm(true); setEditingId(null); setFormData({ type: 'expense', amount: '', category: '', description: '', date: new Date().toISOString().split('T')[0], status: 'completed' }) }} style={{
              background: '#10b981',
              border: 'none',
              color: '#fff',
              padding: '8px 20px',
              borderRadius: 4,
              cursor: 'pointer',
              fontFamily: 'inherit',
              fontSize: 11,
              fontWeight: 600
            }}>
              + Nueva Transacción
            </button>
          </div>

          {/* Form */}
          {showForm && (
            <div style={{
              background: '#1a1c1e',
              border: '1px solid #2e3134',
              borderRadius: 6,
              padding: 20,
              marginBottom: 16
            }}>
              <h3 style={{ margin: '0 0 16px', fontSize: 13, color: '#10b981' }}>
                {editingId ? 'Editar Transacción' : 'Nueva Transacción'}
              </h3>
              <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 10, color: '#5c6166', marginBottom: 4 }}>Tipo</label>
                  <select
                    value={formData.type}
                    onChange={e => setFormData({ ...formData, type: e.target.value as any, category: '' })}
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
                  >
                    <option value="expense">Gasto</option>
                    <option value="income">Ingreso</option>
                    <option value="payment">Pago</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 10, color: '#5c6166', marginBottom: 4 }}>Monto</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    onChange={e => setFormData({ ...formData, amount: e.target.value })}
                    placeholder="0.00"
                    required
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
                  <select
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                    required
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
                  >
                    <option value="">Seleccionar...</option>
                    {DEFAULT_CATEGORIES[formData.type].map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 10, color: '#5c6166', marginBottom: 4 }}>Fecha</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={e => setFormData({ ...formData, date: e.target.value })}
                    required
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
                  <label style={{ display: 'block', fontSize: 10, color: '#5c6166', marginBottom: 4 }}>Estado</label>
                  <select
                    value={formData.status}
                    onChange={e => setFormData({ ...formData, status: e.target.value as any })}
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
                  >
                    <option value="completed">Completado</option>
                    <option value="pending">Pendiente</option>
                  </select>
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', fontSize: 10, color: '#5c6166', marginBottom: 4 }}>Descripción</label>
                  <input
                    type="text"
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Descripción opcional..."
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
                <div style={{ gridColumn: '1 / -1', display: 'flex', gap: 8 }}>
                  <button type="submit" style={{
                    background: '#10b981',
                    border: 'none',
                    color: '#fff',
                    padding: '10px 24px',
                    borderRadius: 4,
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    fontSize: 11,
                    fontWeight: 600
                  }}>
                    {editingId ? 'Actualizar' : 'Guardar'}
                  </button>
                  <button type="button" onClick={() => { setShowForm(false); setEditingId(null) }} style={{
                    background: '#2e3134',
                    border: 'none',
                    color: '#c9ccd0',
                    padding: '10px 24px',
                    borderRadius: 4,
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    fontSize: 11
                  }}>
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Transactions Table */}
          <div style={{ background: '#1a1c1e', border: '1px solid #2e3134', borderRadius: 6, overflow: 'hidden' }}>
            {filteredTransactions.length === 0 ? (
              <div style={{ padding: 60, textAlign: 'center', color: '#5c6166' }}>
                No hay transacciones para este período
              </div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
                <thead>
                  <tr style={{ background: '#0b0c0d', borderBottom: '1px solid #2e3134' }}>
                    <th style={{ padding: '12px', textAlign: 'left', color: '#5c6166', fontWeight: 600 }}>Fecha</th>
                    <th style={{ padding: '12px', textAlign: 'left', color: '#5c6166', fontWeight: 600 }}>Tipo</th>
                    <th style={{ padding: '12px', textAlign: 'left', color: '#5c6166', fontWeight: 600 }}>Categoría</th>
                    <th style={{ padding: '12px', textAlign: 'left', color: '#5c6166', fontWeight: 600 }}>Descripción</th>
                    <th style={{ padding: '12px', textAlign: 'left', color: '#5c6166', fontWeight: 600 }}>Estado</th>
                    <th style={{ padding: '12px', textAlign: 'right', color: '#5c6166', fontWeight: 600 }}>Monto</th>
                    <th style={{ padding: '12px', textAlign: 'center', color: '#5c6166', fontWeight: 600 }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTransactions.map(t => (
                    <tr key={t.id} style={{ borderBottom: '1px solid #2e3134' }}>
                      <td style={{ padding: '12px', color: '#8b9095' }}>{t.date}</td>
                      <td style={{ padding: '12px' }}>
                        <span style={{
                          padding: '3px 10px',
                          borderRadius: 3,
                          fontSize: 10,
                          fontWeight: 600,
                          background: t.type === 'income' ? '#10b98122' : t.type === 'expense' ? '#ef444422' : '#f59e0b22',
                          color: t.type === 'income' ? '#10b981' : t.type === 'expense' ? '#ef4444' : '#f59e0b'
                        }}>
                          {t.type === 'income' ? 'Ingreso' : t.type === 'expense' ? 'Gasto' : 'Pago'}
                        </span>
                      </td>
                      <td style={{ padding: '12px', color: '#c9ccd0' }}>{t.category}</td>
                      <td style={{ padding: '12px', color: '#8b9095' }}>{t.description || '-'}</td>
                      <td style={{ padding: '12px' }}>
                        <span style={{
                          padding: '3px 10px',
                          borderRadius: 3,
                          fontSize: 10,
                          fontWeight: 600,
                          background: t.status === 'completed' ? '#10b98122' : '#f59e0b22',
                          color: t.status === 'completed' ? '#10b981' : '#f59e0b'
                        }}>
                          {t.status === 'completed' ? 'Completado' : 'Pendiente'}
                        </span>
                      </td>
                      <td style={{ padding: '12px', textAlign: 'right', fontWeight: 600, color: t.type === 'income' ? '#10b981' : '#ef4444' }}>
                        {t.type === 'income' ? '+' : '-'}${t.amount.toFixed(2)}
                      </td>
                      <td style={{ padding: '12px', textAlign: 'center' }}>
                        <button onClick={() => handleEdit(t)} style={{
                          background: 'none',
                          border: 'none',
                          color: '#5c6166',
                          cursor: 'pointer',
                          marginRight: 8,
                          fontSize: 14
                        }} title="Editar">✏️</button>
                        <button onClick={() => handleDelete(t.id)} style={{
                          background: 'none',
                          border: 'none',
                          color: '#5c6166',
                          cursor: 'pointer',
                          fontSize: 14
                        }} title="Eliminar">🗑️</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
