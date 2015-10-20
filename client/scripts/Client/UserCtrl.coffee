'use strict'
angular.module('app.users', [])
# --------------------------------------------
# Users in User TAB of Client
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
            list : config.path.baseURL + config.path.users

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
# --------------------------------------------
# UserCtrl for single user page
# 1. GET USER by EMAIL
# 2. UPDATE USER
# --------------------------------------------
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
            detail : config.path.baseURL + config.path.users + '/'

        _getUser = () ->
            Users.get(_URL.detail + $scope.userId).then  (res) ->
                if res.status != 200 || typeof res != 'object'
                    return
                $scope.user = res.data
                console.log res.data
                return
            , (error) ->
                console.log error

        # 2. UPDATE USER
        $scope.isDisable = true
        $scope.updateUser = () ->
            newData = {
                "user": {
                    "first_name": $scope.user.first_name,
                    "last_name" : $scope.user.last_name,
                    "email"     : $scope.user.email,
                    "username"  : $scope.user.username,
                    "handbook_contact" : true
                }
            }

            Users.put(_URL.detail + $scope.user.id, newData).then  (res) ->
                if res.status != 200 || typeof res != 'object'
                    return
                location.reload()
                #console.log res.data
                return
            , (error) ->
                console.log error

        # 3. DELETE USER
        $scope.deleteUser = () ->
            r = confirm("Do you want to delete this user \"" + $scope.user.email + "\"?")
            if r == true
                Users.delete($scope.user._links.self.href).then  (res) ->
                    if res.status != 200 || typeof res != 'object'
                        return
                    location.reload()
                    #console.log res.data
                    return
                , (error) ->
                    console.log error
            return

        # x. ONLOAD
        if ($scope.userId != 'new')
            _getUser();
        else

])

# --------------------------------------------
# NewUserCtrl for new user page
# 1. GET USER by EMAIL
# 2. UPDATE USER
# --------------------------------------------
.controller('NewUserCtrl', [
    '$scope'
    , '$filter'
    , 'fetchTabData'
    , '$location'
    , '$routeParams'
    , 'config'
    , '$q'
    , 'UserService'
    , 'Users' ,
    ($scope, $filter, fetchTabData, $location, $routeParams, config, $q, UserService, Users) ->
        $scope.clientId =  $routeParams.clientId

        _URL =
            detail : config.path.baseURL + '/users'

        $scope.submitCreateUser = ->
            #angular.forEach $scope.frm-adduser.$error.required, (field)->
            #    field.$dirty = true
            #if $scope.frm-adduser.$error.required.length
            #    return false

            newData = {
                "user": {
                    "firstName": $scope.user.firstname,
                    "middleName": "",
                    "lastName": $scope.user.lastname,
                    "username": $scope.user.username,
                    "email": $scope.user.email,
                    "enabled": true,
                    "handbook_contact" : true,
                    "plainPassword": $scope.user.password,
                    "ssn": null
                }
            }
            #console.log newData

            Users.post(_URL.detail, newData).then  (res) ->
                if res.status == 200
                    $scope.infoUpdated = 'Created New'
                    #$timeout ()->
                    #    $scope.infoUpdated = null
                    #    location.reload()
                    #, 500
            , (error) ->
                $scope.infoUpdated = error.status + ': Error, refresh & try again !'
])

