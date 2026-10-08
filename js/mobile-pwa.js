        function toggleMobileSidebar(show) {
            const sidebar = document.getElementById("app-sidebar");
            const backdrop = document.getElementById("sidebar-backdrop");
            if (show) {
                sidebar.classList.add("show-mobile");
                backdrop.classList.add("show");
            } else {
                sidebar.classList.remove("show-mobile");
                backdrop.classList.remove("show");
            }
        }

        function switchMobileTab(target) {
            const tabsMap = {
                'tables': () => toggleMobileSidebar(true),
                'columns': () => new bootstrap.Tab(document.getElementById('columns-tab')).show(),
                'data': () => new bootstrap.Tab(document.getElementById('data-tab')).show(),
                'erd': () => new bootstrap.Tab(document.getElementById('erd-tab')).show(),
                'sql': () => new bootstrap.Tab(document.getElementById('sql-tab')).show(),
                'query': () => new bootstrap.Tab(document.getElementById('query-tab')).show()
            };

            // Update mobile bottom nav active style
            document.querySelectorAll(".mobile-nav-item").forEach(el => el.classList.remove("active"));
            const activeBtn = document.getElementById(`mob-nav-${target}`);
            if (activeBtn) activeBtn.classList.add("active");

            if (tabsMap[target]) tabsMap[target]();
        }

        function initPWAInstallPrompt() {
            window.addEventListener('beforeinstallprompt', (e) => {
                e.preventDefault();
                deferredPWAPrompt = e;
                const pwaBtn = document.getElementById('pwa-install-btn');
                if (pwaBtn) {
                    pwaBtn.classList.remove('d-none');
                    pwaBtn.classList.add('d-flex');
                }
            });
        }

        function installPWAApp() {
            if (!deferredPWAPrompt) return;
            deferredPWAPrompt.prompt();
            deferredPWAPrompt.userChoice.then((choiceResult) => {
                if (choiceResult.outcome === 'accepted') {
                    console.log('PWA installed');
                }
                deferredPWAPrompt = null;
            });
        }
