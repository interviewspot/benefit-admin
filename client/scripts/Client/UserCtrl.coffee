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
    , 'Users'
    , '$timeout',
    ($scope, $filter, fetchTabData, $location, $routeParams, config, $q, $modal, UserService, Users, $timeout) ->
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
                    "last_name": $scope.user.last_name,
                    "username": $scope.user.username,
                    "email":  $scope.user.email,
                    #"handbook_contact" : true,
                    #"enabled": true,
                    #"plain_password": null,
                    #"ssn": null
                }
            }
            #console.log newData
            Users.put(_URL.detail + $scope.user.id, newData).then  (res) ->
                if res.status == 204
                    $scope.infoUpdated = 'Updated user successfully!'
                    $timeout ()->
                        clientId =  $routeParams.clientId
                        $location.path('/clients/' + clientId + '/user')
                    , 300

                    return
            , (error) ->
                $scope.infoUpdated = error.status + ': Error, refresh & try again !'

        # 3. DELETE USER
        $scope.deleteUser = () ->
            r = confirm("Do you want to delete this user \"" + $scope.user.email + "\"?")
            if r == true
                Users.delete(_URL.detail + $scope.user.id).then  (res) ->
                    if typeof res == 'object' && res.status == 204
                        $scope.infoUpdated = 'Deleted user successfully!'
                        $timeout ()->
                            clientId =  $routeParams.clientId
                            $location.path('/clients/' + clientId + '/user')
                        , 300
                        return
                , (error) ->
                    $scope.infoUpdated = error.status + ': Error, refresh & try again !'
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
    , 'Users'
    , '$timeout',
    ($scope, $filter, fetchTabData, $location, $routeParams, config, $q, UserService, Users, $timeout) ->
        $scope.clientId =  $routeParams.clientId

        _URL =
            detail : config.path.baseURL + config.path.users

        $scope.submitCreateUser = ->
            #angular.forEach $scope.frm-adduser.$error.required, (field)->
            #    field.$dirty = true
            #if $scope.frm-adduser.$error.required.length
            #    return false

            newData = {
                "user": {
                    "first_name": $scope.user.first_name,
                    #"middleName": "",
                    "last_name": $scope.user.last_name,
                    "username": $scope.user.username,
                    "email":  $scope.user.email,
                    "enabled": true,
                    "plain_password": $scope.user.password,
                    "ssn": null,
                    #"handbook_contact" : true
                }
            }
            #console.log newData

            Users.post(_URL.detail, newData.user).then  (res) ->
                if typeof res == 'object' && res.status == 201
                    $scope.infoUpdated = 'Created New'
                    $timeout ()->
                        clientId =  $routeParams.clientId
                        $location.path('/clients/' + clientId + '/user')
                    , 500
            , (error) ->
                #console.log(error)
                $scope.infoUpdated = error.status + ': Error, refresh & try again !'

])

