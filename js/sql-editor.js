// ==========================================
// SQL EDITOR DENGAN SYNTAX HIGHLIGHT (overlay pre + textarea)
// ==========================================

function highlightSqlText(code) {
    if (typeof hljs !== "undefined") {
        try {
            return hljs.highlight(code, { language: "sql" }).value;
        } catch (e) { /* fallthrough */ }
    }
    const div = document.createElement("div");
    div.textContent = code;
    return div.innerHTML;
}

function createSqlEditor(containerId, initialValue) {
    const container = document.getElementById(containerId);
    if (!container) return null;

    container.innerHTML = `
        <pre class="sql-editor-pre language-sql" aria-hidden="true"><code></code></pre>
        <textarea class="sql-editor-textarea" spellcheck="false" placeholder="SELECT * FROM users WHERE id = 1 LIMIT 10;"></textarea>
    `;

    const pre = container.querySelector("pre");
    const codeEl = container.querySelector("code");
    const ta = container.querySelector("textarea");

    function sync() {
        codeEl.innerHTML = highlightSqlText(ta.value) + "\n";
        pre.scrollTop = ta.scrollTop;
        pre.scrollLeft = ta.scrollLeft;
    }

    ta.value = initialValue || "";
    ta.addEventListener("input", sync);
    ta.addEventListener("scroll", () => {
        pre.scrollTop = ta.scrollTop;
        pre.scrollLeft = ta.scrollLeft;
    });
    sync();

    return {
        getValue: () => ta.value,
        setValue: (v) => { ta.value = v; sync(); }
    };
}

// ==========================================
// MANUAL SQL RUNNER (SELECT sederhana)
// ==========================================

let manualSqlEditor = null;

function ensureManualSqlEditor() {
    if (!manualSqlEditor) {
        manualSqlEditor = createSqlEditor("manual-sql-editor", "SELECT * FROM tabel_anda LIMIT 10;");
    }
    return manualSqlEditor;
}

function setQueryMode(mode) {
    const formPane = document.getElementById("query-form-pane");
    const manualPane = document.getElementById("query-manual-pane");
    const btnForm = document.getElementById("qmode-form");
    const btnManual = document.getElementById("qmode-manual");
    if (!formPane || !manualPane) return;

    if (mode === "manual") {
        formPane.style.display = "none";
        manualPane.style.display = "block";
        btnForm.classList.replace("btn-primary", "btn-outline-primary");
        btnManual.classList.replace("btn-outline-secondary", "btn-secondary");
        setTimeout(ensureManualSqlEditor, 50);
    } else {
        formPane.style.display = "block";
        manualPane.style.display = "none";
        btnForm.classList.replace("btn-outline-primary", "btn-primary");
        btnManual.classList.replace("btn-secondary", "btn-outline-secondary");
    }
}

function runActiveQuery() {
    const manualPane = document.getElementById("query-manual-pane");
    if (manualPane && manualPane.style.display !== "none") {
        runManualSQL();
    } else {
        runQuery();
    }
}

function runManualSQL() {
    const editor = ensureManualSqlEditor();
    if (!editor) return;

    const raw = editor.getValue().replace(/;+\s*$/, "").trim();
    if (!raw) {
        Swal.fire('Peringatan', 'Tulis query SQL terlebih dahulu.', 'warning');
        return;
    }

    const parsed = parseManualSelect(raw);
    if (parsed.error) {
        Swal.fire('Query Tidak Valid', parsed.error, 'error');
        return;
    }

    const db = getCurrentDatabase();
    if (!db || !db.tables) {
        Swal.fire('Peringatan', 'Tidak ada database aktif.', 'warning');
        return;
    }

    const table = db.tables.find(t => t.name.toLowerCase() === parsed.table.toLowerCase());
    if (!table) {
        Swal.fire('Peringatan', `Tabel "${parsed.table}" tidak ditemukan.`, 'warning');
        return;
    }

    let usedColumns = parsed.columns === "*"
        ? table.columns.map(c => c.name)
        : parsed.columns.map(wanted => {
            const found = table.columns.find(c => c.name.toLowerCase() === wanted.toLowerCase());
            return found ? found.name : null;
        }).filter(Boolean);

    if (usedColumns.length === 0) {
        Swal.fire('Query Tidak Valid', 'Kolom tidak ditemukan di tabel.', 'error');
        return;
    }

    let rows = (table.rows || []).slice();
    if (parsed.where) rows = rows.filter(row => matchWhere(row, parsed.where));
    if (parsed.limit !== null) rows = rows.slice(0, parsed.limit);

    const resultRows = rows.map(row => {
        const obj = {};
        usedColumns.forEach(col => { obj[col] = row[col] !== undefined ? row[col] : ""; });
        return obj;
    });

    renderQueryResult(resultRows, table.columns, usedColumns);
}

function parseManualSelect(sql) {
    const m = /^select\s+([\s\S]+?)\s+from\s+([`"']?)([\w$]+)\2\s*(where\s+[\s\S]+?)?(\s+limit\s+(\d+))?\s*$/i.exec(sql);
    if (!m) {
        return { error: 'Format yang didukung: SELECT <kolom|*> FROM <tabel> [WHERE kondisi] [LIMIT n]' };
    }

    let columns = "*";
    if (m[1].trim() !== "*") {
        columns = m[1].split(",").map(s => s.trim().replace(/[`"']/g, "")).filter(Boolean);
    }

    let where = null;
    if (m[4]) {
        const w = /^\s*([`"']?)([\w$]+)\1\s*(=|!=|<>|>=|<=|>|<|like)\s*([\s\S]+)$/i.exec(m[4].replace(/^\s*where\s*/i, ""));
        if (!w) return { error: 'WHERE harus berbentuk: kolom operator nilai (contoh: harga > 1000)' };
        where = { col: w[2], op: w[3].toLowerCase(), rawValue: w[4].trim() };
    }

    return { table: m[3], columns, where, limit: m[6] ? parseInt(m[6], 10) : null };
}

function matchWhere(row, where) {
    const colMatch = Object.keys(row).find(k => k.toLowerCase() === where.col.toLowerCase());
    if (colMatch === undefined) return false;

    let cellVal = row[colMatch];
    let raw = where.rawValue.replace(/^['"]|['"]$/g, "");

    if (where.op === "like") {
        const v = String(cellVal).toLowerCase();
        const pattern = raw.toLowerCase();
        if (pattern.startsWith("%") && pattern.endsWith("%")) return v.includes(pattern.slice(1, -1));
        if (pattern.startsWith("%")) return v.endsWith(pattern.slice(1));
        if (pattern.endsWith("%")) return v.startsWith(pattern.slice(0, -1));
        return v === pattern;
    }

    const numCell = Number(cellVal);
    const numRaw = Number(raw);
    const bothNumeric = !isNaN(numCell) && !isNaN(numRaw) && raw !== "";

    switch (where.op) {
        case "=": return bothNumeric ? numCell === numRaw : String(cellVal) === raw;
        case "!=":
        case "<>": return bothNumeric ? numCell !== numRaw : String(cellVal) !== raw;
        case ">": return bothNumeric && numCell > numRaw;
        case ">=": return bothNumeric && numCell >= numRaw;
        case "<": return bothNumeric && numCell < numRaw;
        case "<=": return bothNumeric && numCell <= numRaw;
        default: return false;
    }
}
