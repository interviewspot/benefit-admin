# 'use strict'

# ###*
#  # @ngdoc function
#  # @name transformApp.controller:HandbookdetailctrlCtrl
#  # @description
#  # # HandbookdetailctrlCtrl
#  # Controller of the transformApp
# ###
# angular.module 'app.controllers'
# .controller('HandbookdetailCtrl', [ 
# 	'$scope', '$routeParams', 'handbookService', 'clientService', 'sectionService', '$location', 
# 	($scope, $routeParams, handbookService, clientService, sectionService, linkServices, $location) ->
# 	$scope.clientId = $routeParams.clientId
# 	$scope.handbookId = $routeParams.handbookId

# 	clientService.get {org_id:$scope.clientId}, (data, getResponseHeaders) ->
# 		$scope.clientDetail = data

# 	handbookService.get {org_id:$scope.clientId, hand_id:$scope.handbookId}, (data, getResponseHeaders) ->
# 		$scope.handbook = data
# 		# $scope.$watch 'handbook', ((newVal, oldVal) ->
# 		# 	if newVal
# 		# 		updateData = {
# 		# 			handbook: newVal
# 		# 		}
# 		# 		delete updateData.handbook._links 
# 		# 		delete updateData.handbook.id
# 		# 		updateData.handbook['organisation'] = $scope.clientId
# 		# 		handbookService.update {org_id:$scope.clientId, hand_id:$scope.handbookId}, updateData
# 		# ), true
# 	$scope.isActive = (href) ->
#         path = $location.path()
#         if path.indexOf(href) is 0
#           return 'active'
# 	$scope.submitHandbookInfo = ->
# 		updateData = {
# 			handbook: $scope.handbook
# 		}
# 		delete updateData.handbook._links 
# 		delete updateData.handbook.id
# 		updateData.handbook['organisation'] = $scope.clientId
# 		handbookService.update {org_id:$scope.clientId, hand_id:$scope.handbookId}, updateData

# 		# update company info
# 		updateData = {
# 			children: {
# 				name: $scope.clientDetail.name
# 				code: $scope.clientDetail.code
# 				parent: null
# 				adminUser: null
# 				root: null
# 				location: null
# 				logo: null
# 				lft: null
# 				lvl: null
# 				rgt: null
# 				regNo: $scope.clientDetail.reg_no
# 				headOfficeNo: $scope.clientDetail.head_office_no
# 				billingAddress: $scope.clientDetail.billing_address
# 				reservationEmail: $scope.clientDetail.reservation_email
# 				userContactNo: $scope.clientDetail.user_contact_no
# 				clientSince: $scope.clientDetail.client_since
# 				officeHours: $scope.clientDetail.office_hours
# 				redemptionPassword: $scope.clientDetail.redemption_password
# 				aboutCompany: $scope.clientDetail.about_company
# 			}
# 		}
# 		# delete updateData._links 
# 		# delete updateData.id
# 		clientService.update {org_id:$scope.clientId}, updateData

# 	$scope.loadSections = ->
# 		sectionService.query {org_id:$scope.clientId, hand_id:$scope.handbookId}, (data, getResponseHeaders) ->
# 			$scope.ungroupSections = orderSections(data._embedded.items)
# 			$scope.allSections = ungroupSection($scope.ungroupSections)
# 			sectionDatas = data._embedded.items
# 			# console.log $scope.allSections[1].children
# 			$scope.parentSection = []
# 			for i in [0 .. sectionDatas.length-1]
# 				if !sectionDatas[i]._links.parent && sectionDatas[i]
# 					$scope.parentSection.push({
# 						id: sectionDatas[i].id
# 						title: sectionDatas[i].title
# 						_links: sectionDatas[i]._links
# 					})
# 	$scope.loadSections()

# 	orderSections = (items) ->
# 		newList = []
# 		for i in [0 .. items.length-1]
# 			if !items[i]._links.parent
# 				items[i].children = []
# 				newList.push(items[i])
# 		for i in [0 .. items.length-1]
# 			if items[i]._links.parent
# 				for j, item of newList
# 					if newList[j]._links.self.href == items[i]._links.parent.href
# 						newList[j].children[items[i].version] = items[i]	

# 		for j, item of newList
# 			newList[j].children = newList[j].children.sort(sectionCompare)
# 		newList.sort(sectionCompare)
		
# 		return newList

# 	ungroupSection = (items) ->
# 		returnList = []
# 		for j, item of items
# 			item.no = parseInt(j)+1
# 			returnList.push(item)
# 			if item.children.length > 0
# 				for k, child of item.children
# 					child.parent_no = item.no
# 					child.no = parseInt(k)+1
# 					returnList.push(child)
# 		return returnList

# 	sectionCompare = (a,b) ->
# 		if (a.version < b.version)
# 			return -1;
# 		if (a.version > b.version)
# 			return 1;
# 		return 0;


# 	$scope.isUpdate = false
# 	$scope.isCreateSubSection = false
# 	$scope.editSection = (section) ->
# 		if section.active = true
# 			section.status = 'Active'
# 		else
# 			section.active = 'Disabled'
# 		$scope.formSection = section

# 		if section._links.parent
# 			$scope.isCreateSubSection = true
# 			$scope.parentSelect = section._links.parent.id
# 		else
# 			$scope.isCreateSubSection = false
# 			$scope.parentSelect = null
# 		$scope.isUpdate = true

# 	$scope.changedValue = (id) ->
#     	$scope.parentSelect = id
    
# 	$scope.createSubSction = (isSub) ->
# 		$scope.isUpdate = false
# 		$scope.isCreateSubSection = isSub
# 		$scope.formSection = {
# 			description: ''
# 			title: ''
# 			version: ''
# 			status: ''
# 		}
# 		$scope.parentSelect = null

# 	$scope.formSection = {
# 		description: ''
# 		title: ''
# 		version: ''
# 		status: ''
# 	}

# 	#delete section function
# 	$scope.deleteSection = (section) ->
# 		sectionService.delete {org_id:$scope.clientId, hand_id:$scope.handbookId, section_id:section.id}, (res)->
# 			$scope.loadSections()

# 	$scope.parentSelect = null
# 	$scope.submitSection = () ->
# 		sectionItem = {
# 			section: {
# 				description: $scope.formSection.description
# 				title: $scope.formSection.title
# 				version: $scope.formSection.version
# 				handbook: $scope.handbookId
# 				parent: $scope.parentSelect
# 			}
# 		}

# 		if $scope.formSection.status = 'Active'
# 			sectionItem.section.active = true
# 		else
# 			sectionItem.section.active = false
# 		if $scope.isUpdate == true
# 			sectionService.update {org_id:$scope.clientId, hand_id:$scope.handbookId, section_id:$scope.formSection.id}, sectionItem, (res)->
# 				$scope.loadSections()
# 		else
# 			if $scope.isCreateSubSection == true && $scope.isUpdate == false
# 				sectionService.saveChild {org_id:$scope.clientId, hand_id:$scope.handbookId}, sectionItem, (res)->
# 	      			$scope.loadSections()
# 			if $scope.isCreateSubSection == false && $scope.isUpdate == false
# 				sectionService.save {org_id:$scope.clientId, hand_id:$scope.handbookId}, sectionItem, (res)->
# 	      			$scope.loadSections()
# ])
