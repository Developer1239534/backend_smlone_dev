const db = require('../src/db/neonClient');

async function main() {
  try {
    const res = await db.query('SELECT id, raw_data FROM level_1_ca_cleaned_trainee');
    let updatedCount = 0;

    for (const row of res.rows) {
      let raw = row.raw_data;
      let changed = false;

      // Extract the best value for class if not already in 'Kelas (Peserta)'
      let bestClass = raw['Kelas (Peserta)'] || raw['Kelas (Peserta Training)'] || raw['Kelas'] || raw['kelas'] || raw['kelas_peserta'] || raw['CLASS'] || raw['class'];

      // Keys to remove
      const keysToRemove = ['Kelas', 'kelas', 'kelas_peserta', 'CLASS', 'class', 'Kelas (Peserta Training)'];

      for (const k of keysToRemove) {
        if (raw.hasOwnProperty(k)) {
          delete raw[k];
          changed = true;
        }
      }

      if (bestClass && raw['Kelas (Peserta)'] !== bestClass) {
        raw['Kelas (Peserta)'] = bestClass;
        changed = true;
      }

      if (changed) {
        await db.query('UPDATE level_1_ca_cleaned_trainee SET raw_data = $1 WHERE id = $2', [raw, row.id]);
        updatedCount++;
      }
    }

    console.log(`Successfully updated ${updatedCount} rows to use only "Kelas (Peserta)".`);
  } catch (err) {
    console.error(err);
  } finally {
    process.exit();
  }
}

main();
