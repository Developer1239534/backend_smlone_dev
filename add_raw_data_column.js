const db = require('./src/db/neonClient');

async function addAndPopulateRawData() {
  try {
    console.log('Adding raw_data JSONB column to portal_admin table...');
    await db.query(`ALTER TABLE portal_admin ADD COLUMN IF NOT EXISTS raw_data JSONB;`);
    console.log('Column raw_data JSONB added successfully.');

    console.log('Populating raw_data for all existing rows...');
    await db.query(`
      UPDATE portal_admin
      SET raw_data = jsonb_build_object(
        'class_name', class_name,
        'day', day,
        'time', time,
        'room', room,
        'branch', branch,
        'trainee_id', trainee_id,
        'name', name,
        'level', level,
        'newest_grade', newest_grade,
        'house', house,
        'house_role', house_role,
        'trainee_homeroom', trainee_homeroom,
        'homeroom_kelas', homeroom_kelas,
        'trainer', trainer,
        'membership_status', membership_status,
        'membership_expired_date', membership_expired_date,
        'first_enroll', first_enroll
      );
    `);

    console.log('Successfully populated raw_data JSONB for all rows!');

    const sample = await db.query(`SELECT trainee_id, name, raw_data FROM portal_admin LIMIT 2;`);
    console.log('Sample row with raw_data:', JSON.stringify(sample.rows[0], null, 2));

  } catch (err) {
    console.error('Error adding/populating raw_data:', err);
  } finally {
    process.exit(0);
  }
}

addAndPopulateRawData();
