(function() {
  'use strict';
  angular.module('app.merchants', []).controller('merchantCtrl', [
    '$scope', '$filter', '$location', '$routeParams', 'config', 'Companies', 'authHandler','$rootScope','$route', function($scope, $filter, $location, $routeParams, config, Companies, authHandler,$rootScope,$route) {
      var _getCompanies;
      authHandler.checkLoggedIn();
      if($rootScope.employerId != null && $rootScope.isAdmin == false){
        $location.path('/clients/' + $rootScope.employerId + '/info');
        return $route.reload();
      }
      _getCompanies = function(limit, goPage) {
        return Companies.get(config.path.baseURL + config.path.clients + '?limit=' + limit + '&page=' + goPage).then(function(res) {
          if (res.status !== 200 || typeof res !== 'object') {
            return;
          }
          $scope.companies = res.data;
          $scope.companies.items = res.data._embedded.items;
        }, function(error) {
          return console.log(error);
        });
      };
      $scope.numPerPageOpt = [3, 5, 10, 20];
      $scope.numPerPage = $scope.numPerPageOpt[2];
      $scope.currentPage = 1;
      $scope.filteredUsers = [];
      $scope.currentPageUsers = [];
      $scope.onNPPChange = function() {
        return _getCompanies($scope.numPerPage, $scope.currentPage);
      };
      $scope.gotoPage = function(page) {
        return _getCompanies($scope.numPerPage, $scope.currentPage);
      };
      _getCompanies($scope.numPerPage, $scope.currentPage);
    }
  ]).controller('merchantDetailCtrl', [
    '$scope', '$filter', '$location', '$routeParams', 'config', 'Companies', 'authHandler', function($scope, $filter, $location, $routeParams, config, Companies, authHandler) {
      var i, item, _getCompany, _prefix_url, _ref;
      $scope.clientId = $routeParams.clientId;
      authHandler.checkLoggedIn();
      _getCompany = function(clientId) {
        return Companies.get(config.path.baseURL + config.path.clients + '/' + clientId).then(function(res) {
          if (res.status !== 200 || typeof res !== 'object') {
            return;
          }
          console.log(res.data);
          $scope.client = res.data;
        }, function(error) {
          return console.log(error);
        });
      };
      $scope.isActive = function(path) {
        if ($location.path().search(path) >= 0) {
          return 'active';
        }
      };
      _prefix_url = '#/merchant/' + $scope.clientId;
      $scope.page_tabUrls = {
        "business": _prefix_url + '/business',
        "info": _prefix_url + '/info',
        "outlets": _prefix_url + '/outlets',
        "offers": _prefix_url + '/offers',
        "reports": _prefix_url + '/reports',
        "campaigns": _prefix_url + '/campaigns'
      };
      $scope.offer_items = [
        {
          "id": 1,
          "name": "Main course"
        }, {
          "id": 2,
          "name": "Main course 2"
        }, {
          "id": 3,
          "name": "Main course 3"
        }
      ];
      _ref = $scope.offer_items;
      for (i in _ref) {
        item = _ref[i];
        $scope.offer_items[i]['open_frm'] = 0;
      }
      $scope.op_form = function(key) {
        console.log(key);
        $scope.offer_items[key]['open_frm'] = !$scope.offer_items[key]['open_frm'];
      };
      $scope.validForm = function(index) {
        $scope.offer_items[index]['ipt'] = {};
        if (!$scope.offer_items[index].name || ($scope.offer_items[index].name && $scope.offer_items[index].name.length < 4)) {
          return $scope.offer_items[index].ipt['name'] = 'error';
        }
      };
      $scope.open = function($event, index) {
        $event.preventDefault();
        $event.stopPropagation();
        $scope.offer_items[index].effdate = {};
        return $scope.offer_items[index].effdate.opened = true;
      };
      $scope.expire = function($event, index) {
        $event.preventDefault();
        $event.stopPropagation();
        $scope.offer_items[index].expdate = {};
        return $scope.offer_items[index].expdate.opened = true;
      };
      $scope.minDate = new Date();
      _getCompany($scope.clientId);
    }
  ]);

}).call(this);
