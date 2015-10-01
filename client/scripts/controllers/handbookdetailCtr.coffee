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
		$scope.clientDetail = data

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
	loadSections = ->
		sectionService.query {org_id:$scope.clientId, hand_id:$scope.handbookId}, (data, getResponseHeaders) ->
			$scope.allSections = data
			console.log data
			$scope.parentSection = []
			for i in [0 .. data.length-1]
				if data[i]._links.children && data[i]
					$scope.parentSection.push({
						id: data[i].id
						title: data[i].title
						_links: data[i]._links	
					})
	loadSections()

	$scope.isUpdate = false
	$scope.isCreateSubSection = false
	$scope.loadSection = (section) ->
		if section.active = true
			section.status = 'Active'
		else
			section.active = 'Disabled'
		$scope.formSection = section
		if section.children
			$scope.isCreateSubSection = false
		if section.parent
			$scope.isCreateSubSection = true
		$scope.isUpdate = true
	$scope.isCreateSubSection = false
	$scope.createSubSction = (isSub) ->
		$scope.isUpdate = false
		$scope.isCreateSubSection = isSub

	$scope.formSection = {
		description: ''
		title: ''
		version: ''
		status: ''
	}
	#delete section function
	$scope.deleteSection = (section) ->
		sectionService.delete {org_id:$scope.clientId, hand_id:$scope.handbookId, section_id:section.id}
		loadSections()

	$scope.parentSelect = null
	$scope.submitSection = () ->
		sectionItem = {
			section: {
				description: $scope.formSection.description
				title: $scope.formSection.title
				version: $scope.formSection.version
				handbook: $scope.handbookId
				parent: $scope.parentSelect
			}
		}
		
		if $scope.formSection.status = 'Active'
			sectionItem.section.active = true
		else
			sectionItem.section.active = false
		if $scope.isUpdate == true
			sectionService.update {org_id:$scope.clientId, hand_id:$scope.handbookId, section_id:$scope.formSection.id}, sectionItem
		else
			if $scope.isCreateSubSection == true && $scope.isUpdate == false
				sectionService.saveChild {org_id:$scope.clientId, hand_id:$scope.handbookId, section_id:$scope.formSection.id}, sectionItem
				loadSections()
			if $scope.isCreateSubSection == false && $scope.isUpdate == false
				sectionService.save {org_id:$scope.clientId, hand_id:$scope.handbookId}, sectionItem
				loadSections()
])
