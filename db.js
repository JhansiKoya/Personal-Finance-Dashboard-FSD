const mysql = require("mysql2");

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "1012101216pjk@",
  database: "finance_db",
});

db.connect(() => console.log("MySQL connected ✅"));

module.exports = db;
