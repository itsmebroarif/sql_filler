<?php

if (!function_exists('e')) {
    /** Escape output HTML. */
    function e(mixed $value): string
    {
        return htmlspecialchars((string) $value, ENT_QUOTES, 'UTF-8');
    }
}

if (!function_exists('url')) {
    /** Buat URL relatif aplikasi. */
    function url(string $path = '', array $query = []): string
    {
        $base = rtrim(dirname($_SERVER['SCRIPT_NAME'] ?? ''), '/\\');
        $path = '/' . ltrim($path, '/');
        $qs = $query ? '?' . http_build_query($query) : '';
        return $base . $path . $qs;
    }
}

if (!function_exists('old')) {
    function old(string $key, mixed $default = ''): mixed
    {
        return $_SESSION['_old'][$key] ?? $default;
    }
}

if (!function_exists('flash')) {
    function flash(?string $key = null, ?string $message = null): mixed
    {
        if ($key !== null && $message !== null) {
            $_SESSION['_flash'][$key] = $message;
            return null;
        }
        if ($key !== null) {
            $msg = $_SESSION['_flash'][$key] ?? null;
            unset($_SESSION['_flash'][$key]);
            return $msg;
        }
        $_SESSION['_flash'] = [];
        return null;
    }
}

if (!function_exists('csrf_field')) {
    function csrf_field(): string
    {
        if (empty($_SESSION['_csrf'])) {
            $_SESSION['_csrf'] = bin2hex(random_bytes(16));
        }
        return '<input type="hidden" name="_csrf" value="' . e($_SESSION['_csrf']) . '">';
    }
}

if (!function_exists('csrf_check')) {
    function csrf_check(): bool
    {
        return isset($_POST['_csrf'], $_SESSION['_csrf']) && hash_equals($_SESSION['_csrf'], $_POST['_csrf']);
    }
}

if (!function_exists('format_bytes')) {
    function format_bytes(int $bytes): string
    {
        $units = ['B', 'KB', 'MB', 'GB'];
        $i = 0;
        $size = (float) $bytes;
        while ($size >= 1024 && $i < count($units) - 1) {
            $size /= 1024;
            $i++;
        }
        return round($size, 2) . ' ' . $units[$i];
    }
}
