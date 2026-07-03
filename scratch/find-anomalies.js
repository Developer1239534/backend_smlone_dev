const { pool } = require('../src/db/neonClient');

async function main() {
  try {
    console.log('\n🔍 Searching for trainee ID 111 and 180...');
    const trainees = await pool.query(`
      SELECT id, trainee_name, class, cabang, house_sml, junior_youth FROM dashboard_trainne WHERE id IN ('111', '180')
    `);
    console.log('Trainees found:', trainees.rows);

    console.log('\n🔍 Searching for any other anomalies (like name or class containing "0" or "category" or "branch")...');
    const nameAnomalies = await pool.query(`
      SELECT id, trainee_name, class, cabang, house_sml, junior_youth FROM dashboard_trainne 
      WHERE trainee_name LIKE '%111%' 
         OR trainee_name LIKE '%180%' 
         OR trainee_name = '0' 
         OR class = '0' 
         OR cabang = '0'
    `);
    console.log('Name/class/cabang anomalies found:', nameAnomalies.rows);

    console.log('\n🔍 Searching in gp_month for ID 111 and 180...');
    const gpMonth = await pool.query(`
      SELECT * FROM gp_month WHERE trainee_id IN ('111', '180')
    `);
    console.log('gp_month rows:', gpMonth.rows);

    console.log('\n🔍 Searching in gp_tahunan for ID 111 and 180...');
    const gpTahunan = await pool.query(`
      SELECT * FROM gp_tahunan WHERE trainee_id IN ('111', '180')
    `);
    console.log('gp_tahunan rows:', gpTahunan.rows);

    console.log('\n🔍 Check unique values for class containing 0 or category...');
    const classes = await pool.query(`
      SELECT DISTINCT class FROM dashboard_trainne WHERE class LIKE '%0%' OR class LIKE '%category%' OR class LIKE '%branch%'
    `);
    console.log('Unique classes matching filter:', classes.rows);

    console.log('\n🔍 Check unique values for junior_youth (age category) containing anomaly...');
    const jy = await pool.query(`
      SELECT DISTINCT junior_youth FROM dashboard_trainne
    `);
    console.log('Unique junior_youth values:', jy.rows);

  } catch (err) {
    console.error('❌ Error finding anomalies:', err.message);
  } finally {
    await pool.end();
  }
}

main();
