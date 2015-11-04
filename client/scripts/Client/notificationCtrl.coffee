'use strict'
angular.module('app.notifications', [])
# --------------------------------------------
# notification TAB of Notifications
# 1. GET USERS (a local function)

# --------------------------------------------
.controller('notificationCtrl', [
    '$scope'
    , '$filter'
    , 'fetchTabData'
    , '$location'
    , '$routeParams'
    , 'config'
    , '$q'
    , '$modal'
    , 'aREST'
    , '$timeout',
    ($scope, $filter, fetchTabData, $location, $routeParams, config, $q, $modal, aREST, $timeout) ->
        # init Setup Var
        $scope.clientId =  $routeParams.clientId
        console.log 'notificationCtrl'


])
