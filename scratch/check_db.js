require('dotenv').config();
const db = require('../src/db/neonClient');

async function check() {
  try {
    const res = await db.query("SELECT email, full_name, ig_mom, school, raw_data FROM level_1_ca_registrations WHERE raw_data->>'Akun Instagram Mama' != '' OR raw_data->>'Nama Sekolah (Peserta Training)' != '' LIMIT 5;");
    console.log(res.rows);
  } catch (e) {
    console.error(e);
  } finally {
    process.exit();
  }
}
check();
