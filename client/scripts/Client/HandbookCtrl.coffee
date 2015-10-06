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

        clientService.get {org_id:$scope.clientId}, (data, getResponseHeaders) ->
            $scope.clientDetail = data

        handbookService.get {org_id:$scope.clientId, hand_id:$scope.handbookId}, (data, getResponseHeaders) ->
            $scope.handbook = data
            # if $scope.handbook.length
            #     $scope.showNewFrm = false

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



