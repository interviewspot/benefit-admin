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

	$scope.loadSections = ->
		sectionService.query {org_id:$scope.clientId, hand_id:$scope.handbookId}, (data, getResponseHeaders) ->
			$scope.ungroupSections = orderSections(data)
			$scope.allSections = ungroupSection($scope.ungroupSections)
			# console.log $scope.allSections[1].children
			$scope.parentSection = []
			for i in [0 .. data.length-1]
				if !data[i]._links.parent && data[i]
					$scope.parentSection.push({
						id: data[i].id
						title: data[i].title
						_links: data[i]._links	
					})
	$scope.loadSections()

	orderSections = (items) ->
		newList = []
		for i in [0 .. items.length-1]
			if !items[i]._links.parent
				items[i].children = []
				newList.push(items[i])
		for i in [0 .. items.length-1]
			if items[i]._links.parent
				for j, item of newList
					if newList[j].id == items[i]._links.parent.id
						newList[j].children[items[i].version] = items[i]	

		for j, item of newList
			newList[j].children = newList[j].children.sort(sectionCompare)
		newList.sort(sectionCompare)
		
		return newList

	ungroupSection = (items) ->
		returnList = []
		for j, item of items
			item.no = parseInt(j)+1
			returnList.push(item)
			if item.children.length > 0
				for k, child of item.children
					child.parent_no = item.no
					child.no = parseInt(k)+1
					returnList.push(child)
		return returnList

	sectionCompare = (a,b) ->
		if (a.version < b.version)
			return -1;
		if (a.version > b.version)
			return 1;
		return 0;


	$scope.isUpdate = false
	$scope.isCreateSubSection = false
	$scope.editSection = (section) ->
		if section.active = true
			section.status = 'Active'
		else
			section.active = 'Disabled'
		$scope.formSection = section

		if section._links.parent
			$scope.isCreateSubSection = true
			$scope.parentSelect = section._links.parent.id
		else
			$scope.isCreateSubSection = false
			$scope.parentSelect = null
		$scope.isUpdate = true

	$scope.changedValue = (id) ->
    	$scope.parentSelect = id
    
	$scope.createSubSction = (isSub) ->
		$scope.isUpdate = false
		$scope.isCreateSubSection = isSub
		$scope.formSection = {
			description: ''
			title: ''
			version: ''
			status: ''
		}
		$scope.parentSelect = null

	$scope.formSection = {
		description: ''
		title: ''
		version: ''
		status: ''
	}

	#delete section function
	$scope.deleteSection = (section) ->
		sectionService.delete {org_id:$scope.clientId, hand_id:$scope.handbookId, section_id:section.id}, (res)->
			$scope.loadSections()

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
			sectionService.update {org_id:$scope.clientId, hand_id:$scope.handbookId, section_id:$scope.formSection.id}, sectionItem, (res)->
				$scope.loadSections()
		else
			if $scope.isCreateSubSection == true && $scope.isUpdate == false
				sectionService.saveChild {org_id:$scope.clientId, hand_id:$scope.handbookId}, (res)->
	      			$scope.loadSections()
			if $scope.isCreateSubSection == false && $scope.isUpdate == false
				sectionService.save {org_id:$scope.clientId, hand_id:$scope.handbookId}, sectionItem, (res)->
	      			$scope.loadSections()
])
