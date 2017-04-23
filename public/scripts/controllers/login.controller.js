app.controller("LoginController", ["DataFactory", "$location", "$firebaseAuth", "$http", function (DataFactory, $location, $firebaseAuth, $http) {
  var auth = $firebaseAuth();
  var self = this;
  self.user = {};
  self.newUser = {};
  self.forgetfulUser = {};
  self.currentUser = DataFactory.currentUser;
  self.firebaseUser = {};
  auth.$onAuthStateChanged(function (firebaseUser) {
    console.log('resetting user login controller');

    self.userIsLoggedIn = firebaseUser !== null;
    self.userIsLoggedOut = firebaseUser === null;
  });


  self.createUser = function () {
    self.createUserError = null;
    DataFactory.createUser(self.newUser).then(function (response) {
      console.log('createUser res:', response);
      self.createUserError = response.message;
    });
    self.newUser = {};
  }

  self.signIn = function () {
    self.signInError = null;
    DataFactory.signIn(self.user.email, self.user.password).then(function (response) {
      if (response) {
        self.signInError = response.message;
        self.user = {};
      } else {
        self.user = {};
      }
    });
  }


  self.resetPassword = function () {
    self.resetError = null;
    self.resetSuccess = null;
    DataFactory.resetPassword(self.forgetfulUser.email).then(function (response) {
      if (response.error) {
        self.resetError = response.message;
      }
      else if (response.success) {
        self.resetSuccess = response.message;
        self.forgetfulUser = null;
      }

    });
  }

  // This code runs when the user logs out
  self.signOut = function () {
    DataFactory.signOut();
  }



}]);


////// TODO: handle self.userIsLoggedIn/Out for nav bar hide ////// --from: jonny--

