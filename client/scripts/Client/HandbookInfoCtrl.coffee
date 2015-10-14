'use strict'
angular.module('app.handbook_info', [])
# --------------------------------------------

.controller('HandbookInfoCtrl', [
    '$scope', '$routeParams', 'handbookService', 'clientService', 'sectionService', '$location', '$timeout',
    ($scope, $routeParams, handbookService, clientService, sectionService, $location, $timeout) ->

        $scope.clientId   = $routeParams.clientId
        $scope.handbookId = $routeParams.handbookId
        $scope.isNewHandBook = false

        clientService.get {org_id:$scope.clientId}, (data, getResponseHeaders) ->
            $scope.clientDetail = data

        if $scope.isCreateHandbook == false
            handbookService.get {org_id:$scope.clientId, hand_id:$scope.handbookId}, (data, getResponseHeaders) ->
                $scope.handbook = data

        $scope.isActive = (href) ->
            path = $location.path()
            if path.indexOf(href) is 0
              return 'active'

        $scope.submitHandbookInfo = ->
            angular.forEach $scope.frm_crt_handbook.$error.required, (field)->
                field.$dirty = true
            if $scope.frm_crt_handbook.$error.required.length
                return false

            updateData = {
                handbook: $scope.handbook
            }
            delete updateData.handbook._links
            delete updateData.handbook.id
            updateData.handbook['organisation'] = $scope.clientId
            handbookService.update {org_id:$scope.clientId, hand_id:$scope.handbookId}, updateData, (res) ->
                # display message
                $scope.infoUpdated = 'Update Success'
                $timeout ()->
                    $scope.infoUpdated = null
                , 1000
            , (error) ->
                $scope.infoUpdated = error.status + ': Error, refresh & try again !'

        $scope.submitCreateHandbook = ->
            angular.forEach $scope.frm_crt_handbook.$error.required, (field)->
                field.$dirty = true
            if $scope.frm_crt_handbook.$error.required.length
                return false

            newData = {
                handbook: {
                    version: $scope.handbook.version
                    title: $scope.handbook.title
                    year: $scope.handbook.year
                    description: $scope.handbook.description
                    organisation: $scope.clientId
                }
            }
            handbookService.save {org_id:$scope.clientId}, newData, (res) ->
                # display message
                $scope.infoUpdated = 'Created New'
                $timeout ()->
                    $scope.infoUpdated = null
                    location.reload()
                , 500
            , (error) ->
                $scope.infoUpdated = error.status + ': Error, refresh & try again !'
])

.directive 'uploadFile', [
    'Upload', 
    (Upload)->

        controller = [
            '$scope', '$timeout', '$http'
            ,($scope, $timeout, $http)->
                
                $scope.fileName = ''

                $scope.uniqueID = new Date().getTime()

                $scope.$watch 'file', (nv)->
                    if (nv)
                        # Upload.upload {
                        $http {
                            url: $scope.uploadUrl,
                            data: nv
                        } 
                        # response
                        .then (res)->
                            console.log 'Success ' + res
                        # error
                        .then (error)->
                            console.log 'Error ' + error
                        # process tracker
                        # .then (e)->
                        #     $scope.progressPercentage = parseInt(100.0 * evt.loaded / evt.total)
                        #     console.info 'Progress ' + $scope.progressPercentage

        ] # END of controller
            

        link = (scope, element, attribute)->
            inputFile = $ element.find('input')
            label = $ element.find('label')


            inputFile.on 'change', (e)->
                if this.files && this.files.length > 1 
                    scope.fileName = ( this.getAttribute( 'data-multiple-caption' ) || '' ).replace( '{count}', this.files.length );
                else
                    scope.fileName = e.target.value.split( '\\' ).pop() 

                console.log scope.fileName

                if scope.fileName 
                    label.html(scope.fileName)
                else
                    label.html('Upload New Image')

        return {
            'restrict': 'E'
            'transclude': true
            'scope': 
                'uploadUrl': '=uploadUrl'

            
            'templateUrl': 'views/directives/uploadFile.html'
            'controller': controller
            'link': link
        }
]