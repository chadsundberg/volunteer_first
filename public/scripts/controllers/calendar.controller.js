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
  self.adminAddEvent = DataFactory.adminAddEvent;
  self.getCurrentDuration = DataFactory.getCurrentDuration;
  self.getCurrentDuration();


  //export to CSV client side
  self.download = function() {
    var firebaseUser = auth.$getAuth();
    // firebaseUser will be null if not logged in
    if (firebaseUser) {
      firebaseUser.getToken().then(function (idToken) {
        $http({
          method: 'GET',
          url: '/privateData/getcsv',
          headers: { id_token: idToken }
        }).then(function(result) {
          // create an object and a new DOM element and then make the browser 'click' on it
          // https://developer.mozilla.org/en-US/docs/Web/API/Blob
          var blob = new Blob([result.data], { type: result.config.dataType });
          var windowUrl = (window.URL || window.webkitURL);
          var downloadUrl = windowUrl.createObjectURL(blob);

          // create new <a> tag
          var anchor = document.createElement("a");
          // URL is just our object from above
          anchor.href = downloadUrl;
          // name the file to download
          anchor.download = "bet_shalom_event_data.csv";

          document.body.appendChild(anchor);

          // simulate a click event on this a tag
          anchor.click();

          // destroy the created URL Object from above to clean up
          windowUrl.revokeObjectURL(blob);
      }); // end ajax stuff
    }); // end get token
  } else {
    console.log('no auth for download');
  }
}

  // self.clickFn = function (click) {
  //   console.log("click click click");
  // };


  //Day click for Admin
  self.alertDayClick = function (date, jsEvent, view) {
    // self.addModal = (date.title + ' was clicked ');
    if (self.currentUser.info.is_admin) {
      console.log("day click works ", date);
      self.selectedDay = "Open Day!";
      ModalDataFactory.currentEventClicked = date;
      self.open();
    } else {
      console.log('user not authorized for dayClick');

    }
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
        left: 'month basicWeek basicDay',
        center: 'title',
        right: 'today, prev next'
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
