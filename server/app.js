var express = require('express');
var app = express();
var path = require('path');
var bodyParser = require('body-parser');
var pg = require('pg');
var decoder = require('./modules/decoder');
var privateData = require('./routes/private-data');
var portDecision = process.env.PORT || 5000;

app.get('/', function(req, res){
  res.sendFile(path.resolve('./public/views/index.html'));
});

app.use(express.static('public'));
app.use(bodyParser.json());

// Decodes the token in the request header and attaches the decoded token to req.decodedToken on the request.
app.use(decoder.token);

/* Whatever you do below this is protected by your authentication. */

// This is the route for your secretData. The request gets here after it has been authenticated.

var config = {
  database: 'volunteer_first',
  host: 'localhost',
  port: 5432,
  max: 10,
  idleTimeMillis: 5000
};
var pool = new pg.Pool(config);



app.get('/stuff', function (req, res) {
  console.log('hit');
  pool.connect()
    .then(function (client) {
      client.query('SELECT first_name, last_name FROM users')
        .then(function (result) {
          client.release();
          res.send(result.rows);
        })
        .catch(function (err) {
          console.log('error on SELECT', err);
          res.sendStatus(500);
        });
    });
});

app.get('/event', function (req, res) {
  console.log('hit');
  pool.connect()
    .then(function (client) {
      client.query('SELECT users.first_name, roles.id, roles.role_title, roles.num_users, events.date, COUNT(roles.id) AS signed_up FROM users JOIN role_user ON users.id=role_user.user_id JOIN roles ON roles.id=role_user.role_id JOIN events ON roles.event_id=events.id GROUP BY roles.id, events.id, users.first_name;')
        .then(function (result) {
          client.release();
          res.send(result.rows);
        })
        .catch(function (err) {
          console.log('error on SELECT', err);
          res.sendStatus(500);
        });
    });
});
app.use("/privateData", privateData);

app.listen(portDecision, function(){
  console.log("Listening on port: ", portDecision);
});
