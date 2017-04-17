app.controller("HomeController", ["DataFactory", "$location", "$firebaseAuth", "$http", function (DataFactory, $location, $firebaseAuth, $http) {
  console.log('home controller loaded');
  
  var auth = $firebaseAuth();
  var self = this;

  // when controller starts up
   auth.$onAuthStateChanged(function (firebaseUser) {
    DataFactory.getUsers();
    DataFactory.getEvents();
    DataFactory.getUserData(firebaseUser);
  });
  
}]);
