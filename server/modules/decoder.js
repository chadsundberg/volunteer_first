var admin = require('firebase-admin');
var pg = require('pg');
var pool = require('../modules/pool-connection');

//env variables for heroku deploy
if(process.env.FIREBASE_SERVICE_ACCOUNT_PRIVATE_KEY) {
  admin.initializeApp({
    credential: admin.credential.cert({
      "type": process.env.FIREBASE_SERVICE_ACCOUNT_TYPE,
      "project_id": process.env.FIREBASE_SERVICE_ACCOUNT_PROJECT_ID,
      "private_key_id": process.env.FIREBASE_SERVICE_ACCOUNT_PRIVATE_KEY_ID,
      "private_key": process.env.FIREBASE_SERVICE_ACCOUNT_PRIVATE_KEY,
      "client_email": process.env.FIREBASE_SERVICE_ACCOUNT_CLIENT_EMAIL,
      "client_id": process.env.FIREBASE_SERVICE_ACCOUNT_CLIENT_ID,
      "auth_uri": process.env.FIREBASE_SERVICE_ACCOUNT_AUTH_URI,
      "token_uri": process.env.FIREBASE_SERVICE_ACCOUNT_TOKEN_URI,
      "auth_provider_x509_cert_url": process.env.FIREBASE_SERVICE_ACCOUNT_AUTH_PROVIDER_X509_CERT_URL,
      "client_x509_cert_url": process.env.FIREBASE_SERVICE_ACCOUNT_CLIENT_X509_CERT_URL
    }),
    databaseURL: "https://bet-shalom-volunteer-first.firebaseio.com"
  });
} else {
  admin.initializeApp({
    credential: admin.credential.cert("./server/firebase-service-account.json"),
    databaseURL: "https://bet-shalom-volunteer-first.firebaseio.com" // replace this line with your URL
  });
}//end env variables

var tokenDecoder = function (req, res, next) {

  if (req.headers.id_token) {
    admin.auth().verifyIdToken(req.headers.id_token).then(function (decodedToken) {
      req.decodedToken = decodedToken;
      pool.connect(function (err, client, done) {
        var firebaseUserEmail = req.decodedToken.email;
        client.query('SELECT * FROM users WHERE email=$1', [firebaseUserEmail], function (err, userSQLIdResult) {
          done();
          if (err) {
            console.log('Error completing user id query task', err);
            res.sendStatus(500);
          } else {
            pool.connect(function (err, client, done) {
              if (userSQLIdResult.rows.length === 0 && Object.keys(req.body).length > 0) {


                // If the user is not in the database, this adds them to the database
                var userEmail = req.body.email;
                var firstName = req.body.firstName;
                var lastName = req.body.lastName;
                console.log('register new user!!!!! req.body:', req.body);

                client.query('INSERT INTO users (first_name, last_name, email) VALUES ($1, $2, $3) RETURNING id, first_name, last_name, email', [firstName, lastName, userEmail], function (err, newUserSQLIdResult) {
                  done();
                  if (err) {
                    console.log('Error completing new user insert query task', err);
                    res.sendStatus(500);
                  } else {
                    // this adds the user's id from the database to the request to simplify future database queries
                    req.decodedToken.currentUser = newUserSQLIdResult.rows[0];
                    console.log('created new user: ', req.decodedToken.currentUser);
                    res.send(req.decodedToken.currentUser);
                    return;
                  }
                });
              } else if (userSQLIdResult.rows.length === 1) {
                done();
                // this else is for users that already exist. This should be the most common path
                // this adds the user's id from the database to the request to simplify future database queries
                req.decodedToken.userSQLId = userSQLIdResult.rows[0].id;
                req.decodedToken.currentUser = userSQLIdResult.rows[0];
                console.log('things are cool with this user request');
                done();
                next();
              } else {
                console.log('ERROR', userSQLIdResult.rows.length);

                // request from unauthorized user // not a user
                console.log('decoder unauthorized user');
                done();
                res.sendStatus(403);
              }
              done();
            });
          }
        });
      });
    })
    .catch(function (error) {
      console.error('User token could not be verified:', error);
      res.sendStatus(403);
    });
  } else {
    // Seems to be hit when chrome makes request for map files
    // Will also be hit when user does not send back an idToken in the header
    // technically, some of these should return 403 and some should return 404
    console.log('no token sent');

    res.sendStatus(404);
  }
};


module.exports = { token: tokenDecoder };

///// TODO: move ajax request for newUsers to private-data.js ///// --from: jonny--
