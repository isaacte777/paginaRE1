<?php
/**
 * API Endpoint: Categorías
 * GET /api/categories.php - Lista todas las categorías
 */

require_once '../config.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method !== 'GET') {
    errorResponse('Método no permitido', 405);
}

// Cargar datos
$dataFile = DATA_DIR . 'products.json';
if (!file_exists($dataFile)) {
    errorResponse('Archivo de datos no encontrado', 500);
}

$data = json_decode(file_get_contents($dataFile), true);
if (!$data || !isset($data['categories'])) {
    errorResponse('Error al cargar datos', 500);
}

$categories = $data['categories'];
$products = $data['products'];

// Agregar conteo de productos por categoría
$categories = array_map(function($category) use ($products) {
    $count = count(array_filter($products, fn($p) => $p['category'] === $category['id']));
    $category['product_count'] = $count;
    return $category;
}, $categories);

jsonResponse([
    'success' => true,
    'count' => count($categories),
    'categories' => $categories
]);
