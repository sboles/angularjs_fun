'use strict';

/* https://github.com/angular/protractor/blob/master/docs/getting-started.md */

describe('my app', function () {

    browser.get('index.html');

    it('should automatically redirect to /login when location hash/fragment is empty', function () {
        expect(browser.getLocationAbsUrl()).toMatch("/login");
    });


    describe('login', function () {

        beforeEach(function () {
            browser.get('index.html#/login');
        });


        it('should render login when user navigates to /login', function () {
            expect(element(by.css('legend')).getText()).
                toMatch(/Login/);
        });

    });

    describe('authenticated', function () {

        beforeEach(function () {
            browser.get('index.html#/login');
            element(by.model('user.username')).sendKeys('admin@ee.com');
            element(by.model('user.password')).sendKeys('Password');
            // element('button').click();
            expect(browser.getLocationAbsUrl()).toMatch("/dashboard");
        });

        describe('empty hash redirects to dashboard', function () {

            beforeEach(function () {
                browser.get('index.html#');
            });

            it('should automatically redirect to /dashboard when location hash/fragment is empty', function () {
                expect(browser.getLocationAbsUrl()).toMatch("/dashboard");
            });

        });

        describe('refresh stays authenticated', function () {

            beforeEach(function () {
                browser.get('index.html#');
            });

            it('should stay authenticated on a browser refresh', function () {
                expect(browser.getLocationAbsUrl()).toMatch("/dashboard");
                browser.get('index.html#');
                expect(browser.getLocationAbsUrl()).toMatch("/dashboard");
            });

        });

    });

});
