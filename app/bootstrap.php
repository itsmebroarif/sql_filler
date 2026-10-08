<?php
declare(strict_types=1);

session_start();

error_reporting(E_ALL & ~E_NOTICE);

// PSR-4-ish autoloader untuk namespace App\
spl_autoload_register(function (string $class): void {
    $prefix = 'App\\';
    if (str_starts_with($class, $prefix)) {
        $path = __DIR__ . '/' . str_replace('\\', '/', substr($class, strlen($prefix))) . '.php';
        if (file_exists($path)) {
            require $path;
        }
    }
});

// Helper functions global
require __DIR__ . '/Helpers/helpers.php';
