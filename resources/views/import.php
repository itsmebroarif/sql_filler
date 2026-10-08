<?php /** @var ?string $resultMsg @var ?string $error */ ?>
<h5 class="fw-bold mb-3 text-secondary"><i class="bi bi-cloud-arrow-up me-1"></i> Import Data</h5>

<?php if ($resultMsg): ?><div class="alert alert-success"><?= e($resultMsg) ?></div><?php endif; ?>
<?php if ($error): ?><div class="alert alert-danger"><?= e($error) ?></div><?php endif; ?>

<div class="row g-3">
    <div class="col-12 col-lg-6">
        <div class="card card-custom p-3 h-100">
            <h6 class="fw-bold text-secondary"><i class="bi bi-file-earmark-code me-1"></i> Import Skrip SQL</h6>
            <form method="POST" action="<?= e(url('/import')) ?>" enctype="multipart/form-data">
                <?= csrf_field() ?>
                <input type="hidden" name="type" value="sql">
                <label class="form-label fs-8 fw-bold">Tempel skrip SQL</label>
                <textarea class="form-control form-control-sm font-monospace mb-2" rows="6" name="sql_text" placeholder="CREATE TABLE ...; INSERT INTO ...;"></textarea>
                <label class="form-label fs-8 fw-bold">atau upload file .sql</label>
                <input class="form-control form-control-sm mb-3" type="file" name="file" accept=".sql,.txt">
                <button class="btn btn-primary btn-sm" style="background:#6200ee;border-color:#6200ee;"><i class="bi bi-upload me-1"></i> Import SQL</button>
            </form>
        </div>
    </div>
    <div class="col-12 col-lg-6">
        <div class="card card-custom p-3 h-100">
            <h6 class="fw-bold text-secondary"><i class="bi bi-filetype-csv me-1"></i> Import CSV</h6>
            <form method="POST" action="<?= e(url('/import')) ?>" enctype="multipart/form-data">
                <?= csrf_field() ?>
                <input type="hidden" name="type" value="csv">
                <label class="form-label fs-8 fw-bold">Nama tabel tujuan</label>
                <input class="form-control form-control-sm mb-2" name="table_name" placeholder="nama_tabel" required>
                <label class="form-label fs-8 fw-bold">File CSV (baris pertama = header)</label>
                <input class="form-control form-control-sm mb-3" type="file" name="file" accept=".csv,.txt" required>
                <button class="btn btn-primary btn-sm" style="background:#6200ee;border-color:#6200ee;"><i class="bi bi-upload me-1"></i> Import CSV</button>
            </form>
        </div>
    </div>
</div>
