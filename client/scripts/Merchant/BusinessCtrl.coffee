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
    , '$timeout'
    , 'authHandler',
    ($scope, $filter, fetchTabData, $location, $routeParams, config, $q, $modal, Businesses, fetchContact, $timeout, authHandler) ->
        # 0. Authorize
        authHandler.checkLoggedIn()

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
    , 'authHandler'
    ($scope, $filter, fetchTabData, $location, $routeParams, config, $q, $modal, Businesses, $timeout, authHandler) ->
        $scope.clientId =  $routeParams.clientId
        $scope.businessId   =  if $routeParams.businessId then $routeParams.businessId.trim() else false

        if !$scope.businessId
            location.href = '#/merchant/' + $scope.clientId + '/business'
            return

        # 0. Authorize
        authHandler.checkLoggedIn()

        # 1. GET BUSINESS by ID
        _URL =
            detail : config.path.baseURL + '/businesses/' + $scope.businessId
            post_promotions: config.path.baseURL + '/promotions'
            types  : config.path.baseURL + '/promotion/types'
            tags   : config.path.baseURL + '/tags'

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
                # 1.3 GET TYPES
                if(bus.data._links.types)
                    Businesses.get(bus.data._links.types.href).then  (types) ->
                        if types.data._embedded.items.length > 0
                            $scope.business.types = types.data._embedded.items;
                        else 
                            $scope.business.types = []
                    , (error) ->
                        console.log error

                # 1.4 GET CATEGORIES
                if(bus.data._links.types)
                    Businesses.get(bus.data._links.tags.href).then  (tags) ->
                        if tags.data._embedded.items.length > 0
                            $scope.business.tags = tags.data._embedded.items;
                        else 
                            $scope.business.tags = []
                    , (error) ->
                        console.log error
            , (error) ->
                console.log error

        # 1.5 GET TAG LIST FOR AUTOCOMPLETE
        $scope.tags = {}

        $scope.tags.business_type    = []
        $scope.tags.business_category = []
        _getTags = () ->
            Businesses.get(_URL.tags).then  (res) ->
                if res.status != 200 || typeof res != 'object'
                    return
                angular.forEach res.data._embedded.items, (tag)->
                    if tag.business_type && tag.enabled
                        $scope.tags.business_type.push(tag)
                    if tag.business_category && tag.enabled
                        $scope.tags.business_category.push(tag)
                return
            , (error) ->
                console.log error
        _getTags()

        $scope.tags.getBusinessType = (query) ->
            deferred = $q.defer()
            deferred.resolve($scope.tags.business_type)
            deferred.promise

        $scope.tags.getBusinessCategory = (query) ->
            deferred = $q.defer();
            deferred.resolve($scope.tags.business_category);
            deferred.promise;

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
                    owner           : $scope.clientId
                    enabled         : true

            numType = 1
            new_data.business.types = {}
            angular.forEach $scope.business.types, (tag)->
                keyType = "types" + numType
                new_data.business.types[keyType] = {}
                new_data.business.types[keyType].name = tag.name
                new_data.business.types[keyType].enabled = true
                new_data.business.types[keyType].business_type = 1
                new_data.business.types[keyType].business_category = 0
                numType++

            numTag = 1
            new_data.business.tags = {}
            angular.forEach $scope.business.tags, (tag)->
                keyTag = "tag" + numTag
                new_data.business.tags[keyTag] = {}
                new_data.business.tags[keyTag].name    = tag.name
                new_data.business.tags[keyTag].enabled = true
                new_data.business.tags[keyTag].business_type = 0
                new_data.business.tags[keyTag].business_category = 1
                numTag++
            console.log(new_data)

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
                    enabled             : $scope.promotion.enabled
                    type                : $scope.promotion.type
                    business            : $scope.businessId
                    every_outlet_included : true

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
# 4. MAPS
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
    , 'authHandler'
    ($scope, $filter, fetchTabData, $location, $routeParams, config, $q, $modal, Businesses, $timeout, authHandler) ->
        $scope.clientId =  $routeParams.clientId
        $scope.businessId   =  if  $routeParams.businessId then $routeParams.businessId.trim() else false
        $scope.outletId     =  if  $routeParams.outletId then $routeParams.outletId.trim() else false


        if !$scope.businessId
            location.href = '#/merchant/' + $scope.clientId + '/business'
            return
        if !$scope.outletId
            location.href = '#/merchant/' + $scope.clientId + '/business/' + $scope.businessId
            return

        # 0. Authorize
        authHandler.checkLoggedIn()

        # 1. GET OUTLET by ID
        _URL =
            detail : config.path.baseURL + '/businesses/' + $scope.businessId + '/outlets/' + $scope.outletId
            address_post : config.path.baseURL + '/addresses'

        _getOutlet = () ->
            Businesses.get(_URL.detail).then  (out) ->
                if out.status != 200 || typeof out != 'object'
                    return
                $scope.outlet = out.data
                $scope.outlet.address_text = ""
                #console.log(out.data)
                if(out.data._links.location)
                    Businesses.get(out.data._links.location.href).then  (loc) ->
                        if loc.status != 200 || typeof loc != 'object'
                            return
                        $scope.outlet.location = loc.data
                        console.log loc.data
                        $scope.outlet.location_latlng = loc.data.geo_lat + " , " + loc.data.geo_lng
                        if(loc.data._links.addresses)
                            Businesses.get(loc.data._links.addresses.href).then  (add) ->
                                if add.status != 200 || typeof add != 'object'
                                    return
                                $scope.outlet.location.address = add.data._embedded.items[0]
                                $scope.outlet.address_text = add.data._embedded.items[0].value
                                #console.log(add.data)
                            , (error) ->
                                console.log error
                        console.log($scope.outlet)
                    , (error) ->
                        console.log error
            , (error) ->
                console.log error

        # 2. UPDATE OUTLET
        # $scope.resultmap = {}
        $scope.isDisable = true
        $scope.updateOutlet = () ->

            angular.forEach $scope.frm_update_outlet.$error.required, (field)->
                field.$dirty = true
            if $scope.frm_update_outlet.$error.required.length || !$scope.frm_update_outlet.$valid
                return false

            # if $scope.outlet.location_latlng && $scope.outlet.location_latlng != ""
            #     latlng = $scope.outlet.location_latlng.split(",")
            #     lat = latlng[0].trim()
            #     lng = latlng[1].trim()

            console.log $scope.resultmap

            new_data =
                outlet :
                    name            : $scope.outlet.name
                    contact_no      : $scope.outlet.contact_no

            $scope.send_data = new_data

            # outlet da co location
            if $scope.outlet.location
                new_data =
                    outlet :
                        name            : $scope.outlet.name
                        contact_no      : $scope.outlet.contact_no
                        business        : $scope.businessId
                        location        : $scope.outlet.location.id

                new_location =
                    location :
                        name            : $scope.outlet.location.name
                        geo_lat         : $scope.resultmap.lat
                        geo_lng         : $scope.resultmap.long
                        enabled         : 1

                console.log(new_location)
                Businesses.put(_URL.detail, new_data ).then  (res) ->
                    if typeof res == 'object' && res.status == 204
                        if new_location
                            Businesses.put($scope.outlet.location._links.self.href, new_location ).then  (loc) ->
                                if typeof loc == 'object' && loc.status == 204
                                    if $scope.outlet.location._links.addresses
                                        _put_address($scope.outlet.location, $scope.outlet.location.address)
                                    else
                                        _post_address($scope.outlet.location.id, $scope.outlet.address_text)
                                    $scope.infoUpdated = "Update Successfully!"
                        else
                            $scope.infoUpdated = "Update Successfully!"
                , (error) ->
                    alert error.status + ' : Error, refresh & try again !'
                return
            else
            # outlet chua co location
                new_location =
                    location :
                        name            : $scope.outlet.address_text
                        geo_lat         : $scope.resultmap.lat
                        geo_lng         : $scope.resultmap.long
                        enabled         : 1
                $q.all([
                    _post_location(new_location, $scope.outlet)
                ]).then (data) ->
                    new_data =
                        outlet :
                            name            : $scope.outlet.name
                            contact_no      : $scope.outlet.contact_no
                            business        : $scope.businessId
                            location        : data[0]
                    _post_address(data[0], $scope.outlet.address_text)
                    Businesses.put(_URL.detail, new_data ).then  (res) ->
                        if typeof res == 'object' && res.status == 204
                            $scope.infoUpdated = "Update Successfully!"
                    , (error) ->
                        alert error.status + ' : Error, refresh & try again !'

        # 2.1 POST LOCATION
        _post_location = (location, outlet) ->
            deferred = $q.defer()
            if outlet._links['location.post']
                Businesses.post(outlet._links['location.post'].href, location).then  (loc) ->
                    if typeof loc == 'object' && loc.status == 201
                        location_id = loc.headers().location.split('/')[2]
                        deferred.resolve(location_id)
                , (error) ->
                    alert error.status + ' : Cannot create location!'
            return deferred.promise

        # 2.2 POST ADDRESS
        _post_address = (location_id, value) ->
            new_address =
                address :
                    value       : value,
                    location    : location_id
            console.log new_address
            if location_id
                Businesses.post(_URL.address_post, new_address).then  (add) ->
                    return
                , (error) ->
                    alert error.status + ' : Cannot create address !'

        # 2.3 PUT ADDRESS
        _put_address = (location, address) ->
            new_address =
                address :
                    value       : $scope.outlet.address_text,
                    location    : location.id
            console.log new_address
            if address._links.self
                Businesses.put(address._links.self.href, new_address).then  (add) ->
                    return
                , (error) ->
                    alert error.status + ' : Cannot update address !'

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
        # 4. MAPS
        #$scope.data_map = {
            #task   : 'route',
            #center : {lat: 41.85, lng: -87.65},
            #zoom   : 6,
            #route  : {
                #start : 'Vesterbrogade 65, 1720 København V',
                #end   : 'Islands Brygge St. (Metro)',
            #}
        #}

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
    , 'authHandler'
    ($scope, $filter, fetchTabData, $location, $routeParams, config, $q, $modal, Businesses, $timeout, authHandler) ->
        $scope.clientId =  $routeParams.clientId
        $scope.businessId   =  if  $routeParams.businessId then $routeParams.businessId.trim() else false
        $scope.promotionId     =  if  $routeParams.promotionId then $routeParams.promotionId.trim() else false

        if !$scope.businessId
            location.href = '#/merchant/' + $scope.clientId + '/business'
            return
        if !$scope.promotionId
            location.href = '#/merchant/' + $scope.clientId + '/business/' + $scope.businessId
            return

        # 0. Authorize
        authHandler.checkLoggedIn()

        # 1. GET PROMOTION by ID
        _URL =
            detail : config.path.baseURL + '/promotions/' + $scope.promotionId
            types   : config.path.baseURL + '/promotion/types'
            outlets : config.path.baseURL + '/businesses/' + $scope.businessId + '/outlets'

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
                if(pro.data._links.retail_outlets)
                    Businesses.get(pro.data._links.retail_outlets.href).then  (out) ->
                        if out.status != 200 || typeof out != 'object'
                            return
                        $scope.promotion.outlets = out.data._embedded.items
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
                    enabled              : $scope.promotion.enabled
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

        # 4. GET OUTLETS SOURCE
        $scope.getOutlets = (query) ->
            Businesses.get(_URL.outlets + "?limit=99999").then  (res) ->
                if res.status != 200 || typeof res != 'object'
                    return []
                #console.log(res.data)
                if res.data._embedded.items.length > 0
                    return res.data._embedded.items
                else
                    return []
            , (error) ->
                console.log error

        # 5. INSERT NEW OUTLET
        $scope.insertNewOutlet = () ->
            angular.forEach $scope.frm_create_outlet.$error.required, (field)->
                field.$dirty = true
            if $scope.frm_create_outlet.$error.required.length || !$scope.frm_create_outlet.$valid
                return false

            if $scope.outlets.chosenList.length <= 0
                $scope.displayError = true
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
                    effective_from      : $scope.promotion.effective_from
                    expire_on           : $scope.promotion.expire_on
                    enabled              : $scope.promotion.enabled
                    type                : $scope.promotion.type
                    business            : $scope.businessId

            new_data.promotion.retail_outlets = []
            if($scope.promotion.outlets != undefined && $scope.promotion.outlets.length > 0)
                angular.forEach $scope.promotion.outlets, (outlet)->
                    new_data.promotion.retail_outlets.push(outlet.id)

            angular.forEach $scope.outlets.chosenList, (outlet)->
                if(new_data.promotion.retail_outlets.indexOf(outlet.id) == -1)
                    new_data.promotion.retail_outlets.push(outlet.id)

            $scope.insertData = new_data
            
            Businesses.put($scope.promotion._links.self.href, new_data ).then  (res) ->
                if typeof res == 'object' && res.status == 204
                    $scope.infoUpdated = "Update Successfully!"
                    $timeout ()->
                        location.reload()
                    , 300
            , (error) ->
                alert error.status + ' : Error, refresh & try again !'
            return

        # 6. REMOVE OUTLET
        $scope.removeOutlet = (outlet) ->
            r = confirm("Do you want to remove this outlet \"" + outlet.name + "\"?")
            if r == true
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
                        effective_from      : $scope.promotion.effective_from
                        expire_on           : $scope.promotion.expire_on
                        enabled              : $scope.promotion.enabled
                        type                : $scope.promotion.type
                        business            : $scope.businessId

                new_data.promotion.retail_outlets = []
                if($scope.promotion.outlets.length > 0)
                    angular.forEach $scope.promotion.outlets, (out)->
                        if(out.id != outlet.id)
                            new_data.promotion.retail_outlets.push(out.id)

                #$scope.insertData = new_data
                #console.log(new_data)
                Businesses.put($scope.promotion._links.self.href, new_data ).then  (res) ->
                    if typeof res == 'object' && res.status == 204
                        $scope.infoUpdated = "Delete Successfully!"
                        $timeout ()->
                           location.reload()
                        , 300
                , (error) ->
                    alert error.status + ' : Error, refresh & try again !'
            return

        # x. ONLOAD
        _getPromotion();

])
