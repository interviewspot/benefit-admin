'use strict'

angular.module('app.common.nav.directives', [])

.directive 'nav1',() ->
        restrict: 'A'
        templateUrl: 'views/common/nav.html'
        controller : ($scope, $route,localStorageService) ->
                user = localStorageService.cookie.get 'user'
                console.log('hello');
                if !user or typeof user != 'object'
                        console.log(1);
                else
                        console.log(2);


