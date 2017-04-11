app.controller("CalendarController", ["$location", "$firebaseAuth", "$http", function($location, $firebaseAuth, $http) {
  var auth = $firebaseAuth();
  var self = this;
  self.eventList = DataFactory.allEvents;
}]);
