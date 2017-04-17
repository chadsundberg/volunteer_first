app.factory('DataFactory', ['$firebaseAuth', '$http', '$location', function ($firebaseAuth, $http, $location) {
  console.log('data factory loaded');
  var auth = $firebaseAuth();
  var eventList = { list: [] };
  var users = { list: [] };
  var currentUser = { list: [] };

// merge this with authchange logincontroller l 37-39? //
  auth.$onAuthStateChanged(function () {
    getUsers();
    getEvents();
  });
  //
  //
  function getUsers() {
    var firebaseUser = auth.$getAuth();
    // firebaseUser will be null if not logged in
    if (firebaseUser) {
      // This is where we make our call to our server
      return firebaseUser.getToken().then(function (idToken) {
        $http({
          method: 'GET',
          url: '/privateData',
          headers: {
            id_token: idToken
          }
        }).then(function successCallback(response) {
          console.log('hello:', response); /// getting correct array here, but not at getEvents()
          users.list = response.data;
          return users.list;
        }, function errorCallback(response) {
          console.log('dataFactory getUsers error:', response);
        });
      });
    }
  }// end getUsers()


  // Get events for calendar
  function getEvents() {
    var firebaseUser = auth.$getAuth();
    // firebaseUser will be null if not logged in
    if (firebaseUser) {
      // This is where we make our call to our server
      return firebaseUser.getToken().then(function (idToken) {
        $http({
          method: 'GET',
          url: '/privateData/events',
          headers: {
            id_token: idToken
          }
        }).then(function successCallback(response) {
          console.log(response.data); ////////////////////  response.data should be array of events but is currentUser!
          response.data.forEach(function (event) {
            eventList.list.push({
              title: event.role_title,
              start: new Date('2017-04-13T15:36:07+00:00'),
              id: event.id
              // end: new Date(y, m, 29),
            });
            console.log(eventList.list);
          });
        }, function errorCallback(response) {
          console.log('datafactory getEvents error', response);
        });
      });
    }
  }//end getEvents()


  //add role to user post -- CHRISTINE 
  function volunteerSignUp(userRoleId) {
    console.log('factory userRoleId', userRoleId);
    var firebaseUser = auth.$getAuth();
    // firebaseUser will be null if not logged in
    if (firebaseUser) {
      // This is where we make our call to our server
      return firebaseUser.getToken().then(function (idToken) {
        $http({
          method: 'POST',
          url: '/privateData/volunteerSignUp',
          headers: { id_token: idToken },
          data: {
            role_id: userRoleId,
            // user_id: firebaseUser.email //NEED user id to associate role with -- firebase?
            user_id: 1
          }
        }).then(function successCallback(response) {
          console.log(response);
          console.log('firebase', firebaseUser);
          return response.data;
        }, function errorCallback(response) {
          console.log('datafactory volunteerSignUp error', response);
        });
      });
    }
  }//End volunteerSignUp(userRoleId)

  //User registration
  function addUser(newUser) {
    var firebaseUser = auth.$getAuth();
    // firebaseUser will be null if not logged in
    if (firebaseUser) {
      // This is where we make our call to our server
      return firebaseUser.getToken().then(function (idToken) {
        $http({
          method: 'POST',
          url: '/privateData',
          headers: { id_token: idToken },
          data: newUser
        }).then(function successCallback(response) {
          console.log(response);
          currentUser = response.data;
          return currentUser;
        }, function errorCallback(response) {
          console.log('datafactory addUser error', response);
        });
      });
    }
    console.log('currentUser:', currentUser);

  } // ends addUser function

  /////// todo: deletethis???? *jonny*
  // function getCurrentUser() {
  //   var firebaseUser = auth.$getAuth();

  //   if (firebaseUser) {

  //     firebaseUser.getToken().then(function (idToken) {
  //       $http({
  //         method: 'GET',
  //         url: '/privateData/currentUser',
  //         headers: {
  //           id_token: idToken
  //         },
  //         params: { firebaseUser: firebaseUser.email }
  //       }).then(function successCallback(response) {
  //         console.log(response.data);
  //         currentUser = response.data;
  //       }, function errorCallback(response) {
  //         console.log('datafactory getCurrentUser error', response);
  //       });
  //     });
  //   }
  // }//end getCurrentUser

  function createUser(newUser) {
    // add user to firebase
    auth.$createUserWithEmailAndPassword(newUser.email, newUser.password)
      .then(function (firebaseUser) {
        // add user to db
        addUser(newUser);
        self.newUser = {};
        self.message = "User created with uid: " + firebaseUser.uid;
        $location.path('/home');
      }).catch(function (error) {
        self.error = error;
      });
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
    auth.$signInWithEmailAndPassword(self.user.email, self.user.password)
      .then(function (firebaseUser) {
        console.log('firebaseUser:', firebaseUser);
        self.firebaseUser.email = firebaseUser.email;
        // todo: SQL add user with self.names
        self.message = "User created with uid: " + firebaseUser.uid;
        console.log("Firebase Authenticated as: ", firebaseUser.email);
        self.firebaseUser = firebaseUser;
        $location.path('/home');
      }).catch(function (error) {
        self.error = error;
        var errorCode = error.code;
        var errorMessage = error.message;
        console.log('errorCode:', errorCode);
        console.log('errorMessage:', errorMessage);
        if (errorCode === 'auth/user-not-found') {
          alert('User not found!');
        }

      });
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
    resetPassword: resetPassword
  };

}]);
