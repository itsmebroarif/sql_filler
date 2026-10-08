        // ==========================================
        // MOCK DATA & SEEDERS
        // ==========================================
        function loadSampleSchema() {
            appState = {
                activeDbIndex: 0,
                databases: [
                    {
                        name: "db_pos",
                        activeTableIndex: 0,
                        tables: [
                            {
                                name: "categories",
                                columns: [
                                    { name: "id", type: "INT", length: "11", pk: true, ai: true, notNull: true, defaultValue: "" },
                                    { name: "nama_kategori", type: "VARCHAR", length: "100", pk: false, ai: false, notNull: true, defaultValue: "" },
                                    { name: "deskripsi", type: "TEXT", length: "", pk: false, ai: false, notNull: false, defaultValue: "" },
                                    { name: "created_at", type: "DATETIME", length: "", pk: false, ai: false, notNull: true, defaultValue: "CURRENT_TIMESTAMP" }
                                ],
                                rows: [
                                    { id: 1, nama_kategori: "Elektronik", deskripsi: "Perangkat elektronik & aksesoris", created_at: "2026-01-01 08:00:00" },
                                    { id: 2, nama_kategori: "Fashion", deskripsi: "Pakaian & aksesoris fashion", created_at: "2026-01-01 08:00:00" },
                                    { id: 3, nama_kategori: "Makanan", deskripsi: "Produk makanan & camilan", created_at: "2026-01-01 08:00:00" }
                                ]
                            },
                            {
                                name: "products",
                                columns: [
                                    { name: "id", type: "INT", length: "11", pk: true, ai: true, notNull: true, defaultValue: "" },
                                    { name: "kode_sku", type: "VARCHAR", length: "50", pk: false, ai: false, notNull: true, defaultValue: "" },
                                    { name: "barcode", type: "VARCHAR", length: "50", pk: false, ai: false, notNull: false, defaultValue: "" },
                                    { name: "nama_produk", type: "VARCHAR", length: "200", pk: false, ai: false, notNull: true, defaultValue: "" },
                                    { name: "kategori_id", type: "INT", length: "11", pk: false, ai: false, notNull: true, defaultValue: "" },
                                    { name: "brand", type: "VARCHAR", length: "100", pk: false, ai: false, notNull: false, defaultValue: "" },
                                    { name: "harga_beli", type: "DECIMAL", length: "12,2", pk: false, ai: false, notNull: true, defaultValue: "0" },
                                    { name: "harga_jual", type: "DECIMAL", length: "12,2", pk: false, ai: false, notNull: true, defaultValue: "0" },
                                    { name: "stok", type: "INT", length: "11", pk: false, ai: false, notNull: true, defaultValue: "0" },
                                    { name: "satuan", type: "VARCHAR", length: "20", pk: false, ai: false, notNull: false, defaultValue: "pcs" },
                                    { name: "created_at", type: "DATETIME", length: "", pk: false, ai: false, notNull: true, defaultValue: "CURRENT_TIMESTAMP" }
                                ],
                                rows: [
                                    { id: 1, kode_sku: "SKU-SAM-1001", barcode: "8991002100011", nama_produk: "Laptop Pro 15", kategori_id: 1, brand: "Samsung", harga_beli: "12000000", harga_jual: "15000000", stok: 25, satuan: "unit", created_at: "2026-01-05 09:00:00" },
                                    { id: 2, kode_sku: "SKU-LOG-1002", barcode: "8991002100028", nama_produk: "Wireless Mouse", kategori_id: 1, brand: "Logitech", harga_beli: "150000", harga_jual: "250000", stok: 100, satuan: "pcs", created_at: "2026-01-05 09:00:00" },
                                    { id: 3, kode_sku: "SKU-ADM-1003", barcode: "8991002100035", nama_produk: "Kaos Polos Hitam", kategori_id: 2, brand: "Adidas", harga_beli: "50000", harga_jual: "95000", stok: 200, satuan: "pcs", created_at: "2026-01-06 10:00:00" }
                                ]
                            },
                            {
                                name: "customers",
                                columns: [
                                    { name: "id", type: "INT", length: "11", pk: true, ai: true, notNull: true, defaultValue: "" },
                                    { name: "kode_customer", type: "VARCHAR", length: "30", pk: false, ai: false, notNull: true, defaultValue: "" },
                                    { name: "nama", type: "VARCHAR", length: "150", pk: false, ai: false, notNull: true, defaultValue: "" },
                                    { name: "email", type: "VARCHAR", length: "100", pk: false, ai: false, notNull: false, defaultValue: "" },
                                    { name: "telepon", type: "VARCHAR", length: "20", pk: false, ai: false, notNull: false, defaultValue: "" },
                                    { name: "alamat", type: "TEXT", length: "", pk: false, ai: false, notNull: false, defaultValue: "" },
                                    { name: "kota", type: "VARCHAR", length: "50", pk: false, ai: false, notNull: false, defaultValue: "" },
                                    { name: "created_at", type: "DATETIME", length: "", pk: false, ai: false, notNull: true, defaultValue: "CURRENT_TIMESTAMP" }
                                ],
                                rows: [
                                    { id: 1, kode_customer: "CUST-0001", nama: "Budi Santoso", email: "budi@gmail.com", telepon: "081234567890", alamat: "Jl. Merdeka No. 10", kota: "Jakarta", created_at: "2026-01-10 09:00:00" },
                                    { id: 2, kode_customer: "CUST-0002", nama: "Siti Rahma", email: "siti@yahoo.com", telepon: "082345678901", alamat: "Jl. Sudirman Kav. 5", kota: "Bandung", created_at: "2026-02-14 14:30:00" }
                                ]
                            },
                            {
                                name: "suppliers",
                                columns: [
                                    { name: "id", type: "INT", length: "11", pk: true, ai: true, notNull: true, defaultValue: "" },
                                    { name: "nama_supplier", type: "VARCHAR", length: "150", pk: false, ai: false, notNull: true, defaultValue: "" },
                                    { name: "telepon", type: "VARCHAR", length: "20", pk: false, ai: false, notNull: false, defaultValue: "" },
                                    { name: "alamat", type: "TEXT", length: "", pk: false, ai: false, notNull: false, defaultValue: "" },
                                    { name: "kota", type: "VARCHAR", length: "50", pk: false, ai: false, notNull: false, defaultValue: "" }
                                ],
                                rows: [
                                    { id: 1, nama_supplier: "PT Elektronik Jaya", telepon: "021-5551234", alamat: "Jl. Industri Raya No. 8", kota: "Jakarta" },
                                    { id: 2, nama_supplier: "CV Fashion Nusantara", telepon: "021-5555678", alamat: "Jl. Tekstil No. 21", kota: "Bandung" }
                                ]
                            },
                            {
                                name: "transactions",
                                columns: [
                                    { name: "id", type: "INT", length: "11", pk: true, ai: true, notNull: true, defaultValue: "" },
                                    { name: "no_transaksi", type: "VARCHAR", length: "30", pk: false, ai: false, notNull: true, defaultValue: "" },
                                    { name: "tanggal", type: "DATETIME", length: "", pk: false, ai: false, notNull: true, defaultValue: "CURRENT_TIMESTAMP" },
                                    { name: "customer_id", type: "INT", length: "11", pk: false, ai: false, notNull: false, defaultValue: "" },
                                    { name: "kasir_id", type: "INT", length: "11", pk: false, ai: false, notNull: true, defaultValue: "" },
                                    { name: "subtotal", type: "DECIMAL", length: "12,2", pk: false, ai: false, notNull: true, defaultValue: "0" },
                                    { name: "diskon", type: "DECIMAL", length: "12,2", pk: false, ai: false, notNull: true, defaultValue: "0" },
                                    { name: "total", type: "DECIMAL", length: "12,2", pk: false, ai: false, notNull: true, defaultValue: "0" },
                                    { name: "payment_method", type: "VARCHAR", length: "30", pk: false, ai: false, notNull: false, defaultValue: "Tunai" },
                                    { name: "status", type: "VARCHAR", length: "20", pk: false, ai: false, notNull: false, defaultValue: "Selesai" }
                                ],
                                rows: [
                                    { id: 1, no_transaksi: "TRX-20260110-0001", tanggal: "2026-01-10 09:15:00", customer_id: 1, kasir_id: 1, subtotal: "15250000", diskon: "0", total: "15250000", payment_method: "Tunai", status: "Selesai" },
                                    { id: 2, no_transaksi: "TRX-20260214-0002", tanggal: "2026-02-14 14:45:00", customer_id: 2, kasir_id: 2, subtotal: "95000", diskon: "5000", total: "90000", payment_method: "QRIS", status: "Selesai" }
                                ]
                            },
                            {
                                name: "transaction_details",
                                columns: [
                                    { name: "id", type: "INT", length: "11", pk: true, ai: true, notNull: true, defaultValue: "" },
                                    { name: "transaction_id", type: "INT", length: "11", pk: false, ai: false, notNull: true, defaultValue: "" },
                                    { name: "product_id", type: "INT", length: "11", pk: false, ai: false, notNull: true, defaultValue: "" },
                                    { name: "qty", type: "INT", length: "11", pk: false, ai: false, notNull: true, defaultValue: "1" },
                                    { name: "harga", type: "DECIMAL", length: "12,2", pk: false, ai: false, notNull: true, defaultValue: "0" },
                                    { name: "subtotal", type: "DECIMAL", length: "12,2", pk: false, ai: false, notNull: true, defaultValue: "0" }
                                ],
                                rows: [
                                    { id: 1, transaction_id: 1, product_id: 1, qty: 1, harga: "15000000", subtotal: "15000000" },
                                    { id: 2, transaction_id: 1, product_id: 2, qty: 1, harga: "250000", subtotal: "250000" },
                                    { id: 3, transaction_id: 2, product_id: 3, qty: 1, harga: "95000", subtotal: "95000" }
                                ]
                            },
                            {
                                name: "payments",
                                columns: [
                                    { name: "id", type: "INT", length: "11", pk: true, ai: true, notNull: true, defaultValue: "" },
                                    { name: "transaction_id", type: "INT", length: "11", pk: false, ai: false, notNull: true, defaultValue: "" },
                                    { name: "amount", type: "DECIMAL", length: "12,2", pk: false, ai: false, notNull: true, defaultValue: "0" },
                                    { name: "payment_method", type: "VARCHAR", length: "30", pk: false, ai: false, notNull: false, defaultValue: "Tunai" },
                                    { name: "tanggal", type: "DATETIME", length: "", pk: false, ai: false, notNull: true, defaultValue: "CURRENT_TIMESTAMP" }
                                ],
                                rows: [
                                    { id: 1, transaction_id: 1, amount: "15250000", payment_method: "Tunai", tanggal: "2026-01-10 09:16:00" },
                                    { id: 2, transaction_id: 2, amount: "90000", payment_method: "QRIS", tanggal: "2026-02-14 14:46:00" }
                                ]
                            },
                            {
                                name: "stock_movements",
                                columns: [
                                    { name: "id", type: "INT", length: "11", pk: true, ai: true, notNull: true, defaultValue: "" },
                                    { name: "product_id", type: "INT", length: "11", pk: false, ai: false, notNull: true, defaultValue: "" },
                                    { name: "tipe", type: "VARCHAR", length: "20", pk: false, ai: false, notNull: true, defaultValue: "" },
                                    { name: "qty", type: "INT", length: "11", pk: false, ai: false, notNull: true, defaultValue: "0" },
                                    // ... (data lebih lanjut akan diisi oleh loadKafeinartsProducts atau sample berikutnya)
                                ],
                                rows: []
                            }
                        ]
                    }
                ]
            };
            saveToLocalStorage();
            renderAllUI();
        }

        function loadKafeinartsProducts() {
            appState = {
                activeDbIndex: 0,
                databases: [
                    {
                        name: "db_kafeinarts",
                        activeTableIndex: 0,
                        tables: [
                            {
                                name: "products",
                                columns: [
                                    { name: "id", type: "INT", length: "11", pk: true, ai: true, notNull: true, defaultValue: "" },
                                    { name: "kode_sku", type: "VARCHAR", length: "50", pk: false, ai: false, notNull: true, defaultValue: "" },
                                    { name: "barcode", type: "VARCHAR", length: "50", pk: false, ai: false, notNull: false, defaultValue: "" },
                                    { name: "nama_produk", type: "VARCHAR", length: "200", pk: false, ai: false, notNull: true, defaultValue: "" },
                                    { name: "kategori", type: "VARCHAR", length: "100", pk: false, ai: false, notNull: true, defaultValue: "" },
                                    { name: "brand", type: "VARCHAR", length: "100", pk: false, ai: false, notNull: false, defaultValue: "" },
                                    { name: "harga_beli", type: "DECIMAL", length: "12,2", pk: false, ai: false, notNull: true, defaultValue: "0" },
                                    { name: "harga_jual", type: "DECIMAL", length: "12,2", pk: false, ai: false, notNull: true, defaultValue: "0" },
                                    { name: "stok", type: "INT", length: "11", pk: false, ai: false, notNull: true, defaultValue: "0" },
                                    { name: "satuan", type: "VARCHAR", length: "20", pk: false, ai: false, notNull: false, defaultValue: "pcs" },
                                    { name: "created_at", type: "DATETIME", length: "", pk: false, ai: false, notNull: true, defaultValue: "CURRENT_TIMESTAMP" }
                                ],
                                rows: [
                                    { id: 1, kode_sku: "KAFE-001", barcode: "KAF-BAR-0001", nama_produk: "Kopi Arabika Ngada", kategori: "Kopi", brand: "Kafeinarts", harga_beli: "85000", harga_jual: "125000", stok: 340, satuan: "kg", created_at: "2026-03-01 08:00:00" },
                                    { id: 2, kode_sku: "KAFE-002", barcode: "KAF-BAR-0002", nama_produk: "Teh Hijau Senja", kategori: "Teh", brand: "Kafeinarts", harga_beli: "32000", harga_jual: "48000", stok: 210, satuan: "pack", created_at: "2026-03-01 08:00:00" },
                                    { id: 3, kode_sku: "KAFE-003", barcode: "KAF-BAR-0003", nama_produk: "Coklat Hitam 70%", kategori: "Coklat", brand: "Kafeinarts", harga_beli: "64000", harga_jual: "96000", stok: 150, satuan: "batang", created_at: "2026-03-01 08:00:00" }
                                ]
                            },
                            {
                                name: "categories",
                                columns: [
                                    { name: "id", type: "INT", length: "11", pk: true, ai: true, notNull: true, defaultValue: "" },
                                    { name: "nama_kategori", type: "VARCHAR", length: "100", pk: false, ai: false, notNull: true, defaultValue: "" },
                                    { name: "deskripsi", type: "TEXT", length: "", pk: false, ai: false, notNull: false, defaultValue: "" }
                                ],
                                rows: [
                                    { id: 1, nama_kategori: "Kopi", deskripsi: "Varietas kopi robusta & arabika" },
                                    { id: 2, nama_kategori: "Teh", deskripsi: "Teh hijau & hitam segar" },
                                    { id: 3, nama_kategori: "Coklat", deskripsi: "Coklat kemasan premium" }
                                ]
                            }
                        ]
                    }
                ]
            };
            saveToLocalStorage();
            renderAllUI();
        }

        function resetAllData() {
            if (!confirm('Semua database & data akan dihapus?')) return;

            appState = {
                activeDbIndex: 0,
                databases: []
            };
            saveToLocalStorage();
            renderAllUI();
            Swal.fire('Reset', 'Semua data dihapus.', 'success');
        }
