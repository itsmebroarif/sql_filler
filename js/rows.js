        // DATA GRID & BULK FILL
        function renderDataGrid() {
            const thead = document.getElementById("data-table-head");
            const tbody = document.getElementById("data-table-body");
            thead.innerHTML = "";
            tbody.innerHTML = "";

            const table = getCurrentTable();
            if (!table || table.columns.length === 0) {
                tbody.innerHTML = `<tr><td class="text-center text-muted py-4">Belum ada kolom. Tambahkan di tab Structure.</td></tr>`;
                return;
            }

            let headerHTML = "<tr><th style='width: 40px;' class='text-center'>#</th>";
            table.columns.forEach(col => {
                headerHTML += `
                    <th style="min-width: 130px;">
                        <div class="d-flex align-items-center justify-content-between">
                            <span>${escapeHtml(col.name)} ${col.pk ? '<i class="bi bi-key-fill text-warning ms-1"></i>' : ''}</span>
                            <span class="badge bg-secondary-subtle text-secondary font-monospace fw-normal fs-8">${escapeHtml(col.type)}</span>
                        </div>
                    </th>
                `;
            });
            headerHTML += "<th style='width: 50px;' class='text-center'>Aksi</th></tr>";
            thead.innerHTML = headerHTML;

            if (table.rows.length === 0) {
                tbody.innerHTML = `<tr><td colspan="${table.columns.length + 2}" class="text-center text-muted py-4">Belum ada record data. Gunakan Smart Bulk Fill.</td></tr>`;
                return;
            }

            table.rows.forEach((row, rowIdx) => {
                const tr = document.createElement("tr");
                let rowHTML = `<td class="text-center fw-bold text-muted fs-8">${rowIdx + 1}</td>`;

                table.columns.forEach(col => {
                    const cellVal = row[col.name] !== undefined ? row[col.name] : "";
                    rowHTML += `
                        <td>
                            <input type="text" class="form-control form-control-sm border-0 bg-transparent p-1 fs-8 data-cell-input"
                                value="${escapeHtml(cellVal)}"
                                data-row-idx="${rowIdx}" data-col-name="${escapeHtml(col.name)}">
                        </td>
                    `;
                });

                rowHTML += `
                    <td class="text-center">
                        <button class="btn btn-sm btn-link text-danger p-0 data-del-row" data-row-idx="${rowIdx}">
                            <i class="bi bi-trash"></i>
                        </button>
                    </td>
                `;
                tr.innerHTML = rowHTML;
                tbody.appendChild(tr);
            });
        }

        // Event delegation untuk data grid (menghindari inline handler yang rentan)
        function initDataGridDelegation() {
            const tbody = document.getElementById("data-table-body");
            if (!tbody || tbody.dataset.delegationBound === "true") return;
            tbody.dataset.delegationBound = "true";

            tbody.addEventListener("change", function (e) {
                const input = e.target.closest(".data-cell-input");
                if (!input) return;
                updateRowCellValue(
                    parseInt(input.dataset.rowIdx),
                    input.dataset.colName,
                    input.value
                );
            });

            tbody.addEventListener("click", function (e) {
                const btn = e.target.closest(".data-del-row");
                if (!btn) return;
                deleteDataRow(parseInt(btn.dataset.rowIdx));
            });
        }

        function updateRowCellValue(rowIdx, colName, value) {
            const table = getCurrentTable();
            if (table && table.rows[rowIdx]) {
                table.rows[rowIdx][colName] = value;
                saveToLocalStorage();
                updateSQLPreview();
            }
        }

        function addDataRow() {
            const table = getCurrentTable();
            if (!table) return;

            const newRow = {};
            table.columns.forEach(col => {
                if (col.ai) {
                    const existingMax = table.rows.reduce((max, r) => Math.max(max, parseInt(r[col.name]) || 0), 0);
                    newRow[col.name] = existingMax + 1;
                } else if (col.defaultValue) {
                    newRow[col.name] = col.defaultValue;
                } else {
                    newRow[col.name] = "";
                }
            });

            table.rows.push(newRow);
            saveToLocalStorage();
            renderDataGrid();
            updateHeaderTitle();
            updateSQLPreview();
        }

        function deleteDataRow(rowIdx) {
            const table = getCurrentTable();
            if (!table) return;

            table.rows.splice(rowIdx, 1);
            saveToLocalStorage();
            renderDataGrid();
            updateHeaderTitle();
            updateSQLPreview();
        }

        function clearAllRows() {
            const table = getCurrentTable();
            if (!table) return;

            Swal.fire({
                title: 'Kosongkan Records?',
                text: `Hapus seluruh ${table.rows.length} baris data?`,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#d33',
                confirmButtonText: 'Kosongkan'
            }).then((res) => {
                if (res.isConfirmed) {
                    table.rows = [];
                    saveToLocalStorage();
                    renderDataGrid();
                    updateHeaderTitle();
                    updateSQLPreview();
                }
            });
        }
