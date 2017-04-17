app.controller("ModalInstanceCtrl", ["DataFactory", "ModalDataFactory", "$location", "$firebaseAuth", "$http", "$uibModalInstance", "title",  function(DataFactory, ModalDataFactory, $location, $firebaseAuth, $http, $uibModalInstance, title) {
  console.log('Modal Controller was loaded');
  var $ctrl = this;
  $ctrl.checkedRole;

  $ctrl.items = [];
  $ctrl.selected = {
    // item: $ctrl.items[0]
  };
  $ctrl.eventRoles = DataFactory.eventRoles;
  $ctrl.message = title;
  $ctrl.volunteerSignUp = DataFactory.volunteerSignUp;
  $ctrl.dateClicked = ModalDataFactory.dateClicked;
  $ctrl.currentEventClicked = ModalDataFactory.currentEventClicked;
  $ctrl.eventList = DataFactory.eventList;
  $ctrl.currentEvent = DataFactory.currentEvent;
    console.log($ctrl.currentEventClicked);
  $ctrl.getEventRoles = DataFactory.getEventRoles;
  $ctrl.getEventRoles($ctrl.currentEventClicked._id); //if currentEventClicked doesn't have id don't show
  $ctrl.adminAddRole = DataFactory.adminAddRole; //CHRISTINE

  //Modal
  $ctrl.ok = function () {
    $uibModalInstance.close($ctrl.selected.item);
  };
  $ctrl.cancel = function () {
    $uibModalInstance.dismiss('cancel');
  };




//USER SIGN UP FUNCTIONS
//Role on click to database
$ctrl.clickSaveSignUp = function(){
  $ctrl.volunteerSignUp($ctrl.checkedRole); //hardcoded for testing -- need role id from auth
}
//Checkbox
$ctrl.checked = function(id){
  $ctrl.checkedRole = id;
}

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
      $ctrl.close({$value: $ctrl.selected.item});
    };
    $ctrl.cancel = function () {
      $ctrl.dismiss({$value: 'cancel'});
    };
  }
});
}]);
