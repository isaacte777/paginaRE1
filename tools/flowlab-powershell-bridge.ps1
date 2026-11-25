<#
.SYNOPSIS
  Puente local de PowerShell para la Terminal Integrada de FlowLab (paginaRE).
.DESCRIPTION
  Escucha exclusivamente en http://127.0.0.1:8765/ (solo tu propia PC) para que
  FlowLab pueda ejecutar comandos reales en tu sesión de PowerShell igual que la
  terminal integrada de Visual Studio Code, manteniendo directorio actual y variables.
.EXAMPLE
  powershell -ExecutionPolicy Bypass -File .\tools\flowlab-powershell-bridge.ps1
#>

param(
  [int]$Port = 8765,
  [string]$StartDir = $PWD.Path,
  [string]$Token = ""
)

$ErrorActionPreference = "Continue"
[Console]::InputEncoding  = [System.Text.Encoding]::UTF8
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding           = [System.Text.Encoding]::UTF8

if ($StartDir -and (Test-Path -LiteralPath $StartDir)) {
  Set-Location -LiteralPath $StartDir
}

$prefix = "http://127.0.0.1:$Port/"
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add($prefix)

try {
  $listener.Start()
} catch {
  Write-Host "[FlowLab] No se pudo abrir $prefix : $($_.Exception.Message)" -ForegroundColor Red
  exit 1
}

Write-Host "==========================================================" -ForegroundColor Green
Write-Host " FlowLab PowerShell Bridge activo en $prefix" -ForegroundColor Green
Write-Host " Directorio inicial: $((Get-Location).Path)" -ForegroundColor Gray
Write-Host " Presiona Ctrl+C en esta ventana para cerrar el puente." -ForegroundColor DarkGray
Write-Host "==========================================================" -ForegroundColor Green

function Send-JsonResponse($response, [int]$statusCode, $hashtable) {
  $json = $hashtable | ConvertTo-Json -Depth 6 -Compress
  $bytes = [System.Text.Encoding]::UTF8.GetBytes($json)
  $response.StatusCode = $statusCode
  $response.ContentType = "application/json; charset=utf-8"
  $response.ContentLength64 = $bytes.Length
  $response.OutputStream.Write($bytes, 0, $bytes.Length)
  $response.OutputStream.Close()
}

try {
  while ($listener.IsListening) {
    $ctx = $listener.GetContext()
    $req = $ctx.Request
    $res = $ctx.Response

    # Cabeceras CORS + Chrome Private Network Access (solo loopback local)
    $origin = $req.Headers["Origin"]
    $res.Headers.Add("Access-Control-Allow-Origin", $(if ($origin) { $origin } else { "*" }))
    $res.Headers.Add("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
    $res.Headers.Add("Access-Control-Allow-Headers", "Content-Type, X-FlowLab-Token")
    $res.Headers.Add("Access-Control-Allow-Private-Network", "true")
    $res.Headers.Add("Cache-Control", "no-store")

    if ($req.HttpMethod -eq "OPTIONS") {
      $res.StatusCode = 204
      $res.OutputStream.Close()
      continue
    }

    if ($Token -ne "" -and $req.Headers["X-FlowLab-Token"] -ne $Token) {
      Send-JsonResponse $res 401 @{ ok = $false; error = "Token de puente inválido." }
      continue
    }

    $path = $req.Url.AbsolutePath.TrimEnd("/")
    if ($path -eq "" -or $path -eq "/api/terminal" -or $path -eq "/terminal") {
      if ($req.HttpMethod -eq "GET") {
        $entries = @()
        try {
          $entries = Get-ChildItem -LiteralPath (Get-Location).Path -Force -ErrorAction SilentlyContinue |
            Select-Object -First 120 |
            ForEach-Object { if ($_.PSIsContainer) { "$($_.Name)\" } else { $_.Name } }
        } catch {}

        Send-JsonResponse $res 200 @{
          ok      = $true
          mode    = "ps-bridge"
          shell   = "PowerShell $($PSVersionTable.PSVersion)"
          os      = "Windows"
          cwd     = (Get-Location).Path
          user    = $env:USERNAME
          host    = $env:COMPUTERNAME
          entries = $entries
        }
        continue
      }

      if ($req.HttpMethod -eq "POST") {
        $reader = New-Object System.IO.StreamReader($req.InputStream, [System.Text.Encoding]::UTF8)
        $rawBody = $reader.ReadToEnd()
        $reader.Close()

        $payload = $null
        try { $payload = $rawBody | ConvertFrom-Json } catch {}

        $cmdText = if ($payload -and $payload.command) { [string]$payload.command } else { "" }
        $reqCwd  = if ($payload -and $payload.cwd)     { [string]$payload.cwd }     else { "" }

        if ($reqCwd -ne "" -and (Test-Path -LiteralPath $reqCwd)) {
          try { Set-Location -LiteralPath $reqCwd } catch {}
        }

        if ([string]::IsNullOrWhiteSpace($cmdText)) {
          Send-JsonResponse $res 200 @{
            ok       = $true
            stdout   = ""
            stderr   = ""
            exitCode = 0
            cwd      = (Get-Location).Path
            shell    = "PowerShell $($PSVersionTable.PSVersion)"
          }
          continue
        }

        $sw = [System.Diagnostics.Stopwatch]::StartNew()
        $stdoutText = ""
        $stderrText = ""
        $exitCode = 0
        $global:LASTEXITCODE = 0

        try {
          $scriptBlock = [ScriptBlock]::Create($cmdText)
          $outputObjects = & $scriptBlock 2>&1
          $stdLines = New-Object System.Collections.Generic.List[string]
          $errLines = New-Object System.Collections.Generic.List[string]

          foreach ($item in $outputObjects) {
            if ($null -eq $item) { continue }
            if ($item -is [System.Management.Automation.ErrorRecord]) {
              $errLines.Add(($item | Out-String -Width 140).TrimEnd("`r", "`n"))
            } else {
              $stdLines.Add(($item | Out-String -Width 140).TrimEnd("`r", "`n"))
            }
          }

          $stdoutText = ($stdLines -join "`n")
          $stderrText = ($errLines -join "`n")
          if ($null -ne $global:LASTEXITCODE -and $global:LASTEXITCODE -ne 0) {
            $exitCode = [int]$global:LASTEXITCODE
          } elseif ($errLines.Count -gt 0) {
            $exitCode = 1
          }
        } catch {
          $stderrText = ($_ | Out-String -Width 140).TrimEnd("`r", "`n")
          $exitCode = 1
        }
        $sw.Stop()

        $entries = @()
        try {
          $entries = Get-ChildItem -LiteralPath (Get-Location).Path -Force -ErrorAction SilentlyContinue |
            Select-Object -First 120 |
            ForEach-Object { if ($_.PSIsContainer) { "$($_.Name)\" } else { $_.Name } }
        } catch {}

        Send-JsonResponse $res 200 @{
          ok         = $true
          stdout     = $stdoutText
          stderr     = $stderrText
          exitCode   = $exitCode
          cwd        = (Get-Location).Path
          durationMs = [int]$sw.ElapsedMilliseconds
          shell      = "PowerShell $($PSVersionTable.PSVersion)"
          entries    = $entries
        }
        continue
      }
    }

    Send-JsonResponse $res 404 @{ ok = $false; error = "Ruta no encontrada." }
  }
} finally {
  if ($listener.IsListening) { $listener.Stop() }
  $listener.Close()
}
