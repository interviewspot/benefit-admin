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
    , 'Users'
    , 'fetchContact'
    , '$timeout',
    ($scope, $filter, fetchTabData, $location, $routeParams, config, $q, $modal, UserService, Users, fetchContact, $timeout) ->

        $scope.clientId =  $routeParams.clientId
        _URL_users =
            #list : config.path.baseURL + config.path.users
            list : config.path.baseURL + config.path.contacts.replace(":org_id", $routeParams.clientId)

        # GET STAMPTIME FROM RFC 822 timetype
        $scope.getTime = (ndate) ->
            dateAsDateObject = new Date(Date.parse(ndate))
            return dateAsDateObject.getTime()

        # 1. GET USERS
        _getUsers = (limit, goPage) ->

            fetchContact.get(_URL_users.list + '?limit=' + limit + '&page=' + goPage).then  (res) ->
                #console.log(res)
                if res.data._embedded.items.length
                    $scope.users = res.data
                    $scope.users.items = []
                    for i, item of res.data._embedded.items
                        ((itemInstance) ->
                            Users.get(itemInstance._links.employee.href).then  (res) ->
                                if res.status != 200 || typeof res != 'object'
                                    return
                                #console.log(res)
                                $scope.users.items.push(res.data)
                                #$scope.users = res.data
                                #$scope.users.items = res.data._embedded.items
                                return
                            , (error) ->
                                console.log error
                        )(item)
                return

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
    , '$timeout'
    ,
    ($scope, $filter, fetchTabData, $location, $routeParams, config, $q, $modal, UserService, Users, $timeout) ->
        $scope.clientId =  $routeParams.clientId
        $scope.userId   =  if $routeParams.userId then $routeParams.userId.trim() else false

        if !$scope.userId
            location.href = '#/clients/' + $scope.clientId
            return

        # 1. GET USER by EMAIL
        _URL =
            list   : config.path.baseURL + config.path.users
            detail : config.path.baseURL + config.path.users + '/'

        _getUser = () ->
            Users.get(_URL.detail + $scope.userId).then  (res) ->
                if res.status != 200 || typeof res != 'object'
                    return
                $scope.user = res.data
                if($scope.user.birthday == "-0001-11-30T00:00:00+0655")
                    $scope.user.birthday = ""
                console.log res.data
                return
            , (error) ->
                console.log error

        _searchUserbyEntry = (entry, searchVal, callback) ->
            if typeof callback != 'function'
                return
            get_result = null
            Users.get(_URL.list + '?search=user.' + entry + ':' + searchVal).then  (res) ->
                if res.status == 200 && typeof res == 'object'
                    get_result = res.data
                    callback(get_result)
                return get_result
            , (error) ->
                callback(error)
                console.log error

        # 2. UPDATE USER
        $scope.isDisable = true
        $scope.updateUser = () ->
            angular.forEach $scope.frm_updateuser.$error.required, (field)->
                field.$dirty = true
            if $scope.frm_updateuser.$error.required.length || $scope.frm_updateuser.$invalid
                return false

            # PREPARE DATA
            user_code = $scope.user.code
            user_code = user_code.trim()
            user_code = user_code.toLowerCase()
            date_added = $scope.user.date_added;
            if(date_added == "-0001-11-30T00:00:00+0655")
                date_added = $filter('date')(new Date(), 'yyyy-MM-dd HH:mm:ss')
            newData = {
                "user": {
                    "first_name" : $scope.user.first_name
                    "last_name"  : $scope.user.last_name
                    "username"   : $scope.user.username
                    "email"      : $scope.user.email
                    "code"       : $scope.user.code
                    #"handbook_contact" : true,
                    #"enabled": true,
                    #"plain_password": null,
                    #"ssn": null
                    "mobile_no"      : $scope.user.mobile_no || ''
                    "office_no"      : $scope.user.office_no || ''
                    "date_added"     : date_added
                }
            }

            birthday = $scope.user.birthday || ''
            if(birthday != '')
                birthday = $filter('date')(new Date(birthday), 'yyyy-MM-dd')
                newData.user.birthday = birthday


            Users.put(_URL.detail + $scope.user.id, newData).then  (res) ->
                if res.status == 204
                    $scope.infoUpdated = 'Updated user successfully!'
                    $timeout ()->
                        $scope.infoUpdated = null
                    , 300
                return

            , (error) ->
                checkError = (datajson) ->
                    if typeof datajson == 'object' && datajson._embedded.items.length
                        $scope.infoUpdated = error.status + ': Verification code existed, refresh & try again!'
                    else
                        $scope.infoUpdated = error.status + ': Error API, refresh & try again!'

                _searchUserbyEntry('code', newData.user.code, checkError)

        #open date picker
        $scope.openDatepicker  = ($event) ->
            $event.preventDefault()
            $event.stopPropagation()
            $scope.datepickerOpened = true

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
    , '$timeout'
    , 'ContactService'
    , 'php' ,
    ($scope, $filter, fetchTabData, $location, $routeParams, config, $q, UserService, Users, $timeout, ContactService, php) ->
        $scope.clientId =  $routeParams.clientId
        $scope.isExcel = false

        _URL =
            detail : config.path.baseURL + config.path.users

        _searchUserbyEntry = (entry, searchVal, callback) ->
            if typeof callback != 'function'
                return
            get_result = null
            Users.get(_URL.list + '?search=user.' + entry + ':' + searchVal).then  (res) ->
                if res.status == 200 && typeof res == 'object'
                    get_result = res.data
                    callback(get_result)
                return get_result
            , (error) ->
                callback(error)
                console.log error

        _insertUser = (user) ->
            newData = {
                "user": user
            }
            Users.post(_URL.detail, newData).then  (res) ->
                if typeof res == 'object' && res.status == 201

                    # NEW POSTION in THIS CLIENT
                    Users.get(_URL.detail + '/' + user.email.trim()).then (res) ->
                        $scope.infoUpdated = 'Created New'

                        if res.status == 200 && typeof res == 'object'
                            # SEND API : SAVE
                            newContact = {
                                "position": {
                                    "title"   : "Position of " + user.username
                                    "employee": res.data.id
                                    "active"  : true
                                    "employer": $scope.clientId
                                    "handbook_contact" : true
                                }
                            }

                            # CREATE POSITION USER
                            ContactService.save {org_id:$scope.clientId}, newContact, (res)->

                                if typeof res == 'object' && res.code == 201
                                    $timeout ()->
                                        $location.path('/clients/' + $scope.clientId + '/user')
                                    , 500

                    , (error) ->
                        console.log error
                        alert 'API error connection: Not yet create user for this client'

            , (error) ->
                checkError = (datajson) ->
                    if typeof datajson == 'object' && datajson._embedded.items.length
                        $scope.infoUpdated = error.status + ': Verification code existed, refresh & try again!'
                    else
                        $scope.infoUpdated = error.status + ': Error API, refresh & try again!'

                _searchUserbyEntry('code', newData.user.code, checkError)

        #open date picker
        $scope.openDatepicker  = ($event) ->
            $event.preventDefault()
            $event.stopPropagation()
            $scope.datepickerOpened = true

        #By Input FRM
        $scope.submitCreateUser = ->
            angular.forEach $scope.frm_adduser.$error.required, (field)->
                field.$dirty = true
            if $scope.frm_adduser.$error.required.length
                return false
            $scope.isExcel = false

            user = {
                "first_name"     : $scope.user.first_name
                "last_name"      : $scope.user.last_name
                "username"       : $scope.user.username
                "email"          : $scope.user.email
                "enabled"        : true
                "plain_password" : $scope.user.password
                "ssn"            : null
                "code"           : php.randomString(6, 'a#')
                "mobile_no"      : $scope.user.mobile_no || ''
                "office_no"      : $scope.user.office_no || ''
                "date_added"     : $filter('date')(new Date(), 'yyyy-MM-dd HH:mm:ss')
            }

            birthday = $scope.user.birthday || ''
            if(birthday != '')
                birthday = $filter('date')(new Date(birthday), 'yyyy-MM-dd')
                user.birthday = birthday

            console.log(user);
            #return;
            _insertUser(user)

        #By Excel Import
        $scope.createUserExcel = ->
            $scope.isExcel = true
            user = $scope.jsonResult.data.json

            #validate data
            if user.username == undefined || user.username == null || user.username == ""
                $scope.infoUpdated = "Missing username."
                return
            if user.first_name == undefined || user.first_name == null || user.first_name == ""
                $scope.infoUpdated = "Missing first_name."
                return
            if user.email == undefined || user.email == null || user.email == ""
                $scope.infoUpdated = "Missing email."
                return
            if user.plain_password == undefined || user.plain_password == null || user.plain_password == ""
                $scope.infoUpdated = "Missing password."
                return

            #map data
            insertUser = {
                "first_name"     : user.first_name
                "last_name"      : user.last_name
                "username"       : user.username
                "email"          : user.email
                "enabled"        : true
                "plain_password" : user.plain_password
                "ssn"            : null
                "code"           : php.randomString(6, 'a#')
                "mobile_no"      : user.mobile_no || ''
                "office_no"      : user.office_no || ''
                "date_added"     : $filter('date')(new Date(), 'yyyy-MM-dd HH:mm:ss')
            }
            birthday = user.birthday || ''
            if(birthday != '')
                birthday = $filter('date')(new Date(birthday), 'yyyy-MM-dd')
                insertUser.birthday = birthday

            _insertUser(insertUser)
])

