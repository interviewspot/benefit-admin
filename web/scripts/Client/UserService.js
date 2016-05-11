(function() {
  'use strict';
  angular.module('app.users.services', []).factory('UserService', function($resource, config) {
    var service;
    service = $resource(config.path.baseURL + config.path.contacts, {}, {
      query: {
        method: "GET",
        action: config.path.baseURL + config.path.contacts,
        isArray: true
      },
      update: {
        method: "PUT",
        action: config.path.contact
      },
      save: {
        method: "POST",
        action: config.path.baseURL + config.path.contacts
      }
    });
    return service;
  }).factory('Users', [
    '$http', '$q', '$resource', function($http, $q, $resource) {
      return {
        get: function(url) {
          var d;
          d = $q.defer();
          $http({
            method: 'GET',
            url: url
          }).then(function(res) {
            d.resolve(res);
          }, function(error) {
            d.reject(error);
          });
          return d.promise;
        },
        post: function(url, data) {
          var d;
          d = $q.defer();
          $http({
            method: 'POST',
            url: url,
            data: data
          }).then(function(res) {
            d.resolve(res);
          }, function(error) {
            d.reject(error);
          });
          return d.promise;
        },
        put: function(url, data) {
          var d;
          d = $q.defer();
          $http({
            method: 'PUT',
            url: url,
            data: data
          }).then(function(res) {
            d.resolve(res);
          }, function(error) {
            d.reject(error);
          });
          return d.promise;
        },
        "delete": function(url) {
          var d;
          d = $q.defer();
          $http({
            method: 'DELETE',
            url: url
          }).then(function(res) {
            d.resolve(res);
          }, function(error) {
            d.reject(error);
          });
          return d.promise;
        }
      };
    }
  ]).factory('aREST', [
    '$http', '$q', '$resource', function($http, $q, $resource) {
      return {
        get: function(username, password, url) {
          var d;
          d = $q.defer();
          $http({
            method: 'GET',
            url: url,
            headers: {
              'x-username': username,
              'x-password': password
            }
          }).then(function(res) {
            d.resolve(res);
          }, function(error) {
            d.reject(error);
          });
          return d.promise;
        },
        post: function(username, password, url, data) {
          var d;
          d = $q.defer();
          $http({
            method: 'POST',
            url: url,
            data: data,
            headers: {
              'x-username': username,
              'x-password': password
            }
          }).then(function(res) {
            d.resolve(res);
          }, function(error) {
            d.reject(error);
          });
          return d.promise;
        },
        put: function(username, password, url, data) {
          var d;
          d = $q.defer();
          $http({
            method: 'PUT',
            url: url,
            data: data,
            headers: {
              'x-username': username,
              'x-password': password
            }
          }).then(function(res) {
            console.log(res);
            d.resolve(res);
          }, function(error) {
            d.reject(error);
          });
          return d.promise;
        },
        "delete": function(args, url) {
          var d;
          d = $q.defer();
          $http({
            method: 'DELETE',
            url: url,
            headers: {
              'x-username': username,
              'x-password': password
            }
          }).then(function(res) {
            d.resolve(res);
          }, function(error) {
            d.reject(error);
          });
          return d.promise;
        }
      };
    }
  ]).factory('gREST', [
    '$http', '$q', '$resource', function($http, $q, $resource) {
      return {
        get: function(session, url) {
          var d;
          d = $q.defer();
          $http({
            method: 'GET',
            url: url,
            headers: {
              'x-session': session
            }
          }).then(function(res) {
            d.resolve(res);
          }, function(error) {
            d.reject(error);
          });
          return d.promise;
        },
        post: function(session, url, data) {
          var d;
          d = $q.defer();
          $http({
            method: 'POST',
            url: url,
            data: data,
            headers: {
              'x-session': session
            }
          }).then(function(res) {
            d.resolve(res);
          }, function(error) {
            d.reject(error);
          });
          return d.promise;
        },
        put: function(session, url, data) {
          var d;
          d = $q.defer();
          $http({
            method: 'PUT',
            url: url,
            data: data,
            headers: {
              'x-session': session
            }
          }).then(function(res) {
            console.log(res);
            d.resolve(res);
          }, function(error) {
            d.reject(error);
          });
          return d.promise;
        },
        "delete": function(session, url) {
          var d;
          d = $q.defer();
          $http({
            method: 'DELETE',
            url: url,
            headers: {
              'x-session': session
            }
          }).then(function(res) {
            d.resolve(res);
          }, function(error) {
            d.reject(error);
          });
          return d.promise;
        }
      };
    }
  ]).factory('authHandler', [
    '$http', '$q', '$resource', 'localStorageService', '$location', '$route', function($http, $q, $resource, localStorageService, $location, $route) {
      return {
        checkLoggedIn: function() {
          var user;
          user = localStorageService.cookie.get('user');
          console.log(user);
          if (!user || typeof user !== 'object') {
            delete $http.defaults.headers.common['x-session'];
            $location.path('/login');
            return $route.reload();
          } else {
            delete $http.defaults.headers.common['x-username'];
            delete $http.defaults.headers.common['x-password'];
            return $http.defaults.headers.common['x-session'] = user.user.session_key;
          }
        }
      };
    }
  ]).directive('sheetParser', [
    '$timeout', function($timeout) {
      var controller, link, sheet_to_custom_json;
      controller = [
        '$scope', function($scope) {
          var firstRun;
          $scope.fileName = 'No file selected';
          $scope.uniqueID = new Date().getTime();
          firstRun = true;
          return $scope.$watch('parsedJson', function(nv) {
            if (firstRun) {
              firstRun = false;
              return;
            }
            if (!nv) {
              return $scope.result = {
                status: 'error',
                message: "Unsuported sheet type or couldn't read sheet"
              };
            } else {
              return $scope.result = {
                status: 'OK',
                data: $scope.parsedJson
              };
            }
          });
        }
      ];
      link = function(scope, ele, attr) {
        var files, inputFile, workbook;
        inputFile = $(ele.find('input'));
        files = [];
        workbook = {};
        return inputFile.on('change', function(e) {
          var f, fileName, isValid, name, reader;
          if (this.files && this.files.length > 1) {
            scope.fileName = (this.getAttribute('data-multiple-caption') || '').replace('{count}', this.files.length);
          } else {
            scope.fileName = e.target.value.split('\\').pop();
          }
          if (scope.fileName) {
            scope.label = scope.fileName;
          } else {
            scope.label = 'No file selected';
          }
          files = e.target.files;
          f = files[0];
          fileName = f.name.split('.')[f.name.split.length - 1];
          isValid = fileName === 'csv' || fileName === 'xls' || fileName === 'xlsx' ? true : false;
          if (isValid) {
            reader = new FileReader();
            name = f.name;
            reader.onload = function(e) {
              var data, first_sheet_name, json, worksheet;
              data = e.target.result;
              workbook = XLSX.read(data, {
                type: 'binary'
              });
              first_sheet_name = workbook.SheetNames[0];
              worksheet = workbook.Sheets[first_sheet_name];
              json = sheet_to_custom_json(worksheet);
              data = {
                name: name,
                json: json
              };
              return scope.parsedJson = data;
            };
            return reader.readAsBinaryString(f);
          } else {
            return scope.parsedJson = false;
          }
        });
      };
      sheet_to_custom_json = function(sheet) {
        var firstCol, secondCol, status, tempCell, tempObj;
        firstCol = [];
        secondCol = [];
        tempCell = {};
        tempObj = {};
        status = '';
        angular.forEach(sheet, function(cell, key) {
          if (key.split('A').length > 1) {
            tempCell = {
              id: key,
              value: cell.v
            };
            return firstCol.push(tempCell);
          } else if (key.split('B').length > 1) {
            tempCell = {
              id: key,
              value: cell.v
            };
            return secondCol.push(tempCell);
          } else {
            return status = 'Invalid format';
          }
        });
        angular.forEach(firstCol, function(value, index) {
          if (secondCol[index] && secondCol[index].value && firstCol[index].id.split('A')[1] === secondCol[index].id.split('B')[1]) {
            return tempObj[value.value] = secondCol[index].value;
          }
        });
        return tempObj;
      };
      return {
        restrict: 'E',
        scope: {
          result: '=ngResult'
        },
        templateUrl: 'views/directives/uploadExcel.html',
        controller: controller,
        link: link
      };
    }
  ]);

}).call(this);
