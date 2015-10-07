'use strict'
angular.module('app.users', [])
# --------------------------------------------
# Contact in Handbook TAB of Client
# 1. GET USERS (a local function)
# 2. PAGING, setup paging
# 2.1 On Number Per Page Change
# 2.2 Goto PAGE
# 3. ONLOAD LIST USERS
# --------------------------------------------
.controller('UsersCtrl', [
    '$scope'
    , '$filter'
    , 'fetchTabData'
    , '$location'
    , '$routeParams'
    , 'config'
    , '$q'
    , '$modal'
    , 'UserService'
    , 'Users' ,
    ($scope, $filter, fetchTabData, $location, $routeParams, config, $q, $modal, UserService, Users) ->

        $scope.clientId =  $routeParams.clientId
        _URL_users =
            list : config.path.baseURL + '/users'

        # 1. GET USERS
        _getUsers = (limit, goPage) ->
            Users.get(_URL_users.list + '?limit=' + limit + '&page=' + goPage).then  (res) ->
                if res.status != 200 || typeof res != 'object'
                    return
                $scope.users = res.data
                $scope.users.items = res.data._embedded.items
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
            _getUsers($scope.numPerPage, $scope.currentPage)

        # 2.2 Goto PAGE
        $scope.gotoPage = (page) ->
            _getUsers($scope.numPerPage, $scope.currentPage)

        # 3. ONLOAD LIST USERS
        _getUsers($scope.numPerPage, $scope.currentPage);

        return
])
# UserCtrl For single user page
# 1. GET USER by EMAIL
.controller('UserCtrl', [
    '$scope'
    , '$filter'
    , 'fetchTabData'
    , '$location'
    , '$routeParams'
    , 'config'
    , '$q'
    , '$modal'
    , 'UserService'
    , 'Users' ,
    ($scope, $filter, fetchTabData, $location, $routeParams, config, $q, $modal, UserService, Users) ->
        $scope.clientId =  $routeParams.clientId
        $scope.userId   =  if $routeParams.userId then $routeParams.userId.trim() else false

        if !$scope.userId
            location.href = '#/clients/' + $scope.clientId
            return

        # 1. GET USER by EMAIL
        _URL =
            detail : config.path.baseURL + '/users/'

        _getUser = () ->
            Users.get(_URL.detail + $scope.userId).then  (res) ->
                if res.status != 200 || typeof res != 'object'
                    return
                $scope.user = res.data
                return
            , (error) ->
                console.log error

        # x. ONLOAD
        _getUser();
])

