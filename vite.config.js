import { spawn, spawnSync } from 'node:child_process'
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

function terminalApiPlugin() {
  let currentCwd = process.cwd()
  let activeChild = null

  const hasCommand = (bin) => {
    try {
      const probe =
        process.platform === 'win32'
          ? spawnSync('where', [bin], { stdio: 'ignore' })
          : spawnSync('which', [bin], { stdio: 'ignore' })
      return probe.status === 0
    } catch {
      return false
    }
  }

  const hasPwsh = hasCommand(process.platform === 'win32' ? 'pwsh.exe' : 'pwsh')
  const isWin = process.platform === 'win32'
  const shellBin = hasPwsh
    ? isWin
      ? 'pwsh.exe'
      : 'pwsh'
    : isWin
      ? 'powershell.exe'
      : '/bin/bash'
  const isPowerShell = hasPwsh || isWin
  const shellLabel = hasPwsh
    ? 'PowerShell 7 (pwsh)'
    : isWin
      ? 'Windows PowerShell'
      : 'Shell (bash · alias PS)'

  const listDirEntries = (dir) => {
    try {
      return fs
        .readdirSync(dir, { withFileTypes: true })
        .slice(0, 120)
        .map((d) => (d.isDirectory() ? d.name + path.sep : d.name))
    } catch {
      return []
    }
  }

  return {
    name: 'flowlab-terminal-api',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const url = (req.url || '').split('?')[0]
        if (!url.endsWith('/api/terminal') && !url.endsWith('/api/terminal/kill')) {
          return next()
        }

        const origin = req.headers.origin || '*'
        res.setHeader('Access-Control-Allow-Origin', origin)
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-FlowLab-Token')
        res.setHeader('Access-Control-Allow-Private-Network', 'true')
        res.setHeader('Content-Type', 'application/json; charset=utf-8')
        res.setHeader('Cache-Control', 'no-store')

        if (req.method === 'OPTIONS') {
          res.statusCode = 204
          res.end()
          return
        }

        if (url.endsWith('/api/terminal/kill') && req.method === 'POST') {
          if (activeChild) {
            try {
              activeChild.kill('SIGTERM')
            } catch {}
            activeChild = null
          }
          res.statusCode = 200
          res.end(JSON.stringify({ ok: true, killed: true }))
          return
        }

        if (req.method === 'GET') {
          res.statusCode = 200
          res.end(
            JSON.stringify({
              ok: true,
              mode: 'vite-dev',
              shell: shellLabel,
              os: process.platform,
              cwd: currentCwd,
              host: os.hostname(),
              entries: listDirEntries(currentCwd),
            })
          )
          return
        }

        if (req.method !== 'POST') {
          res.statusCode = 405
          res.end(JSON.stringify({ ok: false, error: 'Método no permitido.' }))
          return
        }

        let body = ''
        req.on('data', (chunk) => {
          body += chunk
        })
        req.on('end', () => {
          let payload = {}
          try {
            payload = JSON.parse(body || '{}')
          } catch {}

          const command = typeof payload.command === 'string' ? payload.command : ''
          if (payload.cwd && typeof payload.cwd === 'string' && fs.existsSync(payload.cwd)) {
            try {
              if (fs.statSync(payload.cwd).isDirectory()) {
                currentCwd = path.resolve(payload.cwd)
              }
            } catch {}
          }

          if (!command.trim()) {
            res.statusCode = 200
            res.end(
              JSON.stringify({
                ok: true,
                stdout: '',
                stderr: '',
                exitCode: 0,
                cwd: currentCwd,
                shell: shellLabel,
                entries: listDirEntries(currentCwd),
              })
            )
            return
          }

          const t0 = Date.now()
          let spawnArgs = []

          if (isPowerShell) {
            const escapedCwd = currentCwd.replace(/'/g, "''")
            const psScript = [
              '[Console]::InputEncoding = [System.Text.Encoding]::UTF8',
              '[Console]::OutputEncoding = [System.Text.Encoding]::UTF8',
              '$OutputEncoding = [System.Text.Encoding]::UTF8',
              `Set-Location -LiteralPath '${escapedCwd}'`,
              '$global:LASTEXITCODE = 0',
              command,
              '$__flCode = if ($null -ne $global:LASTEXITCODE -and $global:LASTEXITCODE -ne 0) { [int]$global:LASTEXITCODE } elseif ($?) { 0 } else { 1 }',
              'Write-Output ("`n__FLOWLAB_META__" + (@{ cwd = (Get-Location).Path; code = $__flCode } | ConvertTo-Json -Compress))',
            ].join('\n')
            const encoded = Buffer.from(psScript, 'utf16le').toString('base64')
            spawnArgs = [
              '-NoLogo',
              '-NoProfile',
              '-NonInteractive',
              '-ExecutionPolicy',
              'Bypass',
              '-EncodedCommand',
              encoded,
            ]
          } else {
            const bashScript = [
              'shopt -s expand_aliases 2>/dev/null || true',
              "alias dir='ls -la --color=never'",
              "alias Get-ChildItem='ls -la --color=never'",
              "alias Get-Location='pwd'",
              "alias Set-Location='cd'",
              command,
              '__fl_code=$?',
              'printf "\\n__FLOWLAB_META__{\\"cwd\\":\\"%s\\",\\"code\\":%d}\\n" "$(pwd)" "$__fl_code"',
            ].join('\n')
            spawnArgs = ['-c', bashScript]
          }

          let stdout = ''
          let stderr = ''
          let finished = false

          const child = spawn(shellBin, spawnArgs, {
            cwd: currentCwd,
            env: { ...process.env, TERM: 'dumb', FORCE_COLOR: '0', NO_COLOR: '1' },
          })
          activeChild = child

          const killTimer = setTimeout(() => {
            if (!finished) {
              try {
                child.kill('SIGTERM')
              } catch {}
              stderr += '\n[Tiempo máximo de comando excedido: 60s]'
            }
          }, 60000)

          child.stdout.on('data', (d) => {
            if (stdout.length < 250000) stdout += d.toString('utf8')
          })
          child.stderr.on('data', (d) => {
            if (stderr.length < 250000) stderr += d.toString('utf8')
          })

          child.on('error', (err) => {
            clearTimeout(killTimer)
            finished = true
            activeChild = null
            res.statusCode = 500
            res.end(JSON.stringify({ ok: false, error: err.message }))
          })

          child.on('close', (code) => {
            clearTimeout(killTimer)
            finished = true
            if (activeChild === child) activeChild = null

            let exitCode = typeof code === 'number' ? code : 0
            const metaMatch = stdout.match(/\r?\n?__FLOWLAB_META__(\{[^\r\n]+\})\s*$/)
            if (metaMatch) {
              stdout = stdout.slice(0, -metaMatch[0].length)
              try {
                const meta = JSON.parse(metaMatch[1])
                if (meta.cwd && typeof meta.cwd === 'string' && fs.existsSync(meta.cwd)) {
                  currentCwd = meta.cwd
                }
                if (typeof meta.code === 'number') {
                  exitCode = meta.code
                }
              } catch {}
            }

            res.statusCode = 200
            res.end(
              JSON.stringify({
                ok: true,
                stdout: stdout.replace(/[\r\n]+$/, ''),
                stderr: stderr.replace(/[\r\n]+$/, ''),
                exitCode,
                cwd: currentCwd,
                durationMs: Date.now() - t0,
                shell: shellLabel,
                entries: listDirEntries(currentCwd),
              })
            )
          })
        })
      })
    },
  }
}

export default defineConfig({
  plugins: [react(), flowStateApiPlugin(), terminalApiPlugin()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    allowedHosts: true,
  },
})
