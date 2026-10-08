        // COLUMN CRUD
        function addColumnRow() {
            const table = getCurrentTable();
            if (!table) return;

            Swal.fire({
                title: 'Tambah Kolom',
                html: `
                    <div class="mb-2">
                        <label class="form-label fw-bold fs-8" for="new-col-name">Nama Kolom</label>
                        <input class="form-control form-control-sm" id="new-col-name" placeholder="Kolom name">
                    </div>
                    <div class="mb-2">
                        <label class="form-label fw-bold fs-8" for="new-col-type">Tipe Data</label>
                        <select class="form-select form-select-sm" id="new-col-type">
                            ${DATA_TYPES.map(dt => `<option value="${dt}">${dt}</option>`).join('')}
                        </select>
                    </div>
                    <div class="mb-2">
                        <label class="form-label fw-bold fs-8" for="new-col-length">Length / Val</label>
                        <input class="form-control form-control-sm" id="new-col-length" placeholder="Contoh: 100, 12,2">
                    </div>
                    <div class="form-check mb-1">
                        <input class="form-check-input" type="checkbox" id="new-col-pk">
                        <label class="form-check-label fs-7" for="new-col-pk">Primary Key</label>
                    </div>
                    <div class="form-check mb-1">
                        <input class="form-check-input" type="checkbox" id="new-col-ai">
                        <label class="form-check-label fs-7" for="new-col-ai">Auto Increment</label>
                    </div>
                    <div class="form-check mb-1">
                        <input class="form-check-input" type="checkbox" id="new-col-notnull">
                        <label class="form-check-label fs-7" for="new-col-notnull">Not Null</label>
                    </div>
                    <div class="mb-2">
                        <label class="form-label fw-bold fs-8" for="new-col-defval">Default Value</label>
                        <input class="form-control form-control-sm" id="new-col-defval" placeholder="Kosongkan jika tidak ada">
                    </div>
                `,
                showCancelButton: true,
                confirmButtonText: 'Tambah',
                focusConfirm: true
            }).then((result) => {
                if (result.isConfirmed) {
                    const name = document.getElementById("new-col-name").value.trim();
                    const type = document.getElementById("new-col-type").value;
                    const length = document.getElementById("new-col-length").value.trim();
                    const pk = document.getElementById("new-col-pk").checked;
                    const ai = document.getElementById("new-col-ai").checked;
                    const notNull = document.getElementById("new-col-notnull").checked;
                    const defaultValue = document.getElementById("new-col-defval").value.trim();

                    if (!name || !type) {
                        Swal.fire('Peringatan', 'Nama kolom dan tipe data wajib diisi.', 'warning');
                        return;
                    }
                    if (table.columns.some(c => c.name.toLowerCase() === name.toLowerCase())) {
                        Swal.fire('Peringatan', 'Nama kolom sudah ada di tabel ini.', 'warning');
                        return;
                    }

                    table.columns.push({
                        name: name,
                        type: type,
                        length: length,
                        pk: pk,
                        ai: ai,
                        notNull: notNull,
                        defaultValue: defaultValue
                    });
                    saveToLocalStorage();
                    renderAllUI();
                    Swal.fire('Sukses', `Kolom '${name}' ditambahkan.`, 'success');
                }
            });
        }

        function addStandardIDColumn() {
            const table = getCurrentTable();
            if (!table) return;

            if (table.columns.some(c => c.name.toLowerCase() === 'id')) {
                Swal.fire('Info', 'Kolom "id" sudah ada di tabel ini.', 'info');
                return;
            }

            table.columns.unshift({
                name: "id",
                type: "INT",
                length: "11",
                pk: true,
                ai: true,
                notNull: true,
                defaultValue: ""
            });
            saveToLocalStorage();
            renderAllUI();
            Swal.fire('Sukses', 'Kolom id (PK, Auto Increment) ditambahkan.', 'success');
        }

        function addColumnRowFast(table) {
            // used by other functions as fallback
        }

        // COLUMN EDITING IN TABLE
        function renderColumnsTable() {
            const table = getCurrentTable();
            const tbody = document.getElementById("columns-table-body");
            if (!table || !table.columns) {
                tbody.innerHTML = `<tr><td colspan="8" class="text-center text-muted py-4">Belum ada kolom. Tambahkan di sini.</td></tr>`;
                return;
            }

            let html = '';
            table.columns.forEach((col, idx) => {
                html += `
                    <tr data-col-idx="${idx}">
                        <td style="min-width: 160px;">
                            <input class="form-control form-control-sm border-0 bg-transparent p-1" value="${escapeHtml(col.name)}"
                                onchange="updateColumnField(${idx}, 'name', this.value)">
                        </td>
                        <td style="min-width: 130px;">
                            <select class="form-select form-select-sm rounded-2 bg-light"
                                onchange="updateColumnField(${idx}, 'type', this.value)">
                                ${DATA_TYPES.map(dt => `<option value="${dt}" ${col.type === dt ? 'selected' : ''}>${dt}</option>`).join('')}
                            </select>
                        </td>
                        <td style="min-width: 100px;">
                            <input class="form-control form-control-sm border-0 bg-transparent p-1"
                                value="${escapeHtml(col.length)}"
                                onchange="updateColumnField(${idx}, 'length', this.value)">
                        </td>
                        <td class="text-center" style="min-width: 60px;">
                            <input type="checkbox" class="form-check-input ${col.pk ? 'checked' : ''}"
                                onchange="updateColumnField(${idx}, 'pk', this.checked)">
                        </td>
                        <td class="text-center" style="min-width: 60px;">
                            <input type="checkbox" class="form-check-input ${col.ai ? 'checked' : ''}"
                                onchange="updateColumnField(${idx}, 'ai', this.checked)">
                        </td>
                        <td class="text-center" style="min-width: 70px;">
                            <input type="checkbox" class="form-check-input ${col.notNull ? 'checked' : ''}"
                                onchange="updateColumnField(${idx}, 'notNull', this.checked)">
                        </td>
                        <td style="min-width: 130px;">
                            <input class="form-control form-control-sm border-0 bg-transparent p-1"
                                value="${escapeHtml(col.defaultValue)}"
                                onchange="updateColumnField(${idx}, 'defaultValue', this.value)">
                        </td>
                        <td class="text-center" style="min-width: 60px;">
                            <button class="btn btn-sm btn-link text-danger p-0" onclick="deleteColumn(${idx})" title="Hapus Kolom">
                                <i class="bi bi-trash"></i>
                            </button>
                        </td>
                    </tr>
                `;
            });
            tbody.innerHTML = html;
        }

        function updateColumnField(colIdx, field, value) {
            const table = getCurrentTable();
            if (!table) return;
            if (field === 'name') {
                if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(value)) {
                    Swal.fire('Peringatan', 'Nama kolom tidak valid. Gunakan huruf, angka, atau underscore.', 'warning');
                    // Revert
                    const cells = document.querySelectorAll(`[data-col-idx="${colIdx}"]`);
                    const nameInput = document.querySelector(`[data-col-idx="${colIdx}"] input`);
                    if (nameInput) nameInput.value = table.columns[colIdx].name;
                    return;
                }
                if (table.columns.some((c, i) => i !== colIdx && c.name.toLowerCase() === value.toLowerCase())) {
                    Swal.fire('Peringatan', 'Nama kolom sudah ada di tabel ini.', 'warning');
                    const nameInput = document.querySelector(`[data-col-idx="${colIdx}"] input`);
                    if (nameInput) nameInput.value = table.columns[colIdx].name;
                    return;
                }
            }

            table.columns[colIdx][field] = value;
            saveToLocalStorage();
            renderAllUI();
        }

        function deleteColumn(colIdx) {
            const table = getCurrentTable();
            if (!table) return;

            if (table.columns[colIdx].pk) {
                Swal.fire('Peringatan', 'Tidak bisa menghapus kolom Primary Key.', 'warning');
                return;
            }

            table.columns.splice(colIdx, 1);
            saveToLocalStorage();
            renderAllUI();
            Swal.fire('Berhasil', 'Kolom dihapus.', 'success');
        }
