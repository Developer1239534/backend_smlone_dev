const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.MYSQL_HOST || '127.0.0.1',
  user: process.env.MYSQL_USER || 'u8155716_developer',
  password: process.env.MYSQL_PASSWORD || '@=I?Grks9R^IMki2',
  database: process.env.MYSQL_DATABASE || 'u8155716_smlone_portal',
  port: parseInt(process.env.MYSQL_PORT || '3306', 10),
  waitForConnections: true,
  connectionLimit: 20,
  queueLimit: 0,
  charset: 'utf8mb4'
});

/**
 * Transforms PostgreSQL query into MySQL-compatible query
 */
function convertPgToMysql(sql, params = []) {
  if (!sql) return { sql: '', params: [] };

  let convertedSql = sql;

  // 1. Convert PostgreSQL quote "Column" to MySQL backtick `Column`
  convertedSql = convertedSql.replace(/"([a-zA-Z0-9_\s/-]+)"/g, '`$1`');

  // 2. Convert ILIKE -> LIKE
  convertedSql = convertedSql.replace(/\bILIKE\b/gi, 'LIKE');

  // 3. Convert ON CONFLICT ("ID") DO UPDATE SET ... -> ON DUPLICATE KEY UPDATE ...
  convertedSql = convertedSql.replace(/ON\s+CONFLICT\s*\([^\)]+\)\s*DO\s+UPDATE\s+SET/gi, 'ON DUPLICATE KEY UPDATE');
  convertedSql = convertedSql.replace(/ON\s+CONFLICT\s*\([^\)]+\)\s*DO\s+NOTHING/gi, 'ON DUPLICATE KEY UPDATE `ID` = `ID`');

  // 4. Convert EXCLUDED."col" -> VALUES(`col`)
  convertedSql = convertedSql.replace(/EXCLUDED\.`([^`]+)`/g, 'VALUES(`$1`)');
  convertedSql = convertedSql.replace(/EXCLUDED\."([^"]+)"/g, 'VALUES(`$1`)');

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
  const { sql: mysqlSql, params: mysqlParams } = convertPgToMysql(sqlText, params);
  const [rows] = await pool.execute(mysqlSql, mysqlParams);

  return {
    rows: Array.isArray(rows) ? rows : [],
    rowCount: Array.isArray(rows) ? rows.length : (rows.affectedRows || 0),
    affectedRows: rows.affectedRows || 0,
    insertId: rows.insertId || null
  };
}

pool.query('SELECT 1')
  .then(() => console.log('⚡ [MySQLClient] Connection pool ready & pre-warmed.'))
  .catch((err) => console.warn('⚠️ [MySQLClient] Prewarm ping failed:', err.message));

module.exports = {
  query,
  pool,
  convertPgToMysql
};
