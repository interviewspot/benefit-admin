'use strict'
angular.module('app.businesses', [])
# --------------------------------------------
# Users in User TAB of Client
# 1. GET USERS (a local function)
# 2. PAGING, setup paging
# 2.1 On Number Per Page Change
# 2.2 Goto PAGE
# 3. ONLOAD LIST USERS
# --------------------------------------------
.controller('BusinessesCtrl', [
    '$scope'
    , '$filter'
    , 'fetchTabData'
    , '$location'
    , '$routeParams'
    , 'config'
    , '$q'
    , '$modal'
    , 'Businesses'
    , 'fetchContact'
    , '$timeout',
    ($scope, $filter, fetchTabData, $location, $routeParams, config, $q, $modal, Businesses, fetchContact, $timeout) ->

        $scope.clientId =  $routeParams.clientId
        _URL_users =
            #list : config.path.baseURL + config.path.users
            list : config.path.baseURL + config.path.businesses.replace(":org_id", $routeParams.clientId)

        # GET STAMPTIME FROM RFC 822 timetype
        $scope.getTime = (ndate) ->
            dateAsDateObject = new Date(Date.parse(ndate))
            return dateAsDateObject.getTime()

        # 1. GET USERS
        _getBusinesses = (limit, goPage) ->

            fetchContact.get(_URL_users.list + '?limit=' + limit + '&page=' + goPage).then  (res) ->
                #console.log(res)
                if res.data._embedded.items.length
                    $scope.businesses = res.data
                return

        # 2. PAGING, setup paging
        $scope.numPerPageOpt = [3, 5, 10, 20]
        $scope.numPerPage    = $scope.numPerPageOpt[2]
        $scope.currentPage   = 1
        $scope.filteredUsers = []
        $scope.currentPageUsers = []

        # 2.1 On Number Per Page Change
        $scope.onNPPChange = () ->
            _getBusinesses($scope.numPerPage, $scope.currentPage)

        # 2.2 Goto PAGE
        $scope.gotoPage = (page) ->
            _getBusinesses($scope.numPerPage, $scope.currentPage)

        # 3. DELETE USER
        $scope.removeUser = (user) ->
            r = confirm("Do you want to delete this user \"" + user.email + "\"?")
            if r == true
                deleteUrl = config.path.baseURL + config.path.users + '/'
                Users.delete(deleteUrl + user.id).then  (res) ->
                    if typeof res == 'object' && res.status == 204
                        $timeout ()->
                            location.reload()
                        , 300
                        return
                , (error) ->
                    alert(error.status + ': Error, refresh & try again !')
            return

        # 4. ONLOAD LIST USERS
        _getBusinesses($scope.numPerPage, $scope.currentPage);

        return
])
