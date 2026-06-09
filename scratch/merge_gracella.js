const db = require('../src/db/neonClient');

async function mergeGracella() {
  try {
    console.log('--- 1. MERGING PLAYLIST ---');
    // Fetch playlist from old ID
    const oldRes = await db.query('SELECT progress_video FROM dashboard_trainne WHERE id = $1', ['90100078']);
    if (oldRes.rows.length === 0) {
      console.error('Old student 90100078 not found!');
      process.exit(1);
    }
    const playlist = oldRes.rows[0].progress_video;
    console.log('Old Playlist:', playlist);

    // Update new ID with this playlist
    const updateRes = await db.query(
      'UPDATE dashboard_trainne SET progress_video = $1 WHERE id = $2 RETURNING *',
      [playlist, '90100079']
    );
    console.log('Updated Student 90100079 Playlist:', updateRes.rows[0].progress_video);

    console.log('\n--- 2. DELETING OLD RECORD ---');
    const deleteRes = await db.query('DELETE FROM dashboard_trainne WHERE id = $1 RETURNING *', ['90100078']);
    console.log('Deleted ID:', deleteRes.rows[0].id);

    console.log('\n--- 3. VERIFYING DB STATE ---');
    const checkOld = await db.query('SELECT id FROM dashboard_trainne WHERE id = $1', ['90100078']);
    const checkNew = await db.query('SELECT id, trainee_name, progress_video, plain_password FROM dashboard_trainne WHERE id = $1', ['90100079']);
    
    console.log('Does ID 90100078 still exist?:', checkOld.rows.length > 0 ? 'YES' : 'NO');
    console.log('New ID 90100079 Data:', checkNew.rows[0]);

    console.log('🎉 Merge and deletion completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error during merge:', error);
    process.exit(1);
  }
}

mergeGracella();
