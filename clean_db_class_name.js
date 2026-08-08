const neonClient = require('C:/Users/ASUS ROG/.gemini/antigravity/scratch/backend_smlone_dev/src/db/neonClient');
const fs = require('fs');
const path = require('path');

async function cleanDb() {
  try {
    const res = await neonClient.query("SELECT id, class_name FROM login_portalllll WHERE class_name LIKE '%(%'");
    console.log(`Found ${res.rows.length} rows with parenthetical class_name`);

    for (const row of res.rows) {
      const cleanName = row.class_name.split('(')[0].trim();
      await neonClient.query("UPDATE login_portalllll SET class_name = $1 WHERE id = $2", [cleanName, row.id]);
    }

    console.log('✅ Successfully cleaned all class_name entries in DB!');

    // Re-export seed file
    const all = await neonClient.query("SELECT * FROM login_portalllll ORDER BY id ASC;");
    const jsonPath = path.join(__dirname, 'src/routes/seed_login_portalllll.json');
    fs.writeFileSync(jsonPath, JSON.stringify(all.rows, null, 2));
    console.log(`📁 Re-exported ${all.rows.length} rows to ${jsonPath}`);

    process.exit(0);
  } catch (err) {
    console.error('Error cleaning DB:', err);
    process.exit(1);
  }
}

cleanDb();
