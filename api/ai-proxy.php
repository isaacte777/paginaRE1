<?php
declare(strict_types=1);

/**
 * Local-only AI Gateway Proxy for FlowLab (XAMPP / local PHP).
 * Bypasses browser CORS restrictions when calling local gateways (Omniroute, Ollama, LM Studio).
 * Strictly restricted to loopback requests (127.0.0.1 / ::1).
 */

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

$remoteAddr = $_SERVER['REMOTE_ADDR'] ?? '';
if (!in_array($remoteAddr, ['127.0.0.1', '::1'], true)) {
    http_response_code(403);
    echo json_encode(['ok' => false, 'error' => 'Solo disponible desde localhost.'], JSON_UNESCAPED_UNICODE);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['ok' => false, 'error' => 'Método no permitido.'], JSON_UNESCAPED_UNICODE);
    exit;
}

$payload = json_decode(file_get_contents('php://input') ?: '', true);
$targetUrl = isset($payload['targetUrl']) ? trim((string) $payload['targetUrl']) : '';
$method = isset($payload['method']) ? strtoupper((string) $payload['method']) : 'POST';
$headersMap = isset($payload['headers']) && is_array($payload['headers']) ? $payload['headers'] : [];
$fwdBody = $payload['body'] ?? '';

$parts = parse_url($targetUrl);
if (!$parts || !in_array(strtolower($parts['scheme'] ?? ''), ['http', 'https'], true)) {
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'URL de destino no válida.'], JSON_UNESCAPED_UNICODE);
    exit;
}

$rawHeaders = [];
foreach ($headersMap as $k => $v) {
    if (is_string($k) && (is_string($v) || is_numeric($v))) {
        $rawHeaders[] = $k . ': ' . $v;
    }
}

if (function_exists('curl_init')) {
    $ch = curl_init($targetUrl);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);
    curl_setopt($ch, CURLOPT_HTTPHEADER, $rawHeaders);
    curl_setopt($ch, CURLOPT_TIMEOUT, 60);
    curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 8);
    if ($method !== 'GET' && $method !== 'HEAD') {
        curl_setopt($ch, CURLOPT_POSTFIELDS, is_string($fwdBody) ? $fwdBody : json_encode($fwdBody));
    }
    $body = curl_exec($ch);
    if ($body === false) {
        $err = curl_error($ch);
        curl_close($ch);
        http_response_code(502);
        echo json_encode(['ok' => false, 'error' => $err], JSON_UNESCAPED_UNICODE);
        exit;
    }
    $status = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $ctype = (string) (curl_getinfo($ch, CURLINFO_CONTENT_TYPE) ?: '');
    curl_close($ch);

    echo json_encode([
        'ok' => true,
        'upstreamStatus' => $status,
        'contentType' => $ctype,
        'body' => $body,
    ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

http_response_code(501);
echo json_encode(['ok' => false, 'error' => 'Extensión cURL no disponible en PHP.'], JSON_UNESCAPED_UNICODE);
