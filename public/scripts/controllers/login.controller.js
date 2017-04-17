app.controller("LoginController", ["DataFactory", "$location", "$firebaseAuth", "$http", function (DataFactory, $location, $firebaseAuth, $http) {
  var auth = $firebaseAuth();
  var self = this;
  self.user = {};
  self.newUser = {};
  self.forgetfulUser = {};
  self.firebaseUser = {};
  self.currentUser = DataFactory.currentUser;


  self.createUser = function () {
    var inpObj = document.getElementById("newUserEmail");
    if (inpObj.checkValidity() === false) {
      document.getElementById("errorElement").innerHTML = inpObj.validationMessage;
    } else {
      DataFactory.createUser(self.newUser);
    }
    // self.currentUser = DataFactory.currentUser.list[0];
  };

  self.signIn = function () {
    console.log('self.user:', self.user);
    DataFactory.signIn(self.user.email, self.user.password);
  };


  self.resetPassword = function () {
    DataFactory.resetPassword(self.forgetfulUser.email);
  };

  // This code runs when the user logs out
  self.signOut = function () {
    DataFactory.signOut();
  };

  ////monitor statechange in controller or factory?

  auth.$onAuthStateChanged(function (firebaseUser) {
    self.userIsLoggedIn = firebaseUser !== null;
    self.userIsLoggedOut = firebaseUser === null;
  });
}]);
