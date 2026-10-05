import { useState } from 'react';
import {
  allMonths,
  creditCards,
  debts,
  paymentSchedules,
  tools,
  formatCurrency,
  calculateTotalDebt,
  calculateTotalToolsPending,
  getMonthlyComparison,
} from '../data/familyFinanceData';

type ViewType = 'overview' | 'monthly' | 'debts' | 'payments' | 'tools';

export default function FamilyFinanceFlow() {
  const [currentView, setCurrentView] = useState<ViewType>('overview');
  const [selectedMonth, setSelectedMonth] = useState(4); // Octubre (último mes)

  const monthlyComparison = getMonthlyComparison();
  const totalDebt = calculateTotalDebt();
  const totalToolsPending = calculateTotalToolsPending();

  return (
    <div style={{
      width: '100%',
      height: '100%',
      background: '#0b0c0d',
      color: '#e5e5e5',
      fontFamily: "'JetBrains Mono', monospace",
      overflow: 'auto',
    }}>
      {/* Header con selector de vista */}
      <div style={{
        padding: '20px',
        borderBottom: '2px solid #333',
        background: '#1a1a1a',
      }}>
        <h1 style={{ margin: '0 0 15px 0', fontSize: '24px', color: '#fff' }}>
          Sistema Financiero Familiar - Gere y Milki
        </h1>
        
        {/* Selector de vistas */}
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button
            onClick={() => setCurrentView('overview')}
            style={{
              padding: '10px 20px',
              background: currentView === 'overview' ? '#404040' : '#2a2a2a',
              border: '1px solid #555',
              borderRadius: '6px',
              color: '#fff',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: currentView === 'overview' ? 'bold' : 'normal',
            }}
          >
            📊 Resumen General
          </button>
          <button
            onClick={() => setCurrentView('monthly')}
            style={{
              padding: '10px 20px',
              background: currentView === 'monthly' ? '#404040' : '#2a2a2a',
              border: '1px solid #555',
              borderRadius: '6px',
              color: '#fff',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: currentView === 'monthly' ? 'bold' : 'normal',
            }}
          >
            📅 Detalle Mensual
          </button>
          <button
            onClick={() => setCurrentView('debts')}
            style={{
              padding: '10px 20px',
              background: currentView === 'debts' ? '#404040' : '#2a2a2a',
              border: '1px solid #555',
              borderRadius: '6px',
              color: '#fff',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: currentView === 'debts' ? 'bold' : 'normal',
            }}
          >
            💳 Deudas
          </button>
          <button
            onClick={() => setCurrentView('payments')}
            style={{
              padding: '10px 20px',
              background: currentView === 'payments' ? '#404040' : '#2a2a2a',
              border: '1px solid #555',
              borderRadius: '6px',
              color: '#fff',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: currentView === 'payments' ? 'bold' : 'normal',
            }}
          >
            📆 Calendario de Pagos
          </button>
          <button
            onClick={() => setCurrentView('tools')}
            style={{
              padding: '10px 20px',
              background: currentView === 'tools' ? '#404040' : '#2a2a2a',
              border: '1px solid #555',
              borderRadius: '6px',
              color: '#fff',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: currentView === 'tools' ? 'bold' : 'normal',
            }}
          >
            🛠️ Herramientas
          </button>
        </div>
      </div>

      {/* Contenido principal */}
      <div style={{ padding: '20px' }}>
        {currentView === 'overview' && (
          <OverviewView
            monthlyComparison={monthlyComparison}
            totalDebt={totalDebt}
            totalToolsPending={totalToolsPending}
          />
        )}

        {currentView === 'monthly' && (
          <MonthlyView
            selectedMonth={selectedMonth}
            setSelectedMonth={setSelectedMonth}
          />
        )}

        {currentView === 'debts' && <DebtsView />}

        {currentView === 'payments' && <PaymentsView />}

        {currentView === 'tools' && <ToolsView />}
      </div>
    </div>
  );
}

// VISTA: RESUMEN GENERAL
function OverviewView({
  monthlyComparison,
  totalDebt,
  totalToolsPending,
}: {
  monthlyComparison: any[];
  totalDebt: number;
  totalToolsPending: number;
}) {
  const latestMonth = monthlyComparison[monthlyComparison.length - 1];

  return (
    <div>
      <h2 style={{ color: '#fff', marginBottom: '20px' }}>📊 Resumen General</h2>

      {/* Tarjetas de resumen */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '20px',
        marginBottom: '30px',
      }}>
        <div style={{
          padding: '20px',
          background: '#1a1a1a',
          border: '2px solid #333',
          borderRadius: '8px',
        }}>
          <div style={{ fontSize: '12px', color: '#888', marginBottom: '10px' }}>
            Balance Actual ({latestMonth.month} {latestMonth.year})
          </div>
          <div style={{
            fontSize: '28px',
            fontWeight: 'bold',
            color: latestMonth.savings >= 0 ? '#10b981' : '#ef4444',
          }}>
            {formatCurrency(latestMonth.savings)}
          </div>
          <div style={{
            fontSize: '14px',
            color: latestMonth.percentageChange >= 0 ? '#10b981' : '#ef4444',
            marginTop: '5px',
          }}>
            {latestMonth.percentageChange >= 0 ? '↑' : '↓'} {Math.abs(latestMonth.percentageChange)}%
          </div>
        </div>

        <div style={{
          padding: '20px',
          background: '#1a1a1a',
          border: '2px solid #333',
          borderRadius: '8px',
        }}>
          <div style={{ fontSize: '12px', color: '#888', marginBottom: '10px' }}>
            Deuda Total Pendiente
          </div>
          <div style={{
            fontSize: '28px',
            fontWeight: 'bold',
            color: '#ef4444',
          }}>
            {formatCurrency(totalDebt)}
          </div>
        </div>

        <div style={{
          padding: '20px',
          background: '#1a1a1a',
          border: '2px solid #333',
          borderRadius: '8px',
        }}>
          <div style={{ fontSize: '12px', color: '#888', marginBottom: '10px' }}>
            Herramientas Pendientes
          </div>
          <div style={{
            fontSize: '28px',
            fontWeight: 'bold',
            color: '#f59e0b',
          }}>
            {formatCurrency(totalToolsPending)}
          </div>
        </div>

        <div style={{
          padding: '20px',
          background: '#1a1a1a',
          border: '2px solid #333',
          borderRadius: '8px',
        }}>
          <div style={{ fontSize: '12px', color: '#888', marginBottom: '10px' }}>
            Gastos del Mes
          </div>
          <div style={{
            fontSize: '28px',
            fontWeight: 'bold',
            color: '#ef4444',
          }}>
            {formatCurrency(latestMonth.expenses)}
          </div>
        </div>
      </div>

      {/* Gráfico de evolución mensual */}
      <div style={{
        padding: '20px',
        background: '#1a1a1a',
        border: '2px solid #333',
        borderRadius: '8px',
        marginBottom: '20px',
      }}>
        <h3 style={{ color: '#fff', marginBottom: '20px' }}>📈 Evolución del Ahorro</h3>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '15px', height: '200px' }}>
          {monthlyComparison.map((month, index) => {
            const maxSavings = Math.max(...monthlyComparison.map(m => Math.abs(m.savings)));
            const height = Math.abs(month.savings) / maxSavings * 150;
            const isPositive = month.savings >= 0;

            return (
              <div
                key={index}
                style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '5px',
                }}
              >
                <div style={{ fontSize: '10px', color: '#888' }}>
                  {formatCurrency(month.savings)}
                </div>
                <div
                  style={{
                    width: '100%',
                    height: `${height}px`,
                    background: isPositive ? '#10b981' : '#ef4444',
                    borderRadius: '4px 4px 0 0',
                    transition: 'height 0.3s',
                  }}
                />
                <div style={{ fontSize: '11px', color: '#ccc' }}>
                  {month.month}
                </div>
                <div style={{ fontSize: '10px', color: '#888' }}>
                  {month.year}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Tarjetas de crédito */}
      <div style={{
        padding: '20px',
        background: '#1a1a1a',
        border: '2px solid #333',
        borderRadius: '8px',
      }}>
        <h3 style={{ color: '#fff', marginBottom: '20px' }}>💳 Tarjetas de Crédito</h3>
        <div style={{ display: 'grid', gap: '15px' }}>
          {creditCards.map((card, index) => (
            <div
              key={index}
              style={{
                padding: '15px',
                background: '#2a2a2a',
                border: '1px solid #444',
                borderRadius: '6px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#fff' }}>
                    {card.bank}
                  </div>
                  <div style={{ fontSize: '12px', color: '#888' }}>
                    {card.owner}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '12px', color: '#888' }}>Límite</div>
                  <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#fff' }}>
                    {formatCurrency(card.totalLimit)}
                  </div>
                </div>
              </div>
              <div style={{
                height: '8px',
                background: '#1a1a1a',
                borderRadius: '4px',
                overflow: 'hidden',
              }}>
                <div
                  style={{
                    height: '100%',
                    width: `${(card.consumed / card.totalLimit) * 100}%`,
                    background: card.consumed / card.totalLimit > 0.8 ? '#ef4444' : '#f59e0b',
                    transition: 'width 0.3s',
                  }}
                />
              </div>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginTop: '10px',
                fontSize: '11px',
              }}>
                <span style={{ color: '#888' }}>
                  Consumido: {formatCurrency(card.consumed)}
                </span>
                <span style={{ color: '#10b981' }}>
                  Disponible: {formatCurrency(card.remaining)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// VISTA: DETALLE MENSUAL
function MonthlyView({
  selectedMonth,
  setSelectedMonth,
}: {
  selectedMonth: number;
  setSelectedMonth: (month: number) => void;
}) {
  const month = allMonths[selectedMonth];

  return (
    <div>
      <h2 style={{ color: '#fff', marginBottom: '20px' }}>📅 Detalle Mensual</h2>

      {/* Selector de mes */}
      <div style={{
        display: 'flex',
        gap: '10px',
        marginBottom: '20px',
        flexWrap: 'wrap',
      }}>
        {allMonths.map((m, index) => (
          <button
            key={index}
            onClick={() => setSelectedMonth(index)}
            style={{
              padding: '10px 20px',
              background: selectedMonth === index ? '#404040' : '#2a2a2a',
              border: '1px solid #555',
              borderRadius: '6px',
              color: '#fff',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: selectedMonth === index ? 'bold' : 'normal',
            }}
          >
            {m.month} {m.year}
          </button>
        ))}
      </div>

      {/* Resumen del mes */}
      <div style={{
        padding: '20px',
        background: '#1a1a1a',
        border: '2px solid #333',
        borderRadius: '8px',
        marginBottom: '20px',
      }}>
        <h3 style={{ color: '#fff', marginBottom: '15px' }}>
          Resumen de {month.month} {month.year}
        </h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '15px',
        }}>
          <div>
            <div style={{ fontSize: '12px', color: '#888' }}>Saldo Inicial</div>
            <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#fff' }}>
              {formatCurrency(month.initialBalance)}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '12px', color: '#888' }}>Saldo Final</div>
            <div style={{
              fontSize: '20px',
              fontWeight: 'bold',
              color: month.finalBalance >= month.initialBalance ? '#10b981' : '#ef4444',
            }}>
              {formatCurrency(month.finalBalance)}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '12px', color: '#888' }}>Variación</div>
            <div style={{
              fontSize: '20px',
              fontWeight: 'bold',
              color: month.percentageChange >= 0 ? '#10b981' : '#ef4444',
            }}>
              {month.percentageChange >= 0 ? '+' : ''}{month.percentageChange}%
            </div>
          </div>
        </div>
      </div>

      {/* Gastos del mes */}
      <div style={{
        padding: '20px',
        background: '#1a1a1a',
        border: '2px solid #333',
        borderRadius: '8px',
        marginBottom: '20px',
      }}>
        <h3 style={{ color: '#fff', marginBottom: '15px' }}>💸 Gastos del Mes</h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: '10px',
          marginBottom: '15px',
        }}>
          <div style={{ padding: '10px', background: '#2a2a2a', borderRadius: '6px' }}>
            <div style={{ fontSize: '11px', color: '#888' }}>Presupuestado</div>
            <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#fff' }}>
              {formatCurrency(month.budgetedExpenses)}
            </div>
          </div>
          <div style={{ padding: '10px', background: '#2a2a2a', borderRadius: '6px' }}>
            <div style={{ fontSize: '11px', color: '#888' }}>Real</div>
            <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#ef4444' }}>
              {formatCurrency(month.actualExpenses)}
            </div>
          </div>
        </div>

        {/* Lista de gastos */}
        <div style={{ maxHeight: '400px', overflow: 'auto' }}>
          {month.expenses.map((expense, index) => (
            <div
              key={index}
              style={{
                padding: '10px',
                background: '#2a2a2a',
                border: '1px solid #444',
                borderRadius: '4px',
                marginBottom: '8px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div>
                <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#fff' }}>
                  {expense.category}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '13px', color: '#ef4444', fontWeight: 'bold' }}>
                  {formatCurrency(expense.actual)}
                </div>
                {expense.budgeted > 0 && (
                  <div style={{ fontSize: '10px', color: '#888' }}>
                    Presupuesto: {formatCurrency(expense.budgeted)}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Ingresos del mes */}
      <div style={{
        padding: '20px',
        background: '#1a1a1a',
        border: '2px solid #333',
        borderRadius: '8px',
      }}>
        <h3 style={{ color: '#fff', marginBottom: '15px' }}>💰 Ingresos del Mes</h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: '10px',
          marginBottom: '15px',
        }}>
          <div style={{ padding: '10px', background: '#2a2a2a', borderRadius: '6px' }}>
            <div style={{ fontSize: '11px', color: '#888' }}>Proyectado</div>
            <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#fff' }}>
              {formatCurrency(month.budgetedIncome)}
            </div>
          </div>
          <div style={{ padding: '10px', background: '#2a2a2a', borderRadius: '6px' }}>
            <div style={{ fontSize: '11px', color: '#888' }}>Real</div>
            <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#10b981' }}>
              {formatCurrency(month.actualIncome)}
            </div>
          </div>
        </div>

        {/* Lista de ingresos */}
        <div style={{ maxHeight: '400px', overflow: 'auto' }}>
          {month.incomes.map((income, index) => (
            <div
              key={index}
              style={{
                padding: '10px',
                background: '#2a2a2a',
                border: '1px solid #444',
                borderRadius: '4px',
                marginBottom: '8px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#fff' }}>
                {income.source}
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '13px', color: '#10b981', fontWeight: 'bold' }}>
                  {formatCurrency(income.actual)}
                </div>
                {income.projected > 0 && (
                  <div style={{ fontSize: '10px', color: '#888' }}>
                    Proyectado: {formatCurrency(income.projected)}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// VISTA: DEUDAS
function DebtsView() {
  return (
    <div>
      <h2 style={{ color: '#fff', marginBottom: '20px' }}>💳 Deudas</h2>

      <div style={{ display: 'grid', gap: '20px' }}>
        {debts.map((debt, index) => (
          <div
            key={index}
            style={{
              padding: '20px',
              background: '#1a1a1a',
              border: `2px solid ${debt.status === 'active' ? '#ef4444' : '#10b981'}`,
              borderRadius: '8px',
            }}
          >
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '15px',
            }}>
              <h3 style={{ color: '#fff', margin: 0 }}>{debt.name}</h3>
              <span
                style={{
                  padding: '5px 10px',
                  background: debt.status === 'active' ? '#ef4444' : '#10b981',
                  borderRadius: '4px',
                  fontSize: '11px',
                  fontWeight: 'bold',
                }}
              >
                {debt.status === 'active' ? 'ACTIVA' : 'CANCELADA'}
              </span>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
              gap: '15px',
              marginBottom: '15px',
            }}>
              <div>
                <div style={{ fontSize: '11px', color: '#888' }}>Total Préstamo</div>
                <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#fff' }}>
                  {formatCurrency(debt.totalAmount)}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '11px', color: '#888' }}>Pagado</div>
                <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#10b981' }}>
                  {formatCurrency(debt.paid)}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '11px', color: '#888' }}>Falta Pagar</div>
                <div style={{
                  fontSize: '18px',
                  fontWeight: 'bold',
                  color: debt.remaining > 0 ? '#ef4444' : '#10b981',
                }}>
                  {formatCurrency(Math.abs(debt.remaining))}
                </div>
              </div>
            </div>

            {/* Barra de progreso */}
            <div style={{
              height: '10px',
              background: '#2a2a2a',
              borderRadius: '5px',
              overflow: 'hidden',
              marginBottom: '15px',
            }}>
              <div
                style={{
                  height: '100%',
                  width: `${(debt.paid / debt.totalAmount) * 100}%`,
                  background: debt.status === 'active' ? '#f59e0b' : '#10b981',
                  transition: 'width 0.3s',
                }}
              />
            </div>

            {/* Cuotas */}
            {debt.installments.length > 0 && (
              <div>
                <div style={{ fontSize: '12px', color: '#888', marginBottom: '10px' }}>
                  Cuotas ({debt.installments.length})
                </div>
                <div style={{ maxHeight: '200px', overflow: 'auto' }}>
                  {debt.installments.map((installment, i) => (
                    <div
                      key={i}
                      style={{
                        padding: '8px',
                        background: '#2a2a2a',
                        border: '1px solid #444',
                        borderRadius: '4px',
                        marginBottom: '5px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        fontSize: '11px',
                      }}
                    >
                      <span style={{ color: '#fff' }}>Cuota {installment.number}</span>
                      <span style={{ color: '#888' }}>
                        {formatCurrency(installment.amount)}
                      </span>
                      <span style={{
                        color: installment.paid > 0 ? '#10b981' : '#ef4444',
                        fontWeight: 'bold',
                      }}>
                        {installment.paid > 0 ? '✓ Pagado' : '⏳ Pendiente'}
                      </span>
                      {installment.date && (
                        <span style={{ color: '#888', fontSize: '10px' }}>
                          {installment.date}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// VISTA: CALENDARIO DE PAGOS
function PaymentsView() {
  return (
    <div>
      <h2 style={{ color: '#fff', marginBottom: '20px' }}>📆 Calendario de Pagos</h2>

      <div style={{ display: 'grid', gap: '20px' }}>
        {paymentSchedules.map((schedule, index) => (
          <div
            key={index}
            style={{
              padding: '20px',
              background: '#1a1a1a',
              border: '2px solid #333',
              borderRadius: '8px',
            }}
          >
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '15px',
            }}>
              <h3 style={{ color: '#fff', margin: 0 }}>{schedule.name}</h3>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '11px', color: '#888' }}>Pago Pendiente</div>
                <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#f59e0b' }}>
                  {formatCurrency(schedule.pendingAmount)}
                </div>
              </div>
            </div>

            <div style={{ fontSize: '12px', color: '#888', marginBottom: '15px' }}>
              {schedule.period}
            </div>

            {/* Tabla de pagos */}
            <div style={{ overflow: 'auto' }}>
              <table style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: '11px',
              }}>
                <thead>
                  <tr style={{ background: '#2a2a2a' }}>
                    <th style={{ padding: '10px', textAlign: 'left', color: '#888' }}>Mes</th>
                    <th style={{ padding: '10px', textAlign: 'right', color: '#888' }}>Día 5</th>
                    <th style={{ padding: '10px', textAlign: 'right', color: '#888' }}>Día 13</th>
                    <th style={{ padding: '10px', textAlign: 'right', color: '#888' }}>Día 30</th>
                    <th style={{ padding: '10px', textAlign: 'right', color: '#888' }}>Total</th>
                    <th style={{ padding: '10px', textAlign: 'center', color: '#888' }}>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {schedule.payments.map((payment, i) => (
                    <tr
                      key={i}
                      style={{
                        background: i % 2 === 0 ? '#1a1a1a' : '#2a2a2a',
                        borderBottom: '1px solid #333',
                      }}
                    >
                      <td style={{ padding: '10px', color: '#fff' }}>{payment.month}</td>
                      <td style={{ padding: '10px', textAlign: 'right', color: '#ccc' }}>
                        {payment.day05 ? formatCurrency(payment.day05) : '-'}
                      </td>
                      <td style={{ padding: '10px', textAlign: 'right', color: '#ccc' }}>
                        {payment.day13 ? formatCurrency(payment.day13) : '-'}
                      </td>
                      <td style={{ padding: '10px', textAlign: 'right', color: '#ccc' }}>
                        {payment.day30 ? formatCurrency(payment.day30) : '-'}
                      </td>
                      <td style={{ padding: '10px', textAlign: 'right', color: '#fff', fontWeight: 'bold' }}>
                        {formatCurrency(payment.total)}
                      </td>
                      <td style={{ padding: '10px', textAlign: 'center' }}>
                        <span
                          style={{
                            padding: '3px 8px',
                            background: payment.status === 'Pagado' ? '#10b981' : payment.status === 'Falta' ? '#f59e0b' : '#666',
                            borderRadius: '3px',
                            fontSize: '10px',
                            fontWeight: 'bold',
                          }}
                        >
                          {payment.status || '-'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// VISTA: HERRAMIENTAS
function ToolsView() {
  const totalCost = tools.reduce((sum, tool) => sum + tool.cost, 0);
  const totalPaid = tools.reduce((sum, tool) => sum + tool.paid, 0);
  const totalPending = tools.reduce((sum, tool) => sum + tool.pending, 0);

  return (
    <div>
      <h2 style={{ color: '#fff', marginBottom: '20px' }}>🛠️ Herramientas Pendientes</h2>

      {/* Resumen */}
      <div style={{
        padding: '20px',
        background: '#1a1a1a',
        border: '2px solid #333',
        borderRadius: '8px',
        marginBottom: '20px',
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: '15px',
        }}>
          <div>
            <div style={{ fontSize: '12px', color: '#888' }}>Costo Total</div>
            <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#fff' }}>
              {formatCurrency(totalCost)}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '12px', color: '#888' }}>Pagado</div>
            <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#10b981' }}>
              {formatCurrency(totalPaid)}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '12px', color: '#888' }}>Pendiente</div>
            <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#f59e0b' }}>
              {formatCurrency(totalPending)}
            </div>
          </div>
        </div>

        {/* Barra de progreso */}
        <div style={{
          height: '10px',
          background: '#2a2a2a',
          borderRadius: '5px',
          overflow: 'hidden',
          marginTop: '15px',
        }}>
          <div
            style={{
              height: '100%',
              width: `${(totalPaid / totalCost) * 100}%`,
              background: '#10b981',
              transition: 'width 0.3s',
            }}
          />
        </div>
        <div style={{ fontSize: '11px', color: '#888', marginTop: '5px', textAlign: 'center' }}>
          {((totalPaid / totalCost) * 100).toFixed(1)}% completado
        </div>
      </div>

      {/* Lista de herramientas */}
      <div style={{ display: 'grid', gap: '15px' }}>
        {tools.map((tool, index) => (
          <div
            key={index}
            style={{
              padding: '15px',
              background: '#1a1a1a',
              border: '2px solid #333',
              borderRadius: '8px',
            }}
          >
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '10px',
            }}>
              <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#fff' }}>
                {tool.name}
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#fff' }}>
                  {formatCurrency(tool.cost)}
                </div>
              </div>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '10px',
              marginBottom: '10px',
            }}>
              <div>
                <div style={{ fontSize: '11px', color: '#888' }}>Pagado</div>
                <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#10b981' }}>
                  {formatCurrency(tool.paid)}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '11px', color: '#888' }}>Pendiente</div>
                <div style={{
                  fontSize: '14px',
                  fontWeight: 'bold',
                  color: tool.pending > 0 ? '#f59e0b' : '#10b981',
                }}>
                  {formatCurrency(tool.pending)}
                </div>
              </div>
            </div>

            {/* Barra de progreso */}
            <div style={{
              height: '6px',
              background: '#2a2a2a',
              borderRadius: '3px',
              overflow: 'hidden',
            }}>
              <div
                style={{
                  height: '100%',
                  width: `${(tool.paid / tool.cost) * 100}%`,
                  background: tool.pending === 0 ? '#10b981' : '#f59e0b',
                  transition: 'width 0.3s',
                }}
              />
            </div>
            <div style={{ fontSize: '10px', color: '#888', marginTop: '5px', textAlign: 'right' }}>
              {((tool.paid / tool.cost) * 100).toFixed(1)}%
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
