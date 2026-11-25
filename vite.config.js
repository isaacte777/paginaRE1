import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

function flowStateApiPlugin() {
  const storageFile = path.join(os.tmpdir(), 'paginaRE-flowlab-shared.json')
  const emptyProject = () => ({ revision: 0, updatedAt: null, state: null })

  const readProject = () => {
    try {
      if (!fs.existsSync(storageFile)) return emptyProject()
      const data = JSON.parse(fs.readFileSync(storageFile, 'utf8'))
      if (!data || typeof data !== 'object') return emptyProject()
      return {
        revision: Number.isInteger(data.revision) ? data.revision : 0,
        updatedAt: typeof data.updatedAt === 'string' ? data.updatedAt : null,
        state: data.state && typeof data.state === 'object' ? data.state : null,
      }
    } catch {
      return emptyProject()
    }
  }

  return {
    name: 'flow-state-api',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const url = (req.url || '').split('?')[0]
        if (!url.endsWith('/api/flow-state.php')) return next()

        res.setHeader('Content-Type', 'application/json; charset=utf-8')
        res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')

        if (req.method === 'OPTIONS') {
          res.setHeader('Allow', 'GET, POST, PUT, OPTIONS')
          res.statusCode = 204
          res.end()
          return
        }

        if (req.method === 'GET') {
          res.statusCode = 200
          res.end(JSON.stringify(readProject()))
          return
        }

        if (req.method !== 'POST' && req.method !== 'PUT') {
          res.setHeader('Allow', 'GET, POST, PUT, OPTIONS')
          res.statusCode = 405
          res.end(JSON.stringify({ error: 'Método no permitido.' }))
          return
        }

        let body = ''
        req.on('data', (chunk) => {
          body += chunk
        })
        req.on('end', () => {
          try {
            const payload = JSON.parse(body || '{}')
            const state = payload?.state
            if (
              !state ||
              !Array.isArray(state.nodes) ||
              !Array.isArray(state.edges) ||
              state.nodes.length > 500 ||
              state.edges.length > 1500
            ) {
              res.statusCode = 422
              res.end(JSON.stringify({ error: 'El estado compartido no es válido.' }))
              return
            }

            const current = readProject()
            const project = {
              revision: current.revision + 1,
              updatedAt: new Date().toISOString(),
              state: {
                nodes: state.nodes,
                edges: state.edges,
                title:
                  typeof state.title === 'string'
                    ? state.title.slice(0, 160)
                    : 'orquestador_paginaRE',
                isBlankCanvas: Boolean(state.isBlankCanvas),
              },
            }

            fs.writeFileSync(storageFile, JSON.stringify(project), 'utf8')
            res.statusCode = 200
            res.end(JSON.stringify(project))
          } catch {
            res.statusCode = 422
            res.end(JSON.stringify({ error: 'El estado compartido no es válido.' }))
          }
        })
      })
    },
  }
}

export default defineConfig({
  plugins: [react(), flowStateApiPlugin()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    allowedHosts: true,
  },
})
