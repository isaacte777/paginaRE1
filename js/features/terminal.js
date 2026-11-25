// TERMINAL: Terminal integrada estilo VS Code con conexión real a PowerShell (PC Local / XAMPP / Vite)

(function () {
  const STORAGE_CFG_KEY = 'flowlab-ps-terminal-cfg-v1';
  const STORAGE_HIST_KEY = 'flowlab-ps-terminal-hist-v1';

  const PS_CMDLETS = [
    'Get-ChildItem',
    'Set-Location',
    'Get-Location',
    'Get-Content',
    'Set-Content',
    'Get-Process',
    'Stop-Process',
    'New-Item',
    'Remove-Item',
    'Copy-Item',
    'Move-Item',
    'Invoke-RestMethod',
    'Invoke-WebRequest',
    'Select-Object',
    'Where-Object',
    'Test-Path',
    'Clear-Host',
    'git status',
    'git log --oneline -n 10',
    'git branch',
    'npm run dev',
    'npm run build',
    'node -v',
    'python --version',
    'flowlab help',
    'flowlab status',
    'flowlab nodes',
    'flowlab run',
    'flowlab add '
  ];

  // Script autónomo .ps1 para descargar con 1 clic en Windows sin instalar nada extra
  const EMBEDDED_PS1_SCRIPT = [
    '<#',
    '  FlowLab PowerShell Bridge (Local 127.0.0.1:8765)',
    '  Ejecutar en Windows PowerShell:',
    '    powershell -ExecutionPolicy Bypass -File .\\flowlab-powershell-bridge.ps1',
    '#>',
    'param([int]$Port = 8765, [string]$StartDir = $PWD.Path, [string]$Token = "")',
    '$ErrorActionPreference = "Continue"',
    '[Console]::InputEncoding  = [System.Text.Encoding]::UTF8',
    '[Console]::OutputEncoding = [System.Text.Encoding]::UTF8',
    '$OutputEncoding           = [System.Text.Encoding]::UTF8',
    'if ($StartDir -and (Test-Path -LiteralPath $StartDir)) { Set-Location -LiteralPath $StartDir }',
    '$prefix = "http://127.0.0.1:$Port/"',
    '$listener = New-Object System.Net.HttpListener',
    '$listener.Prefixes.Add($prefix)',
    '$listener.Start()',
    'Write-Host "FlowLab PowerShell Bridge activo en $prefix ($((Get-Location).Path))" -ForegroundColor Green',
    'Write-Host "Presiona Ctrl+C para detener." -ForegroundColor DarkGray',
    'function Send-Json($res, [int]$code, $obj) {',
    '  $bytes = [System.Text.Encoding]::UTF8.GetBytes(($obj | ConvertTo-Json -Depth 6 -Compress))',
    '  $res.StatusCode = $code',
    '  $res.ContentType = "application/json; charset=utf-8"',
    '  $res.ContentLength64 = $bytes.Length',
    '  $res.OutputStream.Write($bytes, 0, $bytes.Length)',
    '  $res.OutputStream.Close()',
    '}',
    'try {',
    '  while ($listener.IsListening) {',
    '    $ctx = $listener.GetContext()',
    '    $req = $ctx.Request; $res = $ctx.Response',
    '    $origin = $req.Headers["Origin"]',
    '    $res.Headers.Add("Access-Control-Allow-Origin", $(if ($origin) { $origin } else { "*" }))',
    '    $res.Headers.Add("Access-Control-Allow-Methods", "GET, POST, OPTIONS")',
    '    $res.Headers.Add("Access-Control-Allow-Headers", "Content-Type, X-FlowLab-Token")',
    '    $res.Headers.Add("Access-Control-Allow-Private-Network", "true")',
    '    if ($req.HttpMethod -eq "OPTIONS") { $res.StatusCode = 204; $res.OutputStream.Close(); continue }',
    '    if ($Token -ne "" -and $req.Headers["X-FlowLab-Token"] -ne $Token) {',
    '      Send-Json $res 401 @{ ok = $false; error = "Token inválido" }; continue',
    '    }',
    '    if ($req.HttpMethod -eq "GET") {',
    '      $entries = @(Get-ChildItem -Force -ErrorAction SilentlyContinue | Select-Object -First 120 | ForEach-Object { if ($_.PSIsContainer) { "$($_.Name)\\" } else { $_.Name } })',
    '      Send-Json $res 200 @{ ok = $true; mode = "ps-bridge"; shell = "PowerShell $($PSVersionTable.PSVersion)"; os = "Windows"; cwd = (Get-Location).Path; host = $env:COMPUTERNAME; entries = $entries }',
    '      continue',
    '    }',
    '    if ($req.HttpMethod -eq "POST") {',
    '      $sr = New-Object System.IO.StreamReader($req.InputStream, [System.Text.Encoding]::UTF8)',
    '      $body = $sr.ReadToEnd(); $sr.Close()',
    '      $p = $null; try { $p = $body | ConvertFrom-Json } catch {}',
    '      $cmd = if ($p -and $p.command) { [string]$p.command } else { "" }',
    '      if ($p -and $p.cwd -and (Test-Path -LiteralPath $p.cwd)) { try { Set-Location -LiteralPath $p.cwd } catch {} }',
    '      $std = New-Object System.Collections.Generic.List[string]',
    '      $err = New-Object System.Collections.Generic.List[string]',
    '      $code = 0; $global:LASTEXITCODE = 0',
    '      if (-not [string]::IsNullOrWhiteSpace($cmd)) {',
    '        try {',
    '          $sb = [ScriptBlock]::Create($cmd)',
    '          & $sb 2>&1 | ForEach-Object {',
    '            if ($null -eq $_) { return }',
    '            if ($_ -is [System.Management.Automation.ErrorRecord]) { $err.Add(($_ | Out-String -Width 140).TrimEnd()) }',
    '            else { $std.Add(($_ | Out-String -Width 140).TrimEnd()) }',
    '          }',
    '          if ($null -ne $global:LASTEXITCODE -and $global:LASTEXITCODE -ne 0) { $code = [int]$global:LASTEXITCODE }',
    '          elseif ($err.Count -gt 0) { $code = 1 }',
    '        } catch { $err.Add(($_ | Out-String -Width 140).TrimEnd()); $code = 1 }',
    '      }',
    '      $entries = @(Get-ChildItem -Force -ErrorAction SilentlyContinue | Select-Object -First 120 | ForEach-Object { if ($_.PSIsContainer) { "$($_.Name)\\" } else { $_.Name } })',
    '      Send-Json $res 200 @{ ok = $true; stdout = ($std -join "`n"); stderr = ($err -join "`n"); exitCode = $code; cwd = (Get-Location).Path; shell = "PowerShell $($PSVersionTable.PSVersion)"; entries = $entries }',
    '      continue',
    '    }',
    '    Send-Json $res 404 @{ ok = $false; error = "Not found" }',
    '  }',
    '} finally { if ($listener.IsListening) { $listener.Stop() }; $listener.Close() }',
    ''
  ].join('\r\n');

  // Comando compacto de 1 línea para pegar directo en Windows PowerShell
  const ONE_LINER_PS_CMD =
    `powershell -NoExit -ExecutionPolicy Bypass -Command "` +
    `[Console]::OutputEncoding=[Text.Encoding]::UTF8;$l=New-Object Net.HttpListener;$l.Prefixes.Add('http://127.0.0.1:8765/');$l.Start();` +
    `Write-Host 'FlowLab PowerShell conectado en http://127.0.0.1:8765 ('(Get-Location).Path')' -ForegroundColor Green;` +
    `while($l.IsListening){$c=$l.GetContext();$q=$c.Request;$r=$c.Response;` +
    `$r.Headers.Add('Access-Control-Allow-Origin','*');$r.Headers.Add('Access-Control-Allow-Methods','GET,POST,OPTIONS');` +
    `$r.Headers.Add('Access-Control-Allow-Headers','Content-Type,X-FlowLab-Token');$r.Headers.Add('Access-Control-Allow-Private-Network','true');` +
    `if($q.HttpMethod -eq 'OPTIONS'){$r.StatusCode=204;$r.OutputStream.Close();continue}` +
    `if($q.HttpMethod -eq 'GET'){$j=@{ok=$true;mode='ps-bridge';shell='PowerShell '+$PSVersionTable.PSVersion;os='Windows';cwd=(Get-Location).Path}|ConvertTo-Json -Compress}` +
    `else{$s=(New-Object IO.StreamReader($q.InputStream,[Text.Encoding]::UTF8)).ReadToEnd()|ConvertFrom-Json;` +
    `if($s.cwd -and (Test-Path -LiteralPath $s.cwd)){Set-Location -LiteralPath $s.cwd};$o='';$e='';$x=0;$global:LASTEXITCODE=0;` +
    `try{$o=([ScriptBlock]::Create($s.command).InvokeReturnAsIs()|Out-String -Width 140).TrimEnd();if($global:LASTEXITCODE){$x=$global:LASTEXITCODE}}catch{$e=($_|Out-String -Width 140).TrimEnd();$x=1};` +
    `$j=@{ok=$true;stdout=$o;stderr=$e;exitCode=$x;cwd=(Get-Location).Path;shell='PowerShell'}|ConvertTo-Json -Compress}` +
    `$b=[Text.Encoding]::UTF8.GetBytes($j);$r.ContentType='application/json; charset=utf-8';$r.ContentLength64=$b.Length;$r.OutputStream.Write($b,0,$b.Length);$r.OutputStream.Close()}"`;

  let termConfig = loadTermConfig();
  let cmdHistory = loadCmdHistory();
  let historyIdx = cmdHistory.length;
  let draftInput = '';

  let activeTab = 'ps'; // 'ps' | 'log'
  let unreadLogs = 0;
  let isMaximized = false;
  let savedHeightPx = 185;

  let connection = {
    connected: false,
    endpoint: '',
    killEndpoint: '',
    mode: 'offline', // 'ps-bridge' | 'node-bridge' | 'vite-dev' | 'php-local' | 'offline'
    isLocalUserPC: false,
    shell: 'PowerShell',
    os: '',
    cwd: 'C:\\paginaRE',
    host: '',
    entries: []
  };

  let isRunningCmd = false;
  let activeAbort = null;

  function loadTermConfig() {
    const defaults = {
      bridgeUrl: 'http://127.0.0.1:8765',
      token: '',
      preferLocalBridge: true
    };
    try {
      const raw = localStorage.getItem(STORAGE_CFG_KEY);
      if (!raw) return defaults;
      const parsed = JSON.parse(raw);
      return {
        bridgeUrl: typeof parsed.bridgeUrl === 'string' && parsed.bridgeUrl.trim()
          ? parsed.bridgeUrl.trim().replace(/\/+$/, '')
          : defaults.bridgeUrl,
        token: typeof parsed.token === 'string' ? parsed.token : '',
        preferLocalBridge: parsed.preferLocalBridge !== false
      };
    } catch {
      return defaults;
    }
  }

  function saveTermConfig() {
    try {
      localStorage.setItem(STORAGE_CFG_KEY, JSON.stringify(termConfig));
    } catch {}
  }

  function loadCmdHistory() {
    try {
      const raw = localStorage.getItem(STORAGE_HIST_KEY);
      const arr = raw ? JSON.parse(raw) : [];
      return Array.isArray(arr) ? arr.slice(-100) : [];
    } catch {
      return [];
    }
  }

  function pushCmdHistory(cmd) {
    const trimmed = cmd.trim();
    if (!trimmed) return;
    if (cmdHistory[cmdHistory.length - 1] !== trimmed) {
      cmdHistory.push(trimmed);
      if (cmdHistory.length > 100) cmdHistory = cmdHistory.slice(-100);
      try {
        localStorage.setItem(STORAGE_HIST_KEY, JSON.stringify(cmdHistory));
      } catch {}
    }
    historyIdx = cmdHistory.length;
    draftInput = '';
  }

  function buildHeaders() {
    const h = { 'Content-Type': 'application/json' };
    if (termConfig.token) h['X-FlowLab-Token'] = termConfig.token;
    return h;
  }

  async function probeEndpoint(url, timeoutMs = 1400) {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), timeoutMs);
    try {
      const res = await fetch(url, {
        method: 'GET',
        headers: termConfig.token ? { 'X-FlowLab-Token': termConfig.token } : {},
        signal: ctrl.signal
      });
      clearTimeout(timer);
      if (!res.ok) return null;
      const contentType = res.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) return null;
      const data = await res.json();
      if (!data || data.ok !== true) return null;
      return data;
    } catch {
      clearTimeout(timer);
      return null;
    }
  }

  async function autoDetectTerminalBackend(announce = false) {
    const bridgeBase = (termConfig.bridgeUrl || 'http://127.0.0.1:8765').replace(/\/+$/, '');
    const pageIsLocalhost =
      window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

    // 1. Probar primero el puente local en la PC del usuario (127.0.0.1:8765)
    const bridgeUrl = bridgeBase.endsWith('/api/terminal')
      ? bridgeBase
      : bridgeBase + '/api/terminal';
    const bridgeProbe = await probeEndpoint(bridgeUrl, 1200);
    if (bridgeProbe) {
      connection = {
        connected: true,
        endpoint: bridgeUrl,
        killEndpoint: bridgeBase + '/api/terminal/kill',
        mode: bridgeProbe.mode || 'ps-bridge',
        isLocalUserPC: true,
        shell: bridgeProbe.shell || 'PowerShell',
        os: bridgeProbe.os || 'Windows',
        cwd: bridgeProbe.cwd || 'C:\\',
        host: bridgeProbe.host || 'PC-Local',
        entries: Array.isArray(bridgeProbe.entries) ? bridgeProbe.entries : []
      };
      updatePromptUI();
      updateConnectionUI();
      if (announce) {
        appendTerminalSystemLine(
          `Conectado al PowerShell local de tu equipo (${connection.shell}) en ${connection.cwd}`
        );
      }
      return true;
    }

    // 2. Probar endpoint integrado del servidor actual (/api/terminal en Vite o api/terminal.php en XAMPP)
    const viteProbe = await probeEndpoint('api/terminal', 1500);
    if (viteProbe) {
      connection = {
        connected: true,
        endpoint: 'api/terminal',
        killEndpoint: 'api/terminal/kill',
        mode: viteProbe.mode || 'vite-dev',
        isLocalUserPC: pageIsLocalhost,
        shell: viteProbe.shell || 'PowerShell',
        os: viteProbe.os || '',
        cwd: viteProbe.cwd || '/',
        host: viteProbe.host || '',
        entries: Array.isArray(viteProbe.entries) ? viteProbe.entries : []
      };
      updatePromptUI();
      updateConnectionUI();
      if (announce) {
        appendTerminalSystemLine(
          pageIsLocalhost
            ? `Conectado a terminal local (${connection.shell}) en ${connection.cwd}`
            : `Conectado al entorno activo (${connection.shell}). Usa "conectar pc" para enlazar el PowerShell de tu computadora.`
        );
      }
      return true;
    }

    const phpProbe = await probeEndpoint('api/terminal.php', 1500);
    if (phpProbe) {
      connection = {
        connected: true,
        endpoint: 'api/terminal.php',
        killEndpoint: '',
        mode: phpProbe.mode || 'php-local',
        isLocalUserPC: pageIsLocalhost,
        shell: phpProbe.shell || 'Windows PowerShell',
        os: phpProbe.os || 'Windows',
        cwd: phpProbe.cwd || 'C:\\xampp\\htdocs\\paginaRE',
        host: phpProbe.host || 'localhost',
        entries: Array.isArray(phpProbe.entries) ? phpProbe.entries : []
      };
      updatePromptUI();
      updateConnectionUI();
      if (announce) {
        appendTerminalSystemLine(
          `Conectado vía XAMPP Local (${connection.shell}) en ${connection.cwd}`
        );
      }
      return true;
    }

    // 3. Sin backend de sistema activo: modo desconectado con instrucciones rápidas
    connection.connected = false;
    connection.mode = 'offline';
    connection.isLocalUserPC = false;
    updatePromptUI();
    updateConnectionUI();
    if (announce) {
      appendTerminalErrorLine(
        `No se detectó el puente PowerShell en ${bridgeBase}. Abre "conectar pc" en la barra de la terminal, copia el comando de 1 línea en tu PowerShell y vuelve a pulsar Conectar.`
      );
    }
    return false;
  }

  function formatPromptText() {
    const cwd = connection.cwd || 'C:\\paginaRE';
    return `PS ${cwd}>`;
  }

  function updatePromptUI() {
    const promptEl = document.getElementById('psPromptLabel');
    if (promptEl) {
      promptEl.textContent = formatPromptText();
    }
  }

  function updateConnectionUI() {
    const dot = document.getElementById('termConnDot');
    const lbl = document.getElementById('termConnLabel');
    const statusMsg = document.getElementById('termBridgeStatus');

    if (dot) {
      dot.classList.toggle('is-live', connection.connected);
    }

    if (lbl) {
      if (connection.connected && connection.isLocalUserPC) {
        lbl.textContent = 'ps · mi pc';
      } else if (connection.connected) {
        lbl.textContent = 'shell activo · conectar pc';
      } else {
        lbl.textContent = 'conectar powershell pc';
      }
    }

    if (statusMsg) {
      if (connection.connected && connection.isLocalUserPC) {
        statusMsg.textContent = `Conectado a tu PC (${connection.shell}) · ${connection.cwd}`;
        statusMsg.className = 'term-bridge-status is-ok';
      } else if (connection.connected) {
        statusMsg.textContent = `Terminal activa (${connection.shell}). Para usar el PowerShell de tu propia PC ejecuta el puente local abajo:`;
        statusMsg.className = 'term-bridge-status';
      } else {
        statusMsg.textContent = `Sin puente activo en ${termConfig.bridgeUrl}. Ejecuta el puente en Windows PowerShell para conectar:`;
        statusMsg.className = 'term-bridge-status is-warn';
      }
    }
  }

  function scrollTerminalToBottom() {
    const view = document.getElementById('psTerminalView');
    if (view) {
      view.scrollTop = view.scrollHeight;
    }
  }

  function appendTerminalBlock(htmlContent, cls = 'ps-entry') {
    const historyEl = document.getElementById('psHistory');
    if (!historyEl) return;
    const div = document.createElement('div');
    div.className = cls;
    div.innerHTML = htmlContent;
    historyEl.appendChild(div);

    while (historyEl.children.length > 250) {
      historyEl.removeChild(historyEl.firstChild);
    }
    scrollTerminalToBottom();
  }

  function appendTerminalSystemLine(text) {
    appendTerminalBlock(
      `<div class="ps-sys">${escapeHTML(text)}</div>`,
      'ps-entry ps-entry--sys'
    );
  }

  function appendTerminalErrorLine(text) {
    appendTerminalBlock(
      `<div class="ps-stderr">${escapeHTML(text)}</div>`,
      'ps-entry ps-entry--err'
    );
  }

  // =========================================================================
  // COMANDOS INTEGRADOS "flowlab ..." DENTRO DE LA TERMINAL
  // =========================================================================
  function tryHandleFlowLabCli(rawCmd) {
    const trimmed = rawCmd.trim();
    const lower = trimmed.toLowerCase();

    if (lower === 'cls' || lower === 'clear' || lower === 'clear-host') {
      clearActiveTerminal();
      return true;
    }

    if (!lower.startsWith('flowlab')) {
      return false;
    }

    const args = trimmed.split(/\s+/).slice(1);
    const sub = (args[0] || 'help').toLowerCase();

    let out = '';
    if (sub === 'help' || sub === '--help' || sub === '-h') {
      out = [
        'Comandos integrados FlowLab CLI:',
        '  flowlab status              Resumen del diagrama activo en el lienzo',
        '  flowlab nodes               Lista todos los nodos con ID, tipo y estado',
        '  flowlab run                 Ejecuta la simulación paso a paso del flujo',
        '  flowlab add <tipo> <texto>  Crea un nodo nuevo en el lienzo desde la terminal',
        '  flowlab export              Descarga el proyecto actual en formato .json',
        '  cls / clear                 Limpia la pantalla de la terminal'
      ].join('\n');
    } else if (sub === 'status') {
      const total = STATE.nodes.length;
      const done = STATE.nodes.filter(n => n.status === 'done').length;
      const prog = STATE.nodes.filter(n => n.status === 'progress').length;
      const title = document.getElementById('projTitle')?.value || 'sin_titulo';
      out =
        `Proyecto   : ${title}\n` +
        `Nodos      : ${total} (${done} hechos, ${prog} en curso)\n` +
        `Conexiones : ${STATE.edges.length}\n` +
        `Backend PS : ${connection.connected ? connection.shell + ' (' + connection.mode + ')' : 'desconectado'}`;
    } else if (sub === 'nodes') {
      if (STATE.nodes.length === 0) {
        out = '(El lienzo no tiene nodos actualmente)';
      } else {
        out = STATE.nodes
          .map(
            n =>
              `${n.id.padEnd(10)} [${(n.type || 'process').padEnd(10)}] (${(n.status || 'pending').padEnd(8)}) ${(n.text || '').replace(/\n/g, ' ')}`
          )
          .join('\n');
      }
    } else if (sub === 'run') {
      if (typeof simulateExecution === 'function') {
        simulateExecution();
        out = 'Simulación del flujo iniciada en el lienzo.';
      }
    } else if (sub === 'export') {
      if (typeof exportJSON === 'function') {
        exportJSON();
        out = 'Archivo JSON exportado.';
      }
    } else if (sub === 'add') {
      const typeArg = (args[1] || 'process').toLowerCase();
      const labelText = args.slice(2).join(' ') || 'Nuevo nodo';
      const validType = CONFIG.NODE_TYPES && CONFIG.NODE_TYPES[typeArg] ? typeArg : 'process';
      const b = typeof bbox === 'function' && STATE.nodes.length ? bbox() : { maxX: 260, minY: 120 };
      const node = createNode(validType, labelText, b.maxX + 60, b.minY + 40);
      STATE.nodes.push(node);
      STATE.sel = { kind: 'node', id: node.id };
      commitHistory();
      renderAll();
      saveState();
      out = `Nodo creado en el lienzo: [${node.id}] (${validType}) "${labelText}"`;
    } else {
      appendTerminalBlock(
        `<div class="ps-cmd-line"><span class="ps-prompt-echo">${escapeHTML(formatPromptText())}</span> <span class="ps-cmd-echo">${escapeHTML(rawCmd)}</span></div>` +
          `<div class="ps-stderr">Subcomando desconocido: "${escapeHTML(sub)}". Usa "flowlab help".</div>`
      );
      return true;
    }

    appendTerminalBlock(
      `<div class="ps-cmd-line"><span class="ps-prompt-echo">${escapeHTML(formatPromptText())}</span> <span class="ps-cmd-echo">${escapeHTML(rawCmd)}</span></div>` +
        (out ? `<pre class="ps-stdout">${escapeHTML(out)}</pre>` : '')
    );
    return true;
  }

  // =========================================================================
  // EJECUCIÓN REAL EN POWERSHELL / SHELL CONECTADO
  // =========================================================================
  async function runPowerShellCommand(rawCmd) {
    const cmd = String(rawCmd || '');
    if (!cmd.trim()) {
      appendTerminalBlock(
        `<div class="ps-cmd-line"><span class="ps-prompt-echo">${escapeHTML(formatPromptText())}</span></div>`
      );
      return;
    }

    pushCmdHistory(cmd);

    // Comandos internos rápidos (cls / clear / flowlab ...)
    if (tryHandleFlowLabCli(cmd)) {
      return;
    }

    const promptSnapshot = formatPromptText();

    if (!connection.connected) {
      const connectedNow = await autoDetectTerminalBackend(false);
      if (!connectedNow) {
        appendTerminalBlock(
          `<div class="ps-cmd-line"><span class="ps-prompt-echo">${escapeHTML(promptSnapshot)}</span> <span class="ps-cmd-echo">${escapeHTML(cmd)}</span></div>` +
            `<div class="ps-stderr">PowerShell local no conectado aún. Haz clic en "conectar powershell pc" arriba, ejecuta el comando de 1 línea en tu Windows PowerShell y vuelve a intentarlo (o escribe "flowlab help").</div>`
        );
        toggleBridgeDrawer(true);
        return;
      }
    }

    // Mostrar comando en curso
    const pendingEl = document.createElement('div');
    pendingEl.className = 'ps-entry is-running';
    pendingEl.innerHTML =
      `<div class="ps-cmd-line"><span class="ps-prompt-echo">${escapeHTML(promptSnapshot)}</span> <span class="ps-cmd-echo">${escapeHTML(cmd)}</span></div>` +
      `<div class="ps-running-line">ejecutando... (Ctrl+C para cancelar)</div>`;

    const historyEl = document.getElementById('psHistory');
    if (historyEl) historyEl.appendChild(pendingEl);
    scrollTerminalToBottom();

    setRunningUI(true);
    activeAbort = new AbortController();

    try {
      const res = await fetch(connection.endpoint, {
        method: 'POST',
        headers: buildHeaders(),
        body: JSON.stringify({
          command: cmd,
          cwd: connection.cwd
        }),
        signal: activeAbort.signal
      });

      const data = await res.json().catch(() => null);
      if (!res.ok || !data || data.ok === false) {
        const msg = (data && data.error) || `HTTP ${res.status} al ejecutar comando.`;
        pendingEl.classList.remove('is-running');
        pendingEl.innerHTML =
          `<div class="ps-cmd-line"><span class="ps-prompt-echo">${escapeHTML(promptSnapshot)}</span> <span class="ps-cmd-echo">${escapeHTML(cmd)}</span></div>` +
          `<pre class="ps-stderr">${escapeHTML(msg)}</pre>`;
        return;
      }

      if (data.cwd && typeof data.cwd === 'string') {
        connection.cwd = data.cwd;
      }
      if (Array.isArray(data.entries)) {
        connection.entries = data.entries;
      }
      updatePromptUI();
      updateConnectionUI();

      let outHtml = `<div class="ps-cmd-line"><span class="ps-prompt-echo">${escapeHTML(promptSnapshot)}</span> <span class="ps-cmd-echo">${escapeHTML(cmd)}</span></div>`;
      if (data.stdout) {
        outHtml += `<pre class="ps-stdout">${escapeHTML(data.stdout)}</pre>`;
      }
      if (data.stderr) {
        outHtml += `<pre class="ps-stderr">${escapeHTML(data.stderr)}</pre>`;
      }
      if (typeof data.exitCode === 'number' && data.exitCode !== 0 && !data.stderr) {
        outHtml += `<div class="ps-exit-code">proceso finalizado con código ${data.exitCode}</div>`;
      }

      pendingEl.classList.remove('is-running');
      pendingEl.innerHTML = outHtml;
    } catch (err) {
      pendingEl.classList.remove('is-running');
      if (err && err.name === 'AbortError') {
        pendingEl.innerHTML =
          `<div class="ps-cmd-line"><span class="ps-prompt-echo">${escapeHTML(promptSnapshot)}</span> <span class="ps-cmd-echo">${escapeHTML(cmd)}</span><span class="ps-ctrlc">^C</span></div>`;
      } else {
        connection.connected = false;
        updateConnectionUI();
        pendingEl.innerHTML =
          `<div class="ps-cmd-line"><span class="ps-prompt-echo">${escapeHTML(promptSnapshot)}</span> <span class="ps-cmd-echo">${escapeHTML(cmd)}</span></div>` +
          `<pre class="ps-stderr">Error de conexión con la terminal: ${escapeHTML((err && err.message) || 'Sin respuesta')}</pre>`;
      }
    } finally {
      setRunningUI(false);
      activeAbort = null;
      scrollTerminalToBottom();
      focusTerminalInput();
    }
  }

  async function killRunningCommand() {
    if (activeAbort) {
      activeAbort.abort();
    }
    if (connection.killEndpoint) {
      try {
        await fetch(connection.killEndpoint, {
          method: 'POST',
          headers: buildHeaders()
        });
      } catch {}
    }
  }

  function setRunningUI(running) {
    isRunningCmd = running;
    const killBtn = document.getElementById('btnTermKill');
    const promptRow = document.getElementById('psPromptRow');
    const inputEl = document.getElementById('psInlineInput');
    if (killBtn) killBtn.hidden = !running;
    if (promptRow) promptRow.classList.toggle('is-busy', running);
    if (inputEl) inputEl.disabled = running;
  }

  // =========================================================================
  // AUTOCOMPLETADO CON TAB (CMDLETS + ARCHIVOS DEL DIRECTORIO ACTUAL)
  // =========================================================================
  function handleTabCompletion(inputEl) {
    const val = inputEl.value;
    const parts = val.split(/\s+/);
    const lastToken = parts[parts.length - 1] || '';

    // Si es la primera palabra, autocompletar cmdlets o comandos base
    if (parts.length <= 1) {
      const match = PS_CMDLETS.find(c => c.toLowerCase().startsWith(lastToken.toLowerCase()));
      if (match) {
        inputEl.value = match;
      }
      return;
    }

    // Autocompletar archivos/carpetas del directorio actual
    const cleanToken = lastToken.replace(/^['"]|['"]$/g, '').replace(/^\.[\\/]/, '');
    const matchEntry = (connection.entries || []).find(e =>
      e.toLowerCase().startsWith(cleanToken.toLowerCase())
    );
    if (matchEntry) {
      const needsQuotes = /\s/.test(matchEntry);
      parts[parts.length - 1] = needsQuotes ? `"${matchEntry}"` : matchEntry;
      inputEl.value = parts.join(' ');
    }
  }

  // =========================================================================
  // PESTAÑAS, GAVETA DE PUENTE Y CONTROLES ESTILO VS CODE
  // =========================================================================
  function switchTerminalTab(tab) {
    activeTab = tab === 'log' ? 'log' : 'ps';

    const tabPS = document.getElementById('tabTermPS');
    const tabLog = document.getElementById('tabTermLog');
    const psView = document.getElementById('psTerminalView');
    const logView = document.getElementById('console');
    const flowInputWrap = document.getElementById('consoleFlowInputWrap');
    const badgeEl = document.getElementById('termLogBadge');

    if (tabPS) tabPS.classList.toggle('is-active', activeTab === 'ps');
    if (tabLog) tabLog.classList.toggle('is-active', activeTab === 'log');

    if (psView) psView.hidden = activeTab !== 'ps';
    if (logView) logView.hidden = activeTab !== 'log';
    if (flowInputWrap) flowInputWrap.hidden = activeTab !== 'ps' ? false : true;

    if (activeTab === 'log') {
      unreadLogs = 0;
      if (badgeEl) badgeEl.hidden = true;
    } else {
      focusTerminalInput();
    }
  }

  function notifyFlowConsoleLog() {
    if (activeTab !== 'log') {
      unreadLogs++;
      const badgeEl = document.getElementById('termLogBadge');
      if (badgeEl) {
        badgeEl.textContent = String(Math.min(unreadLogs, 99));
        badgeEl.hidden = false;
      }
    }
  }

  function clearActiveTerminal() {
    if (activeTab === 'ps') {
      const historyEl = document.getElementById('psHistory');
      if (historyEl) historyEl.innerHTML = '';
      focusTerminalInput();
    } else if (DOM.console) {
      DOM.console.innerHTML = '';
      if (typeof log === 'function') log('ok', 'log limpiado');
    }
  }

  function toggleBridgeDrawer(forceState) {
    const drawer = document.getElementById('termBridgeDrawer');
    const btn = document.getElementById('btnTermConnect');
    if (!drawer) return;

    const nextOpen = typeof forceState === 'boolean' ? forceState : drawer.hidden;
    drawer.hidden = !nextOpen;
    if (btn) btn.classList.toggle('is-active', nextOpen);

    if (nextOpen) {
      const urlInput = document.getElementById('termBridgeUrl');
      if (urlInput) urlInput.value = termConfig.bridgeUrl || 'http://127.0.0.1:8765';
      updateConnectionUI();
    }
  }

  function toggleMaximizeConsole() {
    const wrap = document.getElementById('consoleWrap');
    const maxBtn = document.getElementById('btnMaxCon');
    if (!wrap) return;

    if (!isMaximized) {
      savedHeightPx = wrap.offsetHeight || 185;
      wrap.style.height = Math.round(window.innerHeight * 0.56) + 'px';
      isMaximized = true;
    } else {
      wrap.style.height = Math.max(140, savedHeightPx) + 'px';
      isMaximized = false;
    }

    if (maxBtn) {
      maxBtn.classList.toggle('is-active', isMaximized);
      maxBtn.innerHTML = isMaximized
        ? '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><polyline points="6 9 12 15 18 9"/></svg>'
        : '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><polyline points="18 15 12 9 6 15"/></svg>';
    }
    scrollTerminalToBottom();
  }

  function focusTerminalInput() {
    if (activeTab !== 'ps') return;
    const inputEl = document.getElementById('psInlineInput');
    if (inputEl && !inputEl.disabled) {
      try {
        inputEl.focus({ preventScroll: true });
      } catch {}
    }
  }

  function downloadBridgePs1() {
    const blob = new Blob([EMBEDDED_PS1_SCRIPT], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'flowlab-powershell-bridge.ps1';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Script flowlab-powershell-bridge.ps1 descargado', 'ok', 2500);
  }

  async function copyOneLinerPsCommand() {
    try {
      await navigator.clipboard.writeText(ONE_LINER_PS_CMD);
      showToast('Comando copiado. Pégalo en Windows PowerShell y pulsa Enter.', 'ok', 2800);
    } catch {
      showToast('No se pudo copiar automáticamente; descarga el archivo .ps1.', 'warn', 2400);
    }
  }

  async function initPowerShellTerminal() {
    const psView = document.getElementById('psTerminalView');
    const inputEl = document.getElementById('psInlineInput');
    if (!psView || !inputEl) return;

    appendTerminalSystemLine(
      'FlowLab Integrated Terminal · Escribe comandos reales (dir, cd, git status, Get-Process...) o "flowlab help"'
    );

    // Clic en el cuerpo de la terminal enfoca el cursor igual que en VS Code
    psView.addEventListener('click', () => {
      const sel = window.getSelection();
      if (sel && String(sel).length > 0) return;
      focusTerminalInput();
    });

    // Atajos de teclado de una terminal real (Enter, Up/Down, Tab, Ctrl+C, Ctrl+L)
    inputEl.addEventListener('keydown', e => {
      if (e.ctrlKey && (e.key === 'l' || e.key === 'L')) {
        e.preventDefault();
        clearActiveTerminal();
        return;
      }

      if (e.ctrlKey && (e.key === 'c' || e.key === 'C')) {
        const sel = window.getSelection();
        if (sel && String(sel).length > 0) return; // permitir copiar si hay texto seleccionado
        e.preventDefault();
        const currentVal = inputEl.value;
        appendTerminalBlock(
          `<div class="ps-cmd-line"><span class="ps-prompt-echo">${escapeHTML(formatPromptText())}</span> <span class="ps-cmd-echo">${escapeHTML(currentVal)}</span><span class="ps-ctrlc">^C</span></div>`
        );
        inputEl.value = '';
        historyIdx = cmdHistory.length;
        return;
      }

      if (e.key === 'Tab') {
        e.preventDefault();
        handleTabCompletion(inputEl);
        return;
      }

      if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (cmdHistory.length === 0) return;
        if (historyIdx === cmdHistory.length) {
          draftInput = inputEl.value;
        }
        historyIdx = Math.max(0, historyIdx - 1);
        inputEl.value = cmdHistory[historyIdx] || '';
        return;
      }

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (historyIdx < cmdHistory.length - 1) {
          historyIdx++;
          inputEl.value = cmdHistory[historyIdx] || '';
        } else {
          historyIdx = cmdHistory.length;
          inputEl.value = draftInput;
        }
        return;
      }

      if (e.key === 'Enter') {
        e.preventDefault();
        const cmd = inputEl.value;
        inputEl.value = '';
        runPowerShellCommand(cmd);
      }
    });

    // Permitir Ctrl+C mientras se ejecuta un comando largo
    document.addEventListener('keydown', e => {
      if (isRunningCmd && activeTab === 'ps' && e.ctrlKey && (e.key === 'c' || e.key === 'C')) {
        e.preventDefault();
        killRunningCommand();
      }
    });

    // Listeners de barra superior de terminal
    document.getElementById('tabTermPS')?.addEventListener('click', () => switchTerminalTab('ps'));
    document.getElementById('tabTermLog')?.addEventListener('click', () => switchTerminalTab('log'));

    document.getElementById('btnTermNewSession')?.addEventListener('click', async () => {
      switchTerminalTab('ps');
      const historyEl = document.getElementById('psHistory');
      if (historyEl) historyEl.innerHTML = '';
      await autoDetectTerminalBackend(true);
      focusTerminalInput();
    });

    document.getElementById('btnTermConnect')?.addEventListener('click', () => {
      toggleBridgeDrawer();
    });

    document.getElementById('btnTermCopyCmd')?.addEventListener('click', copyOneLinerPsCommand);
    document.getElementById('btnTermDownloadPs1')?.addEventListener('click', downloadBridgePs1);

    document.getElementById('btnTermProbeNow')?.addEventListener('click', async () => {
      const urlInput = document.getElementById('termBridgeUrl');
      if (urlInput && urlInput.value.trim()) {
        termConfig.bridgeUrl = urlInput.value.trim().replace(/\/+$/, '');
        saveTermConfig();
      }
      const ok = await autoDetectTerminalBackend(true);
      if (ok && connection.isLocalUserPC) {
        toggleBridgeDrawer(false);
        showToast('PowerShell de tu PC conectado', 'ok', 2000);
      }
    });

    document.getElementById('btnTermCloseDrawer')?.addEventListener('click', () => {
      toggleBridgeDrawer(false);
    });

    document.getElementById('btnTermKill')?.addEventListener('click', killRunningCommand);
    document.getElementById('btnMaxCon')?.addEventListener('click', toggleMaximizeConsole);

    switchTerminalTab('ps');
    await autoDetectTerminalBackend(true);
  }

  window.initPowerShellTerminal = initPowerShellTerminal;
  window.switchTerminalTab = switchTerminalTab;
  window.clearActiveTerminal = clearActiveTerminal;
  window.notifyFlowConsoleLog = notifyFlowConsoleLog;
  window.runPowerShellCommand = runPowerShellCommand;
})();
