const db = require('../src/db/neonClient');

async function main() {
  const mismatchedIds = ['1106', '1121', '27', '673', '1161'];
  try {
    console.log('Nullifying mismatched screening test links in database...');
    for (const id of mismatchedIds) {
      const res = await db.query(
        'UPDATE dashboard_trainne SET screening_test = NULL WHERE id = $1 RETURNING id, trainee_name, status',
        [id]
      );
      if (res.rows.length > 0) {
        console.log(`Updated ID: ${res.rows[0].id} (${res.rows[0].trainee_name}) -> set screening_test to NULL`);
      } else {
        console.log(`Trainee ID: ${id} not found in database.`);
      }
    }
    console.log('Nullification completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

main();
