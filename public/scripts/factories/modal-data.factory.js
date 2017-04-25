app.factory('ModalDataFactory', ['$http', function ($http) {
  console.log('modal data factory loaded');
  var dateClicked = { id: {} };
  var currentEventClicked = { id: {} };
  var eventList = { list: [[]] };




  return{
  currentEventClicked: currentEventClicked,
  dateClicked: dateClicked
};

}]);
