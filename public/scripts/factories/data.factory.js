app.factory('DataFactory', ['$firebaseAuth', '$http', function($firebaseAuth, $http) {
  console.log('data factory loaded');
  var eventList = { list: [] };
  var auth = $firebaseAuth();
  console.log(dateList);

  auth.$onAuthStateChanged(getEvents);



  function getEvents() {
    var firebaseUser = auth.$getAuth();
      // firebaseUser will be null if not logged in
      if(firebaseUser) {
        // This is where we make our call to our server
        firebaseUser.getToken().then(function(idToken){
          $http({
            method: 'GET',
            url: '/privateData',
            headers: {
              id_token: idToken
            }
          }).then(function(response) {
            console.log(response.data);
            eventList.list = response.data;
          });
        });
      } else {
        console.log('Not logged in or not authorized.');
        self.secretData = "Log in to search for volunteer activities.";
      }
  }


  return {
    allEvents: eventList,
  }

}]);
