const db = require('../src/db/neonClient');

async function main() {
  try {
    await db.query('ALTER TABLE level_1_cp_registrations ADD CONSTRAINT level_1_cp_registrations_email_address_full_name_key UNIQUE (email_address, full_name);');
    console.log("Unique constraint added successfully.");
  } catch (err) {
    console.error("Error adding unique constraint:", err.message);
  } finally {
    process.exit();
  }
}

main();
