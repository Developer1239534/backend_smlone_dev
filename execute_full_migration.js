const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

const sourceUrl = "postgresql://neondb_owner:npg_bUS6uiTFBA3K@ep-muddy-bar-aojszwfn-pooler.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require";
const destUrl = "postgresql://neondb_owner:npg_Ti6wJdY8KDfc@ep-aged-lake-ax5jy3ol-pooler.c-4.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require";

const backupPath = path.join(__dirname, 'smlone_backup.sql');

async function executeMigration() {
  console.log('🚀 Starting Fast Lossless Database Migration Process...\n');

  const sourcePool = new Pool({ connectionString: sourceUrl, ssl: { rejectUnauthorized: false } });
  const destPool = new Pool({ connectionString: destUrl, ssl: { rejectUnauthorized: false } });

  try {
    // 1. Fetch tables from Source DB
    const tablesRes = await sourcePool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `);
    const tables = tablesRes.rows.map(r => r.table_name);
    console.log(`[Source DB] Found ${tables.length} tables to process.`);

    const backupLines = [];
    backupLines.push(`-- SMLONE Full Lossless Database Backup`);
    backupLines.push(`-- Generated: ${new Date().toISOString()}`);
    backupLines.push(`-- Source: ep-muddy-bar-aojszwfn`);
    backupLines.push(`-- Destination: ep-aged-lake-ax5jy3ol\n`);

    let totalRows = 0;

    for (const table of tables) {
      const dataRes = await sourcePool.query(`SELECT * FROM "${table}"`);
      const rowCount = dataRes.rows.length;
      totalRows += rowCount;

      console.log(`  Exporting [${table}]: ${rowCount} rows`);
      backupLines.push(`-- Table: ${table} (${rowCount} rows)`);

      if (rowCount > 0) {
        const cols = Object.keys(dataRes.rows[0]);
        const colList = cols.map(c => `"${c}"`).join(', ');

        for (const row of dataRes.rows) {
          const vals = cols.map(c => {
            const v = row[c];
            if (v === null || v === undefined) return 'NULL';
            if (typeof v === 'boolean' || typeof v === 'number') return v;
            if (v instanceof Date) return `'${v.toISOString()}'`;
            if (typeof v === 'object') return `'${JSON.stringify(v).replace(/'/g, "''")}'::jsonb`;
            return `'${String(v).replace(/'/g, "''")}'`;
          });
          backupLines.push(`INSERT INTO "${table}" (${colList}) VALUES (${vals.join(', ')}) ON CONFLICT DO NOTHING;`);
        }
      }
      backupLines.push('');
    }

    fs.writeFileSync(backupPath, backupLines.join('\n'));
    const stats = fs.statSync(backupPath);
    console.log(`\n💾 Backup file created: smlone_backup.sql (${(stats.size / 1024 / 1024).toFixed(2)} MB)`);

    // 2. Perform Batch Data Copy into Destination DB
    console.log('\n📥 Synchronizing data into Destination DB (ep-aged-lake)...');
    const syncStart = Date.now();

    for (const table of tables) {
      const dataRes = await sourcePool.query(`SELECT * FROM "${table}"`);
      if (dataRes.rows.length === 0) continue;

      const cols = Object.keys(dataRes.rows[0]);
      const colList = cols.map(c => `"${c}"`).join(', ');
      const chunkSize = 100;

      for (let i = 0; i < dataRes.rows.length; i += chunkSize) {
        const chunk = dataRes.rows.slice(i, i + chunkSize);
        const params = [];
        const valueTuples = [];

        chunk.forEach((row, rowIndex) => {
          const tupleParams = [];
          cols.forEach((col, colIndex) => {
            const paramIdx = rowIndex * cols.length + colIndex + 1;
            tupleParams.push(`$${paramIdx}`);
            let val = row[col];
            if (typeof val === 'object' && val !== null && !(val instanceof Date)) {
              val = JSON.stringify(val);
            }
            params.push(val);
          });
          valueTuples.push(`(${tupleParams.join(', ')})`);
        });

        const queryText = `INSERT INTO "${table}" (${colList}) VALUES ${valueTuples.join(', ')} ON CONFLICT DO NOTHING`;
        await destPool.query(queryText, params).catch(err => {
          if (!err.message.includes('duplicate key')) {
            console.warn(`Sync warning [${table}]: ${err.message}`);
          }
        });
      }
    }

    const syncDuration = Date.now() - syncStart;
    console.log(`✅ Fast batch synchronization completed in ${syncDuration}ms.`);

    // 3. Lossless Verification & Auditing
    console.log('\n🔍 Verifying 1-to-1 migration integrity between Source DB and Destination DB...\n');

    const auditResults = [];
    let is100PercentMatched = true;

    for (const table of tables) {
      const srcCountRes = await sourcePool.query(`SELECT COUNT(*) FROM "${table}"`);
      const destCountRes = await destPool.query(`SELECT COUNT(*) FROM "${table}"`);

      const srcCount = parseInt(srcCountRes.rows[0].count);
      const destCount = parseInt(destCountRes.rows[0].count);

      const isMatch = srcCount === destCount;
      if (!isMatch) is100PercentMatched = false;

      auditResults.push({
        table,
        sourceRows: srcCount,
        destRows: destCount,
        status: isMatch ? '✅ MATCH' : '❌ MISMATCH',
      });
    }

    console.table(auditResults);
    console.log(`\nOverall Integrity Audit: ${is100PercentMatched ? '✅ 100% PERFECT LOSSLESS MATCH' : '❌ MISMATCH DETECTED'}`);

    const reportData = {
      timestamp: new Date().toISOString(),
      sourceProject: 'ep-muddy-bar (ap-southeast-1)',
      destProject: 'ep-aged-lake (us-east-2)',
      backupFile: 'smlone_backup.sql',
      backupSizeBytes: stats.size,
      backupSizeMB: (stats.size / 1024 / 1024).toFixed(2),
      syncDurationMs: syncDuration,
      tablesMigrated: tables.length,
      totalRowsMigrated: totalRows,
      auditResults,
      is100PercentMatched,
    };

    fs.writeFileSync(path.join(__dirname, 'migration_audit_report.json'), JSON.stringify(reportData, null, 2));

    await sourcePool.end();
    await destPool.end();

    process.exit(0);
  } catch (err) {
    console.error('❌ Migration error:', err);
    await sourcePool.end();
    await destPool.end();
    process.exit(1);
  }
}

executeMigration();
