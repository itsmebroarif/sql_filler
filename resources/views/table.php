<?php /** @var string $table @var array $rows @var array $columns @var int $total @var int $page @var int $perPage */ ?>
<div class="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
    <div>
        <h5 class="fw-bold mb-0 text-secondary"><i class="bi bi-table me-1"></i> <?= e($table) ?></h5>
        <small class="text-muted"><?= number_format($total) ?> baris total</small>
    </div>
    <div class="d-flex gap-2 align-items-center flex-wrap">
        <div class="btn-group btn-group-sm">
            <button class="btn btn-primary" id="records-btn-table" onclick="setViewMode('records','table')"><i class="bi bi-table"></i></button>
            <button class="btn btn-outline-primary" id="records-btn-card" onclick="setViewMode('records','card')"><i class="bi bi-grid-3x3-gap"></i></button>
        </div>
        <a class="btn btn-sm btn-outline-secondary rounded-3" href="<?= e(url('/export', ['table' => $table, 'format' => 'csv'])) ?>"><i class="bi bi-filetype-csv me-1"></i> CSV</a>
        <a class="btn btn-sm btn-outline-secondary rounded-3" href="<?= e(url('/export', ['table' => $table, 'format' => 'sql'])) ?>"><i class="bi bi-file-earmark-code me-1"></i> SQL</a>
    </div>
</div>

<!-- Struktur -->
<div class="card card-custom p-3 mb-3">
    <h6 class="fw-bold text-secondary mb-2"><i class="bi bi-list-nested me-1"></i> Struktur Kolom</h6>
    <div class="table-responsive">
        <table class="table table-sm table-hover table-grid align-middle mb-0">
            <thead><tr><th>Kolom</th><th>Tipe</th><th>Null</th><th>Default</th></tr></thead>
            <tbody>
            <?php foreach ($columns as $c): ?>
                <tr>
                    <td><b><?= e($c['Field'] ?? $c['name'] ?? '') ?></b><?= !empty($c['Key']) && str_contains($c['Key'], 'PRI') ? ' <i class="bi bi-key-fill text-warning"></i>' : '' ?></td>
                    <td><code><?= e($c['Type'] ?? ($c['type'] ?? '')) ?></code></td>
                    <td><?= e($c['Null'] ?? ($c['notnull'] ?? '')) ?></td>
                    <td><code><?= e($c['Default'] ?? ($c['dflt_value'] ?? '')) ?></code></td>
                </tr>
            <?php endforeach; ?>
            </tbody>
        </table>
    </div>
</div>

<!-- Records: Table view -->
<div class="card card-custom p-3" id="records-table">
    <div class="table-responsive" style="max-height: 520px; overflow-y:auto;">
        <table class="table table-hover table-grid align-middle mb-0">
            <thead><tr>
                <?php foreach ($rows ? array_keys($rows[0]) : [] as $col): ?>
                    <th><?= e($col) ?></th>
                <?php endforeach; ?>
            </tr></thead>
            <tbody>
            <?php foreach ($rows as $row): ?>
                <tr>
                    <?php foreach ($row as $val): ?>
                        <td class="fs-8"><?= e($val === null ? 'NULL' : (string) $val) ?></td>
                    <?php endforeach; ?>
                </tr>
            <?php endforeach; ?>
            <?php if (!$rows): ?><tr><td class="text-center text-muted py-3" colspan="99">Tidak ada data.</td></tr><?php endif; ?>
            </tbody>
        </table>
    </div>

    <?php $pages = max(1, (int) ceil($total / $perPage)); ?>
    <nav class="mt-3 d-flex justify-content-center">
        <ul class="pagination pagination-sm mb-0">
            <?php for ($p = 1; $p <= $pages; $p++): ?>
                <li class="page-item <?= $p === $page ? 'active' : '' ?>">
                    <a class="page-link" href="<?= e(url('/table/' . rawurlencode($table), ['page' => $p])) ?>"><?= $p ?></a>
                </li>
            <?php endfor; ?>
        </ul>
    </nav>
</div>

<!-- Records: Card view -->
<div id="records-cards" style="display:none;" class="row g-3">
    <?php foreach ($rows as $idx => $row): ?>
        <div class="col-12 col-md-6 col-xl-4">
            <div class="card card-custom p-3 h-100">
                <div class="small text-muted mb-1">#<?= (($page - 1) * $perPage) + $idx + 1 ?></div>
                <?php foreach ($row as $col => $val): ?>
                    <div class="d-flex justify-content-between border-bottom py-1">
                        <span class="text-muted small"><?= e($col) ?></span>
                        <span class="fw-medium small text-end" style="max-width:60%; overflow:hidden; text-overflow:ellipsis;"><?= e($val === null ? 'NULL' : (string) $val) ?></span>
                    </div>
                <?php endforeach; ?>
            </div>
        </div>
    <?php endforeach; ?>
</div>
