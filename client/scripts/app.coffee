'use strict';

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

    # Custom modules
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
    #Khai bao app khi tao
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
            'clients/list-clients', 'clients/add', 'clients/view', 'clients/company', 'clients/edit_company','clients/create-new-handbook','clients/tab-view',
            'clients/client'
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
        $routeProvider
            .when('/', { redirectTo: '/merchants/list-merchant'} )
            .when('/404', { templateUrl: 'views/pages/404.html'} )
            .otherwise( redirectTo: '/404' )

        HateoasInterceptorProvider.transformAllResponses()
        HateoasInterfaceProvider.setLinksKey("_links")
        HateoasInterfaceProvider.setHalEmbedded("_embedded")
        $sceDelegateProvider.resourceUrlWhitelist(['self', 'https://api.sg-benefits.com/**'])
        $httpProvider.defaults.headers.common = {
            'x-username': 'kenneth.yap@ap.magenta-consulting.com'
            'x-password': 'p@ssword'
        }
])
