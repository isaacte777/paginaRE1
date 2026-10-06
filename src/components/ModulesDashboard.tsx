import { useState } from 'react'

export default function ModulesDashboard() {
  const [copiedText, setCopiedText] = useState<string | null>(null)

  const copyText = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedText(text)
      setTimeout(() => setCopiedText(null), 2000)
    })
  }

  const modules = [
    {
      icon: '[P]',
      title: 'CSS · Styling',
      count: '4 files',
      files: ['theme.css', 'layout.css', 'nodes.css', 'ui.css']
    },
    {
      icon: '[S]',
      title: 'Core · Foundation',
      count: '2 files',
      files: ['constants.js', 'state.js']
    },
    {
      icon: '[T]',
      title: 'Utils · Helpers',
      count: '2 files',
      files: ['helpers.js', 'storage.js']
    },
    {
      icon: '[R]',
      title: 'Canvas · Rendering',
      count: '3 files',
      files: ['render.js', 'viewport.js', 'minimap.js']
    },
    {
      icon: '[I]',
      title: 'Interaction · User',
      count: '3 files',
      files: ['gestures.js', 'selection.js', 'editing.js']
    },
    {
      icon: '[A]',
      title: 'Features · Advanced',
      count: '4 files',
      files: ['history.js', 'templates.js', 'export.js', 'execution.js']
    },
    {
      icon: '[U]',
      title: 'UI · Components',
      count: '3 files',
      files: ['panel.js', 'console.js', 'footer.js']
    },
    {
      icon: '[O]',
      title: 'App · Orchestrator',
      count: '1 file',
      files: ['app.js']
    }
  ]

  const dependencies = [
    { phase: 'Phase 1', files: ['constants.js', 'state.js'] },
    { phase: 'Phase 2', files: ['helpers.js', 'storage.js'] },
    { phase: 'Phase 3', files: ['render.js', 'viewport.js', 'minimap.js'] },
    { phase: 'Phase 4', files: ['gestures.js', 'selection.js', 'editing.js'] },
    { phase: 'Phase 5', files: ['history.js', 'templates.js', 'export.js', 'execution.js'] },
    { phase: 'Phase 6', files: ['panel.js', 'console.js'] },
    { phase: 'Phase 7', files: ['app.js'] }
  ]

  return (
    <div style={{
      flex: 1,
      overflow: 'auto',
      background: '#0b0c0d',
      color: '#c9ccd0',
      fontFamily: "'JetBrains Mono', monospace",
      fontSize: '13px',
      padding: '20px'
    }}>
      {/* Header */}
      <div style={{ marginBottom: '40px' }}>
        <h1 style={{
          fontSize: '28px',
          fontWeight: 700,
          marginBottom: '8px',
          color: '#e5e5e5',
          textShadow: '0 0 20px rgba(255,255,255,0.1)'
        }}>
          FlowLab · Modules Dashboard
        </h1>
        <p style={{
          color: '#666',
          fontSize: '12px',
          textTransform: 'uppercase',
          letterSpacing: '2px'
        }}>
          Centro de control · paginaRE modularizado
        </p>
      </div>

      {/* Stats Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '15px',
        marginBottom: '40px'
      }}>
        <div style={{
          background: '#1a1a1a',
          border: '1px solid #333',
          borderRadius: '4px',
          padding: '15px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}>
          <span style={{ color: '#666', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px' }}>Total Modules</span>
          <span style={{ fontSize: '24px', fontWeight: 700, color: '#e5e5e5' }}>19</span>
          <span style={{ fontSize: '11px', color: '#666' }}>Fully organized</span>
        </div>
        <div style={{
          background: '#1a1a1a',
          border: '1px solid #333',
          borderRadius: '4px',
          padding: '15px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}>
          <span style={{ color: '#666', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px' }}>CSS Files</span>
          <span style={{ fontSize: '24px', fontWeight: 700, color: '#e5e5e5' }}>4</span>
          <span style={{ fontSize: '11px', color: '#666' }}>By responsibility</span>
        </div>
        <div style={{
          background: '#1a1a1a',
          border: '1px solid #333',
          borderRadius: '4px',
          padding: '15px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}>
          <span style={{ color: '#666', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px' }}>JS Files</span>
          <span style={{ fontSize: '24px', fontWeight: 700, color: '#e5e5e5' }}>15</span>
          <span style={{ fontSize: '11px', color: '#666' }}>7 categories</span>
        </div>
        <div style={{
          background: '#1a1a1a',
          border: '1px solid #333',
          borderRadius: '4px',
          padding: '15px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}>
          <span style={{ color: '#666', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px' }}>Status</span>
          <span style={{ fontSize: '24px', fontWeight: 700, color: '#d4d4d4' }}>[+] Ready</span>
          <span style={{ fontSize: '11px', color: '#666' }}>All modules active</span>
        </div>
      </div>

      {/* Modules Container */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '20px',
        marginBottom: '40px'
      }}>
        {modules.map((module, idx) => (
          <div key={idx} style={{
            background: '#1a1a1a',
            border: '1px solid #333',
            borderRadius: '4px',
            overflow: 'hidden'
          }}>
            <div style={{
              background: '#222',
              padding: '12px 15px',
              borderBottom: '1px solid #333',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              <div style={{
                width: '20px',
                height: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '12px'
              }}>
                {module.icon}
              </div>
              <div style={{
                fontWeight: 600,
                color: '#e5e5e5',
                flex: 1
              }}>
                {module.title}
              </div>
              <div style={{
                background: '#1a1a1a',
                padding: '2px 8px',
                borderRadius: '3px',
                fontSize: '11px',
                color: '#666'
              }}>
                {module.count}
              </div>
            </div>
            <div style={{ padding: 0 }}>
              {module.files.map((file, fileIdx) => (
                <div key={fileIdx} style={{
                  padding: '10px 15px',
                  borderBottom: fileIdx < module.files.length - 1 ? '1px solid #333' : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  cursor: 'pointer',
                  transition: 'background 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#222'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <div style={{
                    fontSize: '12px',
                    color: '#666',
                    minWidth: '15px',
                    textAlign: 'center'
                  }}>
                    [F]
                  </div>
                  <div style={{
                    flex: 1,
                    fontWeight: 500,
                    color: '#c9ccd0',
                    fontFamily: "'JetBrains Mono', monospace"
                  }}>
                    {file}
                  </div>
                  <div style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: '#10b981'
                  }}></div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Hierarchy View */}
      <div style={{
        background: '#1a1a1a',
        border: '1px solid #333',
        borderRadius: '4px',
        padding: '20px',
        marginBottom: '40px',
        fontSize: '12px',
        overflowX: 'auto'
      }}>
        <h3 style={{ color: '#e5e5e5', marginBottom: '15px', fontSize: '14px' }}>📁 Directory Structure</h3>
        <div style={{ fontFamily: "'JetBrains Mono', monospace" }}>
          <div style={{ marginBottom: '4px', color: '#c9ccd0' }}>
            <span style={{ display: 'inline-block', width: '20px', textAlign: 'center', color: '#333' }}>├</span>
            <span style={{ display: 'inline-block', width: '12px', textAlign: 'center', color: '#666' }}>[D]</span>
            <span style={{ color: '#e5e5e5' }}>paginaRE/</span>
          </div>
          <div style={{ marginBottom: '4px', color: '#c9ccd0' }}>
            <span style={{ display: 'inline-block', width: '20px', textAlign: 'center', color: '#333' }}>│</span>
            <span style={{ display: 'inline-block', width: '20px', textAlign: 'center', color: '#333' }}>├</span>
            <span style={{ display: 'inline-block', width: '12px', textAlign: 'center', color: '#666' }}>[F]</span>
            <span style={{ color: '#a3a3a3' }}>coordination.html</span>
          </div>
          <div style={{ marginBottom: '4px', color: '#c9ccd0' }}>
            <span style={{ display: 'inline-block', width: '20px', textAlign: 'center', color: '#333' }}>│</span>
            <span style={{ display: 'inline-block', width: '20px', textAlign: 'center', color: '#333' }}>├</span>
            <span style={{ display: 'inline-block', width: '12px', textAlign: 'center', color: '#666' }}>[D]</span>
            <span style={{ color: '#e5e5e5' }}>css/</span>
          </div>
          <div style={{ marginBottom: '4px', color: '#c9ccd0' }}>
            <span style={{ display: 'inline-block', width: '20px', textAlign: 'center', color: '#333' }}>│</span>
            <span style={{ display: 'inline-block', width: '20px', textAlign: 'center', color: '#333' }}>│</span>
            <span style={{ display: 'inline-block', width: '20px', textAlign: 'center', color: '#333' }}>├</span>
            <span style={{ display: 'inline-block', width: '12px', textAlign: 'center', color: '#666' }}>[F]</span>
            <span style={{ color: '#a3a3a3' }}>theme.css</span>
          </div>
          <div style={{ marginBottom: '4px', color: '#c9ccd0' }}>
            <span style={{ display: 'inline-block', width: '20px', textAlign: 'center', color: '#333' }}>│</span>
            <span style={{ display: 'inline-block', width: '20px', textAlign: 'center', color: '#333' }}>│</span>
            <span style={{ display: 'inline-block', width: '20px', textAlign: 'center', color: '#333' }}>├</span>
            <span style={{ display: 'inline-block', width: '12px', textAlign: 'center', color: '#666' }}>[F]</span>
            <span style={{ color: '#a3a3a3' }}>layout.css</span>
          </div>
          <div style={{ marginBottom: '4px', color: '#c9ccd0' }}>
            <span style={{ display: 'inline-block', width: '20px', textAlign: 'center', color: '#333' }}>│</span>
            <span style={{ display: 'inline-block', width: '20px', textAlign: 'center', color: '#333' }}>│</span>
            <span style={{ display: 'inline-block', width: '20px', textAlign: 'center', color: '#333' }}>├</span>
            <span style={{ display: 'inline-block', width: '12px', textAlign: 'center', color: '#666' }}>[F]</span>
            <span style={{ color: '#a3a3a3' }}>nodes.css</span>
          </div>
          <div style={{ marginBottom: '4px', color: '#c9ccd0' }}>
            <span style={{ display: 'inline-block', width: '20px', textAlign: 'center', color: '#333' }}>│</span>
            <span style={{ display: 'inline-block', width: '20px', textAlign: 'center', color: '#333' }}>│</span>
            <span style={{ display: 'inline-block', width: '20px', textAlign: 'center', color: '#333' }}>└</span>
            <span style={{ display: 'inline-block', width: '12px', textAlign: 'center', color: '#666' }}>[F]</span>
            <span style={{ color: '#a3a3a3' }}>ui.css</span>
          </div>
          <div style={{ marginBottom: '4px', color: '#c9ccd0' }}>
            <span style={{ display: 'inline-block', width: '20px', textAlign: 'center', color: '#333' }}>│</span>
            <span style={{ display: 'inline-block', width: '20px', textAlign: 'center', color: '#333' }}>├</span>
            <span style={{ display: 'inline-block', width: '12px', textAlign: 'center', color: '#666' }}>[D]</span>
            <span style={{ color: '#e5e5e5' }}>js/</span>
          </div>
          <div style={{ marginBottom: '4px', color: '#c9ccd0' }}>
            <span style={{ display: 'inline-block', width: '20px', textAlign: 'center', color: '#333' }}>│</span>
            <span style={{ display: 'inline-block', width: '20px', textAlign: 'center', color: '#333' }}>│</span>
            <span style={{ display: 'inline-block', width: '20px', textAlign: 'center', color: '#333' }}>├</span>
            <span style={{ display: 'inline-block', width: '12px', textAlign: 'center', color: '#666' }}>[D]</span>
            <span style={{ color: '#e5e5e5' }}>core/</span>
            <span style={{ display: 'inline-block', width: '12px', textAlign: 'center', color: '#888' }}>(constants, state)</span>
          </div>
          <div style={{ marginBottom: '4px', color: '#c9ccd0' }}>
            <span style={{ display: 'inline-block', width: '20px', textAlign: 'center', color: '#333' }}>│</span>
            <span style={{ display: 'inline-block', width: '20px', textAlign: 'center', color: '#333' }}>│</span>
            <span style={{ display: 'inline-block', width: '20px', textAlign: 'center', color: '#333' }}>├</span>
            <span style={{ display: 'inline-block', width: '12px', textAlign: 'center', color: '#666' }}>[D]</span>
            <span style={{ color: '#e5e5e5' }}>utils/</span>
            <span style={{ display: 'inline-block', width: '12px', textAlign: 'center', color: '#888' }}>(helpers, storage)</span>
          </div>
          <div style={{ marginBottom: '4px', color: '#c9ccd0' }}>
            <span style={{ display: 'inline-block', width: '20px', textAlign: 'center', color: '#333' }}>│</span>
            <span style={{ display: 'inline-block', width: '20px', textAlign: 'center', color: '#333' }}>│</span>
            <span style={{ display: 'inline-block', width: '20px', textAlign: 'center', color: '#333' }}>├</span>
            <span style={{ display: 'inline-block', width: '12px', textAlign: 'center', color: '#666' }}>[D]</span>
            <span style={{ color: '#e5e5e5' }}>canvas/</span>
            <span style={{ display: 'inline-block', width: '12px', textAlign: 'center', color: '#888' }}>(render, viewport, minimap)</span>
          </div>
          <div style={{ marginBottom: '4px', color: '#c9ccd0' }}>
            <span style={{ display: 'inline-block', width: '20px', textAlign: 'center', color: '#333' }}>│</span>
            <span style={{ display: 'inline-block', width: '20px', textAlign: 'center', color: '#333' }}>│</span>
            <span style={{ display: 'inline-block', width: '20px', textAlign: 'center', color: '#333' }}>├</span>
            <span style={{ display: 'inline-block', width: '12px', textAlign: 'center', color: '#666' }}>[D]</span>
            <span style={{ color: '#e5e5e5' }}>interaction/</span>
            <span style={{ display: 'inline-block', width: '12px', textAlign: 'center', color: '#888' }}>(gestures, selection, editing)</span>
          </div>
          <div style={{ marginBottom: '4px', color: '#c9ccd0' }}>
            <span style={{ display: 'inline-block', width: '20px', textAlign: 'center', color: '#333' }}>│</span>
            <span style={{ display: 'inline-block', width: '20px', textAlign: 'center', color: '#333' }}>│</span>
            <span style={{ display: 'inline-block', width: '20px', textAlign: 'center', color: '#333' }}>├</span>
            <span style={{ display: 'inline-block', width: '12px', textAlign: 'center', color: '#666' }}>[D]</span>
            <span style={{ color: '#e5e5e5' }}>features/</span>
            <span style={{ display: 'inline-block', width: '12px', textAlign: 'center', color: '#888' }}>(history, templates, export, execution)</span>
          </div>
          <div style={{ marginBottom: '4px', color: '#c9ccd0' }}>
            <span style={{ display: 'inline-block', width: '20px', textAlign: 'center', color: '#333' }}>│</span>
            <span style={{ display: 'inline-block', width: '20px', textAlign: 'center', color: '#333' }}>│</span>
            <span style={{ display: 'inline-block', width: '20px', textAlign: 'center', color: '#333' }}>├</span>
            <span style={{ display: 'inline-block', width: '12px', textAlign: 'center', color: '#666' }}>[D]</span>
            <span style={{ color: '#e5e5e5' }}>ui/</span>
            <span style={{ display: 'inline-block', width: '12px', textAlign: 'center', color: '#888' }}>(panel, console, footer)</span>
          </div>
          <div style={{ marginBottom: '4px', color: '#c9ccd0' }}>
            <span style={{ display: 'inline-block', width: '20px', textAlign: 'center', color: '#333' }}>│</span>
            <span style={{ display: 'inline-block', width: '20px', textAlign: 'center', color: '#333' }}>│</span>
            <span style={{ display: 'inline-block', width: '20px', textAlign: 'center', color: '#333' }}>└</span>
            <span style={{ display: 'inline-block', width: '12px', textAlign: 'center', color: '#666' }}>[F]</span>
            <span style={{ color: '#a3a3a3' }}>app.js</span>
            <span style={{ display: 'inline-block', width: '12px', textAlign: 'center', color: '#888' }}>(orchestrator)</span>
          </div>
        </div>
      </div>

      {/* Dependency Graph */}
      <div style={{
        background: '#1a1a1a',
        border: '1px solid #333',
        borderRadius: '4px',
        padding: '20px',
        marginBottom: '40px'
      }}>
        <h3 style={{ color: '#e5e5e5', marginBottom: '15px', fontSize: '14px' }}>[S] Module Loading Order</h3>
        {dependencies.map((dep, idx) => (
          <div key={idx} style={{
            display: 'flex',
            alignItems: 'center',
            gap: '15px',
            marginBottom: '12px',
            padding: '10px',
            background: '#222',
            borderRadius: '3px',
            borderLeft: '2px solid #666'
          }}>
            <div style={{
              minWidth: '120px',
              fontWeight: 600,
              color: '#e5e5e5'
            }}>
              {dep.phase}:
            </div>
            <div style={{ color: '#666' }}>{'>'}</div>
            <div style={{
              flex: 1,
              display: 'flex',
              gap: '8px',
              flexWrap: 'wrap'
            }}>
              {dep.files.map((file, fileIdx) => (
                <span key={fileIdx} style={{
                  background: '#1a1a1a',
                  padding: '4px 8px',
                  borderRadius: '3px',
                  border: '1px solid #333',
                  fontSize: '11px',
                  color: '#a3a3a3'
                }}>
                  {file}
                </span>
              ))}
              {idx === dependencies.length - 1 && (
                <span style={{ color: '#d4d4d4' }}>{'>'} Ready</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Quick Links */}
      <div style={{
        background: '#1a1a1a',
        border: '1px solid #333',
        borderRadius: '4px',
        padding: '20px',
        marginBottom: '40px'
      }}>
        <h3 style={{ color: '#e5e5e5', marginBottom: '15px', fontSize: '14px' }}>[L] Quick Access</h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '10px'
        }}>
          <button
            onClick={() => copyText('C:\\xampp\\htdocs\\paginaRE')}
            style={{
              padding: '12px',
              background: '#222',
              border: '1px solid #333',
              borderRadius: '3px',
              color: '#e5e5e5',
              cursor: 'pointer',
              transition: 'all 0.2s',
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '11px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#e5e5e5'
              e.currentTarget.style.background = '#1a1a1a'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#333'
              e.currentTarget.style.background = '#222'
            }}
          >
            [K] Copy Path
          </button>
          <button
            onClick={() => copyText('http://localhost/paginaRE/coordination.html')}
            style={{
              padding: '12px',
              background: '#222',
              border: '1px solid #333',
              borderRadius: '3px',
              color: '#e5e5e5',
              cursor: 'pointer',
              transition: 'all 0.2s',
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '11px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#e5e5e5'
              e.currentTarget.style.background = '#1a1a1a'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#333'
              e.currentTarget.style.background = '#222'
            }}
          >
            [L] Copy URL
          </button>
        </div>
        {copiedText && (
          <div style={{
            marginTop: '10px',
            padding: '8px',
            background: '#10b981',
            color: '#fff',
            borderRadius: '3px',
            fontSize: '11px',
            textAlign: 'center'
          }}>
            [+] Copied: {copiedText}
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{
        color: '#666',
        fontSize: '11px',
        textAlign: 'center',
        marginTop: '40px',
        paddingTop: '20px',
        borderTop: '1px solid #333'
      }}>
        <p>FlowLab v3 · Centro de Control · paginaRE Modularizado</p>
        <p style={{ marginTop: '10px', fontSize: '10px', color: '#666' }}>
          All 19 modules organized by responsibility · Ready for Claude + Qwen collaboration
        </p>
      </div>
    </div>
  )
}
