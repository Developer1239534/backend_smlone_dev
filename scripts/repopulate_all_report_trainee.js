const fs = require('fs');
const path = require('path');
const db = require('../src/db/neonClient');

async function main() {
  console.log('🔄 Ensuring report_trainee table and all 4 report datasets are populated...');

  // 1. Ensure table schema
  await db.query(`
    CREATE TABLE IF NOT EXISTS report_trainee (
      id VARCHAR(50) PRIMARY KEY,
      trainee_id VARCHAR(50) NOT NULL,
      report_title TEXT,
      link_yt TEXT,
      report_title_2 TEXT,
      link_term TEXT,
      link_terms JSONB,
      report_title_3 TEXT,
      link_to_report TEXT,
      link_reports_3 JSONB,
      report_title_4 TEXT,
      link_to_report_4 TEXT,
      referral_code TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    ALTER TABLE report_trainee ADD COLUMN IF NOT EXISTS report_title_2 TEXT;
    ALTER TABLE report_trainee ADD COLUMN IF NOT EXISTS link_term TEXT;
    ALTER TABLE report_trainee ADD COLUMN IF NOT EXISTS link_terms JSONB;
    ALTER TABLE report_trainee ADD COLUMN IF NOT EXISTS report_title_3 TEXT;
    ALTER TABLE report_trainee ADD COLUMN IF NOT EXISTS link_to_report TEXT;
    ALTER TABLE report_trainee ADD COLUMN IF NOT EXISTS link_reports_3 JSONB;
    ALTER TABLE report_trainee ADD COLUMN IF NOT EXISTS report_title_4 TEXT;
    ALTER TABLE report_trainee ADD COLUMN IF NOT EXISTS link_to_report_4 TEXT;
    ALTER TABLE report_trainee ADD COLUMN IF NOT EXISTS referral_code TEXT;
  `);

  console.log('✅ Schema verified.');

  // Check current count
  const cRes = await db.query('SELECT COUNT(*) FROM report_trainee');
  console.log('Current report_trainee row count:', cRes.rows[0].count);

  process.exit(0);
}

main().catch(console.error);
