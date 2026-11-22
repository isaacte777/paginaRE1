<?php
/**
 * API Endpoint: Comparación de Precios
 * GET /api/compare.php?id=p001 - Compara precios de un producto específico
 */

require_once '../config.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method !== 'GET') {
    errorResponse('Método no permitido', 405);
}

$id = $_GET['id'] ?? null;

if (!$id) {
    errorResponse('ID de producto requerido', 400);
}

// Cargar datos
$dataFile = DATA_DIR . 'products.json';
if (!file_exists($dataFile)) {
    errorResponse('Archivo de datos no encontrado', 500);
}

$data = json_decode(file_get_contents($dataFile), true);
if (!$data || !isset($data['products'])) {
    errorResponse('Error al cargar datos', 500);
}

$products = $data['products'];

// Buscar producto
$product = null;
foreach ($products as $p) {
    if ($p['id'] === $id) {
        $product = $p;
        break;
    }
}

if (!$product) {
    errorResponse('Producto no encontrado', 404);
}

// Analizar precios
$prices = $product['prices'];
$comparison = [];
$bestPrice = null;
$lowestTotal = PHP_FLOAT_MAX;

foreach ($prices as $price) {
    $total = $price['price'] + $price['shipping'];
    $isBest = false;
    
    if ($total < $lowestTotal) {
        $lowestTotal = $total;
        $bestPrice = $price;
    }
    
    $comparison[] = [
        'platform' => $price['platform'],
        'price' => $price['price'],
        'shipping' => $price['shipping'],
        'total' => $total,
        'currency' => $price['currency'],
        'availability' => $price['availability'],
        'seller_rating' => $price['seller_rating'],
        'url' => $price['url']
    ];
}

// Marcar el mejor precio
foreach ($comparison as &$c) {
    $c['is_best'] = ($c['platform'] === $bestPrice['platform']);
    
    // Calcular diferencia con el mejor precio
    if (!$c['is_best']) {
        $c['price_difference'] = $c['total'] - $lowestTotal;
        $c['price_difference_percent'] = round((($c['total'] - $lowestTotal) / $lowestTotal) * 100, 2);
    } else {
        $c['price_difference'] = 0;
        $c['price_difference_percent'] = 0;
    }
}

// Ordenar por precio total
usort($comparison, fn($a, $b) => $a['total'] <=> $b['total']);

jsonResponse([
    'success' => true,
    'product' => [
        'id' => $product['id'],
        'name' => $product['name'],
        'image' => $product['image'],
        'category' => $product['category']
    ],
    'best_deal' => [
        'platform' => $bestPrice['platform'],
        'total' => $lowestTotal,
        'savings' => max($comparison)[' total'] - $lowestTotal
    ],
    'comparison' => $comparison
]);
