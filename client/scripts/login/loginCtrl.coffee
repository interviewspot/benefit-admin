'use strict'

angular.module('app.login', [])

.controller('loginCtrl', [
    '$scope', 'aREST', 'config', 'localStorageService', '$location'
    ($scope, aREST, config, localStorageService, $location) ->

        $scope.username = ""
        $scope.password = ""

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
                        localStorageService.set 'user',
                            user     : res.data

                        # go to home page
                        $location.path '/clients'

                    ,(error) ->
                        alert(error.status + ': Error, refresh & try again !')

            ,(error) ->
                alert(error.status + ': Error, refresh & try again !')
            
])

.controller 'logoutCtrl', [
    '$scope', '$location', 'localStorageService', '$http'
    ($scope, $location, localStorageService, $http)->
        localStorageService.set 'user', null
        delete $http.defaults.headers.common['x-session']
        $location.path '/login'
]
