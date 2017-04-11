app.controller("CalendarController", ["DataFactory", "$location", "$firebaseAuth", "$http", function(DataFactory, $location, $firebaseAuth, $http) {
  var auth = $firebaseAuth();
  var self = this;
  self.eventList = DataFactory.allEvents;
}]);
