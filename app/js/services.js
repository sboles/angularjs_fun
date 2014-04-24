'use strict';

/* Services */
var services = angular.module('edp.services', ['ngCookies']);

services.factory('Base64', function () {
    var keyStr = 'ABCDEFGHIJKLMNOP' +
        'QRSTUVWXYZabcdef' +
        'ghijklmnopqrstuv' +
        'wxyz0123456789+/' +
        '=';
    return {
        encode: function (input) {
            var output = "";
            var chr1, chr2, chr3 = "";
            var enc1, enc2, enc3, enc4 = "";
            var i = 0;

            do {
                chr1 = input.charCodeAt(i++);
                chr2 = input.charCodeAt(i++);
                chr3 = input.charCodeAt(i++);

                enc1 = chr1 >> 2;
                enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
                enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
                enc4 = chr3 & 63;

                if (isNaN(chr2)) {
                    enc3 = enc4 = 64;
                } else if (isNaN(chr3)) {
                    enc4 = 64;
                }

                output = output +
                    keyStr.charAt(enc1) +
                    keyStr.charAt(enc2) +
                    keyStr.charAt(enc3) +
                    keyStr.charAt(enc4);
                chr1 = chr2 = chr3 = "";
                enc1 = enc2 = enc3 = enc4 = "";
            } while (i < input.length);

            return output;
        },

        decode: function (input) {
            var output = "";
            var chr1, chr2, chr3 = "";
            var enc1, enc2, enc3, enc4 = "";
            var i = 0;

            // remove all characters that are not A-Z, a-z, 0-9, +, /, or =
            var base64test = /[^A-Za-z0-9\+\/\=]/g;
            if (base64test.exec(input)) {
                alert("There were invalid base64 characters in the input text.\n" +
                    "Valid base64 characters are A-Z, a-z, 0-9, '+', '/',and '='\n" +
                    "Expect errors in decoding.");
            }
            input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");

            do {
                enc1 = keyStr.indexOf(input.charAt(i++));
                enc2 = keyStr.indexOf(input.charAt(i++));
                enc3 = keyStr.indexOf(input.charAt(i++));
                enc4 = keyStr.indexOf(input.charAt(i++));

                chr1 = (enc1 << 2) | (enc2 >> 4);
                chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
                chr3 = ((enc3 & 3) << 6) | enc4;

                output = output + String.fromCharCode(chr1);

                if (enc3 != 64) {
                    output = output + String.fromCharCode(chr2);
                }
                if (enc4 != 64) {
                    output = output + String.fromCharCode(chr3);
                }

                chr1 = chr2 = chr3 = "";
                enc1 = enc2 = enc3 = enc4 = "";

            } while (i < input.length);

            return output;
        }
    };
});

services.factory('Auth', ['Base64', '$cookieStore', '$http', function (Base64, $cookieStore, $http) {
    // initialize to whatever is in the cookie, if anything
    $http.defaults.headers.common['Authorization'] = 'Basic ' + $cookieStore.get('authdata');

    return {
        COOKIE_KEY: 'authdata',
        setCredentials: function (username, password) {
            var encoded = Base64.encode(username + ':' + password);
            $http.defaults.headers.common.Authorization = 'Basic ' + encoded;
            $cookieStore.put(this.COOKIE_KEY, encoded);
        },
        clearCredentials: function () {
            document.execCommand("ClearAuthenticationCache");
            $cookieStore.remove(this.COOKIE_KEY);
            $http.defaults.headers.common.Authorization = 'Basic ';
        }
    };
}]);

services.factory('UserService', ['Auth', 'PropertyService', '$http', function (Auth, PropertyService, $http) {
    var _authenticate = function () {
        var authenticationURL = PropertyService.almBaseURL() + '/slm/webservice/v2.0/security/authorize';
        return $http.get(authenticationURL).
            then(function () {
                return true;
            }, function () {
                return false;
            });
    };
    return {
        isLoggedIn: function () {
            return _authenticate();
        },
        login: function (username, password) {
            Auth.setCredentials(username, password);
            return _authenticate();
        },
        logout: function () {
            Auth.clearCredentials();
        }
    };
}]);

services.factory('RallyClientService', ['PropertyService', '$http', function (PropertyService, $http) {
    var urlForType = function (type, startIndex) {
            startIndex = startIndex || 1;
            return PropertyService.almBaseURL() + '/slm/webservice/v2.0/' + type + "?query" + "&fetch=true" + "&start=" + startIndex;
        },
        success = function (response) {
            return {
                getStartIndex: function () {
                    return response.data.QueryResult.StartIndex;
                },
                getPageSize: function () {
                    return response.data.QueryResult.PageSize;
                },
                getTotalCount: function () {
                    return response.data.QueryResult.TotalResultCount;
                },
                getErrors: function () {
                    return response.data.QueryResult.Errors;
                },
                getWarnings: function () {
                    return response.data.QueryResult.Warnings;
                },
                getResults: function () {
                    return response.data.QueryResult.Results;
                }
            };
        },
        failure = function (response) {
            return {
                getErrors: function () {
                    return ["serviceError"];
                },
                getResults: function () {
                    return [];
                }
            };
        };
    return {
        listForType: function (type, startIndex) {
            return $http.get(urlForType(type, startIndex)).then(success, failure);
        },
        listAllForType: function (type) {
            var self = this,
                fetchAll = function (allResults, type, startIndex) {
                    return self.listForType(type, startIndex).then(function (response) {
                        allResults.push(response);
                        if (response.getTotalCount() > response.getStartIndex() + response.getPageSize()) {
                            return fetchAll(allResults, type, response.getStartIndex() + response.getPageSize());
                        }
                        return {
                            getStartIndex: function () {
                                return 1;
                            },
                            getPageSize: function () {
                                return this.getTotalCount();
                            },
                            getTotalCount: function () {
                                return _.reduce(allResults, function(memo, result) {
                                    return memo + result.getResults().length;
                                }, 0);
                            },
                            getErrors: function () {
                                return  _.chain(allResults).map(function(result) {
                                    return result.getErrors();
                                }).flatten().value();
                            },
                            getWarnings: function () {
                                return  _.chain(allResults).map(function(result) {
                                    return result.getWarnings();
                                }).flatten().value();
                            },
                            getResults: function () {
                                return  _.chain(allResults).map(function(result) {
                                    return result.getResults();
                                }).flatten().value();
                            }
                        };
                    });
                };
            return fetchAll([], type, 1);
        }
    }
}]);

services.factory('PropertyService', [function () {
    return {
        almBaseURL: function () {
            return 'http://localhost:7001';
        }
    };
}]);
