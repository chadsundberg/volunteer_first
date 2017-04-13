app.controller("ModalInstanceCtrl", ["DataFactory", "$location", "$firebaseAuth", "$http", "$uibModalInstance", "title", function(DataFactory, $location, $firebaseAuth, $http, $uibModalInstance, title) {
  console.log('Modal Controller was loaded');
  var $ctrl = this;
  // $ctrl.items = items;
  $ctrl.selected = {
    // item: $ctrl.items[0]
  };
  $ctrl.message = title;

  $ctrl.ok = function () {
    $uibModalInstance.close($ctrl.selected.item);
  };

  $ctrl.cancel = function () {
    $uibModalInstance.dismiss('cancel');
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
