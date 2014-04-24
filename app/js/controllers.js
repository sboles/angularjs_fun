'use strict';

/* Controllers */
var controllers = angular.module('edp.controllers', []);
controllers.controller('DashboardCtrl', ['$scope', 'RallyClientService', function ($scope, RallyClientService) {
    RallyClientService.listAllForType('typedefinition').then(function (response) {
        $scope.errors = response.getErrors();
        $scope.typeData = _.map(response.getResults(), function (result) {
            return {
                shortName: result._refObjectName.replace(/\s+/g, '').toLowerCase(),
                name: result._refObjectName
            };
        });
    });
}]);

controllers.controller('ListCtrl', ['$scope', '$routeParams', 'RallyClientService', function ($scope, $routeParams, RallyClientService) {
    RallyClientService.listForType($routeParams.type).then(function (response) {
        $scope.errors = response.getErrors();
        $scope.list = _.map(response.getResults(), function (result) {
            return {
                name: result._refObjectName
            };
        });
    });
}]);

controllers.controller('LoginCtrl', ['$scope', 'UserService', '$location', function ($scope, UserService, $location) {
    $scope.login = function (username, password) {
        UserService.login(username, password).then(function (isLoggedIn) {
            if (isLoggedIn) {
                $location.path('/dashboard');
            } else {
                $scope.flare = 'Login Failed';
            }
        });
    };
}]);

controllers.controller('LogoutCtrl', ['$scope', 'UserService', '$location', function ($scope, UserService, $location) {
    UserService.logout();
    $location.path('/login');
}]);