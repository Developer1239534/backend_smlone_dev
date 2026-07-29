const db = require('./src/db/neonClient');

async function getTraineeOrError(id) {
  const result = await db.query(
    `SELECT dt.*, 
            COALESCE(gp.total_gold_periode, '0') AS total_gold_periode
     FROM dashboard_trainne dt
     LEFT JOIN (
       SELECT DISTINCT ON (trainee_id) *
       FROM gp_month
       ORDER BY trainee_id, created_at DESC
     ) gp ON dt.id = gp.trainee_id
     WHERE dt.id = $1`,
    [id]
  );
  return result.rows[0];
}

async function testRoute() {
  const trainee = await getTraineeOrError('625');
  if (!trainee) {
    console.log('Trainee not found in dashboard_trainne');
    process.exit(1);
  }

  const ptRes = await db.query('SELECT speaking_project_to_next_level FROM portal_trainee WHERE trainee_id = $1', [trainee.id]);
  const progressPercent = ptRes.rows[0]?.speaking_project_to_next_level || null;

  console.log('Mock API Route Response:', {
    id_trainee: trainee.id,
    nama_trainee: trainee.trainee_name,
    progress_ke_next_level: progressPercent,
    progress_video: trainee.progress_video
  });

  process.exit(0);
}

testRoute();
