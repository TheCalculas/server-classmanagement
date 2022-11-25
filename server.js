const express = require("express");
// create express server
const app = express();

const cors = require("cors");
const bodyParser = require("body-parser");
const fetchUser = require("./middleware/fetchUser");
const { default: db } = require("./confg/db");

db();

// use cors
app.use(cors());
// use body-parser
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

// create localhost server
app.listen(3001, () => {
  console.log("running on port 3001");
});

// create post request
app.post("/api/insert", fetchUser, (req, res) => {
  console.log(req.body);
  const name = req.body.name;
  const age = req.body.age;
  const sclass = req.body.sclass;

  const sqlInsert = "INSERT INTO student (name, age, class) VALUES (?,?,?,?)";
  db.query(sqlInsert, [name, age, sclass], (err, result) => {
    if (err) {
      console.log(err);
    }
    console.log(result);
  });
});

// create get request
app.get("/api/get", fetchUser, (req, res) => {
  const sqlSelect = "SELECT * FROM student";
  db.query(sqlSelect, (err, result) => {
    res.send(result);
  });
});

// create delete request
app.delete("/api/delete/:id", (req, res) => {
  const id = req.params.id;
  const sqlDelete = "DELETE FROM student WHERE id = ?";
  db.query(sqlDelete, id, (err, result) => {
    if (err) console.log(err);
    else console.log(result);
  });
});

// create update request
app.put("/api/update", (req, res) => {
  const id = req.body.id;
  const name = req.body.name;
  const age = req.body.age;
  const sclass = req.body.sclass;

  const sqlUpdate =
    "UPDATE student SET name = ?, age = ?, sclass = ? WHERE id = ?";
  db.query(sqlUpdate, [name, age, sclass, id], (err, result) => {
    if (err) console.log(err);
  });
});
