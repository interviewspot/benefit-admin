'use strict'
angular.module('app.handbook_section', [])
# --------------------------------------------

.controller('HandbookSectionCtrl', [
    '$scope', '$routeParams', 'handbookService', 'clientService', 'sectionService', '$location', '$timeout',
    ($scope, $routeParams, handbookService, clientService, sectionService, $location, $timeout) ->


        $scope.loadSections = ->
            sectionService.query {org_id:$scope.clientId, hand_id:$scope.handbookId}, (data, getResponseHeaders) ->
                if data._embedded.items.length > 0
                    $scope.ungroupSections = orderSections(data._embedded.items)
                    $scope.allSections = ungroupSection($scope.ungroupSections)
                    sectionDatas = data._embedded.items
                    # console.log $scope.allSections[1].children
                    $scope.parentSection = []
                    for i in [0 .. sectionDatas.length-1]
                        if !sectionDatas[i]._links.parent && sectionDatas[i]
                            $scope.parentSection.push({
                                id: sectionDatas[i].id
                                title: sectionDatas[i].title
                                _links: sectionDatas[i]._links
                            })
                else
                    $scope.ungroupSections = []
                    $scope.allSections = []
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
                        if newList[j]._links.self.href == items[i]._links.parent.href
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
        $scope.selectedSec = null
        $scope.editSection = (section, $index) ->
            if section.active  = true
                section.status = 'Active'
            else
                section.status = 'Disabled'
            $scope.formSection = section
            $scope.selectedSec = $index

            if section._links.parent
                $scope.isCreateSubSection = true
                $timeout ()->
                    temp = eval(section._links.parent.href.split('sections/')[1])
                    $scope.parentSelect = temp
                    $scope.changedValue(temp)
            else
                $scope.isCreateSubSection = false
                $scope.parentSelect = null
            $scope.isUpdate = true

        $scope.changedValue = (id) ->
            $scope.parentSelect = id

        $scope.createSubSction = (isSub) ->
            $scope.selectedSec = null
            $scope.isUpdate    = false
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

        # DELETE section
        $scope.deleteSection = (section) ->
            r = confirm("Do you want to section \"" + section.title + "\"?")
            if r == true
                sectionService.delete {org_id:$scope.clientId, hand_id:$scope.handbookId, section_id:section.id}, (res)->
                    $scope.loadSections()


        $scope.parentSelect = null
        $scope.submitSection = () ->
            angular.forEach $scope.frm_section.$error.required, (field)->
                field.$dirty = true
            if $scope.frm_section.$error.required.length
                return false

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

            # UPDATE section
            if $scope.isUpdate == true
                sectionService.update {org_id:$scope.clientId, hand_id:$scope.handbookId, section_id:$scope.formSection.id}, sectionItem, (res)->
                    $scope.loadSections()
                    # display message
                    $scope.sectionUpdated = 'Update Success'
                    $timeout ()->
                        $scope.sectionUpdated = null
                    , 2000
                , (error) ->
                    $scope.sectionUpdated = error.status + ': Error, refresh & try again !'
            else
                # SECTION LEVEL 1
                if $scope.isCreateSubSection == true && $scope.isUpdate == false
                    sectionService.saveChild {org_id:$scope.clientId, hand_id:$scope.handbookId}, sectionItem, (res)->
                        $scope.loadSections()
                        # display message
                        $scope.sectionUpdated = 'Update Success'
                        $timeout ()->
                            $scope.sectionUpdated = null
                        , 2000
                    , (error) ->
                        $scope.sectionUpdated = error.status + ': Error, refresh & try again !'

                # SECTION LEVEL 2
                if $scope.isCreateSubSection == false && $scope.isUpdate == false
                    sectionService.save {org_id:$scope.clientId, hand_id:$scope.handbookId}, sectionItem, (res)->
                        $scope.loadSections()
                        # display message
                        $scope.sectionUpdated = 'Update Success'
                        $timeout ()->
                            $scope.sectionUpdated = null
                        , 2000
                    , (error) ->
                        $scope.sectionUpdated = error.status + ': Error, refresh & try again !'



])
