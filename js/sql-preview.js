        // ==========================================
        // SQL PREVIEW GENERATOR
        // ==========================================
        function updateSQLPreview() {
            const dialectSelect = document.getElementById("sql-dialect-select");
            const dialect = dialectSelect ? dialectSelect.value : "mysql";
            const includeDb = document.getElementById("sql-include-db") ? document.getElementById("sql-include-db").checked : true;
            const includeDrop = document.getElementById("sql-include-drop") ? document.getElementById("sql-include-drop").checked : true;
            const includeInsert = document.getElementById("sql-include-insert") ? document.getElementById("sql-include-insert").checked : true;

            const table = getCurrentTable();
            if (!table || table.columns.length === 0) {
                const out = document.getElementById("sql-code-output");
                out.textContent = "-- Pilih database & tabel terlebih dahulu.";
                return;
            }

            let sql = "";

            if (includeDb) {
                sql += `-- Database: ${table.name}\n`;
                if (dialect !== 'sqlite') {
                    sql += `CREATE DATABASE IF NOT EXISTS \`${table.name}\`;\nUSE \`${table.name}\`;\n\n`;
                } else {
                    sql += `ATTACH DATABASE '${table.name}.db' AS ${table.name};\n\n`;
                }
            }

            sql += `-- Struktur Tabel: ${table.name}\n`;

            if (includeDrop) {
                if (dialect !== 'sqlite') {
                    sql += `DROP TABLE IF EXISTS \`${table.name}\`;\n\n`;
                } else {
                    sql += `DROP TABLE IF EXISTS ${table.name};\n\n`;
                }
            }

            sql += `CREATE TABLE IF NOT EXISTS \`${table.name}\` (\n`;
            for (let i = 0; i < table.columns.length; i++) {
                const col = table.columns[i];
                const def = formatDefaultValue(col.defaultValue);
                
                sql += `  ${quoteIdentifier(col.name, dialect)} ${formatDataType(col, dialect)}`;
                if (col.pk) sql += ' PRIMARY KEY';
                if (col.ai) sql += ' AUTO_INCREMENT';
                if (col.notNull) sql += ' NOT NULL';
                if (def !== 'NULL') sql += ` DEFAULT ${def}`;
                if (i < table.columns.length - 1) sql += ',';
                sql += '\n';
            }
            sql += `\n);\n\n`;

            if (includeInsert && table.rows.length > 0) {
                const cols = table.columns.map(c => quoteIdentifier(c.name, dialect));
                sql += `-- Data Records: ${table.rows.length} baris\n`;
                table.rows.forEach(row => {
                    const values = table.columns.map(col => {
                        const val = row[col.name] !== undefined ? row[col.name] : null;
                        if (val === null || val === undefined || val === '') return 'NULL';
                        const strVal = String(val);
                        if (col.type.toUpperCase() === 'BOOLEAN') {
                            return strVal === '1' || /TRUE/i.test(strVal) ? '1' : '0';
                        }
                        if (col.type.toUpperCase() === 'INT' || col.type.toUpperCase() === 'BIGINT') {
                            return /^-?\d+$/.test(strVal) ? strVal : 0;
                        }
                        if (col.type.toUpperCase() === 'DECIMAL') {
                            return /^-?\d+(\.\d+)?$/.test(strVal) ? strVal : '0';
                        }
                        if (col.type.toUpperCase() === 'DATETIME' || col.type.toUpperCase() === 'DATE') {
                            const d = new Date(strVal);
                            if (!isNaN(d.getTime())) return `'${d.toISOString()}'`;
                            return `'${strVal}'`;
                        }
                        return `'${strVal.replace(/'/g, "''")}'`;
                    }).join(', ');
                    sql += `INSERT INTO ${table.name} (${cols.join(', ')}) VALUES (${values});\n`;
                });
            }

            renderSqlPreviewHighlighted(document.getElementById("sql-code-output"), sql);
        }

        function renderSqlPreviewHighlighted(target, sql) {
            if (!target) return;
            target.classList.remove("hljs");
            target.classList.add("language-sql");
            target.removeAttribute("data-highlighted");
            target.textContent = sql;
            if (typeof hljs !== "undefined") {
                try { hljs.highlightElement(target); target.classList.add("hljs"); } catch (e) { /* noop */ }
            }
        }

        function quoteIdentifier(name, dialect) {
            if (dialect === 'mysql' || dialect === 'mssql') {
                return "`" + name.replace(/`/g, "``") + "`";
            } else if (dialect === 'postgresql') {
                return '"' + name.replace(/"/g, '""') + '"';
            } else {
                return '"' + name.replace(/"/g, '""') + '"';
            }
        }

        function formatDataType(col, dialect) {
            const type = col.type.toUpperCase();
            let len = col.length;

            if (type === 'INT' || type === 'BIGINT') {
                if (len === '11' || len === '10') return type;
                if (len) return `${type}(${len})`;
                return type;
            }
            if (type === 'VARCHAR') {
                if (len) return `VARCHAR(${len})`;
                return 'VARCHAR(255)';
            }
            if (type === 'TEXT') {
                if (len) return `TEXT(${len})`;
                return 'TEXT';
            }
            if (type === 'DECIMAL') {
                if (len) return `DECIMAL(${len})`;
                return 'DECIMAL(10,2)';
            }
            if (type === 'DATETIME') {
                return 'DATETIME';
            }
            if (type === 'DATE') {
                return 'DATE';
            }
            if (type === 'BOOLEAN') {
                return 'BOOLEAN';
            }
            if (type === 'ENUM') {
                return 'ENUM("value1","value2")';
            }
            return type;
        }

        function formatDefaultValue(val) {
            const v = String(val).trim();
            if (v === '') return 'NULL';
            // Fungsi SQL umum & keyword
            if (/^(CURRENT_TIMESTAMP|NOW\(\)|CURDATE\(\)|CURTIME\(\)|NULL|TRUE|FALSE|UUID\(\)|GETDATE\(\)|SYSDATETIME\(\))$/i.test(v)) {
                return v.toUpperCase();
            }
            // Angka (termasuk negatif & desimal)
            if (/^-?\d+(\.\d+)?$/.test(v)) return v;
            // String -> escape single quote
            return `'${v.replace(/'/g, "''")}'`;
        }

        function copySQLToClipboard() {
            const codeText = document.getElementById("sql-code-output").innerText;

            function showSuccess() {
                Swal.fire({
                    toast: true,
                    position: 'top-end',
                    icon: 'success',
                    title: 'SQL disalin ke clipboard!',
                    showConfirmButton: false,
                    timer: 2000
                });
            }

            // Modern API dengan fallback untuk browser lama
            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(codeText).then(showSuccess).catch(() => {
                    fallbackCopy(codeText);
                    showSuccess();
                });
            } else {
                fallbackCopy(codeText);
                showSuccess();
            }
        }

        function fallbackCopy(text) {
            const tempArea = document.createElement("textarea");
            tempArea.value = text;
            tempArea.style.position = "fixed";
            tempArea.style.opacity = "0";
            document.body.appendChild(tempArea);
            tempArea.select();
            try { document.execCommand("copy"); } catch (e) { console.error("Copy gagal:", e); }
            document.body.removeChild(tempArea);
        }

        function downloadSQLFile() {
            const codeText = document.getElementById("sql-code-output").innerText;
            const blob = new Blob([codeText], { type: "text/plain;charset=utf-8" });
            const link = document.createElement("a");
            link.href = URL.createObjectURL(blob);
            link.download = `sql_filler_backup_${Date.now()}.sql`;
            link.click();
        }
