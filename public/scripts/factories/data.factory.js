app.factory('DataFactory', ['$firebaseAuth', '$http', '$location', '$window', function ($firebaseAuth, $http, $location, $window) {
  console.log('data factory loaded');
  var auth = $firebaseAuth();
  var eventList = { list: [] };
  var users = { list: [] };
  var currentUser = {};

  // merge this with authchange logincontroller l 37-39? //
  // auth.$onAuthStateChanged(function () {
  //   // getUsers();
  //   // getEvents();
  // });
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
          url: '/privateData/users',
          headers: {
            id_token: idToken
          }
        }).then(function(response) {
          console.log('hello getUsers:', response); /// getting correct array here, but not at getEvents()
          users.list = response.data;
          return users.list;
        }, function(response) {
          console.log('dataFactory getUsers error:', response);
        });
      });
    } else {
      console.log('get users no firebase user');
      
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
        }).then(function(response) {
          console.log('hello getEvents:', response); ////////////////////  response.data should be array of events but is currentUser!
          response.data.forEach(function (event) {
            eventList.list.push({
              title: event.role_title,
              start: new Date('2017-04-13T15:36:07+00:00'),
              id: event.id
              // end: new Date(y, m, 29),
            });
          });
        }, function(response) {
          console.log('datafactory getEvents error', response);
        });
      });
    } else {
      console.log('get events no firebase user');
      
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
        }).then(function(response) {
          console.log(response);
          console.log('firebase', firebaseUser);
          return response.data;
        }, function(response) {
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

        firebaseUser.getToken().then(function (idToken) {
          $http({
            method: 'POST',
            url: '/privateData',
            headers: { id_token: idToken },
            data: newUser
          }).then(function(response) {
              console.log('addUser ajax response:', response);
              currentUser.info = response.data;
              console.log('currentuser create user', currentUser);
              
              self.newUser = {};       
              $location.path('/home');
            }, function(err) {
            console.log('datafactory addUser error', err);
          });
        });

      }).catch(function (error) {
        self.error = error;
        console.log('addUser catch:', error);
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
    auth.$signInWithEmailAndPassword(email, password)
      .then(function (firebaseUser) {
        firebaseUser.getToken().then(function (idToken) {
          console.log('get user infoz');
          $http({
              method: 'GET',
              url: '/privateData/getUser',
              headers: { id_token: idToken }
            }).then(function(response) {
                console.log('getuser ajax response:', response);
                currentUser.info = response.data;
                console.log('currentuser get user', currentUser);      
                $location.path('/home');
              }, function(err) {
                console.log('datafactory addUser error', err);
            });
        });
        
      }).catch(function (error) {
        console.log('signin with email error', error);
      });
  }

  function getUserData(firebaseUser) {
    firebaseUser.getToken().then(function (idToken) {
    $http({
      method: 'GET',
      url: '/privateData/getUser',
      headers: { id_token: idToken }
    }).then(function(response) {
        console.log('getuser ajax response:', response);
        currentUser.info = response.data;
        console.log('currentuser get user', currentUser);   
      }, function(err) {
      console.log('datafactory addUser error', err);
    });
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
    resetPassword: resetPassword,
    getUserData: getUserData
  };

}]);
