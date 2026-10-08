        function updateHeaderTitle() {
            const table = getCurrentTable();
            if (table) {
                document.getElementById("current-table-title").innerText = `Tabel: ${table.name}`;
                document.getElementById("table-row-count-badge").innerText = `${table.rows.length} Record(s)`;
            } else {
                document.getElementById("current-table-title").innerText = "Belum Ada Tabel";
                document.getElementById("table-row-count-badge").innerText = "0 Rows";
            }
        }

        // DATABASE CRUD
        function promptCreateDatabase() {
            Swal.fire({
                title: 'Database Baru',
                input: 'text',
                inputLabel: 'Nama Database (contoh: db_akuntansi)',
                inputPlaceholder: 'db_nama',
                showCancelButton: true,
                confirmButtonText: 'Buat Database',
                inputValidator: (val) => {
                    if (!val || !val.trim()) return 'Nama DB tidak boleh kosong!';
                    if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(val.trim())) return 'Format nama tidak valid!';
                }
            }).then((result) => {
                if (result.isConfirmed) {
                    const dbName = result.value.trim().toLowerCase();
                    appState.databases.push({
                        name: dbName,
                        activeTableIndex: 0,
                        tables: []
                    });
                    appState.activeDbIndex = appState.databases.length - 1;
                    saveToLocalStorage();
                    renderAllUI();
                    Swal.fire('Sukses', `Database '${dbName}' dibuat!`, 'success');
                }
            });
        }

        function promptSelectDatabase() {
            const options = {};
            appState.databases.forEach((db, idx) => {
                options[idx] = `${db.name} (${db.tables.length} tabel)`;
            });

            Swal.fire({
                title: 'Pilih Database Target',
                input: 'select',
                inputOptions: options,
                inputValue: appState.activeDbIndex,
                showCancelButton: true,
                confirmButtonText: 'Buka Database'
            }).then((result) => {
                if (result.isConfirmed && result.value !== undefined) {
                    appState.activeDbIndex = parseInt(result.value);
                    saveToLocalStorage();
                    renderAllUI();
                }
            });
        }

        // TABLE CRUD
        function addNewTablePrompt() {
            const db = getCurrentDatabase();
            if (!db) return;

            Swal.fire({
                title: 'Tambah Tabel Baru',
                input: 'text',
                inputLabel: `Akan ditambahkan ke '${db.name}'`,
                inputPlaceholder: 'nama_tabel',
                showCancelButton: true,
                confirmButtonText: 'Buat Tabel',
                inputValidator: (val) => {
                    if (!val || !val.trim()) return 'Nama tabel tidak boleh kosong!';
                    if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(val.trim())) return 'Format nama tabel tidak valid!';
                    if (db.tables.some(t => t.name.toLowerCase() === val.trim().toLowerCase())) {
                        return 'Nama tabel sudah ada di database ini!';
                    }
                }
            }).then((result) => {
                if (result.isConfirmed) {
                    const tableName = result.value.trim().toLowerCase();
                    db.tables.push({
                        name: tableName,
                        columns: [],
                        rows: []
                    });
                    db.activeTableIndex = db.tables.length - 1;
                    saveToLocalStorage();
                    renderAllUI();
                    Swal.fire('Sukses', `Tabel '${tableName}' dibuat!`, 'success');
                }
            });
        }

        function renameTablePrompt(idx) {
            const db = getCurrentDatabase();
            if (!db) return;

            const table = db.tables[idx];
            Swal.fire({
                title: 'Ubah Nama Tabel',
                input: 'text',
                inputLabel: `Tabel saat ini: ${table.name}`,
                inputValue: table.name,
                showCancelButton: true,
                confirmButtonText: 'Ubah',
                inputValidator: (val) => {
                    if (!val || !val.trim()) return 'Nama tabel tidak boleh kosong!';
                    if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(val.trim())) return 'Format nama tidak valid!';
                    if (db.tables.some(t => t.name.toLowerCase() === val.trim().toLowerCase() && t !== table)) {
                        return 'Nama sudah dipakai!';
                    }
                }
            }).then((result) => {
                if (result.isConfirmed) {
                    const newName = result.value.trim().toLowerCase();
                    table.name = newName;
                    saveToLocalStorage();
                    renderAllUI();
                    Swal.fire('Sukses', `Tabel diubah menjadi '${newName}'`, 'success');
                }
            });
        }

        function deleteTablePrompt(idx) {
            const db = getCurrentDatabase();
            if (!db) return;

            Swal.fire({
                title: 'Hapus Tabel?',
                text: `Tabel '${db.tables[idx].name}' beserta data akan dihapus secara permanen.`,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#d33',
                confirmButtonText: 'Hapus'
            }).then((result) => {
                if (result.isConfirmed) {
                    db.tables.splice(idx, 1);
                    if (db.activeTableIndex >= db.tables.length) db.activeTableIndex = 0;
                    saveToLocalStorage();
                    renderAllUI();
                    Swal.fire('Berhasil', 'Tabel dihapus.', 'success');
                }
            });
        }
