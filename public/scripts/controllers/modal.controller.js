app.controller("ModalInstanceCtrl", ["DataFactory", "ModalDataFactory", "$location", "$firebaseAuth", "$http", "$uibModalInstance", "title", function (DataFactory, ModalDataFactory, $location, $firebaseAuth, $http, $uibModalInstance, title) {
  console.log('Modal Controller was loaded');
  var $ctrl = this;

  // $ctrl.items = [];
  // $ctrl.selected = {
  //   // item: $ctrl.items[0]
  // };

  $ctrl.currentUser = DataFactory.currentUser;
  $ctrl.eventRoles = DataFactory.eventRoles;
  $ctrl.message = title;
  $ctrl.volunteerSignUp = DataFactory.volunteerSignUp;
  $ctrl.volunteerRemove = DataFactory.volunteerRemove; // Melissa
  $ctrl.dateClicked = ModalDataFactory.dateClicked;
  $ctrl.currentEventClicked = ModalDataFactory.currentEventClicked;
  $ctrl.eventId = $ctrl.currentEventClicked.event_id;
  $ctrl.eventList = DataFactory.eventList;
  $ctrl.currentEvent = DataFactory.currentEvent;
  $ctrl.getEventRoles = DataFactory.getEventRoles;
  $ctrl.adminAddRole = DataFactory.adminAddRole;
  $ctrl.deleteRole = DataFactory.deleteRole;
  $ctrl.editRole = DataFactory.editRole;
  $ctrl.getUsers = DataFactory.getUsers;
  $ctrl.getEvents = DataFactory.getEvents;
  $ctrl.getCurrentDuration = DataFactory.getCurrentDuration;
  $ctrl.getUserData = DataFactory.getUserData;
  $ctrl.getCurrentUsersRoles = DataFactory.getCurrentUsersRoles;

    console.log($ctrl.currentEventClicked);

  if ($ctrl.eventId === undefined) {
    $ctrl.eventRoles.list = {};
  } else {
    $ctrl.getEventRoles($ctrl.eventId);
  }

  //Modal
  $ctrl.ok = function () {
    $ctrl.getUsers();
    $ctrl.getEvents();
    $ctrl.getCurrentDuration();
    $ctrl.getCurrentUsersRoles();
    $uibModalInstance.close($ctrl.selected.item);
  };

  $ctrl.cancel = function () {
    $ctrl.getUsers();
    $ctrl.getEvents();
    $uibModalInstance.dismiss('cancel');
  };


  //USER SIGN UP FUNCTIONS
  //Role on click to database

  $ctrl.clickSaveSignUp = function (roleClickedId) {
    $ctrl.volunteerSignUp($ctrl.eventId, roleClickedId);
    console.log(roleClickedId);
  };

  $ctrl.exitModal = function (roleClickedId) {
    $ctrl.getUsers();
    $ctrl.getEvents();
    $ctrl.getCurrentDuration();
    $ctrl.getCurrentUsersRoles();
    $uibModalInstance.dismiss('cancel');
  };


  // Melissa
  $ctrl.clickRemove = function (roleClickedId) {
    $ctrl.volunteerRemove($ctrl.eventId, roleClickedId);
    console.log(roleClickedId);
  };

  // MELISSA STUFF!!
  $ctrl.selected = "";
  $ctrl.users = DataFactory.users.list;

  console.log($ctrl.users);

  // Please note that the close and dismiss bindings are from $uibModalInstance.
  angular.module('volunteerApp').component('modalComponent', {
    templateUrl: 'myModalContent.html',
    bindings: {
      resolve: '<',
      close: '&',
      dismiss: '&'
    },
    controller: function () {
      var $ctrl = this;
      $ctrl.$onInit = function () {
        $ctrl.items = $ctrl.resolve.items;
        $ctrl.selected = {
          item: $ctrl.items[0]
        };
      };
      $ctrl.ok = function () {
    $ctrl.getUsers();
    $ctrl.getEvents();
    $ctrl.getCurrentDuration();
    $ctrl.getCurrentUsersRoles();
    console.log('currentEvent:', $ctrl.currentEvent);
    

        // $ctrl.close({ $value: $ctrl.selected.item });
      };
      $ctrl.cancel = function () {
    $ctrl.getUsers();
    $ctrl.getEvents();
    $ctrl.getCurrentDuration();
    $ctrl.getCurrentUsersRoles();
        // $ctrl.dismiss({ $value: 'cancel' });
      };
    }
  });
}]);
