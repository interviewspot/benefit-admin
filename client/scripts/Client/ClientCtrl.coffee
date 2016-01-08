'use strict'

angular.module('app.clients', [])

.controller('clientCtrl', [
    '$scope', '$filter' , 'fetchTabData', 'fakeData', '$location', 'clientService', 'fetchHandbook', '$routeParams', '$route', 'config', 'Images', 'php', 'ClientAPI', 'Companies', 'Clients', 'handbookService', '$timeout',
    ($scope, $filter, fetchTabData, fakeData, $location, clientService, fetchHandbook, $routeParams, $route, config, Images, php, ClientAPI, Companies, Clients, handbookService, $timeout) ->
    # filter

      _URL_clients =
            list : config.path.baseURL + config.path.clients

      # 1. GET USERS
      _getClients = (limit, goPage) ->
            Clients.get(_URL_clients.list + '?limit=' + limit + '&page=' + goPage).then  (res) ->
                if res.status != 200 || typeof res != 'object'
                    return
                $scope.clients = res.data
                $scope.clients_list = res.data._embedded.items
                return
            , (error) ->
                console.log error
                return

      # 2. PAGING, setup paging
      $scope.numPerPageOpt = [3, 5, 10, 20]
      $scope.numPerPage    = $scope.numPerPageOpt[0]
      $scope.currentPage   = 1
      $scope.filteredUsers = []
      $scope.currentPageUsers = []

        # 2.1 On Number Per Page Change
      $scope.onNPPChange = () ->
            _getClients($scope.numPerPage, $scope.currentPage)

      # 2.2 Goto PAGE
      $scope.gotoPage = (page) ->
            _getClients($scope.numPerPage, $scope.currentPage)

      # 4. ONLOAD LIST USERS
      _getClients($scope.numPerPage, $scope.currentPage);


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
      $scope.changePublished = (handbook, clientId)->
        handbook.locale = 'en-us'
        #console.log(handbook)
        updateData = {
            "handbook": {
                "version"      : handbook.version
                "title"        : handbook.translations[handbook.locale].title
                "year"         : handbook.year
                "description"  : handbook.translations[handbook.locale].description
                "organisation" : clientId
                "locale"       : handbook.locale
                "enabled"      : handbook.enabled
            }
        }

        #onsole.log(updateData)

        handbookService.update {org_id:clientId, hand_id:handbook.id}, updateData, (res) ->
            # display message
            $scope.infoUpdated = 'Update Success'
            #$timeout ()->
            #    $scope.infoUpdated = null
            #, 500
        , (error) ->
            $scope.infoUpdated = error.status + ': Error, refresh & try again !'

      $scope.ClientPage =
        tabUrls : {}
      if $routeParams.clientId
        clientService.get {org_id:$routeParams.clientId}, (data, getResponseHeaders) ->
          if data._links.handbooks
            fetchHandbook.get(data._links.handbooks.href).then  (res) ->
              if typeof res.data._embedded != 'object' || !res.data._embedded.items
                $scope.isCreateHandbook = true
                return
              $scope.handbooks = res.data._embedded.items
              console.log($scope.handbooks)

              # GET TRANSLATIONS
              angular.forEach $scope.handbooks, (item, i) ->
                Clients.get(item._links.translations.href).then  (res) ->
                  if res.status != 200 || typeof res != 'object'
                    return
                  $scope.handbooks[i]['translations'] = res.data
                  return
                , (error) ->
                  console.log error
                  return

          else
              $scope.isCreateHandbook = true

          # GET LOGO URL
          $scope.clientDetail = data
          #console.log(data)
          if typeof data._links.logo == 'object' && data._links.logo.href
            Images.get(data._links.logo.href).then  (res) ->
              if res.status != 200 || typeof res != 'object'
                  return
                logo_id_arr = php.explode('/media/', data._links.logo.href)
                $scope.urlUpload    = $scope.clientDetail._links['logo.post'].href
                #console.log(res.data)
                $scope.clientDetail['logo']     = res.data
                if typeof res.data._links.url == 'object' && res.data._links.url.href
                    Images.get(data._links.logo.href + '/url').then  (url) ->
                        if url.status != 200 || typeof url != 'object'
                            return
                        $scope.clientDetail['logo_url'] = url.data.url
                    , (error) ->
                        console.log error
              return
            , (error) ->
              console.log error
          else
            $scope.urlUpload    = $scope.clientDetail._links['logo.post'].href

          # GET BANNER URL
          if typeof data._links.banners == 'object' && data._links.banners.href
            Images.get(data._links.banners.href).then  (res) ->
              if res.status != 200 || typeof res != 'object'
                    return
              #console.log(res.data)
              $scope.urlUploadBanner    = $scope.clientDetail._links['banners.post'].href
              #console.log($scope.urlUploadBanner)
              $scope.clientDetail['banners'] = []
              if res.data._embedded.items.length > 0
                    angular.forEach res.data._embedded.items, (itm) ->
                        b = itm
                        if typeof b._links.url == 'object' && b._links.url.href
                            Images.get(config.path.baseURL + b._links.url.href).then  (bn) ->
                                if bn.status == 200 || typeof bn == 'object'
                                    b['banner_url'] = bn.data.url
                                    #console.log(b)
                                    $scope.clientDetail['banners'].push(b)
                            , (error) ->
                                console.log error
                        #$scope.clientDetail['banners'] = res.data._embedded.items
              #console.log($scope.clientDetail['banners'])
              return
            , (error) ->
              console.log error
          else
            $scope.urlUploadBanner    = $scope.clientDetail._links['banners.post'].href

          $scope.ClientPage.tabUrls   =
            "info" : '#/clients/' + data.id + '/info'
            "user" : '#/clients/' + data.id + '/user'
            "handbooks" : '#/clients/' + data.id + '/handbooks'
            "policies"  : '#/clients/' + data.id + '/policies'
            "insurance" : '#/clients/' + data.id + '/insurance'
            "healthcare": '#/clients/' + data.id + '/healthcare'
            "imerchant" : '#/clients/' + data.id + '/imerchant'
            "notifications" : '#/clients/' + data.id + '/notifications'

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
            $scope.updateClient("", null)

      # function update client (include update/delete logo/banner)
      $scope.updateClient = (task, obj) ->
          if $scope.clientDetail.redemption_password && $scope.clientDetail.redemption_password.length != 4
            alert 'Please entry 4 chars in Redemption password'
            return

          sm_client_data = {
            "organisation":
                "admin_user": null,  # Change this real ID
                "parent": null,
                "name": if $scope.clientDetail.name then $scope.clientDetail.name else null,
                "code": if $scope.clientDetail.code then $scope.clientDetail.code  else null,
                "reg_no": if $scope.clientDetail.reg_no then $scope.clientDetail.reg_no  else null,
                "head_office_no": if $scope.clientDetail.head_office_no then $scope.clientDetail.head_office_no else null,
                "billingAddress": if $scope.clientDetail.billing_address then $scope.clientDetail.billing_address else null,
                "office_address" : if $scope.clientDetail.office_address then $scope.clientDetail.office_address else null,
                "reservation_email": if $scope.clientDetail.reservation_email then $scope.clientDetail.reservation_email else null ,
                "user_contact_no": if $scope.clientDetail.user_contact_no then $scope.clientDetail.user_contact_no else null,
                "client_since": if $scope.clientDetail.client_since then $scope.clientDetail.client_since else null,
                "office_hours": if $scope.clientDetail.office_hours then $scope.clientDetail.office_hours else null,
                "redemption_password": if $scope.clientDetail.redemption_password then $scope.clientDetail.redemption_password else null,
                "about_company": if $scope.clientDetail.about_company then $scope.clientDetail.about_company  else null
          }

          # SET LOGO
          logo_id = null
          if task != "delete_logo"
              if ($scope.$$childTail.uploadresponse)
                #console.log($scope.$$childTail.uploadresponse)
                logo_id = $scope.$$childTail.uploadresponse.logo_id
              else
                logo_id = $scope.clientDetail.logo.id

          sm_client_data.organisation['logo'] = logo_id

          # SET BANNER
          banner_id = []
          if $scope.clientDetail.banners && $scope.clientDetail.banners.length > 0
              angular.forEach $scope.clientDetail.banners, (bn)->
                if task != "delete_banner" || bn.id != obj.id
                    banner_id.push(bn.id)
              if ($scope.$$childTail.uploadbanner)
                banner_id.push($scope.$$childTail.uploadbanner.logo_id)
          else
            banner_id = $scope.$$childTail.uploadbanner.logo_id
          sm_client_data.organisation['banners'] = banner_id
          #console.log(sm_client_data.organisation)

          clientService.update {org_id:$scope.clientDetail.id}, sm_client_data, (res) ->
            if typeof res.organisation == 'object'
              if task == "delete_logo"
                Images.delete($scope.clientDetail._links.logo.href).then  (res) ->
                    if res.status == 204
                        location.reload()
                    return
                , (error) ->
                    console.log error
                    if error.status == 500
                      $scope.clientDetail.logo = null
              else if task == "delete_banner" && typeof obj == 'object'
                Images.delete(config.path.baseURL + obj._links.self.href).then  (res) ->
                    if res.status == 204
                        $timeout ()->
                            location.reload()
                        , 300
                    return
                , (error) ->
                    console.log error
                    if error.status == 500
                      $scope.clientDetail.logo = null
              else
                $timeout ()->
                    location.reload()
                , 300
          , (error) ->
              alert error.status + ' : Try later and new company code'

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
      # https://api.sg-benefits.com/api/providers/sonata.media.provider.image/media
      # config.path.baseURL + config.path.upload + 'image/media'

      $scope.urlUpload = config.path.baseURL + config.path.upload + 'image/media'
      # $scope.urlUpload  = 'https://api.sg-benefits.com/media/67'
      $scope.uploadButtonLabel = 'Upload file'

      # DEL LOGO
      $scope.delLogo   = () ->
        if typeof $scope.clientDetail._links.logo == 'object' && $scope.clientDetail._links.logo.href
          $scope.updateClient("delete_logo", null)

      # DEL BANNER
      $scope.delBanner = (banner) ->
        #console.log $scope.clientDetail._links
        # $scope.clientDetail._links.logo.href
        if typeof $scope.clientDetail._links.banners == 'object' && $scope.clientDetail._links.banners.href
            $scope.updateClient("delete_banner", banner)


      # DEL CLIENT
      $scope.deleteClient   = (client) ->
        # console.log client
        r = confirm("Do you want to delete this client \"" + client.name + "\"?")
        if r == true
          ClientAPI.go('DELETE', client._links.self.href).then  (res) ->
            location.reload()
            return true
          , (error) ->
            # console.log error
            alert error.status + ' : Try later'
        return

      # NEW CLIENT
      $scope.co   = null
      $scope.rule =
        validMail : /^[-a-z0-9~!$%^&*_=+}{\'?]+(\.[-a-z0-9~!$%^&*_=+}{\'?]+)*@([a-z0-9_][-a-z0-9_]*(\.[-a-z0-9_]+)*\.(aero|arpa|biz|com|coop|edu|gov|info|int|mil|museum|name|net|org|pro|travel|mobi|[a-z][a-z])|([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}))(:[0-9]{1,5})?$/i
        noSpace   : /[^\s\\]/

      $scope.submitNewClient = () ->
        angular.forEach $scope.frm_create_clients.$error.required, (field)->
          field.$dirty = true
          #console.log field

        if $scope.frm_create_clients.$error.required.length
          return false
        co_data =
          organisation : $scope.co
        Companies.post(config.path.baseURL + config.path.clients, co_data ).then  (res) ->
            console.log res
            if typeof res == 'object' && res.status == 201
              console.log "OK, SAVED"
            else
              alert error.status + ' : Try later'
            location.reload()
            return true
        , (error) ->
          alert error.status + ' : Try later and new company code'

        return


  ])
