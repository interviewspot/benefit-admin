(function() {
  'use strict';
  angular.module('app', ['ngRoute', 'ngAnimate', 'ngResource', 'hateoas', 'ui.bootstrap', 'easypiechart', 'mgo-angular-wizard', 'textAngular', 'ui.tree', 'ngMap', 'ngTagsInput', 'duScroll', 'ui.tinymce', 'angular.filter', 'ngTouch', 'angular-loading-bar', 'LocalStorageModule', 'app.constant', 'app.controllers', 'app.directives', 'app.localization', 'app.nav', 'app.ui.ctrls', 'app.ui.directives', 'app.ui.services', 'app.ui.map', 'app.form.validation', 'app.ui.form.ctrls', 'app.ui.form.directives', 'app.tables', 'app.task', 'app.chart.ctrls', 'app.chart.directives', 'app.page.ctrls', 'app.merchants', 'app.clients', 'app.client.services', 'app.handbook.services', 'app.handbook.sections.services', 'app.links.services', 'app.contacts', 'app.contacts.services', 'app.handbooks', 'app.handbook_section','app.handbook_section_view', 'app.handbook_info', 'app.users', 'app.users.services', 'app.businesses', 'app.businesses.services', 'app.employee', 'app.notifications', 'app.login', 'app.merchants.html', 'app.maps.directives', 'ngFileUpload', 'app.phpjs.services','dndLists','ngHandsontable','autocomplete']).config([
    '$routeProvider', 'HateoasInterceptorProvider', 'HateoasInterfaceProvider', '$sceDelegateProvider', '$httpProvider', function($routeProvider, HateoasInterceptorProvider, HateoasInterfaceProvider, $sceDelegateProvider, $httpProvider) {
      var routes, setRoutes;
      routes = ['dashboard', 'ui/typography', 'ui/buttons', 'ui/icons', 'ui/grids', 'ui/widgets', 'ui/components', 'ui/timeline', 'ui/nested-lists', 'ui/pricing-tables', 'ui/maps', 'tables/static', 'tables/dynamic', 'tables/responsive', 'forms/elements', 'forms/layouts', 'forms/validation', 'forms/wizard', 'charts/charts', 'charts/flot', 'charts/morris', 'pages/404', 'pages/500', 'pages/blank', 'pages/forgot-password', 'pages/invoice', 'pages/lock-screen', 'pages/profile', 'pages/signin', 'pages/signup', 'mail/compose', 'mail/inbox', 'mail/single', 'tasks/tasks', 'merchants/list-merchant', 'merchants/add', 'merchants/view', 'merchants/company', 'merchants/edit_company', 'clients/add', 'clients/view', 'clients/company', 'clients/edit_company', 'clients/create-new-handbook', 'clients/tab-view', 'clients/client', 'clients/client-user', 'clients/client-handbook', 'clients/client-policies', 'clients/client-insurance', 'clients/client-healthcare', 'clients/client-notifications', 'clients/client-imerchant', 'login/login'];
      setRoutes = function(route) {
        var config, url;
        url = '/' + route;
        config = {
          templateUrl: 'views/' + route + '.html'
        };
        $routeProvider.when(url, config);
        return $routeProvider;
      };
      routes.forEach(function(route) {
        return setRoutes(route);
      });
      $routeProvider.when('/', {
        redirectTo: '/clients'
      }).when('/404', {
        templateUrl: 'views/pages/404.html'
      });
      $routeProvider.when('/merchant', {
        templateUrl: 'views/merchant/merchant.html'
      }).when('/merchant/:clientId/info', {
        templateUrl: 'views/merchant/merchant-detail_info.html'
      }).when('/merchant/:clientId/outlets', {
        templateUrl: 'views/merchant/merchant-detail_outlets.html'
      }).when('/merchant/:clientId/offers', {
        templateUrl: 'views/merchant/merchant-detail_offers.html'
      }).when('/merchant/:clientId/reports', {
        templateUrl: 'views/merchant/merchant-detail_reports.html'
      }).when('/merchant/:clientId/campaigns', {
        templateUrl: 'views/merchant/merchant-detail_campaigns.html'
      }).when('/merchant/:clientId/business', {
        templateUrl: 'views/merchant/merchant-detail_businesses.html'
      }).when('/merchant/:clientId/business/:businessId', {
        templateUrl: 'views/merchant/merchant-detail_business.html'
      }).when('/merchant/:clientId/business/:businessId/outlet/:outletId', {
        templateUrl: 'views/merchant/merchant-detail_outlet.html'
      }).when('/merchant/:clientId/business/:businessId/promotion/:promotionId', {
        templateUrl: 'views/merchant/merchant-detail_promotion.html'
      });
      $routeProvider.when('/clients', {
        templateUrl: 'views/clients/clients.html'
      }).when('/clients/:clientId', {
        templateUrl: 'views/clients/client-info.html'
      }).when('/clients/:clientId/info', {
        templateUrl: 'views/clients/client-info.html'
      }).when('/clients/:clientId/user', {
        templateUrl: 'views/clients/client-user.html'
      }).when('/clients/:clientId/user/:userId', {
        templateUrl: 'views/clients/user/detail_warp.html'
      }).when('/clients/:clientId/new-user', {
        templateUrl: 'views/clients/user/detail_new_warp.html'
      }).when('/clients/:clientId/categories/handbooks', {
        templateUrl: 'views/clients/client-handbook.html'
      }).when('/clients/:clientId/handbooks/:handbookId', {
        templateUrl: 'views/handbooks/handbook.html'
      }).when('/clients/:clientId/notifications', {
        templateUrl: 'views/clients/client-notifications.html'
      }).when('/clients/:clientId/policies', {
        templateUrl: 'views/clients/client-policies.html'
      }).when('/clients/:clientId/insurance', {
        templateUrl: 'views/clients/client-insurance.html'
      }).when('/clients/:clientId/healthcare', {
        templateUrl: 'views/clients/client-healthcare.html'
      }).when('/clients/:clientId/imerchant', {
        templateUrl: 'views/clients/client-imerchant.html'
      }).when('/clients/:clientId/handbooks/:handbookId/view',{
        templateUrl: 'views/handbooks/handbook_view.html'
      }).when('/clients/:clientId/contact',{
        templateUrl: 'views/handbooks/tab_handbook_contact.html'
      }).when('/clients/:clientId/categories/list' ,{
        templateUrl: 'views/clients/tab_category.html'
      }).when('/clients/:clientId/category/:categoryId', {
        templateUrl: 'views/clients/category.html'
      }).when('/clients/:clientId/category/:categoryId/addHandbooks', {
        templateUrl: 'views/clients/category_add_handbooks.html'
      }).when('/clients/:clientId/category/:categoryId/handbooksByCategory', {
        templateUrl: 'views/clients/tab_handbook.html'
      });
      $routeProvider.when('/employees', {
        templateUrl: 'views/employee/employee.html'
      });

      $routeProvider.when('/clients/:clientId/user-group/handbook-acl', {
        templateUrl: 'views/clients/user/handbook_user_group_ace.html'
      });
      $routeProvider.when('/clients/:clientId/user-group/category-acl', {
        templateUrl: 'views/clients/user/category_user_group_ace.html'
      });
      $routeProvider.when('/clients/:clientId/user-group/user-acl', {
        templateUrl: 'views/clients/user/user_user_group_ace.html'
      });
      $routeProvider.when('/clients/:clientId/user-group/user-group-acl', {
        templateUrl: 'views/clients/user/user_group_user_group_ace.html'
      });
      $routeProvider.when('/clients/:clientId/user-group/:groupId/users', {
        templateUrl: 'views/clients/user/user_by_group.html'
      });
      $routeProvider.when('/clients/:clientId/everyone', {
        templateUrl: 'views/clients/user/everyone_group.html'
      });
      $routeProvider.when('/clients/:clientId/everyone/handbooks', {
        templateUrl: 'views/clients/user/public_handbook.html'
      });
      $routeProvider.when('/clients/:clientId/user-group/:groupId/handbooks', {
        templateUrl: 'views/clients/user/handbook_by_group.html'
      });
      $routeProvider.when('/clients/:clientId/user-group/:groupId/categories', {
        templateUrl: 'views/clients/user/category_by_group.html'
      });
      $routeProvider.when('/clients/:clientId/user-group-user/:userId/handbooks', {
        templateUrl: 'views/clients/user/handbook_by_user.html'
      });

      $routeProvider.when('/clients/:clientId/account/:userId', {
        templateUrl: 'views/clients/user/account.html'
      });  
      $routeProvider.when('/498', {
        templateUrl: 'views/pages/498.html'
      });
      $routeProvider.when('/login', {
        templateUrl: 'views/login/login.html'
      }).when('/logout', {
        templateUrl: 'views/login/login.html',
        title: 'Logout',
        controller: 'logoutCtrl'
      }).otherwise({
        redirectTo: '/404'
      });
      return $sceDelegateProvider.resourceUrlWhitelist(['self', 'https://api.sg-benefits.com/**']);
    }
  ]);

}).call(this);
