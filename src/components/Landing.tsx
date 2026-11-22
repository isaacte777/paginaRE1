type Props = {
  onEnter: (view?: 'flowlab' | 'modules' | 'finance') => void
}

const features = [
  {
    icon: 'fa-diagram-project',
    title: 'Flujos de trabajo visuales',
    desc: 'Diseña y edita diagramas interactivos para entender cualquier proceso financiero o técnico de un solo vistazo.',
  },
  {
    icon: 'fa-layer-group',
    title: 'Módulos organizados',
    desc: 'Agrupa tu información en módulos independientes: nómina, gastos, ingresos y proyectos, todo en un mismo lugar.',
  },
  {
    icon: 'fa-chart-line',
    title: 'Finanzas claras',
    desc: 'Plantillas listas para uso personal, familiar o de cómputo empresarial. Decisiones basadas en datos, no en suposiciones.',
  },
  {
    icon: 'fa-bolt',
    title: 'Rápido y sin fricción',
    desc: 'Interfaz minimalista que carga al instante y responde a tus acciones en tiempo real, sin curvas de aprendizaje.',
  },
  {
    icon: 'fa-shield-halved',
    title: 'Tu información, bajo control',
    desc: 'Visualiza el estado de cada nodo del sistema y detecta cuellos de botella antes de que se conviertan en problemas.',
  },
  {
    icon: 'fa-rocket',
    title: 'Escalable',
    desc: 'Empieza con un flujo simple y crece hasta un tablero completo de operaciones sin cambiar de herramienta.',
  },
]

const steps = [
  { n: '01', t: 'Explora', d: 'Entra al panel y observa los flujos ya construidos como ejemplo.' },
  { n: '02', t: 'Personaliza', d: 'Cambia valores, agrega nodos y adapta las plantillas a tu realidad.' },
  { n: '03', t: 'Decide', d: 'Usa la información visual para tomar mejores decisiones financieras.' },
]

export default function Landing({ onEnter }: Props) {
  return (
    <div
      style={{
        height: '100vh',
        overflowY: 'auto',
        background: '#0b0c0d',
        color: '#e6e8ea',
        fontFamily: "'JetBrains Mono', 'Fira Code', ui-monospace, monospace",
      }}
    >
      {/* Navbar */}
      <nav
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 32px',
          borderBottom: '1px solid #2e3134',
          position: 'sticky',
          top: 0,
          background: 'rgba(11,12,13,0.9)',
          backdropFilter: 'blur(8px)',
          zIndex: 10,
        }}
      >
        <div style={{ fontWeight: 700, fontSize: 16 }}>
          <span style={{ color: '#4ade80' }}>{'>'}</span> FlowLab
        </div>
        <button
          onClick={() => onEnter('flowlab')}
          style={{
            background: '#404040',
            border: '1px solid #2e3134',
            color: '#fff',
            padding: '8px 20px',
            borderRadius: 4,
            cursor: 'pointer',
            fontFamily: 'inherit',
            fontSize: 12,
            fontWeight: 600,
          }}
        >
          Entrar al panel {'->'}
        </button>
      </nav>

      {/* Hero */}
      <header
        style={{
          textAlign: 'center',
          padding: '90px 24px 70px',
          background:
            'radial-gradient(ellipse at 50% 0%, rgba(74,222,128,0.12), transparent 60%)',
        }}
      >
        <div
          style={{
            display: 'inline-block',
            border: '1px solid #2e3134',
            borderRadius: 999,
            padding: '6px 16px',
            fontSize: 11,
            color: '#4ade80',
            marginBottom: 24,
            background: '#131416',
          }}
        >
          Sistema Financiero Visual
        </div>
        <h1
          style={{
            margin: 0,
            fontSize: 'clamp(32px, 6vw, 56px)',
            lineHeight: 1.15,
            fontWeight: 800,
          }}
        >
          Entiende tu dinero
          <br />
          <span style={{ color: '#4ade80' }}>como un flujo de datos</span>
        </h1>
        <p
          style={{
            maxWidth: 620,
            margin: '24px auto 0',
            color: '#9aa0a6',
            fontSize: 16,
            lineHeight: 1.7,
          }}
        >
          FlowLab convierte números dispersos en diagramas claros: ve dónde entra,
          dónde sale y dónde se atasca tu dinero. Sin hojas de cálculo eternas,
          sin adivinar.
        </p>
        <div style={{ marginTop: 36, display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={() => onEnter('flowlab')}
            style={{
              background: '#4ade80',
              color: '#0b0c0d',
              border: 'none',
              padding: '12px 28px',
              borderRadius: 4,
              cursor: 'pointer',
              fontFamily: 'inherit',
              fontSize: 14,
              fontWeight: 700,
            }}
          >
            Comenzar ahora
          </button>
          <button
            onClick={() => onEnter('finance')}
            style={{
              background: '#1a1c1e',
              color: '#c9ccd0',
              border: '1px solid #2e3134',
              padding: '12px 28px',
              borderRadius: 4,
              cursor: 'pointer',
              fontFamily: 'inherit',
              fontSize: 14,
              fontWeight: 600,
            }}
          >
            Ver plantillas financieras
          </button>
        </div>
      </header>

      {/* ¿Por qué FlowLab? */}
      <section style={{ padding: '60px 32px', maxWidth: 1100, margin: '0 auto' }}>
        <h2 style={{ textAlign: 'center', fontSize: 28, fontWeight: 700, margin: 0 }}>
          ¿Por qué usar FlowLab?
        </h2>
        <p style={{ textAlign: 'center', color: '#9aa0a6', marginTop: 12 }}>
          Razones por las que nuestros usuarios dejaron las hojas de cálculo tradicionales
        </p>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 20,
            marginTop: 44,
          }}
        >
          {features.map((f) => (
            <div
              key={f.title}
              style={{
                background: '#131416',
                border: '1px solid #2e3134',
                borderRadius: 8,
                padding: 24,
              }}
            >
              <div
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 8,
                  background: 'rgba(74,222,128,0.12)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 16,
                }}
              >
                <i className={`fa-solid ${f.icon}`} style={{ color: '#4ade80' }} />
              </div>
              <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>{f.title}</h3>
              <p style={{ margin: '10px 0 0', color: '#9aa0a6', fontSize: 13, lineHeight: 1.6 }}>
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Cómo funciona */}
      <section style={{ padding: '40px 32px 70px', maxWidth: 1100, margin: '0 auto' }}>
        <h2 style={{ textAlign: 'center', fontSize: 28, fontWeight: 700, margin: 0 }}>
          ¿Cómo funciona?
        </h2>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: 20,
            marginTop: 44,
          }}
        >
          {steps.map((s) => (
            <div
              key={s.n}
              style={{
                background: '#131416',
                border: '1px solid #2e3134',
                borderRadius: 8,
                padding: 24,
              }}
            >
              <div style={{ color: '#4ade80', fontSize: 22, fontWeight: 800 }}>{s.n}</div>
              <h3 style={{ margin: '12px 0 6px', fontSize: 16 }}>{s.t}</h3>
              <p style={{ margin: 0, color: '#9aa0a6', fontSize: 13, lineHeight: 1.6 }}>{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA final */}
      <section
        style={{
          textAlign: 'center',
          padding: '70px 24px',
          borderTop: '1px solid #2e3134',
          background:
            'radial-gradient(ellipse at 50% 100%, rgba(74,222,128,0.1), transparent 60%)',
        }}
      >
        <h2 style={{ margin: 0, fontSize: 26, fontWeight: 800 }}>
          Listo para ver tu dinero con claridad?
        </h2>
        <p style={{ color: '#9aa0a6', marginTop: 12 }}>
          Entra al panel y empieza a explorar los flujos en segundos.
        </p>
        <button
          onClick={() => onEnter('flowlab')}
          style={{
            marginTop: 28,
            background: '#4ade80',
            color: '#0b0c0d',
            border: 'none',
            padding: '14px 36px',
            borderRadius: 4,
            cursor: 'pointer',
            fontFamily: 'inherit',
            fontSize: 15,
            fontWeight: 700,
          }}
        >
          Entrar al panel {'->'}
        </button>
      </section>

      <footer
        style={{
          textAlign: 'center',
          padding: '24px',
          borderTop: '1px solid #2e3134',
          color: '#6b7075',
          fontSize: 12,
        }}
      >
        {'>'} FlowLab — Sistema Financiero Visual
      </footer>
    </div>
  )
}
