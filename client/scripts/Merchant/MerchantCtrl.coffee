'use strict'
angular.module('app.merchants', [])
# --------------------------------------------
# Companies in Merchant
# 1. GET Companies (a local function)
# 2. PAGING, setup paging
# 2.1 On Number Per Page Change
# 2.2 Goto PAGE
# 3. ONLOAD LISTING COMPANIES
# --------------------------------------------
.controller('merchantCtrl', [
    '$scope'
    , '$filter'
    , '$location'
    , '$routeParams'
    , 'config'
    , 'Companies'
    ($scope, $filter, $location, $routeParams, config, Companies) ->
        console.log 'OK'


        # 1. GET COMPANIES Fn
        _getCompanies = (limit, goPage) ->
            Companies.get(config.path.baseURL + config.path.clients + '?limit=' + limit + '&page=' + goPage).then  (res) ->
                if res.status != 200 || typeof res != 'object'
                    return
                console.log res.data
                $scope.companies       = res.data
                $scope.companies.items = res.data._embedded.items
                return
            , (error) ->
                console.log error

        # 2. PAGING, setup paging
        $scope.numPerPageOpt = [3, 5, 10, 20]
        $scope.numPerPage    = $scope.numPerPageOpt[2]
        $scope.currentPage   = 1
        $scope.filteredUsers = []
        $scope.currentPageUsers = []

        # 2.1 On Number Per Page Change
        $scope.onNPPChange = () ->
            _getCompanies($scope.numPerPage, $scope.currentPage)

        # 2.2 Goto PAGE
        $scope.gotoPage = (page) ->
            _getCompanies($scope.numPerPage, $scope.currentPage)

        # 3. ONLOAD LIST USERS
        _getCompanies($scope.numPerPage, $scope.currentPage);

        return
])
