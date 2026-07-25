# 📘 Panduan Lengkap Integrasi API Portal Trainee (n8n & Portal Frontend)

Dokumen ini berisi panduan teknis lengkap mengenai penggunaan API **Portal Trainee** untuk dua kebutuhan utama:
1. **n8n Automation / Data Sync (Write & Upsert)**
2. **Portal Frontend Trainee (Read-Only)**

---

## 🏗️ 1. Arsitektur Sistem

```
+------------------------+             +----------------------------------+             +-------------------------+
|     Google Sheets /    |  POST Sync  |   Endpoint Webhook n8n           |  UPSERT DB  |  Database PostgreSQL    |
|   n8n Form / Database  | ----------> |  /api/webhook/portal-trainee     | ----------> |  Tabel: portal_trainee  |
+------------------------+             +----------------------------------+             +-------------------------+
                                                        |                                            ^
                                                        | Protects Write                             | Reads Only
                                                        v                                            |
+------------------------+             +----------------------------------+                          |
|   Portal Frontend Web  |  GET Only   |  Endpoint Portal Trainee         | -------------------------+
|    (Trainee / Parent)  | ----------> |  /api/portal-trainee             | (Strict Read-Only 405 Enforcer)
+------------------------+             +----------------------------------+
```

---

## ⚡ 2. Integrasi n8n Automation (Write & Upsert)

Endpoint ini khusus digunakan oleh **n8n** untuk memasukkan data baru atau memperbarui data yang sudah ada berdasarkan `trainee_id`.

### 📌 Spesifikasi Endpoint n8n
* **URL:** `POST https://<vps-domain-or-ip>/api/webhook/portal-trainee`
* **Method:** `POST`
* **Headers:**
  * `Content-Type`: `application/json`
  * `x-api-key`: `smlone-n8n-secret-key-2026`

---

### 📝 Format Field / Schema JSON

| Nama Field | Tipe Data | Keterangan | Wajib/Opsional |
| :--- | :--- | :--- | :--- |
| `trainee_id` | `String` | ID Unik Trainee (Contoh: `TR-1001`) | **WAJIB (Unique Key)** |
| `name` | `String` | Nama Lengkap Trainee | Opsional |
| `program` | `String` | Nama Program (Contoh: `Youth`, `Junior`) | Opsional |
| `class` | `String` | Nama Kelas | Opsional |
| `level` | `String` | Level Trainee (Contoh: `Level 1`) | Opsional |
| `membership_expired_date` | `Date (YYYY-MM-DD)` | Tanggal Berakhir Membership | Opsional |
| `latest_speaking_project` | `String` | Nama Project Speaking Terakhir | Opsional |
| `weekly_report_url` | `Text (URL)` | Link URL Weekly Report | Opsional |
| `referral_code` | `String` | Kode Referral | Opsional |
| `progress_video_url` | `Text (URL)` | Link URL Progress Video | Opsional |
| `gender` | `String` | Jenis Kelamin (`Laki-laki` / `Perempuan`) | Opsional |
| `date_of_birth` | `Date (YYYY-MM-DD)` | Tanggal Lahir | Opsional |
| `school_name` | `String` | Nama Sekolah | Opsional |
| `branch_id` | `String` | ID / Nama Cabang (Contoh: `JKT01`, `CEMARA`) | Opsional |
| `first_enroll` | `Date (YYYY-MM-DD)` | Tanggal Pertama Bergabung | Opsional |
| `newest_grade` | `String` | Kelas / Tingkat Sekolah Terbaru | Opsional |
| `trainee_homeroom` | `String` | Wali Kelas / Homeroom | Opsional |
| `screening_test_url` | `Text (URL)` | Link URL Screening Test | Opsional |
| `speaking_project_to_next_level` | `String` | Target Speaking Project Next Level | Opsional |
| `last_life_project_date` | `Date (YYYY-MM-DD)` | Tanggal Life Project Terakhir | Opsional |
| `last_life_project` | `String` | Nama Life Project Terakhir | Opsional |

---

### 💻 Contoh Request Payload JSON (n8n)

#### A. Single Data (Satu Trainee)
```json
{
  "trainee_id": "TR-1001",
  "name": "Budi Santoso",
  "program": "Youth",
  "class": "Class 8A",
  "level": "Level 2",
  "membership_expired_date": "2026-12-31",
  "latest_speaking_project": "Public Speaking Mastery",
  "weekly_report_url": "https://drive.google.com/file/d/weekly_report_1001",
  "referral_code": "REF-BUDI2026",
  "progress_video_url": "https://youtube.com/watch?v=demo1001",
  "gender": "Laki-laki",
  "date_of_birth": "2010-05-15",
  "school_name": "SMP Negeri 1 Jakarta",
  "branch_id": "JKT-PUSA",
  "first_enroll": "2024-01-10",
  "newest_grade": "Grade 8",
  "trainee_homeroom": "Kak Ahmad",
  "screening_test_url": "https://drive.google.com/file/d/screening_1001",
  "speaking_project_to_next_level": "TED Talk Simulation",
  "last_life_project_date": "2026-06-20",
  "last_life_project": "Community Service Drive"
}
```

#### B. Multiple Data (Batch Sync Banyak Trainee)
```json
[
  {
    "trainee_id": "TR-1001",
    "name": "Budi Santoso",
    "program": "Youth",
    "branch_id": "JKT-PUSA"
  },
  {
    "trainee_id": "TR-1002",
    "name": "Siti Rahma",
    "program": "Junior",
    "branch_id": "BDG-01"
  }
]
```

---

### ⚙️ Panduan Konfigurasi Node `HTTP Request` di n8n

1. Tambahkan node **HTTP Request** di n8n canvas Anda.
2. Atur parameter node sebagai berikut:
   * **Method:** `POST`
   * **URL:** `https://<DOMAIN_BACKEND>/api/webhook/portal-trainee`
   * **Authentication:** `None` (Menggunakan Header Manual)
   * **Send Headers:** `Toggle ON`
     * Header 1: `Content-Type` -> `application/json`
     * Header 2: `x-api-key` -> `smlone-n8n-secret-key-2026`
   * **Send Body:** `Toggle ON`
   * **Body Content Type:** `JSON`
   * **Specify Body:** `Using JSON`
   * **JSON / Expression:** Masukkan pemetaan data dari node sebelumnya (misal dari Google Sheets node).

---

### 📤 Contoh Respon n8n Webhook
```json
{
  "success": true,
  "message": "Berhasil memproses 1 data portal trainee dari n8n.",
  "processed_count": 1,
  "error_count": 0
}
```

---

## 💻 3. Integrasi Portal Frontend (Read-Only)

Seluruh endpoint pada Portal Trainee bersifat **Read-Only**. Jika ada pihak yang mencoba mengirim request `POST`, `PUT`, `DELETE`, atau `PATCH` ke URL `/api/portal-trainee`, server akan menolaknya dengan respon **HTTP 405 Method Not Allowed**.

---

### 1️⃣ Endpoint 1: Daftar Trainee (Search, Filter, Pagination)
Digunakan untuk menampilkan halaman utama tabel data trainee di Web Portal.

* **URL:** `GET /api/portal-trainee`
* **Query Parameters:**

| Parameter | Tipe Data | Deskripsi | Contoh |
| :--- | :--- | :--- | :--- |
| `search` | `String` | Cari berdasarkan `name` atau `trainee_id` | `?search=Budi` |
| `branch_id` | `String` | Filter berdasarkan Cabang ID | `?branch_id=JKT-PUSA` |
| `level` | `String` | Filter berdasarkan Level | `?level=Level 2` |
| `program` | `String` | Filter berdasarkan Program | `?program=Youth` |
| `class` | `String` | Filter berdasarkan Kelas | `?class=Class 8A` |
| `page` | `Integer` | Nomor halaman (default: `1`) | `?page=1` |
| `limit` | `Integer` | Jumlah item per halaman (default: `20`) | `?limit=10` |

#### Contoh JavaScript Fetch (Frontend):
```javascript
async function getPortalTrainees(page = 1, search = '') {
  try {
    const response = await fetch(`https://your-domain.com/api/portal-trainee?page=${page}&limit=10&search=${encodeURIComponent(search)}`);
    const result = await response.json();
    if (result.success) {
      console.log("Data Trainee:", result.data);
      console.log("Informasi Pagination:", result.pagination);
    }
  } catch (err) {
    console.error("Gagal mengambil data:", err);
  }
}
```

#### Contoh Respon JSON:
```json
{
  "success": true,
  "read_only": true,
  "data": [
    {
      "id": "1",
      "name": "Budi Santoso",
      "trainee_id": "TR-1001",
      "program": "Youth",
      "class": "Class 8A",
      "level": "Level 2",
      "membership_expired_date": "2026-12-31T00:00:00.000Z",
      "latest_speaking_project": "Public Speaking Mastery",
      "weekly_report_url": "https://drive.google.com/file/d/weekly_report_1001",
      "referral_code": "REF-BUDI2026",
      "progress_video_url": "https://youtube.com/watch?v=demo1001",
      "gender": "Laki-laki",
      "date_of_birth": "2010-05-15T00:00:00.000Z",
      "school_name": "SMP Negeri 1 Jakarta",
      "branch_id": "JKT-PUSA",
      "first_enroll": "2024-01-10T00:00:00.000Z",
      "newest_grade": "Grade 8",
      "trainee_homeroom": "Kak Ahmad",
      "screening_test_url": "https://drive.google.com/file/d/screening_1001",
      "speaking_project_to_next_level": "TED Talk Simulation",
      "last_life_project_date": "2026-06-20T00:00:00.000Z",
      "last_life_project": "Community Service Drive",
      "created_at": "2026-07-25T11:00:00.000Z",
      "updated_at": "2026-07-25T11:00:00.000Z"
    }
  ],
  "pagination": {
    "total": 1,
    "page": 1,
    "limit": 10,
    "totalPages": 1
  }
}
```

---

### 2️⃣ Endpoint 2: Detail Single Trainee
Digunakan untuk membuka rincian/profile lengkap 1 trainee.

* **URL:** `GET /api/portal-trainee/:id`
* **Path Parameter `:id`:** Dapat berupa database `id` (integer) ATAU `trainee_id` (string).
  * Contoh 1: `/api/portal-trainee/1`
  * Contoh 2: `/api/portal-trainee/TR-1001`

#### Contoh JavaScript Fetch (Frontend):
```javascript
async function getTraineeDetail(traineeId) {
  const response = await fetch(`https://your-domain.com/api/portal-trainee/${traineeId}`);
  const result = await response.json();
  if (result.success) {
    console.log("Detail Trainee:", result.data);
  }
}
```

---

### 3️⃣ Endpoint 3: Ringkasan Statistik Portal
Digunakan untuk menampilkan widget / KPI cards di halaman Portal Frontend.

* **URL:** `GET /api/portal-trainee/stats/summary`

#### Contoh Respon JSON:
```json
{
  "success": true,
  "read_only": true,
  "stats": {
    "total_trainees": 150,
    "by_branch": [
      { "branch_id": "JKT-PUSA", "count": "60" },
      { "branch_id": "BDG-01", "count": "45" }
    ],
    "by_program": [
      { "program": "Youth", "count": "90" },
      { "program": "Junior", "count": "60" }
    ],
    "by_level": [
      { "level": "Level 1", "count": "80" },
      { "level": "Level 2", "count": "70" }
    ]
  }
}
```

---

## 🔒 4. Keamanan & Penanganan Respon Ditolak (HTTP 405)

Jika ada aplikasi / script yang mencoba melakukan modifikasi data langsung ke URL Portal Trainee (misal: `POST /api/portal-trainee`), backend akan mengembalikan respons penolakan otomatis:

**Status Code:** `405 Method Not Allowed`
```json
{
  "success": false,
  "message": "Akses Ditolak: API Portal Trainee hanya bersifat READ-ONLY (Hanya dapat dilihat). Operasi perubahan data (POST, PUT, DELETE, PATCH) tidak diizinkan."
}
```

---

## 💡 Ringkasan URL Siap Pakai

1. **n8n Webhook (Upsert/Write):** `POST /api/webhook/portal-trainee`
2. **Portal List Trainee (Read-Only):** `GET /api/portal-trainee`
3. **Portal Trainee Detail (Read-Only):** `GET /api/portal-trainee/:id`
4. **Portal Statistics (Read-Only):** `GET /api/portal-trainee/stats/summary`
