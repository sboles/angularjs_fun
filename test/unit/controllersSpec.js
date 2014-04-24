'use strict';

/* jasmine specs for controllers go here */
describe('controllers', function () {
    beforeEach(module('edp.controllers'));

    describe('DashboardCtrl', function () {
        var controller,
            scope = {};
        beforeEach(inject(function ($controller) {
            controller = $controller('DashboardCtrl', {
                '$scope': scope
            });
        }));
    });

    describe('LoginCtrl', function () {
        var controller,
            scope = {};
        beforeEach(inject(function ($controller) {
            controller = $controller('LoginCtrl', {
                '$scope': scope
            });
        }));

    });

    describe('LogoutCtrl', function () {
        var controller,
            scope = {};
        beforeEach(inject(function ($controller) {
            controller = $controller('LogoutCtrl', {
                '$scope': scope
            });
        }));

    });

});
