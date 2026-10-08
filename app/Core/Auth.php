<?php

declare(strict_types=1);

namespace App\Core;

class Auth
{
    private const SESSION_KEY = 'sqlfiller_creds';

    public static function login(array $creds): void
    {
        $_SESSION[self::SESSION_KEY] = $creds;
    }

    public static function logout(): void
    {
        unset($_SESSION[self::SESSION_KEY]);
    }

    public static function creds(): ?array
    {
        $creds = $_SESSION[self::SESSION_KEY] ?? null;
        return is_array($creds) ? $creds : null;
    }

    public static function check(): bool
    {
        return self::creds() !== null;
    }
}
