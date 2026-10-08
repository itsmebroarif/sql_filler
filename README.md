# SQL FILLER — Multi-Database Studio & PWA

Aplikasi web satu halaman (PWA) untuk membangun skema database multi-database, mengisi data dummy, memvisualisasikan relasi tabel (ERD), dan menghasilkan skrip SQL siap pakai — semuanya berjalan di browser tanpa backend.

## Fitur Utama

- **Multi-Database Explorer** — kelola beberapa database, tabel, kolom, dan baris data dari satu sidebar.
- **Structure Editor** — atur kolom (nama, tipe, panjang, PK, auto-increment, NOT NULL, default).
- **Records & Smart Bulk Fill** — isi data manual atau generate data dummy cerdas per kolom.
- **D3.js ERD Visualizer** — diagram relasi entitas interaktif (zoom, pan, drag node, deteksi FK berbasis `_id`).
- **Live SQL Preview** — generate SQL untuk MySQL/MariaDB, PostgreSQL, SQLite, dan MS SQL Server dengan **syntax highlighting** (highlight.js).
- **Query Builder** — bangun query via form (operator filter), atau tulis **query SQL manual** (`SELECT ... FROM ... [WHERE ...] [LIMIT ...]`) dengan editor ber-highlight; hasil tampil langsung.
- **Import** — JSON backup, skrip SQL (`.sql`), XLSX (setiap sheet = tabel), dan CSV, dengan **auto column remapping** (deteksi header otomatis, dedup nama kolom, inferensi tipe data).
- **Export** — backup JSON, download `.sql`, export hasil query ke JSON.
- **PWA** — dapat diinstal di mana saja (service worker + manifest + logo SVG).

## Struktur Proyek

```
index.html          # markup utama (ringan, semua logika dipisah ke js/)
icon.svg            # logo PWA
sw.js               # service worker (cache app shell, jaringan untuk CDN)
css/
  styles.css        # seluruh gaya aplikasi
js/
  core-state.js     # state global, konstanta, kamus data dummy
  storage.js        # cache localStorage & helper state
  utils.js          # util umum (escapeHtml, tableToSlug, dll)
  query.js          # Query Builder mode Form + render hasil
  sql-editor.js     # editor SQL manual dengan highlight + mini executor
  sql-preview.js    # generator SQL + highlight output
  import-sql.js     # import/export JSON & SQL
  import-xlsx.js    # import XLSX + pipeline auto-remap
  import-csv.js     # import CSV (memakai pipeline yang sama)
  mobile-pwa.js     # navigasi mobile & prompt install PWA
  render.js         # render utama UI
  database-admin.js # CRUD database/tabel
  columns.js        # editor kolom
  rows.js           # editor baris data
  bulk-fill.js      # smart bulk fill engine
  erd.js            # visualisasi D3.js
  seed.js           # skema contoh & reset data
  app-init.js       # bootstrap: load cache, tab events, register SW
  pwa-manifest.js   # manifest PWA dinamis
```

## Menjalankan

Cukup buka `index.html` di browser, atau sajikan lewat server statis apa pun:

```bash
npx serve .
# atau
python -m http.server 8000
```

> Catatan: service worker (PWA) memerlukan `localhost` atau HTTPS.

## Teknologi

- Bootstrap 5, Bootstrap Icons, Google Fonts
- D3.js v7 (ERD visualizer)
- SheetJS (parsing XLSX)
- highlight.js (syntax highlighting SQL)
- SweetAlert2

## DBMS Mode (PHP MVC)

Root project ini sekarang juga menjadi DBMS sungguhan (PHP 8 + PDO) dengan konsep MVC dan OOP penuh:

- Autentikasi ala Adminer (driver, server, username, password, database — session-based, + proteksi CSRF).
- Route rapih di `config/routes.php`: `/login`, `/`, `/table/{name}`, `/query`, `/import`, `/export`.
- Layer: `app/Core` (Router, Controller, View, Auth), `app/Controllers`, `app/Services` (Database, Import, Export), `app/Helpers`, `resources/views` (Bootstrap 5 + Material fonts).
- Fitur: browse tabel dengan mode **Table / Card**, console SQL manual, import SQL & CSV, export CSV & SQL.
- Adminer lama tetap tersedia di `adminer.php`.

Jalankan dengan server PHP apa pun, mis. `php -S localhost:8000` dari folder ini.

## Roadmap — Under Development

- [ ] **Sinkronisasi ke database lokal sungguhan** — koneksi langsung ke MySQL/PostgreSQL/SQLite lokal agar aplikasi bisa menjadi klien remote.
- [ ] **Kelola & atur database jarak jauh langsung dari aplikasi** (CRUD tabel/data via koneksi live, bukan hanya cache browser).
- [ ] Role & permission, ekspor ke lebih banyak dialek database.
