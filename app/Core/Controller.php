<?php

declare(strict_types=1);

namespace App\Core;

use App\Core\View;

abstract class Controller
{
    protected function view(string $view, array $data = []): void
    {
        View::render($view, $data + ['title' => $data['title'] ?? 'SQL FILLER DBMS']);
    }

    protected function redirect(string $path, array $query = []): void
    {
        header('Location: ' . url($path, $query));
        exit;
    }

    protected function requireLogin(): void
    {
        if (Auth::creds() === null) {
            flash('error', 'Silakan login terlebih dahulu.');
            $this->redirect('/login');
        }
    }

    protected function validateCsrf(): void
    {
        if (!csrf_check()) {
            http_response_code(419);
            $this->view('error', ['title' => '419', 'message' => 'Token CSRF tidak valid. Muat ulang halaman.']);
            exit;
        }
    }
}
