'use strict'

angular.module('app.clients', [])

.controller('clientCtrl', [
    '$scope', '$filter' , 'fetchTabData', 'fakeData', '$location', 'clientService', 'fetchHandbook', '$routeParams', '$route', 'config'
    ($scope, $filter, fetchTabData, fakeData, $location, clientService, fetchHandbook, $routeParams, $route, config) ->
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
          clientService.query {}, (clientData, getResponseHeaders) ->
            $scope.clients_list = clientData._embedded.items

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
      $scope.isCreateHandbook = false

      $scope.createNewVersion = ->
        $scope.isCreateHandbook = not $scope.isCreateHandbook

      $scope.ClientPage =
        tabUrls : {}
      if $routeParams.clientId
        clientService.get {org_id:$routeParams.clientId}, (data, getResponseHeaders) ->
          if data._links.handbook
            fetchHandbook.get(data._links.handbook.href).then  (res) ->
              $scope.handbooks = []
              $scope.handbooks.push(res.data)
          else
              $scope.isCreateHandbook = true
          $scope.clientDetail = data
          $scope.ClientPage.tabUrls   =
            "info" : '#/clients/' + data.id + '/info'
            "user" : '#/clients/' + data.id + '/user'
            "handbooks" : '#/clients/' + data.id + '/handbooks'
            "policies"  : '#/clients/' + data.id + '/policies'
            "insurance" : '#/clients/' + data.id + '/insurance'
            "healthcare": '#/clients/' + data.id + '/healthcare'
            "imerchant" : '#/clients/' + data.id + '/imerchant'

      # manage users
      $scope.isEditUser = false
      $scope.fnEditUser = ->
        $scope.isEditUser = !$scope.isEditUser

      $scope.isNewUser = false
      $scope.isUserUpload = false
      $scope.isDetailUpload = false

      # function edit
      $scope.clients_edit = false
      $scope.editClient = (clients_edit) ->
        $scope.isDisable    = !$scope.isDisable
        $scope.clients_edit = !clients_edit

        # Check data & update
        if $scope.clients_edit == false && $scope.clientDetail.id

          console.log $scope.$$childTail.uploadresponse
          # console.log $scope.result
          return;
          #id_img =
          sm_client_data = {
            "organisation":
                "adminUser": 9,  # Change this real ID
                "parent": null,
                "logo": null,
                "name": if $scope.clientDetail.name then $scope.clientDetail.name else null,
                "code": if $scope.clientDetail.code then $scope.clientDetail.code  else null,
                "regNo": if $scope.clientDetail.reg_no then $scope.clientDetail.reg_no  else null,
                "headOfficeNo": if $scope.clientDetail.head_office_no then $scope.clientDetail.head_office_no else null,
                "billingAddress": if $scope.clientDetail.billing_address then $scope.clientDetail.billing_address else null,
                "officeAddress" : if $scope.clientDetail.office_address then $scope.clientDetail.office_address else null,
                "reservationEmail": if $scope.clientDetail.reservation_email then $scope.clientDetail.reservation_email else null ,
                "userContactNo": if $scope.clientDetail.user_contact_no then $scope.clientDetail.user_contact_no else null,
                "clientSince": if $scope.clientDetail.client_since then $scope.clientDetail.client_since else null,
                "officeHours": if $scope.clientDetail.office_hours then $scope.clientDetail.office_hours else null,
                "redemptionPassword": "4444",
                "aboutCompany": if $scope.clientDetail.about_company then $scope.clientDetail.about_company  else null
          }
          clientService.update {org_id:$scope.clientDetail.id}, sm_client_data, (res) ->
            console.log res
          , (error) ->
            console.log (error)

      # menu active
      $scope.isActive = (path) ->
        if $location.path().search(path) >= 0
          return 'active'

      # function delete handbook
      $scope.deleteHandbook = (handbook) -> 
        r = confirm("Do you want to delete \"" + handbook.title + "\"?")
        if r == true
          fetchHandbook.delete handbook._links.self.href
          .then (res) ->
            $route.reload()


      # fakedata clients page
      fakeDT = fakeData.clients_data
      #$scope.clients_list = fakeDT.clients_list
      #
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

      # END MASHNASH --------------------------
      # ---------------------------------------

      # UPLOAD FILE IMG [ LOGO ]
      # https://api.sg-benefits.com/api/providers/sonata.media.provider.image/media
      # config.path.baseURL + config.path.upload + 'image/media'

      $scope.urlUpload = config.path.baseURL + config.path.upload + 'image/media';
      $scope.uploadButtonLabel = 'Upload file'
      # $scope.uploadresponse = {}

  ])
.directive 'uploadFile', [
    'Upload',
    (Upload)->

        controller = [
            '$scope', '$http', '$timeout'
            ,($scope, $http, $timeout)->

                defaultLabel = $scope.label.toString()

                $scope.fileName = ''
                $scope.progressPercentage = 0;

                $scope.uniqueID = new Date().getTime()

                $scope.$watch 'file', (nv)->
                    if (nv)
                        Upload.upload {
                            method: 'POST'
                            url: $scope.uploadUrl
                            data:
                                binaryContent: nv
                            headers:{
                                "x-username" : 'kenneth.yap@ap.magenta-consulting.com'
                                "x-password" : 'p@ssword'
                                "Content-Type": if nv.type != '' then nv.type else 'application/octet-stream'
                            }
                        }
                        # response
                        .then (res)->
                          $scope.result = res.data
                          $scope.progressPercentage = 0

                        # error
                        , (error)->
                            console.error error
                            $scope.progressPercentage = 0
                            $scope.label = 'Error : '+ error.status
                            $scope.result = null
                            $timeout ()->
                                $scope.label = defaultLabel
                            ,3000

                        # process tracker
                        , (e)->
                            $scope.progressPercentage = parseInt(100.0 * e.loaded / e.total)
                            console.info 'Progress ' + $scope.progressPercentage

        ] # END of controller


        link = (scope, element, attribute)->
            inputFile = $ element.find('input')


            inputFile.on 'change', (e)->
                if this.files && this.files.length > 1
                    scope.fileName = ( this.getAttribute( 'data-multiple-caption' ) || '' ).replace( '{count}', this.files.length );
                else
                    scope.fileName = e.target.value.split( '\\' ).pop()

                if scope.fileName
                    scope.label = scope.fileName
                else
                    scope.label = 'Upload New Image'

        return {
            'restrict': 'E'
            # 'transclude': true
            'scope':
                'uploadUrl': '=uploadUrl'
                'color' : '=ngProgressColor'
                'label' : '=ngLabel'
                'result': '=ngUploadresponse'


            'templateUrl': 'views/directives/uploadFile.html'
            'controller': controller
            'link': link
        }
]
