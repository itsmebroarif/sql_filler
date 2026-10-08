        // ==========================================
        // EXISTING EXPORT / IMPORT FUNCTIONS
        // ==========================================

        function exportJSONSchema() {
            const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(appState, null, 2));
            const downloadAnchor = document.createElement('a');
            downloadAnchor.setAttribute("href", dataStr);
            downloadAnchor.setAttribute("download", `sql_filler_multidb_${Date.now()}.json`);
            document.body.appendChild(downloadAnchor);
            downloadAnchor.click();
            downloadAnchor.remove();
        }

        function triggerImportJSON() {
            document.getElementById("import-json-file-input").click();
        }

        function triggerImportSQLModal() {
            Swal.fire({
                title: 'Import Script SQL',
                html: `
                    <div class="text-start fs-8 text-muted mb-3">Impor struktur tabel dan data records langsung dari file atau text SQL dump.</div>
                    <div class="d-grid gap-2">
                        <button class="btn btn-outline-primary text-start p-3 rounded-3" onclick="Swal.close(); triggerImportSQLFile();">
                            <i class="bi bi-file-earmark-arrow-up fs-5 me-2 align-middle"></i>
                            <b>Upload File Script SQL (.sql)</b>
                            <div class="fs-8 text-muted mt-1">Pilih file database dump .sql dari perangkat Anda</div>
                        </button>
                        <button class="btn btn-outline-secondary text-start p-3 rounded-3" onclick="Swal.close(); promptPasteSQLText();">
                            <i class="bi bi-code-slash fs-5 me-2 align-middle"></i>
                            <b>Paste Text Query / DDL SQL</b>
                            <div class="fs-8 text-muted mt-1">Tempelkan perintah CREATE TABLE & INSERT INTO di sini</div>
                        </button>
                    </div>
                `,
                showConfirmButton: false,
                showCancelButton: true,
                cancelButtonText: 'Batal'
            });
        }

        function triggerImportSQLFile() {
            document.getElementById("import-sql-file-input").click();
        }

        function promptPasteSQLText() {
            Swal.fire({
                title: 'Paste Text Script SQL',
                input: 'textarea',
                inputPlaceholder: 'CREATE DATABASE db_contoh;\nCREATE TABLE users (id INT PRIMARY KEY, nama VARCHAR(100));\nINSERT INTO users VALUES (1, "Budi");',
                inputAttributes: {
                    style: 'height: 220px; font-family: monospace; font-size: 0.8rem;'
                },
                showCancelButton: true,
                confirmButtonText: 'Proses Import SQL',
                cancelButtonText: 'Batal',
                preConfirm: (text) => {
                    if (!text || !text.trim()) {
                        Swal.showValidationMessage('Teks SQL tidak boleh kosong!');
                    }
                    return text;
                }
            }).then((res) => {
                if (res.isConfirmed && res.value) {
                    executeSQLImportText(res.value);
                }
            });
        }

        function handleImportSQLFile(event) {
            const file = event.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = function (e) {
                try {
                    const sqlContent = e.target.result;
                    executeSQLImportText(sqlContent);
                } catch (err) {
                    Swal.fire('Error Import', err.message || 'Gagal membaca file SQL.', 'error');
                } finally {
                    event.target.value = "";
                }
            };
            reader.readAsText(file);
        }

        function executeSQLImportText(sqlText) {
            try {
                const parsedDbMap = parseSQLScript(sqlText);
                const dbNames = Object.keys(parsedDbMap);

                if (dbNames.length === 0) {
                    Swal.fire('Peringatan', 'Tidak ada instruksi CREATE TABLE atau INSERT INTO yang valid ditemukan dalam script SQL.', 'warning');
                    return;
                }

                let totalTables = 0;
                let totalRows = 0;

                dbNames.forEach(dbName => {
                    const importedDb = parsedDbMap[dbName];
                    let existingDb = appState.databases.find(d => d.name.toLowerCase() === dbName.toLowerCase());

                    if (!existingDb) {
                        existingDb = {
                            name: dbName,
                            activeTableIndex: 0,
                            tables: []
                        };
                        appState.databases.push(existingDb);
                    }

                    importedDb.tables.forEach(impTbl => {
                        totalTables++;
                        totalRows += impTbl.rows.length;

                        let existingTblIdx = existingDb.tables.findIndex(t => t.name.toLowerCase() === impTbl.name.toLowerCase());
                        if (existingTblIdx >= 0) {
                            // Merge/Replace Table
                            existingDb.tables[existingTblIdx] = impTbl;
                        } else {
                            existingDb.tables.push(impTbl);
                        }
                    });
                });

                // Switch to first imported DB
                const firstDbName = dbNames[0];
                const activeIndex = appState.databases.findIndex(d => d.name.toLowerCase() === firstDbName.toLowerCase());
                if (activeIndex >= 0) appState.activeDbIndex = activeIndex;

                saveToLocalStorage();
                renderAllUI();

                Swal.fire({
                    icon: 'success',
                    title: 'Import SQL Berhasil!',
                    html: `
                        <div class="text-start fs-8">
                            <div><i class="bi bi-database-check text-primary me-2"></i> Database: <b>${dbNames.length}</b> (${dbNames.join(', ')})</div>
                            <div><i class="bi bi-table text-success me-2"></i> Total Tabel: <b>${totalTables}</b></div>
                            <div><i class="bi bi-grid-3x3-gap text-warning me-2"></i> Total Data Records: <b>${totalRows}</b></div>
                        </div>
                    `,
                    confirmButtonColor: '#6200ee'
                });

            } catch (err) {
                console.error("SQL Parsing Error:", err);
                Swal.fire('Gagal Parsing SQL', 'Terjadi kesalahan saat memproses skrip SQL: ' + err.message, 'error');
            }
        }

        function parseSQLScript(sqlText) {
            // Clean multiline and single-line SQL comments
            let cleaned = sqlText
                .replace(/\/\*[\s\S]*?\*\//g, '')
                .replace(/--.*$/gm, '')
                .replace(/#.*$/gm, '');

            let currentDbName = getCurrentDatabase() ? getCurrentDatabase().name : "db_imported";
            let dbMap = {};

            function getDbObj(dbName) {
                if (!dbMap[dbName]) {
                    dbMap[dbName] = { name: dbName, tables: [] };
                }
                return dbMap[dbName];
            }

            const rawStatements = cleaned.split(';');

            for (let stmt of rawStatements) {
                let trimmed = stmt.trim();
                if (!trimmed) continue;

                // 1. Detect CREATE DATABASE
                let createDbMatch = trimmed.match(/CREATE\s+DATABASE\s+(?:IF\s+NOT\s+EXISTS\s+)?[`"\[]?([a-zA-Z0-9_]+)[`"\]]?/i);
                if (createDbMatch) {
                    currentDbName = createDbMatch[1];
                    getDbObj(currentDbName);
                    continue;
                }

                // 2. Detect USE database
                let useDbMatch = trimmed.match(/USE\s+[`"\[]?([a-zA-Z0-9_]+)[`"\]]?/i);
                if (useDbMatch) {
                    currentDbName = useDbMatch[1];
                    getDbObj(currentDbName);
                    continue;
                }

                // 3. Detect CREATE TABLE
                let createTableMatch = trimmed.match(/CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?[`"\[]?([a-zA-Z0-9_]+)[`"\]]?\s*\(([\s\S]+)\)/i);
                if (createTableMatch) {
                    let tableName = createTableMatch[1];
                    let body = createTableMatch[2];

                    let tableObj = {
                        name: tableName,
                        columns: [],
                        rows: []
                    };

                    let lines = splitSqlCommaList(body);
                    let pkList = [];

                    // Scan primary keys
                    for (let line of lines) {
                        let lTrim = line.trim();
                        let pkMatch = lTrim.match(/^PRIMARY\s+KEY\s*\(([^)]+)\)/i);
                        if (pkMatch) {
                            let cols = pkMatch[1].split(',').map(c => c.trim().replace(/[`"\\[\\]]/g, ''));
                            pkList.push(...cols);
                        }
                    }

                    for (let line of lines) {
                        let lTrim = line.trim();
                        if (/^(PRIMARY\s+KEY|KEY|INDEX|CONSTRAINT|UNIQUE\s+KEY|FOREIGN\s+KEY)/i.test(lTrim)) {
                            continue;
                        }

                        let colMatch = lTrim.match(/^[`"\[]?([a-zA-Z0-9_]+)[`"\]]?\s+([a-zA-Z0-9_]+)(?:\(([^)]+)\))?(.*)$/i);
                        if (colMatch) {
                            let cName = colMatch[1];
                            let cType = colMatch[2].toUpperCase();
                            let cLen = colMatch[3] || "";
                            let cAttrs = colMatch[4] || "";

                            let isPk = pkList.includes(cName) || /PRIMARY\s+KEY/i.test(cAttrs);
                            let isAi = /(AUTO_INCREMENT|AUTOINCREMENT|SERIAL|IDENTITY)/i.test(cAttrs);
                            let isNotNull = /NOT\s+NULL/i.test(cAttrs);

                            let defaultVal = "";
                            let defMatch = cAttrs.match(/DEFAULT\s+(?:'(?:''|[^'])*'|\w+)/i);
                            if (defMatch) {
                                defaultVal = defMatch[0].replace(/^'|'$/g, '').replace(/''/g, "'");
                            }

                            tableObj.columns.push({
                                name: cName,
                                type: normalizeDataType(cType),
                                length: cLen,
                                pk: isPk,
                                ai: isAi,
                                notNull: isNotNull,
                                defaultValue: defaultVal
                            });
                        }
                    }

                    let db = getDbObj(currentDbName);
                    let existingIdx = db.tables.findIndex(t => t.name.toLowerCase() === tableName.toLowerCase());
                    if (existingIdx >= 0) {
                        db.tables[existingIdx] = tableObj;
                    } else {
                        db.tables.push(tableObj);
                    }
                    continue;
                }

                // 4. Detect INSERT INTO
                let insertMatch = trimmed.match(/INSERT\s+INTO\s+[`"\[]?([a-zA-Z0-9_]+)[`"\]]?\s*(?:\(([^)]+)\))?\s*VALUES\s*([\s\S]+)/i);
                if (insertMatch) {
                    let tableName = insertMatch[1];
                    let colNamesRaw = insertMatch[2];
                    let valuesRaw = insertMatch[3];

                    let db = getDbObj(currentDbName);
                    let table = db.tables.find(t => t.name.toLowerCase() === tableName.toLowerCase());
                    if (!table) {
                        table = { name: tableName, columns: [], rows: [] };
                        db.tables.push(table);
                    }

                    let targetCols = [];
                    if (colNamesRaw) {
                        targetCols = colNamesRaw.split(',').map(c => c.trim().replace(/[`"\\[\\]]/g, ''));
                    } else if (table.columns.length > 0) {
                        targetCols = table.columns.map(c => c.name);
                    }

                    let valueTuples = parseSqlValueTuples(valuesRaw);
                    for (let tuple of valueTuples) {
                        let row = {};
                        tuple.forEach((val, idx) => {
                            let colName = targetCols[idx] || (table.columns[idx] ? table.columns[idx].name : `col_${idx + 1}`);
                            row[colName] = val;

                            if (!table.columns.some(c => c.name === colName)) {
                                table.columns.push({
                                    name: colName,
                                    type: isNaN(val) ? "VARCHAR" : "INT",
                                    length: isNaN(val) ? "100" : "11",
                                    pk: false,
                                    ai: false,
                                    notNull: false,
                                    defaultValue: ""
                                });
                            }
                        });
                        table.rows.push(row);
                    }
                }
            }

            return dbMap;
        }

        function splitSqlCommaList(str) {
            let results = [];
            let current = "";
            let inQuotes = false;
            let quoteChar = "";
            let parenDepth = 0;

            for (let i = 0; i < str.length; i++) {
                let ch = str[i];
                if ((ch === "'" || ch === '"' || ch === '`') && (i === 0 || str[i - 1] !== '\\')) {
                    if (!inQuotes) {
                        inQuotes = true;
                        quoteChar = ch;
                    } else if (quoteChar === ch) {
                        inQuotes = false;
                    }
                } else if (!inQuotes) {
                    if (ch === '(') parenDepth++;
                    else if (ch === ')') parenDepth--;
                    else if (ch === ',' && parenDepth === 0) {
                        results.push(current);
                        current = "";
                        continue;
                    }
                }
                current += ch;
            }
            if (current.trim()) results.push(current);
            return results;
        }

        function parseSqlValueTuples(str) {
            let tuples = [];
            let inTuple = false;
            let currentTuple = [];
            let currentVal = "";
            let inQuotes = false;
            let quoteChar = "";

            for (let i = 0; i < str.length; i++) {
                let ch = str[i];

                if (!inTuple) {
                    if (ch === '(') {
                        inTuple = true;
                        currentTuple = [];
                        currentVal = "";
                    }
                } else {
                    if ((ch === "'" || ch === '"') && (i === 0 || str[i - 1] !== '\\')) {
                        if (!inQuotes) {
                            inQuotes = true;
                            quoteChar = ch;
                        } else if (quoteChar === ch) {
                            if (i + 1 < str.length && str[i + 1] === ch) {
                                currentVal += ch;
                                i++;
                            } else {
                                inQuotes = false;
                            }
                        } else {
                            currentVal += ch;
                        }
                    } else if (!inQuotes && ch === ',') {
                        currentTuple.push(cleanSqlValue(currentVal));
                        currentVal = "";
                    } else if (!inQuotes && ch === ')') {
                        currentTuple.push(cleanSqlValue(currentVal));
                        tuples.push(currentTuple);
                        inTuple = false;
                        currentVal = "";
                    } else {
                        currentVal += ch;
                    }
                }
            }
            return tuples;
        }

        function cleanSqlValue(val) {
            let trimmed = val.trim();
            if (trimmed.toUpperCase() === 'NULL') return '';
            if ((trimmed.startsWith("'") && trimmed.endsWith("'")) || (trimmed.startsWith('"') && trimmed.endsWith('"'))) {
                return trimmed.slice(1, -1).replace(/''/g, "'").replace(/\\'/g, "'").replace(/\\"/g, '"');
            }
            return trimmed;
        }

        function normalizeDataType(type) {
            let t = type.toUpperCase();
            if (["INT", "INTEGER", "SMALLINT", "TINYINT", "MEDIUMINT"].includes(t)) return "INT";
            if (["BIGINT"].includes(t)) return "BIGINT";
            if (["VARCHAR", "CHAR", "NVARCHAR", "VARCHAR2"].includes(t)) return "VARCHAR";
            if (["TEXT", "MEDIUMTEXT", "LONGTEXT"].includes(t)) return "TEXT";
            if (["DECIMAL", "NUMERIC", "FLOAT", "DOUBLE"].includes(t)) return "DECIMAL";
            if (["DATETIME", "TIMESTAMP"].includes(t)) return "DATETIME";
            if (["DATE"].includes(t)) return "DATE";
            if (["BOOLEAN", "BOOL", "BIT"].includes(t)) return "BOOLEAN";
            if (["ENUM"].includes(t)) return "ENUM";
            return "VARCHAR";
        }

        function handleImportJSON(event) {
            const file = event.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = function (e) {
                try {
                    const imported = JSON.parse(e.target.result);
                    if (imported && Array.isArray(imported.databases)) {
                        appState = imported;
                    } else if (imported && Array.isArray(imported.tables)) {
                        // Import legacy format
                        appState = {
                            activeDbIndex: 0,
                            databases: [{ name: "db_imported", activeTableIndex: 0, tables: imported.tables }]
                        };
                    } else {
                        throw new Error("Format JSON tidak dikenali.");
                    }

                    saveToLocalStorage();
                    renderAllUI();
                    Swal.fire('Import Berhasil!', 'Data berhasil dimuat.', 'success');
                } catch (err) {
                    Swal.fire('Error', err.message || 'File JSON rusak.', 'error');
                } finally {
                    event.target.value = "";
                }
            };
            reader.readAsText(file);
        }
