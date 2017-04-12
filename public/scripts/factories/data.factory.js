app.factory('DataFactory', ['$firebaseAuth', '$http', function ($firebaseAuth, $http) {
  console.log('data factory loaded');
  var eventList = { list: [] };
  var auth = $firebaseAuth();
  var users = { list: [] };
  // var self = this;
  // self.newUser = {};
  // console.log(dateList);

  auth.$onAuthStateChanged(getUsers);
  //
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
        }).then(function (response) {
          console.log(response.data);
          users.list = response.data;
        });
      });
    } else {
      console.log('Not logged in or not authorized.');
      self.secretData = "Log in to search for volunteer activities.";
    }
  }

  auth.$onAuthStateChanged(getEvents);

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
        }).then(function (response) {
          console.log(response.data);
          eventList.list = response.data;
        });
      });
    } else {
      console.log('Not logged in or not authorized.');
      self.secretData = "Log in to search for volunteer activities.";
    }
  }



  function addUser(newUser) {
    console.log('factor user', newUser);

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
        }).then(function (response) {
          console.log(response);
          self.newUser = {};


        });
      });
    } else {
      console.log('no firebase user');

    }
  } // ends addPerson function


  return {
    eventList: eventList,
    getEvents: getEvents,
    addUser: addUser,
    getUsers: getUsers,
    users: users
  };

}]);
