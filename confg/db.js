const mysql = require("mysql");
// crete connection to database
const db = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "123456",
  database: "school",
});

export default db;
