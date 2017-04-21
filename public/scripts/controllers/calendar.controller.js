app.controller("CalendarController", ["DataFactory", "ModalDataFactory", "$location", "$firebaseAuth", "$http", "$uibModal", "$log", "$document", "$location", "$scope", function (DataFactory, ModalDataFactory, $location, $firebaseAuth, $http, $uibModal, $log, $document, $location, $scope) {
  console.log('Calendar Controller was loaded');
  var auth = $firebaseAuth();
  var self = this;
  var date = new Date();
  var d = date.getDate();
  var m = date.getMonth();
  var y = date.getFullYear();
  self.selectedDay = "testing";

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



  // state change / refresh
  //  auth.$onAuthStateChanged(function (firebaseUser) {
  //    console.log('cal controller state changed');
  //   DataFactory.getUsers();
  //   DataFactory.getEvents();
  //   DataFactory.getUserData(firebaseUser);
  // });

  //export to CSV
  self.filename = "test";
  self.getArray = [{ a: 1, b: 2 }, { a: 3, b: 4 }];

  self.clickFn = function (click) {
    console.log("click click click");
  };


  //Day click for Admin
  self.alertDayClick = function (date, jsEvent, view) {
    // self.addModal = (date.title + ' was clicked ');
    console.log("day click works ", date);
    self.selectedDay = "Open Day!";
    ModalDataFactory.currentEventClicked = date;
    self.open();

  };

  //Event click for User
  self.eventOnClick = function (date, jsEvent, view) {
    console.log(date.title + ' was clicked ');
    console.log(jsEvent);
    console.log('view, date, jsEvent:', view, date, jsEvent);
    self.selectedDay = "Event!";
    ModalDataFactory.currentEventClicked = date;
    self.open();
  };

  //Modal
  self.open = function (size, parentSelector) {
    console.log('opening modal');
    var parentElem =
      parentSelector ?
        angular.element($document[0].querySelector('.modalId ' + parentSelector)) : undefined;
    var modalInstance = $uibModal.open({
      animation: self.animationsEnabled,
      ariaLabelledBy: 'modal-title',
      ariaDescribedBy: 'modal-body',
      templateUrl: 'views/modal.html',
      controller: 'ModalInstanceCtrl',
      controllerAs: '$ctrl',
      size: 'lg',
      appendTo: parentElem,
      resolve: {
        title: function () {
          return self.events;
        }
      }
    });


    modalInstance.result.then(function (selectedItem) {
      $ctrl.selected = selectedItem;
    }, function () {
      $log.info('Modal dismissed at: ' + new Date());
    });
  };
  //End Modal


  /* config object for Calendar */
  self.uiConfig = {
    calendar: {
      height: 850,
      editable: true,
      header: {
        left: 'month basicWeek basicDay agendaWeek agendaDay',
        center: 'title',
        right: 'today prev,next'
      },
      eventClick: self.eventOnClick,
      eventDrop: self.alertOnDrop,
      eventResize: self.alertOnResize,
      dayClick: self.alertDayClick

    }
  };

  // self.eventRender = function(event, element, view) {
  //   self.currentEvent = event;
  // };



  // };

  self.eventSources = self.eventList.list;


}]);
