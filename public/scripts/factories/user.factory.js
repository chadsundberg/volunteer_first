app.factory('UserFactory', ['$firebaseAuth', '$http', function ($firebaseAuth, $http) {
    var auth = $firebaseAuth();
    var users = { list: [] };
    var currentUser = {};






  return {
    currentUser: currentUser
};


})];
