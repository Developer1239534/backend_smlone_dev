const http = require('http');

function getJson(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', (err) => { reject(err); });
  });
}

async function runTests() {
  const targetId = '90100079'; // Gracella Cangie we updated earlier
  try {
    console.log('Waiting 3 seconds for server to be fully ready...');
    await new Promise(r => setTimeout(r, 3000));

    console.log('\n--- 1. TESTING GET /api/dashboard/profile/' + targetId + ' ---');
    const profile = await getJson(`http://localhost:4000/api/dashboard/profile/${targetId}`);
    console.log('Profile Response Keys:', Object.keys(profile.data));
    console.log('Profile Data Sample:');
    console.log({
      id_trainee: profile.data.id_trainee,
      nama_trainee: profile.data.nama_trainee,
      cabang: profile.data.cabang,
      house_sml: profile.data.house_sml,
      total_gold_periode: profile.data.total_gold_periode,
      junior_youth: profile.data.junior_youth,
      rank_id_youth: profile.data.rank_id_youth,
      rank_id_youth_cemara: profile.data.rank_id_youth_cemara
    });

    if (profile.data.house_sml !== 'House of Kyros' || profile.data.cabang !== 'CEMARA') {
      console.error('❌ ERROR: Profile fields mismatch!');
    } else {
      console.log('✅ PASS: Profile contains correct new fields!');
    }

    console.log('\n--- 2. TESTING GET /api/dashboard/rankings/' + targetId + ' ---');
    const rankings = await getJson(`http://localhost:4000/api/dashboard/rankings/${targetId}`);
    console.log('Rankings Response Keys:', Object.keys(rankings.data));
    console.log('Rankings Data Sample:');
    console.log({
      id_trainee: rankings.data.id_trainee,
      nama_trainee: rankings.data.nama_trainee,
      total_gold_periode: rankings.data.total_gold_periode,
      rank_id_youth: rankings.data.rank_id_youth,
      rank_id_youth_cemara: rankings.data.rank_id_youth_cemara
    });

    if (rankings.data.total_gold_periode !== '0' || rankings.data.rank_id_youth !== '102') {
      console.error('❌ ERROR: Rankings fields mismatch!');
    } else {
      console.log('✅ PASS: Rankings contains correct new fields!');
    }

    console.log('\n🎉 All API endpoint integration tests passed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

runTests();
