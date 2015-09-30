'use strict'

###*
 # @ngdoc function
 # @name transformApp.controller:HandbookdetailctrlCtrl
 # @description
 # # HandbookdetailctrlCtrl
 # Controller of the transformApp
###
angular.module 'app.controllers'
.controller('HandbookdetailCtrl', [ '$scope', '$routeParams', 'handbookService', 'clientService', ($scope, $routeParams, handbookService, clientService) ->
	$scope.clientId = $routeParams.clientId
	$scope.handbookId = $routeParams.handbookId

	clientService.get {org_id:$scope.clientId}, (data, getResponseHeaders) ->
		$scope.client = data

	handbookService.get {org_id:$scope.clientId, hand_id:$scope.handbookId}, (data, getResponseHeaders) ->
		$scope.handbook = data

  	
  	
])