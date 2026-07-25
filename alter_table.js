const db = require('./src/db/neonClient');

async function alterTable() {
  const query = `
    ALTER TABLE registrasi_new_seluruh_cabang
    ADD COLUMN email VARCHAR(255),
    ADD COLUMN full_name VARCHAR(255),
    ADD COLUMN dob VARCHAR(100),
    ADD COLUMN gender VARCHAR(50),
    ADD COLUMN phone VARCHAR(100),
    ADD COLUMN program VARCHAR(100),
    ADD COLUMN address TEXT,
    ADD COLUMN previous_program VARCHAR(100),
    ADD COLUMN selected_program VARCHAR(100),
    ADD COLUMN school VARCHAR(255),
    ADD COLUMN grade VARCHAR(100),
    ADD COLUMN parent_email VARCHAR(255),
    ADD COLUMN emergency_contact_name VARCHAR(255),
    ADD COLUMN emergency_contact_phone VARCHAR(100),
    ADD COLUMN source VARCHAR(255),
    ADD COLUMN agreement VARCHAR(100);
  `;
  try {
    await db.query(query);
    console.log("ALTER TABLE success!");
  } catch (error) {
    console.error("ALTER TABLE failed:", error);
  } finally {
    process.exit();
  }
}

alterTable();
