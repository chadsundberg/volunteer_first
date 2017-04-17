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


router.get('/events', function (req, res) {
  pool.connect()
    .then(function (client) {
      client.query('SELECT users.first_name, users.last_name, roles.id, roles.role_title, roles.num_users, events.date, COUNT(roles.id) AS signed_up FROM users JOIN role_user ON users.id=role_user.user_id JOIN roles ON roles.id=role_user.role_id JOIN events ON roles.event_id=events.id GROUP BY roles.id, events.id, users.first_name, users.last_name;')
        .then(function (result) {
          client.release();
          console.log('/events RESULT.ROWS:', result.rows);

          res.send(result.rows);
        })
        .catch(function (err) {
          console.log('error on SELECT', err);
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

// todo: delete this after req.currentUser is working *jonny*
router.get('/currentUser', function (req, res) {
  pool.connect()
    .then(function (client) {
      client.query('SELECT * FROM users WHERE email="' + req.params + '"')
        .then(function (result) {
          client.release();
          res.send(result);
        })
        .catch(function (err) {
          console.log('error on SELECT', err);
          res.sendStatus(500);
        });
    });
});


//Add entry to role_user table, update users.has_met_requirement -CHRISTINE
router.post('/volunteerSignUp', function (req, res) {
  console.log('hit volunteerSignUp post route');
  var signUpEntry = req.body;
  pool.connect(function (err, client, done) {
    if (err) {
      console.log(err);
      res.sendStatus(500);
    } else {
      client.query('INSERT INTO role_user (role_id, user_id) VALUES ($1, $2);',
        [signUpEntry.role_id, signUpEntry.user_id], function (err, result) {
          done();
          if (err) {
            console.log(err);
            res.sendStatus(500); // the world exploded
          } else {
            res.sendStatus(201);
          }
        });
    }
  });
});//end post





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
      done();
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

