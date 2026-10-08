<?php

declare(strict_types=1);

namespace App\Services;

use PDO;
use PDOException;

class DatabaseService
{
    public function __construct(private string $driver = 'mysql')
    {
    }

    public function connect(array $creds): PDO
    {
        $driver = $creds['driver'] ?? 'mysql';
        $dsn = match ($driver) {
            'mysql' => sprintf('mysql:host=%s;dbname=%s;charset=utf8mb4', $creds['server'] ?? 'localhost', $creds['database'] ?? ''),
            'pgsql' => sprintf('pgsql:host=%s;dbname=%s', $creds['server'] ?? 'localhost', $creds['database'] ?? ''),
            'sqlite' => 'sqlite:' . ($creds['database'] ?? ''),
            default => throw new \InvalidArgumentException('Driver tidak dikenal: ' . $driver),
        };

        return new PDO($dsn, $creds['username'] ?? null, $creds['password'] ?? null, [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        ]);
    }

    public function tables(PDO $pdo, string $driver): array
    {
        return match ($driver) {
            'mysql' => $pdo->query('SHOW TABLES')->fetchAll(PDO::FETCH_COLUMN),
            'pgsql' => $pdo->query("SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename")->fetchAll(PDO::FETCH_COLUMN),
            'sqlite' => $pdo->query("SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%' ORDER BY name")->fetchAll(PDO::FETCH_COLUMN),
            default => [],
        };
    }

    public function describe(PDO $pdo, string $driver, string $table): array
    {
        try {
            return match ($driver) {
                'mysql' => $pdo->query('DESCRIBE ' . $this->quoteIdent($table))->fetchAll(),
                'pgsql' => $pdo->query("SELECT column_name AS Field, data_type AS Type, is_nullable AS Null, column_default AS 'Default' FROM information_schema.columns WHERE table_name = " . $pdo->quote($table) . ' ORDER BY ordinal_position')->fetchAll(),
                'sqlite' => $pdo->query('PRAGMA table_info(' . $this->quoteIdent($table) . ')')->fetchAll(),
                default => [],
            };
        } catch (\Throwable) {
            return [];
        }
    }

    public function rows(PDO $pdo, string $table, int $limit, int $offset): array
    {
        $stmt = $pdo->prepare('SELECT * FROM ' . $this->quoteIdent($table) . ' LIMIT :l OFFSET :o');
        $stmt->bindValue(':l', $limit, PDO::PARAM_INT);
        $stmt->bindValue(':o', $offset, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetchAll();
    }

    public function countRows(PDO $pdo, string $table): int
    {
        return (int) $pdo->query('SELECT COUNT(*) FROM ' . $this->quoteIdent($table))->fetchColumn();
    }

    /** Jalankan query manual; kembalikan hasil atau pesan error. */
    public function runQuery(PDO $pdo, string $sql): array
    {
        $sql = trim($sql);
        if ($sql === '') {
            throw new \InvalidArgumentException('Query kosong.');
        }

        $stmt = $pdo->query($sql);
        if ($stmt === false) {
            throw new \RuntimeException('Query gagal dieksekusi.');
        }

        $isSelect = preg_match('/^\s*(select|show|describe|pragma|explain)/i', $sql) === 1;
        if ($isSelect) {
            $rows = $stmt->fetchAll();
            return ['type' => 'result', 'columns' => $rows ? array_keys($rows[0]) : [], 'rows' => $rows];
        }

        return ['type' => 'affected', 'count' => $stmt->rowCount()];
    }

    /** Eksekusi skrip SQL multi-statement (split oleh ;). */
    public function executeScript(PDO $pdo, string $sql): int
    {
        $statements = $this->splitStatements($sql);
        $count = 0;
        foreach ($statements as $statement) {
            if (trim($statement) === '') {
                continue;
            }
            $pdo->exec($statement);
            $count++;
        }
        return $count;
    }

    public function splitStatements(string $sql): array
    {
        $parts = preg_split('/;\s*(\r?\n|$)/', $sql);
        return array_map('trim', $parts);
    }

    private function quoteIdent(string $name): string
    {
        return self::quoteId($name, $this->driver);
    }

    public static function quoteId(string $name, string $driver): string
    {
        if ($driver === 'mysql') {
            return '`' . str_replace('`', '``', $name) . '`';
        }
        return '"' . str_replace('"', '""', $name) . '"';
    }
}
