'use strict'
angular.module('app.notifications', [])
# --------------------------------------------
# notification TAB of Notifications
# 1. GET Notifis
# 2. PAGING, setup paging
# 2.1 On Number Per Page Change
# 2.2 Goto PAGE
# 3. GET STAMPTIME
# 4. Create new message (Notification)
# 5. PUSH Notifi to USERs
# 6. Show Form Nofication edit
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
        $scope.clientId = $routeParams.clientId
        $scope.notifis  = []
        _URL_notifis =
            list : config.path.baseURL + config.path.clients + "/" + $scope.clientId + "/notifications"

        # 1. GET Notifis
        _getNotifis = (limit, goPage) ->
            aREST.get(_URL_notifis.list + '?limit=' + limit + '&page=' + goPage).then  (res) ->
                if typeof res.data._embedded == 'object' && res.data._embedded.items.length > 0
                    #console.log(res.data)
                    $scope.notifis = res.data
                    $scope.notifis._embedded.items =  $filter('orderBy')($scope.notifis._embedded.items, '-id', false)

                else
                    console.log 'No data'
            , (error) ->
                console.log error

        # 2. PAGING, setup paging
        $scope.numPerPageOpt = [3, 5, 10, 20]
        $scope.numPerPage    = $scope.numPerPageOpt[3]
        $scope.currentPage   = 1
        $scope.filteredUsers = []
        $scope.currentPageUsers = []

        # 2.1 On Number Per Page Change
        $scope.onNPPChange = () ->
            _getNotifis($scope.numPerPage, $scope.currentPage)

        # 2.2 Goto PAGE
        $scope.gotoPage = (page) ->
            _getNotifis($scope.numPerPage, $scope.currentPage)

        # 3. GET STAMPTIME FROM RFC 822 timetype
        $scope.getTime = (ndate) ->
            if ndate == 1
                ndate = getNOW_TimeStamp()
            dateAsDateObject = new Date(Date.parse(ndate))
            return dateAsDateObject.getTime()

        getNOW_TimeStamp = ->
            now = new Date
            now.getMonth() + 1 + '/' + now.getDate() + '/' + now.getFullYear() + ' ' + now.getHours() + ':' + (if now.getMinutes() < 10 then '0' + now.getMinutes() else now.getMinutes()) + ':' + (if now.getSeconds() < 10 then '0' + now.getSeconds() else now.getSeconds())

        # 4. Create new message (Notification)
        $scope.new_notifi = {}
        $scope.submitCreateNotifi = () ->
            newMsg = {
                "message": {
                    "subject": $scope.new_notifi.subject.trim(),
                    "body": $scope.new_notifi.body.trim()
                }
            }
            aREST.post(_URL_notifis.list, newMsg).then  (res) ->
                if typeof res == 'object' && res.status == 201
                    newMsg.message['created_at'] = 1
                    newMsg.message['isNew']      = 1
                    if $scope.notifis._embedded.items
                        $scope.notifis._embedded.items.unshift newMsg.message
                        $timeout ()->
                            $scope.notifis._embedded.items[0].isNew = 0
                        , 3000
                    else
                        location.reload()
            , (error) ->
                console.log error

        # 5. PUSH Notifi to USERs
        $scope.pushNotifi = (notifi) ->
            pushMsg = {
                "push": {
                    "current": 0
                }
            }

            re_push = (pMsg) ->
                aREST.get(notifi._links.push.href).then  (res) ->
                    if typeof res == 'object' && res.status == 200
                        pMsg.push.current = res.data.current
                        console.log pMsg.push.current
                        console.log res.data.total
                        if pMsg.push.current < res.data.total
                            pMsg.push.current = res.data.current++
                            aREST.put(notifi._links.push.href, pMsg).then  (res) ->
                                re_push(pMsg)
                            , (error) ->
                                alert(error.data.message)
                        else
                            return
                , (error) ->
                    console.log error
            re_push(pushMsg)

        # 6. Show Form Notification edit
        $scope.showNotiForm = (key) ->
            $scope.notifis._embedded.items[key]['shw_frm'] = !$scope.notifis._embedded.items[key]['shw_frm']
            return

        # 7. Update notification
        $scope.submitUpdateNotifi = (key) ->
            newMsg = {
                "message": {
                    "subject": $scope.notifis._embedded.items[key].subject.trim(),
                    "body": $scope.notifis._embedded.items[key].body.trim()
                }
            }
            #console.log(newMsg)
            aREST.put($scope.notifis._embedded.items[key]._links.self.href, newMsg).then  (res) ->
                if typeof res == 'object' && res.status == 204
                    $timeout ()->
                        window.location.reload()
                    , 500
            , (error) ->
                console.log error

        # 8 Delete notification
        $scope.deleteNotifi = (key) ->
            r = confirm("Do you want to delete this notification \"" + $scope.notifis._embedded.items[key].subject.trim() + "\"?")
            if r == true
                aREST.delete($scope.notifis._embedded.items[key]._links.self.href).then  (res) ->
                    if typeof res == 'object' && res.status == 204
                        $timeout ()->
                            window.location.reload()
                        , 500
                , (error) ->
                    console.log error

        # x. ONLOAD LIST USERS
        _getNotifis($scope.numPerPage, $scope.currentPage);
])
