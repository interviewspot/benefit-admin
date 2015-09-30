'use strict'

angular.module('app.clients', [])

.controller('clientCtrl', [
    '$scope', '$filter' , 'fetchTabData', 'fakeData', '$location', 'clientService', 'fetchHandbook'
    ($scope, $filter, fetchTabData, fakeData, $location, clientService, fetchHandbook) ->
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
          # fetchTabData.fetchMainData "0"
          # .then  (data) ->
          #   $scope.clients_list = data.items
          
          clientService.query {}, (clientData, getResponseHeaders) ->
            $scope.clients_list = clientData.items
          # Client = $resource('https://api.sg-benefits.com/organisations/1', {}, {
          #   update: {
          #     method: 'PUT'
          #   }
          # })
          # updateClient = {
          #   "organisation" : {
          #     name: 'client 1'
          #   }
          # }
          # Client.update({}, updateClient)
          # Client = $resource('https://api.sg-benefits.com/organisations/1/handbooks/1')
          # Client.get (u, getResponseHeaders) ->
          #   console.log(u)
          #   u.title = 'test 1'
          #   u.$save (u, putResponseHeaders) ->
          #     console.log(putResponseHeaders)

      init()

      # show preview
      $scope.showPreview = false

      # show collapse
      $scope.isForward = false
      $scope.isTerm = false
      $scope.isCode = false

      # show block section hand book
      $scope.isForward = false
      $scope.isOurCpny = false

      # show create new handbook
      $scope.isCreateNew = false
      $scope.fnCreateNew = ->
        $scope.isCreateNew = !$scope.isCreateNew
      $scope.isEditHandbook = false
      $scope.fnEditHandbook = ->
        $scope.isEditHandbook = !$scope.isEditHandbook

      # manage clients
      $scope.isEditClients = false

      params = $location.search()
      if params.id
        clientService.get {org_id:params.id}, (data, getResponseHeaders) ->
          if data._links.handbook
            fetchHandbook.get(data._links.handbook).then  (res) ->
              $scope.handbooks = []
              console.log res.data
              $scope.handbooks.push(res.data)
          $scope.clientDetail = data


      # manage users
      $scope.isEditUser = false
      $scope.fnEditUser = ->
        $scope.isEditUser = !$scope.isEditUser

      $scope.isNewUser = false
      $scope.isUserUpload = false
      $scope.isDetailUpload = false

      # function edit
      $scope.clients_edit = "Edit"
      $scope.editClient = ->
        $scope.isDisable = !$scope.isDisable
        if $scope.isDisable
          $scope.clients_edit = "Update"
        else
          $scope.clients_edit = "Edit"
          clientService.update {org_id:params.id}, $scope.clientDetail
            
      # tabs config
      $scope.tabConfig = [
        id: 'cpn'
        baseUrl : 'views/clients/tab_company.html'
      ,
        id: 'usr'
        baseUrl : 'views/clients/tab_user.html'
      ,
        id: 'hb'
        baseUrl : 'views/clients/tab_handbook.html'
      ,
        id: 'po' 
        baseUrl : 'views/clients/tab_policy.html'
      ,
        id: 'is' 
        baseUrl : 'views/clients/tab_insurance.html'
      ,
        id: 'ht' 
        baseUrl : 'views/clients/tab_healthcare.html'
      ,
        id: 'ic' 
        baseUrl : 'views/clients/tab_imerchant.html'
      ]


      $scope.selectTab = (tabIndex) ->
        $scope.selectedTabIndex = tabIndex
        fetchTabData.tabFetchDataByIndex $scope.tabConfig[tabIndex]
        .then  (res) ->
            $scope.tabData = res.response;

      # tabs child config
      $scope.tabChildConfig = [
        id : 'hi'
        baseUrl : 'views/clients/tab_handbook_info.html'
      ,
        id : 'hg' 
        baseUrl : 'views/clients/tab_handbook_general.html'
      ,
        id : 'hs' 
        baseUrl : 'views/clients/tab_handbook_section.html'
      ,
        id : 'hc' 
        baseUrl : 'views/clients/tab_handbook_contact.html'
      ]
      $scope.selectTabChild = (tabIndex) ->
        $scope.selectedTabIndex = tabIndex
        fetchTabData.tabFetchDataByIndex $scope.tabChildConfig[tabIndex]
        .then  (res) ->
            $scope.tabData = res.response;

      # fakedata clients page
      fakeDT = fakeData.clients_data
      #$scope.clients_list = fakeDT.clients_list
      $scope.dt_tab_company = fakeDT.clients_tab_company
      $scope.dt_tab_user_list = fakeDT.clients_tab_user_list
      $scope.clients_tab_user_uploads = fakeDT.clients_tab_user_uploads
      $scope.clients_user_upload_detail = fakeDT.clients_user_upload_detail
      $scope.clients_user_detail = fakeDT.clients_user_detail
      $scope.clients_user_redemptions_list = fakeDT.clients_user_redemptions_list
      $scope.dt_tab_handbook_list = fakeDT.clients_tab_handbook_list
      $scope.dt_tab_handbook_info = fakeDT.clients_tab_handbook_info
      $scope.clients_tab_handbook_general = fakeDT.clients_tab_handbook_general
      $scope.clients_tab_handbook_section = fakeDT.clients_tab_handbook_section
  ])

.controller('tabsClientCtrl', [
      '$scope'
      ($scope) ->
          $scope.tabs = [{
              title: "Handbook",
              content: '<div class="col-lg-12">
                            <div class="col-lg-10">
                                Employee Handbook
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
                        </div>'

          }, {
              title: "Company Info",
              content: '<div class="col-lg-12">
                            <table class="table table-striped table-bordered table-hover">
                                <tr>
                                    <td>Section Title :</td>
                                    <td>Forward</td>
                                </tr>
                                <tr>
                                    <td>Status :</td>
                                    <td>Active/Disabled</td>
                                </tr>
                                <tr>
                                    <td>Section No :</td>
                                    <td>1</td>
                                </tr>
                                <tr>
                                    <td colspan="2"> <textarea class="textArea"></textarea></td>
                                </tr>

                            </table>
                        </div>'
          }, {
              title: "Users",
              content: 'Users'
          }]

  ])


