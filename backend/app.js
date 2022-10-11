const express = require('express')
const app = express()
app.use(express.json())
const port = 3000
const mysql = require('mysql');
const util = require('util');
const connection = mysql.createConnection({
  host : 'localhost',
  user : 'root',
  password : 'asdf1234',
  port: "3306",
  database: "seguridad-web",
  multipleStatements: true
});
const query = util.promisify(connection.query).bind(connection);

let cookie_parser=require('cookie-parser')

app.use(cookie_parser())

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

app.get('/lists', (req, res) => {
  let response = {}
  connection.query({
    sql: 'SELECT * FROM lists L;'
  }, function(err, rows, fields) {
    if (err) throw err;
    response = rows
    res.json({response: response})
  });
})

app.get('/users', (req, res) => {
  let response = {}
  connection.query({
    sql: 'SELECT * FROM users;'
  }, function(err, rows, fields) {
    if (err) throw err;
    response = rows
    res.json({response: response})
  });
})

app.get('/users/:username/lists', (req, res) => {
  let response = {}
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

app.post('/users/:username/lists', async (req, res) => {
  let user = req.cookies?.username
  // validacion
  if (!user) {
    res.status(400).json({ response: "No estas logueado" });
    return;
  }
  if (user !== req.params.username) {
    let rows = await  query({
      sql: 'SELECT rol from `users` where `username` = ?',
      values: [user]
    });
    let response = rows[0]
    if (!response) {
      res.status(404).json({ response: "No existe el usuario" });

      return;
    }
    if (response.rol !== "rol2") {
      res.status(401).json({ response: "No tenes acceso" });
      return;
    }
  }

  let rows = await  query({
    sql: 'SELECT id from `users` where `username` = ?',
    values: [req.params.username]
  });
  let response = rows[0]
  if (!response) {
    res.status(404).json({ response: "No existe el usuario" });
    return;
  }

  await query("INSERT INTO lists (text, user_id) VALUES ('"+ req.body.text + "', "+response.id+");");
  res.json({})

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
  console.log(req.body, req.cookies);
  let isLoggedIn = req.cookies?.username
  let response = {}
  if (isLoggedIn) {
    res.status(406).json({ response: "Ya hay un usuario logueado" });
  } else {
    connection.query({
      sql: 'SELECT * from `users` where `username` = ? and `password` = ?',
      values: [req.body.username, req.body.password]
    }, function(err, rows, fields) {
      if (err) throw err;
      response = rows[0]
      if (!response) {
        res.status(404).json({ response: "No existe usuario/contraseña" });
      } else {
        res.cookie('username', req.body.username /*, {signed: true}*/)
        res.json({response})
      }
    });
  }
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

