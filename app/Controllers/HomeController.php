<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Core\Auth;
use App\Core\Controller;
use App\Core\View;
use App\Services\DatabaseService;
use App\Services\ExportService;
use App\Services\ImportService;

class HomeController extends Controller
{
    public function index(): void
    {
        $this->requireLogin();
        $creds = Auth::creds();
        $service = new DatabaseService($creds['driver']);
        $pdo = $service->connect($creds);

        if (($creds['database'] ?? '') === '' && $creds['driver'] !== 'sqlite') {
            // Belum ada database terpilih: tampilkan daftar database
            $databases = $service->databases($pdo, $creds['driver']);
            $this->view('home', [
                'title' => 'Pilih Database — SQL FILLER DBMS',
                'tables' => [],
                'databases' => $databases,
                'creds' => $creds,
            ]);
            return;
        }

        $tables = $service->tables($pdo, $creds['driver']);

        $this->view('home', [
            'title' => 'Dashboard — SQL FILLER DBMS',
            'tables' => $tables,
            'creds' => $creds,
        ]);
    }

    public function selectDatabase(): void
    {
        $this->requireLogin();
        $name = trim((string) ($_GET['name'] ?? ''));
        $creds = Auth::creds();
        if ($name !== '') {
            $creds['database'] = $name;
            Auth::login($creds);
            flash('success', "Database '{$name}' dipilih.");
        }
        $this->redirect('/');
    }

    public function table(array $params): void
    {
        $this->requireLogin();
        $creds = Auth::creds();
        $service = new DatabaseService($creds['driver']);
        $pdo = $service->connect($creds);

        $table = $params['name'] ?? '';
        $page = max(1, (int) ($_GET['page'] ?? 1));
        $perPage = 25;
        $total = $service->countRows($pdo, $table);
        $rows = $service->rows($pdo, $table, $perPage, ($page - 1) * $perPage);
        $columns = $service->describe($pdo, $creds['driver'], $table);

        $this->view('table', [
            'title' => $table . ' — SQL FILLER DBMS',
            'table' => $table,
            'rows' => $rows,
            'columns' => $columns,
            'total' => $total,
            'page' => $page,
            'perPage' => $perPage,
            'creds' => $creds,
        ]);
    }

    public function query(): void
    {
        $this->requireLogin();
        $creds = Auth::creds();
        $result = null;
        $error = null;
        $sql = trim((string) ($_SESSION['_last_sql'] ?? ''));

        if (($_SERVER['REQUEST_METHOD'] ?? 'GET') === 'POST') {
            $this->validateCsrf();
            $sql = trim((string) ($_POST['sql'] ?? ''));
            $_SESSION['_last_sql'] = $sql;
            try {
                $service = new DatabaseService($creds['driver']);
                $pdo = $service->connect($creds);
                $result = $service->runQuery($pdo, $sql);
            } catch (\Throwable $e) {
                $error = $e->getMessage();
            }
        }

        $this->view('query', [
            'title' => 'SQL Console — SQL FILLER DBMS',
            'sql' => $sql,
            'result' => $result,
            'error' => $error,
            'creds' => $creds,
        ]);
    }

    public function import(): void
    {
        $this->requireLogin();
        $creds = Auth::creds();
        $resultMsg = null;
        $error = null;

        if (($_SERVER['REQUEST_METHOD'] ?? 'GET') === 'POST') {
            $this->validateCsrf();
            try {
                $service = new DatabaseService($creds['driver']);
                $pdo = $service->connect($creds);
                $importService = new ImportService($service);

                $type = $_POST['type'] ?? 'sql';
                if ($type === 'sql') {
                    $sqlText = $_POST['sql_text'] ?? '';
                    if (!empty($_FILES['file']['tmp_name'])) {
                        $sqlText = file_get_contents($_FILES['file']['tmp_name']) ?: $sqlText;
                    }
                    $count = $importService->importSql($pdo, $sqlText);
                    $resultMsg = "{$count} statement SQL berhasil dieksekusi.";
                } else {
                    if (empty($_FILES['file']['tmp_name']) || !is_uploaded_file($_FILES['file']['tmp_name'])) {
                        throw new \RuntimeException('Upload file CSV terlebih dahulu.');
                    }
                    $tableName = $_POST['table_name'] ?? 'imported';
                    $count = $importService->importCsv($pdo, $_FILES['file']['tmp_name'], $tableName);
                    $resultMsg = "{$count} baris berhasil diimpor ke tabel '{$tableName}'.";
                }
            } catch (\Throwable $e) {
                $error = $e->getMessage();
            }
        }

        $this->view('import', [
            'title' => 'Import Data — SQL FILLER DBMS',
            'resultMsg' => $resultMsg,
            'error' => $error,
            'creds' => $creds,
        ]);
    }

    public function export(): void
    {
        $this->requireLogin();
        $creds = Auth::creds();
        $service = new DatabaseService($creds['driver']);
        $pdo = $service->connect($creds);
        $exportService = new ExportService();

        $table = $_GET['table'] ?? '';
        $format = $_GET['format'] ?? 'csv';
        $total = $service->countRows($pdo, $table);
        $rows = $service->rows($pdo, $table, $total, 0);
        $columns = $rows ? array_keys($rows[0]) : [];

        header('Content-Type: ' . ($format === 'sql' ? 'application/sql' : 'text/csv'));
        header('Content-Disposition: attachment; filename="' . $table . '.' . $format . '"');
        echo $format === 'sql'
            ? $exportService->exportSql($pdo, $table, $rows, $columns, $creds['driver'])
            : $exportService->exportCsv($rows, $columns);
        exit;
    }
}
