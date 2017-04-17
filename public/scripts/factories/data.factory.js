app.factory('DataFactory', ['$firebaseAuth', '$http', function ($firebaseAuth, $http) {
  console.log('data factory loaded');
  var eventList = { list: [] };
  var auth = $firebaseAuth();
  var users = { list: [] };
  var currentUser = {};
  // var self = this;
  // self.newUser = {};
  // console.log(dateList);

  auth.$onAuthStateChanged(getUsers);
  auth.$onAuthStateChanged(getEvents);
  //
  //
  function getUsers() {
    var firebaseUser = auth.$getAuth();
    // firebaseUser will be null if not logged in
    if (firebaseUser) {
      // This is where we make our call to our server
      firebaseUser.getToken().then(function (idToken) {
        $http({
          method: 'GET',
          url: '/privateData',
          headers: {
            id_token: idToken
          }
        }).then(function successCallback(response) {
          console.log(response.data);
          users.list = response.data;
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
      firebaseUser.getToken().then(function (idToken) {
        $http({
          method: 'GET',
          url: '/privateData/events',
          headers: {
            id_token: idToken
          }
        }).then(function successCallback(response) {
          console.log(response.data);
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
      firebaseUser.getToken().then(function (idToken) {
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
      firebaseUser.getToken().then(function (idToken) {
        $http({
          method: 'POST',
          url: '/privateData',
          headers: { id_token: idToken },
          data: newUser
        }).then(function successCallback(response) {
          console.log(response);
          self.newUser = {};
        }, function errorCallback(response) {
          console.log('datafactory addUser error', response);
        });
      });
    }
  } // ends addUser function

  function getCurrentUser() {
    var firebaseUser = auth.$getAuth();

    if (firebaseUser) {

      firebaseUser.getToken().then(function (idToken) {
        $http({
          method: 'GET',
          url: '/privateData/currentUser',
          headers: {
            id_token: idToken
          },
          params: { firebaseUser: firebaseUser.email }
        }).then(function successCallback(response) {
          console.log(response.data);
          currentUser = response.data;
        }, function errorCallback(response) {
          console.log('datafactory getCurrentUser error', response);
        });
      });
    }
  }//end getCurrentUser


  return {
    eventList: eventList,
    getEvents: getEvents,
    addUser: addUser,
    getUsers: getUsers,
    users: users,
    volunteerSignUp: volunteerSignUp,
    currentUser: currentUser
  };

}]);
