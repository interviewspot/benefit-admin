'use strict'
angular.module('app.handbook_section', [])
# --------------------------------------------

.controller('HandbookSectionCtrl', [
    '$scope', '$routeParams', 'handbookService', 'clientService', 'sectionService', '$location', '$timeout', 'fetchHandbook', 'config'
    ($scope, $routeParams, handbookService, clientService, sectionService, $location, $timeout, fetchHandbook, config) ->

        orderSections = (items) ->
            treeList = []

            for i in [0 .. items.length-1]
                if !items[i]._links.parent
                    items[i].children = []
                    treeList.push(items[i])

            for j, item of treeList
                for i in [0 .. items.length-1]
                    if items[i]._links.parent
                        if treeList[j]._links.self.href == items[i]._links.parent.href
                            treeList[j].children.push(items[i])

            for j, item of treeList
                treeList[j].children = treeList[j].children.sort(sectionCompare)

            treeList.sort(sectionCompare)

            return treeList

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

        translateSection = (item) ->
            newItem = item
            fetchHandbook.get(item._links.translations.href).then  (res) ->
                    if res.status != 200 || typeof res != 'object'
                        return
                    newItem['translations'] = res.data
                    return
                , (error) ->
                    console.log error
                    return
            return newItem

        sectionCompare = (a,b) ->
            if (a.version < b.version)
                return -1;
            if (a.version > b.version)
                return 1;
            return 0;

        # ------------------------------
        # LOAD LIST SECTIONS
        _URL_sections =
            list : config.path.baseURL + config.path.sections.replace(':org_id', $scope.clientId).replace(':hand_id', $scope.handbookId)

        $scope.loadSections = (limit, goPage) ->
            #console.log(limit + '/' + goPage)
            fetchHandbook.get(_URL_sections.list + '?limit=' + limit + '&page=' + goPage).then  (res) ->
                if res.data._embedded.items.length > 0
                    #console.log(res)
                    $scope.sections = {}
                    $scope.sections.pages = res.data.pages
                    $scope.sections.total = res.data.total
                    $scope.ungroupSections = orderSections(res.data._embedded.items)
                    $scope.translateSections     = ungroupSection($scope.ungroupSections)
                    sectionDatas           = res.data._embedded.items
                    $scope.allSections = []
                    #translate
                    j = 0
                    while j < $scope.translateSections.length
                        # GET TRANSLATIONS
                        #$scope.newSection = $scope.translateSections[j]
                        item = translateSection($scope.translateSections[j])
                        $scope.allSections.push(item)
                        j++

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

        # 2. PAGING, setup paging
        $scope.numPerPageOpt = [30, 50, 100, 200]
        $scope.numPerPage    = $scope.numPerPageOpt[2]
        $scope.currentPage   = 1
        $scope.filteredUsers = []
        $scope.currentPageUsers = []

        # 2.1 On Number Per Page Change
        $scope.onNPPChange = () ->
            $scope.loadSections($scope.numPerPage, $scope.currentPage)

      # 2.2 Goto PAGE
        $scope.gotoPage = (page) ->
            $scope.loadSections($scope.numPerPage, page)

        $scope.loadSections($scope.numPerPage, $scope.currentPage)

        $scope.isUpdate = false
        $scope.isCreateSubSection = false
        $scope.selectedSec = null

        $scope.editSection = (section, $index) ->
            if section.active  = true
                section.status = 'Active'
            else
                section.status = 'Disabled'

            section.title      = if section.translations['en_us'].title then section.translations['en_us'].title else section.title
            section.description  = if section.translations['en_us'].description then section.translations['en_us'].description else section.description
            $scope.formSection = section
            #console.log($scope.formSection)
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
            r = confirm("Do you want to delete this section: \"" + section.title + "\"?")
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
                    description : ($scope.formSection.description)
                    title       : ($scope.formSection.title)
                    version     : $scope.formSection.version
                    handbook    : $scope.handbookId
                    parent      : $scope.parentSelect
                    locale      : 'en_us'
                }
            }

            console.log(sectionItem)

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
                    , 1000
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
                        , 1000
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
                        , 1000
                    , (error) ->
                        $scope.sectionUpdated = error.status + ': Error, refresh & try again !'



])
