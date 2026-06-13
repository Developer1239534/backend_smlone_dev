const db = require('../src/db/neonClient');

const ALLOWED_HOUSES = [
  'House of Havaria',
  'House of Quorion',
  'House of Thenova',
  'House of Creanova',
  'House of Reverion'
];

async function cleanHouses() {
  try {
    console.log('🔄 Cleaning invalid house_sml values (setting them to NULL)...');
    
    // We update any house_sml that is NOT in the allowed list or is an empty string
    const result = await db.query(`
      UPDATE dashboard_trainne 
      SET house_sml = NULL 
      WHERE house_sml NOT IN ($1, $2, $3, $4, $5) 
         OR house_sml = '';
    `, ALLOWED_HOUSES);

    console.log(`✅ Successfully set ${result.rowCount} invalid house_sml values to NULL.`);
    
    // Verify the new unique values
    const verifyResult = await db.query('SELECT DISTINCT house_sml FROM dashboard_trainne ORDER BY house_sml;');
    console.log('Unique house_sml values now in DB:', verifyResult.rows.map(r => r.house_sml));

    process.exit(0);
  } catch (error) {
    console.error('❌ Error cleaning houses:', error);
    process.exit(1);
  }
}

cleanHouses();
