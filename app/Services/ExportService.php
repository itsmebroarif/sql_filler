<?php

declare(strict_types=1);

namespace App\Services;

use PDO;

class ExportService
{
    public function exportCsv(array $rows, array $columns): string
    {
        $handle = fopen('php://temp', 'r+');
        fputcsv($handle, $columns, ',', '"', '\\');
        foreach ($rows as $row) {
            fputcsv($handle, array_map(static fn(string $c) => $row[$c] ?? '', $columns), ',', '"', '\\');
        }
        rewind($handle);
        $csv = stream_get_contents($handle);
        fclose($handle);
        return $csv === false ? '' : $csv;
    }

    public function exportSql(PDO $pdo, string $table, array $rows, array $columns, string $driver = 'mysql'): string
    {
        $q = static fn(string $n): string => \App\Services\DatabaseService::quoteId($n, $driver);
        $sql = "-- SQL FILLER Export\nDROP TABLE IF EXISTS " . $q($table) . ";\n";
        if (count($columns) === 0) {
            return $sql;
        }
        foreach ($rows as $row) {
            $values = array_map(static function ($v) use ($pdo): string {
                return $v === null || $v === '' ? 'NULL' : $pdo->quote((string) $v);
            }, array_map(static fn(string $c) => $row[$c] ?? null, $columns));
            $sql .= sprintf("INSERT INTO %s (%s) VALUES (%s);\n", $q($table), implode(', ', array_map($q, $columns)), implode(', ', $values));
        }
        return $sql;
    }
}
