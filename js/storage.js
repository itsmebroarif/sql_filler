        function loadCachedDataOrDefaults() {
            // Check V2 Cache (Multi-DB)
            const cachedV2 = localStorage.getItem(STORAGE_KEY_V2);
            if (cachedV2) {
                try {
                    const parsed = JSON.parse(cachedV2);
                    if (parsed && Array.isArray(parsed.databases) && parsed.databases.length > 0) {
                        appState = parsed;
                        if (appState.activeDbIndex >= appState.databases.length) appState.activeDbIndex = 0;
                        renderAllUI();
                        return;
                    }
                } catch (e) {
                    console.error("V2 Cache invalid", e);
                }
            }

            // Migration from V1 Cache (Single DB)
            const cachedV1 = localStorage.getItem(STORAGE_KEY_LEGACY);
            if (cachedV1) {
                try {
                    const parsedV1 = JSON.parse(cachedV1);
                    if (parsedV1 && Array.isArray(parsedV1.tables)) {
                        appState = {
                            activeDbIndex: 0,
                            databases: [
                                {
                                    name: "db_default",
                                    activeTableIndex: parsedV1.activeTableIndex || 0,
                                    tables: parsedV1.tables
                                }
                            ]
                        };
                        saveToLocalStorage();
                        renderAllUI();
                        return;
                    }
                } catch (e) {
                    console.error("V1 Cache invalid", e);
                }
            }

            // Fallback: Default Sample Schema
            loadSampleSchema();
        }

        function saveToLocalStorage() {
            try {
                localStorage.setItem(STORAGE_KEY_V2, JSON.stringify(appState));
                const statusBadge = document.getElementById("auto-save-status");
                if (statusBadge) {
                    statusBadge.style.opacity = "1";
                }
            } catch (e) {
                console.error("Gagal menyimpan cache:", e);
            }
        }

        function getCurrentDatabase() {
            if (!appState.databases || appState.databases.length === 0) return null;
            return appState.databases[appState.activeDbIndex];
        }

        function getCurrentTable() {
            const db = getCurrentDatabase();
            if (!db || !db.tables || db.tables.length === 0) return null;
            if (db.activeTableIndex >= db.tables.length) db.activeTableIndex = 0;
            return db.tables[db.activeTableIndex];
        }
