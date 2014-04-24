'use strict';

/* jasmine specs for services go here */
describe('service', function () {
    beforeEach(module('edp.services'));

    describe('Base64', function () {
        it('should Base64 encode a string', inject(function (Base64) {
            expect(Base64.encode('Man')).toBe('TWFu'); // http://en.wikipedia.org/wiki/Base64#Examples
        }));

        it('should Base64 decode a string', inject(function (Base64) {
            expect(Base64.decode('TWFu')).toBe('Man'); // http://en.wikipedia.org/wiki/Base64#Examples
        }));
    });

    describe('Auth', function () {
        it('should set credentials for the http authentication header', inject(function (Auth, $http) {
            Auth.setCredentials('foo', 'bar');
            expect($http.defaults.headers.common.Authorization.split(' ')[1]).toBeDefined();
        }));
        it('should clear credentials from the cookie store', inject(function (Auth, $http) {
            Auth.setCredentials('foo', 'bar');
            expect($http.defaults.headers.common.Authorization.split(' ')[1]).toBeDefined();
            Auth.clearCredentials();
            expect($http.defaults.headers.common.Authorization.split(' ')[1]).toBe('');
        }));
        it('should put credentials into a cookie store', inject(function (Auth, $cookieStore) {
            Auth.setCredentials('foo', 'bar');
            expect($cookieStore.get(Auth.COOKIE_KEY)).toBeDefined();
        }));
        it('should clear credentials from the cookie store', inject(function (Auth, $cookieStore) {
            Auth.setCredentials('foo', 'bar');
            expect($cookieStore.get(Auth.COOKIE_KEY)).toBeDefined();
            Auth.clearCredentials();
            expect($cookieStore.get(Auth.COOKIE_KEY)).toBeUndefined();
        }));
    });

    describe('UserService', function () {
        var $httpBackend;
        beforeEach(inject(function (_$httpBackend_) {
            $httpBackend = _$httpBackend_;
        }));
        it('should respond false if user is not logged in', inject(function (UserService) {
            $httpBackend.expectGET().respond(401, '');
            UserService.isLoggedIn().then(function(isLoggedIn) {
                expect(isLoggedIn).toBeFalsy();
            });
            $httpBackend.flush();
        }));
        it('should login a valid user', inject(function (UserService) {
            $httpBackend.expectGET().respond({});
            UserService.login('username', 'password').then(function(isLoggedIn) {
                expect(isLoggedIn).toBeTruthy();
            });
            $httpBackend.flush();
        }));
        it('should not login an invalid user', inject(function (UserService) {
            $httpBackend.expectGET().respond(401, '');
            UserService.login('username', 'password').then(function(isLoggedIn) {
                expect(isLoggedIn).toBeFalsy();
            });
            $httpBackend.flush();
        }));
        it('should clear credentials', inject(function(UserService) {
            UserService.logout();
        }));
    });

    describe('RallyClientService', function () {
        var $httpBackend;
        beforeEach(inject(function (_$httpBackend_) {
            $httpBackend = _$httpBackend_;
        }));
        it('should return a list of stories', inject(function (RallyClientService) {
            $httpBackend.expectGET().respond(
                {"QueryResult": {"_rallyAPIMajor": "2", "_rallyAPIMinor": "0", "Errors": [], "Warnings": [], "TotalResultCount": 1, "StartIndex": 1, "PageSize": 20, "Results": [
                    {"_rallyAPIMajor": "2", "_rallyAPIMinor": "0", "_ref": "http://localhost:7001/slm/webservice/v2.0/hierarchicalrequirement/16206", "_refObjectName": "US1", "_type": "HierarchicalRequirement"}
                ]}});
            RallyClientService.listForType('hierarchicalrequirement').then(function (response) {
                expect(response).toBeTruthy();
                expect(response.getStartIndex()).toBe(1);
                expect(response.getPageSize()).toBe(20);
                expect(response.getTotalCount()).toBe(1);
                expect(response.getErrors().length).toBe(0);
                expect(response.getWarnings().length).toBe(0);
                expect(response.getResults().length).toBe(1);
                expect(response.getResults().length).toEqual(response.getTotalCount());
            });
            $httpBackend.flush();
        }));
        it('should return a valid object on error', inject(function (RallyClientService) {
            $httpBackend.expectGET().respond(500, '');
            RallyClientService.listForType('hierarchicalrequirement').then(function (response) {
                expect(response).toBeTruthy();
                expect(response.getErrors().length).toBe(1);
                expect(response.getResults().length).toBe(0);
            });
            $httpBackend.flush();
        }));
        it('should return all stories', inject(function(RallyClientService) {
            $httpBackend.expectGET().respond(
                {"QueryResult": {"_rallyAPIMajor": "2", "_rallyAPIMinor": "0", "Errors": [], "Warnings": [], "TotalResultCount": 4, "StartIndex": 1, "PageSize": 2, "Results": [
                    {"_rallyAPIMajor": "2", "_rallyAPIMinor": "0", "_ref": "http://localhost:7001/slm/webservice/v2.0/hierarchicalrequirement/16206", "_refObjectName": "US1", "_type": "HierarchicalRequirement"},
                    {"_rallyAPIMajor": "2", "_rallyAPIMinor": "0", "_ref": "http://localhost:7001/slm/webservice/v2.0/hierarchicalrequirement/16206", "_refObjectName": "US1", "_type": "HierarchicalRequirement"}
                ]}});
            $httpBackend.expectGET().respond(
                {"QueryResult": {"_rallyAPIMajor": "2", "_rallyAPIMinor": "0", "Errors": [], "Warnings": [], "TotalResultCount": 4, "StartIndex": 3, "PageSize": 2, "Results": [
                    {"_rallyAPIMajor": "2", "_rallyAPIMinor": "0", "_ref": "http://localhost:7001/slm/webservice/v2.0/hierarchicalrequirement/16207", "_refObjectName": "US2", "_type": "HierarchicalRequirement"},
                    {"_rallyAPIMajor": "2", "_rallyAPIMinor": "0", "_ref": "http://localhost:7001/slm/webservice/v2.0/hierarchicalrequirement/16206", "_refObjectName": "US1", "_type": "HierarchicalRequirement"}
                ]}});
            RallyClientService.listAllForType('hierarchicalrequirement').then(function (response) {
                expect(response).toBeTruthy();
                expect(response.getStartIndex()).toBe(1);
                expect(response.getPageSize()).toBe(4);
                expect(response.getTotalCount()).toBe(4);
                expect(response.getErrors().length).toBe(0);
                expect(response.getWarnings().length).toBe(0);
                expect(response.getResults().length).toBe(4);
                expect(response.getResults().length).toEqual(response.getTotalCount());
            });
            $httpBackend.flush();
        }));
    });

    describe('PropertyService', function() {
        it('should return a property for ALM WSAPI baseURL', inject(function(PropertyService) {
            expect(PropertyService.almBaseURL()).toBe('http://localhost:7001');
        }));
    });

});
