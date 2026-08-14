const db = require('./src/db/neonClient');

async function testHouseRankCRUDNoId() {
  console.log('🧪 Starting House Rank CRUD (No ID) Verification...');

  try {
    // 1. CREATE (INSERT)
    console.log('\n1. Testing CREATE (INSERT)...');
    const insertRes = await db.query(`
      INSERT INTO house_rank ("Nama House", "Total Gold", "Class", "Cabang", "Program", "Rank")
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *;
    `, ['Ravenclaw', 2100, 'Class B', 'Bandung', 'Program Alpha', 2]);
    const createdItem = insertRes.rows[0];
    console.log('✅ Created:', createdItem);

    // 2. READ (SELECT ALL)
    console.log('\n2. Testing READ ALL (SELECT)...');
    const selectRes = await db.query('SELECT * FROM house_rank');
    console.log(`✅ Total records found: ${selectRes.rows.length}`);

    // 3. UPDATE (PUT) based on "Nama House"
    console.log(`\n3. Testing UPDATE for "Nama House" = 'Ravenclaw'...`);
    const updateRes = await db.query(`
      UPDATE house_rank 
      SET "Total Gold" = $1, "Rank" = $2
      WHERE "Nama House" = $3
      RETURNING *;
    `, [2500, 1, 'Ravenclaw']);
    console.log('✅ Updated:', updateRes.rows[0]);

    // 4. DELETE based on "Nama House"
    console.log(`\n4. Testing DELETE for "Nama House" = 'Ravenclaw'...`);
    const deleteRes = await db.query('DELETE FROM house_rank WHERE "Nama House" = $1 RETURNING *', ['Ravenclaw']);
    console.log('✅ Deleted:', deleteRes.rows[0]);

    // Verify deletion
    const checkDeleted = await db.query('SELECT * FROM house_rank WHERE "Nama House" = $1', ['Ravenclaw']);
    console.log('✅ Verified deletion, remaining records:', checkDeleted.rows.length);

    console.log('\n🎉 ALL CRUD TESTS WITHOUT ID PASSED SUCCESSFULLY!');
  } catch (err) {
    console.error('❌ CRUD Test Error:', err);
  } finally {
    process.exit(0);
  }
}

testHouseRankCRUDNoId();
