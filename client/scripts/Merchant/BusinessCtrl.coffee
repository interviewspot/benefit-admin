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
            post_promotions: config.path.baseURL + '/promotions'
            types   : config.path.baseURL + '/promotion/types'

        _getBusiness = () ->
            Businesses.get(_URL.detail).then  (bus) ->
                if bus.status != 200 || typeof bus != 'object'
                    return
                $scope.business = bus.data
                #console.log(bus.data);
                # 1.1 GET PROMOTIONS
                if(bus.data._links.promotions)
                    Businesses.get(bus.data._links.promotions.href).then  (pro) ->
                        if pro.status != 200 || typeof pro != 'object'
                            return
                        $scope.business.promotions = pro.data
                        #console.log(res.data)
                    , (error) ->
                        console.log error
                # 1.2 GET OUTLETS
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
            #console.log $scope.business

            Businesses.post($scope.business._links.self.href + '/outlets', new_data ).then  (res) ->
                if typeof res == 'object' && res.status == 201
                    $timeout ()->
                        location.reload()
                    , 300
                    return
            , (error) ->
                alert error.status + ' : Try again later'

            return

        # 5. DELETE OUTLET
        $scope.removeOutlet = (outlet) ->
            r = confirm("Do you want to delete this outlet \"" + outlet.name + "\"?")
            if r == true
                Businesses.delete(outlet._links.self.href).then  (res) ->
                    if typeof res == 'object' && res.status == 204
                        #$scope.infoUpdated = 'Deleted outlet successfully!'
                        $timeout ()->
                            window.location.reload()
                        , 300
                        return
                , (error) ->
                    alert error.status + ': Error, refresh & try again !'
            return

        # 6. ADD PROMOTION

        $scope.submitNewPromotion = () ->
            angular.forEach $scope.frm_create_promotion.$error.required, (field)->
                field.$dirty = true
            if $scope.frm_create_promotion.$error.required.length || !$scope.frm_create_promotion.$valid
                return false

            new_data =
                promotion :
                    title               : $scope.promotion.title
                    estimated_value     : $scope.promotion.estimated_value
                    discount_amount     : $scope.promotion.discount_amount || 0
                    offer_limit         : $scope.promotion.offer_limit || 0
                    weekly_limit        : $scope.promotion.weekly_limit || 0
                    monthly_limit       : $scope.promotion.monthly_limit || 0
                    yearly_limit        : $scope.promotion.yearly_limit || 0
                    organisation_limit  : $scope.promotion.organisation_limit || 0
                    user_limit          : $scope.promotion.user_limit
                    #effective_from      : $scope.promotion.effective_from
                    #expire_on           : $scope.promotion.expire_on
                    active              : $scope.promotion.active
                    type                : $scope.promotion.type
                    business            : $scope.businessId

            effective_from = $scope.promotion.effective_from || ''
            if(effective_from != '')
                effective_from = $filter('date')(new Date(effective_from), 'yyyy-MM-ddT00:00:00+0000')
                new_data.promotion.effective_from = effective_from

            expire_on = $scope.promotion.expire_on || ''
            if(expire_on != '')
                expire_on = $filter('date')(new Date(expire_on), 'yyyy-MM-ddT00:00:00+0000')
                new_data.promotion.expire_on = expire_on


            #console.log new_data

            Businesses.post(_URL.post_promotions, new_data ).then  (res) ->
                if typeof res == 'object' && res.status == 201
                    $timeout ()->
                        location.reload()
                    , 300
                    return
            , (error) ->
                alert error.status + ' : Try again later'

            return

        # 6.1 open date picker

        # 6.1.1 for Effective From
        $scope.openStartDatepicker  = ($event) ->
            $event.preventDefault()
            $event.stopPropagation()
            $scope.datepickerStartOpened = true

        # 6.1.2 for Expire On
        $scope.openEndDatepicker  = ($event) ->
            $event.preventDefault()
            $event.stopPropagation()
            $scope.datepickerEndOpened = true

        # 6.2 get types for dropdown list
        _getTypes = () ->
            Businesses.get(_URL.types).then  (res) ->
                if res.status != 200 || typeof res != 'object'
                    return
                #console.log(res.data)
                if res.data._embedded.items.length > 0
                    $scope.promotionTypes = res.data._embedded.items
                else
                    $scope.promotionTypes = []
            , (error) ->
                console.log error
        _getTypes()

        # 5. DELETE OUTLET
        $scope.removePromotion = (promotion) ->
            r = confirm("Do you want to delete this promotion \"" + promotion.title + "\"?")
            if r == true
                Businesses.delete(promotion._links.self.href).then  (res) ->
                    if typeof res == 'object' && res.status == 204
                        #$scope.infoUpdated = 'Deleted outlet successfully!'
                        $timeout ()->
                            window.location.reload()
                        , 300
                        return
                , (error) ->
                    alert error.status + ': Error, refresh & try again !'
            return

        # x. ONLOAD
        _getBusiness();

])

# --------------------------------------------
# OutletCtrl for single outlet page
# 1. GET OUTLET by ID
# 2. UPDATE OUTLET
# 3. DELETE OUTLET
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
                #console.log(out.data)
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

            #$scope.send_data = new_data

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
                Businesses.delete($scope.outlet._links.self.href).then  (res) ->
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

# --------------------------------------------
# PromotionCtrl for single outlet page
# 1. GET PROMOTION by ID
# 2. UPDATE PROMOTION
# --------------------------------------------
.controller('PromotionCtrl', [
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
        $scope.promotionId     =  if  $routeParams.promotionId then $routeParams.promotionId.trim() else false

        if !$scope.businessId
            location.href = '#/merchant/' + $scope.clientId + '/business'
            return
        if !$scope.promotionId
            location.href = '#/merchant/' + $scope.clientId + '/business/' + $scope.businessId
            return

        # 1. GET PROMOTION by ID
        _URL =
            detail : config.path.baseURL + '/promotions/' + $scope.promotionId
            types   : config.path.baseURL + '/promotion/types'

        _getPromotion = () ->
            Businesses.get(_URL.detail).then  (pro) ->
                if pro.status != 200 || typeof pro != 'object'
                    return
                $scope.promotion = pro.data
                #console.log(pro.data)
                if(pro.data._links.type)
                    Businesses.get(pro.data._links.type.href).then  (type) ->
                        if type.status != 200 || typeof type != 'object'
                            return
                        $scope.promotion.type = type.data.id
                        #console.log($scope.promotion.type)
                    , (error) ->
                        console.log error
            , (error) ->
                console.log error

        # 1.1 open date picker

        # 1.1.1 for Effective From
        $scope.openStartDatepicker  = ($event) ->
            $event.preventDefault()
            $event.stopPropagation()
            $scope.datepickerStartOpened = true

        # 1.1.1 for Expire On
        $scope.openEndDatepicker  = ($event) ->
            $event.preventDefault()
            $event.stopPropagation()
            $scope.datepickerEndOpened = true

        # 1.2 get types for dropdown list
        _getTypes = () ->
            Businesses.get(_URL.types).then  (res) ->
                if res.status != 200 || typeof res != 'object'
                    return
                #console.log(res.data)
                if res.data._embedded.items.length > 0
                    $scope.promotionTypes = res.data._embedded.items
                else
                    $scope.promotionTypes = []
            , (error) ->
                console.log error
        _getTypes()

        # 2. UPDATE PROMOTION
        $scope.isDisable = true
        $scope.updatePromotion = () ->
            angular.forEach $scope.frm_update_promotion.$error.required, (field)->
                field.$dirty = true
            if $scope.frm_update_promotion.$error.required.length || !$scope.frm_update_promotion.$valid
                return false

            new_data =
                promotion :
                    title               : $scope.promotion.title
                    discount_amount     : $scope.promotion.discount_amount || 0
                    estimated_value     : $scope.promotion.estimated_value
                    offer_limit         : $scope.promotion.offer_limit || 0
                    weekly_limit        : $scope.promotion.weekly_limit || 0
                    monthly_limit       : $scope.promotion.monthly_limit || 0
                    yearly_limit        : $scope.promotion.yearly_limit || 0
                    organisation_limit  : $scope.promotion.organisation_limit || 0
                    user_limit          : $scope.promotion.user_limit
                    #effective_from      : $scope.promotion.effective_from
                    #expire_on           : $scope.promotion.expire_on
                    active              : $scope.promotion.active
                    type                : $scope.promotion.type
                    business            : $scope.businessId

            effective_from = $scope.promotion.effective_from || ''
            if(effective_from != '')
                effective_from = $filter('date')(new Date(effective_from), 'yyyy-MM-ddT00:00:00+0000')
                new_data.promotion.effective_from = effective_from

            expire_on = $scope.promotion.expire_on || ''
            if(expire_on != '')
                expire_on = $filter('date')(new Date(expire_on), 'yyyy-MM-ddT00:00:00+0000')
                new_data.promotion.expire_on = expire_on

            #console.log new_data

            Businesses.put($scope.promotion._links.self.href, new_data ).then  (res) ->
                if typeof res == 'object' && res.status == 204
                    $scope.infoUpdated = "Update Successfully!"
            , (error) ->
                alert error.status + ' : Error, refresh & try again !'
            return

        # 3. DELETE PROMOTION
        $scope.deletePromotion = () ->
            r = confirm("Do you want to delete this promotion \"" + $scope.promotion.title + "\"?")
            if r == true
                Businesses.delete($scope.promotion._links.self.href).then  (res) ->
                    if typeof res == 'object' && res.status == 204
                        $scope.infoUpdated = 'Deleted promotion successfully!'
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
        _getPromotion();

])
