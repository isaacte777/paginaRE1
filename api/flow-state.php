<?php
declare(strict_types=1);

/**
 * Lightweight shared project state for FlowLab.
 *
 * It stores only nodes, edges and the project title. Browser viewports and
 * console output remain local so collaborators can navigate independently.
 */

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
header('Pragma: no-cache');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    header('Allow: GET, POST, PUT, OPTIONS');
    http_response_code(204);
    exit;
}

$storageDirectory = dirname($_SERVER['DOCUMENT_ROOT']) . DIRECTORY_SEPARATOR . 'tmp';
$storageFile = $storageDirectory . DIRECTORY_SEPARATOR . 'paginaRE-flowlab-shared.json';

if (!is_dir($storageDirectory) && !mkdir($storageDirectory, 0775, true) && !is_dir($storageDirectory)) {
    http_response_code(500);
    echo json_encode(['error' => 'No se pudo preparar el almacenamiento compartido.']);
    exit;
}

/** @return array{revision:int, updatedAt:?string, state:?array} */
function emptyProject(): array {
    return ['revision' => 0, 'updatedAt' => null, 'state' => null];
}

/** @return array{revision:int, updatedAt:?string, state:?array} */
function decodeProject(string $contents): array {
    $project = json_decode($contents, true);
    if (!is_array($project)) {
        return emptyProject();
    }

    return [
        'revision' => isset($project['revision']) ? (int) $project['revision'] : 0,
        'updatedAt' => isset($project['updatedAt']) ? (string) $project['updatedAt'] : null,
        'state' => isset($project['state']) && is_array($project['state']) ? $project['state'] : null,
    ];
}

/** @return array{revision:int, updatedAt:?string, state:?array} */
function readProject(string $file): array {
    if (!file_exists($file)) {
        return emptyProject();
    }

    $handle = fopen($file, 'rb');
    if ($handle === false) {
        return emptyProject();
    }

    flock($handle, LOCK_SH);
    $contents = stream_get_contents($handle);
    flock($handle, LOCK_UN);
    fclose($handle);
    return decodeProject($contents === false ? '' : $contents);
}

/** @return array{nodes:array, edges:array, title:string, isBlankCanvas:bool}|null */
function validateState(mixed $state): ?array {
    if (!is_array($state) || !isset($state['nodes'], $state['edges']) || !is_array($state['nodes']) || !is_array($state['edges'])) {
        return null;
    }

    // This endpoint is a small project store, never a general file upload.
    if (count($state['nodes']) > 500 || count($state['edges']) > 1500) {
        return null;
    }

    return [
        'nodes' => array_values($state['nodes']),
        'edges' => array_values($state['edges']),
        'title' => isset($state['title']) ? (function_exists('mb_substr') ? mb_substr((string) $state['title'], 0, 160) : substr((string) $state['title'], 0, 160)) : 'orquestador_paginaRE',
        'isBlankCanvas' => !empty($state['isBlankCanvas']),
    ];
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    echo json_encode(readProject($storageFile), JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

if (!in_array($_SERVER['REQUEST_METHOD'], ['POST', 'PUT'], true)) {
    header('Allow: GET, POST, PUT, OPTIONS');
    http_response_code(405);
    echo json_encode(['error' => 'Método no permitido.']);
    exit;
}

$payload = json_decode(file_get_contents('php://input') ?: '', true);
$state = validateState($payload['state'] ?? null);
if ($state === null) {
    http_response_code(422);
    echo json_encode(['error' => 'El estado compartido no es válido.']);
    exit;
}

$handle = fopen($storageFile, 'c+');
if ($handle === false || !flock($handle, LOCK_EX)) {
    http_response_code(500);
    echo json_encode(['error' => 'No se pudo bloquear el estado compartido.']);
    exit;
}

rewind($handle);
$current = decodeProject(stream_get_contents($handle) ?: '');
$project = [
    'revision' => $current['revision'] + 1,
    'updatedAt' => gmdate('c'),
    'state' => $state,
];

rewind($handle);
ftruncate($handle, 0);
fwrite($handle, json_encode($project, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES));
fflush($handle);
flock($handle, LOCK_UN);
fclose($handle);

echo json_encode($project, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
