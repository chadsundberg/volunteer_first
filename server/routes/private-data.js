var express = require('express');
var router = express.Router();
var pg = require('pg');
var connectionString = require('../modules/database-config');

var config = {
  database: 'phi',
  host: 'localhost',
  port: 5432,
  max: 10,
  idleTimeMillis: 5000
};
var pool = new pg.Pool(config);

//get all events for calendar display
router.get('/events', function (req, res) {
  console.log('hit first');
  pool.connect()
  .then(function (client) {
    client.query('SELECT roles.id, roles.role_title, roles.num_users, events.date, COUNT(roles.id) AS signed_up FROM users JOIN role_user ON users.id=role_user.user_id JOIN roles ON roles.id=role_user.role_id JOIN events ON roles.event_id=events.id GROUP BY roles.id, events.id;')
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


// get request for all roles for specific event for modal
router.get('/eventRoles/:id', function (req, res) {
  var eventId = req.params.id;
  console.log('hit first', eventId);
  pool.connect()
  .then(function (client) {
    client.query('SELECT * FROM roles WHERE event_id = $1 ORDER BY role_title ASC;',
    [eventId])
    .then(function (result) {
      client.release();
      console.log(result.rows);
      res.send(result.rows);
    })
    .catch(function (err) {
      console.log('error on SELECT', err);
      res.sendStatus(500);
    });
  });
});



router.get('/', function (req, res) {
  console.log('hit');
  pool.connect()
  .then(function (client) {
    client.query('SELECT first_name, last_name FROM users')
    .then(function (result) {
      console.log('result:', result);
      client.release();
      res.send(result.rows);
    })
    .catch(function (err) {
      console.log('error on SELECT', err);
      res.sendStatus(500);
    });
  });
});


//Add entry to role_user table, update users.has_met_requirement -CHRISTINE
router.post('/volunteerSignUp', function(req, res){
  console.log('hit volunteerSignUp post route');
  var signUpEntry = req.body;
  var currentUser = req.currentUser.id;
  pool.connect(function(err, client, done){
    if(err){
      console.log(err);
      res.sendStatus(500);
    }else{
      client.query('INSERT INTO role_user (role_id, user_id) VALUES ($1, $2);',
      [signUpEntry.role_id, currentUser], function(err, result){
        done();
        if(err){
          console.log(err);
          res.sendStatus(500); // the world exploded
        }else{
          res.sendStatus(201);
        }
      });
    }
  });
});//end post

//ADMIN ADD ROLE TO EVENT
router.post('/addRole/:id', function (req, res) {
  var newRole = req.body;
  console.log('new Role: ', newRole);
  pool.connect()
    .then(function (client) {
      client.query('INSERT INTO roles (role_title , start_time, end_time, event_id) VALUES ($1, $2, $3, $4)',
        [newRole.role_title, newRole.start_time, newRole.end_time, req.params.id])
        .then(function (result) {
          client.release();
          res.sendStatus(201);
        })
        .catch(function (err) {
          console.log('error on INSERT', err);
          res.sendStatus(500);
        });
    });
});






module.exports = router;
