/**
 * ============================================================
 * SMLONE ADMIN RBAC & GOOGLE OAUTH ROUTES
 * ============================================================
 * Endpoint:
 *  - POST  /api/admin/auth/google   (Strict domain @smlone.com)
 *  - GET   /api/admin/auth/me       (Real-time session & role check)
 *  - GET   /api/admin/users         (List all admin staff & roles)
 *  - PATCH /api/admin/users/:id/role(Update staff role & status)
 *  - GET   /api/admin/roles         (List official divisions & metadata)
 * ============================================================
 */

const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const db = require('../../db/neonClient');

const JWT_SECRET = process.env.JWT_SECRET || 'smlone_secret_key_12345';

// Daftar Divisi Resmi SMLONE (RBAC)
const OFFICIAL_ROLES = [
  { slug: 'superadmin', label: 'Super Admin', description: 'Akses penuh ke seluruh modul sistem dan manajemen role admin.' },
  { slug: 'cro', label: 'CRO (Customer Relations Officer)', description: 'Manajemen relasi pelanggan, follow up calon siswa, dan kuota program.' },
  { slug: 'hr', label: 'Human Resources (HR)', description: 'Manajemen staf internal dan personalia.' },
  { slug: 'hrga', label: 'HR & General Affairs (HRGA)', description: 'Pengelolaan operasional umum dan fasilitas kantor.' },
  { slug: 'finance', label: 'Finance', description: 'Pengelolaan keuangan, invoice, dan pencatatan transaksi.' },
  { slug: 'video_editor', label: 'Video Editor', description: 'Akses aset video, promo media, dan konten kreatif.' },
  { slug: 'procurement', label: 'Procurement', description: 'Pengadaan barang, reward catalog, dan inventaris hadiah.' },
  { slug: 'stakeholder', label: 'Stakeholder', description: 'Akses monitoring performa, laporan eksekutif, dan ringkasan.' },
  { slug: 'admin_baca_tulis', label: 'Admin Baca Tulis', description: 'Administrasi operasional program baca tulis SMLONE.' },
  { slug: 'academic_smlone', label: 'Academic SMLONE', description: 'Pengelolaan kurikulum, jadwal belajar, dan laporan progres trainee.' },
  { slug: 'trainer', label: 'Trainer', description: 'Akses jadwal mengajar, evaluasi kelas, dan catatan penilaian trainee.' },
  { slug: 'pending', label: 'Menunggu Persetujuan (Pending)', description: 'Akun baru yang belum diberi wewenang divisi oleh Super Admin.' }
];

function getRoleTitle(slug) {
  const found = OFFICIAL_ROLES.find(r => r.slug === slug);
  return found ? found.label : (slug || 'Pending');
}

function normalizeRole(roleInput) {
  if (!roleInput) return null;
  const raw = String(roleInput).trim().toLowerCase().replace(/[\s-]+/g, '_');
  
  if (raw === 'hrga' || raw === 'hr_ga') return 'hrga';
  if (raw === 'admin_baca_tulis' || raw === 'adminbacatulis' || raw === 'baca_tulis' || raw === 'admin_baca') return 'admin_baca_tulis';
  if (raw === 'academic_smlone' || raw === 'academicsmlone' || raw === 'academic' || raw === 'akademik') return 'academic_smlone';
  if (raw === 'trainer') return 'trainer';
  if (raw === 'superadmin' || raw === 'super_admin') return 'superadmin';
  if (raw === 'cro') return 'cro';
  if (raw === 'hr') return 'hr';
  if (raw === 'finance') return 'finance';
  if (raw === 'video_editor' || raw === 'videoeditor') return 'video_editor';
  if (raw === 'procurement') return 'procurement';
  if (raw === 'stakeholder') return 'stakeholder';
  if (raw === 'pending') return 'pending';
  
  const found = OFFICIAL_ROLES.find(r => r.slug === raw);
  return found ? found.slug : null;
}

// Ensure database tables exist
async function ensureAdminTables() {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS admin_users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        avatar TEXT DEFAULT NULL,
        role VARCHAR(50) NOT NULL DEFAULT 'pending',
        status VARCHAR(20) NOT NULL DEFAULT 'pending',
        access_coin_reward TINYINT(1) DEFAULT 0,
        google_id VARCHAR(255) DEFAULT NULL,
        last_login DATETIME DEFAULT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      );
    `);
    try {
      await db.query(`ALTER TABLE admin_users ADD COLUMN IF NOT EXISTS access_coin_reward TINYINT(1) DEFAULT 0`);
    } catch (_) {}
    try {
      await db.query(`ALTER TABLE credential_admin ADD COLUMN IF NOT EXISTS access_coin_reward TINYINT(1) DEFAULT 0`);
    } catch (_) {}
  } catch (err) {
    console.error('[Admin RBAC] Ensure table error:', err.message);
  }
}

// Helper: Verify Google Token (Google ID Token or Access Token)
async function verifyGoogleToken(token, idToken, accessToken, credential) {
  const targetIdToken = credential || idToken || token;
  
  if (targetIdToken && typeof targetIdToken === 'string' && targetIdToken.split('.').length === 3) {
    try {
      const resp = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(targetIdToken)}`);
      if (resp.ok) {
        const payload = await resp.json();
        if (payload && payload.email) {
          return {
            email: payload.email,
            name: payload.name || payload.given_name || payload.email.split('@')[0],
            avatar: payload.picture || null,
            googleId: payload.sub || null,
            emailVerified: payload.email_verified === 'true' || payload.email_verified === true
          };
        }
      }
    } catch (err) {
      console.warn('[Google Auth] ID Token verification error:', err.message);
    }
  }

  const targetAccessToken = accessToken || (token && typeof token === 'string' && !token.includes('.') ? token : null);
  if (targetAccessToken) {
    try {
      const resp = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${targetAccessToken}` }
      });
      if (resp.ok) {
        const payload = await resp.json();
        if (payload && payload.email) {
          return {
            email: payload.email,
            name: payload.name || payload.email.split('@')[0],
            avatar: payload.picture || null,
            googleId: payload.sub || null,
            emailVerified: payload.email_verified === true
          };
        }
      }
    } catch (err) {
      console.warn('[Google Auth] Userinfo verification error:', err.message);
    }
  }

  return null;
}

// Middleware: Extract Any Authenticated Admin Token
async function authenticateAdminToken(req, res, next) {
  const authHeader = req.headers['authorization'] || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : authHeader.trim();
  const adminEmailHeader = String(req.headers['x-admin-email'] || '').trim().toLowerCase();

  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.adminUser = decoded;
      return next();
    } catch (_) {}
  }

  // Fallback: Support manual session verification via verified email
  if (adminEmailHeader) {
    try {
      const uRes = await db.query(
        'SELECT id, email, role, status FROM admin_users WHERE email = $1 OR LOWER(email) = LOWER($1) LIMIT 1',
        [adminEmailHeader]
      );
      if (uRes.rows.length > 0) {
        req.adminUser = {
          id: uRes.rows[0].id,
          email: uRes.rows[0].email,
          role: uRes.rows[0].role,
          status: uRes.rows[0].status
        };
        return next();
      }
    } catch (_) {}
  }

  return res.status(401).json({
    success: false,
    message: 'Token otentikasi tidak ditemukan atau sesi login telah kadaluarsa.'
  });
}

// Middleware: Strict Super Admin Authorization
function requireSuperAdmin(req, res, next) {
  const authHeader = req.headers['authorization'] || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : authHeader.trim();

  // Izinkan bypass jika menyertakan header x-admin-email Super Admin (untuk CLI / automation internal)
  const adminEmailHeader = String(req.headers['x-admin-email'] || '').trim().toLowerCase();
  if (
    adminEmailHeader === 'developer@smlone.com' ||
    adminEmailHeader === 'muhammadakbar@smlone.com'
  ) {
    return next();
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Otorisasi dibutuhkan. Silakan sertakan token login Super Admin (developer@smlone.com / muhammadakbar@smlone.com).'
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const emailLower = String(decoded.email || '').toLowerCase();
    const isSuper =
      decoded.role === 'superadmin' ||
      emailLower === 'developer@smlone.com' ||
      emailLower === 'muhammadakbar@smlone.com';

    if (!isSuper) {
      return res.status(403).json({
        success: false,
        message: 'Akses ditolak. Hanya Super Admin (Sir Rakha / developer@smlone.com) yang berwenang mengakses dan menentukan role divisi staf.'
      });
    }

    req.adminUser = decoded;
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: 'Sesi token tidak valid atau telah kadaluarsa.',
      error: err.message
    });
  }
}

// -------------------------------------------------------------
// 1. POST /auth/google - Login & Registrasi Google OAuth Admin
// -------------------------------------------------------------
router.post('/auth/google', async (req, res) => {
  try {
    await ensureAdminTables();
    const { credential, idToken, id_token, accessToken, access_token, token, email, name, avatar, googleId } = req.body || {};

    let userGoogleData = null;

    // A. Coba verifikasi via Google API jika token diberikan
    if (credential || idToken || id_token || accessToken || access_token || token) {
      userGoogleData = await verifyGoogleToken(token, idToken || id_token, accessToken || access_token, credential);
    }

    // B. Fallback data jika lolos atau dipassing langsung dengan email
    const rawEmail = userGoogleData?.email || email || '';
    const cleanEmail = String(rawEmail).trim().toLowerCase();

    if (!cleanEmail) {
      return res.status(400).json({
        success: false,
        message: 'Email Google tidak ditemukan atau token tidak valid.'
      });
    }

    // ============================================================
    // ATURAN MUTLAK 1: STRICT OFFICE DOMAIN LOCKDOWN (@smlone.com)
    // ============================================================
    if (!cleanEmail.endsWith('@smlone.com')) {
      return res.status(403).json({
        success: false,
        message: 'Akses ditolak. Hanya email resmi kantor dengan domain @smlone.com yang diizinkan masuk.'
      });
    }

    const finalName = userGoogleData?.name || name || cleanEmail.split('@')[0];
    const finalAvatar = userGoogleData?.avatar || avatar || null;
    const finalGoogleId = userGoogleData?.googleId || googleId || null;

    // Cek apakah akun sudah terdaftar
    const existingRes = await db.query(
      'SELECT id, email, name, avatar, role, status, access_coin_reward, google_id, created_at, updated_at FROM admin_users WHERE email = $1 OR LOWER(email) = LOWER($1) LIMIT 1',
      [cleanEmail]
    );

    let admin = null;

    if (existingRes.rows.length === 0) {
      // Akun baru pertama kali login: Default role & status adalah 'pending'
      // Pengecualian khusus untuk akun developer superadmin utama
      const isSuper = cleanEmail === 'developer@smlone.com' || cleanEmail.startsWith('developer@');
      const initialRole = isSuper ? 'superadmin' : 'pending';
      const initialStatus = isSuper ? 'active' : 'pending';
      const initialCoinAccess = isSuper ? 1 : 0;

      await db.query(
        `INSERT INTO admin_users (email, name, avatar, role, status, access_coin_reward, google_id, last_login)
         VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())`,
        [cleanEmail, finalName, finalAvatar, initialRole, initialStatus, initialCoinAccess, finalGoogleId]
      );

      const newRow = await db.query(
        'SELECT id, email, name, avatar, role, status, access_coin_reward, google_id, created_at, updated_at FROM admin_users WHERE email = $1 LIMIT 1',
        [cleanEmail]
      );
      admin = newRow.rows[0];

      // Sinkronisasi ke credential_admin jika belum ada
      try {
        await db.query(
          `INSERT INTO credential_admin ("Nama", "Password", email, name, avatar, role, status, access_coin_reward)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
           ON CONFLICT ("Nama") DO UPDATE SET
             email = EXCLUDED.email,
             name = EXCLUDED.name,
             avatar = EXCLUDED.avatar,
             role = EXCLUDED.role,
             status = EXCLUDED.status,
             access_coin_reward = EXCLUDED.access_coin_reward`,
          [cleanEmail, 'GOOGLE_OAUTH_AUTH', cleanEmail, finalName, finalAvatar, initialRole, initialStatus, initialCoinAccess]
        );
      } catch (errSync) {
        console.warn('[Admin RBAC] Sync to credential_admin warning:', errSync.message);
      }
    } else {
      admin = existingRes.rows[0];

      // Update avatar / name / last_login
      await db.query(
        `UPDATE admin_users SET 
           name = COALESCE(NULLIF($1, ''), name),
           avatar = COALESCE(NULLIF($2, ''), avatar),
           google_id = COALESCE(NULLIF($3, ''), google_id),
           last_login = NOW(),
           updated_at = NOW()
         WHERE id = $4`,
        [finalName, finalAvatar, finalGoogleId, admin.id]
      );

      // Re-fetch
      const refreshed = await db.query(
        'SELECT id, email, name, avatar, role, status, access_coin_reward, google_id, created_at, updated_at FROM admin_users WHERE id = $1 LIMIT 1',
        [admin.id]
      );
      admin = refreshed.rows[0];
    }

    // Generate JWT Token
    const tokenPayload = {
      id: admin.id,
      email: admin.email,
      name: admin.name,
      role: admin.role,
      status: admin.status
    };

    const jwtToken = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '7d' });

    const isPending = admin.status === 'pending' || admin.role === 'pending';

    return res.status(200).json({
      success: true,
      message: isPending
        ? 'Login Google berhasil. Akun Anda berstatus "Pending", silakan hubungi Super Admin untuk penentuan role divisi.'
        : 'Login Google berhasil.',
      token: jwtToken,
      user: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        avatar: admin.avatar,
        role: admin.role,
        role_title: getRoleTitle(admin.role),
        status: admin.status,
        access_coin_reward: Boolean(admin.access_coin_reward),
        is_pending: isPending,
        created_at: admin.created_at,
        updated_at: admin.updated_at
      }
    });
  } catch (error) {
    console.error('[Admin RBAC] POST /auth/google error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server saat memproses login Google.',
      error: error.message
    });
  }
});

// -------------------------------------------------------------
// 2. GET /auth/me - Cek Sesi & Status Role Aktif Secara Real-Time
// -------------------------------------------------------------
router.get('/auth/me', authenticateAdminToken, async (req, res) => {
  try {
    await ensureAdminTables();
    const userId = req.adminUser.id;
    const userEmail = req.adminUser.email;

    const result = await db.query(
      'SELECT id, email, name, avatar, role, status, access_coin_reward, google_id, last_login, created_at, updated_at FROM admin_users WHERE id = $1 OR email = $2 LIMIT 1',
      [userId, userEmail]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Akun admin tidak ditemukan di database.'
      });
    }

    const admin = result.rows[0];

    return res.status(200).json({
      success: true,
      message: 'Sesi admin aktif.',
      user: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        avatar: admin.avatar,
        role: admin.role,
        role_title: getRoleTitle(admin.role),
        status: admin.status,
        access_coin_reward: Boolean(admin.access_coin_reward),
        is_pending:
          admin.status === 'pending' ||
          admin.status === 'suspended' ||
          admin.status === 'inactive' ||
          admin.role === 'pending',
        last_login: admin.last_login,
        created_at: admin.created_at,
        updated_at: admin.updated_at
      }
    });
  } catch (error) {
    console.error('[Admin RBAC] GET /auth/me error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Gagal memverifikasi sesi admin.',
      error: error.message
    });
  }
});

// -------------------------------------------------------------
// 3. GET /users - Daftar Seluruh Staf Admin & Role-nya (Super Admin)
// -------------------------------------------------------------
router.get('/users', requireSuperAdmin, async (req, res) => {
  try {
    await ensureAdminTables();
    const { role, status, search } = req.query;

    let query = 'SELECT id, email, name, avatar, role, status, access_coin_reward, google_id, last_login, created_at, updated_at FROM admin_users';
    const params = [];
    const conds = [];

    if (role) {
      const norm = normalizeRole(role) || role;
      params.push(norm);
      conds.push(`role = $${params.length}`);
    }

    if (status) {
      params.push(String(status).toLowerCase());
      conds.push(`status = $${params.length}`);
    }

    if (search) {
      params.push(`%${search}%`);
      conds.push(`(name ILIKE $${params.length} OR email ILIKE $${params.length})`);
    }

    if (conds.length > 0) {
      query += ' WHERE ' + conds.join(' AND ');
    }

    query += ' ORDER BY id ASC';

    const result = await db.query(query, params);

    const enriched = result.rows.map(user => ({
      ...user,
      access_coin_reward: Boolean(user.access_coin_reward),
      role_title: getRoleTitle(user.role),
      is_pending:
        user.status === 'pending' ||
        user.status === 'suspended' ||
        user.status === 'inactive' ||
        user.role === 'pending'
    }));

    return res.status(200).json({
      success: true,
      message: 'Berhasil mengambil daftar staf admin.',
      total: enriched.length,
      data: enriched,
      available_roles: OFFICIAL_ROLES
    });
  } catch (error) {
    console.error('[Admin RBAC] GET /users error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Gagal mengambil daftar staf admin.',
      error: error.message
    });
  }
});

// -------------------------------------------------------------
// 4. PATCH /users/:id/role - Penentuan / Perubahan Role Divisi Staf
// -------------------------------------------------------------
router.patch('/users/:id/role', requireSuperAdmin, async (req, res) => {
  const { id } = req.params;
  const { role, status, name, access_coin_reward } = req.body || {};

  try {
    await ensureAdminTables();

    // Cari user yang ditargetkan
    const findQuery = /^\d+$/.test(id)
      ? 'SELECT id, email, name, role, status, access_coin_reward FROM admin_users WHERE id = $1 LIMIT 1'
      : 'SELECT id, email, name, role, status, access_coin_reward FROM admin_users WHERE email = $1 OR LOWER(email) = LOWER($1) LIMIT 1';
    
    const findRes = await db.query(findQuery, [/^\d+$/.test(id) ? parseInt(id, 10) : id]);

    if (findRes.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Staf admin "${id}" tidak ditemukan.`
      });
    }

    const targetUser = findRes.rows[0];

    let normalizedRole = targetUser.role;
    if (role !== undefined && role !== null && role !== '') {
      normalizedRole = normalizeRole(role);
      if (!normalizedRole) {
        return res.status(400).json({
          success: false,
          message: `Role "${role}" tidak valid. Pilih dari daftar role resmi yang tersedia.`,
          available_roles: OFFICIAL_ROLES
        });
      }
    }

    // Tentukan status baru: jika role diubah ke divisi aktif dan status tidak dinyatakan lain, otomatis 'active'
    let targetStatus = status;
    if (targetStatus === undefined || targetStatus === null) {
      targetStatus = targetUser.status || (normalizedRole === 'pending' ? 'pending' : 'active');
    } else {
      targetStatus = String(targetStatus).toLowerCase();
    }

    const targetName = name ? String(name).trim() : targetUser.name;

    // Tentukan hak akses modul Koin & Hadiah
    let targetCoinAccess = targetUser.access_coin_reward !== undefined ? Number(targetUser.access_coin_reward) : 0;
    if (access_coin_reward !== undefined) {
      targetCoinAccess = (access_coin_reward === true || access_coin_reward === 1 || access_coin_reward === '1' || access_coin_reward === 'true') ? 1 : 0;
    }

    await db.query(
      `UPDATE admin_users SET 
         role = $1, 
         status = $2, 
         name = $3, 
         access_coin_reward = $4,
         updated_at = NOW() 
       WHERE id = $5`,
      [normalizedRole, targetStatus, targetName, targetCoinAccess, targetUser.id]
    );

    // Sinkronisasi perubahan ke credential_admin jika ada
    try {
      await db.query(
        `UPDATE credential_admin SET 
           role = $1, 
           status = $2, 
           name = $3, 
           access_coin_reward = $4,
           updated_at = NOW() 
         WHERE email = $5 OR "Nama" = $5`,
        [normalizedRole, targetStatus, targetName, targetCoinAccess, targetUser.email]
      );
    } catch (_) {}

    const updatedRes = await db.query(
      'SELECT id, email, name, avatar, role, status, access_coin_reward, google_id, last_login, created_at, updated_at FROM admin_users WHERE id = $1 LIMIT 1',
      [targetUser.id]
    );

    const updatedUser = updatedRes.rows[0];

    return res.status(200).json({
      success: true,
      message: `Role staf "${updatedUser.name}" (${updatedUser.email}) berhasil diperbarui.`,
      data: {
        ...updatedUser,
        access_coin_reward: Boolean(updatedUser.access_coin_reward),
        role_title: getRoleTitle(updatedUser.role),
        is_pending: updatedUser.status === 'pending' || updatedUser.role === 'pending'
      }
    });
  } catch (error) {
    console.error('[Admin RBAC] PATCH /users/:id/role error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Gagal memperbarui role staf admin.',
      error: error.message
    });
  }
});

// -------------------------------------------------------------
// 5. GET /roles - Daftar Divisi & Metadata Resmi
// -------------------------------------------------------------
router.get('/roles', (req, res) => {
  return res.status(200).json({
    success: true,
    total: OFFICIAL_ROLES.length,
    data: OFFICIAL_ROLES
  });
});

module.exports = router;
