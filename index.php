<?php
/**
 * SQL FILLER DBMS — Front Controller (MVC)
 */
declare(strict_types=1);

require __DIR__ . '/app/bootstrap.php';

$router = require __DIR__ . '/config/routes.php';

$router->dispatch(
    parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH),
    $_SERVER['REQUEST_METHOD'] ?? 'GET'
);
