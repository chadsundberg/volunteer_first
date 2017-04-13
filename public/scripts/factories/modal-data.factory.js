app.factory('ModalDataFactory', ['$http', function ($http) {
  console.log('modal data factory loaded');
  var dateClicked = { day: {} };

  return{
  // allEvents: eventList,
  dateClicked: dateClicked
};

}]);
