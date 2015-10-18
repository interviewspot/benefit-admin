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
                return
            , (error) ->
                console.log error

        # 2. UPDATE USER
        $scope.isDisable = false

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

])

## 
# @ngdoc directive
# uploadExcel
##
.directive 'sheetParser', [
    '$timeout'
    ($timeout)->

        controller = ['$scope', ($scope)->
            $scope.fileName = 'No file selected'
            $scope.uniqueID = new Date().getTime()

            firstRun = true
            $scope.$watch 'parsedJson', (nv)->
                if(firstRun)
                    firstRun = false
                    return
                if !nv
                    $scope.result = 
                        status: 'error'
                        message: "couldn't parse sheet"
                else 
                    $scope.result =
                        status: 'OK'
                        data: $scope.parsedJson
        ]

        link = (scope, ele, attr)->
            inputFile = $ ele.find('input')
            files = []
            workbook = {}

            inputFile.on 'change', (e)->
                if this.files && this.files.length > 1
                    scope.fileName = ( this.getAttribute( 'data-multiple-caption' ) || '' ).replace( '{count}', this.files.length );
                else
                    scope.fileName = e.target.value.split( '\\' ).pop()

                if scope.fileName
                    scope.label = scope.fileName
                else
                    scope.label = 'No file selected'

                files = e.target.files;
                # for i in [0..files.length-1]
                f = files[0]   
                reader = new FileReader();
                name = f.name;
                reader.onload = (e)->
                    data = e.target.result;
                    workbook = XLSX.read(data, {type: 'binary'});
                    first_sheet_name = workbook.SheetNames[0]
                    worksheet = workbook.Sheets[first_sheet_name]
                    json = sheet_to_custom_json(worksheet)
                    data = {}
                    data.name = name
                    data.json = json
                    scope.parsedJson = data
                
                reader.readAsBinaryString(f)

        sheet_to_custom_json = (sheet)->
            firstCol = []
            secondCol = []
            tempCell = {}
            tempObj = {}
            status = ''
            angular.forEach sheet, (cell, key)->
                if (key.split('A').length>1)
                    tempCell = 
                        id: key
                        value: cell.v
                    firstCol.push tempCell
                else if (key.split('B').length>1)
                    tempCell = 
                        id: key
                        value: cell.v
                    secondCol.push tempCell
                else 
                    # did not used yet
                    status = 'Invalid format'

            angular.forEach firstCol, (value, index)->
                if(secondCol[index] && secondCol[index].value && firstCol[index].id.split('A')[1] == secondCol[index].id.split('B')[1])
                    tempObj[value.value] = secondCol[index].value
            return tempObj
                    

        return {
            restrict: 'E'
            scope: 
                result: '=ngResult'

            templateUrl: 'views/directives/uploadExcel.html'
            controller: controller
            link: link
        }

]