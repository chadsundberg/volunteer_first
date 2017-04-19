app.factory('DataFactory', ['$firebaseAuth', '$http', '$location', '$window', function ($firebaseAuth, $http, $location, $window) {
  console.log('data factory loaded');

  // var currentEvent = { id: [] };
  var auth = $firebaseAuth();
  var eventList = { list: [] };
  var users = { list: [] };
  var currentUser = {};
  var eventRoles = { list: [] };

  auth.$onAuthStateChanged(function (firebaseUser) {
    console.log('cal controller state changed');
    getUsers();
    getEvents();
    getUserData(firebaseUser);
 });

  function getUsers() {
    var firebaseUser = auth.$getAuth();
    // firebaseUser will be null if not logged in
    if (firebaseUser) {
      // This is where we make our call to our server
      return firebaseUser.getToken().then(function (idToken) {
        $http({
          method: 'GET',
          url: '/privateData/users',
          headers: {
            id_token: idToken
          }
        }).then(function (response) {
          users.list = response.data;
          return users.list;
        }, function (response) {
          console.log('dataFactory getUsers error:', response);
        });
      });
    } else {
      console.log('get users no firebase user');

    }
  }// end getUsers()


  // Get events for calendar
  function getEvents() {
    console.log('GET EVENTS RUNNING!');
    // eventList.list = [];
    var firebaseUser = auth.$getAuth();
    // firebaseUser will be null if not logged in
    if (firebaseUser) {
      // This is where we make our call to our server
      firebaseUser.getToken().then(function (idToken) {
        $http({
          method: 'GET',
          url: '/privateData/events',
          headers: {
            id_token: idToken
          }
        }).then(function (response) {
          console.log(response.data);
          eventList.list = [];
          response.data.forEach(function (event) {
            eventList.list.push({
              title: event.role_title,
              start: new Date(event.date),
              role_id: event.role_id,
              event_id:event.event_id,

              // end: new Date(y, m, 29),
            });
          });
          console.log('events?: ', eventList);
        }, function (response) {
          console.log('datafactory getEvents error', response);
        });
      });
    } else {
      console.log('get events no firebase user');

    }
  }//end getEvents()

  // Get events for modal
  function getEventRoles(eventId) {
    var firebaseUser = auth.$getAuth();
    // firebaseUser will be null if not logged in
    if (firebaseUser) {
      // This is where we make our call to our server
      firebaseUser.getToken().then(function (idToken) {
        $http({
          method: 'GET',
          url: '/privateData/eventRoles/' + eventId,
          headers: {
            id_token: idToken
          }
        }).then(function (response) {
          console.log(response.data);
          eventRoles.list = response.data;
        });
      });
    } else {
      console.log('Not logged in or not authorized.');
      self.secretData = "Log in to search for volunteer activities.";
    }
  }//end Get events


//add role to user  -- CHRISTINE -- update this
  function volunteerSignUp(eventId, userRoleId) {
    console.log('factory userRoleId', userRoleId);
    var firebaseUser = auth.$getAuth();
    if (firebaseUser) {
      // This is where we make our call to our server
      return firebaseUser.getToken().then(function (idToken) {
        $http({
          method: 'POST',
          url: '/privateData/volunteerSignUp',
          headers: { id_token: idToken },
          data: {
            role_id: userRoleId,
          }
        }).then(function (response) {
          getEventRoles(eventId);
          console.log(response);
          console.log('firebase', firebaseUser);
          return response.data;
        }, function (response) {
          console.log('datafactory volunteerSignUp error', response);
        });
      });
    }
  }//End volunteerSignUp(userRoleId)

  //User registration
  function addUser(fbuser, newUser) {
    // var firebaseUser = auth.$getAuth();
    // firebaseUser will be null if not logged in
    if (fbuser) {
      // This is where we make our call to our server
      return fbuser.getToken().then(function (idToken) {
        console.log('ajax post to server to create new user');
      });
    } else {
      console.log('add user no fb user!');

    }
  } // ends addUser function

  function createUser(newUser) {
    // add user to firebase
    auth.$createUserWithEmailAndPassword(newUser.email, newUser.password)
      .then(function (firebaseUser) {
        firebaseUser.getToken().then(function (idToken) {
          $http({
            method: 'POST',
            url: '/privateData',
            headers: { id_token: idToken },
            data: newUser
          }).then(function (response) {
            console.log('addUser ajax response:', response);
            currentUser.info = response.data;
            console.log('currentuser create user', currentUser);

            self.newUser = {};
            $location.path('/home');
          }, function (err) {
            console.log('datafactory addUser error', err);
          });
        });

      }).catch(function (error) {
        self.error = error;
        console.log('addUser catch:', error);
      });
  } // ends createUser function


  //Admin add role to event -CHRISTINE
  function adminAddRole(newRole, eventId) {
    console.log(eventId);
    var firebaseUser = auth.$getAuth();
    // firebaseUser will be null if not logged in
    if (firebaseUser) {
      // This is where we make our call to our server
      firebaseUser.getToken().then(function (idToken) {
        $http({
          method: 'POST',
          url: '/privateData/addRole/' + eventId,
          headers: { id_token: idToken },
          data: newRole,
        }).then(function (response) {
          console.log(response);
          getEventRoles(eventId);
        });
      });
    } else {
      console.log('no firebase user');
    }
  }




  function signOut() {
    auth.$signOut().then(function () {
      console.log('Logging the user out!');
      $location.path('/');
    });
  }

  function resetPassword(forgetfulUserEmail) {
    auth.$sendPasswordResetEmail(forgetfulUserEmail).then(function () {
      console.log("Password reset email sent successfully!");
    }).catch(function (error) {
      console.error("Error: ", error);
    });
  }

  function signIn(email, password) {
    auth.$signInWithEmailAndPassword(email, password)
      .then(function (firebaseUser) {
        firebaseUser.getToken().then(function (idToken) {
          console.log('get user infoz');
          $http({
            method: 'GET',
            url: '/privateData/getUser',
            headers: { id_token: idToken }
          }).then(function (response) {
            console.log('getuser ajax response:', response);
            currentUser.info = response.data;
            console.log('currentuser get user', currentUser);
            $location.path('/home');
          }, function (err) {
            console.log('datafactory addUser error', err);
          });
        });

      }).catch(function (error) {
        console.log('signin with email error', error);
      });
  }

  function getUserData(firebaseUser) {
    if (firebaseUser) {
      firebaseUser.getToken().then(function (idToken) {
        $http({
          method: 'GET',
          url: '/privateData/getUser',
          headers: { id_token: idToken }
        }).then(function (response) {
          console.log('getuser ajax response:', response);
          currentUser.info = response.data;
          console.log('currentuser get user', currentUser);
        }, function (err) {
          console.log('datafactory addUser error', err);
        });
      }).catch(function (error) {
        console.log('getuserdata error:', error);
      });
    } else {
      currentUser.info = null;
    }
  }

  function deleteRole(roleId) {
      console.log('delete role function getting place:', roleId);
      // var firebaseUser = auth.$getAuth();
      var firebaseUser = auth.$getAuth();
      // firebaseUser will be null if not logged in
      if(firebaseUser) {
        // This is where we make our call to our server
        firebaseUser.getToken().then(function(idToken){
          $http({
            method: 'DELETE',
            url: '/privateData/eventRoles/' + roleId,
            headers: {
              id_token: idToken
            },
            params: {roleId: roleId}
          }).then(function(response) {
            // console.log(response.data);
            // getEventRoles();
          });
        });
      } else {
        console.log('Not logged in or not authorized.');
      }
    }

  return {
    eventList: eventList,
    getEvents: getEvents,
    addUser: addUser,
    getUsers: getUsers,
    users: users,
    volunteerSignUp: volunteerSignUp,
    currentUser: currentUser,
    createUser: createUser,
    signOut: signOut,
    signIn: signIn,
    resetPassword: resetPassword,
    getUserData: getUserData,

    // CHRISTINE exports
    getEventRoles: getEventRoles,
    eventRoles: eventRoles,
    adminAddRole: adminAddRole,
    deleteRole: deleteRole
  };

}]);
