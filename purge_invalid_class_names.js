const db = require('./src/db/neonClient');

const validClasses = new Set([
  'Alexandrite', 'Almeria', 'Amber', 'Amethyst', 'Aristotle', 'Asheville',
  'Athens', 'Atlanta', 'Auckland', 'Avalon', 'Azurite', 'Beryl', 'Cairo',
  'Camelot', 'Canfield', 'Clinton (Fri 3-5)', 'DaVinci', 'Dale (Sat 4-6)',
  'Denver', 'Diamond', 'Doyle (Sat 1-3)', 'Duloc', 'Einstein', 'Eldorado',
  'Emerald', 'Galileo (Wed 4-6)', 'Gandhi', 'Gates (Sat 10-12)', 'Gladwell',
  'Graham', 'Grande (Thu 4-6 PM)', 'Hogwarts', 'Jade', 'Kiyosaki (Sat 4-6)',
  'Lincoln', 'Mandela', 'Marley', 'Maxwell', 'Millman (Sat 1-3)', 'Narnia',
  'Neverland', 'Newton (Tue 4-6)', 'Obsidian', 'Pearl', 'Plato', 'Quartz',
  'Robbins (Sat 1-3)', 'Ruby', 'Sapphire', 'Sherwood Forest', 'Sigmund',
  'Socrates', 'Spielberg (Sat 4-6)', 'Topaz', 'Tracy (Sat 4-6)', 'Whomville',
  'Winfrey (Thursday 4-6)', 'Wonderland', 'Ziglar (Sat 4-6)'
]);

async function run() {
  const res = await db.query('SELECT trainee_id, name, class FROM portal_trainee WHERE class IS NOT NULL');
  console.log(`Checking ${res.rows.length} rows in portal_trainee...`);

  let fixCount = 0;
  for (const row of res.rows) {
    const currentClass = (row.class || '').trim();
    if (!validClasses.has(currentClass)) {
      console.log(`Fixing invalid class "${currentClass}" for trainee ID ${row.trainee_id} (${row.name}) -> "Gladwell"`);
      await db.query('UPDATE portal_trainee SET class = $1 WHERE trainee_id = $2', ['Gladwell', row.trainee_id]);
      fixCount++;
    }
  }

  console.log(`✅ Fixed ${fixCount} rows with invalid class names!`);

  // Verify distinct class list now
  const afterRes = await db.query('SELECT DISTINCT class FROM portal_trainee ORDER BY class');
  console.log('Cleaned distinct class list:', afterRes.rows.map(x => x.class));
  process.exit(0);
}

run().catch(err => {
  console.error('Error purging invalid class names:', err);
  process.exit(1);
});
