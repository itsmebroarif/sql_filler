<?php /** @var array $tables @var array $creds @var array|null $databases */ ?>
<?php if (!empty($databases)): ?>
    <div class="mb-3">
        <h5 class="fw-bold mb-0 text-secondary"><i class="bi bi-databases me-1"></i> Pilih Database</h5>
        <small class="text-muted">Anda login tanpa database. Pilih salah satu untuk melanjutkan.</small>
    </div>
    <div class="row g-3">
        <?php foreach ($databases as $db): ?>
            <div class="col-12 col-sm-6 col-lg-4">
                <a class="card card-custom p-3 text-decoration-none d-flex align-items-center gap-2" href="<?= e(url('/database', ['name' => $db])) ?>">
                    <i class="bi bi-database text-primary fs-4"></i>
                    <b class="text-dark"><?= e($db) ?></b>
                </a>
            </div>
        <?php endforeach; ?>
    </div>
<?php else: ?>

<div class="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
    <div>
        <h5 class="fw-bold mb-0 text-secondary"><i class="bi bi-speedometer2 me-1"></i> Dashboard</h5>
        <small class="text-muted">Database: <b><?= e($creds['database'] ?? '') ?></b> (<?= e($creds['driver'] ?? '') ?>)</small>
    </div>
    <div class="btn-group btn-group-sm">
        <button class="btn btn-primary" id="tables-btn-table" onclick="setViewMode('tables','table')"><i class="bi bi-table"></i></button>
        <button class="btn btn-outline-primary" id="tables-btn-card" onclick="setViewMode('tables','card')"><i class="bi bi-grid-3x3-gap"></i></button>
    </div>
</div>

<!-- Table view -->
<div class="card card-custom p-3" id="tables-table">
    <table class="table table-hover table-grid align-middle mb-0">
        <thead><tr><th>#</th><th>Nama Tabel</th><th class="text-end">Aksi</th></tr></thead>
        <tbody>
        <?php foreach ($tables as $i => $t): ?>
            <tr>
                <td><?= $i + 1 ?></td>
                <td><i class="bi bi-table text-primary me-2"></i><b><?= e($t) ?></b></td>
                <td class="text-end">
                    <a class="btn btn-sm btn-outline-primary rounded-3" href="<?= e(url('/table/' . rawurlencode($t))) ?>">Buka</a>
                    <a class="btn btn-sm btn-outline-secondary rounded-3" href="<?= e(url('/export', ['table' => $t, 'format' => 'csv'])) ?>">CSV</a>
                    <a class="btn btn-sm btn-outline-secondary rounded-3" href="<?= e(url('/export', ['table' => $t, 'format' => 'sql'])) ?>">SQL</a>
                </td>
            </tr>
        <?php endforeach; ?>
        </tbody>
    </table>
</div>

<!-- Card view -->
<div id="tables-cards" style="display:none;" class="row g-3">
    <?php foreach ($tables as $t): ?>
        <div class="col-12 col-sm-6 col-lg-4">
            <div class="card card-custom p-3 h-100">
                <div class="d-flex align-items-center gap-2 mb-2">
                    <i class="bi bi-table text-primary fs-4"></i>
                    <b class="text-truncate"><?= e($t) ?></b>
                </div>
                <div class="d-flex gap-2 mt-auto">
                    <a class="btn btn-sm btn-outline-primary rounded-3 flex-grow-1" href="<?= e(url('/table/' . rawurlencode($t))) ?>">Buka</a>
                    <a class="btn btn-sm btn-outline-secondary rounded-3" href="<?= e(url('/export', ['table' => $t, 'format' => 'csv'])) ?>"><i class="bi bi-filetype-csv"></i></a>
                    <a class="btn btn-sm btn-outline-secondary rounded-3" href="<?= e(url('/export', ['table' => $t, 'format' => 'sql'])) ?>"><i class="bi bi-file-earmark-code"></i></a>
                </div>
            </div>
        </div>
    <?php endforeach; ?>
</div>
<?php endif; ?>
