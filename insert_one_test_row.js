const db = require('./src/db/neonClient');

async function insertTestRow() {
  try {
    const res = await db.query(`
      INSERT INTO house_rank ("Nama House", "Total Gold", "Class", "Cabang", "Program", "Rank")
      VALUES ('House of Creanova', 5720, 'Grahan', 'TIMOR', 'Junior', 1)
      RETURNING *;
    `);
    console.log('✅ Row inserted into endpoint axnby8iy:', res.rows[0]);

    const countRes = await db.query('SELECT COUNT(*) FROM house_rank;');
    console.log('📊 Current total rows in endpoint axnby8iy:', countRes.rows[0].count);
  } catch (err) {
    console.error('Error inserting row:', err);
  } finally {
    process.exit(0);
  }
}

insertTestRow();
