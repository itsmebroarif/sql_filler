<?php /** @var string $title */ ?>
<div class="d-flex align-items-center justify-content-center" style="min-height: 90vh;">
    <div class="card card-custom p-4" style="width: 100%; max-width: 440px;">
        <div class="text-center mb-3">
            <div class="rounded-circle p-3 d-inline-flex" style="background: linear-gradient(135deg,#6200ee,#bb86fc);">
                <i class="bi bi-database-fill-gear text-white fs-3"></i>
            </div>
            <h4 class="fw-bold mt-2 mb-0">SQL FILLER DBMS</h4>
            <small class="text-muted">Login ke database Anda (seperti Adminer)</small>
        </div>

        <?php if ($m = flash('error')): ?><div class="alert alert-danger py-2"><?= e($m) ?></div><?php endif; ?>

        <form method="POST" action="<?= e(url('/login')) ?>">
            <?= csrf_field() ?>
            <label class="form-label fs-8 fw-bold">System</label>
            <select class="form-select form-select-sm mb-2" name="driver" id="login-driver">
                <option value="mysql" <?= old('driver') === 'mysql' ? 'selected' : '' ?>>MySQL / MariaDB</option>
                <option value="pgsql" <?= old('driver') === 'pgsql' ? 'selected' : '' ?>>PostgreSQL</option>
                <option value="sqlite" <?= old('driver') === 'sqlite' ? 'selected' : '' ?>>SQLite</option>
            </select>

            <label class="form-label fs-8 fw-bold">Server</label>
            <input class="form-control form-control-sm mb-2" name="server" value="<?= e(old('server', 'localhost')) ?>" placeholder="localhost">

            <label class="form-label fs-8 fw-bold">Username</label>
            <input class="form-control form-control-sm mb-2" name="username" value="<?= e(old('username')) ?>" autocomplete="username">

            <label class="form-label fs-8 fw-bold">Password</label>
            <input class="form-control form-control-sm mb-2" type="password" name="password" autocomplete="current-password">

            <label class="form-label fs-8 fw-bold">Database</label>
            <input class="form-control form-control-sm mb-3" name="database" value="<?= e(old('database')) ?>" placeholder="nama_database / path file .sqlite">

            <button class="btn btn-primary w-100" style="background:#6200ee; border-color:#6200ee;"><i class="bi bi-box-arrow-in-right me-1"></i> Login</button>
        </form>
    </div>
</div>
<script>
document.getElementById('login-driver').addEventListener('change', function () {
    const dbInput = document.querySelector('input[name=database]');
    if (this.value === 'sqlite') {
        dbInput.placeholder = 'C:\\path\\ke\\file.sqlite';
        document.querySelector('input[name=server]').value = '';
    } else {
        dbInput.placeholder = 'nama_database';
        if (!document.querySelector('input[name=server]').value) document.querySelector('input[name=server]').value = 'localhost';
    }
});
</script>
