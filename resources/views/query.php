<?php /** @var string $sql @var ?array $result @var ?string $error */ ?>
<div class="d-flex justify-content-between align-items-center mb-3">
    <h5 class="fw-bold mb-0 text-secondary"><i class="bi bi-code-slash me-1"></i> SQL Console</h5>
    <small class="text-muted">Eksekusi query langsung ke koneksi aktif</small>
</div>

<?php if ($error): ?><div class="alert alert-danger"><?= e($error) ?></div><?php endif; ?>

<form method="POST" action="<?= e(url('/query')) ?>">
    <?= csrf_field() ?>
    <div class="sql-editor mb-2" id="console-sql-editor">
        <textarea class="sql-editor-textarea" name="sql" rows="8" style="background:#0d1117; color:#c9d1d9; caret-color:#c9d1d9;"><?= e($sql) ?></textarea>
    </div>
    <button class="btn btn-md-contained query-btn query-btn-run" style="background:#6200ee;color:#fff;"><i class="bi bi-play-fill me-1"></i> Run Query</button>
</form>

<?php if ($result): ?>
    <div class="card card-custom p-3 mt-3">
        <?php if ($result['type'] === 'affected'): ?>
            <div class="alert alert-success mb-0"><i class="bi bi-check-circle me-1"></i> <?= (int) $result['count'] ?> baris terpengaruh.</div>
        <?php else: ?>
            <div class="d-flex justify-content-between align-items-center mb-2">
                <b>Hasil Query</b>
                <div class="btn-group btn-group-sm">
                    <button class="btn btn-primary" id="result-btn-table" onclick="setViewMode('result','table')"><i class="bi bi-table"></i></button>
                    <button class="btn btn-outline-primary" id="result-btn-card" onclick="setViewMode('result','card')"><i class="bi bi-grid-3x3-gap"></i></button>
                </div>
            </div>
            <div class="table-responsive" id="result-table">
                <table class="table table-hover table-grid align-middle mb-0">
                    <thead><tr><?php foreach ($result['columns'] as $c): ?><th><?= e($c) ?></th><?php endforeach; ?></tr></thead>
                    <tbody>
                    <?php foreach ($result['rows'] as $row): ?>
                        <tr><?php foreach ($row as $v): ?><td class="fs-8"><?= e($v === null ? 'NULL' : (string) $v) ?></td><?php endforeach; ?></tr>
                    <?php endforeach; ?>
                    </tbody>
                </table>
            </div>
            <div id="result-cards" style="display:none;" class="row g-3">
                <?php foreach ($result['rows'] as $row): ?>
                    <div class="col-12 col-md-6 col-xl-4">
                        <div class="card card-custom p-3 h-100">
                            <?php foreach ($row as $col => $val): ?>
                                <div class="d-flex justify-content-between border-bottom py-1">
                                    <span class="text-muted small"><?= e($col) ?></span>
                                    <span class="fw-medium small text-end" style="max-width:60%;"><?= e($val === null ? 'NULL' : (string) $val) ?></span>
                                </div>
                            <?php endforeach; ?>
                        </div>
                    </div>
                <?php endforeach; ?>
            </div>
        <?php endif; ?>
    </div>
<?php endif; ?>
