<div class="text-center text-muted py-5">
    <i class="bi bi-exclamation-circle fs-1"></i>
    <h5 class="mt-3"><?= e($title ?? 'Error') ?></h5>
    <p><?= e($message ?? 'Terjadi kesalahan.') ?></p>
    <a class="btn btn-sm btn-outline-primary rounded-3" href="<?= e(url('/')) ?>">Kembali</a>
</div>
