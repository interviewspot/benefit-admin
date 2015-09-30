'use strict'

###*
 # @ngdoc function
 # @name transformApp.controller:HandbookdetailctrlCtrl
 # @description
 # # HandbookdetailctrlCtrl
 # Controller of the transformApp
###
angular.module 'app.controllers'
.controller('HandbookdetailCtrl', [ '$scope', '$routeParams', 'handbookService', 'clientService', 'sectionService', ($scope, $routeParams, handbookService, clientService, sectionService) ->
	$scope.clientId = $routeParams.clientId
	$scope.handbookId = $routeParams.handbookId

	clientService.get {org_id:$scope.clientId}, (data, getResponseHeaders) ->
		$scope.client = data

	handbookService.get {org_id:$scope.clientId, hand_id:$scope.handbookId}, (data, getResponseHeaders) ->
		$scope.handbook = data
		$scope.$watch 'handbook', ((newVal, oldVal) ->
			if newVal
				updateData = {
					handbook: newVal
				}
				delete updateData.handbook._links 
				delete updateData.handbook.id
				updateData.handbook['organisation'] = $scope.clientId
				handbookService.update {org_id:$scope.clientId, hand_id:$scope.handbookId}, updateData
		), true

	sectionService.query {org_id:$scope.clientId, hand_id:$scope.handbookId}, (data, getResponseHeaders) ->
		console.log data
		$scope.allSections = data
])