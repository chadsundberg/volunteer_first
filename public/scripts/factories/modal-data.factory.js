app.factory('ModalDataFactory', ['$http', function ($http) {
  console.log('modal data factory loaded');
  var dateClicked = { id: {} };
  var currentEventClicked = { id: {} };
  var eventList = { list: [[]] };


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








  function adminAddEvent() {
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
          data: currentEventClicked,
        }).then(function (response) {
          console.log(response);
          getEvents();
        });
      });
    } else {
      console.log('no firebase user');
    }
  }



  return{
  currentEventClicked: currentEventClicked,
  dateClicked: dateClicked
};

}]);
