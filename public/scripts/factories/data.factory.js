app.factory('DataFactory', ['$firebaseAuth', '$http', function ($firebaseAuth, $http) {
  console.log('data factory loaded');
  var events = { list: [] };
  var users = { list: []};
  var auth = $firebaseAuth();
  // var self = this;
  // self.newUser = {};
  // console.log(dateList);

  auth.$onAuthStateChanged(someStuff);
  auth.$onAuthStateChanged(bigAss);


  function getEvents() {
    var firebaseUser = auth.$getAuth();
    // firebaseUser will be null if not logged in
    if (firebaseUser) {
      // This is where we make our call to our server
      firebaseUser.getToken().then(function (idToken) {
        // $http({
        //   method: 'GET',
        //   url: '/privateData',
        //   headers: {
        //     id_token: idToken
        //   }
        // }).then(function (response) {
        //   console.log(response.data);
        //   eventList.list = response.data;
        // });
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




  function someStuff() {
    console.log('hiiii');
    var firebaseUser = auth.$getAuth();
    // firebaseUser will be null if not logged in
    if (firebaseUser) {
      console.log('are you here');
      // This is where we make our call to our server
      firebaseUser.getToken().then(function (idToken) {
    $http({
      method:'GET',
      url: '/stuff',
      headers: { id_token: idToken }
    }).then(function(response) {
      console.log(response.data);
      users.list = response.data;
});
  });
  }
  else {
    console.log('byyyyeeee');
  }
}

function bigAss() {
  console.log('hiiii');
  var firebaseUser = auth.$getAuth();
  // firebaseUser will be null if not logged in
  if (firebaseUser) {
    console.log('are you here');
    // This is where we make our call to our server
    firebaseUser.getToken().then(function (idToken) {
  $http({
    method:'GET',
    url: '/event',
    headers: { id_token: idToken }
  }).then(function(response) {
    console.log(response.data);
    events.list = response.data;
});
});
}
else {
  console.log('byyyyeeee');
}
}

  return {

    addUser: addUser,
    getEvents: getEvents,
    someStuff: someStuff,
    users: users,
    events: events,
    bigAss: bigAss
  };

}]);
