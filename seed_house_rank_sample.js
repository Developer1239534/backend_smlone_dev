const db = require('./src/db/neonClient');

async function seedSampleData() {
  try {
    await db.query(`
      INSERT INTO house_rank ("Nama House", "Total Gold", "Class", "Cabang", "Program", "Rank")
      VALUES 
        ('Gryffindor', 1500, 'Class A', 'Jakarta', 'Program Special', 1),
        ('Slytherin', 1400, 'Class A', 'Surabaya', 'Program Special', 2),
        ('Ravenclaw', 1300, 'Class B', 'Bandung', 'Program Alpha', 3)
    `);
    console.log('✅ Sample data inserted into house_rank!');
  } catch (err) {
    console.error('Error seeding data:', err);
  } finally {
    process.exit(0);
  }
}

seedSampleData();
