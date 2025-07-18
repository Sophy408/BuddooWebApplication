const mysql = require('mysql2');

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',       // dein Passwort
  database: 'buddoo'  // vorher erstellen
});

db.connect(err => {
  if (err) throw err;
  console.log('MySQL verbunden');
});

module.exports = db;
