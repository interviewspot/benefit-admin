'use strict'
angular.module('app.handbook_info', [])
# --------------------------------------------

.controller('HandbookInfoCtrl', [
    '$scope', '$routeParams', 'fetchHandbook', 'handbookService', 'clientService', 'sectionService', '$location', '$timeout',
    ($scope, $routeParams, fetchHandbook, handbookService, clientService, sectionService, $location, $timeout) ->

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
                # GET TRANSLATIONS
                fetchHandbook.get(data._links.translations.href).then  (res) ->
                    if res.status != 200 || typeof res != 'object'
                        return
                    $scope.handbook['translations'] = res.data

                    if $scope.handbook.translations['en-us'] 
                        $scope.handbook.title = $scope.handbook.translations['en-us'].title
                    return
                , (error) ->
                    console.log error
                    return

        $scope.isActive = (href) ->
            path = $location.path()
            if path.indexOf(href) is 0
              return 'active'

        $scope.submitHandbookInfo = ->
            angular.forEach $scope.frm_crt_handbook.$error.required, (field)->
                field.$dirty = true
            if $scope.frm_crt_handbook.$error.required.length
                return false

            if $scope.handbook.translations[$scope.handbook.locale]
                title = $scope.handbook.translations[$scope.handbook.locale].title
            else title = $scope.handbook.title

            if $scope.handbook.translations[$scope.handbook.locale]
                desc = $scope.handbook.translations[$scope.handbook.locale].description
            else desc = $scope.handbook.description

            updateData = {
                "handbook": {
                    "version"      : $scope.handbook.version
                    "title"        : title
                    "year"         : $scope.handbook.year
                    "description"  : desc
                    "organisation" : $scope.clientId
                    "locale"       : $scope.handbook.locale
                    "enabled"      : $scope.handbook.enabled
                }
            }

            console.log(updateData)

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
                "handbook": {
                    "version"      : $scope.handbook.version
                    "title"        : $scope.handbook.title
                    "year"         : $scope.handbook.year
                    "description"  : $scope.handbook.description
                    "organisation" : $scope.clientId
                    "locale"       : $scope.handbook.locale
                    "enabled"      : $scope.handbook.enabled
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
