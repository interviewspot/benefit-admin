'use strict'

angular.module('app.merchants.html', [])
.factory('taskStorage2', ->
    STORAGE_ID = 'tasks'
    DEMO_TASKS = '[
        {"title": "Finish homework", "completed": true},
        {"title": "Make a call", "completed": true},
        {"title": "Build a snowman :)", "completed": false},
        {"title": "Apply for monster university!", "completed": false},
        {"title": "Play games with friends", "completed": true},
        {"title": "Shopping", "completed": false},
        {"title": "One more dance", "completed": false},
        {"title": "Try Google glass", "completed": false}
    ]'


    return {
    get: ->
        JSON.parse(localStorage.getItem(STORAGE_ID) || DEMO_TASKS )

    put: (tasks)->
        localStorage.setItem(STORAGE_ID, JSON.stringify(tasks))
    }
)

.controller('merchantsCtrl', [
      '$scope', '$filter'
      ($scope, $filter) ->
# filter
          $scope.stores = [
              {id: 1, company: 'BullWorks Pte Ltd', store: 'Converser', type: 'AAA', cat: 'Euro', outlets: 'None', cs: 2, status: 'Live', action: "Manage", }
              {id: 2, company: 'Resort world', store: 'Converser2', type: 'BBB', cat: 'CCC', outlets: 'None', cs: 2, status: 'Live', action: 'Manage', }
              {id: 3, company: 'Nijiya Market', store: 'TTT', type: 'BNM', cat: 'Euro', outlets: 'None', cs: 2, status: 'Live', action: 'Manage', }
          ]
          $scope.searchKeywords = ''
          $scope.filteredStores = []
          $scope.row = ''

          $scope.select = (page) ->
              start = (page - 1) * $scope.numPerPage
              end = start + $scope.numPerPage
              $scope.currentPageStores = $scope.filteredStores.slice(start, end)
          # console.log start
          # console.log end
          # console.log $scope.currentPageStores

          # on page change: change numPerPage, filtering string
          $scope.onFilterChange = ->
              $scope.select(1)
              $scope.currentPage = 1
              $scope.row = ''

          $scope.onNumPerPageChange = ->
              $scope.select(1)
              $scope.currentPage = 1

          $scope.onOrderChange = ->
              $scope.select(1)
              $scope.currentPage = 1


          $scope.search = ->
              $scope.filteredStores = $filter('filter')($scope.stores, $scope.searchKeywords)
              $scope.onFilterChange()

          # orderBy
          $scope.order = (rowName)->
              if $scope.row == rowName
                  return
              $scope.row = rowName
              $scope.filteredStores = $filter('orderBy')($scope.stores, rowName)
              # console.log $scope.filteredStores
              $scope.onOrderChange()

          # pagination
          $scope.numPerPageOpt = [3, 5, 10, 20]
          $scope.numPerPage = $scope.numPerPageOpt[2]
          $scope.currentPage = 1
          $scope.currentPageStores = []

          # init
          init = ->
              $scope.search()
              $scope.select($scope.currentPage)
          init()

          # tabs config
          $scope.tabConfig = [
            id: 'cpi'
            baseUrl : 'views/merchants/tab_company.html'
          ,
            id: 'ol'
            baseUrl : 'views/merchants/tab_outlet.html'
          ,
            id: 'of'
            baseUrl : 'views/merchants/tab_offer.html'
          ,
            id: 'rp'
            baseUrl : 'views/merchants/tab_report.html'
          ,
            id: 'cpa'
            baseUrl : 'views/merchants/tab_compaign.html'
          ,
          ]

          $scope.selectTab = (tabIndex) ->
            $scope.selectedTabIndex = tabIndex
            fetchTabData.tabFetchDataByIndex $scope.tabConfig[tabIndex]
            .then  (res) ->
                $scope.tabData = res.response;

          # function edit
          $scope.merchants_edit = "Edit"
          $scope.CheckDisabled = ->
            $scope.isDisable = !$scope.isDisable
            if $scope.isDisable
              $scope.merchants_edit = "Update"
            else
              $scope.merchants_edit = "Edit"
  ])

.controller('TabsMerchantCtrl', [
      '$scope'
      ($scope) ->
          $scope.tabs = [
              {
                  title: "Company"
                  content: "Dynamic content 1.  Consectetur adipisicing elit. Nihil, quidem, officiis, et ex laudantium sed cupiditate voluptatum libero nobis sit illum voluptates beatae ab. Ad, repellendus non sequi et at."
                  html: "<h1>Hai</h1>"
              }
              {
                  title: "Disabled"
                  content: "Dynamic content 2.  Lorem ipsum dolor sit amet, consectetur adipisicing elit. Nihil, quidem, officiis, et ex laudantium sed cupiditate voluptatum libero nobis sit illum voluptates beatae ab. Ad, repellendus non sequi et at."
                  disabled: true
              }
          ]
          $scope.html="<h1>Hai</h1>"
          $scope.navType = "pills"
  ])
