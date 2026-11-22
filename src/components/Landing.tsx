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
          flexWrap: 'wrap',
          gap: '12px'
        }}
      >
        <div style={{ fontWeight: 700, fontSize: 16, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ color: '#4ade80' }}>{'>'}</span> FlowLab
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <a
            href="modules-dashboard.html"
            style={{
              background: '#1a1c1e',
              border: '1px solid #4ade80',
              color: '#4ade80',
              padding: '6px 14px',
              borderRadius: 4,
              textDecoration: 'none',
              fontSize: 11,
              fontWeight: 600,
            }}
          >
            [Dashboard Módulos]
          </a>
          <a
            href="coordination.html"
            style={{
              background: '#1a1c1e',
              border: '1px solid #2e3134',
              color: '#c9ccd0',
              padding: '6px 14px',
              borderRadius: 4,
              textDecoration: 'none',
              fontSize: 11,
              fontWeight: 600,
            }}
          >
            [Coordinación]
          </a>
          <a
            href="price-comparison-implementation-flow.html"
            style={{
              background: '#1a1c1e',
              border: '1px solid #2e3134',
              color: '#c9ccd0',
              padding: '6px 14px',
              borderRadius: 4,
              textDecoration: 'none',
              fontSize: 11,
              fontWeight: 600,
            }}
          >
            [Flujo Precios]
          </a>
          <button
            onClick={() => onEnter('flowlab')}
            style={{
              background: '#404040',
              border: '1px solid #2e3134',
              color: '#fff',
              padding: '6px 16px',
              borderRadius: 4,
              cursor: 'pointer',
              fontFamily: 'inherit',
              fontSize: 11,
              fontWeight: 600,
            }}
          >
            Panel React {'->'}
          </button>
        </div>
      </nav>

      {/* Hero */}
      <header
        style={{
          textAlign: 'center',
          padding: '80px 24px 60px',
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
          Tus Páginas Clásicas y Módulos
        </div>
        <h1
          style={{
            margin: 0,
            fontSize: 'clamp(30px, 5vw, 50px)',
            lineHeight: 1.15,
            fontWeight: 800,
          }}
        >
          Acceso directo a tus
          <br />
          <span style={{ color: '#4ade80' }}>páginas y tableros originales</span>
        </h1>
        <p
          style={{
            maxWidth: 620,
            margin: '20px auto 0',
            color: '#9aa0a6',
            fontSize: 15,
            lineHeight: 1.6,
          }}
        >
          Aquí tienes todas tus páginas clásicas restauradas. Elige abajo el tablero o módulo exacto que tenías antes:
        </p>

        {/* Botones directos a las páginas clásicas */}
        <div style={{ marginTop: 32, display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <a
            href="modules-dashboard.html"
            style={{
              background: '#4ade80',
              color: '#0b0c0d',
              border: 'none',
              padding: '12px 24px',
              borderRadius: 4,
              textDecoration: 'none',
              fontSize: 13,
              fontWeight: 700,
            }}
          >
            Abrir modules-dashboard.html
          </a>
          <a
            href="coordination.html"
            style={{
              background: '#1a1c1e',
              color: '#c9ccd0',
              border: '1px solid #2e3134',
              padding: '12px 24px',
              borderRadius: 4,
              textDecoration: 'none',
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            Abrir coordination.html
          </a>
          <a
            href="price-comparison-implementation-flow.html"
            style={{
              background: '#1a1c1e',
              color: '#c9ccd0',
              border: '1px solid #2e3134',
              padding: '12px 24px',
              borderRadius: 4,
              textDecoration: 'none',
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            Abrir price-comparison-flow.html
          </a>
          <a
            href="qwen-setup.html"
            style={{
              background: '#1a1c1e',
              color: '#c9ccd0',
              border: '1px solid #2e3134',
              padding: '12px 24px',
              borderRadius: 4,
              textDecoration: 'none',
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            Abrir qwen-setup.html
          </a>
        </div>
      </header>

      {/* ¿Por qué FlowLab? */}
      <section style={{ padding: '40px 32px', maxWidth: 1100, margin: '0 auto' }}>
        <h2 style={{ textAlign: 'center', fontSize: 26, fontWeight: 700, margin: 0 }}>
          Características del Sistema
        </h2>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 20,
            marginTop: 36,
          }}
        >
          {features.map((f) => (
            <div
              key={f.title}
              style={{
                background: '#131416',
                border: '1px solid #2e3134',
                borderRadius: 8,
                padding: 20,
              }}
            >
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 6,
                  background: 'rgba(74,222,128,0.12)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 12,
                }}
              >
                <i className={`fa-solid ${f.icon}`} style={{ color: '#4ade80' }} />
              </div>
              <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700 }}>{f.title}</h3>
              <p style={{ margin: '8px 0 0', color: '#9aa0a6', fontSize: 12, lineHeight: 1.5 }}>
                {f.desc}
              </p>
            </div>
          ))}
        </div>
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
        {'>'} FlowLab — Sistema Financiero Visual & Páginas Clásicas Restauradas
      </footer>
    </div>
  )
}
