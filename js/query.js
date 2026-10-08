        function switchTabAndShowQuery() {
            switchMobileTab('query');
            refreshQueryOptions();
        }

        function refreshQueryOptions() {
            const tableSelect = document.getElementById("query-table-select");
            const currentVal = tableSelect.value;

            tableSelect.innerHTML = '<option value="">-- Pilih Tabel --</option>';
            const db = getCurrentDatabase();
            if (db && db.tables) {
                db.tables.forEach(tbl => {
                    const opt = document.createElement('option');
                    opt.value = tbl.name;
                    opt.textContent = tbl.name;
                    tableSelect.appendChild(opt);
                });
            }

            if (currentVal && db && db.tables) {
                const found = db.tables.find(t => t.name === currentVal);
                if (found) {
                    tableSelect.value = found.name;
                }
            }
            updateQueryResult();
        }

        function clearQuery() {
            const tableSelect = document.getElementById("query-table-select");
            const opSelect = document.getElementById("query-operator-select");
            const valInput = document.getElementById("query-value-input");
            const includeSoft = document.getElementById("query-include-soft-delete");
            const selAll = document.getElementById("query-select-all");

            tableSelect.value = "";
            opSelect.value = "equals";
            valInput.value = "";
            includeSoft.checked = false;
            selAll.checked = false;

            const wrapper = document.getElementById("query-result-wrapper");
            wrapper.style.display = "none";
            const countEl = document.getElementById("query-result-count");
            if (countEl) countEl.textContent = "0 Baris";
            const summaryEl = document.getElementById("query-summary");
            if (summaryEl) summaryEl.textContent = "";
        }

        function getSelectedTable() {
            const sel = document.getElementById("query-table-select");
            const db = getCurrentDatabase();
            if (!db || !db.tables) return null;
            return db.tables.find(t => t.name === sel.value) || null;
        }

        // Data types supported by the query builder
        const QUERY_DATA_TYPES = ["INT", "BIGINT", "VARCHAR", "TEXT", "DECIMAL", "DATETIME", "DATE", "BOOLEAN", "ENUM"];

        function runQuery() {
            const table = getSelectedTable();
            const opSelect = document.getElementById("query-operator-select");
            const valInput = document.getElementById("query-value-input");
            const includeSoft = document.getElementById("query-include-soft-delete");
            const selAll = document.getElementById("query-select-all");

            if (!table) {
                Swal.fire('Peringatan', 'Silakan pilih tabel terlebih dahulu.', 'warning');
                return;
            }

            const operator = opSelect.value;
            const value = valInput.value;
            const includeSoftDelete = includeSoft.checked;
            const selectAll = selAll.checked;

            if (operator === 'equals' || operator === 'notEquals' || operator === 'greaterThan' || operator === 'lessThan') {
                if (value === null || value === undefined || value === '') {
                    Swal.fire('Peringatan', 'Masukkan nilai untuk operator numerik.', 'warning');
                    return;
                }
            }

            const rows = table.rows ? table.rows.slice() : [];
            const columns = table.columns ? table.columns.slice() : [];

            // Build result set
            let resultRows = [];
            let usedColumns = [];

            if (selectAll) {
                usedColumns = columns.map(c => c.name);
            } else if (columns.length > 0) {
                usedColumns = [columns[0].name];
            }

            // Apply filter
            if (value !== '' && value !== null && value !== undefined) {
                resultRows = rows.filter(row => {
                    // Soft delete filter
                    if (includeSoftDelete === false) {
                        if (row._deleted === true || row._deleted === 1 || row._deleted === '1') {
                            return false;
                        }
                    }

                    const colValue = row[usedColumns[0]];
                    if (colValue === undefined || colValue === null) return false;

                    const strValue = String(colValue);
                    const strFilter = String(value);

                    switch (operator) {
                        case 'equals':
                            return strValue === strFilter;
                        case 'notEquals':
                            return strValue !== strFilter;
                        case 'contains':
                            return strValue.toLowerCase().includes(strFilter.toLowerCase());
                        case 'startsWith':
                            return strValue.toLowerCase().startsWith(strFilter.toLowerCase());
                        case 'endsWith':
                            return strValue.toLowerCase().endsWith(strFilter.toLowerCase());
                        case 'greaterThan': {
                            const numVal = Number(colValue);
                            const numFilter = Number(value);
                            return !isNaN(numVal) && numVal > numFilter;
                        }
                        case 'lessThan': {
                            const numVal = Number(colValue);
                            const numFilter = Number(value);
                            return !isNaN(numVal) && numVal < numFilter;
                        }
                        default:
                            return strValue === strFilter;
                    }
                });
            } else {
                // No filter: return all rows (or empty if columns are empty)
                resultRows = includeSoftDelete === false
                    ? rows.filter(row => !(row._deleted === true || row._deleted === 1 || row._deleted === '1'))
                    : rows;
            }

            renderQueryResult(resultRows, columns, usedColumns);

            // Switch to query tab if not already
            const queryTab = document.getElementById("query-tab");
            if (queryTab) {
                const tabEl = document.querySelector(`[data-bs-target="#tab-query"]`);
                if (tabEl && !tabEl.classList.contains('active')) {
                    new bootstrap.Tab(queryTab).show();
                }
            }
        }

        function renderQueryResult(resultRows, columns, usedColumns) {
            const wrapper = document.getElementById("query-result-wrapper");
            const countEl = document.getElementById("query-result-count");
            const headEl = document.getElementById("query-result-head");
            const bodyEl = document.getElementById("query-result-body");
            const summaryEl = document.getElementById("query-summary");
            const tableEl = document.getElementById("query-result-table");

            if (!wrapper || !countEl || !headEl || !bodyEl) return;

            wrapper.style.display = "block";

            const rowCount = resultRows.length;
            countEl.textContent = `${rowCount} Baris`;

            // Summary
            let summaryText = `${rowCount} record(s) ditemukan`;
            if (columns && columns.length > 0) {
                summaryText += ` | Kolom: ${usedColumns.map(c => '"' + c + '"').join(', ')}`;
            }
            if (summaryEl) summaryEl.textContent = summaryText;

            if (rowCount === 0) {
                bodyEl.innerHTML = `<tr><td colspan="${usedColumns.length + 1}" class="text-center text-muted py-4">Tidak ada data yang cocok dengan filter.</td></tr>`;
                return;
            }

            // Headers
            let headerHTML = `<tr><th style="min-width: 40px; text-align: center;">#</th>`;
            usedColumns.forEach(col => {
                headerHTML += `<th style="min-width: 130px;">${escapeHtml(col)}</th>`;
            });
            headerHTML += `</tr>`;
            headEl.innerHTML = headerHTML;

            // Rows
            let rowHTML = '';
            resultRows.forEach((row, idx) => {
                rowHTML += `<tr>`;
                rowHTML += `<td class="text-center fw-bold text-muted fs-8">${idx + 1}</td>`;
                usedColumns.forEach(col => {
                    const cellVal = row[col] !== undefined ? row[col] : "";
                    rowHTML += `<td><input type="text" class="form-control form-control-sm border-0 bg-transparent p-0 fs-8 data-cell-input" value="${escapeHtml(String(cellVal))}" readonly></td>`;
                });
                rowHTML += `</tr>`;
            });
            bodyEl.innerHTML = rowHTML;

            // Re-initialize data grid delegation for query result inputs
            initQueryResultDelegation(bodyEl);
        }

        function initQueryResultDelegation(tbody) {
            tbody.dataset.queryDelegationBound = "true";

            tbody.addEventListener("change", function (e) {
                const input = e.target.closest(".data-cell-input");
                if (!input) return;
                // In query result mode, inputs are readonly; ignore changes
                // to prevent accidental edits.
                const wrapper = document.getElementById("query-result-wrapper");
                const runBtn = document.querySelector(".query-btn-run");
                if (wrapper && runBtn && runBtn.disabled === true) {
                    return;
                }
            });
        }

        // --- JSON Export / Download ---
        function exportQueryResultJSON() {
            const table = getSelectedTable();
            const opSelect = document.getElementById("query-operator-select");
            const valInput = document.getElementById("query-value-input");
            const includeSoft = document.getElementById("query-include-soft-delete");
            const selAll = document.getElementById("query-select-all");

            if (!table) {
                Swal.fire('Peringatan', 'Jalankan query terlebih dahulu untuk bisa diekspor.', 'warning');
                return;
            }

            const operator = opSelect ? opSelect.value : "equals";
            const value = valInput ? valInput.value : "";
            const includeSoftDelete = includeSoft ? includeSoft.checked : false;
            const selectAll = selAll ? selAll.checked : false;

            const columns = table.columns || [];
            const usedColumns = selectAll ? columns.map(c => c.name) : (columns.length > 0 ? [columns[0].name] : []);
            const resultRows = renderQueryResultToData(table.rows || [], columns, usedColumns, operator, value, includeSoftDelete);

            const payload = {
                query: {
                    table: table.name,
                    operator: operator,
                    value: value,
                    selectAll: selectAll,
                    includeSoftDelete: includeSoftDelete,
                    timestamp: new Date().toISOString()
                },
                columns: columns.map(c => ({ name: c.name, type: c.type, length: c.length, pk: c.pk, ai: c.ai, notNull: c.notNull, defaultValue: c.defaultValue })),
                rows: resultRows
            };

            downloadQueryResultJSON(payload);
        }

        function renderQueryResultToData(rows, columns, usedColumns, operator, value, includeSoftDelete) {
            let resultRows = [];
            const strFilter = String(value);

            rows.forEach(row => {
                if (includeSoftDelete === false) {
                    if (row._deleted === true || row._deleted === 1 || row._deleted === '1') return;
                }

                const colValue = row[usedColumns[0]];
                if (colValue === undefined || colValue === null) return;

                const strValue = String(colValue);

                let match = false;
                switch (operator) {
                    case 'equals': match = strValue === strFilter; break;
                    case 'notEquals': match = strValue !== strFilter; break;
                    case 'contains': match = strValue.toLowerCase().includes(strFilter.toLowerCase()); break;
                    case 'startsWith': match = strValue.toLowerCase().startsWith(strFilter.toLowerCase()); break;
                    case 'endsWith': match = strValue.toLowerCase().endsWith(strFilter.toLowerCase()); break;
                    case 'greaterThan': {
                        const numVal = Number(colValue);
                        const numFilter = Number(value);
                        match = !isNaN(numVal) && numVal > numFilter;
                        break;
                    }
                    case 'lessThan': {
                        const numVal = Number(colValue);
                        const numFilter = Number(value);
                        match = !isNaN(numVal) && numVal < numFilter;
                        break;
                    }
                    default: match = strValue === strFilter;
                }

                if (match) {
                    const filteredRow = {};
                    usedColumns.forEach(col => {
                        filteredRow[col] = row[col] !== undefined ? row[col] : "";
                    });
                    resultRows.push(filteredRow);
                }
            });

            return resultRows;
        }

        function downloadQueryResultJSON(payload) {
            const jsonStr = JSON.stringify(payload, null, 2);
            const blob = new Blob([jsonStr], { type: "application/json;charset=utf-8" });
            const link = document.createElement("a");
            link.href = URL.createObjectURL(blob);
            link.download = `query_result_${tableToSlug(payload.query.table || "table")}_${Date.now()}.json`;
            link.click();
            URL.revokeObjectURL(link.href);
        }
