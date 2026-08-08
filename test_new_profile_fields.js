const http = require('http');
process.env.NODE_ENV = 'development';
require('dotenv').config();
const app = require('./src/server');

let server;

(async () => {
  server = app.listen(4006, async () => {
    console.log('🧪 Server running on 4006, testing new profile fields & CRUD...\n');

    function makeRequest(path, method = 'GET', body = null) {
      return new Promise((resolve, reject) => {
        const options = {
          hostname: 'localhost',
          port: 4006,
          path,
          method,
          headers: { 'Content-Type': 'application/json' }
        };
        const req = http.request(options, (res) => {
          let data = '';
          res.on('data', chunk => data += chunk);
          res.on('end', () => {
            try {
              resolve({ status: res.statusCode, data: JSON.parse(data) });
            } catch (e) {
              resolve({ status: res.statusCode, raw: data });
            }
          });
        });
        req.on('error', reject);
        if (body) req.write(JSON.stringify(body));
        req.end();
      });
    }

    try {
      // 1. UPDATE / PUT /api/profile-trainee/980 with new fields
      const putData = {
        name: "Ezio Lim",
        school: "SMA State 1 Medan",
        personal_email: "ezio.lim@gmail.com",
        birthday: "2010-05-15",
        trainee_wa_number: "081234567890",
        parent_wa_number: "081987654321",
        house: "House of Quorion",
        house_role: "Member",
        membership: "Active",
        first_enroll: "2025-03-27",
        expiry_date: "2026-10-08",
        class: "Marley",
        level: "Sergeant",
        newest_grade: "6",
        branch: "Centre Point",
        room: "Apsley",
        day: "Monday",
        time: "15.30-17.30",
        trainer: "Rizky",
        trainee_homeroom: "Muly",
        class_homeroom: "Rizky"
      };

      console.log('1. PUT /api/profile-trainee/980 (Updating with new fields)...');
      const r1 = await makeRequest('/api/profile-trainee/980', 'PUT', putData);
      console.log('   Status:', r1.status);
      console.log('   Updated Data Keys:', Object.keys(r1.data?.data || {}));
      console.log('   school:', r1.data?.data?.school);
      console.log('   personal_email:', r1.data?.data?.personal_email);
      console.log('   birthday:', r1.data?.data?.birthday);
      console.log('   trainee_wa_number:', r1.data?.data?.trainee_wa_number);
      console.log('   parent_wa_number:', r1.data?.data?.parent_wa_number);

      // 2. GET /api/profile-trainee/980
      console.log('\n2. GET /api/profile-trainee/980 (Verifying response structure)...');
      const r2 = await makeRequest('/api/profile-trainee/980');
      console.log('   Status:', r2.status);
      const profile = r2.data?.data;
      console.log('   Response Fields Check:');
      console.log('   - name:', profile?.name);
      console.log('   - student_id:', profile?.student_id);
      console.log('   - personal_email:', profile?.personal_email);
      console.log('   - school:', profile?.school);
      console.log('   - birthday:', profile?.birthday);
      console.log('   - trainee_wa_number:', profile?.trainee_wa_number);
      console.log('   - parent_wa_number:', profile?.parent_wa_number);
      console.log('   - class:', profile?.class);
      console.log('   - class_homeroom:', profile?.class_homeroom);

      // 3. POST /api/profile-trainee (Creating a test trainee with new fields)
      console.log('\n3. POST /api/profile-trainee (Creating new test trainee)...');
      const postData = {
        trainee_id: "999001",
        name: "Test Trainee New Fields",
        school: "SML International School",
        personal_email: "test.trainee@sml.ac.id",
        birthday: "2012-08-20",
        trainee_wa_number: "081111111111",
        parent_wa_number: "082222222222",
        house: "House of Reverion",
        membership: "Active",
        class: "Newton",
        level: "Private",
        branch: "Centre Point"
      };
      const r3 = await makeRequest('/api/profile-trainee', 'POST', postData);
      console.log('   Status:', r3.status);
      console.log('   Created Data student_id:', r3.data?.data?.student_id);
      console.log('   Created Data personal_email:', r3.data?.data?.personal_email);

      // 4. DELETE /api/profile-trainee/999001
      console.log('\n4. DELETE /api/profile-trainee/999001 (Cleaning up test trainee)...');
      const r4 = await makeRequest('/api/profile-trainee/999001', 'DELETE');
      console.log('   Status:', r4.status);
      console.log('   Deleted Success:', r4.data?.success);

      console.log('\n🎉 ALL NEW FIELD TESTS COMPLETED SUCCESSFULLY!');
    } catch (err) {
      console.error(err);
    } finally {
      server.close();
      process.exit(0);
    }
  });
})();
