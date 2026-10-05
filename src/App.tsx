import { useState } from 'react'
import FinanceFlow from './components/FinanceFlow'
import FamilyFinanceFlow from './components/FamilyFinanceFlow'

export default function App() {
  const [currentView, setCurrentView] = useState<'flow' | 'family'>('family')

  return (
    <div style={{
      width: '100vw',
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
          onClick={() => setCurrentView('flow')}
          style={{
            background: currentView === 'flow' ? '#404040' : '#1a1c1e',
            border: '1px solid #2e3134',
            color: currentView === 'flow' ? '#fff' : '#c9ccd0',
            padding: '8px 20px',
            borderRadius: 4,
            cursor: 'pointer',
            fontFamily: 'inherit',
            fontSize: 12,
            fontWeight: currentView === 'flow' ? 600 : 400
          }}
        >
          ⚡ Flujo
        </button>
        <button
          onClick={() => setCurrentView('family')}
          style={{
            background: currentView === 'family' ? '#404040' : '#1a1c1e',
            border: '1px solid #2e3134',
            color: currentView === 'family' ? '#fff' : '#c9ccd0',
            padding: '8px 20px',
            borderRadius: 4,
            cursor: 'pointer',
            fontFamily: 'inherit',
            fontSize: 12,
            fontWeight: currentView === 'family' ? 600 : 400
          }}
        >
          Gestión de Gere y Milka
        </button>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflow: 'hidden', display: 'flex' }}>
        {currentView === 'flow' ? <FinanceFlow /> : <FamilyFinanceFlow />}
      </div>
    </div>
  )
}
