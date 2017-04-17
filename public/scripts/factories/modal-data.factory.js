app.factory('ModalDataFactory', ['$http', function ($http) {
  console.log('modal data factory loaded');
  var dateClicked = { day: {} };
  var currentEventClicked = { id: {} };
  console.log(currentEventClicked);
  console.log(currentEventClicked.id);

  return{
  currentEventClicked: currentEventClicked,
  dateClicked: dateClicked
};

}]);
