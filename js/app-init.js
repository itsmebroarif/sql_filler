        window.onload = function () {
            initPWAInstallPrompt();
            loadCachedDataOrDefaults();

            // Daftarkan Service Worker agar aplikasi dapat diinstall sebagai PWA
            if ('serviceWorker' in navigator) {
                navigator.serviceWorker.register('sw.js').catch(err => console.warn('SW register failed:', err));
            }

            // Render ERD & SQL Preview HANYA setelah tab benar-benar terlihat.
            document.querySelectorAll('[data-bs-toggle="tab"]').forEach(tabEl => {
                tabEl.addEventListener('shown.bs.tab', function () {
                    const targetId = this.getAttribute('data-bs-target');
                    if (targetId === '#tab-erd') renderD3ERD();
                    else if (targetId === '#tab-sql') updateSQLPreview();
                });
            });
        };
