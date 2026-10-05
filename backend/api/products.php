<?php
/**
 * API Endpoint: Productos
 * GET /api/products.php - Lista todos los productos
 * GET /api/products.php?id=p001 - Obtiene un producto específico
 * GET /api/products.php?category=tecnologia - Filtra por categoría
 * GET /api/products.php?featured=true - Productos destacados
 * GET /api/products.php?search=iphone - Búsqueda por nombre
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
if (!$data || !isset($data['products'])) {
    errorResponse('Error al cargar datos', 500);
}

$products = $data['products'];

// Parámetros de consulta
$id = $_GET['id'] ?? null;
$category = $_GET['category'] ?? null;
$featured = $_GET['featured'] ?? null;
$search = $_GET['search'] ?? null;

// Producto específico por ID
if ($id) {
    $product = array_filter($products, fn($p) => $p['id'] === $id);
    if (empty($product)) {
        errorResponse('Producto no encontrado', 404);
    }
    jsonResponse(array_values($product)[0]);
}

// Filtrar por categoría
if ($category) {
    $products = array_filter($products, fn($p) => $p['category'] === $category);
}

// Filtrar productos destacados
if ($featured === 'true') {
    $products = array_filter($products, fn($p) => $p['featured'] === true);
}

// Búsqueda por nombre
if ($search) {
    $searchLower = strtolower($search);
    $products = array_filter($products, function($p) use ($searchLower) {
        return strpos(strtolower($p['name']), $searchLower) !== false ||
               strpos(strtolower($p['description']), $searchLower) !== false;
    });
}

// Agregar información del mejor precio a cada producto
$products = array_map(function($product) {
    $prices = $product['prices'];
    $bestPrice = null;
    $lowestTotal = PHP_FLOAT_MAX;
    
    foreach ($prices as $price) {
        $total = $price['price'] + $price['shipping'];
        if ($total < $lowestTotal) {
            $lowestTotal = $total;
            $bestPrice = $price;
        }
    }
    
    $product['best_price'] = $bestPrice;
    $product['best_total'] = $lowestTotal;
    
    return $product;
}, $products);

// Ordenar por mejor precio (opcional)
$sort = $_GET['sort'] ?? null;
if ($sort === 'price_asc') {
    usort($products, fn($a, $b) => $a['best_total'] <=> $b['best_total']);
} elseif ($sort === 'price_desc') {
    usort($products, fn($a, $b) => $b['best_total'] <=> $a['best_total']);
} elseif ($sort === 'rating') {
    usort($products, fn($a, $b) => $b['rating'] <=> $a['rating']);
}

jsonResponse([
    'success' => true,
    'count' => count($products),
    'products' => array_values($products)
]);
