(function () {
    'use strict';
    angular.module('app.controllers', []).controller('AppCtrl', [
        '$scope', '$rootScope', '$route', '$document', '$location', 'localStorageService', function ($scope, $rootScope, $route, $document, $location, localStorageService) {
            var $window, user;
            $window = $(window);
            $scope.main = {
                brand: 'Transform',
                name: 'Lisa Doe'
            };
            $scope.admin = {
                layout: 'wide',
                menu: 'vertical',
                fixedHeader: true,
                fixedSidebar: true
            };
            $scope.$watch('admin', function (newVal, oldVal) {
                if (newVal.menu === 'horizontal' && oldVal.menu === 'vertical') {
                    $rootScope.$broadcast('nav:reset');
                    return;
                }
                if (newVal.fixedHeader === false && newVal.fixedSidebar === true) {
                    if (oldVal.fixedHeader === false && oldVal.fixedSidebar === false) {
                        $scope.admin.fixedHeader = true;
                        $scope.admin.fixedSidebar = true;
                    }
                    if (oldVal.fixedHeader === true && oldVal.fixedSidebar === true) {
                        $scope.admin.fixedHeader = false;
                        $scope.admin.fixedSidebar = false;
                    }
                    return;
                }
                if (newVal.fixedSidebar === true) {
                    $scope.admin.fixedHeader = true;
                }
                if (newVal.fixedHeader === false) {
                    $scope.admin.fixedSidebar = false;
                }
            }, true);
            $scope.color = {
                primary: '#1BB7A0',
                success: '#94B758',
                info: '#56BDF1',
                infoAlt: '#7F6EC7',
                warning: '#F3C536',
                danger: '#FA7B58'
            };
            $rootScope.$on("$routeChangeSuccess", function (event, currentRoute, previousRoute) {
                return $document.scrollTo(0, 0);
            });


            user = localStorageService.cookie.get('user');
            $rootScope.user = user;
            var employerId = localStorageService.cookie.get('employerId');
            var positionId = localStorageService.cookie.get('positionId');
            $rootScope.employerId = employerId;
            $rootScope.positionId = positionId;
            if (!user || typeof user !== 'object') {
                $scope.isLogin = true;
                $rootScope.isLoggedIn = false;
            } else {
                $rootScope.isAdmin = false;
                if (user.user.roles.join().indexOf('ROLE_ADMIN')) {
                    $rootScope.isAdmin = true;
                }
                $scope.user = user;
                $scope.isLogin = false;
                $rootScope.isLoggedIn = true;
            }

            $rootScope.isNormalUser = false;
            if (user.user.roles.join().indexOf('ROLE_ADMIN') && user.user.roles.join().indexOf('ROLE_HR_ADMIN')) {
                $rootScope.isNormalUser = true;
            }


            //get permission group user
            var permissionUserGroup = localStorageService.cookie.get('permissionUserGroup');
            if (permissionUserGroup != undefined && permissionUserGroup.length) {
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
            } else {
                $rootScope.permissionUserGroup = {'VIEW': true, 'CREATE': true, 'EDIT': true, 'DELETE': true};
            }


            var permissionUser = localStorageService.cookie.get('permissionUser');
            if (permissionUser != undefined && permissionUser.length) {
                $rootScope.permissionUser = {'VIEW': false, 'CREATE': false, 'EDIT': false, 'DELETE': false};
                if (permissionUser.join().indexOf('OPERATE') > -1) {
                    $rootScope.permissionUser = {'VIEW': true, 'CREATE': true, 'EDIT': true, 'DELETE': true};
                } else {
                    if (permissionUser.join().indexOf('VIEW') > -1) {
                        $rootScope.permissionUser.VIEW = true;
                    }
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
            } else {
                $rootScope.permissionUser = {'VIEW': true, 'CREATE': true, 'EDIT': true, 'DELETE': true};
            }

            var permissionHandbook = localStorageService.cookie.get('permissionHandbook');
            if (permissionHandbook != undefined && permissionHandbook.length) {
                $rootScope.permissionHandbook = {'VIEW': false, 'CREATE': false, 'EDIT': false, 'DELETE': false};
                if (permissionHandbook.join().indexOf('OPERATE') > -1) {
                    $rootScope.permissionHandbook = {'VIEW': true, 'CREATE': true, 'EDIT': true, 'DELETE': true};
                } else {
                    if (permissionHandbook.join().indexOf('VIEW') > -1) {
                        $rootScope.permissionHandbook.VIEW = true;
                    }
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
            } else {
                $rootScope.permissionHandbook = {'VIEW': true, 'CREATE': true, 'EDIT': true, 'DELETE': true};
            }

            //end


        }
    ]).controller('HeaderCtrl', [
        '$scope', function ($scope) {
            return $scope.introOptions = {
                steps: [
                    {
                        element: '#step1',
                        intro: "<strong>Heads up!</strong> You can change the layout here",
                        position: 'bottom'
                    }, {
                        element: '#step2',
                        intro: "Select a different language",
                        position: 'right'
                    }, {
                        element: '#step3',
                        intro: "Runnable task App",
                        position: 'left'
                    }, {
                        element: '#step4',
                        intro: "Collapsed nav for both horizontal nav and vertical nav",
                        position: 'right'
                    }
                ]
            };
        }
    ]).controller('NavContainerCtrl', ['$scope', function ($scope) {
    }]).controller('NavCtrl', [
        '$scope', 'taskStorage', 'filterFilter', function ($scope, taskStorage, filterFilter) {
            var tasks;
            tasks = $scope.tasks = taskStorage.get();
            $scope.taskRemainingCount = filterFilter(tasks, {
                completed: false
            }).length;

            $scope.menu = 1;
            $scope.isActive = function (check) {
                return $scope.menu == check;
            };
            $scope.setActive = function (check) {
                $scope.menu = check;
            }
            return $scope.$on('taskRemaining:changed', function (event, count) {
                return $scope.taskRemainingCount = count;
            });


        }
    ]).controller('DashboardCtrl', ['$scope', function ($scope) {
    }]);

}).call(this);
