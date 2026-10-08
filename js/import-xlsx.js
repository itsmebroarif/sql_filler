// ==========================================
// XLSX IMPORT (dengan auto column remapping)
// ==========================================

function triggerImportXLSX() {
    document.getElementById("import-xlsx-file-input").click();
}

function importXLSXFile(event) {
    const file = event.target.files[0];
    if (!file) return;

    if (typeof XLSX === "undefined") {
        Swal.fire('Error', 'Library XLSX belum termuat. Periksa koneksi internet Anda.', 'error');
        event.target.value = "";
        return;
    }

    const reader = new FileReader();
    reader.onload = function (e) {
        try {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: "array", cellDates: true });
            const sheetNames = workbook.SheetNames || [];

            if (sheetNames.length === 0) {
                Swal.fire('Peringatan', 'File XLSX tidak memiliki sheet sama sekali.', 'warning');
                return;
            }

            const dbName = sanitizeDbName(file.name);
            if (!dbName) {
                Swal.fire('Peringatan', 'Nama database dari file tidak valid. Gunakan huruf, angka, atau underscore.', 'warning');
                return;
            }

            let db = appState.databases.find(d => d.name.toLowerCase() === dbName.toLowerCase());
            if (!db) {
                db = { name: dbName, activeTableIndex: 0, tables: [] };
                appState.databases.push(db);
            }

            const parsedSheets = [];
            let errorCount = 0;
            sheetNames.forEach(sheetName => {
                try {
                    const parsed = parseSheetAutoRemap(workbook.Sheets[sheetName]);
                    if (parsed && parsed.rows.length > 0) parsedSheets.push({ name: sheetName, parsed });
                } catch (sheetErr) {
                    console.error("Error processing sheet:", sheetName, sheetErr);
                    errorCount++;
                }
            });

            const result = importParsedSheets(dbName, parsedSheets);
            finishImport(dbName, sheetNames.length, result.totalTables, result.totalRows, errorCount + result.errorCount);
        } catch (err) {
            console.error("XLSX Import Error:", err);
            Swal.fire('Error Import', 'Gagal membaca file XLSX: ' + (err.message || 'Unknown error'), 'error');
        } finally {
            event.target.value = "";
        }
    };
    reader.readAsArrayBuffer(file);
}

// Terapkan hasil parse sheet ke appState (dipakai XLSX & CSV import).
function importParsedSheets(dbName, parsedSheets) {
    const db = appState.databases.find(d => d.name.toLowerCase() === dbName.toLowerCase());
    let totalTables = 0;
    let totalRows = 0;
    let errorCount = 0;

    parsedSheets.forEach(({ name, parsed }) => {
        try {
            let table = db.tables.find(t => t.name.toLowerCase() === name.toLowerCase());
            if (!table) {
                table = { name, columns: [], rows: [] };
                db.tables.push(table);
            }
            remapColumns(table, parsed.columns);
            table.rows = (table.rows || []).concat(parsed.rows);
            totalTables++;
            totalRows += parsed.rows.length;
        } catch (err) {
            console.error("Error applying sheet:", name, err);
            errorCount++;
        }
    });

    return { totalTables, totalRows, errorCount };
}

function finishImport(dbName, sheetCount, totalTables, totalRows, errorCount) {
    const db = appState.databases.find(d => d.name.toLowerCase() === dbName.toLowerCase());
    saveToLocalStorage();
    const dbIdx = appState.databases.findIndex(d => d.name.toLowerCase() === dbName.toLowerCase());
    if (dbIdx >= 0) appState.activeDbIndex = dbIdx;
    if (db && db.tables.length > 0) db.activeTableIndex = 0;
    saveToLocalStorage();
    renderAllUI();

    if (totalTables > 0) {
        Swal.fire({
            icon: 'success',
            title: 'Import Berhasil!',
            html: `
                <div class="text-start fs-8">
                    <div><i class="bi bi-database-check text-primary me-2"></i> Database: <b>${dbName}</b> (${sheetCount} tabel(s))</div>
                    <div><i class="bi bi-table text-success me-2"></i> Total Tabel: <b>${totalTables}</b></div>
                    <div><i class="bi bi-grid-3x3-gap text-warning me-2"></i> Total Data Records: <b>${totalRows}</b></div>
                    ${errorCount > 0 ? `<div class="text-warning"><small>${errorCount} sheet(s) bermasalah, dilewati.</small></div>` : ''}
                </div>
            `,
            confirmButtonColor: '#6200ee'
        });
    } else {
        Swal.fire('Peringatan', 'Tidak ada data baris yang ditemukan.', 'warning');
    }
}

// ---------- Helpers ----------

function sanitizeDbName(fileName) {
    const raw = (fileName || "").replace(/\.[^/.]+$/, "").replace(/[^a-zA-Z0-9_]/g, "_").toLowerCase();
    const dbName = raw || "imported_db";
    return /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(dbName) ? dbName : null;
}

// Baca sheet menjadi { columns: [{name,type,length,...}], rows: [{colName: value}] }
// dengan deteksi header otomatis & remapping kolom berdasarkan nama header.
function parseSheetAutoRemap(sheet) {
    if (!sheet || !sheet["!ref"]) return null;

    const grid = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: null, raw: true });
    if (!grid || grid.length === 0) return null;

    const headerIdx = findHeaderRowIndex(grid);
    if (headerIdx < 0) return null;

    const headers = buildUniqueHeaders(grid[headerIdx]);
    if (headers.length === 0) return null;

    const rows = [];
    for (let r = headerIdx + 1; r < grid.length; r++) {
        const record = {};
        let hasValue = false;
        for (let c = 0; c < headers.length; c++) {
            const value = normalizeCellValue(grid[r][c]);
            if (value !== null && value !== "") {
                hasValue = true;
                record[headers[c]] = value;
            }
        }
        if (hasValue) rows.push(record);
    }

    const columns = headers.map(name => ({
        name,
        type: inferColumnType(rows.map(r => r[name])),
        length: "100",
        pk: false,
        ai: false,
        notNull: false,
        defaultValue: ""
    }));

    return { columns, rows };
}

// Baris header = baris pertama dengan >= 2 sel terisi.
function findHeaderRowIndex(grid) {
    for (let r = 0; r < grid.length; r++) {
        const filled = (grid[r] || []).filter(v => v !== null && v !== undefined && v !== "").length;
        if (filled >= 2) return r;
    }
    // Fallback: baris pertama yang punya minimal 1 sel terisi
    for (let r = 0; r < grid.length; r++) {
        const filled = (grid[r] || []).filter(v => v !== null && v !== undefined && v !== "").length;
        if (filled >= 1) return r;
    }
    return -1;
}

// Normalisasi & dedup nama kolom agar selalu unik & tidak kosong.
function buildUniqueHeaders(headerRow) {
    const headers = [];
    const used = new Set();
    (headerRow || []).forEach((cell, i) => {
        let name = (cell === null || cell === undefined || cell === "")
            ? `column_${i + 1}`
            : String(cell).trim();
        if (name === "") name = `column_${i + 1}`;
        let unique = name;
        let suffix = 2;
        while (used.has(unique.toLowerCase())) {
            unique = `${name}_${suffix++}`;
        }
        used.add(unique.toLowerCase());
        headers.push(unique);
    });
    return headers;
}

function normalizeCellValue(v) {
    if (v === null || v === undefined) return null;
    if (v instanceof Date) return v.toISOString().slice(0, 19).replace("T", " ");
    if (typeof v === "boolean") return v ? "TRUE" : "FALSE";
    if (typeof v === "number") return v;
    return String(v).trim();
}

// Inferensi tipe kolom dari seluruh sampel (bukan hanya baris pertama).
function inferColumnType(values) {
    const sample = values.find(v => v !== null && v !== undefined && v !== "");
    if (sample === undefined) return "VARCHAR";
    if (typeof sample === "number") {
        return Number.isInteger(sample) ? "INT" : "DECIMAL";
    }
    const s = String(sample);
    if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}/.test(s)) return "DATETIME";
    if (/^\d{4}-\d{2}-\d{2}/.test(s)) return "DATE";
    if (/^(TRUE|FALSE|1|0)$/i.test(s) && values.every(v => v === null || v === "" || /^(TRUE|FALSE|1|0)$/i.test(String(v)))) return "BOOLEAN";
    if (!Number.isNaN(Number(s)) && s !== "") return s.includes(".") ? "DECIMAL" : "INT";
    return "VARCHAR";
}

// Auto remapping: cocokkan kolom sheet ke kolom tabel berdasarkan nama (case-insensitive),
// tambahkan kolom baru bila belum ada.
function remapColumns(table, parsedColumns) {
    parsedColumns.forEach(pc => {
        const exists = table.columns.some(c => c.name.toLowerCase() === pc.name.toLowerCase());
        if (!exists) table.columns.push(pc);
    });
}
