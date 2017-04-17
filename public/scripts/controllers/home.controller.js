app.controller("HomeController", ["DataFactory", "$location", "$firebaseAuth", "$http", function (DataFactory, $location, $firebaseAuth, $http) {
  var auth = $firebaseAuth();
  var self = this;

  // when controller starts up
  DataFactory.getUsers();
  DataFactory.getEvents();
}]);
