'use strict'

angular.module('app.login', [])

.controller('loginCtrl', [
    '$scope', 'aREST', 'config', 'localStorageService', '$location', '$route','$rootScope'
    ($scope, aREST, config, localStorageService, $location, $route,$rootScope) ->

        $scope.username = ""
        $scope.password = ""
        
        $rootScope.isLoggedIn = false
        
        localStorageService.cookie.remove 'user'

        $scope.doLogin = ->

            # get logged_in_user link from system
            aREST.get($scope.username, $scope.password, config.path.baseURL + "/system").then  (system) ->
                if typeof system != 'object' || system.status != 200
                    return

                # get logged_in_user info
                if system.data._links.logged_in_user
                    aREST.get($scope.username, $scope.password, config.path.baseURL + system.data._links.logged_in_user.href).then  (res) ->
                        if typeof res != 'object' || res.status != 200
                            return

                        console.log res 

                        # save it to localStorage after remove all security 
                        localStorageService.cookie.set 'user'
                            ,user     : res.data
                            ,1
                        # go to home page
                        $rootScope.isLoggedIn = true;
                        $location.path '/clients'
#                        $route.reload()


                    ,(error) ->
                        alert(error.status + ': Error, refresh & try again !')

            ,(error) ->
                alert(error.status + ': Error, refresh & try again !')
            
])

.controller 'logoutCtrl', [
    '$scope', '$location', 'localStorageService', '$http','$route','$rootScope'
    ($scope, $location, localStorageService, $http,$route,$rootScope)->
        localStorageService.cookie.remove 'user'
        delete $http.defaults.headers.common['x-session']
        $rootScope.isLoggedIn = false
        $location.path '/login'
        $route.reload()
]
