app.controller("LoginController", ["DataFactory", "$location", "$firebaseAuth", "$http", function (DataFactory, $location, $firebaseAuth, $http) {
  var auth = $firebaseAuth();
  var self = this;
  self.user = {};
  self.newUser = {};
  self.forgetfulUser = {};


  // This code runs whenever the user logs in
  self.createUser = function () {
    console.log('self.newUser:', self.newUser);

    auth.$createUserWithEmailAndPassword(self.newUser.email, self.newUser.password)
      .then(function (firebaseUser) {
        console.log('firebaseUser:', firebaseUser);
        // todo: SQL add user with self.names
        DataFactory.addUser(self.newUser);
        self.newUser = {};

        self.message = "User created with uid: " + firebaseUser.uid;
        console.log("Firebase Authenticated as: ", firebaseUser.newUser.email);
        $location.path('/home');
      }).catch(function (error) {
        self.error = error;
      });
  };

  self.signIn = function () {
    console.log('self.user:', self.user);

    auth.$signInWithEmailAndPassword(self.user.email, self.user.password)
      .then(function (firebaseUser) {
        console.log('firebaseUser:', firebaseUser);
        // todo: SQL add user with self.names
        self.message = "User created with uid: " + firebaseUser.uid;
        console.log("Firebase Authenticated as: ", firebaseUser.email);
        $location.path('/home');
      }).catch(function (error) {
        self.error = error;
      });
  };

  self.resetPassword = function () {
    auth.$sendPasswordResetEmail(self.forgetfulUser.email).then(function () {
      console.log("Password reset email sent successfully!");
    }).catch(function (error) {
      console.error("Error: ", error);
    });
  };

  // This code runs when the user logs out
  self.signOut = function () {
    auth.$signOut().then(function () {
      console.log('Logging the user out!');
      $location.path('/');
    });
  };

  auth.$onAuthStateChanged(function (firebaseUser) {
    self.userIsLoggedIn = firebaseUser !== null;
    self.userIsLoggedOut = firebaseUser === null;
  });
}]);
