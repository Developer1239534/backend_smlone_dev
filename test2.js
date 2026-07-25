const db = require('./src/db/neonClient'); 
db.query("INSERT INTO registrasi_new_seluruh_cabang (data_registrasi, cabang) VALUES ($1, $2)", [JSON.stringify({test:1}), 'Cemara'])
  .then(res => console.log('Insert success!'))
  .catch(console.error)
  .finally(() => process.exit());
