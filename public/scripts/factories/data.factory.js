app.factory('DataFactory', ['$firebaseAuth', '$http', function ($firebaseAuth, $http) {
  console.log('data factory loaded');
  var eventList = { list: [] };
  var currentEvent = { id: [] };
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
        }).then(function (response) {
          console.log(response.data);
          // eventList.list = [];
          response.data.forEach(function(event){
            eventList.list.push({
              title: event.role_title,
              start: new Date(event.date),
              id: event.id
              // end: new Date(y, m, 29),
            });
            console.log(eventList.list);
          });
        });
      });
    } else {
      console.log('Not logged in or not authorized.');
      self.secretData = "Log in to search for volunteer activities.";
    }
  }//end Get events

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
          // response.data.forEach(function(event){
          //   currentEventClicked.id.push({
          //     title: event.id,
          //     start: new Date(event.date),
          //     id: event.id
          //   });
          //   console.log("currentevent", currentEventClicked.id);
          // });
        });
      });
    } else {
      console.log('Not logged in or not authorized.');
      self.secretData = "Log in to search for volunteer activities.";
    }
  }//end Get events


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
          }
        }).then(function (response) {
          getEventId();
          console.log(response);
          console.log('firebase', firebaseUser);
        });
      });
    } else {
      console.log('no firebase user');
    }
  }//End volunteerSignUp


//User registration
  function addUser(newUser) {
    console.log('factory user', newUser);
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
          //redirect user to home page
          console.log(response);
          self.newUser = {};
        });
      });
    } else {
      console.log('no firebase user');
    }
  } // ends addUser function


  return {
    eventList: eventList,
    getEvents: getEvents,
    addUser: addUser,
    getUsers: getUsers,
    users: users,
    volunteerSignUp: volunteerSignUp,
    getEventRoles: getEventRoles,
    currentEvent: currentEvent
  };

}]);
