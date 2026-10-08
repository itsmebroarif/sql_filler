// ==========================================
// CSV IMPORT (memakai pipeline auto-remap yang sama dengan XLSX)
// ==========================================

function triggerImportCSV() {
    document.getElementById("import-csv-file-input").click();
}

function importCSVFile(event) {
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
            const text = e.target.result;
            const rows = parseCSVText(text);
            if (!rows || rows.length === 0) {
                Swal.fire('Peringatan', 'File CSV kosong.', 'warning');
                return;
            }

            const dbName = sanitizeDbName(file.name);
            if (!dbName) {
                Swal.fire('Peringatan', 'Nama database dari file tidak valid.', 'warning');
                return;
            }

            let db = appState.databases.find(d => d.name.toLowerCase() === dbName.toLowerCase());
            if (!db) {
                db = { name: dbName, activeTableIndex: 0, tables: [] };
                appState.databases.push(db);
            }

            const sheet = XLSX.utils.aoa_to_sheet(rows);
            const parsed = parseSheetAutoRemap(sheet);
            const tableName = (file.name.replace(/\.[^/.]+$/, "") || "imported")
                .replace(/[^a-zA-Z0-9_]/g, "_").toLowerCase() || "imported";

            let totalTables = 0, totalRows = 0, errorCount = 0;
            if (parsed && parsed.rows.length > 0) {
                const res = importParsedSheets(dbName, [{ name: tableName, parsed }]);
                totalTables = res.totalTables; totalRows = res.totalRows; errorCount = res.errorCount;
            }

            finishImport(dbName, 1, totalTables, totalRows, errorCount);
        } catch (err) {
            console.error("CSV Import Error:", err);
            Swal.fire('Error Import', 'Gagal membaca file CSV: ' + (err.message || 'Unknown error'), 'error');
        } finally {
            event.target.value = "";
        }
    };
    reader.readAsText(file);
}

// Parser CSV sederhana: mendukung tanda kutip ganda, koma di dalam kutipan, dan baris baru di dalam kutipan.
function parseCSVText(text) {
    const rows = [];
    let field = "";
    let row = [];
    let inQuotes = false;

    for (let i = 0; i < text.length; i++) {
        const ch = text[i];
        if (inQuotes) {
            if (ch === '"') {
                if (text[i + 1] === '"') { field += '"'; i++; }
                else inQuotes = false;
            } else {
                field += ch;
            }
        } else if (ch === '"') {
            inQuotes = true;
        } else if (ch === ',') {
            row.push(field); field = "";
        } else if (ch === '\n' || ch === '\r') {
            if (ch === '\r' && text[i + 1] === '\n') i++;
            row.push(field); field = "";
            rows.push(row); row = [];
        } else {
            field += ch;
        }
    }
    if (field !== "" || row.length > 0) { row.push(field); rows.push(row); }
    return rows;
}
