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
router.get('/eventId', function (req, res) {
  console.log('hit first');
  pool.connect()
  .then(function (client) {
    client.query('SELECT roles.id, roles.role_title, roles.num_users, events.date, users.first_name, users.last_name, COUNT(roles.id) AS signed_up FROM users JOIN role_user ON users.id=role_user.user_id JOIN roles ON roles.id=role_user.role_id JOIN events ON roles.event_id=events.id GROUP BY roles.id, events.id, users.first_name, users.last_name;')
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



// THIS NEEDS TO BE MOVED TO decodedToken

// //Add user route - firebase
// router.post('/', function(req, res) {
// 	  console.log('hit post route');
// 	  console.log('here is the body ->', req.body);
// 	  var newUser = req.body;
// 	  pool.connect(function(err, client, done) {
// 	    if(err){
// 	      console.log(err);
// 	      res.sendStatus(500);
// 	    }else{
// 	      client.query('INSERT INTO users (email, first_name, last_name) VALUES ($1, $2, $3);',
// 	        [newUser.email, newUser.firstName, newUser.lastName], function(err, result) {
// 	          done();
// 	          if(err){
// 	            console.log(err);
// 	            res.sendStatus(500); // the world exploded
// 	          }else{
// 	            res.sendStatus(201);
// 	          }
// 	      });
// 	    }
// 	  });
// 	}); //end post route




module.exports = router;
