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
              if (typeof res !== 'object' || res.status !== 200) {
                return;
              }
              localStorageService.cookie.set('user', {
                user: res.data
              }, 1);
              $rootScope.user = localStorageService.cookie.get('user');
              $rootScope.isLoggedIn = true;
              $scope.roles = res.data.roles;

              if ($scope.roles.join().indexOf('ROLE_ADMIN') >= 0 ) {
                $location.path('/clients');
                $rootScope.isAdmin = true;
                $rootScope.isNormalUser = false;
                $rootScope.permissionUserGroup = {'VIEW': true, 'CREATE': true, 'EDIT': true, 'DELETE': true};
                $rootScope.permissionUser = {'VIEW': true, 'CREATE': true, 'EDIT': true, 'DELETE': true};
                $rootScope.permissionHandbook = {'VIEW': true, 'CREATE': true, 'EDIT': true, 'DELETE': true};
                return $route.reload();
              }else {
                $rootScope.isNormalUser = true;
                if($scope.roles.join().indexOf('ROLE_HR_ADMIN') > -1)
                {
                  $rootScope.isNormalUser = false;
                }
                return aREST.get($scope.username, $scope.password, config.path.baseURL + system.data._links.logged_in_position.href).then(function (position) {
                  $rootScope.positionId = position.data.id;
                  localStorageService.cookie.set('positionId', position.data.id, 1);
                  return aREST.get($scope.username, $scope.password, position.data._links.employer.href).then(function (employer) {
                    $rootScope.employerId = employer.data.id;
                    localStorageService.cookie.set('employerId', employer.data.id, 1);
                    localStorageService.cookie.set('permissionUserGroup', employer.data._links.user_groups.actions, 1);
                    localStorageService.cookie.set('permissionUser', employer.data._links.positions.actions, 1);
                    localStorageService.cookie.set('permissionHandbook', employer.data._links.handbooks.actions, 1);


                    var permissionUserGroup = employer.data._links.user_groups.actions;
                    if (permissionUserGroup != undefined) {
                      $rootScope.permissionUserGroup = {'VIEW': false, 'CREATE': false, 'EDIT': false, 'DELETE': false};
                      if (permissionUserGroup.join().indexOf('OPERATE') > -1) {
                        $rootScope.permissionUserGroup = {'VIEW': true, 'CREATE': true, 'EDIT': true, 'DELETE': true};
                      } else {
                        if (permissionUserGroup.join().indexOf('VIEW') > -1) {
                          $rootScope.permissionUserGroup.VIEW = true;
                        }
                        if (permissionUserGroup.join().indexOf('CREATE') > -1) {
                          $rootScope.permissionUserGroup.CREATE = true;
                        }
                        if (permissionUserGroup.join().indexOf('EDIT') > -1) {
                          $rootScope.permissionUserGroup.EDIT = true;
                        }
                        if (permissionUserGroup.join().indexOf('DELETE') > -1) {
                          $rootScope.permissionUserGroup.DELETE = true;
                        }
                      }
                    }


                    var permissionUser = employer.data._links.positions.actions;
                    if (permissionUser != undefined) {
                      $rootScope.permissionUser = {'VIEW': false, 'CREATE': false, 'EDIT': false, 'DELETE': false};
                      if (permissionUser.join().indexOf('OPERATE') > -1) {
                        $rootScope.permissionUser = {'VIEW': true, 'CREATE': true, 'EDIT': true, 'DELETE': true};
                      } else {
                        if (permissionUser.join().indexOf('CREATE') > -1) {
                          $rootScope.permissionUser.CREATE = true;
                        }
                        if (permissionUser.join().indexOf('EDIT') > -1) {
                          $rootScope.permissionUser.EDIT = true;
                        }
                        if (permissionUser.join().indexOf('DELETE') > -1) {
                          $rootScope.permissionUser.DELETE = true;
                        }
                      }
                    }
                    var permissionHandbook = employer.data._links.handbooks.actions;
                    if (permissionHandbook != undefined) {
                      $rootScope.permissionHandbook = {'VIEW': false, 'CREATE': false, 'EDIT': false, 'DELETE': false};
                      if (permissionHandbook.join().indexOf('OPERATE') > -1) {
                        $rootScope.permissionHandbook = {'VIEW': true, 'CREATE': true, 'EDIT': true, 'DELETE': true};
                      } else {
                        if (permissionHandbook.join().indexOf('CREATE') > -1) {
                          $rootScope.permissionHandbook.CREATE = true;
                        }
                        if (permissionHandbook.join().indexOf('EDIT') > -1) {
                          $rootScope.permissionHandbook.EDIT = true;
                        }
                        if (permissionHandbook.join().indexOf('DELETE') > -1) {
                          $rootScope.permissionHandbook.DELETE = true;
                        }
                        if (permissionHandbook.join().indexOf('VISIBILITY') > -1) {
                          $rootScope.permissionHandbook.VISIBILITY = true;
                        }
                      }
                    }

                    if($rootScope.isNormalUser == true)
                    {
                      $location.path('/clients/' + employer.data.id + '/categories/handbooks');
                    } else {
                      $location.path('/clients/' + employer.data.id + '/info');
                    }
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
      localStorageService.cookie.remove('permissionHandbook');
      localStorageService.cookie.remove('permissionUserGroup');
      localStorageService.cookie.remove('permissionUser');
      localStorageService.cookie.remove('employerId');
      localStorageService.cookie.remove('positionId');
      delete $http.defaults.headers.common['x-session'];
      $rootScope.isLoggedIn = false;
      $location.path('/login');
      return $route.reload();
    }
  ]);

}).call(this);
