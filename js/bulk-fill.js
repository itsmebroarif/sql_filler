        // SMART BULK FILL ENGINE
        function openBulkFillModal() {
            const table = getCurrentTable();
            if (!table) return;

            Swal.fire({
                title: 'Smart Bulk Fill Data',
                html: `
                    <div class="text-start fs-8 text-muted mb-3">Otomatis generate data dummy realistis berdasarkan tipe data kolom.</div>
                    <div class="mb-3 text-start">
                        <label class="form-label fw-bold fs-8">Jumlah Baris:</label>
                        <input type="number" id="bulk-count-input" class="form-control" value="10" min="1" max="5000">
                    </div>
                    <div class="form-check text-start">
                        <input class="form-check-input" type="checkbox" id="bulk-append-check" checked>
                        <label class="form-check-label fs-8" for="bulk-append-check">Tambahkan ke data yang sudah ada (Append)</label>
                    </div>
                `,
                showCancelButton: true,
                confirmButtonText: 'Generate Data',
                preConfirm: () => {
                    const count = parseInt(document.getElementById('bulk-count-input').value) || 10;
                    const isAppend = document.getElementById('bulk-append-check').checked;
                    return { count, isAppend };
                }
            }).then((res) => {
                if (res.isConfirmed) {
                    executeBulkFill(res.value.count, res.value.isAppend);
                }
            });
        }

        function executeBulkFill(count, isAppend) {
            const table = getCurrentTable();
            if (!table) return;

            if (!isAppend) table.rows = [];

            let startAutoId = table.rows.length + 1;

            for (let i = 0; i < count; i++) {
                const row = {};
                table.columns.forEach(col => {
                    row[col.name] = generateSmartColumnValue(col, startAutoId + i);
                });
                table.rows.push(row);
            }

            saveToLocalStorage();
            renderDataGrid();
            updateHeaderTitle();
            updateSQLPreview();

            Swal.fire('Berhasil!', `${count} baris data berhasil ditambahkan.`, 'success');
        }

        function generateSmartColumnValue(col, currentId) {
            const colName = col.name.toLowerCase();
            const colType = col.type.toUpperCase();

            if (col.ai) return currentId;

            // --- Deteksi pola nama kolom (POS-aware) ---
            if (colName.includes('nama') || colName.includes('name')) return getRandomElement(MOCK_NAMES);

            if (colName.includes('email')) {
                const slug = getRandomElement(MOCK_NAMES).toLowerCase().replace(/\\s+/g, '.');
                return `${slug}${Math.floor(Math.random() * 90 + 10)}@${getRandomElement(MOCK_DOMAINS)}`;
            }
            if (colName.includes('kota') || colName.includes('city')) return getRandomElement(MOCK_CITIES);
            if (colName.includes('alamat') || colName.includes('address')) return getRandomElement(MOCK_ADDRESSES);
            if (colName.includes('telepon') || colName.includes('phone') || colName.includes('telp') || colName.includes('hp')) {
                return `08${Math.floor(Math.random() * 900000000 + 100000000)}`;
            }
            if (colName.includes('sku')) {
                return `SKU-${getRandomElement(MOCK_BRANDS).substring(0, 3).toUpperCase()}-${Math.floor(Math.random() * 9000 + 1000)}`;
            }
            if (colName.includes('barcode') || colName.includes('ean') || colName.includes('upc')) {
                return `${Math.floor(Math.random() * 9000000000000 + 1000000000000)}`;
            }
            if (colName.includes('kategori') || colName.includes('category')) return getRandomElement(MOCK_CATEGORIES);
            if (colName.includes('brand') || colName.includes('merek')) return getRandomElement(MOCK_BRANDS);
            if (colName.includes('produk') || colName.includes('item')) return getRandomElement(MOCK_PRODUCTS);
            if (colName.includes('harga') || colName.includes('price')) return Math.floor(Math.random() * 500 + 10) * 1000;
            if (colName.includes('stok') || colName.includes('qty')) return Math.floor(Math.random() * 90 + 10);
            if (colName.includes('diskon') || colName.includes('discount')) return Math.floor(Math.random() * 30);
            if (colName.includes('payment') || colName.includes('pembayaran') || colName.includes('metode')) return getRandomElement(MOCK_PAYMENT_METHODS);
            if (colName.includes('status')) return getRandomElement(MOCK_TXN_STATUS);
            if (colName.includes('kasir') || colName.includes('staff') || colName.includes('pegawai') || colName.includes('employee')) return getRandomElement(MOCK_STAFF);
            if (colName.includes('total')) return Math.floor(Math.random() * 50 + 5) * 10000;
            if (colName.includes('jumlah') || colName.includes('quantity')) return Math.floor(Math.random() * 20 + 1);
            if (colName.includes('tanggal') || colName.includes('date') || colName.includes('tgl')) {
                const d = new Date(Date.now() - Math.floor(Math.random() * 10000000000));
                return d.toISOString().slice(0, 10);
            }
            if (colName.includes('waktu') || colName.includes('time') || colName.includes('jam')) {
                const dt = new Date(Date.now() - Math.floor(Math.random() * 10000000000));
                return dt.toISOString().slice(11, 19);
            }

            switch (colType) {
                case 'INT':
                case 'BIGINT': return Math.floor(Math.random() * 1000 + 1);
                case 'DECIMAL': return (Math.random() * 1000).toFixed(2);
                case 'DATETIME': {
                    const dt = new Date(Date.now() - Math.floor(Math.random() * 10000000000));
                    return dt.toISOString().slice(0, 19).replace('T', ' ');
                }
                case 'DATE': {
                    const d = new Date(Date.now() - Math.floor(Math.random() * 10000000000));
                    return d.toISOString().slice(0, 10);
                }
                case 'BOOLEAN': return Math.random() > 0.5 ? "1" : "0";
                default: return `Val_${col.name}_${Math.floor(Math.random() * 899 + 100)}`;
            }
        }
