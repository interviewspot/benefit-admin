'use strict'

###*
 # @ngdoc function
 # @name transformApp.controller:HandbookdetailctrlCtrl
 # @description
 # # HandbookdetailctrlCtrl
 # Controller of the transformApp
###
angular.module 'app.controllers'
.controller('HandbookdetailCtrl', [ '$scope', '$routeParams', 'handbookService', 'clientService', 'sectionService', 'linkServices', ($scope, $routeParams, handbookService, clientService, sectionService, linkServices) ->
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
		$scope.allSections = data
		$scope.parentSection = []
		for i in [0 .. data.length-1]
			if data[i]._links.children && data[i]
				$scope.parentSection.push({
					id: data[i].id
					title: data[i].title
					_links: data[i]._links	
				})

		console.log $scope.parentSection
		# for i in [0 .. data.length-1]
		# 	if data[i]._links.children && data[i]
		# 		sectionService.children {org_id:$scope.clientId, hand_id:$scope.handbookId}, (child, getResponseHeaders) ->
		# 			data[i].children = child
		# 			$scope.allSections = data
		# 			if i = (data.length-1)
		# 				console.log $scope.allSections

				# console.log data[i]
				# linkServices.get(data[i]._links.children).then  (res) ->
				# 	data[i].children = []
				# 	if res.data
				# 		data[i].children = res.data	
				# 	if i = (data.length-1)
				# 		$scope.allSections = data
				# 		console.log $scope.allSections
	$scope.loadSection = (section) ->
		if section.active = true
			section.status = 'Active'
		else
			section.active = 'Disabled'
		$scope.formSection = section
		console.log section
	$scope.isCreateSubSection = false;
	$scope.createSubSction = (isSub) ->
		$scope.isCreateSubSection = isSub;
])
.controller('SectionFormController', [ '$scope', '$routeParams', 'handbookService', 'clientService', 'sectionService', 'linkServices', ($scope, $routeParams, handbookService, clientService, sectionService, linkServices) ->
	$scope.submit = () ->
		console.log formSection
])