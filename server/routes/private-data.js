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

// router.get("/", function(req, res){
//   pg.connect(connectionString, function(err, client, done){
//     var userEmail = req.decodedToken.email;
//     // Check the user's level of permision based on their email
//     client.query('SELECT clearance_level FROM users WHERE email=$1', [userEmail], function(err, clearanceLevelQueryResult){
//       done();
//       if(err){
//         console.log('Error COMPLETING clearance_level query task', err);
//         res.sendStatus(500);
//       }else{
//         pg.connect(connectionString, function(err, client, done){
//           if(clearanceLevelQueryResult.rows.length === 0) {
//             // If the user is not in the database, return a forbidden error status
//             console.log('No user found with that email. Have you added this person to the database? Email: ', req.decodedToken.email);
//             res.sendStatus(403);
//           } else {
//             var clearanceLevel = clearanceLevelQueryResult.rows[0].clearance_level;
//             // Based on the clearance level of the individual, give them access to different information
//             client.query('SELECT * FROM secret_information WHERE secrecy_level<=$1', [clearanceLevel], function(err, results){
//               if(err){
//                 console.log('Error COMPLETING secret_information query task', error);
//                 res.sendStatus(500);
//               }else{
//                 // return all of the results where a specific user has permission
//                 res.send(results.rows);
//               }
//             });
//           }
//           done();
//         });
//       }
//     });
//   });
// });

// router.get('/', function(req, res){
//   console.log(req.decodedToken); // Here you can see the information firebase gives you about the user
//   res.send("Our Dates!!! You got it!!! Great work " + req.decodedToken.name + "!!!");
// });

router.get('/events', function (req, res) {
  console.log('hit first');
  pool.connect()
  .then(function (client) {
    client.query('SELECT users.first_name, users.last_name, roles.id, roles.role_title, roles.num_users, events.date, COUNT(roles.id) AS signed_up FROM users JOIN role_user ON users.id=role_user.user_id JOIN roles ON roles.id=role_user.role_id JOIN events ON roles.event_id=events.id GROUP BY roles.id, events.id, users.first_name, users.last_name;')
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
  pool.connect(function(err, client, done){
    if(err){
      console.log(err);
      res.sendStatus(500);
    }else{
      client.query('INSERT INTO role_user (role_id, user_id) VALUES ($1, $2);',
      [signUpEntry.role_id, signUpEntry.user_id], function(err, result){
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





//Add user route - firebase
router.post('/', function(req, res) {
	  console.log('hit post route');
	  console.log('here is the body ->', req.body);
	  var newUser = req.body;
	  pool.connect(function(err, client, done) {
	    if(err){
	      console.log(err);
	      res.sendStatus(500);
	    }else{
	      client.query('INSERT INTO users (email, first_name, last_name) VALUES ($1, $2, $3);',
	        [newUser.email, newUser.firstName, newUser.lastName], function(err, result) {
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
	}); //end post route

module.exports = router;
