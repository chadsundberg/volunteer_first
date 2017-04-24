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
      client.query('SELECT roles.id as role_id, roles.role_title, events.date, events.id as event_id, COUNT(roles.id ) AS signed_up FROM users RIGHT OUTER JOIN role_user ON users.id=role_user.user_id FULL OUTER JOIN roles ON roles.id=role_user.role_id FULL OUTER JOIN events ON roles.event_id=events.id GROUP BY roles.id, events.id;')
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
      client.query('SELECT users.first_name, users.last_name, users.id AS userid, roles.id, roles.start_time, roles.end_time, roles.role_title, events.date, events.id AS eventsid, COUNT(roles.id) AS signed_up FROM users FULL OUTER JOIN role_user ON users.id=role_user.user_id FULL OUTER JOIN roles ON roles.id=role_user.role_id FULL OUTER JOIN events ON roles.event_id=events.id WHERE events.id=$1 GROUP BY roles.id, events.id, roles.start_time, roles.end_time, users.first_name, users.last_name, users.id;',
        [eventId,])
        .then(function (result) {
          client.release();
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
      client.query('SELECT first_name, last_name, id FROM users')
        .then(function (result) {
          client.release();

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
  console.log("req.body:", req.body);
  if (!req.decodedToken.currentUser.is_admin || !signUpEntry.user_id) {
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


//Add entry to role_user table, update users.has_met_requirement -CHRISTINE
router.delete('/volunteerRemove', function (req, res) {
  console.log('hit volunteerSignUp post route');
  var removeEntry = req.query;
  console.log("req.body:", req.body);
  if (!req.decodedToken.currentUser.is_admin || !removeEntry.user_id) {
    removeEntry.user_id = req.decodedToken.userSQLId;
  }
  pool.connect(function (err, client, done) {
    if (err) {
      console.log(err);
      res.sendStatus(500);
    } else {
      client.query('DELETE FROM role_user WHERE user_id=$1 AND role_id=$2;',
        [removeEntry.user_id, removeEntry.role_id], function (err, result) {
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

///ADMIN ADD ROLE TO EVENT
router.post('/addRole/:id', function (req, res) {
  var newRole = req.body;
  console.log("req.params", req.params);
  console.log('new Role: ', newRole);
  console.log('date:', newRole.date);
  pool.connect()
    .then(function (client) {
      client.query('SELECT * FROM events WHERE id=$1',
        [req.params.id])
        .then(function (result) {
          pool.connect()
            .then(function (client) {
              client.query('INSERT INTO roles (role_title , start_time, end_time, event_id, duration) VALUES ($1, $2, $3, $4, $5);',
                [newRole.role_title, newRole.start_time, newRole.end_time, req.params.id, newRole.duration])
                .then(function (result) {
                  client.release();
                  res.sendStatus(201);
                }).catch(function (err) {
                  console.log('error on INSERT', err);
                  client.release();
                  res.sendStatus(500);
                });
            });
        }).catch(function (err) {
          pool.connect()
            .then(function (client) {
              client.query('INSERT INTO events (date) VALUES ($1) RETURNING id;',
                [newRole.date])
                .then(function (result) {
                  console.log('CAN WE SEE THIS RESULT:', result);
                  var newEventID = result.rows[0].id;
                  console.log('newEventID:', newEventID);
                  pool.connect()
                    .then(function (client) {
                      client.query('INSERT INTO roles (role_title , start_time, end_time, event_id, duration) VALUES ($1, $2, $3, $4, $5);',
                        [newRole.role_title, newRole.start_time, newRole.end_time, newEventID, newRole.duration])
                        .then(function (result) {
                          console.log('new event result:', result);
                          client.release();
                          res.sendStatus(201);

                        })
                        .catch(function (err) {
                          console.log('error on INSERT', err);
                          client.release();
                          res.sendStatus(500);
                        });
                    });
                })
                .catch(function (err) {
                  console.log('err inserting new event:', err);
                  client.release();
                  res.sendStatus(500);
                });
            });
        });
    });
});


// //ADMIN ADD ROLE TO EVENT
// router.post('/addRole/:id', function (req, res) {
//   var newRole = req.body;
//   console.log("req.params", req.params);
//   console.log('new Role: ', newRole);
//   pool.connect()
//     .then(function (client) {
//       client.query('INSERT INTO roles (role_title , start_time, end_time, event_id, duration) VALUES ($1, $2, $3, $4, $5);',
//         [newRole.role_title, newRole.start_time, newRole.end_time, req.params.id, newRole.duration])
//         .then(function (result) {
//           client.release();
//           res.sendStatus(201);
//         })
//         .catch(function (err) {
//           console.log('error on INSERT', err);
//           client.release();
//           res.sendStatus(500);
//         });
//     });
// });

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

router.delete('/eventRoles/:id', function (req, res) {
  var roleId = req.params.id;
  console.log('Deleting role: ', roleId);
  pool.connect()
    .then(function (client) {
      client.query('DELETE FROM roles WHERE id=$1',
        [roleId])
        .then(function (result) {
          client.release();
          res.sendStatus(200);
        })
        .catch(function (err) {
          console.log('error on DELETE', err);
          res.sendStatus(500);
        });
    });
});

router.put('/editRole/:id', function (req, res) {
  var roleId = req.params.id;
  var role = req.body;
  console.log('Updating role: ', roleId, role);
  pool.connect()
    .then(function (client) {
      client.query('UPDATE roles SET role_title = $1, start_time = $2, end_time = $3 WHERE id = $4',
        [role.role_title, role.start_time, role.end_time, roleId])
        .then(function (result) {
          client.release();
          pool.connect()
            .then(function (client) {
              client.query('UPDATE role_user SET user_id = $1 WHERE role_id = $2',
                [role.userObject.id, roleId])
                .then(function (result) {
                  client.release();
                  res.sendStatus(200);
                })
                .catch(function (err) {
                  console.log('error on UPDATE', err);
                  res.sendStatus(500);
                });
            });
        })
        .catch(function (err) {
          console.log('error on UPDATE', err);
          res.sendStatus(500);
        });
    });

});

router.get('/users/duration', function (req, res) {
  pool.connect()
    .then(function (client) {
      client.query(`SELECT users.id, users.has_met_requirement, SUM(roles.duration) AS signed_up_duration
    FROM role_user
    LEFT OUTER JOIN users ON users.id=role_user.user_id
    RIGHT OUTER JOIN roles ON roles.id=role_user.role_id
    WHERE role_user.user_id = $1
    GROUP BY users.id;`,
        [req.decodedToken.userSQLId])
        .then(function (result) {
          client.release();

          console.log('getting userduration: ', result.rows);

          res.send(result.rows);
        })
        .catch(function (err) {
          console.log('error on SELECT', err);
          client.release();

          res.sendStatus(500);
        });
    });
});


router.get('/users/roles', function (req, res) {
  pool.connect()
    .then(function (client) {
      client.query(`SELECT users.id, roles.role_title, roles.start_time, roles.end_time, event_id, events.date
    FROM role_user
    LEFT OUTER JOIN users ON users.id=role_user.user_id
    RIGHT OUTER JOIN roles ON roles.id=role_user.role_id
    RIGHT OUTER JOIN events ON events.id=roles.event_id
    WHERE role_user.user_id = $1;`,
        [req.decodedToken.userSQLId])
        .then(function (result) {
          client.release();

          console.log('getting userroles: ', result.rows);

          for (i = 0; i < result.rows.length; i++) {

            var newStartTime = result.rows[i].start_time.split(':', 3);
            var newEndTime = result.rows[i].end_time.split(':', 3);

            var newStartHours = newStartTime[0];
            var newStartMinutes = newStartTime[1];
            var newStartSeconds = newStartTime[2];
            var newEndHours = newEndTime[0];
            var newEndMinutes = newEndTime[1];
            var newEndSeconds = newEndTime[2];

            result.rows[i].start_time = new Date(1970, 0, 0, newStartHours, newStartMinutes, newStartSeconds, 0);
            result.rows[i].end_time = new Date(1970, 0, 0, newEndHours, newEndMinutes, newEndSeconds, 0);
          };
          res.send(result.rows);
        })
        .catch(function (err) {
          console.log('error on SELECT', err);
          client.release();
          res.sendStatus(500);
        });
    });
});



module.exports = router;
