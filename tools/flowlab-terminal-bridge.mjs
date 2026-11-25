#!/usr/bin/env node
/**
 * FlowLab Local Terminal Bridge (Node.js)
 * Escucha exclusivamente en http://127.0.0.1:8765 para conectar la terminal
 * integrada del navegador con PowerShell (Windows) o bash/pwsh (Linux/macOS).
 *
 * Uso: npm run terminal
 */

import { spawn, spawnSync } from 'node:child_process'
import fs from 'node:fs'
import http from 'node:http'
import os from 'node:os'
import path from 'node:path'

const PORT = Number(process.env.FLOWLAB_PORT || 8765)
const TOKEN = process.env.FLOWLAB_TOKEN || ''
let currentCwd = process.cwd()
let activeChild = null

function hasBin(bin) {
  try {
    const cmd = process.platform === 'win32' ? 'where' : 'which'
    return spawnSync(cmd, [bin], { stdio: 'ignore' }).status === 0
  } catch {
    return false
  }
}

const isWin = process.platform === 'win32'
const hasPwsh = hasBin(isWin ? 'pwsh.exe' : 'pwsh')
const shellBin = hasPwsh ? (isWin ? 'pwsh.exe' : 'pwsh') : isWin ? 'powershell.exe' : '/bin/bash'
const isPowerShell = hasPwsh || isWin
const shellLabel = hasPwsh
  ? 'PowerShell 7 (pwsh)'
  : isWin
    ? 'Windows PowerShell'
    : 'Shell (bash)'

function listDirEntries(dir) {
  try {
    return fs
      .readdirSync(dir, { withFileTypes: true })
      .slice(0, 120)
      .map((d) => (d.isDirectory() ? d.name + path.sep : d.name))
  } catch {
    return []
  }
}

function sendJson(res, status, obj) {
  const payload = JSON.stringify(obj)
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(payload),
  })
  res.end(payload)
}

const server = http.createServer((req, res) => {
  const origin = req.headers.origin || '*'
  res.setHeader('Access-Control-Allow-Origin', origin)
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-FlowLab-Token')
  res.setHeader('Access-Control-Allow-Private-Network', 'true')
  res.setHeader('Cache-Control', 'no-store')

  if (req.method === 'OPTIONS') {
    res.writeHead(204)
    res.end()
    return
  }

  if (TOKEN && req.headers['x-flowlab-token'] !== TOKEN) {
    sendJson(res, 401, { ok: false, error: 'Token de puente inválido.' })
    return
  }

  const urlPath = (req.url || '/').split('?')[0].replace(/\/+$/, '') || '/'

  if (urlPath === '/api/terminal/kill' && req.method === 'POST') {
    if (activeChild) {
      try {
        activeChild.kill('SIGTERM')
      } catch {}
      activeChild = null
    }
    sendJson(res, 200, { ok: true, killed: true })
    return
  }

  if (urlPath === '/' || urlPath === '/api/terminal' || urlPath === '/terminal') {
    if (req.method === 'GET') {
      sendJson(res, 200, {
        ok: true,
        mode: 'node-bridge',
        shell: shellLabel,
        os: process.platform,
        cwd: currentCwd,
        host: os.hostname(),
        entries: listDirEntries(currentCwd),
      })
      return
    }

    if (req.method === 'POST') {
      let body = ''
      req.on('data', (c) => {
        body += c
      })
      req.on('end', () => {
        let payload = {}
        try {
          payload = JSON.parse(body || '{}')
        } catch {}

        const command = typeof payload.command === 'string' ? payload.command : ''
        if (payload.cwd && typeof payload.cwd === 'string' && fs.existsSync(payload.cwd)) {
          try {
            if (fs.statSync(payload.cwd).isDirectory()) currentCwd = path.resolve(payload.cwd)
          } catch {}
        }

        if (!command.trim()) {
          sendJson(res, 200, {
            ok: true,
            stdout: '',
            stderr: '',
            exitCode: 0,
            cwd: currentCwd,
            shell: shellLabel,
            entries: listDirEntries(currentCwd),
          })
          return
        }

        const t0 = Date.now()
        let args = []
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
          args = [
            '-NoLogo',
            '-NoProfile',
            '-NonInteractive',
            '-ExecutionPolicy',
            'Bypass',
            '-EncodedCommand',
            Buffer.from(psScript, 'utf16le').toString('base64'),
          ]
        } else {
          const bashScript = [
            'shopt -s expand_aliases 2>/dev/null || true',
            "alias dir='ls -la --color=never'",
            "alias Get-ChildItem='ls -la --color=never'",
            "alias Get-Location='pwd'",
            command,
            '__fl_code=$?',
            'printf "\\n__FLOWLAB_META__{\\"cwd\\":\\"%s\\",\\"code\\":%d}\\n" "$(pwd)" "$__fl_code"',
          ].join('\n')
          args = ['-c', bashScript]
        }

        let stdout = ''
        let stderr = ''
        const child = spawn(shellBin, args, {
          cwd: currentCwd,
          env: { ...process.env, TERM: 'dumb', FORCE_COLOR: '0', NO_COLOR: '1' },
        })
        activeChild = child

        child.stdout.on('data', (d) => {
          if (stdout.length < 250000) stdout += d.toString('utf8')
        })
        child.stderr.on('data', (d) => {
          if (stderr.length < 250000) stderr += d.toString('utf8')
        })
        child.on('error', (err) => {
          activeChild = null
          sendJson(res, 500, { ok: false, error: err.message })
        })
        child.on('close', (code) => {
          if (activeChild === child) activeChild = null
          let exitCode = typeof code === 'number' ? code : 0
          const metaMatch = stdout.match(/\r?\n?__FLOWLAB_META__(\{[^\r\n]+\})\s*$/)
          if (metaMatch) {
            stdout = stdout.slice(0, -metaMatch[0].length)
            try {
              const meta = JSON.parse(metaMatch[1])
              if (meta.cwd && fs.existsSync(meta.cwd)) currentCwd = meta.cwd
              if (typeof meta.code === 'number') exitCode = meta.code
            } catch {}
          }
          sendJson(res, 200, {
            ok: true,
            stdout: stdout.replace(/[\r\n]+$/, ''),
            stderr: stderr.replace(/[\r\n]+$/, ''),
            exitCode,
            cwd: currentCwd,
            durationMs: Date.now() - t0,
            shell: shellLabel,
            entries: listDirEntries(currentCwd),
          })
        })
      })
      return
    }
  }

  sendJson(res, 404, { ok: false, error: 'Ruta no encontrada.' })
})

server.listen(PORT, '127.0.0.1', () => {
  console.log('==========================================================')
  console.log(` FlowLab Terminal Bridge activo en http://127.0.0.1:${PORT}`)
  console.log(` Shell: ${shellLabel} | CWD: ${currentCwd}`)
  console.log('==========================================================')
})
