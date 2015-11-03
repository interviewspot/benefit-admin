'use strict'
angular.module('app.handbook_info', [])
# --------------------------------------------

.controller('HandbookInfoCtrl', [
    '$scope', '$routeParams', 'handbookService', 'clientService', 'sectionService', '$location', '$timeout',
    ($scope, $routeParams, handbookService, clientService, sectionService, $location, $timeout) ->

        $scope.clientId   = $routeParams.clientId
        $scope.handbookId = $routeParams.handbookId
        $scope.isNewHandBook = false
        $scope.isCreateHandbook = false

        # Default locale for create new
        $scope.handbook = {}
        $scope.handbook.locale = 'en-us'

        clientService.get {org_id:$scope.clientId}, (data, getResponseHeaders) ->
            $scope.clientDetail = data

        if $scope.isCreateHandbook == false
            handbookService.get {org_id:$scope.clientId, hand_id:$scope.handbookId}, (data, getResponseHeaders) ->
                $scope.handbook = data
                $scope.handbook.locale = 'en-us'

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
                "handbook": {
                    "version"      : $scope.handbook.version
                    "title"        : $scope.handbook.title
                    "year"         : $scope.handbook.year
                    "description"  : $scope.handbook.description
                    "organisation" : $scope.clientId
                    "locale"       : $scope.handbook.locale
                }
            }

            #console.log(updateData)

            handbookService.update {org_id:$scope.clientId, hand_id:$scope.handbookId}, updateData, (res) ->
                # display message
                $scope.infoUpdated = 'Update Success'
                $timeout ()->
                    $scope.infoUpdated = null
                , 500
            , (error) ->
                $scope.infoUpdated = error.status + ': Error, refresh & try again !'

        $scope.submitCreateHandbook = ->
            angular.forEach $scope.frm_crt_handbook.$error.required, (field)->
                field.$dirty = true
            if $scope.frm_crt_handbook.$error.required.length
                return false

            newData = {
                "handbook": {
                    "version"      : $scope.handbook.version
                    "title"        : $scope.handbook.title
                    "year"         : $scope.handbook.year
                    "description"  : $scope.handbook.description
                    "organisation" : $scope.clientId
                    "locale"       : $scope.handbook.locale
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
