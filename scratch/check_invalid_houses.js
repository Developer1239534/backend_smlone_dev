const db = require('../src/db/neonClient');

const ALLOWED_HOUSES = [
  'House of Havaria',
  'House of Quorion',
  'House of Thenova',
  'House of Creanova',
  'House of Reverion'
];

async function checkInvalidHouses() {
  try {
    const result = await db.query(`
      SELECT id, trainee_name, house_sml 
      FROM dashboard_trainne
      WHERE house_sml NOT IN ($1, $2, $3, $4, $5) 
         OR house_sml = ''
      ORDER BY house_sml;
    `, ALLOWED_HOUSES);

    console.log(`Found ${result.rows.length} rows with invalid house_sml values:`);
    console.log(result.rows);
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

checkInvalidHouses();
