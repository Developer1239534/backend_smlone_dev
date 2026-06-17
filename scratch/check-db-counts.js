const db = require('../src/db/neonClient');

async function main() {
  try {
    const res = await db.query(`
      SELECT periode, COUNT(*) as count 
      FROM quarterly_report 
      GROUP BY periode 
      ORDER BY 
        CASE 
          WHEN periode LIKE '%2023%' THEN 1
          WHEN periode LIKE '%2024%' THEN 2
          WHEN periode LIKE '%2025%' THEN 3
          WHEN periode LIKE '%2026%' THEN 4
          ELSE 5
        END,
        periode
    `);
    console.log('Quarterly report counts in database:');
    console.table(res.rows);
    process.exit(0);
  } catch (err) {
    console.error('Error querying database:', err);
    process.exit(1);
  }
}

main();
