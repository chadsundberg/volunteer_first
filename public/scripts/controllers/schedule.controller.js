app.controller("MyScheduleController", ["DataFactory", "ModalDataFactory", "$location", "$firebaseAuth", "$http", "$uibModal", "$log", "$document", "$location", "$scope", function (DataFactory, ModalDataFactory, $location, $firebaseAuth, $http, $uibModal, $log, $document, $location, $scope) {
  console.log('Schedule Controller was loaded');
  var auth = $firebaseAuth();
  var self = this;
  // var date = new Date();
  // var d = date.getDate();
  // var m = date.getMonth();
  // var y = date.getFullYear();
  // self.selectedDay = "testing";

  self.eventList = DataFactory.eventList;
  self.eventId = DataFactory.eventId;
  self.eventRoles = DataFactory.eventRoles;
  self.getEvents = DataFactory.getEvents;
  self.users = DataFactory.users;
  self.getUsers = DataFactory.getUsers;
  self.getUserData = DataFactory.getUserData;
  self.volunteerSignUp = DataFactory.volunteerSignUp;
  self.currentUser = DataFactory.currentUser;
  self.getEventRoles = DataFactory.getEventRoles;
  self.adminAddEvent = DataFactory.adminAddEvent;
  self.getCurrentDuration = DataFactory.getCurrentDuration;
  self.getCurrentDuration();
  self.getCurrentUsersRoles = DataFactory.getCurrentUsersRoles;
  self.userRoles = DataFactory.userRoles;









}]);
