var express = require('express');
var router = express.Router();
var pg = require('pg');

// var connectionString = require('../modules/database-config');

var pool = require('../modules/pool-connection');

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
  pool.connect()
  .then(function (client) {
    client.query('SELECT roles.id as role_id, roles.role_title, roles.num_users, events.date, events.id as event_id, COUNT(roles.id ) AS signed_up FROM users RIGHT OUTER JOIN role_user ON users.id=role_user.user_id FULL OUTER JOIN roles ON roles.id=role_user.role_id FULL OUTER JOIN events ON roles.event_id=events.id GROUP BY roles.id, events.id;')
    .then(function (result) {
      client.release();
      res.send(result.rows);
    })
    .catch(function (err) {
      client.release();
      console.log('error on SELECT', err);
      res.sendStatus(500);
    });

});
});

// get all roles for specific event for modal
router.get('/eventRoles/:id', function (req, res) {
  var eventId = req.params.id;
  console.log("req.params", req.params);
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
          client.release();
          res.sendStatus(500);
        });
    });
});

router.get('/users', function (req, res) {
  pool.connect()
    .then(function (client) {
      client.query('SELECT first_name, last_name FROM users')
        .then(function (result) {
          client.release();

          console.log('getting user: ', result.rows);

          res.send(result.rows);
        })
        .catch(function (err) {
          console.log('error on SELECT', err);
          client.release();

          res.sendStatus(500);
        });


    });
});

router.get('/getUser', function (req, res) {
  pool.connect()
    .then(function (client) {
      client.query('SELECT * FROM users WHERE id = $1',
        [req.decodedToken.userSQLId],
        function (err, result) {
          res.send(result.rows[0]);
        });
        client.release();
    });
  // .then(function (result) {
  //   client.release();
  //   console.log('getting user: ', result.rows);

  //   res.send(result.rows);
  // })
  // .catch(function (err) {
  //   console.log('error on SELECT', err);
  //   res.sendStatus(500);
  // });
  // });

});


//Add entry to role_user table, update users.has_met_requirement -CHRISTINE
router.post('/volunteerSignUp', function (req, res) {
  console.log('hit volunteerSignUp post route');
  var signUpEntry = req.body;
  if (!req.decodedToken.currentUser.is_admin || !signUpEntry.user_id){
    signUpEntry.user_id = req.decodedToken.userSQLId;
  }
  pool.connect(function (err, client, done) {
    if (err) {
      console.log(err);
      res.sendStatus(500);
    } else {
      client.query('INSERT INTO role_user (role_id, user_id) VALUES ($1, $2);',
        [signUpEntry.role_id, signUpEntry.user_id], function (err, result) {

          if (err) {
            console.log(err);
            res.sendStatus(500); // the world exploded
          } else {
            res.sendStatus(201);
          }
        });
    }
    done();
  });
});//end post

//ADMIN ADD ROLE TO EVENT
router.post('/addRole/:id', function (req, res) {
  var newRole = req.body;
  console.log("req.params", req.params);
  console.log('new Role: ', newRole);
  pool.connect()
    .then(function (client) {
      client.query('INSERT INTO roles (role_title , start_time, end_time, event_id) VALUES ($1, $2, $3, $4);',
        [newRole.role_title, newRole.start_time, newRole.end_time, req.params.id])
        .then(function (result) {
          client.release();
          res.sendStatus(201);
        })
        .catch(function (err) {
          console.log('error on INSERT', err);
          client.release();
          res.sendStatus(500);
        });
    });
});

//Add user route - firebase
// this is pretty useless now - add ajax req from decoder? *jonny* //
router.post('/', function (req, res) {
  console.log('here is the body ->', req.body);
  var newUser = req.body;
  pool.connect(function (err, client, done) {
    if (err) {
      console.log(err);
      res.sendStatus(500);
    } else {
      // client.query('INSERT INTO users (email, first_name, last_name) VALUES ($1, $2, $3);',
      //   [newUser.email, newUser.firstName, newUser.lastName], function(err, result) {

      if (err) {
        console.log(err);
        res.sendStatus(500); // the world exploded
      }
      // }else{
      //   res.sendStatus(201);
      // }
      // }
    }
  });
}); //end post route


module.exports = router;
