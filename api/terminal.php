<?php
declare(strict_types=1);

/**
 * Local-only PowerShell / Terminal endpoint for FlowLab (XAMPP / local PHP).
 * Strictly restricted to loopback requests (127.0.0.1 / ::1) for security.
 */

$origin = $_SERVER['HTTP_ORIGIN'] ?? '*';
header('Access-Control-Allow-Origin: ' . $origin);
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, X-FlowLab-Token');
header('Access-Control-Allow-Private-Network: true');
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

$remoteAddr = $_SERVER['REMOTE_ADDR'] ?? '';
if (!in_array($remoteAddr, ['127.0.0.1', '::1'], true)) {
    http_response_code(403);
    echo json_encode([
        'ok' => false,
        'error' => 'Por seguridad, api/terminal.php solo acepta conexiones locales (127.0.0.1).'
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

$defaultCwd = realpath(dirname(__DIR__)) ?: getcwd();
$isWindows = DIRECTORY_SEPARATOR === '\\';

function listDirEntries(string $dir): array {
    if (!is_dir($dir)) {
        return [];
    }
    $items = @scandir($dir);
    if (!is_array($items)) {
        return [];
    }
    $out = [];
    foreach ($items as $item) {
        if ($item === '.' || $item === '..') {
            continue;
        }
        $full = $dir . DIRECTORY_SEPARATOR . $item;
        $out[] = is_dir($full) ? $item . DIRECTORY_SEPARATOR : $item;
        if (count($out) >= 120) {
            break;
        }
    }
    return $out;
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    echo json_encode([
        'ok' => true,
        'mode' => 'php-local',
        'shell' => $isWindows ? 'Windows PowerShell' : 'bash',
        'os' => PHP_OS_FAMILY,
        'cwd' => $defaultCwd,
        'host' => gethostname() ?: 'localhost',
        'entries' => listDirEntries($defaultCwd),
    ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['ok' => false, 'error' => 'Método no permitido.'], JSON_UNESCAPED_UNICODE);
    exit;
}

$payload = json_decode(file_get_contents('php://input') ?: '', true);
$command = isset($payload['command']) ? (string) $payload['command'] : '';
$cwd = isset($payload['cwd']) && is_string($payload['cwd']) && is_dir($payload['cwd'])
    ? (realpath($payload['cwd']) ?: $payload['cwd'])
    : $defaultCwd;

if (trim($command) === '') {
    echo json_encode([
        'ok' => true,
        'stdout' => '',
        'stderr' => '',
        'exitCode' => 0,
        'cwd' => $cwd,
        'shell' => $isWindows ? 'Windows PowerShell' : 'bash',
        'entries' => listDirEntries($cwd),
    ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

$t0 = microtime(true);

if ($isWindows) {
    $escapedCwd = str_replace("'", "''", $cwd);
    $psScript = "[Console]::InputEncoding = [System.Text.Encoding]::UTF8\n"
        . "[Console]::OutputEncoding = [System.Text.Encoding]::UTF8\n"
        . "\$OutputEncoding = [System.Text.Encoding]::UTF8\n"
        . "Set-Location -LiteralPath '{$escapedCwd}'\n"
        . "\$global:LASTEXITCODE = 0\n"
        . $command . "\n"
        . "\$__flCode = if (\$null -ne \$global:LASTEXITCODE -and \$global:LASTEXITCODE -ne 0) { [int]\$global:LASTEXITCODE } elseif (\$?) { 0 } else { 1 }\n"
        . "Write-Output (\"`n__FLOWLAB_META__\" + (@{ cwd = (Get-Location).Path; code = \$__flCode } | ConvertTo-Json -Compress))\n";

    $utf16 = function_exists('mb_convert_encoding')
        ? mb_convert_encoding($psScript, 'UTF-16LE', 'UTF-8')
        : iconv('UTF-8', 'UTF-16LE', $psScript);
    $encoded = base64_encode($utf16);
    $execCmd = 'powershell.exe -NoLogo -NoProfile -NonInteractive -ExecutionPolicy Bypass -EncodedCommand ' . $encoded;
} else {
    $execCmd = '/bin/bash -c ' . escapeshellarg(
        "cd " . escapeshellarg($cwd) . " && {\n" . $command . "\n}; __fl_code=\$?; printf '\\n__FLOWLAB_META__{\"cwd\":\"%s\",\"code\":%d}\\n' \"\$(pwd)\" \"\$__fl_code\""
    );
}

$descriptors = [
    0 => ['pipe', 'r'],
    1 => ['pipe', 'w'],
    2 => ['pipe', 'w'],
];

$proc = @proc_open($execCmd, $descriptors, $pipes, $cwd);
if (!is_resource($proc)) {
    http_response_code(500);
    echo json_encode([
        'ok' => false,
        'error' => 'proc_open está deshabilitado en php.ini o PowerShell no está disponible.'
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

fclose($pipes[0]);
$stdout = stream_get_contents($pipes[1]) ?: '';
fclose($pipes[1]);
$stderr = stream_get_contents($pipes[2]) ?: '';
fclose($pipes[2]);
$procExit = proc_close($proc);

$newCwd = $cwd;
$exitCode = $procExit;

if (preg_match('/\r?\n?__FLOWLAB_META__(\{[^\r\n]+\})\s*$/', $stdout, $m)) {
    $stdout = substr($stdout, 0, -strlen($m[0]));
    $meta = json_decode($m[1], true);
    if (is_array($meta)) {
        if (!empty($meta['cwd']) && is_string($meta['cwd'])) {
            $newCwd = $meta['cwd'];
        }
        if (isset($meta['code'])) {
            $exitCode = (int) $meta['code'];
        }
    }
}

$durationMs = (int) round((microtime(true) - $t0) * 1000);

echo json_encode([
    'ok' => true,
    'stdout' => rtrim($stdout, "\r\n"),
    'stderr' => rtrim($stderr, "\r\n"),
    'exitCode' => $exitCode,
    'cwd' => $newCwd,
    'durationMs' => $durationMs,
    'shell' => $isWindows ? 'Windows PowerShell' : 'bash',
    'entries' => listDirEntries($newCwd),
], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
