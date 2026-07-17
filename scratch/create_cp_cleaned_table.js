const db = require('../src/db/neonClient');

async function main() {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS level_1_cp_cleaned_trainee (
        id SERIAL PRIMARY KEY,
        name TEXT,
        trainee_id TEXT,
        first_name TEXT,
        last_name TEXT,
        gender TEXT,
        dob TEXT,
        school TEXT,
        grade TEXT,
        phone TEXT,
        profession TEXT,
        email_account TEXT,
        location TEXT,
        profile_picture TEXT,
        emergency_contact_name TEXT,
        emergency_contact_phone TEXT,
        allow_sharing TEXT,
        program_registered TEXT,
        parents_email TEXT,
        date_created TEXT,
        shirt_size TEXT,
        date_record_created TEXT,
        start_date TEXT,
        membership_duration_days TEXT,
        membership_expiry_date TEXT,
        days_left TEXT,
        status_active_expired TEXT,
        class_status TEXT,
        cleaned_program TEXT,
        membership_from_ae2 TEXT,
        clean_membership_status TEXT,
        check_ac_ad TEXT,
        cabang TEXT,
        clean_parents_email TEXT,
        class_name TEXT,
        house TEXT,
        level TEXT,
        house_role TEXT,
        nomor_trainee TEXT,
        email_trainee TEXT,
        check_double_id TEXT,
        new_profile_picture TEXT,
        history_grade TEXT,
        less_than_2022_students_grade_helper TEXT,
        raw_data JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE (email_account, first_name)
      );
    `);
    console.log("Table level_1_cp_cleaned_trainee created successfully.");
  } catch (err) {
    console.error("Error creating table:", err.message);
  } finally {
    process.exit();
  }
}

main();
