app.controller("ModalInstanceCtrl", ["DataFactory", "ModalDataFactory", "$location", "$firebaseAuth", "$http", "$uibModalInstance", "title", function(DataFactory, ModalDataFactory, $location, $firebaseAuth, $http, $uibModalInstance, title) {
  console.log('Modal Controller was loaded');
  var $ctrl = this;
  self.currentUser = DataFactory.currentUser;
  $ctrl.checkedRole;

  // $ctrl.items = items;
  $ctrl.selected = {
    // item: $ctrl.items[0]
  };

  $ctrl.message = title;
  $ctrl.volunteerSignUp = DataFactory.volunteerSignUp;
  $ctrl.dateClicked = ModalDataFactory.dateClicked;
  $ctrl.eventList = DataFactory.eventList;
  $ctrl.ok = function () {
    $uibModalInstance.close($ctrl.selected.item);
  };
  $ctrl.cancel = function () {
    $uibModalInstance.dismiss('cancel');
  };

//Role on click to database
$ctrl.clickSaveSignUp = function(){
  $ctrl.volunteerSignUp($ctrl.checkedRole); //hardcoded for testing -- need role id
};
//Checkbox
$ctrl.checked = function(id){
  $ctrl.checkedRole = id;
};

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
