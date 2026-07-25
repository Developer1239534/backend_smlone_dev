const db = require('./src/db/neonClient'); 
db.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'registrasi_new_seluruh_cabang'").then(res => console.log(res.rows)).catch(console.error).finally(() => process.exit());
