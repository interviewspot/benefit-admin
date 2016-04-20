'use strict'
angular.module('app.handbooks', [])
# --------------------------------------------
# Contact in Handbook TAB of Client
# 1. manage list contacts
# 2. Autocomplete email
.controller('HandbookCtrl', [
    '$scope', '$routeParams', 'fetchHandbook', 'handbookService', 'clientService', 'sectionService', '$location', '$timeout', 'authHandler'
    ($scope, $routeParams, fetchHandbook, handbookService, clientService, sectionService, $location, $timeout, authHandler) ->
        # 0. Authorize
        authHandler.checkLoggedIn()

        # GET PARAM FROM URL
        $scope.clientId   = $routeParams.clientId
        $scope.handbookId = $routeParams.handbookId
        #$scope.showNewFrm = true

        # BUILD MENU TAB in CLIENT PAGE
        $scope.ClientPage =
            tabUrls : {}
        clientService.get {org_id:$scope.clientId}, (data, getResponseHeaders) ->
            $scope.clientDetail = data
            $scope.ClientPage.tabUrls   =
                "info" : '#/clients/' + data.id + '/info'
                "user" : '#/clients/' + data.id + '/user'
                "handbooks" : '#/clients/' + data.id + '/handbooks'
                "policies"  : '#/clients/' + data.id + '/policies'
                "insurance" : '#/clients/' + data.id + '/insurance'
                "healthcare": '#/clients/' + data.id + '/healthcare'
                "imerchant" : '#/clients/' + data.id + '/imerchant'
                "notifications" : '#/clients/' + data.id + '/notifications'
        # ------------------------------------------------------------------

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
            #delete updateData.handbook._links
            #delete updateData.handbook.id
            updateData.handbook['organisation'] = $scope.clientId
            console.log updateData
            handbookService.update {org_id:$scope.clientId, hand_id:$scope.handbookId}, updateData, (res) ->
                $scope.generalUpdated = 'Update Success'
                $timeout ()->
                    $scope.generalUpdated = null
                , 1000
            , (error) ->
                $scope.generalUpdated = error.status + ': Error, refresh & try again !'

])



