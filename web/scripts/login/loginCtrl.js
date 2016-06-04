(function() {
  'use strict';
  angular.module('app.login', []).controller('loginCtrl', [
    '$scope', 'aREST', 'config', 'localStorageService', '$location', '$route', '$rootScope', function($scope, aREST, config, localStorageService, $location, $route, $rootScope) {
      $scope.username = "";
      $scope.password = "";
      $rootScope.isLoggedIn = false;
      $rootScope.employerId = null;
      localStorageService.cookie.remove('user');
      return $scope.doLogin = function() {
        return aREST.get($scope.username, $scope.password, config.path.baseURL + "/system").then(function(system) {
          if (typeof system !== 'object' || system.status !== 200) {
            return;
          }
          if (system.data._links.logged_in_user) {
            return aREST.get($scope.username, $scope.password, config.path.baseURL + system.data._links.logged_in_user.href).then(function(res) {
              if (typeof res !== 'object' || res.status !== 200  || res.data.roles[0] == "") {
                return;
              }
              localStorageService.cookie.set('user', {
                user: res.data
              }, 1);
              $rootScope.user = localStorageService.cookie.get('user');
              $rootScope.isLoggedIn = true;
              $scope.roles = res.data.roles;

              if ($scope.roles.indexOf('ROLE_ADMIN') >= 0 ) {
                $location.path('/clients');
                $rootScope.isAdmin = true;
                return $route.reload();
              }else {
                return aREST.get($scope.username, $scope.password, config.path.baseURL + system.data._links.logged_in_position.href).then(function (position) {
                  $rootScope.positionId = position.data.id;
                  localStorageService.cookie.set('positionId', position.data.id, 1);
                  return aREST.get($scope.username, $scope.password, position.data._links.employer.href).then(function (employer) {
                    $rootScope.employerId = employer.data.id;
                    localStorageService.cookie.set('employerId', employer.data.id, 1);

                    $location.path('/clients/' + employer.data.id + '/info');
                    $rootScope.isAdmin = false;
                    return $route.reload();
                  });
                });
              }
            }, function(error) {
              return alert(error.status + ': Error, refresh & try again !');
            });
          }
        }, function(error) {
          return alert(error.status + ': Error, refresh & try again !');
        });
      };
    }
  ]).controller('logoutCtrl', [
    '$scope', '$location', 'localStorageService', '$http', '$route', '$rootScope', function($scope, $location, localStorageService, $http, $route, $rootScope) {
      localStorageService.cookie.remove('user');
      delete $http.defaults.headers.common['x-session'];
      $rootScope.isLoggedIn = false;
      $location.path('/login');
      return $route.reload();
    }
  ]);

}).call(this);
