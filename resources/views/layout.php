<?php
use App\Core\Auth;
use App\Services\DatabaseService;

$creds = Auth::creds();
$currentPath = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH);
$navTables = [];
if ($creds !== null) {
    try {
        $svc = new DatabaseService($creds['driver']);
        $navTables = $svc->tables($svc->connect($creds), $creds['driver']);
    } catch (Throwable) {
        $navTables = [];
    }
}

// Posisi deploy (sub-folder) support
$base = rtrim(dirname($_SERVER['SCRIPT_NAME'] ?? ''), '/\\');
?>
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?= e($title ?? 'SQL FILLER DBMS') ?></title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;500;600&family=Roboto:wght@300;400;500;700&display=swap" rel="stylesheet">
    <link href="<?= e($base) ?>/css/styles.css" rel="stylesheet">
    <link href="<?= e($base) ?>/css/neobrutal.css" rel="stylesheet">
</head>
<body>
<div class="marquee-strip"><div class="marquee-track">
    <span>SQL FILLER DBMS ★ IMPORT DATA ★ EXPORT SQL ★ QUERY BUILDER ★ ERD VISUALIZER ★ PWA READY ★ SYNC DB LOCAL ★</span>
    <span>SQL FILLER DBMS ★ IMPORT DATA ★ EXPORT SQL ★ QUERY BUILDER ★ ERD VISUALIZER ★ PWA READY ★ SYNC DB LOCAL ★</span>
</div></div>
<div class="d-flex w-100 overflow-hidden position-relative">
    <?php if ($creds !== null): ?>
    <div class="sidebar-backdrop" id="sidebar-backdrop" onclick="toggleMobileSidebar(false)"></div>
    <aside class="sidebar" id="app-sidebar">
        <div class="brand d-flex align-items-center gap-2">
            <div class="rounded-circle p-2 d-flex align-items-center justify-content-center" style="width:38px;height:38px;background:linear-gradient(135deg,#6200ee,#bb86fc);">
                <i class="bi bi-database-fill-gear text-white fs-5"></i>
            </div>
            <div>
                <div class="brand-title lh-1">SQL FILLER</div>
                <small class="text-white-50" style="font-size:0.68rem;">DBMS Studio</small>
            </div>
            <button class="btn btn-sm text-white-50 ms-auto d-lg-none" onclick="toggleMobileSidebar(false)"><i class="bi bi-x-lg"></i></button>
        </div>

        <div class="drawer-section-label">Koneksi Aktif</div>
        <div class="db-select-box d-flex align-items-center gap-2 mx-3">
            <i class="bi bi-hdd-network text-warning"></i>
            <span class="text-truncate"><?= e(($creds['driver'] ?? '') . ' • ' . ($creds['database'] ?? '')) ?></span>
        </div>

        <div class="drawer-section-label mt-3">Navigasi</div>
        <a class="table-list-item text-decoration-none <?= $currentPath === '/' ? 'active' : '' ?>" href="<?= e(url('/')) ?>"><i class="bi bi-speedometer2 me-2"></i> Dashboard</a>
        <a class="table-list-item text-decoration-none <?= str_starts_with($currentPath, '/query') ? 'active' : '' ?>" href="<?= e(url('/query')) ?>"><i class="bi bi-code-slash me-2"></i> SQL Console</a>
        <a class="table-list-item text-decoration-none <?= str_starts_with($currentPath, '/import') ? 'active' : '' ?>" href="<?= e(url('/import')) ?>"><i class="bi bi-cloud-arrow-up me-2"></i> Import Data</a>

        <div class="drawer-section-label mt-3">Tabel Database</div>
        <div style="overflow-y:auto; flex:1;">
            <?php foreach ($navTables as $t): ?>
                <a class="table-list-item text-decoration-none" href="<?= e(url('/table/' . rawurlencode($t))) ?>">
                    <span><i class="bi bi-table me-2"></i><?= e($t) ?></span>
                    <i class="bi bi-chevron-right small"></i>
                </a>
            <?php endforeach; ?>
            <?php if (!$navTables): ?>
                <div class="text-white-50 small px-4 py-2">Tidak ada tabel.</div>
            <?php endif; ?>
        </div>

        <div class="p-3 border-top border-secondary border-opacity-25">
            <form method="POST" action="<?= e(url('/logout')) ?>">
                <?= csrf_field() ?>
                <button class="btn btn-sm btn-outline-danger w-100"><i class="bi bi-box-arrow-right me-1"></i> Logout</button>
            </form>
        </div>
    </aside>
    <?php endif; ?>

    <main class="main-workspace">
        <?php if ($creds !== null): ?>
        <div class="top-navbar d-flex align-items-center justify-content-between px-3 py-2">
            <div class="d-flex align-items-center gap-2">
                <button class="btn btn-sm btn-light border d-lg-none" onclick="toggleMobileSidebar(true)"><i class="bi bi-list fs-5"></i></button>
                <span class="badge bg-primary-subtle text-primary border border-primary-subtle font-monospace">DB: <?= e($creds['database'] ?? '-') ?></span>
            </div>
            <span class="badge rounded-pill bg-secondary-subtle text-secondary border px-2 py-1 fs-8"><?= e($creds['driver'] ?? '') ?> driver</span>
        </div>
        <?php endif; ?>

        <div class="p-3 p-md-4 flex-grow-1 overflow-y-auto">
            <?php if ($m = flash('success')): ?><div class="alert alert-success"><?= e($m) ?></div><?php endif; ?>
            <?php if ($m = flash('error')): ?><div class="alert alert-danger"><?= e($m) ?></div><?php endif; ?>
            <?= $content ?>
        </div>
    </main>
</div>

<?php if ($creds !== null): ?>
<nav class="mobile-bottom-nav d-lg-none">
    <a class="mobile-nav-item <?= $currentPath === '/' ? 'active' : '' ?>" href="<?= e(url('/')) ?>"><i class="bi bi-speedometer2"></i><span>Home</span></a>
    <a class="mobile-nav-item <?= str_starts_with($currentPath, '/query') ? 'active' : '' ?>" href="<?= e(url('/query')) ?>"><i class="bi bi-code-slash"></i><span>SQL</span></a>
    <a class="mobile-nav-item <?= str_starts_with($currentPath, '/import') ? 'active' : '' ?>" href="<?= e(url('/import')) ?>"><i class="bi bi-cloud-arrow-up"></i><span>Import</span></a>
</nav>
<?php endif; ?>

<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
<script>
function toggleMobileSidebar(show) {
    const sidebar = document.getElementById('app-sidebar');
    const backdrop = document.getElementById('sidebar-backdrop');
    if (!sidebar || !backdrop) return;
    sidebar.classList.toggle('show-mobile', show);
    backdrop.classList.toggle('show', show);
}
function setViewMode(containerId, mode) {
    const tableEl = document.getElementById(containerId + '-table');
    const cardEl = document.getElementById(containerId + '-cards');
    const btnTable = document.getElementById(containerId + '-btn-table');
    const btnCard = document.getElementById(containerId + '-btn-card');
    const isTable = mode === 'table';
    tableEl.style.display = isTable ? '' : 'none';
    cardEl.style.display = isTable ? 'none' : '';
    btnTable.classList.toggle('btn-primary', isTable);
    btnTable.classList.toggle('btn-outline-primary', !isTable);
    btnCard.classList.toggle('btn-primary', !isTable);
    btnCard.classList.toggle('btn-outline-primary', isTable);
}
</script>
</body>
</html>
