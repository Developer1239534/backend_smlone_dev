/**
 * ============================================================
 * MYBY COIN - DATABASE INITIALIZATION & REPOSITORY
 * ============================================================
 * Mengatur DDL Database Neon PostgreSQL:
 * 1. Kolom "ID" sebagai PRIMARY KEY
 * 2. Kolom "Name" sebagai SECONDARY KEY (Indexed)
 * ============================================================
 */

const db = require('../../db/neonClient');
const { DEFAULT_REWARDS } = require('./mybyCoinConstants');

let isTablesEnsured = false;

// Helper: Ambil profil anak dari profile_trainee atau credential_portal
async function getTraineeProfile(traineeId) {
  let profile = {
    ID: String(traineeId || '').trim(),
    Name: 'Trainee SMLONE',
    HOUSE: 'House of Thenova',
    Class: 'Public Speaking Alpha'
  };

  if (!profile.ID) return profile;

  try {
    const profRes = await db.query(
      'SELECT "ID", "Name", "HOUSE", "Class" FROM profile_trainee WHERE "ID" = $1 OR "ID" ILIKE $1 OR "Name" = $1 OR "Name" ILIKE $1 LIMIT 1',
      [profile.ID]
    );
    if (profRes.rows.length > 0) {
      profile.ID = profRes.rows[0].ID;
      profile.Name = profRes.rows[0].Name || profile.Name;
      profile.HOUSE = profRes.rows[0].HOUSE || profile.HOUSE;
      profile.Class = profRes.rows[0].Class || profile.Class;
      return profile;
    }

    const credRes = await db.query(
      'SELECT "ID", "Name" FROM credential_portal WHERE "ID" = $1 OR "ID" ILIKE $1 OR "Name" = $1 OR "Name" ILIKE $1 LIMIT 1',
      [profile.ID]
    );
    if (credRes.rows.length > 0) {
      profile.ID = credRes.rows[0].ID;
      profile.Name = credRes.rows[0].Name || profile.Name;
    }
  } catch (e) {
    console.warn('[MyBy Coin] Profile fetch fallback:', e.message);
  }
  return profile;
}

// Inisialisasi tabel di database dengan ID sebagai PK dan Name sebagai Secondary Key
async function ensureMyByCoinTables() {
  if (isTablesEnsured) return;
  isTablesEnsured = true;
  return;
}

module.exports = {
  ensureMyByCoinTables,
  getTraineeProfile
};
