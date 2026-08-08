const db = require('./src/db/neonClient');

async function checkAllColumns() {
  const colRes = await db.query(`
    SELECT table_name, column_name 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND (data_type LIKE '%char%' OR data_type LIKE '%text%')
  `);
  
  for (const row of colRes.rows) {
    const { table_name, column_name } = row;
    try {
      const res = await db.query(`
        SELECT DISTINCT ${column_name} 
        FROM ${table_name} 
        WHERE ${column_name} LIKE '%(Sat 10-12)%' 
           OR ${column_name} LIKE '%(Fri%' 
           OR ${column_name} LIKE '%(Sat%' 
           OR ${column_name} LIKE '%(Wed%'
           OR ${column_name} LIKE '%(Thu%'
           OR ${column_name} LIKE '%(Mon%'
           OR ${column_name} LIKE '%(Tue%'
      `);
      if (res.rows.length > 0) {
        console.log(`Table ${table_name}, Col ${column_name}:`, res.rows.map(r => r[column_name]));
        const updateRes = await db.query(`
          UPDATE ${table_name} 
          SET ${column_name} = REGEXP_REPLACE(${column_name}, '\\s*\\(.*?\\)', '', 'g')
          WHERE ${column_name} LIKE '%(Sat%' 
             OR ${column_name} LIKE '%(Fri%' 
             OR ${column_name} LIKE '%(Wed%'
             OR ${column_name} LIKE '%(Thu%'
             OR ${column_name} LIKE '%(Mon%'
             OR ${column_name} LIKE '%(Tue%'
        `);
        console.log(`Updated ${updateRes.rowCount} rows in ${table_name}.${column_name}`);
      }
    } catch(e) {
      // ignore query errors for unsupported types or views
    }
  }
  console.log('Finished deep check and cleanup of all text/varchar columns.');
  process.exit(0);
}

checkAllColumns().catch(err => { console.error(err); process.exit(1); });
