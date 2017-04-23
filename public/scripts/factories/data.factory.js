app.factory('DataFactory', ['$firebaseAuth', '$http', '$location', '$window', 'ModalDataFactory', function ($firebaseAuth, $http, $location, $window, ModalDataFactory) {
  console.log('data factory loaded');

  // var currentEvent = { id: [] };
  var auth = $firebaseAuth();
  var eventList = { list: [[]] };
  var users = { list: [] };
  var currentUser = { info: {} };
  var eventRoles = { list: [] };
  var error = { info: {} };

  auth.$onAuthStateChanged(function (firebaseUser) {
    console.log('state changed');
    getUsers();
    getEvents();
    getUserData(firebaseUser);
    getCurrentDuration();
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
              event_id: event.event_id,

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


            if (eventRoles.list[i].userid) {
              eventRoles.list[i].userObject = {
                id: eventRoles.list[i].userid,
                first_name: eventRoles.list[i].first_name,
                last_name: eventRoles.list[i].last_name
              };
            }
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
          params: {
            role_id: roleClickedId
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
    return auth.$createUserWithEmailAndPassword(newUser.email, newUser.password)
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
        console.log('addUser catch:', error);
        return error;
      });
    console.log('error.info:', error.info);

  } // ends createUser function


  //Admin add role to event -CHRISTINE
  function adminAddRole(role, eventId) {
    console.log(eventId);
    var firebaseUser = auth.$getAuth();
    // firebaseUser will be null if not logged in
    if (firebaseUser) {

      //// ngmodel bound to role, we are changing Date to string so making a copy for database --JONNY
      var newRole = Object.assign({}, role);
      var date = moment(newRole.date);
      var startTime = moment(newRole.start_time);
      var endTime = moment(newRole.end_time);
      newRole.date = moment(ModalDataFactory.currentEventClicked).format("YYYY-MM-DD");
      newRole.start_time = moment(startTime).format('HH:mm:00');
      newRole.end_time = moment(endTime).format('HH:mm:00');
      newRole.duration = endTime.diff(startTime, 'minutes');
      console.log('New Role:', newRole);
      //// duration to be at least 30 min per client request - JONNY \\\\
      if (newRole.duration < 30) {
        newRole.duration = 30;
      }

      // This is where we make our call to our server
      firebaseUser.getToken().then(function (idToken) {
        $http({
          method: 'POST',
          url: '/privateData/addRole/' + eventId,
          headers: { id_token: idToken },
          data: newRole, date,
        }).then(function (response) {
          console.log(response);
          getEventRoles(eventId);
        });
      });
    } else {
      console.log('no firebase user');
    }
  }


  function adminAddEvent(newEvent) {
    // console.log(eventId);
    var firebaseUser = auth.$getAuth();
    // firebaseUser will be null if not logged in
    if (firebaseUser) {

      //// ngmodel bound to role, we are changing Date to string so making a copy for database --JONNY
      // var newEvent = Object.assign({}, role);
      firebaseUser.getToken().then(function (idToken) {
        $http({
          method: 'POST',
          url: '/privateData/addEvent/' ,
          headers: { id_token: idToken },
          data: newEvent,
        }).then(function (response) {
          console.log(response);
          getEvents();
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
    return auth.$sendPasswordResetEmail(forgetfulUserEmail)
      .then(function () {
        console.log("Password reset email sent successfully!", forgetfulUserEmail);
        return { success: true, message: 'Link for password reset sent to ' + forgetfulUserEmail + '!' };
      }).catch(function (error) {
        return { error: true, message: 'There is no user record corresponding to this email. The user may have been deleted.' };
      });
  }

  function signIn(email, password) {
    return auth.$signInWithEmailAndPassword(email, password)
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
            return currentUser.info;
          }, function (err) {
            console.log('datafactory addUser error', err);
          });
        });

      }).catch(function (error) {
        return error;
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
      currentUser.info = {};
    }
  }

  function deleteRole(roleId, eventId) {
    console.log('delete role function getting place:', roleId);
    // var firebaseUser = auth.$getAuth();
    var firebaseUser = auth.$getAuth();
    // firebaseUser will be null if not logged in
    if (firebaseUser) {
      // This is where we make our call to our server
      firebaseUser.getToken().then(function (idToken) {
        $http({
          method: 'DELETE',
          url: '/privateData/eventRoles/' + roleId,
          headers: {
            id_token: idToken
          },
          params: { roleId: roleId }
        }).then(function (response) {
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
    if (firebaseUser) {
      var editedRole = Object.assign({}, role);

      var startTime = moment(editedRole.start_time);
      var endTime = moment(editedRole.end_time);

      editedRole.start_time = moment(startTime).format('HH:mm:00');
      editedRole.end_time = moment(endTime).format('HH:mm:00');
      editedRole.duration = endTime.diff(startTime, 'minutes');

      //// duration to be at least 30 min per client request - JONNY \\\\
      if (editedRole.duration < 30) {
        editedRole.duration = 30;
      }
      // This is where we make our call to our server
      firebaseUser.getToken().then(function (idToken) {
        $http({
          method: 'PUT',
          url: '/privateData/editRole/' + role.id,
          headers: {
            id_token: idToken
          },
          data: editedRole
        }).then(function (response) {
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

  function getCurrentDuration() {
    var firebaseUser = auth.$getAuth();
    // firebaseUser will be null if not logged in
    if (firebaseUser) {
      // This is where we make our call to our server
      return firebaseUser.getToken().then(function (idToken) {
        $http({
          method: 'GET',
          url: '/privateData/users/duration',
          headers: {
            id_token: idToken
          }
        }).then(function (response) {
          if (response.data[0] && response.data[0].signed_up_duration) {



            console.log('getCurrentDuration response:', Number(response.data[0].signed_up_duration));
            currentUser.info.signed_up_duration = Number(response.data[0].signed_up_duration);
            console.log('hihihi currentUser:', currentUser.info);
            return currentUser.info.signed_up_duration
          } else {
            return currentUser.info.signed_up_duration = 0;

          }
        }, function (response) {
          console.log('dataFactory getCurrentDuration error:', response);
        });
      });
    } else {
      console.log('get users no firebase user');

    }
  }// end getUsers()

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
    getCurrentDuration: getCurrentDuration,
    error: error,

    // CHRISTINE exports
    getEventRoles: getEventRoles,
    eventRoles: eventRoles,
    adminAddRole: adminAddRole,
    deleteRole: deleteRole,
    adminAddEvent: adminAddEvent,

    // Chad exports
    editRole: editRole
  };

}]);
