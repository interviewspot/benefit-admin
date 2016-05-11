(function() {
  'use strict';
  angular.module('app.controllers', []).controller('AppCtrl', [
    '$scope', '$rootScope', '$route', '$document', '$location', 'localStorageService', function($scope, $rootScope, $route, $document, $location, localStorageService) {
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
      $scope.$watch('admin', function(newVal, oldVal) {
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
      $rootScope.$on("$routeChangeSuccess", function(event, currentRoute, previousRoute) {
        return $document.scrollTo(0, 0);
      });
      console.log($location.path());
      user = localStorageService.cookie.get('user');
      if (!user || typeof user !== 'object') {
        $scope.isLogin = true;
        return $rootScope.isLoggedIn = false;
      } else {
        $rootScope.isAdmin = false;
        if (user.user.roles[0] === 'ROLE_ADMIN') {
          $rootScope.isAdmin = true;
        }
        $scope.user = user;
        $scope.isLogin = false;
        return $rootScope.isLoggedIn = true;
      }
    }
  ]).controller('HeaderCtrl', [
    '$scope', function($scope) {
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
  ]).controller('NavContainerCtrl', ['$scope', function($scope) {}]).controller('NavCtrl', [
    '$scope', 'taskStorage', 'filterFilter', function($scope, taskStorage, filterFilter) {
      var tasks;
      tasks = $scope.tasks = taskStorage.get();
      $scope.taskRemainingCount = filterFilter(tasks, {
        completed: false
      }).length;
      return $scope.$on('taskRemaining:changed', function(event, count) {
        return $scope.taskRemainingCount = count;
      });
    }
  ]).controller('DashboardCtrl', ['$scope', function($scope) {}]);

}).call(this);
