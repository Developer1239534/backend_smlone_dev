require('dotenv').config();
const db = require('../src/db/neonClient');

async function createTable() {
  try {
    console.log('Dropping existing level_1_ca_registrations table...');
    await db.query(`DROP TABLE IF EXISTS level_1_ca_registrations;`);
    
    console.log('Creating new level_1_ca_registrations table with new columns...');
    await db.query(`
      CREATE TABLE level_1_ca_registrations (
        id SERIAL PRIMARY KEY,
        timestamp_str VARCHAR(100),
        email VARCHAR(255),
        full_name VARCHAR(255),
        dob VARCHAR(100),
        gender VARCHAR(50),
        address TEXT,
        phone VARCHAR(100),
        program VARCHAR(100),
        registration_date VARCHAR(100),
        agreement VARCHAR(100),
        selected_program VARCHAR(255),
        school VARCHAR(255),
        parent_email VARCHAR(255),
        emergency_contact_name VARCHAR(255),
        emergency_contact_phone VARCHAR(100),
        grade VARCHAR(100),
        source VARCHAR(255),
        referral_name VARCHAR(255),
        ig_mom VARCHAR(100),
        ig_dad VARCHAR(100),
        ig_child VARCHAR(100),
        training_goal TEXT,
        training_expectation TEXT,
        event_source VARCHAR(255),
        previous_program VARCHAR(255),
        previous_program_name VARCHAR(255),
        raw_data JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE (email, full_name)
      );
    `);
    console.log('Table created successfully!');
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    process.exit(0);
  }
}

createTable();
