'use strict'
angular.module('app.handbooks', [])
# --------------------------------------------
# Contact in Handbook TAB of Client
# 1. manage list contacts
# 2. Autocomplete email
.controller('HandbookCtrl', [
    '$scope', '$routeParams', 'handbookService', 'clientService', 'sectionService', '$location', '$timeout',
    ($scope, $routeParams, handbookService, clientService, sectionService, $location, $timeout) ->

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
        # ------------------------------------------------------------------

        handbookService.get {org_id:$scope.clientId, hand_id:$scope.handbookId}, (data, getResponseHeaders) ->
            $scope.handbook = data

        $scope.isActive = (href) ->
            path = $location.path()
            if path.indexOf(href) is 0
              return 'active'

        $scope.submitHandbookInfo = ->

            updateData = {
                handbook: $scope.handbook
            }
            delete updateData.handbook._links 
            delete updateData.handbook.id
            updateData.handbook['organisation'] = $scope.clientId
            handbookService.update {org_id:$scope.clientId, hand_id:$scope.handbookId}, updateData

            $scope.generalUpdated = 'Update Success'
            $timeout ()->
                $scope.generalUpdated = null
            , 3000

])



