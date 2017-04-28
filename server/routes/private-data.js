var express = require('express');
var router = express.Router();
var pg = require('pg');
var csv = require('express-csv');
// var fields = ['events.date', 'role.title', 'role.start_time', 'role.end_time' 'users.first_name', 'users.last_name', 'users.email'];

// var connectionString = require('../modules/database-config');

var pool = require('../modules/pool-connection');

var config = {
  database: 'phi',
  host: 'localhost',
  port: 5432,
  max: 10000,
  idleTimeMillis: 5000
};
var pool = new pg.Pool(config);

// csv from Kris
router.get('/getcsv', function (req, res) {
  // this would be your returned find() object

  pool.connect()
    .then(function (client) {
      client.query(`SELECT users.first_name, users.last_name, users.email, users.id 
      AS userid, roles.id, roles.start_time, roles.end_time, roles.role_title, events.date, events.id 
      AS eventsid, COUNT(roles.id) AS signed_up 
      FROM users 
      JOIN roles ON roles.user_id=users.id
      FULL OUTER JOIN events ON roles.event_id=events.id WHERE users.first_name IS NOT NULL 
      GROUP BY roles.id, events.id, users.first_name, users.last_name, users.email, users.id ORDER BY date ASC;`)
        .then(function (result) {
          client.release();
          // console.log('result: ', result.rows);

          // create an array from the mongo object so we can use .unshift() later
          var data = result.rows;

          // create a header row from the object's keys/properties
          var headers = Object.keys(result.rows[0]);

          // push keys array to the beginning of data array
          data.unshift(headers);

          console.log('data: --------------------------------', data.length);

          res.attachment('testing.csv');   // not really used
          res.csv(data);
        })
        .catch(function (err) {
          client.release();
          console.log('error on stuff', err);
          res.sendStatus(500);
        });
    }); // end then/query

});

//get all events for calendar display
router.get('/events', function (req, res) {
  pool.connect()
    .then(function (client) {
      client.query(`SELECT roles.id as role_id, roles.role_title, events.date, events.id as event_id, COUNT(roles.id ) AS signed_up FROM users 
    RIGHT OUTER JOIN roles ON users.id=roles.user_id
    FULL OUTER JOIN events ON roles.event_id=events.id GROUP BY roles.id, events.id;`)
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
      client.query(`SELECT users.first_name, users.last_name, users.id 
    AS userid, roles.id, roles.start_time, roles.end_time, roles.role_title, events.date, events.id 
    AS eventsid, COUNT(roles.id) 
    AS signed_up FROM users 
    FULL OUTER JOIN roles ON users.id=roles.user_id  
    FULL OUTER JOIN events ON roles.event_id=events.id 
    WHERE events.id=$1 GROUP BY roles.id, events.id, roles.start_time, roles.end_time, users.first_name, users.last_name, users.id;`,
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


router.post('/volunteerSignUp', function (req, res) {
  console.log('hit volunteerSignUp post route');
  var signUpEntry = req.body;
  console.log("147signUpEntry:", signUpEntry);
  if (!req.decodedToken.currentUser.is_admin || !signUpEntry.user_id) {
    signUpEntry.user_id = req.decodedToken.userSQLId;
  }
  pool.connect(function (err, client, done) {
    if (err) {
      console.log(err);
      res.sendStatus(500);
    } else {
      client.query('UPDATE roles SET user_id=$1 WHERE id=$2',
        [signUpEntry.user_id, signUpEntry.role_id], function (err, result) {

          if (err) {
            console.log(err);
            res.sendStatus(500); // the world exploded
          } else {
            res.sendStatus(201);
          }
        });
    }
    done(); //done vs client.release()?
  });
});//end post


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
      client.query('UPDATE roles SET user_id=NULL WHERE user_id=$1 AND id=$2;',
        [removeEntry.user_id, removeEntry.role_id], function (err, result) {
          if (err) {
            console.log(err);
            res.sendStatus(500); // the world exploded
          } else {
            res.sendStatus(201);
          }
        });
    }
    done(); //done vs client.release()?
  });
});//end post

///ADMIN ADD ROLE TO EVENT
router.post('/addRole/:id', function (req, res) {
  var newRole = req.body;
  var eventId = req.params;
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
                      client.query('INSERT INTO roles (role_title , start_time, end_time, event_id, duration) VALUES ($1, $2, $3, $4, $5) RETURNING event_id;',
                        [newRole.role_title, newRole.start_time, newRole.end_time, newEventID, newRole.duration])
                        .then(function (result) {
                          console.log('new event result:', result, newEventID);
                          client.release();
                          res.send(result.rows[0]);

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
  var userId = role.userObject.id;
  console.log('Updating role: ', role);
  pool.connect()
    .then(function (client) {
      client.query('SELECT * FROM roles WHERE id=$1',
        [roleId])
        .then(function (result) {
          client.release();
          pool.connect()
            .then(function (client) {
              /// if this role was associated with a user -->
              if (result.rows[0] && result.rows[0].id) {
                console.log('userId:', userId);
                
                client.query('UPDATE roles SET role_title = $1, start_time = $2, end_time = $3, user_id = $4 WHERE id = $5', // Last thing Jonny and Chad did - untested before end of day 4-26
                  [role.role_title, role.start_time, role.end_time, userId, roleId])
                  .then(function (result) {
                    client.release();
                    res.sendStatus(200);
                    // pool.connect()
                    //   .then(function (client) {
                    //     client.query('UPDATE roles SET user_id = $1 WHERE id = $2',
                    //       [role.userObject.id, roleId])
                    //       .then(function (result) {
                    //         console.log('RESULT:', result);
                    //         client.release();
                    //         res.sendStatus(200);
                    //       })
                    //       .catch(function (err) {
                    //         client.release();
                    //         console.log('error on UPDATE', err);
                    //         res.sendStatus(500);
                    //       });
                    //   });
                  })
                  .catch(function(err) {
                    console.log('error on editRole', err);
                    res.sendStatus(500);
                  })
                /// if no user was signed up upon edit
              } else {
                pool.connect()
                  .then(function (client) {
                    client.query('UPDATE roles SET role_title = $1, start_time = $2, end_time = $3, user_id = $4 WHERE id = $5',
                      [role.role_title, role.start_time, role.end_time, role.userObject.id, roleId])
                      .then(function (result) {
                        console.log(result.rows);
                        client.release();
                        res.sendStatus(200);
                        // pool.connect() /// no longer need this query?? --Jonny
                        // .then(function (client) {
                        //   client.query('INSERT INTO role_user (user_id, role_id) VALUES ($1,$2);',
                        //   [role.userObject.id, roleId])
                        //   .then(function (result) {
                        //     client.release();
                        //     res.sendStatus(200);
                        //   })
                        //   .catch(function (err) {
                        //     client.release();
                        //     console.log('error on 333', err);
                        //     res.sendStatus(500);
                        //   });
                        // });
                      })
                      .catch(function(err){
                        client.release();
                        console.log('err on editRole', err);
                        res.sendStatus(500);
                      })
                  });
              }
            });
        }).catch(function (err) {
          console.log('error on 342', err);
          res.sendStatus(500);
        });
    });
});

router.get('/users/duration', function (req, res) {
  pool.connect()
    .then(function (client) {
      client.query(`SELECT SUM(roles.duration) AS signed_up_duration
    FROM roles
    WHERE user_id = $1;`,
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
    client.query(`SELECT users.id, roles.role_title, roles.start_time, roles.end_time, roles.event_id, events.date
      FROM roles
      LEFT OUTER JOIN users ON users.id=roles.user_id
      RIGHT OUTER JOIN events ON events.id=roles.event_id
      WHERE users.id = $1;`,
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
