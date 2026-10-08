<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Core\Auth;
use App\Core\Controller;
use App\Services\DatabaseService;

class AuthController extends Controller
{
    public function form(): void
    {
        $this->view('login', ['title' => 'Login — SQL FILLER DBMS']);
    }

    public function login(): void
    {
        $this->validateCsrf();

        $creds = [
            'driver' => $_POST['driver'] ?? 'mysql',
            'server' => trim((string) ($_POST['server'] ?? 'localhost')),
            'username' => trim((string) ($_POST['username'] ?? '')),
            'password' => (string) ($_POST['password'] ?? ''),
            'database' => trim((string) ($_POST['database'] ?? '')),
        ];

        try {
            $service = new DatabaseService($creds['driver']);
            $service->connect($creds);
        } catch (\Throwable $e) {
            $_SESSION['_old'] = $creds;
            flash('error', 'Koneksi gagal: ' . $e->getMessage());
            $this->redirect('/login');
        }

        Auth::login($creds);
        flash('success', 'Login berhasil. Selamat datang!');
        $this->redirect('/');
    }

    public function logout(): void
    {
        Auth::logout();
        flash('success', 'Anda telah logout.');
        $this->redirect('/login');
    }
}
