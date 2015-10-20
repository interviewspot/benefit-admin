'use strict'
angular.module('app.merchants', [])
# --------------------------------------------
# Companies in Merchant
# 1. GET Companies (a local function)
# 2. PAGING, setup paging
# 2.1 On Number Per Page Change
# 2.2 Goto PAGE
# 3. ONLOAD LISTING COMPANIES
# --------------------------------------------
.controller('merchantCtrl', [
    '$scope'
    , '$filter'
    , '$location'
    , '$routeParams'
    , 'config'
    , 'Companies'
    ($scope, $filter, $location, $routeParams, config, Companies) ->



        # 1. GET COMPANIES Fn
        _getCompanies = (limit, goPage) ->
            Companies.get(config.path.baseURL + config.path.clients + '?limit=' + limit + '&page=' + goPage).then  (res) ->
                if res.status != 200 || typeof res != 'object'
                    return

                $scope.companies       = res.data
                $scope.companies.items = res.data._embedded.items
                return
            , (error) ->
                console.log error

        # 2. PAGING, setup paging
        $scope.numPerPageOpt = [3, 5, 10, 20]
        $scope.numPerPage    = $scope.numPerPageOpt[2]
        $scope.currentPage   = 1
        $scope.filteredUsers = []
        $scope.currentPageUsers = []

        # 2.1 On Number Per Page Change
        $scope.onNPPChange = () ->
            _getCompanies($scope.numPerPage, $scope.currentPage)

        # 2.2 Goto PAGE
        $scope.gotoPage = (page) ->
            _getCompanies($scope.numPerPage, $scope.currentPage)

        # 3. ONLOAD LIST USERS
        _getCompanies($scope.numPerPage, $scope.currentPage);

        return
])
# --------------------------------------------
# Companies in Merchant
# 1. GET Companies (a local function)
# 2. PAGING, setup paging
# 2.1 On Number Per Page Change
# 2.2 Goto PAGE
# 3. ONLOAD LISTING COMPANIES
# 4. Submit Form Offer
# 5. Open Datepicker
# 5.1 Set mindate
# --------------------------------------------
.controller('merchantDetailCtrl', [
    '$scope'
    , '$filter'
    , '$location'
    , '$routeParams'
    , 'config'
    , 'Companies'
    ($scope, $filter, $location, $routeParams, config, Companies) ->
        console.log 'OK'
        $scope.clientId =  $routeParams.clientId
        console.log $scope.clientId


        # 1. GET COMPANIES Fn
        _getCompany = (clientId) ->
            Companies.get(config.path.baseURL + config.path.clients + '/' + clientId).then  (res) ->
                if res.status != 200 || typeof res != 'object'
                    return
                console.log res.data
                $scope.client         = res.data
                # $scope.client.items = res.data._embedded.items
                return
            , (error) ->
                console.log error

        # ----------------------------------
        # 2. MENU TAB
        # menu active
        $scope.isActive = (path) ->
            if $location.path().search(path) >= 0
                return 'active'
        # 2.1 TAB LINK
        _prefix_url  = '#/merchant/' + $scope.clientId
        $scope.page_tabUrls   =
            "info"       : _prefix_url + '/info'
            "outlets"    : _prefix_url + '/outlets'
            "offers"     : _prefix_url + '/offers'
            "reports"    : _prefix_url + '/reports'
            "campaigns"  : _prefix_url + '/campaigns'

        # ----------------------------------
        # 3. FORM a OFFER
        $scope.offer_items = [
            {
                "id"   : 1
                "name" : "Main course"
            }
            {
                "id"   : 2
                "name" : "Main course 2"
            }
            {
                "id"   : 3
                "name" : "Main course 3"
            }
        ]

        for i, item of $scope.offer_items
            $scope.offer_items[i]['open_frm'] = 0
        # 3.1 LOAD DATA API : OFFERS
        # 3.2 CLICK OPEN FORM
        $scope.op_form = (key) ->
            console.log key
            $scope.offer_items[key]['open_frm'] = !$scope.offer_items[key]['open_frm']
            return

        # 4. Submit Form Offer
        $scope.validForm = (index) ->
            $scope.offer_items[index]['ipt'] = {}
            if !$scope.offer_items[index].name || ($scope.offer_items[index].name && $scope.offer_items[index].name.length < 4)
                $scope.offer_items[index].ipt['name'] = 'error'

        # 5. Open Datepicker
        $scope.open  = ($event, index) ->
            $event.preventDefault();
            $event.stopPropagation();
            $scope.offer_items[index].effdate = {}

            $scope.offer_items[index].effdate.opened = true;

        $scope.expire  = ($event, index) ->
            $event.preventDefault();
            $event.stopPropagation();
            $scope.offer_items[index].expdate = {}

            $scope.offer_items[index].expdate.opened = true;

        #$scope.formats = ['dd-MMMM-yyyy']


        # 5.1 Set mindate
        $scope.minDate = new Date();

        # x. ONLOAD
        _getCompany($scope.clientId)
        return
])
