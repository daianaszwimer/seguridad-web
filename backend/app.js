const express = require('express')
const app = express()
app.use(express.json())
const port = 3000
const mysql = require('mysql');
const connection = mysql.createConnection({
  host : 'localhost',
  user : 'root',
  password : 'asdf1234',
  port: "3306",
  database: "seguridad-web"
});

app.use(function (req, res, next) {

  // Website you wish to allow to connect
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3001');

  // Request methods you wish to allow
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

  // Request headers you wish to allow
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

  // Set to true if you need the website to include cookies in the requests sent
  // to the API (e.g. in case you use sessions)
  res.setHeader('Access-Control-Allow-Credentials', true);

  // Pass to next layer of middleware
  next();
});

app.get('/users/:username', (req, res) => {
  let response = {}
  connection.query({
    sql: 'SELECT * from `users` where `username` = ?',
    values: [req.params.username]
  }, function(err, rows, fields) {
    if (err) throw err;
    response = rows[0]
    if (!response) {
      res.status(404).json({ response: "No existe el usuario" });
      return;
    }
    res.json({response})
  });
})

app.get('/users/:username/lists', (req, res) => {
  let response = {}
  if (req.params.username === "admin") {
    connection.query({
      sql: 'SELECT L.id, L.text FROM lists L;'
    }, function(err, rows, fields) {
      if (err) throw err;
      response = rows
      res.json({response: response})
    });
    return;
  }
  connection.query({
    sql: 'SELECT L.id, L.text FROM lists L JOIN users U ON L.user_id = U.id where U.username = ?',
    values: [req.params.username]
  }, function(err, rows, fields) {
    if (err) throw err;
    response = rows
    if (!response) {
      res.status(404).json({ response: "No existe el usuario" });
      return;
    }
    res.json({response: response})
  });
})

app.post('/users/:username/lists', (req, res) => {
  let response = {}
  //INSERT INTO lists (text, user_id) VALUES ("tex222to", 2);
  connection.query({
    sql: 'SELECT id from `users` where `username` = ?',
    values: [req.params.username]
  }, function(err, rows, fields) {
    if (err) throw err;
    response = rows[0]
    if (!response) {
      res.status(404).json({ response: "No existe el usuario" });
      return;
    }
    connection.query({
      sql: 'INSERT INTO lists (text, user_id) VALUES (?, ?);',
      values: [req.body.text, response.id]
    });
    res.json({})
  });
})

app.delete('/users/:username/lists/:id', (req, res) => {
  let response = {}
  let notFound = "";
  connection.query({
    sql: 'SELECT id from `users` where `username` = ?',
    values: [req.params.username]
  }, function(err, rows, fields) {
    if (err) throw err;
    response = rows[0]
    if (!response) {
      notFound = "No existe el usuario";
    } else {
      connection.query({
        sql: 'DELETE FROM `lists` WHERE user_id = ? and id = ?',
        values: [response.id, req.params.id]
      }, function (error, results, fields) {
        if (error) throw error;
        if (results.affectedRows === 0) {
          notFound = "No existe ese elemento";
        }
      });
    }
    if (notFound) {
      res.status(404).json({ response: notFound });
      return;
    }
    res.json({})
  });
})

app.post('/login', (req, res) => {
  console.log(req.body);
  let response = {}
  connection.query({
    sql: 'SELECT * from `users` where `username` = ? and `password` = ?',
    values: [req.body.username, req.body.password]
  }, function(err, rows, fields) {
    if (err) throw err;
    response = rows[0]
    if (!response) {
      res.status(404).json({ response: "No existe usuario/contraseña" });
    } else {
      res.json({response})
    }
  });
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

