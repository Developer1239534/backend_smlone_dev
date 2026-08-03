require('dotenv').config();
const db = require('./src/db/neonClient');

(async () => {
  try {
    const ids = ['70100104', '1184', '1188', '1211', '1225'];
    
    for (const id of ids) {
      console.log(`\n🔍 Searching ID ${id} across all tables...`);
      
      const pt = await db.query(`SELECT * FROM profile_trainee WHERE trainee_id = $1`, [id]);
      console.log('profile_trainee:', pt.rows[0]?.name, '| class:', pt.rows[0]?.class_name, '| trainer:', pt.rows[0]?.trainer);

      const ra = await db.query(`SELECT * FROM report_activity WHERE trainee_id = $1`, [id]).catch(() => ({ rows: [] }));
      if (ra.rows.length > 0) console.log('report_activity:', ra.rows[0]);

      const lr = await db.query(`SELECT * FROM link_report WHERE trainee_id = $1`, [id]).catch(() => ({ rows: [] }));
      if (lr.rows.length > 0) console.log('link_report:', lr.rows[0]);
    }

  } catch (err) {
    console.error('Search error:', err);
  }
  process.exit(0);
})();
