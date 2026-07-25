# Backend Portal Trainee (Read-Only)

Layanan Backend Read-Only khusus untuk **Portal Trainee**. Semua endpoint hanya dapat diakses melalui HTTP Method `GET` (Read-Only), dan semua aksi perubahan data (POST, PUT, DELETE, PATCH) ditolak secara otomatis (HTTP 405 Method Not Allowed).

---

## 🗄️ Tabel Database: `portal_trainee`

Table Schema:
- `id` (BIGSERIAL, Primary Key)
- `name` (VARCHAR 255)
- `trainee_id` (VARCHAR 50)
- `program` (VARCHAR 100)
- `class` (VARCHAR 100)
- `level` (VARCHAR 100)
- `membership_expired_date` (DATE)
- `latest_speaking_project` (VARCHAR 255)
- `weekly_report_url` (TEXT)
- `referral_code` (VARCHAR 100)
- `progress_video_url` (TEXT)
- `gender` (VARCHAR 20)
- `date_of_birth` (DATE)
- `school_name` (VARCHAR 255)
- `branch_id` (VARCHAR 50)
- `first_enroll` (DATE)
- `newest_grade` (VARCHAR 100)
- `trainee_homeroom` (VARCHAR 100)
- `screening_test_url` (TEXT)
- `speaking_project_to_next_level` (VARCHAR 255)
- `last_life_project_date` (DATE)
- `last_life_project` (VARCHAR 255)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

---

## 📡 API Endpoints (Strictly Read-Only)

### 1. Health Check
* **`GET /health`**
* Memeriksa status layanan backend.

### 2. Mengambil Daftar Trainee (Dukungan Pencarian & Pagination)
* **`GET /api/portal-trainee`**
* **Query Parameters:**
  * `search`: Pencarian nama trainee atau ID trainee (contoh: `?search=Budi`)
  * `branch_id`: Filter cabang ID (contoh: `?branch_id=JKT01`)
  * `level`: Filter level trainee (contoh: `?level=Level 1`)
  * `program`: Filter program (contoh: `?program=Youth`)
  * `class`: Filter kelas (contoh: `?class=Class A`)
  * `page`: Nomor halaman (default: `1`)
  * `limit`: Jumlah data per halaman (default: `20`)

### 3. Mengambil Detail Trainee Berdasarkan ID
* **`GET /api/portal-trainee/:id`**
* Mengambil detail lengkap 1 trainee berdasarkan `id` (database integer) atau `trainee_id` (string).

### 4. Statistik Summary Trainee
* **`GET /api/portal-trainee/stats/summary`**
* Mengambil ringkasan total trainee, per cabang, per level, dan per program.

---

## 🚫 Proteksi Akses Read-Only
Setiap permintaan selain `GET`, `HEAD`, atau `OPTIONS` (seperti `POST`, `PUT`, `DELETE`, `PATCH`) akan secara otomatis mengembalikan respon:
```json
{
  "success": false,
  "message": "Akses Ditolak: API Portal Trainee hanya bersifat READ-ONLY (Hanya dapat dilihat). Operasi perubahan data (POST, PUT, DELETE, PATCH) tidak diizinkan."
}
```
HTTP Status: `405 Method Not Allowed`.

---

## 🚀 Cara Menjalankan Layanan

### Standalone Service
```bash
node backend_portal/server.js
```
Layanan akan berjalan di port `4001` (atau via environment variable `PORT_PORTAL`).

### Terintegrasi di Server Utama (`src/server.js`)
API `portal-trainee` juga sudah secara otomatis terdaftar pada server utama di endpoint:
`http://localhost:4000/api/portal-trainee`
