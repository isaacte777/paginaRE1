import { useState, useEffect } from 'react'

interface Transaction {
  id: string
  type: 'income' | 'expense'
  amount: number
  category: string
  description: string
  date: string
}

interface FinanceManagerProps {
  onClose: () => void
}

const DEFAULT_CATEGORIES = {
  income: ['Salario', 'Freelance', 'Inversiones', 'Ventas', 'Otros ingresos'],
  expense: ['Alimentación', 'Transporte', 'Vivienda', 'Servicios', 'Entretenimiento', 'Salud', 'Educación', 'Ropa', 'Tecnología', 'Otros gastos']
}

export default function FinanceManager({ onClose }: FinanceManagerProps) {
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('flowlab_finance')
    return saved ? JSON.parse(saved) : []
  })
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [filterMonth, setFilterMonth] = useState(() => {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  })
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all')
  const [formData, setFormData] = useState({
    type: 'expense' as 'income' | 'expense',
    amount: '',
    category: '',
    description: '',
    date: new Date().toISOString().split('T')[0]
  })
  const [customCategories, setCustomCategories] = useState<{ income: string[]; expense: string[] }>(() => {
    const saved = localStorage.getItem('flowlab_categories')
    return saved ? JSON.parse(saved) : DEFAULT_CATEGORIES
  })

  useEffect(() => {
    localStorage.setItem('flowlab_finance', JSON.stringify(transactions))
  }, [transactions])

  useEffect(() => {
    localStorage.setItem('flowlab_categories', JSON.stringify(customCategories))
  }, [customCategories])

  const filteredTransactions = transactions.filter(t => {
    const matchesMonth = t.date.startsWith(filterMonth)
    const matchesType = filterType === 'all' || t.type === filterType
    return matchesMonth && matchesType
  }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  const totalIncome = filteredTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0)
  const totalExpense = filteredTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0)
  const balance = totalIncome - totalExpense

  const categoryTotals = filteredTransactions.reduce((acc, t) => {
    if (t.type === 'expense') {
      acc[t.category] = (acc[t.category] || 0) + t.amount
    }
    return acc
  }, {} as Record<string, number>)

  const topCategories = Object.entries(categoryTotals)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)

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
        date: formData.date
      }
      setTransactions(prev => [...prev, newTransaction])
    }

    setFormData({
      type: 'expense',
      amount: '',
      category: '',
      description: '',
      date: new Date().toISOString().split('T')[0]
    })
    setShowForm(false)
  }

  const handleEdit = (transaction: Transaction) => {
    setFormData({
      type: transaction.type,
      amount: transaction.amount.toString(),
      category: transaction.category,
      description: transaction.description,
      date: transaction.date
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
    const headers = ['Fecha', 'Tipo', 'Categoría', 'Descripción', 'Monto']
    const rows = filteredTransactions.map(t => [
      t.date,
      t.type === 'income' ? 'Ingreso' : 'Gasto',
      t.category,
      t.description,
      t.amount.toFixed(2)
    ])
    const csv = [headers, ...rows].map(row => row.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `finanzas_${filterMonth}.csv`
    a.click()
  }

  const addCustomCategory = (type: 'income' | 'expense') => {
    const name = prompt(`Nueva categoría de ${type === 'income' ? 'ingreso' : 'gasto'}:`)
    if (name && !customCategories[type].includes(name)) {
      setCustomCategories(prev => ({
        ...prev,
        [type]: [...prev[type], name]
      }))
    }
  }

  const maxCategoryAmount = Math.max(...Object.values(categoryTotals), 1)

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.85)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2000,
      padding: 20
    }}>
      <div style={{
        width: '100%',
        maxWidth: 1200,
        maxHeight: '90vh',
        background: '#131416',
        border: '1px solid #2e3134',
        borderRadius: 8,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid #2e3134',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: '#1a1c1e'
        }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 18, color: '#ec4899', fontWeight: 700 }}>💰 Control de Gastos</h2>
            <p style={{ margin: '4px 0 0', fontSize: 11, color: '#5c6166' }}>Gestión financiera personal</p>
          </div>
          <button onClick={onClose} style={{
            background: 'none',
            border: 'none',
            color: '#5c6166',
            fontSize: 20,
            cursor: 'pointer',
            padding: '4px 8px'
          }}>✕</button>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflow: 'auto', padding: 20 }}>
          {/* Summary Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, marginBottom: 20 }}>
            <div style={{ background: '#1a1c1e', padding: 16, borderRadius: 6, border: '1px solid #2e3134' }}>
              <div style={{ fontSize: 10, color: '#5c6166', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>Ingresos del mes</div>
              <div style={{ fontSize: 24, fontWeight: 700, color: '#10b981' }}>${totalIncome.toFixed(2)}</div>
            </div>
            <div style={{ background: '#1a1c1e', padding: 16, borderRadius: 6, border: '1px solid #2e3134' }}>
              <div style={{ fontSize: 10, color: '#5c6166', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>Gastos del mes</div>
              <div style={{ fontSize: 24, fontWeight: 700, color: '#ef4444' }}>${totalExpense.toFixed(2)}</div>
            </div>
            <div style={{ background: '#1a1c1e', padding: 16, borderRadius: 6, border: '1px solid #2e3134' }}>
              <div style={{ fontSize: 10, color: '#5c6166', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>Balance</div>
              <div style={{ fontSize: 24, fontWeight: 700, color: balance >= 0 ? '#10b981' : '#ef4444' }}>
                ${balance.toFixed(2)}
              </div>
            </div>
            <div style={{ background: '#1a1c1e', padding: 16, borderRadius: 6, border: '1px solid #2e3134' }}>
              <div style={{ fontSize: 10, color: '#5c6166', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>Transacciones</div>
              <div style={{ fontSize: 24, fontWeight: 700, color: '#ec4899' }}>{filteredTransactions.length}</div>
            </div>
          </div>

          {/* Top Categories Chart */}
          {topCategories.length > 0 && (
            <div style={{ background: '#1a1c1e', padding: 16, borderRadius: 6, border: '1px solid #2e3134', marginBottom: 20 }}>
              <h3 style={{ margin: '0 0 12px', fontSize: 13, color: '#ec4899' }}>Top 5 Categorías de Gasto</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {topCategories.map(([category, amount]) => (
                  <div key={category}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: 11 }}>
                      <span style={{ color: '#c9ccd0' }}>{category}</span>
                      <span style={{ color: '#ef4444', fontWeight: 600 }}>${amount.toFixed(2)}</span>
                    </div>
                    <div style={{ height: 6, background: '#0b0c0d', borderRadius: 3, overflow: 'hidden' }}>
                      <div style={{
                        height: '100%',
                        width: `${(amount / maxCategoryAmount) * 100}%`,
                        background: 'linear-gradient(90deg, #ef4444, #f59e0b)',
                        borderRadius: 3,
                        transition: 'width 0.3s'
                      }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

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
              <option value="all">Todos</option>
              <option value="income">Solo Ingresos</option>
              <option value="expense">Solo Gastos</option>
            </select>
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
            <div style={{ flex: 1 }} />
            <button onClick={() => { setShowForm(true); setEditingId(null); setFormData({ type: 'expense', amount: '', category: '', description: '', date: new Date().toISOString().split('T')[0] }) }} style={{
              background: '#ec4899',
              border: 'none',
              color: '#fff',
              padding: '6px 16px',
              borderRadius: 4,
              cursor: 'pointer',
              fontFamily: 'inherit',
              fontSize: 11,
              fontWeight: 600
            }}>
              + Nueva Transacción
            </button>
          </div>

          {/* Form Modal */}
          {showForm && (
            <div style={{
              background: '#1a1c1e',
              border: '1px solid #2e3134',
              borderRadius: 6,
              padding: 16,
              marginBottom: 16
            }}>
              <h3 style={{ margin: '0 0 12px', fontSize: 13, color: '#ec4899' }}>
                {editingId ? 'Editar Transacción' : 'Nueva Transacción'}
              </h3>
              <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12 }}>
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
                      padding: '6px 10px',
                      borderRadius: 4,
                      fontFamily: 'inherit',
                      fontSize: 11
                    }}
                  >
                    <option value="expense">Gasto</option>
                    <option value="income">Ingreso</option>
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
                      padding: '6px 10px',
                      borderRadius: 4,
                      fontFamily: 'inherit',
                      fontSize: 11
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 10, color: '#5c6166', marginBottom: 4 }}>Categoría</label>
                  <div style={{ display: 'flex', gap: 4 }}>
                    <select
                      value={formData.category}
                      onChange={e => setFormData({ ...formData, category: e.target.value })}
                      required
                      style={{
                        flex: 1,
                        background: '#0b0c0d',
                        border: '1px solid #2e3134',
                        color: '#c9ccd0',
                        padding: '6px 10px',
                        borderRadius: 4,
                        fontFamily: 'inherit',
                        fontSize: 11
                      }}
                    >
                      <option value="">Seleccionar...</option>
                      {customCategories[formData.type].map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => addCustomCategory(formData.type)}
                      style={{
                        background: '#2e3134',
                        border: 'none',
                        color: '#c9ccd0',
                        padding: '6px 10px',
                        borderRadius: 4,
                        cursor: 'pointer',
                        fontSize: 11
                      }}
                      title="Agregar categoría"
                    >
                      +
                    </button>
                  </div>
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
                      padding: '6px 10px',
                      borderRadius: 4,
                      fontFamily: 'inherit',
                      fontSize: 11
                    }}
                  />
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
                      padding: '6px 10px',
                      borderRadius: 4,
                      fontFamily: 'inherit',
                      fontSize: 11
                    }}
                  />
                </div>
                <div style={{ gridColumn: '1 / -1', display: 'flex', gap: 8 }}>
                  <button type="submit" style={{
                    background: '#ec4899',
                    border: 'none',
                    color: '#fff',
                    padding: '8px 20px',
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
                    padding: '8px 20px',
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

          {/* Transactions List */}
          <div style={{ background: '#1a1c1e', border: '1px solid #2e3134', borderRadius: 6, overflow: 'hidden' }}>
            {filteredTransactions.length === 0 ? (
              <div style={{ padding: 40, textAlign: 'center', color: '#5c6166' }}>
                No hay transacciones para este período
              </div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
                <thead>
                  <tr style={{ background: '#0b0c0d', borderBottom: '1px solid #2e3134' }}>
                    <th style={{ padding: '10px 12px', textAlign: 'left', color: '#5c6166', fontWeight: 600 }}>Fecha</th>
                    <th style={{ padding: '10px 12px', textAlign: 'left', color: '#5c6166', fontWeight: 600 }}>Tipo</th>
                    <th style={{ padding: '10px 12px', textAlign: 'left', color: '#5c6166', fontWeight: 600 }}>Categoría</th>
                    <th style={{ padding: '10px 12px', textAlign: 'left', color: '#5c6166', fontWeight: 600 }}>Descripción</th>
                    <th style={{ padding: '10px 12px', textAlign: 'right', color: '#5c6166', fontWeight: 600 }}>Monto</th>
                    <th style={{ padding: '10px 12px', textAlign: 'center', color: '#5c6166', fontWeight: 600 }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTransactions.map(t => (
                    <tr key={t.id} style={{ borderBottom: '1px solid #2e3134' }}>
                      <td style={{ padding: '10px 12px', color: '#8b9095' }}>{t.date}</td>
                      <td style={{ padding: '10px 12px' }}>
                        <span style={{
                          padding: '2px 8px',
                          borderRadius: 3,
                          fontSize: 10,
                          fontWeight: 600,
                          background: t.type === 'income' ? '#10b98122' : '#ef444422',
                          color: t.type === 'income' ? '#10b981' : '#ef4444'
                        }}>
                          {t.type === 'income' ? 'Ingreso' : 'Gasto'}
                        </span>
                      </td>
                      <td style={{ padding: '10px 12px', color: '#c9ccd0' }}>{t.category}</td>
                      <td style={{ padding: '10px 12px', color: '#8b9095' }}>{t.description || '-'}</td>
                      <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 600, color: t.type === 'income' ? '#10b981' : '#ef4444' }}>
                        {t.type === 'income' ? '+' : '-'}${t.amount.toFixed(2)}
                      </td>
                      <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                        <button onClick={() => handleEdit(t)} style={{
                          background: 'none',
                          border: 'none',
                          color: '#5c6166',
                          cursor: 'pointer',
                          marginRight: 8,
                          fontSize: 12
                        }} title="Editar">✏️</button>
                        <button onClick={() => handleDelete(t.id)} style={{
                          background: 'none',
                          border: 'none',
                          color: '#5c6166',
                          cursor: 'pointer',
                          fontSize: 12
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
