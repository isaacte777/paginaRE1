import { useState } from 'react'
import FlowLab from './components/FlowLab'
import FinanceFlow from './components/FinanceFlow'
import ModulesDashboard from './components/ModulesDashboard'

export default function App() {
  const [currentView, setCurrentView] = useState<'flowlab' | 'modules' | 'finance'>('flowlab')
  const [financeTemplate, setFinanceTemplate] = useState<'computo' | 'family'>('computo')

  return (
    <div style={{
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      background: '#0b0c0d',
      overflow: 'hidden'
    }}>
      {/* Navigation Bar */}
      <div style={{
        background: '#131416',
        borderBottom: '1px solid #2e3134',
        padding: '8px 20px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        flexShrink: 0
      }}>
        <button
          onClick={() => setCurrentView('flowlab')}
          style={{
            background: currentView === 'flowlab' ? '#404040' : '#1a1c1e',
            border: '1px solid #2e3134',
            color: currentView === 'flowlab' ? '#fff' : '#c9ccd0',
            padding: '8px 20px',
            borderRadius: 4,
            cursor: 'pointer',
            fontFamily: 'inherit',
            fontSize: 12,
            fontWeight: currentView === 'flowlab' ? 600 : 400
          }}
        >
          {'>'} FlowLab
        </button>
        <button
          onClick={() => setCurrentView('modules')}
          style={{
            background: currentView === 'modules' ? '#404040' : '#1a1c1e',
            border: '1px solid #2e3134',
            color: currentView === 'modules' ? '#fff' : '#c9ccd0',
            padding: '8px 20px',
            borderRadius: 4,
            cursor: 'pointer',
            fontFamily: 'inherit',
            fontSize: 12,
            fontWeight: currentView === 'modules' ? 600 : 400
          }}
        >
          [#] Módulos
        </button>
        <button
          onClick={() => setCurrentView('finance')}
          style={{
            background: currentView === 'finance' ? '#404040' : '#1a1c1e',
            border: '1px solid #2e3134',
            color: currentView === 'finance' ? '#fff' : '#c9ccd0',
            padding: '8px 20px',
            borderRadius: 4,
            cursor: 'pointer',
            fontFamily: 'inherit',
            fontSize: 12,
            fontWeight: currentView === 'finance' ? 600 : 400
          }}
        >
          [$] Finanzas
        </button>

        {/* Selector de plantilla financiera (solo visible en vista finanzas) */}
        {currentView === 'finance' && (
          <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px' }}>
            <button
              onClick={() => setFinanceTemplate('computo')}
              style={{
                background: financeTemplate === 'computo' ? '#404040' : '#1a1c1e',
                border: '1px solid #2e3134',
                color: financeTemplate === 'computo' ? '#fff' : '#c9ccd0',
                padding: '6px 16px',
                borderRadius: 4,
                cursor: 'pointer',
                fontFamily: 'inherit',
                fontSize: 11,
                fontWeight: financeTemplate === 'computo' ? 600 : 400
              }}
            >
              [C] Cómputo Gere
            </button>
            <button
              onClick={() => setFinanceTemplate('family')}
              style={{
                background: financeTemplate === 'family' ? '#404040' : '#1a1c1e',
                border: '1px solid #2e3134',
                color: financeTemplate === 'family' ? '#fff' : '#c9ccd0',
                padding: '6px 16px',
                borderRadius: 4,
                cursor: 'pointer',
                fontFamily: 'inherit',
                fontSize: 11,
                fontWeight: financeTemplate === 'family' ? 600 : 400
              }}
            >
              [F] Sistema Familiar
            </button>
          </div>
        )}
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflow: 'hidden', display: 'flex' }}>
        {currentView === 'flowlab' && <FlowLab />}
        {currentView === 'modules' && <ModulesDashboard />}
        {currentView === 'finance' && <FinanceFlow template={financeTemplate} />}
      </div>
    </div>
  )
}
