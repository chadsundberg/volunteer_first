app.controller("CalendarController", ["DataFactory", "ModalDataFactory", "$location", "$firebaseAuth", "$http", "$uibModal", "$log", "$document", function(DataFactory, ModalDataFactory, $location, $firebaseAuth, $http, $uibModal, $log, $document) {
  console.log('Calendar Controller was loaded');
  var auth = $firebaseAuth();
  var self = this;
  var date = new Date();
  var d = date.getDate();
  var m = date.getMonth();
  var y = date.getFullYear();
  self.selectedDay = "testing";
  self.eventList = DataFactory.eventList;
  self.getEvents = DataFactory.getEvents;
  self.users = DataFactory.users;
  self.getUsers = DataFactory.getUsers;
  self.volunteerSignUp = DataFactory.volunteerSignUp;
  self.currentUser = DataFactory.currentUser;

  // state change / refresh
   auth.$onAuthStateChanged(function (firebaseUser) {
    DataFactory.getUsers();
    DataFactory.getEvents();
    DataFactory.getUserData(firebaseUser);
  });

  //Example events for calendar
  self.eventSources = [[
    {title: 'All Day Event',start: new Date(y, m, 1)},
    {title: 'Long Event',start: new Date(y, m, d - 5),end: new Date(y, m, d - 2)},
    {id: 999,title: 'Repeating Event',start: new Date(y, m, d - 3, 16, 0),allDay: false},
    {id: 999,title: 'Repeating Event',start: new Date(y, m, d + 4, 16, 0),allDay: false},
    {title: 'Birthday Party',start: new Date(y, m, d + 1, 19, 0),end: new Date(y, m, d + 1, 22, 30),allDay: false},
    {title: 'Click for Google',start: new Date(y, m, 28),end: new Date(y, m, 29),url: 'http://google.com/'}
  ]];

  //Day click for Admin
  self.alertDayClick = function( date, jsEvent, view){
    self.addModal = (date.title + ' was clicked ');
    console.log("day click works ", date);
    self.selectedDay = "Open Day!";
    // ModalDataFactory.currentEventClicked = date;
    self.open();
  };

  //Event click for User
  self.eventOnClick = function( date, jsEvent, view){
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
      // replace this with event data
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
    calendar:{
      height: 650,
      editable: true,
      header:{
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



  self.eventSources = [self.eventList.list];
}]);
