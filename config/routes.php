<?php

declare(strict_types=1);

use App\Controllers\AuthController;
use App\Controllers\HomeController;
use App\Core\Router;

$router = new Router();

$router->get('/login', [AuthController::class, 'form']);
$router->post('/login', [AuthController::class, 'login']);
$router->post('/logout', [AuthController::class, 'logout']);

$router->get('/', [HomeController::class, 'index']);
$router->get('/table/{name}', [HomeController::class, 'table']);
$router->match(['GET', 'POST'], '/query', [HomeController::class, 'query']);
$router->match(['GET', 'POST'], '/import', [HomeController::class, 'import']);
$router->get('/export', [HomeController::class, 'export']);

return $router;
