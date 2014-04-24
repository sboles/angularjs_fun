'use strict';

// Declare app level module which depends on filters, and services
var edp = angular.module('edp', ['ngRoute', 'edp.filters', 'edp.services', 'edp.directives', 'edp.controllers']).
    config(['$routeProvider', function ($routeProvider) {
        $routeProvider.when('/t/:type/list', {templateUrl: 'partials/list.html', controller: 'ListCtrl'});
        $routeProvider.when('/dashboard', {templateUrl: 'partials/dashboard.html', controller: 'DashboardCtrl'});
        $routeProvider.when('/login', {templateUrl: 'partials/login.html', controller: 'LoginCtrl'});
        $routeProvider.when('/logout', {templateUrl: 'partials/logout.html', controller: 'LogoutCtrl'});
        $routeProvider.otherwise({redirectTo: '/dashboard'});
    }]);

edp.run(function ($rootScope, $location, UserService) {

    // enumerate routes that don't need authentication
    var routesThatDontRequireAuth = ['/login', '/logout'];

    // check if current location matches route
    var routeClean = function (route) {
        return _.find(routesThatDontRequireAuth,
            function (noAuthRoute) {
                return route.indexOf(noAuthRoute) == 0;
            });
    };

    $rootScope.$on('$routeChangeStart', function (event, next, current) {
        // if route requires auth and user is not logged in
        UserService.isLoggedIn().then(function(isLoggedIn) {
            if (!routeClean($location.url()) && !isLoggedIn) {
                // redirect back to login
                $location.path('/login');
            }
        })
    });
});