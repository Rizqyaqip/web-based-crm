# Backend API (Express 5 + MySQL2)

REST API backend untuk project **finalarcstuff** dibangun menggunakan Node.js, Express 5, dan MySQL2 Connection Pool.

---

## Cara Menjalankan

1. **Pastikan MySQL XAMPP Aktif**
   - Buka XAMPP Control Panel.
   - Klik **Start** pada modul **MySQL** (default port: 3306).
   - Pastikan database `finalarcstuff` sudah dibuat di phpMyAdmin / MySQL.

2. **Konfigurasi Environment (`.env`)**
   File `.env` sudah dikonfigurasi:
   ```env
   PORT=5000
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=
   DB_NAME=finalarcstuff
   CLIENT_URL=http://localhost:5173
   ```

3. **Menjalankan Server**
   ```bash
   # Jalankan di direktori backend:
   npm run dev    # Mode watch otomatis me-restart saat ada perubahan kode
   # atau
   npm start      # Mode standar
   ```

---

## Daftar Endpoint API

### 1. Health Check
- **`GET /api/health`**
  - Cek status server dan database.

---

### 2. Users (`/api/users`)
Menggunakan skema tabel `users` (`id`, `nama`, `password`, `role`):

| Method | Endpoint | Keterangan | Contoh Request Body |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/users` | List pengguna (filter: `?search=nama&limit=20`) | - |
| `GET` | `/api/users/:id` | Detail pengguna berdasarkan ID | - |
| `POST` | `/api/users` | Tambah pengguna baru | `{"nama": "Budi", "password": "rahasia123", "role": "admin"}` |
| `PUT` | `/api/users/:id` | Update data pengguna | `{"nama": "Budi Santoso", "role": "cashier"}` |
| `DELETE` | `/api/users/:id` | Hapus pengguna | - |

---

### 3. Products (`/api/products`)
Menggunakan skema tabel `products` (`id`, `nama_produk`, `deskripsi`, `kategori`, `gambar`, `harga`, `jumlah_stok`):

| Method | Endpoint | Keterangan | Contoh Request Body |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/products` | List produk (filter: `?kategori=frozen+food&search=dimsum`) | - |
| `GET` | `/api/products/:id` | Detail produk | - |
| `POST` | `/api/products` | Tambah produk baru | `{"nama_produk": "Edo Ebi Furai", "kategori": "frozen food", "harga": 40000, "jumlah_stok": 20}` |
| `PUT` | `/api/products/:id` | Update produk | `{"harga": 38000, "jumlah_stok": 25}` |
| `DELETE` | `/api/products/:id` | Hapus produk | - |

---

## Fitur Keamanan & Performa
- **MySQL Connection Pool**: Otomatis menangani koneksi paralel dan auto-reconnect.
- **CORS Enabled**: Diizinkan untuk frontend React/Vite di `http://localhost:5173`.
- **Express 5 Error Handling**: Penanganan error asinkron terpusat tanpa server crash.
- **Sanitized Response**: Password tidak diekspos secara publik saat get all/detail users.
