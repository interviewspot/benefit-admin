'use strict'

angular.module('app.clients', ['ngSanitize'])
.factory('taskStorageClients', ->
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

.controller('clientCtrl', [
      '$scope', '$filter'
      ($scope, $filter) ->
# filter
          $scope.stores = [
              {id: 1, company: 'BullWorks Pte Ltd', status: 'nverser', industry: 'AAA', users: 'Euro', estsaving: 'None', cs: 2,action: "Manage", }
              {id: 2, company: 'BullWorks Pte Ltd', status: 'nverser', industry: 'AAA', users: 'Euro', estsaving: 'None', cs: 2,action: "Manage", }
              {id: 3, company: 'BullWorks Pte Ltd', status: 'nverser', industry: 'AAA', users: 'Euro', estsaving: 'None', cs: 2 ,action: "Manage", }
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
          #CREATE NEW HANDBOOK
#          test = (x) ->
#              y = 10
#              z = x + y
#          alert test 5
          # init
          init = ->
              $scope.search()
              $scope.select($scope.currentPage)
          init()


  ])

.controller('tabsClientCtrl', [
      '$scope'
      ($scope) ->
          $scope.tabs = [{
              title: "Handbook",
              content: '<div id="tab_handbook"></div><div class="col-lg-12">
                            <div class="col-lg-10">
                                <b>Employee Handbook</b>
                            </div>
                            <div class="col-lg-2" style="float: right">
                             <form data-ng-submit="add_new_handbook()" class="add-new">
                                <a href="/#/clients/create-new-handbook" class="btn btn-primary text-center createEdit" >Create New</a>
                             </form>
                            </div>
                        </div>
                        <div class="col-lg-12">
                            <div class="table-responsive">
                                <table class="table table-striped table-bordered table-hover">
                                    <thead>
                                    <tr>
                                        <th>You have not created an employee handbook yet. Click on create to start creating a new Employee Handbook.</th>
                                    </tr>
                                    </thead>
                                </table>
                            </div>
                        </div></div>'

          }, {
              title: "Company Info",
              content: 'Company Info'
          }, {
              title: "Users",
              content: 'Users'
          }]
          $scope.add_new_handbook = ->
              alert(11)
              return false


  ])

.controller('tabsCreateHandbook', [
      '$scope'
      ($scope) ->
          $scope.tabs = [{
              title: "Handbook Info",
              content: '<div id="tab_handbook"></div><div class="col-lg-12">
                            <div class="col-lg-10">
                                <b>Employee Handbook</b>
                            </div>
                            <div class="col-lg-2" style="float: right">
                             <form data-ng-submit="add_new_handbook()" class="add-new">
                                <a href="/#/clients/create-new-handbook" class="btn btn-primary text-center createEdit" >Create New</a>
                             </form>
                            </div>
                        </div>
                        <div class="col-lg-12">
                            <div class="table-responsive">
                                <table class="table table-striped table-bordered table-hover">
                                    <thead>
                                    <tr>
                                        <th>You have not created an employee handbook yet. Click on create to start creating a new Employee Handbook.</th>
                                    </tr>
                                    </thead>
                                </table>
                            </div>
                        </div></div>'

          }, {
              title: "General Description",
              content: 'General Description'
          }, {
              title: "Sections",
              content: 'Sections'
          }]

  ])
