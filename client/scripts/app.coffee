'use strict'

angular.module('app', [
    # Angular modules
    'ngRoute'
    'ngAnimate'
    'ngResource'
    'hateoas'

    # 3rd Party Modules
    'ui.bootstrap'
    'easypiechart'
    'mgo-angular-wizard'
    'textAngular'
    'ui.tree'
    'ngMap'
    'ngTagsInput'
    'duScroll'
    'ui.tinymce'
    'angular.filter'
    'ngTouch'
    'angular-loading-bar'
    
    # Custom modules
    'app.constant'
    'app.controllers'
    'app.directives'
    'app.localization'
    'app.nav'
    'app.ui.ctrls'
    'app.ui.directives'
    'app.ui.services'
    'app.ui.map'
    'app.form.validation'
    'app.ui.form.ctrls'
    'app.ui.form.directives'
    'app.tables'
    'app.task'
    'app.chart.ctrls'
    'app.chart.directives'
    'app.page.ctrls'
    'app.merchants'
    'app.clients'
    'app.client.services'
    'app.handbook.services'
    'app.handbook.sections.services'
    'app.links.services'
    'app.contacts'
    'app.contacts.services'
    'app.handbooks'
    'app.handbook_section'
    'app.handbook_info'
    'app.users'
    'app.users.services'
    'app.businesses'
    'app.businesses.services'
    'app.employee'
    'app.notifications'
    'app.login'
    'app.merchants.html' # REMOVE AFTER DONE LAYOUT
    'app.maps.directives' # directive maps
    #'app.offerdirective' # DIRECTIVE FORM OFFER
    #Khai bao app khi tao

    # Upload file dependencies
    'ngFileUpload'
    'app.phpjs.services'

])
    
.config([
    '$routeProvider', 'HateoasInterceptorProvider', 'HateoasInterfaceProvider', '$sceDelegateProvider', '$httpProvider',
    ($routeProvider, HateoasInterceptorProvider, HateoasInterfaceProvider, $sceDelegateProvider, $httpProvider) ->

        routes = [
            'dashboard'
            'ui/typography', 'ui/buttons', 'ui/icons', 'ui/grids', 'ui/widgets', 'ui/components', 'ui/timeline', 'ui/nested-lists', 'ui/pricing-tables', 'ui/maps'
            'tables/static', 'tables/dynamic', 'tables/responsive'
            'forms/elements', 'forms/layouts', 'forms/validation', 'forms/wizard'
            'charts/charts', 'charts/flot', 'charts/morris'
            'pages/404', 'pages/500', 'pages/blank', 'pages/forgot-password', 'pages/invoice', 'pages/lock-screen', 'pages/profile', 'pages/signin', 'pages/signup'
            'mail/compose', 'mail/inbox', 'mail/single'
            'tasks/tasks'
            'merchants/list-merchant', 'merchants/add', 'merchants/view', 'merchants/company', 'merchants/edit_company'
            # CLIENT MANAGEMENT
            # 'clients/index',
            'clients/add',
            'clients/view',
            'clients/company',
            'clients/edit_company',
            'clients/create-new-handbook',
            'clients/tab-view',
            'clients/client',
            'clients/client-user',
            'clients/client-handbook',
            'clients/client-policies',
            'clients/client-insurance',
            'clients/client-healthcare',
            'clients/client-notifications',
            'clients/client-imerchant',
            'login/login'
        ]

        setRoutes = (route) ->
            url = '/' + route
            config =
                templateUrl: 'views/' + route + '.html'

            $routeProvider.when(url, config)
            return $routeProvider

        routes.forEach( (route) ->
            setRoutes(route)
        )

        # SET ROUTE MANUAL ---------------------------------------
        $routeProvider
            .when('/', { redirectTo: '/merchant'} )
            .when('/404', { templateUrl: 'views/pages/404.html'} )

        # MERCHANT
        $routeProvider
            .when('/merchant', {
                templateUrl: 'views/merchant/merchant.html'
            })
            .when('/merchant/:clientId/info', {
                templateUrl: 'views/merchant/merchant-detail_info.html'
            })
            .when('/merchant/:clientId/outlets', {
                templateUrl: 'views/merchant/merchant-detail_outlets.html'
            })
            .when('/merchant/:clientId/offers', {
                templateUrl: 'views/merchant/merchant-detail_offers.html'
            })
            .when('/merchant/:clientId/reports', {
                templateUrl: 'views/merchant/merchant-detail_reports.html'
            })
            .when('/merchant/:clientId/campaigns', {
                templateUrl: 'views/merchant/merchant-detail_campaigns.html'
            })
            .when('/merchant/:clientId/business', {
                templateUrl: 'views/merchant/merchant-detail_businesses.html'
            })
            .when('/merchant/:clientId/business/:businessId', {
                templateUrl: 'views/merchant/merchant-detail_business.html'
            })
            .when('/merchant/:clientId/business/:businessId/outlet/:outletId', {
                templateUrl: 'views/merchant/merchant-detail_outlet.html'
            })
            .when('/merchant/:clientId/business/:businessId/promotion/:promotionId', {
                templateUrl: 'views/merchant/merchant-detail_promotion.html'
            })


        # CLIENTS MANAGEMENT
        $routeProvider
            .when('/clients', {
                templateUrl: 'views/clients/clients.html'
            })
            .when('/clients/:clientId', { 
                templateUrl: 'views/clients/client-info.html'
            })
            # info TAB
            .when('/clients/:clientId/info', { 
                templateUrl: 'views/clients/client-info.html'
            })
            # users TAB
            .when('/clients/:clientId/user', {
                templateUrl: 'views/clients/client-user.html'
            })
            .when('/clients/:clientId/user/:userId', {
                templateUrl: 'views/clients/user/detail_warp.html'
            })
            .when('/clients/:clientId/new-user', {
                templateUrl: 'views/clients/user/detail_new_warp.html'
            })

            # HANDBOOK TAB
            .when('/clients/:clientId/handbooks', { 
                templateUrl: 'views/clients/client-handbook.html'
            })
            .when('/clients/:clientId/handbooks/:handbookId', {
                templateUrl: 'views/handbooks/handbook.html'
            })
            # Notifi TAB
            .when('/clients/:clientId/notifications', {
                templateUrl: 'views/clients/client-notifications.html'
            })
            # policies TAB
            .when('/clients/:clientId/policies', { 
                templateUrl: 'views/clients/client-policies.html'
            })
            .when('/clients/:clientId/insurance', { 
                templateUrl: 'views/clients/client-insurance.html'
            })
            .when('/clients/:clientId/healthcare', { 
                templateUrl: 'views/clients/client-healthcare.html'
            })
            .when('/clients/:clientId/imerchant', { 
                templateUrl: 'views/clients/client-imerchant.html'
            })

        # EMPLOYEE MANAGEMENT
        $routeProvider
            .when('/employees', {
                templateUrl: 'views/employee/employee.html'
            })

        # LOGIN
        $routeProvider
            .when('/login', {
                templateUrl: 'views/login/login.html'
            })

            .otherwise( redirectTo: '/404' )

        # HateoasInterceptorProvider.transformAllResponses()
        # HateoasInterfaceProvider.setLinksKey("_links")
        # HateoasInterfaceProvider.setHalEmbedded("_embedded")
        # x-username: kenneth.yap@ap.magenta-consulting.com
        # x-password: p@ssword
        $sceDelegateProvider.resourceUrlWhitelist(['self', 'https://api.sg-benefits.com/**'])
        $httpProvider.defaults.headers.common = {
            'x-username': 'kenneth.yap@ap.magenta-consulting.com'
            'x-password': 'p@ssword'
        }
])
