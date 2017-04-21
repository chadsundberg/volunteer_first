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
  console.log($ctrl.currentEventClicked);
  $ctrl.getEventRoles = DataFactory.getEventRoles;
  $ctrl.adminAddRole = DataFactory.adminAddRole;
  $ctrl.deleteRole = DataFactory.deleteRole;
  $ctrl.editRole = DataFactory.editRole;
  $ctrl.getUsers = DataFactory.getUsers;
  $ctrl.getEvents = DataFactory.getEvents;
  $ctrl.getCurrentDuration = DataFactory.getCurrentDuration;
  $ctrl.getUserData = DataFactory.getUserData;

  if ($ctrl.eventId === undefined) {
    $ctrl.eventRoles.list = {};
  } else {
    $ctrl.getEventRoles($ctrl.eventId);
  }

  if ($ctrl.eventId === undefined) {
    $ctrl.eventRoles.list = {};
  } else {
    $ctrl.getEventRoles($ctrl.eventId);
  }


  //Modal
  $ctrl.ok = function () {
    $uibModalInstance.close($ctrl.selected.item);
  };
  $ctrl.cancel = function () {
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

    // $ctrl.getUserData();
    $ctrl.getCurrentDuration();
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
  // ['Alabama', 'Alaska', 'Arizona', 'Arkansas',
  // 'California', 'Colorado', 'Connecticut', 'Delaware', 'Florida',
  // 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa',
  // 'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland',
  // 'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi',
  // 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire',
  // 'New Jersey', 'New Mexico', 'New York', 'North Dakota',
  // 'North Carolina', 'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania',
  // 'Rhode Island', 'South Carolina', 'South Dakota', 'Tennessee',
  // 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington',
  // 'West Virginia', 'Wisconsin', 'Wyoming'];

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
        $ctrl.close({ $value: $ctrl.selected.item });
      };
      $ctrl.cancel = function () {
        $ctrl.dismiss({ $value: 'cancel' });
      };
    }
  });
}]);
