app.factory('DataFactory', ['$firebaseAuth', '$http', '$location', '$window', function ($firebaseAuth, $http, $location, $window) {
  console.log('data factory loaded');

  // var currentEvent = { id: [] };
  var auth = $firebaseAuth();
  var eventList = { list: [[]] };
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
          eventList.list[0] = [];
          response.data.forEach(function (event) {
            eventList.list[0].push({
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
    console.log(eventId);
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
          eventRoles.list = response.data;
         //// Turning xx:xx:xx string into Date object for moment.js / input jonny \\\\
          for (i = 0; i < eventRoles.list.length; i++) {
            var newStartTime = eventRoles.list[i].start_time.split(':', 3);
            var newEndTime = eventRoles.list[i].end_time.split(':', 3);
            
          
            var newStartHours = newStartTime[0];
            var newStartMinutes = newStartTime[1];
            var newStartSeconds = newStartTime[2];
            var newEndHours = newEndTime[0];
            var newEndMinutes = newEndTime[1];
            var newEndSeconds = newEndTime[2];
            
           
            eventRoles.list[i].start_time = new Date(1970, 0, 0, newStartHours, newStartMinutes, newStartSeconds, 0);
            eventRoles.list[i].end_time = new Date(1970, 0, 0, newEndHours, newEndMinutes, newEndSeconds, 0);
          }
        });
      });
    } else {
      console.log('Not logged in or not authorized.');
      self.secretData = "Log in to search for volunteer activities.";
    }
  }//end Get events


//add role to user  -- CHRISTINE -- update this
  function volunteerSignUp(eventId, roleClickedId) {
    console.log('factory userRoleId', roleClickedId);
    var firebaseUser = auth.$getAuth();
    if (firebaseUser) {
      // This is where we make our call to our server
      return firebaseUser.getToken().then(function (idToken) {
        $http({
          method: 'POST',
          url: '/privateData/volunteerSignUp',
          headers: { id_token: idToken },
          data: {
            role_id: roleClickedId,
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

//remove user from role  -- Melissa
  function volunteerRemove(eventId, roleClickedId) {
    console.log('factory userRoleId', roleClickedId);
    var firebaseUser = auth.$getAuth();
    if (firebaseUser) {
      // This is where we make our call to our server
      return firebaseUser.getToken().then(function (idToken) {
        $http({
          method: 'DELETE',
          url: '/privateData/volunteerRemove',
          headers: { id_token: idToken },
          data: {
            role_id: roleClickedId,
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
      console.log('newRole.start_time:', newRole.start_time);
      console.log('getHours:', newRole.start_time.getHours());
      var newStartHours = newRole.start_time.getHours();
      var newStartMinutes = newRole.start_time.getMinutes();
      var newEndHours = newRole.end_time.getHours();
      var newEndMinutes = newRole.end_time.getMinutes();
      newRole.start_time = newStartHours + ':' + newStartMinutes + ':' + 00;
      newRole.end_time = newEndHours + ':' + newEndMinutes + ':' + 00;
      var startTime = moment(newRole.start_time , "HH:mm:ss");
      var endTime = moment(newRole.end_time , "HH:mm:ss");
      var duration = moment.duration(endTime.diff(startTime));
      
      newRole.duration = (duration._milliseconds / 60000);
      console.log('newRole.duration:', newRole.duration);
      
      
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

  function deleteRole(roleId, eventId) {
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
            getEventRoles(eventId);
          });
        });
      } else {
        console.log('Not logged in or not authorized.');
      }
    }

    function editRole(role, eventId) {
      console.log('factory getting place:', role);
      var firebaseUser = auth.$getAuth();
      // auth.$onAuthStateChanged(function(firebaseUser){
      // firebaseUser will be null if not logged in
      if(firebaseUser) {
        // This is where we make our call to our server
        firebaseUser.getToken().then(function(idToken){
          $http({
            method: 'PUT',
            url: '/privateData/editRole/' + role.id,
            headers: {
              id_token: idToken
            },
            data: role
          }).then(function(response) {
            console.log(response.data);
            getEvents();
            getEventRoles(eventId);
            // reviewUpdateDetails.list = response.data;
          });
        });
      } else {
        console.log('Not logged in or not authorized.');
        self.secretData = "Log in to search for date activities.";
      }
    }

  return {
    eventList: eventList,
    getEvents: getEvents,
    addUser: addUser,
    getUsers: getUsers,
    users: users,
    volunteerSignUp: volunteerSignUp,
    volunteerRemove: volunteerRemove,
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
    deleteRole: deleteRole,

    // Chad exports
    editRole: editRole
  };

}]);
