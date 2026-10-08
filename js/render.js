        function renderAllUI() {
            renderActiveDatabaseHeader();
            renderSidebarTables();
            renderColumnsTable();
            renderDataGrid();
            initDataGridDelegation();
            updateHeaderTitle();
            updateSQLPreview();
        }

        function renderActiveDatabaseHeader() {
            const db = getCurrentDatabase();
            const dbName = db ? db.name : "None";
            document.getElementById("active-db-name-label").innerText = dbName;
            document.getElementById("header-db-badge").innerText = `DB: ${dbName}`;
        }

        function renderSidebarTables() {
            const container = document.getElementById("tables-list-container");
            container.innerHTML = "";

            const db = getCurrentDatabase();
            if (!db || !db.tables || db.tables.length === 0) {
                container.innerHTML = `<div class="text-center text-white-50 fs-8 py-3">Belum ada tabel di DB ini</div>`;
                return;
            }

            db.tables.forEach((tbl, idx) => {
                const isActive = idx === db.activeTableIndex;
                const div = document.createElement("div");
                div.className = `table-list-item ${isActive ? 'active' : ''}`;
                div.onclick = () => {
                    db.activeTableIndex = idx;
                    saveToLocalStorage();
                    renderAllUI();
                    toggleMobileSidebar(false);
                };

                div.innerHTML = `
                    <div class="d-flex align-items-center gap-2 text-truncate">
                        <i class="bi bi-table"></i>
                        <span class="text-truncate">${escapeHtml(tbl.name)}</span>
                    </div>
                    <div class="d-flex gap-2 align-items-center" onclick="event.stopPropagation();">
                        <i class="bi bi-pencil-square hover-icon text-white-50" title="Ubah Nama" onclick="renameTablePrompt(${idx})"></i>
                        <i class="bi bi-trash hover-icon text-danger-subtle" title="Hapus" onclick="deleteTablePrompt(${idx})"></i>
                    </div>
                `;
                container.appendChild(div);
            });
        }
