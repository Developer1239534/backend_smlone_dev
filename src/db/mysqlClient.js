const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.MYSQL_HOST || '109.106.253.219',
  user: process.env.MYSQL_USER || 'u8155716_developer',
  password: process.env.MYSQL_PASSWORD || '@=I?Grks9R^IMki2',
  database: process.env.MYSQL_DATABASE || 'u8155716_smlone_portal',
  port: parseInt(process.env.MYSQL_PORT || '3306', 10),
  waitForConnections: true,
  connectionLimit: 20,
  queueLimit: 0,
  charset: 'utf8mb4',
  timezone: '+07:00'
});

/**
 * Transforms PostgreSQL query into MySQL-compatible query
 */
function convertPgToMysql(sql, params = []) {
  if (!sql) return { sql: '', params: [] };

  let convertedSql = sql;

  // 0. Handle Transaction & DDL helpers
  convertedSql = convertedSql.replace(/^\s*BEGIN\s*;?/gi, 'START TRANSACTION;');
  convertedSql = convertedSql.replace(/\bto_regclass\s*\([^\)]+\)/gi, "1");
  convertedSql = convertedSql.replace(/\bpublic\./gi, '');
  convertedSql = convertedSql.replace(/`public`\./gi, '');

  // 0a. Strip PostgreSQL DDL specifics (TIMESTAMP WITH TIME ZONE, TIMESTAMPTZ, JSONB, CREATE INDEX IF NOT EXISTS)
  convertedSql = convertedSql.replace(/TIMESTAMP\s+WITH\s+TIME\s+ZONE/gi, 'TIMESTAMP');
  convertedSql = convertedSql.replace(/\bTIMESTAMPTZ\b/gi, 'TIMESTAMP');
  convertedSql = convertedSql.replace(/\bJSONB\b/gi, 'JSON');
  convertedSql = convertedSql.replace(/CREATE\s+INDEX\s+IF\s+NOT\s+EXISTS[\s\S]+?;/gi, '');

  // 0b. Remove PostgreSQL typecasts (e.g. ::int, ::TEXT, ::DATE, ::jsonb) & NULLS LAST/FIRST
  convertedSql = convertedSql.replace(/::[a-zA-Z0-9_]+/g, '');
  convertedSql = convertedSql.replace(/\bNULLS\s+(LAST|FIRST)\b/gi, '');

  // 0c. Remove RETURNING clause at end of INSERT/UPDATE/DELETE queries
  convertedSql = convertedSql.replace(/\bRETURNING\s+[\s\S]+$/gi, '');

  // 1. Convert PostgreSQL quote "Column" to MySQL backtick `Column`
  convertedSql = convertedSql.replace(/"([^"]+)"/g, '`$1`');

  // 1b. Map `ID` to `trainee_id` ONLY when prefixed by myby_coin_transactions / myby_redeem_requests or aliases (tx, r) or inside INSERT INTO those tables
  convertedSql = convertedSql.replace(/\b(tx|r|myby_coin_transactions|myby_redeem_requests)\.`ID`/gi, '$1.`trainee_id`');
  if (/INSERT\s+INTO\s+`?(myby_coin_transactions|myby_redeem_requests)`?/i.test(convertedSql)) {
    const matchVal = convertedSql.match(/ON\s+DUPLICATE|VALUES/i);
    if (matchVal) {
      const parts = convertedSql.split(matchVal[0]);
      parts[0] = parts[0].replace(/`ID`/g, '`trainee_id`');
      convertedSql = parts.join(matchVal[0]);
    }
  }

  // 2. Convert ILIKE -> LIKE
  convertedSql = convertedSql.replace(/\bILIKE\b/gi, 'LIKE');

  // 3. Convert ON CONFLICT ("ID") DO UPDATE SET ... -> ON DUPLICATE KEY UPDATE ...
  convertedSql = convertedSql.replace(/ON\s+CONFLICT\s*\([^\)]+\)\s*DO\s+UPDATE\s+SET/gi, 'ON DUPLICATE KEY UPDATE');
  convertedSql = convertedSql.replace(/ON\s+CONFLICT\s*\([^\)]+\)\s*DO\s+NOTHING/gi, 'ON DUPLICATE KEY UPDATE `ID` = `ID`');

  // 4. Convert EXCLUDED."col" -> VALUES(`col`)
  convertedSql = convertedSql.replace(/EXCLUDED\.`([^`]+)`/g, 'VALUES(`$1`)');
  convertedSql = convertedSql.replace(/EXCLUDED\."([^"]+)"/g, 'VALUES(`$1`)');

  // 5. Remove table name prefixes in ON DUPLICATE KEY UPDATE clause (e.g. myby_trainee_wallets.balance -> balance)
  if (convertedSql.includes('ON DUPLICATE KEY UPDATE')) {
    const parts = convertedSql.split('ON DUPLICATE KEY UPDATE');
    parts[1] = parts[1].replace(/`?[a-zA-Z0-9_]+`?\.\s*(`?[a-zA-Z0-9_]+`?)/g, '$1');
    convertedSql = parts.join('ON DUPLICATE KEY UPDATE');
  }

  // 5. Convert Parameterized $1, $2, $3 -> ?
  const newParams = [];
  convertedSql = convertedSql.replace(/\$([0-9]+)/g, (match, indexStr) => {
    const idx = parseInt(indexStr, 10) - 1;
    if (idx >= 0 && idx < params.length) {
      newParams.push(params[idx]);
    }
    return '?';
  });

  const finalParams = newParams.length > 0 || params.length === 0 ? newParams : params;

  return { sql: convertedSql, params: finalParams };
}

async function query(sqlText, params = []) {
  if (/^\s*DO\s+\$\$/i.test(sqlText)) {
    return { rows: [], rowCount: 0, affectedRows: 0, insertId: null };
  }
  const { sql: mysqlSql, params: mysqlParams } = convertPgToMysql(sqlText, params);
  if (!mysqlSql || !mysqlSql.trim()) {
    return { rows: [], rowCount: 0, affectedRows: 0, insertId: null };
  }
  const [rows] = await pool.execute(mysqlSql, mysqlParams);

  const isReturning = /\bRETURNING\b/i.test(sqlText);
  let returnRows = Array.isArray(rows) ? rows : [];
  if (!Array.isArray(rows) && isReturning && rows.affectedRows > 0) {
    returnRows = [{ id: rows.insertId || 1, success: true }];
  }

  return {
    rows: returnRows,
    rowCount: Array.isArray(rows) ? rows.length : (rows.affectedRows || 0),
    affectedRows: rows.affectedRows || 0,
    insertId: rows.insertId || null
  };
}

async function connect() {
  const connection = await pool.getConnection();
  return {
    query: async (sqlText, params = []) => {
      const { sql: mysqlSql, params: mysqlParams } = convertPgToMysql(sqlText, params);
      const [rows] = await connection.execute(mysqlSql, mysqlParams);

      const isReturning = /\bRETURNING\b/i.test(sqlText);
      let returnRows = Array.isArray(rows) ? rows : [];
      if (!Array.isArray(rows) && isReturning && rows.affectedRows > 0) {
        returnRows = [{ id: rows.insertId || 1, success: true }];
      }

      return {
        rows: returnRows,
        rowCount: Array.isArray(rows) ? rows.length : (rows.affectedRows || 0),
        affectedRows: rows.affectedRows || 0,
        insertId: rows.insertId || null
      };
    },
    release: () => connection.release()
  };
}

pool.query('SELECT 1')
  .then(() => console.log('⚡ [MySQLClient] Connection pool ready & pre-warmed on Hostinger MySQL.'))
  .catch((err) => console.warn('⚠️ [MySQLClient] Prewarm ping failed:', err.message));

module.exports = {
  query,
  pool: { ...pool, connect },
  convertPgToMysql
};
