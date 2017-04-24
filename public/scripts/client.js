var app = angular.module('volunteerApp', ['ngRoute', 'firebase', 'ui.calendar', 'ui.bootstrap', 'ngAnimate', 'ngSanitize']);

app.config(['$routeProvider', function($routeProvider) {
  console.log('client.js route provider loaded');
  //routes
  $routeProvider
  .when ('/', {
    templateUrl: '/views/login.html',
    controller: 'LoginController',
    controllerAs: 'lc'
  })
  .when ('/home', {
    templateUrl: '/views/home.html',
    controller: 'HomeController',
    controllerAs: 'hc'
  })
  .when ('/calendar', {
    templateUrl: '/views/calendar.html',
    controller: 'CalendarController',
    controllerAs: 'cc'
  })
  .when ('/mySchedule', {
    templateUrl: '/views/my-schedule.html',
    controller: 'MyScheduleController',
    controllerAs: 'sc'
  })
  .otherwise ({
    redirectTo: '/'
  });
}]);
