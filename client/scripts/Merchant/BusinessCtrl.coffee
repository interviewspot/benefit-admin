'use strict'
angular.module('app.businesses', [])
# --------------------------------------------
# Users in User TAB of Client
# 1. GET USERS (a local function)
# 2. PAGING, setup paging
# 2.1 On Number Per Page Change
# 2.2 Goto PAGE
# 3. ONLOAD LIST USERS
# --------------------------------------------
.controller('BusinessesCtrl', [
    '$scope'
    , '$filter'
    , 'fetchTabData'
    , '$location'
    , '$routeParams'
    , 'config'
    , '$q'
    , '$modal'
    , 'Businesses'
    , 'fetchContact'
    , '$timeout',
    ($scope, $filter, fetchTabData, $location, $routeParams, config, $q, $modal, Businesses, fetchContact, $timeout) ->

        $scope.clientId =  $routeParams.clientId
        _URL_businesses =
            list : config.path.baseURL + config.path.businesses.replace(":org_id", $routeParams.clientId)
            post : config.path.baseURL + '/businesses'

        # GET STAMPTIME FROM RFC 822 timetype
        $scope.getTime = (ndate) ->
            dateAsDateObject = new Date(Date.parse(ndate))
            return dateAsDateObject.getTime()

        # 1. GET BUSINESSES
        _getBusinesses = (limit, goPage) ->

            Businesses.get(_URL_businesses.list + '?limit=' + limit + '&page=' + goPage).then  (res) ->
                #console.log(res)
                if res.data._embedded.items.length
                    $scope.businesses = res.data
                return

        # 2. PAGING, setup paging
        $scope.numPerPageOpt = [3, 5, 10, 20]
        $scope.numPerPage    = $scope.numPerPageOpt[2]
        $scope.currentPage   = 1
        $scope.filteredUsers = []
        $scope.currentPageUsers = []

        # 2.1 On Number Per Page Change
        $scope.onNPPChange = () ->
            _getBusinesses($scope.numPerPage, $scope.currentPage)

        # 2.2 Goto PAGE
        $scope.gotoPage = (page) ->
            _getBusinesses($scope.numPerPage, $scope.currentPage)

        # 3. DELETE BUSINESS
        $scope.removeBusiness = (business) ->
            r = confirm("Do you want to delete this user \"" + business.name + "\"?")
            if r == true
                deleteUrl = _URL_businesses.post + '/'
                Businesses.delete(deleteUrl + business.id).then  (res) ->
                    if typeof res == 'object' && res.status == 204
                        $timeout ()->
                            location.reload()
                        , 300
                        return
                , (error) ->
                    alert(error.status + ': Error, refresh & try again !')
            return

        # 4. ADD BUSINESS
        $scope.submitNewBusiness = () ->
            angular.forEach $scope.frm_create_business.$error.required, (field)->
                field.$dirty = true
            if $scope.frm_create_business.$error.required.length || !$scope.frm_create_business.$valid
                return false

            new_data =
                business :
                    name            : $scope.bus.name
                    merchant_code   : $scope.bus.merchant_code
                    owner           : $scope.clientId

            #console.log new_data

            Businesses.post(_URL_businesses.post, new_data ).then  (res) ->
                if typeof res == 'object' && res.status == 201
                    $timeout ()->
                        location.reload()
                    , 300
                    return
            , (error) ->
                alert error.status + ' : Try later and new company code'

            return

        # x. ONLOAD LIST BUSINESSES
        _getBusinesses($scope.numPerPage, $scope.currentPage);

        return
])

# --------------------------------------------
# BusinessCtrl for single business page
# 1. GET BUSINESS by ID
# 2. UPDATE BUSINESS
# --------------------------------------------
.controller('BusinessCtrl', [
    '$scope'
    , '$filter'
    , 'fetchTabData'
    , '$location'
    , '$routeParams'
    , 'config'
    , '$q'
    , '$modal'
    , 'Businesses'
    , '$timeout'
    ,
    ($scope, $filter, fetchTabData, $location, $routeParams, config, $q, $modal, Businesses, $timeout) ->
        $scope.clientId =  $routeParams.clientId
        $scope.businessId   =  if $routeParams.businessId then $routeParams.businessId.trim() else false

        if !$scope.businessId
            location.href = '#/merchant/' + $scope.clientId + '/business'
            return

        # 1. GET BUSINESS by ID
        _URL =
            detail : config.path.baseURL + '/businesses/' + $scope.businessId

        _getBusiness = () ->
            Businesses.get(_URL.detail).then  (bus) ->
                if bus.status != 200 || typeof bus != 'object'
                    return
                $scope.business = bus.data
                #console.log(bus.data);
                if(bus.data._links.outlets)
                    Businesses.get(bus.data._links.outlets.href).then  (res) ->
                        if res.status != 200 || typeof res != 'object'
                            return
                        $scope.business.outlets = res.data
                        #console.log(res.data)
                    , (error) ->
                        console.log error
            , (error) ->
                console.log error

        # 2. UPDATE BUSINESSS
        $scope.isDisable = true
        $scope.updateBusiness = () ->
            angular.forEach $scope.frm_update_business.$error.required, (field)->
                field.$dirty = true
            if $scope.frm_update_business.$error.required.length || !$scope.frm_update_business.$valid
                return false

            new_data =
                business :
                    name            : $scope.business.name
                    merchant_code   : $scope.business.merchant_code

            #console.log new_data

            Businesses.put(_URL.detail, new_data ).then  (res) ->
                if typeof res == 'object' && res.status == 204
                    $scope.infoUpdated = "Update Successfully!"
            , (error) ->
                alert error.status + ' : Error, refresh & try again !'
            return

        # 3. DELETE BUSINESS
        $scope.deleteBusiness = () ->
            r = confirm("Do you want to delete this business \"" + $scope.business.name + "\"?")
            if r == true
                Businesses.delete(_URL.detail).then  (res) ->
                    if typeof res == 'object' && res.status == 204
                        $scope.infoUpdated = 'Deleted business successfully!'
                        $timeout ()->
                            clientId =  $routeParams.clientId
                            $location.path('/merchant/' + clientId + '/business')
                        , 300
                        return
                , (error) ->
                    $scope.infoUpdated = error.status + ': Error, refresh & try again !'
            return

        # 4. ADD OUTLET
        $scope.submitNewOutlet = () ->
            angular.forEach $scope.frm_create_outlet.$error.required, (field)->
                field.$dirty = true
            if $scope.frm_create_outlet.$error.required.length || !$scope.frm_create_outlet.$valid
                return false

            new_data =
                outlet :
                    name            : $scope.out.name
                    contact_no      : $scope.out.contact_no
                    business        : $scope.businessId

            #console.log new_data

            Businesses.post($scope.business._links.outlets.href, new_data ).then  (res) ->
                if typeof res == 'object' && res.status == 201
                    $timeout ()->
                        location.reload()
                    , 300
                    return
            , (error) ->
                alert error.status + ' : Try again later'

            return

        # x. ONLOAD
        _getBusiness();

])

# --------------------------------------------
# OutletCtrl for single outlet page
# 1. GET OUTLET by ID
# 2. UPDATE OUTLET
# --------------------------------------------
.controller('OutletCtrl', [
    '$scope'
    , '$filter'
    , 'fetchTabData'
    , '$location'
    , '$routeParams'
    , 'config'
    , '$q'
    , '$modal'
    , 'Businesses'
    , '$timeout'
    ,
    ($scope, $filter, fetchTabData, $location, $routeParams, config, $q, $modal, Businesses, $timeout) ->
        $scope.clientId =  $routeParams.clientId
        $scope.businessId   =  if  $routeParams.businessId then $routeParams.businessId.trim() else false
        $scope.outletId     =  if  $routeParams.outletId then $routeParams.outletId.trim() else false

        if !$scope.businessId
            location.href = '#/merchant/' + $scope.clientId + '/business'
            return
        if !$scope.outletId
            location.href = '#/merchant/' + $scope.clientId + '/business/' + $scope.businessId
            return

        # 1. GET OUTLET by ID
        _URL =
            detail : config.path.baseURL + '/businesses/' + $scope.businessId + '/outlets/' + $scope.outletId

        _getOutlet = () ->
            Businesses.get(_URL.detail).then  (out) ->
                if out.status != 200 || typeof out != 'object'
                    return
                $scope.outlet = out.data
                #console.log(out.data);
                if(out.data._links.location)
                    Businesses.get(out.data._links.location.href).then  (loc) ->
                        if loc.status != 200 || typeof loc != 'object'
                            return
                        $scope.outlet.location = loc.data
                        $scope.outlet.location.addresses = {}
                        if(loc.data._links.addresses)
                            Businesses.get(loc.data._links.addresses.href).then  (add) ->
                                if add.status != 200 || typeof add != 'object'
                                    return
                                $scope.outlet.location.addresses = add.data
                                #console.log(loc.data)
                            , (error) ->
                                console.log error
                        else
                            $scope.outlet.location.addresses.total = 0
                        #console.log(loc.data)
                    , (error) ->
                        console.log error
            , (error) ->
                console.log error

        # 2. UPDATE OUTLET
        $scope.isDisable = true
        $scope.updateOutlet = () ->
            angular.forEach $scope.frm_update_outlet.$error.required, (field)->
                field.$dirty = true
            if $scope.frm_update_outlet.$error.required.length || !$scope.frm_update_outlet.$valid
                return false

            new_data =
                outlet :
                    name            : $scope.outlet.name
                    contact_no      : $scope.outlet.contact_no
                    business        : $scope.businessId

            #console.log new_data

            Businesses.put(_URL.detail, new_data ).then  (res) ->
                if typeof res == 'object' && res.status == 204
                    $scope.infoUpdated = "Update Successfully!"
            , (error) ->
                alert error.status + ' : Error, refresh & try again !'
            return

        # 3. DELETE OUTLET
        $scope.deleteOutlet = () ->
            r = confirm("Do you want to delete this outlet \"" + $scope.outlet.name + "\"?")
            if r == true
                Businesses.delete(_URL.detail).then  (res) ->
                    if typeof res == 'object' && res.status == 204
                        $scope.infoUpdated = 'Deleted business successfully!'
                        $timeout ()->
                            clientId =  $routeParams.clientId
                            businessId = $routeParams.businessId
                            $location.path('/merchant/' + clientId + '/business/' + businessId)
                        , 300
                        return
                , (error) ->
                    $scope.infoUpdated = error.status + ': Error, refresh & try again !'
            return

        # x. ONLOAD
        _getOutlet();

])
