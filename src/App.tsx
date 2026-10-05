function App() {
  const copyText = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      alert('Copied: ' + text);
    }).catch(() => {
      const el = document.createElement('textarea');
      el.value = text;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      alert('Copied: ' + text);
    });
  }

  return (
    <div style={{
      background: '#0f0f0f',
      color: '#e0e0e0',
      fontFamily: "'JetBrains Mono', 'Courier New', monospace",
      fontSize: '13px',
      lineHeight: '1.6',
      padding: '20px',
      minHeight: '100vh'
    }}>
      <header style={{ marginBottom: '40px' }}>
        <h1 style={{
          fontSize: '28px',
          fontWeight: 700,
          marginBottom: '8px',
          color: '#00d9ff',
          textShadow: '0 0 20px rgba(0, 217, 255, 0.2)'
        }}>
          FlowLab · Modules Dashboard
        </h1>
        <p style={{
          color: '#a0a0a0',
          fontSize: '12px',
          textTransform: 'uppercase',
          letterSpacing: '2px'
        }}>
          Centro de control · paginaRE modularización
        </p>
      </header>

      {/* Stats Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '15px',
        marginBottom: '40px'
      }}>
        {[
          { label: 'Total Módulos', value: '19', subtext: 'Fully organized' },
          { label: 'CSS Files', value: '4', subtext: 'By responsibility' },
          { label: 'JS Files', value: '15', subtext: '7 categories' },
          { label: 'Status', value: '✅ Ready', subtext: 'All modules active', valueColor: '#00cc66' },
        ].map((stat, i) => (
          <div key={i} style={{
            background: '#1a1a1a',
            border: '1px solid #333333',
            borderRadius: '4px',
            padding: '15px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}>
            <span style={{ color: '#a0a0a0', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px' }}>
              {stat.label}
            </span>
            <span style={{ fontSize: '24px', fontWeight: 700, color: stat.valueColor || '#00d9ff' }}>
              {stat.value}
            </span>
            <span style={{ fontSize: '11px', color: '#a0a0a0' }}>{stat.subtext}</span>
          </div>
        ))}
      </div>

      {/* Modules Container */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '20px',
        marginBottom: '40px'
      }}>
        {/* CSS Module */}
        <ModuleGroup icon="🎨" title="CSS · Styling" count="4 files" files={['theme.css', 'layout.css', 'nodes.css', 'ui.css']} />
        <ModuleGroup icon="⚙️" title="Core · Foundation" count="2 files" files={['constants.js', 'state.js']} />
        <ModuleGroup icon="🔧" title="Utils · Helpers" count="2 files" files={['helpers.js', 'storage.js']} />
        <ModuleGroup icon="🖼️" title="Canvas · Rendering" count="3 files" files={['render.js', 'viewport.js', 'minimap.js']} />
        <ModuleGroup icon="👆" title="Interaction · User" count="3 files" files={['gestures.js', 'selection.js', 'editing.js']} />
        <ModuleGroup icon="✨" title="Features · Advanced" count="4 files" files={['history.js', 'templates.js', 'export.js', 'execution.js']} />
        <ModuleGroup icon="🎨" title="UI · Components" count="3 files" files={['panel.js', 'console.js', 'footer.js']} />
        <ModuleGroup icon="🚀" title="App · Orchestrator" count="1 file" files={['app.js']} />
      </div>

      {/* Hierarchy View */}
      <div style={{
        background: '#1a1a1a',
        border: '1px solid #333333',
        borderRadius: '4px',
        padding: '20px',
        marginBottom: '40px',
        fontSize: '12px',
        overflowX: 'auto'
      }}>
        <h3 style={{ color: '#00d9ff', marginBottom: '15px', fontSize: '14px' }}>📁 Directory Structure</h3>
        <div style={{ fontFamily: "'JetBrains Mono', monospace" }}>
          <TreeItem indent={0} icon="📂" name="paginaRE/" isFolder />
          <TreeItem indent={1} icon="📄" name="coordination.html" />
          <TreeItem indent={1} icon="📂" name="🎨 css/" isFolder />
          <TreeItem indent={2} icon="📄" name="theme.css" fileColor="#ff7f50" />
          <TreeItem indent={2} icon="📄" name="layout.css" fileColor="#ff7f50" />
          <TreeItem indent={2} icon="📄" name="nodes.css" fileColor="#ff7f50" />
          <TreeItem indent={2} icon="📄" name="ui.css" fileColor="#ff7f50" />
          <TreeItem indent={1} icon="📂" name="📦 js/" isFolder />
          <TreeItem indent={2} icon="📂" name="📦 core/" isFolder extra="(constants, state)" />
          <TreeItem indent={2} icon="📂" name="🔧 utils/" isFolder extra="(helpers, storage)" />
          <TreeItem indent={2} icon="📂" name="🖼️ canvas/" isFolder extra="(render, viewport, minimap)" />
          <TreeItem indent={2} icon="📂" name="👆 interaction/" isFolder extra="(gestures, selection, editing)" />
          <TreeItem indent={2} icon="📂" name="✨ features/" isFolder extra="(history, templates, export, execution)" />
          <TreeItem indent={2} icon="📂" name="🎨 ui/" isFolder extra="(panel, console, footer)" />
          <TreeItem indent={2} icon="📦" name="app.js" fileColor="#ffd700" extra="(orchestrator)" />
        </div>
      </div>

      {/* Dependency Graph */}
      <div style={{
        background: '#1a1a1a',
        border: '1px solid #333333',
        borderRadius: '4px',
        padding: '20px',
        marginBottom: '40px'
      }}>
        <h3 style={{ color: '#00d9ff', marginBottom: '15px', fontSize: '14px' }}>⚡ Module Loading Order</h3>
        {[
          { phase: 'Phase 1', items: ['constants.js', 'state.js'] },
          { phase: 'Phase 2', items: ['helpers.js', 'storage.js'] },
          { phase: 'Phase 3', items: ['render.js', 'viewport.js', 'minimap.js'] },
          { phase: 'Phase 4', items: ['gestures.js', 'selection.js', 'editing.js'] },
          { phase: 'Phase 5', items: ['history.js', 'templates.js', 'export.js', 'execution.js'] },
          { phase: 'Phase 6', items: ['panel.js', 'console.js'] },
          { phase: 'Phase 7', items: ['app.js'], last: true },
        ].map((dep, i) => (
          <div key={i} style={{
            display: 'flex',
            alignItems: 'center',
            gap: '15px',
            marginBottom: '12px',
            padding: '10px',
            background: '#252525',
            borderRadius: '3px',
            borderLeft: '2px solid #00a3cc'
          }}>
            <div style={{ minWidth: '120px', fontWeight: 600, color: '#00d9ff' }}>{dep.phase}:</div>
            <div style={{ color: '#00a3cc' }}>→</div>
            <div style={{ flex: 1, display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {dep.items.map((item, j) => (
                <span key={j} style={{
                  background: '#1a1a1a',
                  padding: '4px 8px',
                  borderRadius: '3px',
                  border: '1px solid #333333',
                  fontSize: '11px',
                  color: '#a0a0a0'
                }}>
                  {item}
                </span>
              ))}
              {dep.last && <span style={{ color: '#00cc66' }}>✅ Ready</span>}
            </div>
          </div>
        ))}
      </div>

      {/* Quick Links */}
      <div style={{
        background: '#1a1a1a',
        border: '1px solid #333333',
        borderRadius: '4px',
        padding: '20px',
        marginBottom: '40px'
      }}>
        <h3 style={{ color: '#00d9ff', marginBottom: '15px', fontSize: '14px' }}>🔗 Quick Access</h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '10px'
        }}>
          <button
            onClick={() => copyText('C:\\xampp\\htdocs\\paginaRE')}
            style={linkBtnStyle}
          >
            📋 Copy Path
          </button>
          <button
            onClick={() => copyText('http://localhost/paginaRE/coordination.html')}
            style={linkBtnStyle}
          >
            🔗 Copy URL
          </button>
          <button
            onClick={() => alert('FlowLab would launch here')}
            style={linkBtnStyle}
          >
            🚀 Launch FlowLab
          </button>
          <button
            onClick={() => alert('Main App would open here')}
            style={linkBtnStyle}
          >
            📂 Main App
          </button>
        </div>
      </div>

      {/* Footer */}
      <footer style={{
        color: '#a0a0a0',
        fontSize: '11px',
        textAlign: 'center',
        marginTop: '40px',
        paddingTop: '20px',
        borderTop: '1px solid #333333'
      }}>
        <p>FlowLab v3 · Centro de Control · paginaRE Modularización</p>
        <p style={{ marginTop: '10px', fontSize: '10px', color: '#a0a0a0' }}>
          All 19 modules organized by responsibility · Ready for Cloud + Qwen collaboration
        </p>
      </footer>
    </div>
  )
}

const linkBtnStyle: React.CSSProperties = {
  padding: '12px',
  background: '#252525',
  border: '1px solid #333333',
  borderRadius: '3px',
  color: '#00d9ff',
  cursor: 'pointer',
  transition: 'all 0.2s',
  fontFamily: "'JetBrains Mono', monospace",
  fontSize: '11px',
  textDecoration: 'none',
  display: 'inline-block',
  textAlign: 'center'
}

interface ModuleGroupProps {
  icon: string
  title: string
  count: string
  files: string[]
}

function ModuleGroup({ icon, title, count, files }: ModuleGroupProps) {
  return (
    <div style={{
      background: '#1a1a1a',
      border: '1px solid #333333',
      borderRadius: '4px',
      overflow: 'hidden'
    }}>
      <div style={{
        background: '#252525',
        padding: '12px 15px',
        borderBottom: '1px solid #333333',
        display: 'flex',
        alignItems: 'center',
        gap: '10px'
      }}>
        <div style={{ width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px' }}>
          {icon}
        </div>
        <div style={{ fontWeight: 600, color: '#00d9ff', flex: 1 }}>{title}</div>
        <div style={{
          background: '#1a1a1a',
          padding: '2px 8px',
          borderRadius: '3px',
          fontSize: '11px',
          color: '#a0a0a0'
        }}>
          {count}
        </div>
      </div>
      <div style={{ padding: 0 }}>
        {files.map((file, i) => (
          <div key={i} style={{
            padding: '10px 15px',
            borderBottom: i < files.length - 1 ? '1px solid #333333' : 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            cursor: 'pointer',
            transition: 'background 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = '#252525'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
          >
            <div style={{ fontSize: '12px', color: '#00a3cc', minWidth: '15px', textAlign: 'center' }}>📦</div>
            <div style={{ flex: 1, fontWeight: 500, color: '#e0e0e0', fontFamily: "'JetBrains Mono', monospace" }}>{file}</div>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#00cc66' }}></div>
          </div>
        ))}
      </div>
    </div>
  )
}

interface TreeItemProps {
  indent: number
  icon: string
  name: string
  isFolder?: boolean
  fileColor?: string
  extra?: string
}

function TreeItem({ indent, icon, name, isFolder, fileColor, extra }: TreeItemProps) {
  return (
    <div style={{ marginBottom: '4px', color: '#e0e0e0', fontFamily: "'JetBrains Mono', monospace" }}>
      {Array.from({ length: indent }).map((_, i) => (
        <span key={i} style={{ display: 'inline-block', width: '20px', textAlign: 'center', color: '#333333' }}>
          {i === indent - 1 ? '└' : ' '}
        </span>
      ))}
      <span style={{ display: 'inline-block', width: '12px', textAlign: 'center', color: '#00a3cc' }}>{icon}</span>
      <span style={{ color: isFolder ? '#00d9ff' : (fileColor || '#a0a0a0') }}>{name}</span>
      {extra && <span style={{ color: '#888', marginLeft: '8px' }}>{extra}</span>}
    </div>
  )
}

export default App
