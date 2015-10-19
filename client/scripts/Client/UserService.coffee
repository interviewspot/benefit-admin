'use strict'

angular.module('app.users.services', [])

.factory 'UserService', ($resource, config) ->
    service = $resource(config.path.baseURL + config.path.contacts, {}, {
            query:
                method:"GET",
                action: config.path.baseURL + config.path.contacts
                isArray: true
            update:
                method:"PUT"
                action: config.path.contact
            save:
                method:"POST"
                action: config.path.baseURL + config.path.contacts

        }
    )
    return service

.factory('Users', [ '$http', '$q', '$resource', ($http, $q, $resource) ->
    return {
        get : (url) ->
            d = $q.defer()
            $http({
                method: 'GET'
                url: url
            })
            .then (res) ->
                d.resolve(res)
                return
            , (error) ->
                d.reject(error)
                return
            d.promise
         post : (url, data) ->
            d = $q.defer()
            $http({
                method: 'POST'
                url: url
                data: data
            })
            .then (res) ->
                d.resolve(res)
                return
            , (error) ->
                d.reject(error)
                return
            d.promise
        put : (url, data) ->
            d = $q.defer()
            $http({
                method: 'PUT'
                url: url
                data: data
            })
            .then (res) ->
                d.resolve(res)
                return
            , (error) ->
                d.reject(error)
                return
            d.promise
        delete : (url) ->
            d = $q.defer()
            $http({
                method: 'DELETE'
                url: url
            })
            .then (res) ->
                d.resolve(res)
                return
            , (error) ->
                d.reject(error)
                return
            d.promise
    }
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
