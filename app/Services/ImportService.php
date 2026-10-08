<?php

declare(strict_types=1);

namespace App\Services;

use PDO;

class ImportService
{
    public function __construct(private DatabaseService $db)
    {
    }

    /** Import skrip SQL multi-statement. */
    public function importSql(PDO $pdo, string $sql): int
    {
        return $this->db->executeScript($pdo, $sql);
    }

    /** Import CSV menjadi tabel baru (header baris pertama = nama kolom). */
    public function importCsv(PDO $pdo, string $path, string $tableName): int
    {
        $handle = fopen($path, 'r');
        if ($handle === false) {
            throw new \RuntimeException('File CSV tidak dapat dibaca.');
        }

        $header = fgetcsv($handle);
        if (!$header) {
            fclose($handle);
            throw new \RuntimeException('CSV kosong atau tidak valid.');
        }

        $columns = array_map(
            static fn(string $h, int $i): string => trim($h) !== '' ? preg_replace('/[^a-zA-Z0-9_]/', '_', trim($h)) : 'col_' . ($i + 1),
            $header,
            array_keys($header)
        );

        $defs = implode(', ', array_map(static fn(string $c): string => '"' . $c . '" TEXT', $columns));
        $safeTable = preg_replace('/[^a-zA-Z0-9_]/', '_', $tableName);
        $pdo->exec('CREATE TABLE IF NOT EXISTS "' . $safeTable . '" (' . $defs . ')');

        $placeholders = implode(',', array_fill(0, count($columns), '?'));
        $stmt = $pdo->prepare('INSERT INTO "' . $safeTable . '" ("' . implode('","', $columns) . '") VALUES (' . $placeholders . ')');

        $inserted = 0;
        while (($row = fgetcsv($handle)) !== false) {
            if (count($row) < count($columns)) {
                $row = array_pad($row, count($columns), null);
            }
            $stmt->execute(array_slice($row, 0, count($columns)));
            $inserted++;
        }
        fclose($handle);
        return $inserted;
    }
}
