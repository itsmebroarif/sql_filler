        // APP STATE (MULTI-DATABASE STRUCTURE)
        let appState = {
            activeDbIndex: 0,
            databases: []
        };

        const STORAGE_KEY_V2 = "SQL_FILLER_CACHE_MULTI_DB_V2";
        const STORAGE_KEY_LEGACY = "SQL_FILLER_CACHE_V1";

        const DATA_TYPES = [
            "INT", "BIGINT", "VARCHAR", "TEXT", "DECIMAL",
            "DATETIME", "DATE", "BOOLEAN", "ENUM"
        ];

        // MOCK DATA DICTIONARIES
        const MOCK_NAMES = ["Budi Santoso", "Siti Rahma", "Eko Prasetyo", "Dewi Lestari", "Agus Wijaya", "Rina Permata", "Ahmad Fauzi", "Nani Wijaya", "Rizky Ramadhan", "Maya Putri"];
        const MOCK_CITIES = ["Jakarta", "Surabaya", "Bandung", "Medan", "Semarang", "Yogyakarta", "Depok", "Bali", "Makassar", "Palembang"];
        const MOCK_DOMAINS = ["gmail.com", "yahoo.com", "company.id", "outlook.com", "tech.co.id"];
        const MOCK_PRODUCTS = ["Laptop Pro 15", "Wireless Mouse", "Mechanical Keyboard", "Monitor 27 Inch", "USB-C Hub", "Headset Gaming", "Webcam HD", "Desk Mat XL"];
        const MOCK_CATEGORIES = ["Elektronik", "Fashion", "Makanan", "Minuman", "Kesehatan", "Peralatan", "Kantor", "Olahraga"];
        const MOCK_BRANDS = ["Samsung", "Apple", "Sony", "Logitech", "Razer", "Lenovo", "Adidas", "Nike", "Indomie", "Kapal Api"];
        const MOCK_PAYMENT_METHODS = ["Tunai", "Transfer Bank", "QRIS", "Kartu Kredit", "Kartu Debit", "E-Wallet", "Cicilan"];
        const MOCK_TXN_STATUS = ["Selesai", "Pending", "Dibatalkan", "Refund"];
        const MOCK_STAFF = ["Andi Kasir", "Sari Kasir", "Dedi Manager", "Rina Supervisor", "Joko Staff"];
        const MOCK_ADDRESSES = ["Jl. Merdeka No. 10", "Jl. Sudirman Kav. 5", "Jl. Ahmad Yani 22", "Jl. Diponegoro 8", "Jl. Gajah Mada 15", "Jl. Pahlawan 3", "Jl. Cendana 7", "Jl. Kenanga 12"];

        let deferredPWAPrompt = null;
